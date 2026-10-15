import {
  and,
  asc,
  count,
  desc,
  eq,
  ilike,
  inArray,
  or,
  type SQL,
} from 'drizzle-orm';
import { escapeLike } from '../../../common/utils/escape-like.util.js';
import { generateNextSequentialKey } from '../../../common/utils/key-generator.util.js';
import { db, type Executor, type Tx } from '../../../database/db.js';
import * as schema from '../../../database/drizzle/schema.js';
import type { ListCourseQuery } from './course.schemas.js';

export const CourseRepository = {
  async list(q: ListCourseQuery, ex: Executor = db) {
    const c: SQL[] = [];
    if (q.status) c.push(eq(schema.course.status, q.status));
    if (q.level) c.push(eq(schema.course.level, q.level));
    if (q.courseType) c.push(eq(schema.course.courseType, q.courseType));
    if (q.search?.trim()) {
      const p = `%${escapeLike(q.search.trim())}%`;
      c.push(
        or(ilike(schema.course.title, p), ilike(schema.course.courseKey, p))!,
      );
    }
    const where = c.length ? and(...c) : undefined;
    const [totalRows, items] = await Promise.all([
      ex.select({ total: count() }).from(schema.course).where(where),
      ex
        .select()
        .from(schema.course)
        .where(where)
        .orderBy(desc(schema.course.createdAt), desc(schema.course.id))
        .limit(q.limit)
        .offset((q.page - 1) * q.limit),
    ]);
    return { items, total: Number(totalRows[0]?.total ?? 0) };
  },

  async sectionCounts(courseIds: string[], ex: Executor = db) {
    if (!courseIds.length) return new Map<string, number>();
    const rows = await ex
      .select({ courseId: schema.section.courseId, total: count() })
      .from(schema.section)
      .where(inArray(schema.section.courseId, courseIds))
      .groupBy(schema.section.courseId);
    return new Map(rows.map((r) => [r.courseId, Number(r.total)]));
  },

  async lessonCountsByCourse(courseIds: string[], ex: Executor = db) {
    if (!courseIds.length) return new Map<string, number>();
    const rows = await ex
      .select({ courseId: schema.section.courseId, total: count() })
      .from(schema.lesson)
      .innerJoin(
        schema.section,
        eq(schema.section.id, schema.lesson.sectionId),
      )
      .where(inArray(schema.section.courseId, courseIds))
      .groupBy(schema.section.courseId);
    return new Map(rows.map((r) => [r.courseId, Number(r.total)]));
  },

  sectionsOf: (courseId: string, ex: Executor = db) =>
    ex
      .select()
      .from(schema.section)
      .where(eq(schema.section.courseId, courseId))
      .orderBy(asc(schema.section.order)),

  async lessonCountsBySection(sectionIds: string[], ex: Executor = db) {
    if (!sectionIds.length) return new Map<string, number>();
    const rows = await ex
      .select({ sectionId: schema.lesson.sectionId, total: count() })
      .from(schema.lesson)
      .where(inArray(schema.lesson.sectionId, sectionIds))
      .groupBy(schema.lesson.sectionId);
    return new Map(rows.map((r) => [r.sectionId, Number(r.total)]));
  },

  async findById(id: string, ex: Executor = db) {
    const [row] = await ex
      .select()
      .from(schema.course)
      .where(eq(schema.course.id, id))
      .limit(1);
    return row ?? null;
  },

  async lockById(id: string, tx: Tx) {
    const [row] = await tx
      .select()
      .from(schema.course)
      .where(eq(schema.course.id, id))
      .limit(1)
      .for('update');
    return row ?? null;
  },

  async hasSections(courseId: string, tx: Tx) {
    const rows = await tx
      .select({ id: schema.section.id })
      .from(schema.section)
      .where(eq(schema.section.courseId, courseId))
      .limit(1);
    return rows.length > 0;
  },

  async generateNextCourseKey(
    exOrOffset: Executor | number = db,
    maybeOffset = 0,
  ): Promise<string> {
    const ex = typeof exOrOffset === 'number' ? db : exOrOffset;
    const offset = typeof exOrOffset === 'number' ? exOrOffset : maybeOffset;
    return generateNextSequentialKey('Course', 'courseKey', 'CRS-', 1000, ex, offset);
  },

  async insert(v: typeof schema.course.$inferInsert, ex: Executor = db) {
    const [row] = await ex.insert(schema.course).values(v).returning();
    return row;
  },

  async update(
    id: string,
    v: Partial<typeof schema.course.$inferInsert>,
    ex: Executor = db,
  ) {
    const [row] = await ex
      .update(schema.course)
      .set({ ...v, updatedAt: new Date() })
      .where(eq(schema.course.id, id))
      .returning();
    return row;
  },

  async delete(id: string, tx: Tx) {
    await tx.delete(schema.course).where(eq(schema.course.id, id));
  },
};

export type CourseRepository = typeof CourseRepository;
