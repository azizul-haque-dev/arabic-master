import fs from 'node:fs';
import { assertEditable } from '../../common/utils/content-workflow.util.js';
import { NotFoundError } from '../../common/errors/app-error.js';
import { logger } from '../../common/http/logger.js';
import { r2StorageService } from '../../common/storage/r2.service.js';
import { withTransaction } from '../../database/db.js';
import type { RequestUser } from '../auth/auth.types.js';
import { ArabicEntityAudioRepository } from './arabic-entity-audio.repository.js';
import * as schema from '../../database/drizzle/schema.js';
import { ArabicEntityRepository } from './arabic-entity.repository.js';
import type { UploadedAudioFile } from '../../common/middleware/audio-upload.js';

export interface AudioResourceResponse {
  id: string;
  entityId: string;
  entityKey: string;
  variant: string;
  speaker: string | null;
  mimeType: string;
  fileSizeBytes: number;
  objectKey: string;
  playbackUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

export const ArabicEntityService = {
  /**
   * Resolves an ArabicEntity by either internal ID or entityKey (e.g. "AE-1024").
   */
  async resolveEntity(idOrKey: string) {
    let entity = await ArabicEntityRepository.findById(idOrKey);
    if (!entity) {
      entity = await ArabicEntityRepository.findByEntityKey(idOrKey);
    }
    if (!entity) {
      throw new NotFoundError('Arabic entity not found');
    }
    return entity;
  },

  /**
   * Uploads and associates an audio file with the specified Arabic entity.
   * Handles storage upload, database persistence, and rollback on failure.
   */
  async uploadAudio(
    idOrKey: string,
    uploadedAudio: UploadedAudioFile,
    user: RequestUser,
  ): Promise<AudioResourceResponse> {
    try {
      const entity = await this.resolveEntity(idOrKey);

      // Verify role-based permissions and workflow state (e.g. Content Manager only in DRAFT/REJECTED)
      assertEditable(entity.status, user.role);

      const variant = uploadedAudio.variant || 'DEFAULT';

      // Check for an existing audio record for this variant
      const existingAudio =
        await ArabicEntityAudioRepository.findByEntityIdAndVariant(
          entity.id,
          variant,
        );

      const newObjectKey = r2StorageService.generateObjectKey(
        entity.id,
        variant,
        uploadedAudio.extension,
      );

      // 1. Upload to Cloudflare R2
      const fileStream = fs.createReadStream(uploadedAudio.tempFilePath);
      fileStream.on('error', (err) => {
        logger.debug({ err }, 'Audio upload file stream event handled');
      });

      const uploadResult = await r2StorageService.uploadAudio({
        key: newObjectKey,
        entityId: entity.id,
        variant,
        extension: uploadedAudio.extension,
        body: fileStream,
        mimeType: uploadedAudio.canonicalMime,
        sizeBytes: uploadedAudio.fileSizeBytes,
      });

      // 2. Persist metadata in database with safe replacement
      let savedRecord: typeof schema.arabicEntityAudio.$inferSelect;

      try {
        savedRecord = await withTransaction(async (tx) => {
          const record = await ArabicEntityAudioRepository.upsert(
            {
              entityId: entity.id,
              objectKey: newObjectKey,
              mimeType: uploadedAudio.canonicalMime,
              fileSizeBytes: uploadedAudio.fileSizeBytes,
              variant,
              speaker: uploadedAudio.speaker,
              createdById: user.userId,
            },
            tx,
          );

          // If updating DEFAULT variant, synchronize arabicEntity.audioUrl for backward compatibility
          if (variant === 'DEFAULT') {
            await ArabicEntityAudioRepository.updateEntityAudioUrl(
              entity.id,
              uploadResult.playbackUrl,
              tx,
            );
          }

          return record;
        });
      } catch (dbErr: unknown) {
        // Database operation failed after successful R2 upload. Revert newly uploaded object from R2.
        logger.error(
          {
            err: dbErr,
            entityId: entity.id,
            objectKey: newObjectKey,
          },
          'Database error after R2 audio upload. Initiating storage rollback cleanup.',
        );

        try {
          await r2StorageService.deleteObject(newObjectKey);
        } catch (cleanupErr: unknown) {
          logger.error(
            {
              err: cleanupErr,
              entityId: entity.id,
              objectKey: newObjectKey,
            },
            'CRITICAL: Failed to clean up orphaned R2 audio object after database transaction failure.',
          );
        }

        throw dbErr;
      }

      // 3. After database commit succeeded, safely clean up old audio object if replacing
      if (existingAudio && existingAudio.objectKey !== newObjectKey) {
        try {
          await r2StorageService.deleteObject(existingAudio.objectKey);
        } catch (oldDeleteErr: unknown) {
          logger.warn(
            {
              err: oldDeleteErr,
              entityId: entity.id,
              oldObjectKey: existingAudio.objectKey,
            },
            'Failed to delete superseded audio object from Cloudflare R2.',
          );
        }
      }

      return {
        id: savedRecord.id,
        entityId: entity.id,
        entityKey: entity.entityKey,
        variant: savedRecord.variant,
        speaker: savedRecord.speaker,
        mimeType: savedRecord.mimeType,
        fileSizeBytes: savedRecord.fileSizeBytes,
        objectKey: savedRecord.objectKey,
        playbackUrl: uploadResult.playbackUrl,
        createdAt: savedRecord.createdAt,
        updatedAt: savedRecord.updatedAt,
      };
    } finally {
      await uploadedAudio.cleanup();
    }
  },

  /**
   * Retrieves audio metadata and a fresh playback URL for the given entity and variant.
   */
  async getAudio(
    idOrKey: string,
    variant: string = 'DEFAULT',
  ): Promise<AudioResourceResponse> {
    const entity = await this.resolveEntity(idOrKey);
    const audio = await ArabicEntityAudioRepository.findByEntityIdAndVariant(
      entity.id,
      variant,
    );

    if (!audio) {
      throw new NotFoundError(
        `Audio record for variant "${variant}" not found on this Arabic entity.`,
      );
    }

    const playbackUrl = await r2StorageService.getPlaybackUrl(audio.objectKey);

    return {
      id: audio.id,
      entityId: entity.id,
      entityKey: entity.entityKey,
      variant: audio.variant,
      speaker: audio.speaker,
      mimeType: audio.mimeType,
      fileSizeBytes: audio.fileSizeBytes,
      objectKey: audio.objectKey,
      playbackUrl,
      createdAt: audio.createdAt,
      updatedAt: audio.updatedAt,
    };
  },

  /**
   * Retrieves all audio variants for an Arabic entity.
   */
  async listAudios(idOrKey: string): Promise<AudioResourceResponse[]> {
    const entity = await this.resolveEntity(idOrKey);
    const audios = await ArabicEntityAudioRepository.findAllByEntityId(entity.id);

    return Promise.all(
      audios.map(async (audio) => ({
        id: audio.id,
        entityId: entity.id,
        entityKey: entity.entityKey,
        variant: audio.variant,
        speaker: audio.speaker,
        mimeType: audio.mimeType,
        fileSizeBytes: audio.fileSizeBytes,
        objectKey: audio.objectKey,
        playbackUrl: await r2StorageService.getPlaybackUrl(audio.objectKey),
        createdAt: audio.createdAt,
        updatedAt: audio.updatedAt,
      })),
    );
  },

  /**
   * Deletes an audio variant for an Arabic entity.
   */
  async deleteAudio(
    idOrKey: string,
    variant: string = 'DEFAULT',
    user: RequestUser,
  ): Promise<void> {
    const entity = await this.resolveEntity(idOrKey);
    assertEditable(entity.status, user.role);

    const deleted = await withTransaction(async (tx) => {
      const record =
        await ArabicEntityAudioRepository.deleteByEntityIdAndVariant(
          entity.id,
          variant,
          tx,
        );

      if (record && variant === 'DEFAULT') {
        await ArabicEntityAudioRepository.updateEntityAudioUrl(
          entity.id,
          null,
          tx,
        );
      }

      return record;
    });

    if (!deleted) {
      throw new NotFoundError(
        `Audio record for variant "${variant}" not found on this Arabic entity.`,
      );
    }

    try {
      await r2StorageService.deleteObject(deleted.objectKey);
    } catch (err: unknown) {
      logger.warn(
        {
          err,
          entityId: entity.id,
          objectKey: deleted.objectKey,
        },
        'Audio record was deleted from database, but object deletion from R2 failed.',
      );
    }
  },
};

export type ArabicEntityService = typeof ArabicEntityService;
