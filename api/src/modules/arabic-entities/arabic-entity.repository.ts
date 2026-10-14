import { eq } from 'drizzle-orm';
import { v7 as randomUUIDv7 } from 'uuid';
import { normalizeArabicText } from '../../common/utils/normalize-arabic.util.js';
import { db, type Db, type Executor } from '../../database/db.js';
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
  async create(
    d: {
      arabicText: string;
      audioUrl?: string;
      createdById?: string;
      pronunciationBangla?: string;
      pronunciationEnglish?: string;
    },
    ex: Executor = db,
  ) {
    const [row] = await ex
      .insert(schema.arabicEntity)
      .values({
        id: randomUUIDv7(),
        entityKey: `entity_${randomUUIDv7()}`,
        arabicText: d.arabicText,
        normalizedText: normalizeArabicText(d.arabicText),
        audioUrl: d.audioUrl,
        pronunciationBangla: d.pronunciationBangla ?? '',
        pronunciationEnglish: d.pronunciationEnglish ?? '',
        createdById: d.createdById,
      })
      .returning();
    return row;
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

export function createArabicEntityRepository(_db: Db = db) {
  return ArabicEntityRepository;
}
