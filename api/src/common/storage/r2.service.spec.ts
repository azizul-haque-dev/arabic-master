import { describe, expect, it, vi, beforeEach } from 'vitest';
import {
  DeleteObjectCommand,
  PutObjectCommand,
  type S3Client,
} from '@aws-sdk/client-s3';
import { R2StorageService } from './r2.service.js';
import { ServiceUnavailableError } from '../errors/app-error.js';

vi.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: vi.fn().mockResolvedValue('https://mock-presigned-url.com/audio.mp3?token=signed'),
}));

describe('R2StorageService', () => {
  let mockS3Send: ReturnType<typeof vi.fn>;
  let mockS3Client: S3Client;
  let service: R2StorageService;

  beforeEach(() => {
    mockS3Send = vi.fn().mockResolvedValue({});
    mockS3Client = {
      send: mockS3Send,
    } as unknown as S3Client;

    service = new R2StorageService(mockS3Client);
  });

  describe('generateObjectKey', () => {
    it('generates an unpredictable key with safe characters and uuid', () => {
      const key1 = service.generateObjectKey('ent-123', 'DEFAULT', 'mp3');
      const key2 = service.generateObjectKey('ent-123', 'DEFAULT', 'mp3');

      expect(key1).toContain('ent-123/default-');
      expect(key1).toMatch(/\.mp3$/);
      expect(key2).toContain('ent-123/default-');
      // Should be unique
      expect(key1).not.toBe(key2);
    });

    it('sanitizes unsafe characters in entityId and variant', () => {
      const key = service.generateObjectKey('../../../etc/passwd', 'variant/hack', '.mp3');
      expect(key).not.toContain('..');
      expect(key).not.toContain('/hack');
      expect(key).toContain('etcpasswd/varianthack-');
    });
  });

  describe('uploadAudio', () => {
    it('uploads audio using PutObjectCommand and returns objectKey and playbackUrl', async () => {
      const result = await service.uploadAudio({
        entityId: 'entity-1',
        variant: 'DEFAULT',
        extension: 'mp3',
        body: Buffer.from([0x49, 0x44, 0x33, 0x00]),
        mimeType: 'audio/mpeg',
        sizeBytes: 4,
      });

      expect(mockS3Send).toHaveBeenCalledTimes(1);
      const commandArg = mockS3Send.mock.calls[0][0];
      expect(commandArg).toBeInstanceOf(PutObjectCommand);
      expect(commandArg.input.ContentType).toBe('audio/mpeg');
      expect(commandArg.input.ContentLength).toBe(4);
      expect(commandArg.input.Metadata).toEqual({
        'entity-id': 'entity-1',
        variant: 'DEFAULT',
      });

      expect(result.objectKey).toContain('entity-1/default-');
      expect(result.mimeType).toBe('audio/mpeg');
      expect(result.fileSizeBytes).toBe(4);
      expect(result.playbackUrl).toBe('https://mock-presigned-url.com/audio.mp3?token=signed');
    });

    it('throws ServiceUnavailableError if S3 upload fails', async () => {
      mockS3Send.mockRejectedValueOnce(new Error('S3 connection reset'));

      await expect(
        service.uploadAudio({
          entityId: 'entity-1',
          variant: 'DEFAULT',
          extension: 'mp3',
          body: Buffer.from([0x49, 0x44, 0x33, 0x00]),
          mimeType: 'audio/mpeg',
          sizeBytes: 4,
        }),
      ).rejects.toThrow(ServiceUnavailableError);
    });
  });

  describe('getPlaybackUrl', () => {
    it('generates presigned url when public base url is not set', async () => {
      const url = await service.getPlaybackUrl('arabic-entities/audio/1/default.mp3', 1800);
      expect(url).toBe('https://mock-presigned-url.com/audio.mp3?token=signed');
    });
  });

  describe('deleteObject', () => {
    it('sends DeleteObjectCommand with bucket and key', async () => {
      await service.deleteObject('arabic-entities/audio/1/default.mp3');

      expect(mockS3Send).toHaveBeenCalledTimes(1);
      const commandArg = mockS3Send.mock.calls[0][0];
      expect(commandArg).toBeInstanceOf(DeleteObjectCommand);
      expect(commandArg.input.Key).toBe('arabic-entities/audio/1/default.mp3');
    });

    it('re-throws error when delete fails', async () => {
      mockS3Send.mockRejectedValueOnce(new Error('S3 Access Denied'));

      await expect(
        service.deleteObject('arabic-entities/audio/1/default.mp3'),
      ).rejects.toThrow('S3 Access Denied');
    });
  });
});
