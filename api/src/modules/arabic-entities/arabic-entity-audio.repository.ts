import { and, eq } from 'drizzle-orm';
import { v7 as randomUUIDv7 } from 'uuid';
import { db, type Executor } from '../../database/db.js';
import * as schema from '../../database/drizzle/schema.js';

export interface InsertAudioParams {
  entityId: string;
  objectKey: string;
  mimeType: string;
  fileSizeBytes: number;
  variant: string;
  speaker?: string;
  createdById?: string;
}

export const ArabicEntityAudioRepository = {
  async findByEntityIdAndVariant(
    entityId: string,
    variant: string,
    ex: Executor = db,
  ) {
    const [row] = await ex
      .select()
      .from(schema.arabicEntityAudio)
      .where(
        and(
          eq(schema.arabicEntityAudio.entityId, entityId),
          eq(schema.arabicEntityAudio.variant, variant),
        ),
      )
      .limit(1);
    return row ?? null;
  },

  async findAllByEntityId(entityId: string, ex: Executor = db) {
    return ex
      .select()
      .from(schema.arabicEntityAudio)
      .where(eq(schema.arabicEntityAudio.entityId, entityId));
  },

  async findById(id: string, ex: Executor = db) {
    const [row] = await ex
      .select()
      .from(schema.arabicEntityAudio)
      .where(eq(schema.arabicEntityAudio.id, id))
      .limit(1);
    return row ?? null;
  },

  async findByObjectKey(objectKey: string, ex: Executor = db) {
    const [row] = await ex
      .select()
      .from(schema.arabicEntityAudio)
      .where(eq(schema.arabicEntityAudio.objectKey, objectKey))
      .limit(1);
    return row ?? null;
  },

  async upsert(params: InsertAudioParams, ex: Executor = db) {
    const now = new Date();
    const [record] = await ex
      .insert(schema.arabicEntityAudio)
      .values({
        id: randomUUIDv7(),
        entityId: params.entityId,
        objectKey: params.objectKey,
        mimeType: params.mimeType,
        fileSizeBytes: params.fileSizeBytes,
        variant: params.variant,
        speaker: params.speaker,
        createdById: params.createdById,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: [
          schema.arabicEntityAudio.entityId,
          schema.arabicEntityAudio.variant,
        ],
        set: {
          objectKey: params.objectKey,
          mimeType: params.mimeType,
          fileSizeBytes: params.fileSizeBytes,
          speaker: params.speaker,
          createdById: params.createdById,
          updatedAt: now,
        },
      })
      .returning();

    return record;
  },

  async deleteByEntityIdAndVariant(
    entityId: string,
    variant: string,
    ex: Executor = db,
  ) {
    const [deleted] = await ex
      .delete(schema.arabicEntityAudio)
      .where(
        and(
          eq(schema.arabicEntityAudio.entityId, entityId),
          eq(schema.arabicEntityAudio.variant, variant),
        ),
      )
      .returning();

    return deleted ?? null;
  },

  async updateEntityAudioUrl(
    entityId: string,
    audioUrl: string | null,
    ex: Executor = db,
  ) {
    await ex
      .update(schema.arabicEntity)
      .set({
        audioUrl,
        updatedAt: new Date(),
      })
      .where(eq(schema.arabicEntity.id, entityId));
  },
};

export type ArabicEntityAudioRepository = typeof ArabicEntityAudioRepository;
