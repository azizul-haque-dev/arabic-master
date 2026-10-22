import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v7 as randomUUIDv7 } from 'uuid';
import { env } from '../../config/env.js';
import { ServiceUnavailableError } from '../errors/app-error.js';
import { logger } from '../http/logger.js';
import type { StorageService, UploadOptions, UploadResult } from './storage.types.js';

export class R2StorageService implements StorageService {
  private s3Client: S3Client | null = null;
  private readonly bucket: string;
  private readonly prefix: string;
  private readonly publicBaseUrl?: string;
  private readonly defaultExpirySeconds: number;

  constructor(customClient?: S3Client) {
    if (customClient) {
      this.s3Client = customClient;
    }
    this.bucket = env.R2_BUCKET_NAME || '';
    this.prefix = env.R2_KEY_PREFIX || 'arabic-entities/audio/';
    this.publicBaseUrl = env.R2_PUBLIC_BASE_URL;
    this.defaultExpirySeconds = env.R2_PRESIGNED_EXPIRES_IN || 3600;
  }

  /**
   * For testing purposes, allows injecting a mock S3 client.
   */
  public setClient(client: S3Client): void {
    this.s3Client = client;
  }

  /**
   * Lazily initializes and returns the S3 client instance configured for Cloudflare R2.
   */
  public getClient(): S3Client {
    if (this.s3Client) {
      return this.s3Client;
    }

    if (
      !env.R2_ACCESS_KEY_ID ||
      !env.R2_SECRET_ACCESS_KEY ||
      env.R2_SECRET_ACCESS_KEY.includes('replace-with-your') ||
      !this.bucket
    ) {
      if (env.R2_SECRET_ACCESS_KEY?.includes('replace-with-your')) {
        logger.error(
          'R2_SECRET_ACCESS_KEY is still set to placeholder value in .env. Please update it with your actual Cloudflare R2 Secret Access Key.',
        );
      } else {
        logger.error('R2 credentials or bucket name are missing from environment configuration');
      }
      throw new ServiceUnavailableError('Object storage service is not properly configured.');
    }

    let endpoint =
      env.R2_ENDPOINT ||
      (env.R2_ACCOUNT_ID
        ? `https://${env.R2_ACCOUNT_ID.trim()}.r2.cloudflarestorage.com`
        : undefined);

    if (!endpoint) {
      logger.error('Neither R2_ENDPOINT nor R2_ACCOUNT_ID is set.');
      throw new ServiceUnavailableError('Storage endpoint is not configured.');
    }

    endpoint = endpoint.trim().replace(/\/+$/, '');
    if (!endpoint.startsWith('http://') && !endpoint.startsWith('https://')) {
      endpoint = `https://${endpoint}`;
    }

    this.s3Client = new S3Client({
      region: env.R2_REGION || 'auto',
      endpoint,
      credentials: {
        accessKeyId: env.R2_ACCESS_KEY_ID.trim(),
        secretAccessKey: env.R2_SECRET_ACCESS_KEY.trim(),
      },
      requestChecksumCalculation: 'WHEN_REQUIRED',
      responseChecksumValidation: 'WHEN_REQUIRED',
      maxAttempts: 3,
    });

    return this.s3Client;
  }

  /**
   * Generates a unique, unpredictable object key for an Arabic entity audio asset.
   * Format: <prefix><entityId>/<variant>-<uuid>.<extension>
   */
  public generateObjectKey(
    entityId: string,
    variant: string,
    extension: string,
  ): string {
    // Sanitize entityId and variant to prevent path traversal or unsafe characters
    const safeEntityId = entityId.replace(/[^a-zA-Z0-9_-]/g, '');
    const safeVariant = variant.toLowerCase().replace(/[^a-z0-9_-]/g, '');
    const safeExt = extension.toLowerCase().replace(/[^a-z0-9]/g, '');

    const normalizedPrefix = this.prefix.endsWith('/')
      ? this.prefix
      : `${this.prefix}/`;

    return `${normalizedPrefix}${safeEntityId}/${safeVariant}-${randomUUIDv7()}.${safeExt}`;
  }

  /**
   * Uploads an audio stream or buffer to Cloudflare R2 object storage.
   */
  public async uploadAudio(options: UploadOptions): Promise<UploadResult> {
    const client = this.getClient();
    const objectKey =
      options.key ??
      this.generateObjectKey(
        options.entityId,
        options.variant,
        options.extension,
      );

    try {
      // If a readable stream was passed, buffer it to prevent AWS SDK v3 from using
      // chunked trailer encoding (which causes signature mismatch in Cloudflare R2)
      let payloadBody = options.body;
      if (
        payloadBody &&
        typeof (payloadBody as NodeJS.ReadableStream).pipe === 'function'
      ) {
        const chunks: Buffer[] = [];
        for await (const chunk of payloadBody as AsyncIterable<Buffer | string>) {
          chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
        }
        payloadBody = Buffer.concat(chunks);
      }

      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: objectKey,
        Body: payloadBody,
        ContentType: options.mimeType,
        ContentLength: options.sizeBytes,
        Metadata: {
          'entity-id': options.entityId,
          variant: options.variant,
        },
      });

      await client.send(command);

      const playbackUrl = await this.getPlaybackUrl(objectKey);

      return {
        objectKey,
        mimeType: options.mimeType,
        fileSizeBytes: options.sizeBytes,
        playbackUrl,
      };
    } catch (err: unknown) {
      // Never log secret keys or full credentials in error objects
      const errorMessage = err instanceof Error ? err.message : 'Unknown storage error';
      logger.error(
        {
          bucket: this.bucket,
          objectKey,
          entityId: options.entityId,
          error: errorMessage,
        },
        'Failed to upload audio to Cloudflare R2',
      );
      throw new ServiceUnavailableError('Failed to upload audio file to storage service.');
    }
  }

  /**
   * Generates an authorized audio playback URL.
   * If R2_PUBLIC_BASE_URL is configured, returns public CDN URL.
   * Otherwise generates a short-lived presigned GET URL for private bucket access.
   */
  public async getPlaybackUrl(
    objectKey: string,
    expiresInSeconds: number = this.defaultExpirySeconds,
  ): Promise<string> {
    if (this.publicBaseUrl) {
      const base = this.publicBaseUrl.endsWith('/')
        ? this.publicBaseUrl.slice(0, -1)
        : this.publicBaseUrl;
      const key = objectKey.startsWith('/') ? objectKey.slice(1) : objectKey;
      return `${base}/${key}`;
    }

    try {
      const client = this.getClient();
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: objectKey,
      });

      return await getSignedUrl(client, command, {
        expiresIn: expiresInSeconds,
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown presign error';
      logger.error(
        {
          bucket: this.bucket,
          objectKey,
          error: errorMessage,
        },
        'Failed to generate presigned audio playback URL',
      );
      throw new ServiceUnavailableError('Unable to generate audio playback link.');
    }
  }

  /**
   * Deletes an audio object from Cloudflare R2 storage.
   */
  public async deleteObject(objectKey: string): Promise<void> {
    try {
      const client = this.getClient();
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: objectKey,
      });

      await client.send(command);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown delete error';
      logger.error(
        {
          bucket: this.bucket,
          objectKey,
          error: errorMessage,
        },
        'Failed to delete object from Cloudflare R2',
      );
      throw err;
    }
  }
}

export const r2StorageService = new R2StorageService();
