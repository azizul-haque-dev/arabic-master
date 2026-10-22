import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { Readable } from 'node:stream';
import { v7 as randomUUIDv7 } from 'uuid';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ForbiddenError, NotFoundError } from '../../common/errors/app-error.js';
import { logger } from '../../common/http/logger.js';
import { r2StorageService } from '../../common/storage/r2.service.js';
import * as dbModule from '../../database/db.js';
import { ContentStatus, Role } from '../../database/drizzle/enums.js';
import type { RequestUser } from '../auth/auth.types.js';
import { ArabicEntityAudioRepository } from './arabic-entity-audio.repository.js';
import { ArabicEntityRepository } from './arabic-entity.repository.js';
import { ArabicEntityService } from './arabic-entity.service.js';
import type { UploadedAudioFile } from '../../common/middleware/audio-upload.js';

describe('ArabicEntityService', () => {
  const mockUser: RequestUser = {
    userId: 'user-cm-1',
    sessionId: 'session-1',
    jwtId: 'jwt-1',
    role: Role.CONTENT_MANAGER,
  };

  const mockAdminUser: RequestUser = {
    userId: 'user-admin-1',
    sessionId: 'session-2',
    jwtId: 'jwt-2',
    role: Role.ADMIN,
  };

  const mockEntity = {
    id: 'ae-uuid-1',
    entityKey: 'AE-1001',
    arabicText: 'كتاب',
    normalizedText: 'كتاب',
    audioUrl: null,
    pronunciationBangla: 'কিতাব',
    pronunciationEnglish: 'Kitab',
    status: ContentStatus.DRAFT,
    rejectionReason: null,
    createdById: 'user-cm-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  let mockUploadedAudio: UploadedAudioFile;
  let cleanupSpy: ReturnType<typeof vi.fn>;
  let realTempPath: string;

  beforeEach(() => {
    vi.restoreAllMocks();

    realTempPath = path.join(os.tmpdir(), `test-audio-${randomUUIDv7()}.mp3`);
    fs.writeFileSync(realTempPath, Buffer.from([0x49, 0x44, 0x33, 0x03, 0x00, 0x00]));

    cleanupSpy = vi.fn().mockImplementation(async () => {
      try {
        if (fs.existsSync(realTempPath)) fs.unlinkSync(realTempPath);
      } catch {}
    });

    mockUploadedAudio = {
      tempFilePath: realTempPath,
      fileSizeBytes: 6,
      declaredMimeType: 'audio/mpeg',
      detectedFormat: 'mp3',
      canonicalMime: 'audio/mpeg',
      extension: 'mp3',
      variant: 'DEFAULT',
      speaker: 'Sheikh Ahmad',
      cleanup: cleanupSpy as () => Promise<void>,
    };

    vi.spyOn(fs, 'createReadStream').mockImplementation(
      () => Readable.from(Buffer.from([0x49, 0x44, 0x33])) as any,
    );

    // Default mocks
    vi.spyOn(ArabicEntityRepository, 'findById').mockResolvedValue(mockEntity as any);
    vi.spyOn(ArabicEntityRepository, 'findByEntityKey').mockResolvedValue(null as any);

    vi.spyOn(r2StorageService, 'generateObjectKey').mockReturnValue(
      'arabic-entities/audio/ae-uuid-1/default-uuid.mp3',
    );
    vi.spyOn(r2StorageService, 'uploadAudio').mockResolvedValue({
      objectKey: 'arabic-entities/audio/ae-uuid-1/default-uuid.mp3',
      mimeType: 'audio/mpeg',
      fileSizeBytes: 1024,
      playbackUrl: 'https://cdn.example.com/audio.mp3',
    });
    vi.spyOn(r2StorageService, 'getPlaybackUrl').mockResolvedValue(
      'https://cdn.example.com/audio.mp3',
    );
    vi.spyOn(r2StorageService, 'deleteObject').mockResolvedValue(undefined);

    vi.spyOn(ArabicEntityAudioRepository, 'findByEntityIdAndVariant').mockResolvedValue(null as any);
    vi.spyOn(ArabicEntityAudioRepository, 'upsert').mockResolvedValue({
      id: 'audio-record-1',
      entityId: 'ae-uuid-1',
      objectKey: 'arabic-entities/audio/ae-uuid-1/default-uuid.mp3',
      mimeType: 'audio/mpeg',
      fileSizeBytes: 1024,
      variant: 'DEFAULT',
      speaker: 'Sheikh Ahmad',
      createdById: 'user-cm-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);
    vi.spyOn(ArabicEntityAudioRepository, 'updateEntityAudioUrl').mockResolvedValue(undefined);

    // Mock withTransaction to simply execute callback with dummy tx
    vi.spyOn(dbModule, 'withTransaction').mockImplementation(async (cb) => {
      return cb({} as any);
    });
  });

  afterEach(() => {
    try {
      if (fs.existsSync(realTempPath)) {
        fs.unlinkSync(realTempPath);
      }
    } catch {}
  });

  describe('uploadAudio', () => {
    it('successfully uploads audio, commits to DB, updates entity audioUrl, and cleans up temp file', async () => {
      const result = await ArabicEntityService.uploadAudio(
        'ae-uuid-1',
        mockUploadedAudio,
        mockUser,
      );

      expect(ArabicEntityRepository.findById).toHaveBeenCalledWith('ae-uuid-1');
      expect(r2StorageService.uploadAudio).toHaveBeenCalledTimes(1);
      expect(ArabicEntityAudioRepository.upsert).toHaveBeenCalledTimes(1);
      expect(ArabicEntityAudioRepository.updateEntityAudioUrl).toHaveBeenCalledWith(
        'ae-uuid-1',
        'https://cdn.example.com/audio.mp3',
        expect.anything(),
      );
      expect(cleanupSpy).toHaveBeenCalledTimes(1);

      expect(result).toMatchObject({
        id: 'audio-record-1',
        entityId: 'ae-uuid-1',
        entityKey: 'AE-1001',
        variant: 'DEFAULT',
        playbackUrl: 'https://cdn.example.com/audio.mp3',
      });
    });

    it('resolves entity by entityKey if findById returns null', async () => {
      vi.spyOn(ArabicEntityRepository, 'findById').mockResolvedValueOnce(null as any);
      vi.spyOn(ArabicEntityRepository, 'findByEntityKey').mockResolvedValueOnce(mockEntity as any);

      const result = await ArabicEntityService.uploadAudio(
        'AE-1001',
        mockUploadedAudio,
        mockUser,
      );

      expect(ArabicEntityRepository.findById).toHaveBeenCalledWith('AE-1001');
      expect(ArabicEntityRepository.findByEntityKey).toHaveBeenCalledWith('AE-1001');
      expect(result.entityKey).toBe('AE-1001');
      expect(cleanupSpy).toHaveBeenCalledTimes(1);
    });

    it('throws NotFoundError if entity does not exist and cleans up temp file', async () => {
      vi.spyOn(ArabicEntityRepository, 'findById').mockResolvedValueOnce(null as any);
      vi.spyOn(ArabicEntityRepository, 'findByEntityKey').mockResolvedValueOnce(null as any);

      await expect(
        ArabicEntityService.uploadAudio('missing-id', mockUploadedAudio, mockUser),
      ).rejects.toThrow(NotFoundError);

      expect(r2StorageService.uploadAudio).not.toHaveBeenCalled();
      expect(cleanupSpy).toHaveBeenCalledTimes(1);
    });

    it('throws ForbiddenError if Content Manager tries to edit non-editable (PUBLISHED) entity', async () => {
      const publishedEntity = { ...mockEntity, status: ContentStatus.PUBLISHED };
      vi.spyOn(ArabicEntityRepository, 'findById').mockResolvedValueOnce(publishedEntity as any);

      await expect(
        ArabicEntityService.uploadAudio('ae-uuid-1', mockUploadedAudio, mockUser),
      ).rejects.toThrow(ForbiddenError);

      expect(r2StorageService.uploadAudio).not.toHaveBeenCalled();
      expect(cleanupSpy).toHaveBeenCalledTimes(1);
    });

    it('allows Admin to upload audio to a PUBLISHED entity', async () => {
      const publishedEntity = { ...mockEntity, status: ContentStatus.PUBLISHED };
      vi.spyOn(ArabicEntityRepository, 'findById').mockResolvedValueOnce(publishedEntity as any);

      const result = await ArabicEntityService.uploadAudio(
        'ae-uuid-1',
        mockUploadedAudio,
        mockAdminUser,
      );

      expect(result.id).toBe('audio-record-1');
      expect(r2StorageService.uploadAudio).toHaveBeenCalledTimes(1);
      expect(cleanupSpy).toHaveBeenCalledTimes(1);
    });

    it('rolls back R2 upload by deleting new object if database transaction fails', async () => {
      vi.spyOn(dbModule, 'withTransaction').mockRejectedValueOnce(
        new Error('Database transaction failed constraint check'),
      );

      await expect(
        ArabicEntityService.uploadAudio('ae-uuid-1', mockUploadedAudio, mockUser),
      ).rejects.toThrow('Database transaction failed constraint check');

      // Verify rollback deletion was invoked
      expect(r2StorageService.deleteObject).toHaveBeenCalledWith(
        'arabic-entities/audio/ae-uuid-1/default-uuid.mp3',
      );
      expect(cleanupSpy).toHaveBeenCalledTimes(1);
    });

    it('logs critical structured error if rollback cleanup of new R2 object fails', async () => {
      vi.spyOn(dbModule, 'withTransaction').mockRejectedValueOnce(
        new Error('Database transaction failed'),
      );
      vi.spyOn(r2StorageService, 'deleteObject').mockRejectedValueOnce(
        new Error('R2 delete timeout'),
      );
      const loggerErrorSpy = vi.spyOn(logger, 'error');

      await expect(
        ArabicEntityService.uploadAudio('ae-uuid-1', mockUploadedAudio, mockUser),
      ).rejects.toThrow('Database transaction failed');

      expect(loggerErrorSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          entityId: 'ae-uuid-1',
          objectKey: 'arabic-entities/audio/ae-uuid-1/default-uuid.mp3',
        }),
        expect.stringContaining('Failed to clean up orphaned R2 audio object'),
      );
      expect(cleanupSpy).toHaveBeenCalledTimes(1);
    });

    it('implements safe replacement: deletes old R2 object only after DB commit succeeds', async () => {
      const existingRecord = {
        id: 'old-audio-id',
        entityId: 'ae-uuid-1',
        objectKey: 'arabic-entities/audio/ae-uuid-1/old-audio-uuid.mp3',
        variant: 'DEFAULT',
      };
      vi.spyOn(ArabicEntityAudioRepository, 'findByEntityIdAndVariant').mockResolvedValueOnce(
        existingRecord as any,
      );

      await ArabicEntityService.uploadAudio('ae-uuid-1', mockUploadedAudio, mockUser);

      // Verify the old object was deleted
      expect(r2StorageService.deleteObject).toHaveBeenCalledWith(
        'arabic-entities/audio/ae-uuid-1/old-audio-uuid.mp3',
      );
    });

    it('does NOT delete old audio object if DB transaction fails during replacement', async () => {
      const existingRecord = {
        id: 'old-audio-id',
        entityId: 'ae-uuid-1',
        objectKey: 'arabic-entities/audio/ae-uuid-1/old-audio-uuid.mp3',
        variant: 'DEFAULT',
      };
      vi.spyOn(ArabicEntityAudioRepository, 'findByEntityIdAndVariant').mockResolvedValueOnce(
        existingRecord as any,
      );
      vi.spyOn(dbModule, 'withTransaction').mockRejectedValueOnce(new Error('DB failure'));

      await expect(
        ArabicEntityService.uploadAudio('ae-uuid-1', mockUploadedAudio, mockUser),
      ).rejects.toThrow('DB failure');

      // Only the new object was deleted during rollback, NOT the old working audio!
      expect(r2StorageService.deleteObject).toHaveBeenCalledWith(
        'arabic-entities/audio/ae-uuid-1/default-uuid.mp3',
      );
      expect(r2StorageService.deleteObject).not.toHaveBeenCalledWith(
        'arabic-entities/audio/ae-uuid-1/old-audio-uuid.mp3',
      );
    });
  });

  describe('getAudio', () => {
    it('returns audio metadata with fresh playback url', async () => {
      const existing = {
        id: 'audio-1',
        entityId: 'ae-uuid-1',
        objectKey: 'arabic-entities/audio/ae-uuid-1/default.mp3',
        variant: 'DEFAULT',
        speaker: 'Qari',
        mimeType: 'audio/mpeg',
        fileSizeBytes: 2048,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      vi.spyOn(ArabicEntityAudioRepository, 'findByEntityIdAndVariant').mockResolvedValueOnce(
        existing as any,
      );

      const res = await ArabicEntityService.getAudio('ae-uuid-1', 'DEFAULT');

      expect(res.id).toBe('audio-1');
      expect(res.playbackUrl).toBe('https://cdn.example.com/audio.mp3');
    });

    it('throws NotFoundError if requested audio variant does not exist', async () => {
      vi.spyOn(ArabicEntityAudioRepository, 'findByEntityIdAndVariant').mockResolvedValueOnce(null as any);

      await expect(
        ArabicEntityService.getAudio('ae-uuid-1', 'SAUDI'),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('deleteAudio', () => {
    it('deletes audio record from DB and object from R2', async () => {
      vi.spyOn(ArabicEntityAudioRepository, 'deleteByEntityIdAndVariant').mockResolvedValueOnce({
        id: 'audio-1',
        entityId: 'ae-uuid-1',
        objectKey: 'arabic-entities/audio/ae-uuid-1/default.mp3',
        variant: 'DEFAULT',
      } as any);

      await ArabicEntityService.deleteAudio('ae-uuid-1', 'DEFAULT', mockUser);

      expect(ArabicEntityAudioRepository.deleteByEntityIdAndVariant).toHaveBeenCalledWith(
        'ae-uuid-1',
        'DEFAULT',
        expect.anything(),
      );
      expect(ArabicEntityAudioRepository.updateEntityAudioUrl).toHaveBeenCalledWith(
        'ae-uuid-1',
        null,
        expect.anything(),
      );
      expect(r2StorageService.deleteObject).toHaveBeenCalledWith(
        'arabic-entities/audio/ae-uuid-1/default.mp3',
      );
    });
  });
});
