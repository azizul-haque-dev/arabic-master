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
import type { Db, Executor, Tx } from '../../../database/db.js';
import * as schema from '../../../database/drizzle/schema.js';
import type { ListCourseQuery } from './course.schemas.js';

export function createCourseRepository(db: Db) {
  return {
    async list(q: ListCourseQuery) {
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
        db.select({ total: count() }).from(schema.course).where(where),
        db
          .select()
          .from(schema.course)
          .where(where)
          .orderBy(desc(schema.course.createdAt), desc(schema.course.id))
          .limit(q.limit)
          .offset((q.page - 1) * q.limit),
      ]);
      return { items, total: Number(totalRows[0]?.total ?? 0) };
    },
    async sectionCounts(courseIds: string[]) {
      const rows = await db
        .select({ courseId: schema.section.courseId, total: count() })
        .from(schema.section)
        .where(inArray(schema.section.courseId, courseIds))
        .groupBy(schema.section.courseId);
      return new Map(rows.map((r) => [r.courseId, Number(r.total)]));
    },
    async lessonCountsByCourse(courseIds: string[]) {
      const rows = await db
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
    sectionsOf: (courseId: string) =>
      db
        .select()
        .from(schema.section)
        .where(eq(schema.section.courseId, courseId))
        .orderBy(asc(schema.section.order)),
    async lessonCountsBySection(sectionIds: string[]) {
      if (!sectionIds.length) return new Map<string, number>();
      const rows = await db
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
    async insert(v: typeof schema.course.$inferInsert) {
      const [row] = await db.insert(schema.course).values(v).returning();
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
}
export type CourseRepository = ReturnType<typeof createCourseRepository>;
