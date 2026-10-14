import {
  and,
  asc,
  count,
  desc,
  eq,
  ilike,
  inArray,
  max,
  or,
  sql,
  type SQL,
} from 'drizzle-orm';
import { escapeLike } from '../../../common/utils/escape-like.util.js';
import { db, type Executor, type Tx } from '../../../database/db.js';
import * as schema from '../../../database/drizzle/schema.js';
import type { ListSectionQuery } from './section.schemas.js';

export const SectionRepository = {
  async list(q: ListSectionQuery, ex: Executor = db) {
    const c: SQL[] = [];
    if (q.courseId) c.push(eq(schema.section.courseId, q.courseId));
    if (q.status) c.push(eq(schema.section.status, q.status));
    if (q.search?.trim()) {
      const p = `%${escapeLike(q.search.trim())}%`;
      c.push(
        or(
          ilike(schema.section.title, p),
          ilike(schema.section.sectionKey, p),
        )!,
      );
    }
    const where = c.length ? and(...c) : undefined;

    const [totalRows, rows] = await Promise.all([
      ex.select({ total: count() }).from(schema.section).where(where),
      ex
        .select({ section: schema.section, courseTitle: schema.course.title })
        .from(schema.section)
        .leftJoin(
          schema.course,
          eq(schema.course.id, schema.section.courseId),
        )
        .where(where)
        // একটা course filter থাকলে sequence অনুযায়ী, না থাকলে নতুন আগে
        .orderBy(
          q.courseId
            ? asc(schema.section.order)
            : desc(schema.section.createdAt),
          desc(schema.section.id),
        )
        .limit(q.limit)
        .offset((q.page - 1) * q.limit),
    ]);
    return { rows, total: Number(totalRows[0]?.total ?? 0) };
  },

  async lessonCounts(sectionIds: string[], ex: Executor = db) {
    if (!sectionIds.length) return new Map<string, number>();
    const rows = await ex
      .select({ sectionId: schema.lesson.sectionId, total: count() })
      .from(schema.lesson)
      .where(inArray(schema.lesson.sectionId, sectionIds))
      .groupBy(schema.lesson.sectionId);
    return new Map(rows.map((r) => [r.sectionId, Number(r.total)]));
  },

  async itemCountsByLesson(lessonIds: string[], ex: Executor = db) {
    if (!lessonIds.length) return new Map<string, number>();
    const rows = await ex
      .select({ lessonId: schema.lessonContentItem.lessonId, total: count() })
      .from(schema.lessonContentItem)
      .where(inArray(schema.lessonContentItem.lessonId, lessonIds))
      .groupBy(schema.lessonContentItem.lessonId);
    return new Map(rows.map((r) => [r.lessonId, Number(r.total)]));
  },

  async findById(id: string, ex: Executor = db) {
    const [row] = await ex
      .select()
      .from(schema.section)
      .where(eq(schema.section.id, id))
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

  lessonsOf: (sectionId: string, ex: Executor = db) =>
    ex
      .select()
      .from(schema.lesson)
      .where(eq(schema.lesson.sectionId, sectionId))
      .orderBy(asc(schema.lesson.order)),

  listByCourse: (courseId: string, ex: Executor = db) =>
    ex
      .select()
      .from(schema.section)
      .where(eq(schema.section.courseId, courseId))
      .orderBy(asc(schema.section.order)),

  /** parent course row lock: concurrent create/reorder-এ order collision ঠেকায় */
  async lockCourse(courseId: string, tx: Tx) {
    const rows = await tx
      .select({ id: schema.course.id })
      .from(schema.course)
      .where(eq(schema.course.id, courseId))
      .limit(1)
      .for('update');
    return rows.length > 0;
  },

  async maxOrder(courseId: string, tx: Tx) {
    const [agg] = await tx
      .select({ maxOrder: max(schema.section.order) })
      .from(schema.section)
      .where(eq(schema.section.courseId, courseId));
    return agg?.maxOrder ?? 0;
  },

  async insert(v: typeof schema.section.$inferInsert, tx: Tx) {
    const [row] = await tx.insert(schema.section).values(v).returning();
    return row;
  },

  async update(
    id: string,
    v: Partial<typeof schema.section.$inferInsert>,
    ex: Executor = db,
  ) {
    const [row] = await ex
      .update(schema.section)
      .set({ ...v, updatedAt: new Date() })
      .where(eq(schema.section.id, id))
      .returning();
    return row;
  },

  async lockById(id: string, tx: Tx) {
    const [row] = await tx
      .select()
      .from(schema.section)
      .where(eq(schema.section.id, id))
      .limit(1)
      .for('update');
    return row ?? null;
  },

  async hasLessons(id: string, tx: Tx) {
    const rows = await tx
      .select({ id: schema.lesson.id })
      .from(schema.lesson)
      .where(eq(schema.lesson.sectionId, id))
      .limit(1);
    return rows.length > 0;
  },

  async delete(id: string, tx: Tx) {
    await tx.delete(schema.section).where(eq(schema.section.id, id));
  },

  siblings: (courseId: string, tx: Tx) =>
    tx
      .select({ id: schema.section.id, status: schema.section.status })
      .from(schema.section)
      .where(eq(schema.section.courseId, courseId)),

  /** step 1: unique index (courseId, order) এড়াতে সব order নেগেটিভে সরাই */
  async shiftOrders(courseId: string, tx: Tx) {
    await tx
      .update(schema.section)
      .set({ order: sql`-${schema.section.order} - 1` })
      .where(eq(schema.section.courseId, courseId));
  },

  async setOrder(id: string, order: number, tx: Tx) {
    await tx
      .update(schema.section)
      .set({ order, updatedAt: new Date() })
      .where(eq(schema.section.id, id));
  },
};

export type SectionRepository = typeof SectionRepository;
