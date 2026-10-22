import fs from 'node:fs';
import { Readable } from 'node:stream';
import { describe, expect, it } from 'vitest';
import {
  BadRequestError,
  PayloadTooLargeError,
  UnsupportedMediaTypeError,
} from '../errors/app-error.js';
import { env } from '../../config/env.js';
import { parseAudioUpload } from './audio-upload.js';

function createMultipartReq(
  parts: Array<{
    name: string;
    filename?: string;
    contentType?: string;
    data: Buffer | string;
  }>,
  boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW',
) {
  const chunks: Buffer[] = [];
  for (const part of parts) {
    chunks.push(Buffer.from(`--${boundary}\r\n`));
    if (part.filename !== undefined) {
      chunks.push(
        Buffer.from(
          `Content-Disposition: form-data; name="${part.name}"; filename="${part.filename}"\r\nContent-Type: ${part.contentType || 'application/octet-stream'}\r\n\r\n`,
        ),
      );
    } else {
      chunks.push(
        Buffer.from(
          `Content-Disposition: form-data; name="${part.name}"\r\n\r\n`,
        ),
      );
    }
    chunks.push(Buffer.isBuffer(part.data) ? part.data : Buffer.from(part.data));
    chunks.push(Buffer.from('\r\n'));
  }
  chunks.push(Buffer.from(`--${boundary}--\r\n`));

  const fullBuffer = Buffer.concat(chunks);
  const req = Readable.from(fullBuffer) as any;
  req.headers = {
    'content-type': `multipart/form-data; boundary=${boundary}`,
  };
  return req;
}

