import { eq } from 'drizzle-orm';
import { v7 as randomUUIDv7 } from 'uuid';
import { normalizeArabicText } from '../../common/utils/normalize-arabic.util.js';
import type { Db } from '../../database/db.js';
import * as schema from '../../database/drizzle/schema.js';

export function createArabicEntityRepository(db: Db) {
  return {
    /** normalizedText আগে থেকেই normalize করা হতে হবে */
    async findByNormalizedText(normalizedText: string) {
      const [row] = await db
        .select()
        .from(schema.arabicEntity)
        .where(eq(schema.arabicEntity.normalizedText, normalizedText))
        .limit(1);
      return row ?? null;
    },
    async findById(id: string) {
      const [row] = await db
        .select()
        .from(schema.arabicEntity)
        .where(eq(schema.arabicEntity.id, id))
        .limit(1);
      return row ?? null;
    },
    async create(d: {
      arabicText: string;
      audioUrl?: string;
      createdById?: string;
      pronunciationBangla?: string;
      pronunciationEnglish?: string;
    }) {
      const [row] = await db
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
    ) {
      await db
        .update(schema.arabicEntity)
        .set({ ...d, updatedAt: new Date() })
        .where(eq(schema.arabicEntity.id, id));
    },
  };
}
export type ArabicEntityRepository = ReturnType<
  typeof createArabicEntityRepository
>;
