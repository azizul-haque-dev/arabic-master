import type { Readable } from 'node:stream';

export interface UploadOptions {
  key?: string;
  entityId: string;
  variant: string;
  extension: string;
  body: Buffer | Readable;
  mimeType: string;
  sizeBytes: number;
}

export interface UploadResult {
  objectKey: string;
  mimeType: string;
  fileSizeBytes: number;
  playbackUrl: string;
}

export interface StorageService {
  uploadAudio(options: UploadOptions): Promise<UploadResult>;
  getPlaybackUrl(objectKey: string, expiresInSeconds?: number): Promise<string>;
  deleteObject(objectKey: string): Promise<void>;
  generateObjectKey(entityId: string, variant: string, extension: string): string;
}
