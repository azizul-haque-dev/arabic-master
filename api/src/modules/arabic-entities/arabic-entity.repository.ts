import {
  and,
  count,
  desc,
  eq,
  ilike,
  or,
  sql,
  type SQL,
} from 'drizzle-orm';
import { v7 as randomUUIDv7 } from 'uuid';
import { ConflictError, NotFoundError } from '../../common/errors/app-error.js';
import { escapeLike } from '../../common/utils/escape-like.util.js';
import { generateNextSequentialKey } from '../../common/utils/key-generator.util.js';
import { normalizeArabicText } from '../../common/utils/normalize-arabic.util.js';
import { db, type Executor } from '../../database/db.js';
import type { ContentStatus } from '../../database/drizzle/enums.js';
import * as schema from '../../database/drizzle/schema.js';
import type { ListArabicEntityQuery } from './arabic-entity.schemas.js';

const detailedArabicEntitySelection = {
  id: schema.arabicEntity.id,
  entityKey: schema.arabicEntity.entityKey,
  arabicText: schema.arabicEntity.arabicText,
  normalizedText: schema.arabicEntity.normalizedText,
  audioUrl: schema.arabicEntity.audioUrl,
  pronunciationBangla: sql<string>`COALESCE("ArabicEntity"."pronunciationBangla", '')`,
  pronunciationEnglish: sql<string>`COALESCE("ArabicEntity"."pronunciationEnglish", '')`,
  meaningBangla: sql<string>`COALESCE("ArabicEntity"."meaningBangla", (SELECT "meaningBn" FROM "Word" WHERE "Word"."entityId" = "ArabicEntity"."id" LIMIT 1), (SELECT "meaningBn" FROM "Sentence" WHERE "Sentence"."entityId" = "ArabicEntity"."id" LIMIT 1), '')`,
  meaningEnglish: sql<string>`COALESCE("ArabicEntity"."meaningEnglish", (SELECT "meaningEn" FROM "Word" WHERE "Word"."entityId" = "ArabicEntity"."id" LIMIT 1), (SELECT "meaningEn" FROM "Sentence" WHERE "Sentence"."entityId" = "ArabicEntity"."id" LIMIT 1), '')`,
  status: schema.arabicEntity.status,
  rejectionReason: schema.arabicEntity.rejectionReason,
  createdById: schema.arabicEntity.createdById,
  createdBy: sql<string>`COALESCE((SELECT "fullName" FROM "User" WHERE "User"."id" = "ArabicEntity"."createdById"), 'Content Admin')`,
  createdAt: schema.arabicEntity.createdAt,
  updatedAt: schema.arabicEntity.updatedAt,
  wordUsageCount: sql<number>`(SELECT COUNT(*)::int FROM "Word" WHERE "Word"."entityId" = "ArabicEntity"."id")`,
  sentenceUsageCount: sql<number>`(SELECT COUNT(*)::int FROM "Sentence" WHERE "Sentence"."entityId" = "ArabicEntity"."id")`,
  conversationUsageCount: sql<number>`(SELECT COUNT(*)::int FROM "ConversationTurn" ct JOIN "Sentence" s ON s."id" = ct."sentenceId" WHERE s."entityId" = "ArabicEntity"."id")`,
  hasAudio: sql<boolean>`EXISTS (SELECT 1 FROM "ArabicEntityAudio" aea WHERE aea."entityId" = "ArabicEntity"."id") OR ("ArabicEntity"."audioUrl" IS NOT NULL AND "ArabicEntity"."audioUrl" != '')`,
};

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

  async generateNextEntityKey(
    exOrOffset: Executor | number = db,
    maybeOffset = 0,
  ): Promise<string> {
    const ex = typeof exOrOffset === 'number' ? db : exOrOffset;
    const offset = typeof exOrOffset === 'number' ? exOrOffset : maybeOffset;
    return generateNextSequentialKey('ArabicEntity', 'entityKey', 'AE-', 1000, ex, offset);
  },

  async list(query: ListArabicEntityQuery, ex: Executor = db) {
    const conditions: SQL[] = [];
    if (query.status) {
      conditions.push(eq(schema.arabicEntity.status, query.status as ContentStatus));
    }

    if (query.search) {
      const escaped = `%${escapeLike(query.search)}%`;
      const normalizedSearch = `%${escapeLike(normalizeArabicText(query.search))}%`;
      conditions.push(
        or(
          ilike(schema.arabicEntity.arabicText, escaped),
          ilike(schema.arabicEntity.normalizedText, normalizedSearch),
          ilike(schema.arabicEntity.entityKey, escaped),
          ilike(schema.arabicEntity.pronunciationEnglish, escaped),
          ilike(schema.arabicEntity.pronunciationBangla, escaped),
          ilike(schema.arabicEntity.meaningEnglish, escaped),
          ilike(schema.arabicEntity.meaningBangla, escaped),
        )!,
      );
    }

    const where = conditions.length ? and(...conditions) : undefined;

    const [totalRow] = await ex
      .select({ total: count() })
      .from(schema.arabicEntity)
      .where(where);

    const total = Number(totalRow?.total ?? 0);
    const offset = (query.page - 1) * query.limit;

    const rows = await ex
      .select(detailedArabicEntitySelection)
      .from(schema.arabicEntity)
      .where(where)
      .orderBy(desc(schema.arabicEntity.createdAt))
      .limit(query.limit)
      .offset(offset);

    return { items: rows, total };
  },

  async findDetailedById(idOrKey: string, ex: Executor = db) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrKey);
    const filter = isUuid
      ? eq(schema.arabicEntity.id, idOrKey)
      : eq(schema.arabicEntity.entityKey, idOrKey);

    const [row] = await ex
      .select(detailedArabicEntitySelection)
      .from(schema.arabicEntity)
      .where(filter)
      .limit(1);

    return row ?? null;
  },

  async create(
    d: {
      entityKey?: string;
      arabicText: string;
      audioUrl?: string;
      meaningBangla?: string;
      meaningEnglish?: string;
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
        const entityKey = d.entityKey ?? (await this.generateNextEntityKey(ex, attempts));
        const [row] = await ex
          .insert(schema.arabicEntity)
          .values({
            id: randomUUIDv7(),
            entityKey,
            arabicText: d.arabicText,
            normalizedText,
            meaningBangla: d.meaningBangla,
            meaningEnglish: d.meaningEnglish,
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

  async update(
    id: string,
    d: {
      arabicText?: string;
      meaningBangla?: string;
      meaningEnglish?: string;
      pronunciationBangla?: string;
      pronunciationEnglish?: string;
      audioUrl?: string | null;
      status?: (typeof schema.arabicEntity.$inferSelect)['status'];
      rejectionReason?: string | null;
    },
    ex: Executor = db,
  ) {
    const updateData: Record<string, unknown> = {
      ...d,
      updatedAt: new Date(),
    };

    if (d.arabicText) {
      updateData.normalizedText = normalizeArabicText(d.arabicText);
    }

    const [row] = await ex
      .update(schema.arabicEntity)
      .set(updateData)
      .where(eq(schema.arabicEntity.id, id))
      .returning();

    return row ?? null;
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

  async delete(id: string, ex: Executor = db) {
    // Check if referenced by Word
    const [word] = await ex
      .select({ id: schema.word.id })
      .from(schema.word)
      .where(eq(schema.word.entityId, id))
      .limit(1);

    if (word) {
      throw new ConflictError(
        'Cannot delete Arabic entity because it is referenced by one or more Words.',
      );
    }

    // Check if referenced by Sentence
    const [sentence] = await ex
      .select({ id: schema.sentence.id })
      .from(schema.sentence)
      .where(eq(schema.sentence.entityId, id))
      .limit(1);

    if (sentence) {
      throw new ConflictError(
        'Cannot delete Arabic entity because it is referenced by one or more Sentences.',
      );
    }

    const [deleted] = await ex
      .delete(schema.arabicEntity)
      .where(eq(schema.arabicEntity.id, id))
      .returning();

    return deleted ?? null;
  },
};

export type ArabicEntityRepository = typeof ArabicEntityRepository;
