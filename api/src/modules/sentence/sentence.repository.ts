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
import { generateNextSequentialKey } from '../../common/utils/key-generator.util.js';
import { db, type Executor } from '../../database/db.js';
import type {
  ContentStatus,
  SentenceType,
} from '../../database/drizzle/enums.js';
import * as schema from '../../database/drizzle/schema.js';

export interface SentenceFilters {
  page: number;
  limit: number;
  category?: string;
  status?: ContentStatus;
  sentenceType?: SentenceType;
  search?: string;
}

export type SentenceInsert = typeof schema.sentence.$inferInsert;

const entityColumns = {
  entityKey: schema.arabicEntity.entityKey,
  arabicText: schema.arabicEntity.arabicText,
  audioUrl: schema.arabicEntity.audioUrl,
  normalizedText: schema.arabicEntity.normalizedText,
};

export const SentenceRepository = {
  async list(f: SentenceFilters, ex: Executor = db) {
    const c: SQL[] = [];
    if (f.category) c.push(eq(schema.sentence.category, f.category));
    if (f.status) c.push(eq(schema.sentence.status, f.status));
    if (f.sentenceType) {
      c.push(eq(schema.sentence.sentenceType, f.sentenceType));
    }
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
      ex
        .select({ total: count() })
        .from(schema.sentence)
        .innerJoin(schema.arabicEntity, join)
        .where(where),
      ex
        .select({
          ...getTableColumns(schema.sentence),
          entity: entityColumns,
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

  async findByEntityId(entityId: string, ex: Executor = db) {
    const [row] = await ex
      .select()
      .from(schema.sentence)
      .where(eq(schema.sentence.entityId, entityId))
      .limit(1);
    return row ?? null;
  },

  async generateNextSentenceKey(
    exOrOffset: Executor | number = db,
    maybeOffset = 0,
  ): Promise<string> {
    const ex = typeof exOrOffset === 'number' ? db : exOrOffset;
    const offset = typeof exOrOffset === 'number' ? exOrOffset : maybeOffset;
    return generateNextSequentialKey(
      'Sentence',
      'sentenceKey',
      'SNT-',
      1000,
      ex,
      offset,
    );
  },

  async insert(v: SentenceInsert, ex: Executor = db) {
    const [row] = await ex.insert(schema.sentence).values(v).returning();
    return row;
  },

  async update(id: string, v: Partial<SentenceInsert>, ex: Executor = db) {
    const [row] = await ex
      .update(schema.sentence)
      .set(v)
      .where(eq(schema.sentence.id, id))
      .returning();
    return row;
  },

  async delete(id: string, ex: Executor = db) {
    await ex.delete(schema.sentence).where(eq(schema.sentence.id, id));
  },

  async replaceWords(
    sentenceId: string,
    words: { wordId: string; position: number }[],
    ex: Executor = db,
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

export type SentenceRepository = typeof SentenceRepository;
