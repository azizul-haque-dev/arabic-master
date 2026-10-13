import { and, count, desc, eq, getTableColumns, ilike, or, type SQL } from 'drizzle-orm';
import { escapeLike } from '../../common/utils/escape-like.util.js';
import { normalizeArabicText } from '../../common/utils/normalize-arabic.util.js';
import type { Db } from '../../database/db.js';
import type { ContentStatus } from '../../database/drizzle/enums.js';
import * as schema from '../../database/drizzle/schema.js';

export interface WordFilters { page: number; limit: number; category?: string; status?: ContentStatus; search?: string }
export type WordInsert = typeof schema.word.$inferInsert;

export function createWordRepository(db: Db) {
  const entityCols = {
    arabicText: schema.arabicEntity.arabicText,
    audioUrl: schema.arabicEntity.audioUrl,
    normalizedText: schema.arabicEntity.normalizedText,
  };

  return {
    async list(f: WordFilters) {
      const c: SQL[] = [];
      if (f.category) c.push(eq(schema.word.category, f.category));
      if (f.status) c.push(eq(schema.word.status, f.status));
      if (f.search) {
        const p = `%${escapeLike(f.search)}%`;
        const n = `%${escapeLike(normalizeArabicText(f.search))}%`;
        c.push(or(
          ilike(schema.arabicEntity.arabicText, p), ilike(schema.arabicEntity.normalizedText, n),
          ilike(schema.word.meaningEn, p), ilike(schema.word.meaningBn, p),
        )!);
      }
      const where = c.length ? and(...c) : undefined;
      const join = eq(schema.word.entityId, schema.arabicEntity.id);

      const [countRows, items] = await Promise.all([
        db.select({ total: count() }).from(schema.word).innerJoin(schema.arabicEntity, join).where(where),
        db.select({ ...getTableColumns(schema.word), entity: entityCols })
          .from(schema.word).innerJoin(schema.arabicEntity, join).where(where)
          .orderBy(desc(schema.word.createdAt), desc(schema.word.id))
          .offset((f.page - 1) * f.limit).limit(f.limit),
      ]);
      return { items, total: Number(countRows[0]?.total ?? 0) };
    },
    async findDetailedById(id: string) {
      const [row] = await db
        .select({ ...getTableColumns(schema.word), arabicText: schema.arabicEntity.arabicText, entity: entityCols })
        .from(schema.word).innerJoin(schema.arabicEntity, eq(schema.word.entityId, schema.arabicEntity.id))
        .where(eq(schema.word.id, id)).limit(1);
      return row ?? null;
    },
    async findById(id: string) {
      const [row] = await db.select().from(schema.word).where(eq(schema.word.id, id)).limit(1);
      return row ?? null;
    },
    async findByEntityId(entityId: string) {
      const [row] = await db.select().from(schema.word).where(eq(schema.word.entityId, entityId)).limit(1);
      return row ?? null;
    },
    async insert(v: WordInsert) {
      const [row] = await db.insert(schema.word).values(v).returning();
      return row;
    },
    async update(id: string, v: Partial<WordInsert>) {
      const [row] = await db.update(schema.word).set(v).where(eq(schema.word.id, id)).returning();
      return row;
    },
    async delete(id: string) {
      await db.delete(schema.word).where(eq(schema.word.id, id));
    },
  };
}
export type WordRepository = ReturnType<typeof createWordRepository>;
