import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
import { randomUUID } from 'node:crypto';
import { escapeLike } from '../../../common/utils/escape-like.util.js';
import {
  assertEditable,
  resolveStatusChange,
} from '../../../common/utils/content-workflow.util.js';
import { UpdateStatusDto } from '../../../common/dto/update-status.dto.js';
import { DatabaseService } from '../../../database/drizzle/db.service.js';
import { ContentStatus } from '../../../database/drizzle/enums.js';
import * as schema from '../../../database/drizzle/schema.js';
import type { RequestUser } from '../../auth/types/jwt-payload.type.js';
import { CreateCourseDto } from './dto/create-course.dto.js';
import { ListCourseQueryDto } from './dto/list-course-query.dto.js';
import { UpdateCourseDto } from './dto/update-course.dto.js';

@Injectable()
export class CoursesService {
  constructor(private readonly database: DatabaseService) {}

  async list(query: ListCourseQueryDto) {
    const { page, limit, status, level, courseType, search } = query;

    const conditions: SQL[] = [];
    if (status) conditions.push(eq(schema.course.status, status));
    if (level) conditions.push(eq(schema.course.level, level));
    if (courseType) conditions.push(eq(schema.course.courseType, courseType));
    if (search?.trim()) {
      const pattern = `%${escapeLike(search.trim())}%`;
      conditions.push(
        or(
          ilike(schema.course.title, pattern),
          ilike(schema.course.courseKey, pattern),
        )!,
      );
    }
    const where = conditions.length ? and(...conditions) : undefined;

    const [totalRows, items] = await Promise.all([
      this.database.db.select({ total: count() }).from(schema.course).where(where),
      this.database.db
        .select()
        .from(schema.course)
        .where(where)
        .orderBy(desc(schema.course.createdAt), desc(schema.course.id))
        .limit(limit)
        .offset((page - 1) * limit),
    ]);
    const total = Number(totalRows[0]?.total ?? 0);

    // Aggregate section and lesson counts for courses on this page via group-by queries (avoiding N+1 queries)
    const ids = items.map((c) => c.id);
    const [sectionRows, lessonRows] = ids.length
      ? await Promise.all([
          this.database.db
            .select({ courseId: schema.section.courseId, total: count() })
            .from(schema.section)
            .where(inArray(schema.section.courseId, ids))
            .groupBy(schema.section.courseId),
          this.database.db
            .select({ courseId: schema.section.courseId, total: count() })
            .from(schema.lesson)
            .innerJoin(schema.section, eq(schema.section.id, schema.lesson.sectionId))
            .where(inArray(schema.section.courseId, ids))
            .groupBy(schema.section.courseId),
        ])
      : [[], []];

    const sectionCounts = new Map(sectionRows.map((r) => [r.courseId, Number(r.total)]));
    const lessonCounts = new Map(lessonRows.map((r) => [r.courseId, Number(r.total)]));

    return {
      items: items.map((c) => ({
        ...c,
        sectionCount: sectionCounts.get(c.id) ?? 0,
        lessonCount: lessonCounts.get(c.id) ?? 0,
      })),
      meta: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
    };
  }

  async getById(id: string) {
    const course = await this.findOrThrow(id);

    const sections = await this.database.db
      .select()
      .from(schema.section)
      .where(eq(schema.section.courseId, id))
      .orderBy(asc(schema.section.order));

    const sectionIds = sections.map((s) => s.id);
    const lessonRows = sectionIds.length
      ? await this.database.db
          .select({ sectionId: schema.lesson.sectionId, total: count() })
          .from(schema.lesson)
          .where(inArray(schema.lesson.sectionId, sectionIds))
          .groupBy(schema.lesson.sectionId)
      : [];
    const lessonCounts = new Map(lessonRows.map((r) => [r.sectionId, Number(r.total)]));

    return {
      ...course,
      sections: sections.map((s) => ({ ...s, lessonCount: lessonCounts.get(s.id) ?? 0 })),
    };
  }

  async create(dto: CreateCourseDto, actor: RequestUser) {
    const [created] = await this.database.db
      .insert(schema.course)
      .values({
        id: randomUUID(),
        courseKey: `course_${randomUUID()}`,
        title: dto.title,
        description: dto.description,
        level: dto.level,
        courseType: dto.courseType,
        status: ContentStatus.DRAFT,
        createdById: actor.userId,
      })
      .returning();
    return created;
  }

  async update(id: string, dto: UpdateCourseDto, actor: RequestUser) {
    const course = await this.findOrThrow(id);
    assertEditable(course.status, actor.role);

    const [updated] = await this.database.db
      .update(schema.course)
      .set({ ...dto, updatedAt: new Date() })
      .where(eq(schema.course.id, id))
      .returning();
    return updated;
  }

  async changeStatus(id: string, dto: UpdateStatusDto, actor: RequestUser) {
    return this.database.$transaction(async (tx) => {
      const rows = await tx
        .select()
        .from(schema.course)
        .where(eq(schema.course.id, id))
        .limit(1)
        .for('update');
      const course = rows[0];
      if (!course) throw new NotFoundException('Course not found');

      const next = resolveStatusChange({
        from: course.status,
        to: dto.status,
        role: actor.role,
        rejectionReason: dto.rejectionReason,
      });

      const [updated] = await tx
        .update(schema.course)
        .set({ ...next, updatedAt: new Date() })
        .where(eq(schema.course.id, id))
        .returning();
      return updated;
    });
  }

  async remove(id: string) {
    await this.database.$transaction(async (tx) => {
      // Acquire row lock to avoid race conditions with concurrent section creations
      const locked = await tx
        .select({ id: schema.course.id })
        .from(schema.course)
        .where(eq(schema.course.id, id))
        .limit(1)
        .for('update');
      if (!locked[0]) throw new NotFoundException('Course not found');

      const sections = await tx
        .select({ id: schema.section.id })
        .from(schema.section)
        .where(eq(schema.section.courseId, id))
        .limit(1);
      if (sections.length) {
        throw new ConflictException(
          'This course still has sections. Delete them first, or archive the course instead.',
        );
      }

      await tx.delete(schema.course).where(eq(schema.course.id, id));
    });
    return { deleted: true };
  }

  private async findOrThrow(id: string) {
    const rows = await this.database.db
      .select()
      .from(schema.course)
      .where(eq(schema.course.id, id))
      .limit(1);
    const course = rows[0];
    if (!course) throw new NotFoundException('Course not found');
    return course;
  }
}
