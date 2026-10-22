import busboy from 'busboy';
import type { Request, RequestHandler } from 'express';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { v7 as randomUUIDv7 } from 'uuid';
import { env } from '../../config/env.js';
import {
  BadRequestError,
  PayloadTooLargeError,
} from '../errors/app-error.js';
import {
  validateAudioContent,
  type SupportedAudioFormat,
} from '../utils/audio-validator.util.js';

export interface UploadedAudioFile {
  tempFilePath: string;
  fileSizeBytes: number;
  declaredMimeType: string;
  detectedFormat: SupportedAudioFormat;
  canonicalMime: string;
  extension: string;
  variant: string;
  speaker?: string;
  cleanup: () => Promise<void>;
}

export const parseAudioUpload: RequestHandler = (req: Request, _res, next) => {
  const contentType = req.headers['content-type'] ?? '';
  if (!contentType.includes('multipart/form-data')) {
    return next(
      new BadRequestError(
        'Invalid Content-Type header. Expected multipart/form-data with an audio file.',
      ),
    );
  }

  const maxSizeBytes = env.R2_MAX_AUDIO_SIZE_BYTES;
  let bb: busboy.Busboy;

  try {
    bb = busboy({
      headers: req.headers,
      limits: {
        fileSize: maxSizeBytes,
        fields: 5,
      },
    });
  } catch {
    return next(new BadRequestError('Malformed multipart form-data payload.'));
  }

  bb.on('filesLimit', () => {
    void handleError(
      new BadRequestError('Only a single audio file is allowed per upload.'),
    );
  });

  let tempFilePath: string | null = null;
  let writeStream: fs.WriteStream | null = null;
  let fileCount = 0;
  let isTruncated = false;
  let totalBytes = 0;
  let declaredMimeType = '';
  let variant = 'DEFAULT';
  let speaker: string | undefined;
  const headerChunks: Buffer[] = [];
  let headerBytesCollected = 0;
  const maxHeaderBytes = 4096;
  let hasHandledError = false;

  const cleanupTempFile = async () => {
    if (tempFilePath) {
      try {
        if (writeStream && !writeStream.destroyed) {
          writeStream.destroy();
        }
        await fs.promises.unlink(tempFilePath);
      } catch {
        // Ignore unlink error if file doesn't exist
      }
      tempFilePath = null;
    }
  };

  const handleError = async (err: Error) => {
    if (hasHandledError) return;
    hasHandledError = true;
    await cleanupTempFile();
    next(err);
  };

  req.on('aborted', () => {
    cleanupTempFile().catch(() => {});
  });

  bb.on('field', (name, val) => {
    if (hasHandledError) return;

    if (name === 'variant') {
      const trimmed = val.trim().toUpperCase();
      if (!/^[A-Z0-9_-]{1,32}$/.test(trimmed)) {
        void handleError(
          new BadRequestError(
            'Variant parameter must be 1-32 alphanumeric characters, hyphens, or underscores.',
          ),
        );
        return;
      }
      variant = trimmed;
    } else if (name === 'speaker') {
      const trimmed = val.trim();
      if (trimmed.length > 64) {
        void handleError(
          new BadRequestError('Speaker parameter cannot exceed 64 characters.'),
        );
        return;
      }
      speaker = trimmed;
    } else {
      void handleError(
        new BadRequestError(
          `Unexpected multipart field: "${name}". Allowed fields are "variant" and "speaker".`,
        ),
      );
    }
  });

  bb.on('file', (fieldname, fileStream, info) => {
    if (hasHandledError) {
      fileStream.resume();
      return;
    }

    fileCount++;
    if (fileCount > 1) {
      fileStream.resume();
      void handleError(
        new BadRequestError('Only a single audio file is allowed per upload.'),
      );
      return;
    }

    if (fieldname !== 'audio' && fieldname !== 'file') {
      fileStream.resume();
      void handleError(
        new BadRequestError(
          `Unexpected file field: "${fieldname}". The audio file must be uploaded under the field name "audio" or "file".`,
        ),
      );
      return;
    }

    declaredMimeType = info.mimeType;
    tempFilePath = path.join(
      os.tmpdir(),
      `arabic-audio-${randomUUIDv7()}.tmp`,
    );

    writeStream = fs.createWriteStream(tempFilePath);

    fileStream.on('data', (chunk: Buffer) => {
      totalBytes += chunk.length;
      if (headerBytesCollected < maxHeaderBytes) {
        const remaining = maxHeaderBytes - headerBytesCollected;
        const slice = chunk.subarray(0, remaining);
        headerChunks.push(slice);
        headerBytesCollected += slice.length;
      }
    });

    fileStream.on('limit', () => {
      isTruncated = true;
    });

    fileStream.on('error', (err) => {
      void handleError(err);
    });

    writeStream.on('error', (err) => {
      void handleError(err);
    });

    fileStream.pipe(writeStream);
  });

  bb.on('error', (err: Error) => {
    void handleError(new BadRequestError(`Malformed multipart stream: ${err.message}`));
  });

  bb.on('close', async () => {
    if (hasHandledError) return;

    if (fileCount === 0 || !tempFilePath) {
      return handleError(new BadRequestError('No audio file was uploaded in the request.'));
    }

    if (isTruncated) {
      const limitMb = Math.round(maxSizeBytes / (1024 * 1024));
      return handleError(
        new PayloadTooLargeError(`Audio file exceeds the maximum permitted size of ${limitMb}MB.`),
      );
    }

    if (totalBytes === 0) {
      return handleError(new BadRequestError('Uploaded audio file is empty (0 bytes).'));
    }

    const headerBuffer = Buffer.concat(headerChunks);

    try {
      const validation = validateAudioContent(headerBuffer, declaredMimeType);

      req.uploadedAudio = {
        tempFilePath,
        fileSizeBytes: totalBytes,
        declaredMimeType,
        detectedFormat: validation.format,
        canonicalMime: validation.canonicalMime,
        extension: validation.extension,
        variant,
        speaker,
        cleanup: cleanupTempFile,
      };

      next();
    } catch (err: unknown) {
      await cleanupTempFile();
      next(err);
    }
  });

  req.pipe(bb);
};
