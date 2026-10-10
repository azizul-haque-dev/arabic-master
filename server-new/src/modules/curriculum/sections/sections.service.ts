import {
  ConflictException,
  ForbiddenException,
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
  max,
  or,
  sql,
  type SQL,
} from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { CONTENT_MANAGER_EDITABLE_STATUSES } from '../../../common/constants/content-workflow.constant.js';
import { UpdateStatusDto } from '../../../common/dto/update-status.dto.js';
import {
  assertEditable,
  assertSameIdSet,
  resolveStatusChange,
} from '../../../common/utils/content-workflow.util.js';
import { escapeLike } from '../../../common/utils/escape-like.util.js';
import {
  DatabaseService,
  type DatabaseTransaction,
} from '../../../database/drizzle/db.service.js';
import { ContentStatus, Role } from '../../../database/drizzle/enums.js';
import * as schema from '../../../database/drizzle/schema.js';
import type { RequestUser } from '../../auth/types/jwt-payload.type.js';
import { CreateSectionDto } from './dto/create-section.dto.js';
import { ListSectionQueryDto } from './dto/list-section-query.dto.js';
import { UpdateSectionDto } from './dto/update-section.dto.js';

@Injectable()
export class SectionsService {
  constructor(private readonly database: DatabaseService) {}

  async list(query: ListSectionQueryDto) {
    const { page, limit, courseId, status, search } = query;

    const conditions: SQL[] = [];
    if (courseId) conditions.push(eq(schema.section.courseId, courseId));
    if (status) conditions.push(eq(schema.section.status, status));
    if (search?.trim()) {
      const pattern = `%${escapeLike(search.trim())}%`;
      conditions.push(
        or(
          ilike(schema.section.title, pattern),
          ilike(schema.section.sectionKey, pattern),
        )!,
      );
    }
    const where = conditions.length ? and(...conditions) : undefined;

    const [totalRows, rows] = await Promise.all([
      this.database.db.select({ total: count() }).from(schema.section).where(where),
      this.database.db
        .select({ section: schema.section, courseTitle: schema.course.title })
        .from(schema.section)
        .leftJoin(schema.course, eq(schema.course.id, schema.section.courseId))
        .where(where)
        // When filtering by a single course, order ascending by sequence; otherwise order newest first
        .orderBy(
          courseId ? asc(schema.section.order) : desc(schema.section.createdAt),
          desc(schema.section.id),
        )
        .limit(limit)
        .offset((page - 1) * limit),
    ]);
    const total = Number(totalRows[0]?.total ?? 0);

    const ids = rows.map((r) => r.section.id);
    const lessonRows = ids.length
      ? await this.database.db
          .select({ sectionId: schema.lesson.sectionId, total: count() })
          .from(schema.lesson)
          .where(inArray(schema.lesson.sectionId, ids))
          .groupBy(schema.lesson.sectionId)
      : [];
    const lessonCounts = new Map(lessonRows.map((r) => [r.sectionId, Number(r.total)]));

    return {
      items: rows.map((r) => ({
        ...r.section,
        courseTitle: r.courseTitle,
        lessonCount: lessonCounts.get(r.section.id) ?? 0,
      })),
      meta: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
    };
  }

  async getById(id: string) {
    const section = await this.findOrThrow(id);

    const courseRows = await this.database.db
      .select({
        id: schema.course.id,
        courseKey: schema.course.courseKey,
        title: schema.course.title,
      })
      .from(schema.course)
      .where(eq(schema.course.id, section.courseId))
      .limit(1);

    const lessons = await this.database.db
      .select()
      .from(schema.lesson)
      .where(eq(schema.lesson.sectionId, id))
      .orderBy(asc(schema.lesson.order));

    const lessonIds = lessons.map((l) => l.id);
    const itemRows = lessonIds.length
      ? await this.database.db
          .select({ lessonId: schema.lessonContentItem.lessonId, total: count() })
          .from(schema.lessonContentItem)
          .where(inArray(schema.lessonContentItem.lessonId, lessonIds))
          .groupBy(schema.lessonContentItem.lessonId)
      : [];
    const itemCounts = new Map(itemRows.map((r) => [r.lessonId, Number(r.total)]));

    return {
      ...section,
      course: courseRows[0] ?? null,
      lessons: lessons.map((l) => ({ ...l, itemCount: itemCounts.get(l.id) ?? 0 })),
    };
  }