describe('parseAudioUpload middleware', () => {
  const validMp3Buffer = Buffer.from([
    0x49, 0x44, 0x33, 0x03, 0x00, 0x00, 0x00, 0x00, 0x00, 0x0a,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  ]);

  it('successfully parses valid MP3 file with variant and speaker fields', async () => {
    const req = createMultipartReq([
      { name: 'variant', data: 'SAUDI' },
      { name: 'speaker', data: 'Sheikh Sudais' },
      {
        name: 'audio',
        filename: 'pronunciation.mp3',
        contentType: 'audio/mpeg',
        data: validMp3Buffer,
      },
    ]);

    await new Promise<void>((resolve, reject) => {
      parseAudioUpload(req, {} as any, (err?: any) => {
        if (err) return reject(err);
        try {
          expect(req.uploadedAudio).toBeDefined();
          expect(req.uploadedAudio.variant).toBe('SAUDI');
          expect(req.uploadedAudio.speaker).toBe('Sheikh Sudais');
          expect(req.uploadedAudio.detectedFormat).toBe('mp3');
          expect(req.uploadedAudio.canonicalMime).toBe('audio/mpeg');
          expect(req.uploadedAudio.fileSizeBytes).toBe(validMp3Buffer.length);
          expect(fs.existsSync(req.uploadedAudio.tempFilePath)).toBe(true);
          // Run cleanup
          void req.uploadedAudio.cleanup().then(() => {
            expect(fs.existsSync(req.uploadedAudio.tempFilePath)).toBe(false);
            resolve();
          });
        } catch (e) {
          reject(e);
        }
      });
    });
  });

  it('rejects non-multipart Content-Type header with BadRequestError', async () => {
    const req = Readable.from(Buffer.from('{"key":"value"}')) as any;
    req.headers = { 'content-type': 'application/json' };

    await new Promise<void>((resolve, reject) => {
      parseAudioUpload(req, {} as any, (err?: any) => {
        try {
          expect(err).toBeInstanceOf(BadRequestError);
          expect(err.message).toContain('Expected multipart/form-data');
          resolve();
        } catch (e) {
          reject(e);
        }
      });
    });
  });

  it('rejects request with no file with BadRequestError', async () => {
    const req = createMultipartReq([
      { name: 'variant', data: 'DEFAULT' },
    ]);

    await new Promise<void>((resolve, reject) => {
      parseAudioUpload(req, {} as any, (err?: any) => {
        try {
          expect(err).toBeInstanceOf(BadRequestError);
          expect(err.message).toContain('No audio file was uploaded');
          resolve();
        } catch (e) {
          reject(e);
        }
      });
    });
  });

  it('rejects empty file (0 bytes) with BadRequestError', async () => {
    const req = createMultipartReq([
      {
        name: 'audio',
        filename: 'empty.mp3',
        contentType: 'audio/mpeg',
        data: Buffer.from([]),
      },
    ]);

    await new Promise<void>((resolve, reject) => {
      parseAudioUpload(req, {} as any, (err?: any) => {
        try {
          expect(err).toBeInstanceOf(BadRequestError);
          expect(err.message).toContain('empty');
          resolve();
        } catch (e) {
          reject(e);
        }
      });
    });
  });

  it('rejects oversized file with PayloadTooLargeError', async () => {
    const originalMax = env.R2_MAX_AUDIO_SIZE_BYTES;
    (env as any).R2_MAX_AUDIO_SIZE_BYTES = 10;

    try {
      const req = createMultipartReq([
        {
          name: 'audio',
          filename: 'large.mp3',
          contentType: 'audio/mpeg',
          data: Buffer.alloc(30, 0x49),
        },
      ]);

      await new Promise<void>((resolve, reject) => {
        parseAudioUpload(req, {} as any, (err?: any) => {
          try {
            expect(err).toBeInstanceOf(PayloadTooLargeError);
            resolve();
          } catch (e) {
            reject(e);
          }
        });
      });
    } finally {
      (env as any).R2_MAX_AUDIO_SIZE_BYTES = originalMax;
    }
  });

  it('rejects multiple files with BadRequestError', async () => {
    const req = createMultipartReq([
      {
        name: 'audio',
        filename: 'first.mp3',
        contentType: 'audio/mpeg',
        data: validMp3Buffer,
      },
      {
        name: 'audio',
        filename: 'second.mp3',
        contentType: 'audio/mpeg',
        data: validMp3Buffer,
      },
    ]);

    await new Promise<void>((resolve, reject) => {
      parseAudioUpload(req, {} as any, (err?: any) => {
        try {
          expect(err).toBeInstanceOf(BadRequestError);
          expect(err.message).toContain('Only a single audio file is allowed');
          resolve();
        } catch (e) {
          reject(e);
        }
      });
    });
  });

  it('rejects unexpected fields with BadRequestError', async () => {
    const req = createMultipartReq([
      { name: 'unexpectedField', data: 'malicious payload' },
      {
        name: 'audio',
        filename: 'test.mp3',
        contentType: 'audio/mpeg',
        data: validMp3Buffer,
      },
    ]);

    await new Promise<void>((resolve, reject) => {
      parseAudioUpload(req, {} as any, (err?: any) => {
        try {
          expect(err).toBeInstanceOf(BadRequestError);
          expect(err.message).toContain('Unexpected multipart field');
          resolve();
        } catch (e) {
          reject(e);
        }
      });
    });
  });

  it('rejects fake audio file (e.g. text or exe with .mp3 extension) with UnsupportedMediaTypeError', async () => {
    const req = createMultipartReq([
      {
        name: 'audio',
        filename: 'malicious.mp3',
        contentType: 'audio/mpeg',
        data: Buffer.from('MZ... not an audio file but executable'),
      },
    ]);

    await new Promise<void>((resolve, reject) => {
      parseAudioUpload(req, {} as any, (err?: any) => {
        try {
          expect(err).toBeInstanceOf(UnsupportedMediaTypeError);
          resolve();
        } catch (e) {
          reject(e);
        }
      });
    });
  });

  it('rejects MIME type mismatch with UnsupportedMediaTypeError', async () => {
    // WAV data declared as audio/mpeg
    const wavData = Buffer.from([
      0x52, 0x49, 0x46, 0x46, 0x24, 0x00, 0x00, 0x00,
      0x57, 0x41, 0x56, 0x45, 0x66, 0x6d, 0x74, 0x20,
    ]);

    const req = createMultipartReq([
      {
        name: 'audio',
        filename: 'mismatched.mp3',
        contentType: 'audio/mpeg',
        data: wavData,
      },
    ]);

    await new Promise<void>((resolve, reject) => {
      parseAudioUpload(req, {} as any, (err?: any) => {
        try {
          expect(err).toBeInstanceOf(UnsupportedMediaTypeError);
          expect(err.message).toContain('MIME type mismatch');
          resolve();
        } catch (e) {
          reject(e);
        }
      });
    });
  });
});
