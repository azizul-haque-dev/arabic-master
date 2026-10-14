import {
  and,
  asc,
  count,
  desc,
  eq,
  ilike,
  inArray,
  ne,
  or,
  type SQL,
} from 'drizzle-orm';
import { escapeLike } from '../../common/utils/escape-like.util.js';
import { db, type Executor, type Tx } from '../../database/db.js';
import { ContentStatus } from '../../database/drizzle/enums.js';
import * as schema from '../../database/drizzle/schema.js';
import type { ListConversationQuery } from './conversation.schemas.js';

export const ConversationRepository = {
  async list(q: ListConversationQuery, ex: Executor = db) {
    const c: SQL[] = [];
    if (q.status) c.push(eq(schema.conversation.status, q.status));
    if (q.category) c.push(eq(schema.conversation.category, q.category));
    if (q.search?.trim()) {
      const p = `%${escapeLike(q.search.trim())}%`;
      c.push(
        or(
          ilike(schema.conversation.title, p),
          ilike(schema.conversation.topic, p),
          ilike(schema.conversation.conversationKey, p),
        )!,
      );
    }
    const where = c.length ? and(...c) : undefined;

    const [totalRows, items] = await Promise.all([
      ex.select({ total: count() }).from(schema.conversation).where(where),
      ex
        .select()
        .from(schema.conversation)
        .where(where)
        .orderBy(
          desc(schema.conversation.createdAt),
          desc(schema.conversation.id),
        ) // id: deterministic pagination
        .limit(q.limit)
        .offset((q.page - 1) * q.limit),
    ]);
    return { items, total: Number(totalRows[0]?.total ?? 0) };
  },

  /** এক query-তে পুরো page-এর turn count (N+1 নেই) */
  async turnCounts(ids: string[], ex: Executor = db) {
    if (!ids.length) return new Map<string, number>();
    const rows = await ex
      .select({
        conversationId: schema.conversationTurn.conversationId,
        turnCount: count(),
      })
      .from(schema.conversationTurn)
      .where(inArray(schema.conversationTurn.conversationId, ids))
      .groupBy(schema.conversationTurn.conversationId);
    return new Map(rows.map((r) => [r.conversationId, Number(r.turnCount)]));
  },

  async findById(id: string, ex: Executor = db) {
    const [row] = await ex
      .select()
      .from(schema.conversation)
      .where(eq(schema.conversation.id, id))
      .limit(1);
    return row ?? null;
  },

  /** row lock: concurrent edit serialize করে */
  async lockById(id: string, tx: Tx) {
    const [row] = await tx
      .select()
      .from(schema.conversation)
      .where(eq(schema.conversation.id, id))
      .limit(1)
      .for('update');
    return row ?? null;
  },

  /** leftJoin: sentence delete হলেও turn হারায় না (DB-তে FK নেই) */
  turnsDetailed(conversationId: string, ex: Executor = db) {
    return ex
      .select({
        id: schema.conversationTurn.id,
        order: schema.conversationTurn.order,
        speaker: schema.conversationTurn.speaker,
        sentenceId: schema.conversationTurn.sentenceId,
        sentence: {
          id: schema.sentence.id,
          sentenceKey: schema.sentence.sentenceKey,
          meaningEn: schema.sentence.meaningEn,
          meaningBn: schema.sentence.meaningBn,
          status: schema.sentence.status,
        },
        arabicText: schema.arabicEntity.arabicText,
        audioUrl: schema.arabicEntity.audioUrl,
      })
      .from(schema.conversationTurn)
      .leftJoin(
        schema.sentence,
        eq(schema.sentence.id, schema.conversationTurn.sentenceId),
      )
      .leftJoin(
        schema.arabicEntity,
        eq(schema.arabicEntity.id, schema.sentence.entityId),
      )
      .where(eq(schema.conversationTurn.conversationId, conversationId))
      .orderBy(asc(schema.conversationTurn.order));
  },

  async insert(v: typeof schema.conversation.$inferInsert, tx: Tx) {
    const [row] = await tx.insert(schema.conversation).values(v).returning();
    return row;
  },

  async update(
    id: string,
    v: Partial<typeof schema.conversation.$inferInsert>,
    ex: Executor = db,
  ) {
    const [row] = await ex
      .update(schema.conversation)
      .set({ ...v, updatedAt: new Date() })
      .where(eq(schema.conversation.id, id))
      .returning();
    return row;
  },

  async delete(id: string, tx: Tx) {
    await tx
      .delete(schema.conversation)
      .where(eq(schema.conversation.id, id));
  },

  async insertTurns(
    rows: (typeof schema.conversationTurn.$inferInsert)[],
    tx: Tx,
  ) {
    await tx.insert(schema.conversationTurn).values(rows);
  },

  async deleteTurns(conversationId: string, tx: Tx) {
    await tx
      .delete(schema.conversationTurn)
      .where(eq(schema.conversationTurn.conversationId, conversationId));
  },

  async existingSentenceIds(ids: string[], tx: Tx) {
    const rows = await tx
      .select({ id: schema.sentence.id })
      .from(schema.sentence)
      .where(inArray(schema.sentence.id, ids));
    return new Set(rows.map((r) => r.id));
  },

  async hasTurns(id: string, tx: Tx) {
    const rows = await tx
      .select({ id: schema.conversationTurn.id })
      .from(schema.conversationTurn)
      .where(eq(schema.conversationTurn.conversationId, id))
      .limit(1);
    return rows.length > 0;
  },

  async unpublishedSentenceKeys(id: string, tx: Tx) {
    const rows = await tx
      .select({ key: schema.sentence.sentenceKey })
      .from(schema.conversationTurn)
      .innerJoin(
        schema.sentence,
        eq(schema.sentence.id, schema.conversationTurn.sentenceId),
      )
      .where(
        and(
          eq(schema.conversationTurn.conversationId, id),
          ne(schema.sentence.status, ContentStatus.PUBLISHED),
        ),
      );
    return [...new Set(rows.map((r) => r.key))];
  },

  async usedByLesson(id: string, tx: Tx) {
    const rows = await tx
      .select({ lessonId: schema.lessonContentItem.lessonId })
      .from(schema.lessonContentItem)
      .where(eq(schema.lessonContentItem.conversationId, id))
      .limit(1);
    return rows.length > 0;
  },
};

export type ConversationRepository = typeof ConversationRepository;