  async create(dto: CreateSectionDto, actor: RequestUser) {
    const createdId = await this.database.$transaction(async (tx) => {
      // Lock the parent course row to prevent order collisions during concurrent section creations
      await this.lockCourse(tx, dto.courseId);

      const [agg] = await tx
        .select({ maxOrder: max(schema.section.order) })
        .from(schema.section)
        .where(eq(schema.section.courseId, dto.courseId));

      const [created] = await tx
        .insert(schema.section)
        .values({
          id: randomUUID(),
          sectionKey: `section_${randomUUID()}`,
          courseId: dto.courseId,
          title: dto.title,
          description: dto.description ?? '',
          order: (agg?.maxOrder ?? 0) + 1,
          status: ContentStatus.DRAFT,
          createdById: actor.userId,
        })
        .returning();
      return created.id;
    });

    return this.getById(createdId);
  }

  async update(id: string, dto: UpdateSectionDto, actor: RequestUser) {
    const section = await this.findOrThrow(id);
    assertEditable(section.status, actor.role);

    const [updated] = await this.database.db
      .update(schema.section)
      .set({ ...dto, updatedAt: new Date() })
      .where(eq(schema.section.id, id))
      .returning();
    return updated;
  }

  async changeStatus(id: string, dto: UpdateStatusDto, actor: RequestUser) {
    return this.database.$transaction(async (tx) => {
      const rows = await tx
        .select()
        .from(schema.section)
        .where(eq(schema.section.id, id))
        .limit(1)
        .for('update');
      const section = rows[0];
      if (!section) throw new NotFoundException('Section not found');

      const next = resolveStatusChange({
        from: section.status,
        to: dto.status,
        role: actor.role,
        rejectionReason: dto.rejectionReason,
      });

      const [updated] = await tx
        .update(schema.section)
        .set({ ...next, updatedAt: new Date() })
        .where(eq(schema.section.id, id))
        .returning();
      return updated;
    });
  }

  async reorder(courseId: string, ids: string[], actor: RequestUser) {
    await this.database.$transaction(async (tx) => {
      await this.lockCourse(tx, courseId);

      const siblings = await tx
        .select({ id: schema.section.id, status: schema.section.status })
        .from(schema.section)
        .where(eq(schema.section.courseId, courseId));

      assertSameIdSet(siblings.map((s) => s.id), ids);

      // Content Managers cannot reorder live/approved content; only DRAFT and REJECTED statuses are permitted
      if (
        actor.role === Role.CONTENT_MANAGER &&
        siblings.some((s) => !CONTENT_MANAGER_EDITABLE_STATUSES.includes(s.status))
      ) {
        throw new ForbiddenException(
          'Content Manager can only reorder when all sections are DRAFT or REJECTED',
        );
      }

      // Step 1: Temporarily shift all sibling orders to negative values to avoid violating (courseId, order) unique index
      await tx
        .update(schema.section)
        .set({ order: sql`-${schema.section.order} - 1` })
        .where(eq(schema.section.courseId, courseId));

      // Step 2: Assign updated positive order sequence
      for (const [index, id] of ids.entries()) {
        await tx
          .update(schema.section)
          .set({ order: index + 1, updatedAt: new Date() })
          .where(eq(schema.section.id, id));
      }
    });

    return this.database.db
      .select()
      .from(schema.section)
      .where(eq(schema.section.courseId, courseId))
      .orderBy(asc(schema.section.order));
  }

  async remove(id: string) {
    await this.database.$transaction(async (tx) => {
      const locked = await tx
        .select({ id: schema.section.id })
        .from(schema.section)
        .where(eq(schema.section.id, id))
        .limit(1)
        .for('update');
      if (!locked[0]) throw new NotFoundException('Section not found');

      const lessons = await tx
        .select({ id: schema.lesson.id })
        .from(schema.lesson)
        .where(eq(schema.lesson.sectionId, id))
        .limit(1);
      if (lessons.length) {
        throw new ConflictException(
          'This section still has lessons. Delete them first, or archive the section instead.',
        );
      }

      await tx.delete(schema.section).where(eq(schema.section.id, id));
    });
    return { deleted: true };
  }

  private async lockCourse(tx: DatabaseTransaction, courseId: string) {
    const rows = await tx
      .select({ id: schema.course.id })
      .from(schema.course)
      .where(eq(schema.course.id, courseId))
      .limit(1)
      .for('update');
    if (!rows[0]) throw new NotFoundException('Course not found');
  }

  private async findOrThrow(id: string) {
    const rows = await this.database.db
      .select()
      .from(schema.section)
      .where(eq(schema.section.id, id))
      .limit(1);
    const section = rows[0];
    if (!section) throw new NotFoundException('Section not found');
    return section;
  }
}
