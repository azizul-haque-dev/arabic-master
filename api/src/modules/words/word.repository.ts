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
import { escapeLike } from '../../common/utils/escape-like.util.js';
import { normalizeArabicText } from '../../common/utils/normalize-arabic.util.js';
import type { Db } from '../../database/db.js';
import type { ContentStatus } from '../../database/drizzle/enums.js';
import * as schema from '../../database/drizzle/schema.js';

export interface WordFilters {
  page: number;
  limit: number;
  category?: string;
  status?: ContentStatus;
  search?: string;
}

export type WordInsert = typeof schema.word.$inferInsert;

export function createWordRepository(db: Db) {
  const entityColumns = {
    arabicText: schema.arabicEntity.arabicText,
    audioUrl: schema.arabicEntity.audioUrl,
    normalizedText: schema.arabicEntity.normalizedText,
  };

  return {
    async list(filters: WordFilters) {
      const conditions: SQL[] = [];
      if (filters.category)
        conditions.push(eq(schema.word.category, filters.category));
      if (filters.status)
        conditions.push(eq(schema.word.status, filters.status));
      if (filters.search) {
        const search = `%${escapeLike(filters.search)}%`;
        const normalizedSearch = `%${escapeLike(normalizeArabicText(filters.search))}%`;
        conditions.push(
          or(
            ilike(schema.arabicEntity.arabicText, search),
            ilike(schema.arabicEntity.normalizedText, normalizedSearch),
            ilike(schema.word.meaningEn, search),
            ilike(schema.word.meaningBn, search),
          )!,
        );
      }

      const where = conditions.length ? and(...conditions) : undefined;
      const entityJoin = eq(schema.word.entityId, schema.arabicEntity.id);
      const [countRows, items] = await Promise.all([
        db
          .select({ total: count() })
          .from(schema.word)
          .innerJoin(schema.arabicEntity, entityJoin)
          .where(where),
        db
          .select({ ...getTableColumns(schema.word), entity: entityColumns })
          .from(schema.word)
          .innerJoin(schema.arabicEntity, entityJoin)
          .where(where)
          .orderBy(desc(schema.word.createdAt), desc(schema.word.id))
          .offset((filters.page - 1) * filters.limit)
          .limit(filters.limit),
      ]);
      return { items, total: Number(countRows[0]?.total ?? 0) };
    },

    async findDetailedById(id: string) {
      const [word] = await db
        .select({
          ...getTableColumns(schema.word),
          arabicText: schema.arabicEntity.arabicText,
          entity: entityColumns,
        })
        .from(schema.word)
        .innerJoin(
          schema.arabicEntity,
          eq(schema.word.entityId, schema.arabicEntity.id),
        )
        .where(eq(schema.word.id, id))
        .limit(1);
      return word ?? null;
    },

    async findById(id: string) {
      const [word] = await db
        .select()
        .from(schema.word)
        .where(eq(schema.word.id, id))
        .limit(1);
      return word ?? null;
    },

    async findByEntityId(entityId: string) {
      const [word] = await db
        .select()
        .from(schema.word)
        .where(eq(schema.word.entityId, entityId))
        .limit(1);
      return word ?? null;
    },

    async insert(values: WordInsert) {
      const [word] = await db.insert(schema.word).values(values).returning();
      return word;
    },

    async update(id: string, values: Partial<WordInsert>) {
      const [word] = await db
        .update(schema.word)
        .set(values)
        .where(eq(schema.word.id, id))
        .returning();
      return word;
    },

    async delete(id: string) {
      await db.delete(schema.word).where(eq(schema.word.id, id));
    },
  };
}

export type WordRepository = ReturnType<typeof createWordRepository>;
