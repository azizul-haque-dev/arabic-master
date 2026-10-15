import { eq, sql } from 'drizzle-orm';
import { v7 as randomUUIDv7 } from 'uuid';
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
    const res = await ex.execute(sql`
      SELECT MAX(CAST(SUBSTRING("entityKey" FROM 4) AS INTEGER)) as max_num 
      FROM "ArabicEntity" 
      WHERE "entityKey" ~ '^AE-[0-9]+$'
    `);
    const maxNum = (res.rows[0] as { max_num: number | null })?.max_num;
    const nextNum = maxNum && maxNum >= 1000 ? maxNum + 1 : 1001;
    return `AE-${nextNum}`;
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
            normalizedText: normalizeArabicText(d.arabicText),
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
