import {
  and,
  count,
  desc,
  eq,
  getTableColumns,
  ilike,
  or,
  type SQL,
} from 'drizzle-orm';
import { v7 as randomUUIDv7 } from 'uuid';
import { escapeLike } from '../../common/utils/escape-like.util.js';
import { normalizeArabicText } from '../../common/utils/normalize-arabic.util.js';
import type { Db, Executor } from '../../database/db.js';
import type { ContentStatus } from '../../database/drizzle/enums.js';
import * as schema from '../../database/drizzle/schema.js';

export interface SentenceFilters {
  page: number;
  limit: number;
  category?: string;
  status?: ContentStatus;
  search?: string;
}
export type SentenceInsert = typeof schema.sentence.$inferInsert;

export function createSentenceRepository(db: Db) {
  return {
    async list(f: SentenceFilters) {
      const c: SQL[] = [];
      if (f.category) c.push(eq(schema.sentence.category, f.category));
      if (f.status) c.push(eq(schema.sentence.status, f.status));
      if (f.search) {
        const p = `%${escapeLike(f.search)}%`;
        const n = `%${escapeLike(normalizeArabicText(f.search))}%`;
        c.push(
          or(
            ilike(schema.arabicEntity.arabicText, p),
            ilike(schema.arabicEntity.normalizedText, n),
            ilike(schema.sentence.meaningEn, p),
            ilike(schema.sentence.meaningBn, p),
          )!,
        );
      }
      const where = c.length ? and(...c) : undefined;
      const join = eq(schema.sentence.entityId, schema.arabicEntity.id);

      const [countRows, items] = await Promise.all([
        db
          .select({ total: count() })
          .from(schema.sentence)
          .innerJoin(schema.arabicEntity, join)
          .where(where),
        db
          .select({
            ...getTableColumns(schema.sentence),
            entity: {
              arabicText: schema.arabicEntity.arabicText,
              audioUrl: schema.arabicEntity.audioUrl,
              normalizedText: schema.arabicEntity.normalizedText,
            },
          })
          .from(schema.sentence)
          .innerJoin(schema.arabicEntity, join)
          .where(where)
          .orderBy(desc(schema.sentence.createdAt), desc(schema.sentence.id))
          .offset((f.page - 1) * f.limit)
          .limit(f.limit),
      ]);
      return { items, total: Number(countRows[0]?.total ?? 0) };
    },
    async findById(id: string, ex: Executor = db) {
      const [row] = await ex
        .select()
        .from(schema.sentence)
        .where(eq(schema.sentence.id, id))
        .limit(1);
      return row ?? null;
    },
    async findByEntityId(entityId: string) {
      const [row] = await db
        .select()
        .from(schema.sentence)
        .where(eq(schema.sentence.entityId, entityId))
        .limit(1);
      return row ?? null;
    },
    async insert(v: SentenceInsert) {
      const [row] = await db.insert(schema.sentence).values(v).returning();
      return row;
    },
    async update(id: string, v: Partial<SentenceInsert>) {
      const [row] = await db
        .update(schema.sentence)
        .set(v)
        .where(eq(schema.sentence.id, id))
        .returning();
      return row;
    },
    async delete(id: string) {
      await db.delete(schema.sentence).where(eq(schema.sentence.id, id));
    },
    async replaceWords(
      sentenceId: string,
      words: { wordId: string; position: number }[],
      ex: Executor,
    ) {
      await ex
        .delete(schema.sentenceWord)
        .where(eq(schema.sentenceWord.sentenceId, sentenceId));
      if (words.length) {
        await ex
          .insert(schema.sentenceWord)
          .values(words.map((w) => ({ id: randomUUIDv7(), sentenceId, ...w })));
      }
    },
  };
}
export type SentenceRepository = ReturnType<typeof createSentenceRepository>;
