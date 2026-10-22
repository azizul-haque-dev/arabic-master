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
import { generateNextSequentialKey } from '../../common/utils/key-generator.util.js';
import { db, type Db, type Executor } from '../../database/db.js';
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

const entityColumns = {
  entityKey: schema.arabicEntity.entityKey,
  arabicText: schema.arabicEntity.arabicText,
  audioUrl: schema.arabicEntity.audioUrl,
  normalizedText: schema.arabicEntity.normalizedText,
};

export const WordRepository = {
  async list(filters: WordFilters, ex: Executor = db) {
    const conditions: SQL[] = [];
    if (filters.category)
      conditions.push(eq(schema.word.category, filters.category));
    if (filters.status) conditions.push(eq(schema.word.status, filters.status));
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
      ex
        .select({ total: count() })
        .from(schema.word)
        .innerJoin(schema.arabicEntity, entityJoin)
        .where(where),
      ex
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

  async findDetailedById(id: string, ex: Executor = db) {
    const [word] = await ex
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

  async findById(id: string, ex: Executor = db) {
    const [word] = await ex
      .select()
      .from(schema.word)
      .where(eq(schema.word.id, id))
      .limit(1);
    return word ?? null;
  },

  async findByEntityId(entityId: string, ex: Executor = db) {
    const [word] = await ex
      .select()
      .from(schema.word)
      .where(eq(schema.word.entityId, entityId))
      .limit(1);
    return word ?? null;
  },

  async generateNextWordKey(
    exOrOffset: Executor | number = db,
    maybeOffset = 0,
  ): Promise<string> {
    const ex = typeof exOrOffset === 'number' ? db : exOrOffset;
    const offset = typeof exOrOffset === 'number' ? exOrOffset : maybeOffset;
    return generateNextSequentialKey('Word', 'wordKey', 'W-', 2000, ex, offset);
  },

  async insert(values: WordInsert, ex: Executor = db) {
    const [word] = await ex.insert(schema.word).values(values).returning();
    return word;
  },

  async update(id: string, values: Partial<WordInsert>, ex: Executor = db) {
    const [word] = await ex
      .update(schema.word)
      .set(values)
      .where(eq(schema.word.id, id))
      .returning();
    return word;
  },

  async delete(id: string, ex: Executor = db) {
    await ex.delete(schema.word).where(eq(schema.word.id, id));
  },
};

export type WordRepository = typeof WordRepository;
