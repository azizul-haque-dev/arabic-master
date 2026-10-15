import { eq } from 'drizzle-orm';
import { v7 as randomUUIDv7 } from 'uuid';
import { ConflictError } from '../../common/errors/app-error.js';
import { generateNextSequentialKey } from '../../common/utils/key-generator.util.js';
import { normalizeArabicText } from '../../common/utils/normalize-arabic.util.js';
import { db, type Executor } from '../../database/db.js';
import * as schema from '../../database/drizzle/schema.js';

export const ArabicEntityRepository = {
  /** normalizedText আগে থেকেই normalize করা হতে হবে */
  async findByNormalizedText(normalizedText: string, ex: Executor = db) {
    const [row] = await ex
      .select()
      .from(schema.arabicEntity)
      .where(eq(schema.arabicEntity.normalizedText, normalizedText))
      .limit(1);
    return row ?? null;
  },
  async findById(id: string, ex: Executor = db) {
    const [row] = await ex
      .select()
      .from(schema.arabicEntity)
      .where(eq(schema.arabicEntity.id, id))
      .limit(1);
    return row ?? null;
  },
  async findByEntityKey(entityKey: string, ex: Executor = db) {
    const [row] = await ex
      .select()
      .from(schema.arabicEntity)
      .where(eq(schema.arabicEntity.entityKey, entityKey))
      .limit(1);
    return row ?? null;
  },
  async generateNextEntityKey(ex: Executor = db): Promise<string> {
    return generateNextSequentialKey('ArabicEntity', 'entityKey', 'AE-', 1000, ex);
  },
  async create(
    d: {
      entityKey?: string;
      arabicText: string;
      audioUrl?: string;
      createdById?: string;
      pronunciationBangla?: string;
      pronunciationEnglish?: string;
      status?: (typeof schema.arabicEntity.$inferSelect)['status'];
      rejectionReason?: string;
    },
    ex: Executor = db,
  ) {
    const normalizedText = normalizeArabicText(d.arabicText);
    const existing = await this.findByNormalizedText(normalizedText, ex);
    if (existing) {
      throw new ConflictError(
        `Arabic entity with normalized text "${normalizedText}" already exists (entityKey: ${existing.entityKey})`,
      );
    }

    let attempts = 0;
    while (attempts < 5) {
      try {
        const entityKey = d.entityKey ?? (await this.generateNextEntityKey(ex));
        const [row] = await ex
          .insert(schema.arabicEntity)
          .values({
            id: randomUUIDv7(),
            entityKey,
            arabicText: d.arabicText,
            normalizedText,
            audioUrl: d.audioUrl,
            pronunciationBangla: d.pronunciationBangla ?? '',
            pronunciationEnglish: d.pronunciationEnglish ?? '',
            status: d.status ?? 'DRAFT',
            rejectionReason: d.rejectionReason,
            createdById: d.createdById,
          })
          .returning();
        return row;
      } catch (err: unknown) {
        const pgErr = err as { code?: string; constraint?: string };
        if (!d.entityKey && pgErr?.code === '23505' && pgErr?.constraint?.includes('entityKey')) {
          attempts++;
          continue;
        }
        if (pgErr?.code === '23505' && pgErr?.constraint?.includes('normalizedText')) {
          throw new ConflictError(
            `Arabic entity with normalized text "${normalizedText}" already exists`,
          );
        }
        throw err;
      }
    }
    throw new Error('Failed to generate unique entityKey after 5 attempts');
  },
  async updatePronunciation(
    id: string,
    d: { pronunciationBangla: string; pronunciationEnglish: string },
    ex: Executor = db,
  ) {
    await ex
      .update(schema.arabicEntity)
      .set({ ...d, updatedAt: new Date() })
      .where(eq(schema.arabicEntity.id, id));
  },
};

export type ArabicEntityRepository = typeof ArabicEntityRepository;
