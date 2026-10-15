import {
  and,
  asc,
  count,
  desc,
  eq,
  ilike,
  inArray,
  max,
  ne,
  or,
  sql,
  type SQL,
} from 'drizzle-orm';
import { escapeLike } from '../../../common/utils/escape-like.util.js';
import { generateNextSequentialKey } from '../../../common/utils/key-generator.util.js';
import { db, type Executor, type Tx } from '../../../database/db.js';
import {
  ContentStatus,
  LessonContentType,
} from '../../../database/drizzle/enums.js';
import * as schema from '../../../database/drizzle/schema.js';
import type { ListLessonQuery } from './lesson.schemas.js';

type ItemCounts = { words: number; sentences: number; conversations: number };

const itemColumn = (type: LessonContentType) =>
  type === LessonContentType.WORD
    ? schema.lessonContentItem.wordId
    : type === LessonContentType.SENTENCE
      ? schema.lessonContentItem.sentenceId
      : schema.lessonContentItem.conversationId;

export const LessonRepository = {
  // ------------- lesson -------------
  async list(q: ListLessonQuery, ex: Executor = db) {
    const c: SQL[] = [];
    if (q.sectionId) c.push(eq(schema.lesson.sectionId, q.sectionId));
    if (q.courseId) c.push(eq(schema.section.courseId, q.courseId));
    if (q.status) c.push(eq(schema.lesson.status, q.status));
    if (q.search?.trim()) {
      const p = `%${escapeLike(q.search.trim())}%`;
      c.push(
        or(ilike(schema.lesson.title, p), ilike(schema.lesson.lessonKey, p))!,
      );
    }
    const where = c.length ? and(...c) : undefined;

    const [totalRows, rows] = await Promise.all([
      ex
        .select({ total: count() })
        .from(schema.lesson)
        .leftJoin(
          schema.section,
          eq(schema.section.id, schema.lesson.sectionId),
        )
        .where(where),
      ex
        .select({
          lesson: schema.lesson,
          sectionTitle: schema.section.title,
          courseId: schema.section.courseId,
          courseTitle: schema.course.title,
        })
        .from(schema.lesson)
        .leftJoin(
          schema.section,
          eq(schema.section.id, schema.lesson.sectionId),
        )
        .leftJoin(
          schema.course,
          eq(schema.course.id, schema.section.courseId),
        )
        .where(where)
        .orderBy(
          q.sectionId
            ? asc(schema.lesson.order)
            : desc(schema.lesson.createdAt),
          desc(schema.lesson.id),
        )
        .limit(q.limit)
        .offset((q.page - 1) * q.limit),
    ]);
    return { rows, total: Number(totalRows[0]?.total ?? 0) };
  },

  /** CMS badge-এর জন্য type অনুযায়ী item গণনা (যেমন 3W · 2S · 1C) */
  async itemTypeCounts(lessonIds: string[], ex: Executor = db) {
    const map = new Map<string, ItemCounts>();
    if (!lessonIds.length) return map;
    const rows = await ex
      .select({
        lessonId: schema.lessonContentItem.lessonId,
        contentType: schema.lessonContentItem.contentType,
        total: count(),
      })
      .from(schema.lessonContentItem)
      .where(inArray(schema.lessonContentItem.lessonId, lessonIds))
      .groupBy(
        schema.lessonContentItem.lessonId,
        schema.lessonContentItem.contentType,
      );
    for (const r of rows) {
      const entry = map.get(r.lessonId) ?? {
        words: 0,
        sentences: 0,
        conversations: 0,
      };
      const v = Number(r.total);
      if (r.contentType === LessonContentType.WORD) entry.words = v;
      else if (r.contentType === LessonContentType.SENTENCE)
        entry.sentences = v;
      else entry.conversations = v;
      map.set(r.lessonId, entry);
    }
    return map;
  },

  async findById(id: string, ex: Executor = db) {
    const [row] = await ex
      .select()
      .from(schema.lesson)
      .where(eq(schema.lesson.id, id))
      .limit(1);
    return row ?? null;
  },

  async sectionSummary(sectionId: string, ex: Executor = db) {
    const [row] = await ex
      .select({
        id: schema.section.id,
        sectionKey: schema.section.sectionKey,
        title: schema.section.title,
        courseId: schema.section.courseId,
      })
      .from(schema.section)
      .where(eq(schema.section.id, sectionId))
      .limit(1);
    return row ?? null;
  },

  async courseSummary(courseId: string, ex: Executor = db) {
    const [row] = await ex
      .select({
        id: schema.course.id,
        courseKey: schema.course.courseKey,
        title: schema.course.title,
      })
      .from(schema.course)
      .where(eq(schema.course.id, courseId))
      .limit(1);
    return row ?? null;
  },

  async lockSection(sectionId: string, tx: Tx) {
    const rows = await tx
      .select({ id: schema.section.id })
      .from(schema.section)
      .where(eq(schema.section.id, sectionId))
      .limit(1)
      .for('update');
    return rows.length > 0;
  },

  async maxOrder(sectionId: string, tx: Tx) {
    const [agg] = await tx
      .select({ maxOrder: max(schema.lesson.order) })
      .from(schema.lesson)
      .where(eq(schema.lesson.sectionId, sectionId));
    return agg?.maxOrder ?? 0;
  },

  async generateNextLessonKey(ex: Executor = db): Promise<string> {
    return generateNextSequentialKey('Lesson', 'lessonKey', 'LSN-', 4000, ex);
  },

  async insert(v: typeof schema.lesson.$inferInsert, tx: Tx) {
    const [row] = await tx.insert(schema.lesson).values(v).returning();
    return row;
  },

  async update(
    id: string,
    v: Partial<typeof schema.lesson.$inferInsert>,
    ex: Executor = db,
  ) {
    const [row] = await ex
      .update(schema.lesson)
      .set({ ...v, updatedAt: new Date() })
      .where(eq(schema.lesson.id, id))
      .returning();
    return row;
  },

  async lockById(id: string, tx: Tx) {
    const [row] = await tx
      .select()
      .from(schema.lesson)
      .where(eq(schema.lesson.id, id))
      .limit(1)
      .for('update');
    return row ?? null;
  },

  async delete(id: string, tx: Tx) {
    await tx.delete(schema.lesson).where(eq(schema.lesson.id, id));
  },

  async hasProgress(id: string, tx: Tx) {
    const rows = await tx
      .select({ id: schema.lessonProgress.id })
      .from(schema.lessonProgress)
      .where(eq(schema.lessonProgress.lessonId, id))
      .limit(1);
    return rows.length > 0;
  },

  siblings: (sectionId: string, tx: Tx) =>
    tx
      .select({ id: schema.lesson.id, status: schema.lesson.status })
      .from(schema.lesson)
      .where(eq(schema.lesson.sectionId, sectionId)),

  async shiftOrders(sectionId: string, tx: Tx) {
    await tx
      .update(schema.lesson)
      .set({ order: sql`-${schema.lesson.order} - 1` })
      .where(eq(schema.lesson.sectionId, sectionId));
  },

  async setOrder(id: string, order: number, tx: Tx) {
    await tx
      .update(schema.lesson)
      .set({ order, updatedAt: new Date() })
      .where(eq(schema.lesson.id, id));
  },

  listBySection: (sectionId: string, ex: Executor = db) =>
    ex
      .select()
      .from(schema.lesson)
      .where(eq(schema.lesson.sectionId, sectionId))
      .orderBy(asc(schema.lesson.order)),

  // ------------- items -------------
  itemsOf: (lessonId: string, ex: Executor = db) =>
    ex
      .select()
      .from(schema.lessonContentItem)
      .where(eq(schema.lessonContentItem.lessonId, lessonId))
      .orderBy(asc(schema.lessonContentItem.order)),

  /** leftJoin: referenced content মুছে গেলে preview null আসে */
  async wordPreviews(ids: string[], ex: Executor = db) {
    if (!ids.length) return [];
    return ex
      .select({
        id: schema.word.id,
        key: schema.word.wordKey,
        meaningEn: schema.word.meaningEn,
        meaningBn: schema.word.meaningBn,
        status: schema.word.status,
        arabicText: schema.arabicEntity.arabicText,
      })
      .from(schema.word)
      .leftJoin(
        schema.arabicEntity,
        eq(schema.arabicEntity.id, schema.word.entityId),
      )
      .where(inArray(schema.word.id, ids));
  },

  async sentencePreviews(ids: string[], ex: Executor = db) {
    if (!ids.length) return [];
    return ex
      .select({
        id: schema.sentence.id,
        key: schema.sentence.sentenceKey,
        meaningEn: schema.sentence.meaningEn,
        meaningBn: schema.sentence.meaningBn,
        status: schema.sentence.status,
        arabicText: schema.arabicEntity.arabicText,
      })
      .from(schema.sentence)
      .leftJoin(
        schema.arabicEntity,
        eq(schema.arabicEntity.id, schema.sentence.entityId),
      )
      .where(inArray(schema.sentence.id, ids));
  },

  async conversationPreviews(ids: string[], ex: Executor = db) {
    if (!ids.length) return [];
    return ex
      .select({
        id: schema.conversation.id,
        key: schema.conversation.conversationKey,
        title: schema.conversation.title,
        status: schema.conversation.status,
      })
      .from(schema.conversation)
      .where(inArray(schema.conversation.id, ids));
  },

  async contentExists(type: LessonContentType, contentId: string, tx: Tx) {
    let rows: { id: string }[];
    if (type === LessonContentType.WORD) {
      rows = await tx
        .select({ id: schema.word.id })
        .from(schema.word)
        .where(eq(schema.word.id, contentId))
        .limit(1);
    } else if (type === LessonContentType.SENTENCE) {
      rows = await tx
        .select({ id: schema.sentence.id })
        .from(schema.sentence)
        .where(eq(schema.sentence.id, contentId))
        .limit(1);
    } else {
      rows = await tx
        .select({ id: schema.conversation.id })
        .from(schema.conversation)
        .where(eq(schema.conversation.id, contentId))
        .limit(1);
    }
    return rows.length > 0;
  },

  async hasItem(
    lessonId: string,
    type: LessonContentType,
    contentId: string,
    tx: Tx,
  ) {
    const rows = await tx
      .select({ id: schema.lessonContentItem.id })
      .from(schema.lessonContentItem)
      .where(
        and(
          eq(schema.lessonContentItem.lessonId, lessonId),
          eq(itemColumn(type), contentId),
        ),
      )
      .limit(1);
    return rows.length > 0;
  },

  /** order একটা lesson-এর সব type জুড়ে unique (DB index) */
  async maxItemOrder(lessonId: string, tx: Tx) {
    const [agg] = await tx
      .select({ maxOrder: max(schema.lessonContentItem.order) })
      .from(schema.lessonContentItem)
      .where(eq(schema.lessonContentItem.lessonId, lessonId));
    return agg?.maxOrder ?? 0;
  },

  async insertItem(v: typeof schema.lessonContentItem.$inferInsert, tx: Tx) {
    await tx.insert(schema.lessonContentItem).values(v);
  },

  async deleteItem(lessonId: string, itemId: string, tx: Tx) {
    const rows = await tx
      .delete(schema.lessonContentItem)
      .where(
        and(
          eq(schema.lessonContentItem.id, itemId),
          eq(schema.lessonContentItem.lessonId, lessonId),
        ),
      )
      .returning({ id: schema.lessonContentItem.id });
    return rows.length > 0;
  },

  async deleteItems(lessonId: string, tx: Tx) {
    await tx
      .delete(schema.lessonContentItem)
      .where(eq(schema.lessonContentItem.lessonId, lessonId));
  },

  async itemIds(lessonId: string, tx: Tx) {
    const rows = await tx
      .select({ id: schema.lessonContentItem.id })
      .from(schema.lessonContentItem)
      .where(eq(schema.lessonContentItem.lessonId, lessonId));
    return rows.map((r) => r.id);
  },

  async shiftItemOrders(lessonId: string, tx: Tx) {
    await tx
      .update(schema.lessonContentItem)
      .set({ order: sql`-${schema.lessonContentItem.order} - 1` })
      .where(eq(schema.lessonContentItem.lessonId, lessonId));
  },

  async setItemOrder(itemId: string, order: number, tx: Tx) {
    await tx
      .update(schema.lessonContentItem)
      .set({ order })
      .where(eq(schema.lessonContentItem.id, itemId));
  },

  async hasItems(lessonId: string, tx: Tx) {
    const rows = await tx
      .select({ id: schema.lessonContentItem.id })
      .from(schema.lessonContentItem)
      .where(eq(schema.lessonContentItem.lessonId, lessonId))
      .limit(1);
    return rows.length > 0;
  },

  /** publish-এর আগে সব item PUBLISHED কি না */
  async unpublishedItemKeys(lessonId: string, tx: Tx) {
    const item = schema.lessonContentItem;
    const [words, sentences, conversations] = await Promise.all([
      tx
        .select({ key: schema.word.wordKey })
        .from(item)
        .innerJoin(schema.word, eq(schema.word.id, item.wordId))
        .where(
          and(
            eq(item.lessonId, lessonId),
            ne(schema.word.status, ContentStatus.PUBLISHED),
          ),
        ),
      tx
        .select({ key: schema.sentence.sentenceKey })
        .from(item)
        .innerJoin(schema.sentence, eq(schema.sentence.id, item.sentenceId))
        .where(
          and(
            eq(item.lessonId, lessonId),
            ne(schema.sentence.status, ContentStatus.PUBLISHED),
          ),
        ),
      tx
        .select({ key: schema.conversation.conversationKey })
        .from(item)
        .innerJoin(
          schema.conversation,
          eq(schema.conversation.id, item.conversationId),
        )
        .where(
          and(
            eq(item.lessonId, lessonId),
            ne(schema.conversation.status, ContentStatus.PUBLISHED),
          ),
        ),
    ]);
    return [...words, ...sentences, ...conversations].map((r) => r.key);
  },
};

export type LessonRepository = typeof LessonRepository;
