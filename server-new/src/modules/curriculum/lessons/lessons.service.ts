import {
  BadRequestException,
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
  max,
  ne,
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
import {
  ContentStatus,
  LessonContentType,
  Role,
} from '../../../database/drizzle/enums.js';
import * as schema from '../../../database/drizzle/schema.js';
import type { RequestUser } from '../../auth/types/jwt-payload.type.js';
import { AddLessonItemDto } from './dto/add-lesson-item.dto.js';
import { CreateLessonDto } from './dto/create-lesson.dto.js';
import { ListLessonQueryDto } from './dto/list-lesson-query.dto.js';
import { UpdateLessonDto } from './dto/update-lesson.dto.js';

@Injectable()
export class LessonsService {
  constructor(private readonly database: DatabaseService) {}

  // ------------- Read Operations -------------

  async list(query: ListLessonQueryDto) {
    const { page, limit, sectionId, courseId, status, search } = query;

    const conditions: SQL[] = [];
    if (sectionId) conditions.push(eq(schema.lesson.sectionId, sectionId));
    if (courseId) conditions.push(eq(schema.section.courseId, courseId));
    if (status) conditions.push(eq(schema.lesson.status, status));
    if (search?.trim()) {
      const pattern = `%${escapeLike(search.trim())}%`;
      conditions.push(
        or(
          ilike(schema.lesson.title, pattern),
          ilike(schema.lesson.lessonKey, pattern),
        )!,
      );
    }
    const where = conditions.length ? and(...conditions) : undefined;

    const [totalRows, rows] = await Promise.all([
      this.database.db
        .select({ total: count() })
        .from(schema.lesson)
        .leftJoin(schema.section, eq(schema.section.id, schema.lesson.sectionId))
        .where(where),
      this.database.db
        .select({
          lesson: schema.lesson,
          sectionTitle: schema.section.title,
          courseId: schema.section.courseId,
          courseTitle: schema.course.title,
        })
        .from(schema.lesson)
        .leftJoin(schema.section, eq(schema.section.id, schema.lesson.sectionId))
        .leftJoin(schema.course, eq(schema.course.id, schema.section.courseId))
        .where(where)
        .orderBy(
          sectionId ? asc(schema.lesson.order) : desc(schema.lesson.createdAt),
          desc(schema.lesson.id),
        )
        .limit(limit)
        .offset((page - 1) * limit),
    ]);
    const total = Number(totalRows[0]?.total ?? 0);

    // Count items by content type to support CMS summary badges (e.g., 3W * 2S * 1C)
    const ids = rows.map((r) => r.lesson.id);
    const countRows = ids.length
      ? await this.database.db
          .select({
            lessonId: schema.lessonContentItem.lessonId,
            contentType: schema.lessonContentItem.contentType,
            total: count(),
          })
          .from(schema.lessonContentItem)
          .where(inArray(schema.lessonContentItem.lessonId, ids))
          .groupBy(
            schema.lessonContentItem.lessonId,
            schema.lessonContentItem.contentType,
          )
      : [];

    const counts = new Map<string, { words: number; sentences: number; conversations: number }>();
    for (const row of countRows) {
      const entry = counts.get(row.lessonId) ?? { words: 0, sentences: 0, conversations: 0 };
      const value = Number(row.total);
      if (row.contentType === LessonContentType.WORD) entry.words = value;
      else if (row.contentType === LessonContentType.SENTENCE) entry.sentences = value;
      else entry.conversations = value;
      counts.set(row.lessonId, entry);
    }

    return {
      items: rows.map((r) => ({
        ...r.lesson,
        sectionTitle: r.sectionTitle,
        courseId: r.courseId,
        courseTitle: r.courseTitle,
        counts: counts.get(r.lesson.id) ?? { words: 0, sentences: 0, conversations: 0 },
      })),
      meta: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
    };
  }

  async getById(id: string) {
    const lesson = await this.findOrThrow(id);

    const sectionRows = await this.database.db
      .select({
        id: schema.section.id,
        sectionKey: schema.section.sectionKey,
        title: schema.section.title,
        courseId: schema.section.courseId,
      })
      .from(schema.section)
      .where(eq(schema.section.id, lesson.sectionId))
      .limit(1);
    const section = sectionRows[0] ?? null;

    const courseRows = section
      ? await this.database.db
          .select({
            id: schema.course.id,
            courseKey: schema.course.courseKey,
            title: schema.course.title,
          })
          .from(schema.course)
          .where(eq(schema.course.id, section.courseId))
          .limit(1)
      : [];

    return {
      ...lesson,
      section,
      course: courseRows[0] ?? null,
      items: await this.loadItems(id),
    };
  }

  // ------------- Lesson Write Operations -------------

  async create(dto: CreateLessonDto, actor: RequestUser) {
    const createdId = await this.database.$transaction(async (tx) => {
      const sectionRows = await tx
        .select({ id: schema.section.id })
        .from(schema.section)
        .where(eq(schema.section.id, dto.sectionId))
        .limit(1)
        .for('update'); // Lock parent section row to prevent order collisions during concurrent lesson creations
      if (!sectionRows[0]) throw new NotFoundException('Section not found');

      const [agg] = await tx
        .select({ maxOrder: max(schema.lesson.order) })
        .from(schema.lesson)
        .where(eq(schema.lesson.sectionId, dto.sectionId));

      const [created] = await tx
        .insert(schema.lesson)
        .values({
          id: randomUUID(),
          lessonKey: `lesson_${randomUUID()}`,
          sectionId: dto.sectionId,
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

  async update(id: string, dto: UpdateLessonDto, actor: RequestUser) {
    const lesson = await this.findOrThrow(id);
    assertEditable(lesson.status, actor.role);

    const [updated] = await this.database.db
      .update(schema.lesson)
      .set({ ...dto, updatedAt: new Date() })
      .where(eq(schema.lesson.id, id))
      .returning();
    return updated;
  }

  async changeStatus(id: string, dto: UpdateStatusDto, actor: RequestUser) {
    return this.database.$transaction(async (tx) => {
      const rows = await tx
        .select()
        .from(schema.lesson)
        .where(eq(schema.lesson.id, id))
        .limit(1)
        .for('update');
      const lesson = rows[0];
      if (!lesson) throw new NotFoundException('Lesson not found');

      const next = resolveStatusChange({
        from: lesson.status,
        to: dto.status,
        role: actor.role,
        rejectionReason: dto.rejectionReason,
      });

      if (dto.status === ContentStatus.IN_REVIEW || dto.status === ContentStatus.PUBLISHED) {
        await this.assertHasItems(tx, id);
      }
      if (dto.status === ContentStatus.PUBLISHED) {
        await this.assertAllItemsPublished(tx, id);
      }

      const [updated] = await tx
        .update(schema.lesson)
        .set({ ...next, updatedAt: new Date() })
        .where(eq(schema.lesson.id, id))
        .returning();
      return updated;
    });
  }

  async reorderInSection(sectionId: string, ids: string[], actor: RequestUser) {
    await this.database.$transaction(async (tx) => {
      const sectionRows = await tx
        .select({ id: schema.section.id })
        .from(schema.section)
        .where(eq(schema.section.id, sectionId))
        .limit(1)
        .for('update');
      if (!sectionRows[0]) throw new NotFoundException('Section not found');

      const siblings = await tx
        .select({ id: schema.lesson.id, status: schema.lesson.status })
        .from(schema.lesson)
        .where(eq(schema.lesson.sectionId, sectionId));

      assertSameIdSet(siblings.map((l) => l.id), ids);

      if (
        actor.role === Role.CONTENT_MANAGER &&
        siblings.some((l) => !CONTENT_MANAGER_EDITABLE_STATUSES.includes(l.status))
      ) {
        throw new ConflictException(
          'Content Manager can only reorder when all lessons are DRAFT or REJECTED',
        );
      }

      await tx
        .update(schema.lesson)
        .set({ order: sql`-${schema.lesson.order} - 1` })
        .where(eq(schema.lesson.sectionId, sectionId));

      for (const [index, id] of ids.entries()) {
        await tx
          .update(schema.lesson)
          .set({ order: index + 1, updatedAt: new Date() })
          .where(eq(schema.lesson.id, id));
      }
    });

    return this.database.db
      .select()
      .from(schema.lesson)
      .where(eq(schema.lesson.sectionId, sectionId))
      .orderBy(asc(schema.lesson.order));
  }

  async remove(id: string) {
    await this.database.$transaction(async (tx) => {
      const locked = await tx
        .select({ id: schema.lesson.id })
        .from(schema.lesson)
        .where(eq(schema.lesson.id, id))
        .limit(1)
        .for('update');
      if (!locked[0]) throw new NotFoundException('Lesson not found');

      // Prevent deletion if learners have progress recorded for this lesson to avoid orphaned progress records
      const progress = await tx
        .select({ id: schema.lessonProgress.id })
        .from(schema.lessonProgress)
        .where(eq(schema.lessonProgress.lessonId, id))
        .limit(1);
      if (progress.length) {
        throw new ConflictException(
          'Learners have progress on this lesson. Archive it instead of deleting.',
        );
      }

      await tx
        .delete(schema.lessonContentItem)
        .where(eq(schema.lessonContentItem.lessonId, id));
      await tx.delete(schema.lesson).where(eq(schema.lesson.id, id));
    });
    return { deleted: true };
  }

  // ------------- Content Item Operations -------------

  async addItem(lessonId: string, dto: AddLessonItemDto, actor: RequestUser) {
    await this.database.$transaction(async (tx) => {
      const lesson = await this.lockLesson(tx, lessonId);
      assertEditable(lesson.status, actor.role);

      await this.assertContentExists(tx, dto.contentType, dto.contentId);

      const column = this.itemColumn(dto.contentType);
      const duplicate = await tx
        .select({ id: schema.lessonContentItem.id })
        .from(schema.lessonContentItem)
        .where(
          and(
            eq(schema.lessonContentItem.lessonId, lessonId),
            eq(column, dto.contentId),
          ),
        )
        .limit(1);
      if (duplicate.length) {
        throw new ConflictException('This content is already in the lesson');
      }

      // Order is unique per lesson across all content types per the database index constraint
      const [agg] = await tx
        .select({ maxOrder: max(schema.lessonContentItem.order) })
        .from(schema.lessonContentItem)
        .where(eq(schema.lessonContentItem.lessonId, lessonId));

      await tx.insert(schema.lessonContentItem).values({
        id: randomUUID(),
        lessonId,
        contentType: dto.contentType,
        wordId: dto.contentType === LessonContentType.WORD ? dto.contentId : null,
        sentenceId: dto.contentType === LessonContentType.SENTENCE ? dto.contentId : null,
        conversationId:
          dto.contentType === LessonContentType.CONVERSATION ? dto.contentId : null,
        order: (agg?.maxOrder ?? 0) + 1,
      });

      await tx
        .update(schema.lesson)
        .set({ updatedAt: new Date() })
        .where(eq(schema.lesson.id, lessonId));
    });

    return this.getById(lessonId);
  }

  async removeItem(lessonId: string, itemId: string, actor: RequestUser) {
    await this.database.$transaction(async (tx) => {
      const lesson = await this.lockLesson(tx, lessonId);
      assertEditable(lesson.status, actor.role);

      const deleted = await tx
        .delete(schema.lessonContentItem)
        .where(
          and(
            eq(schema.lessonContentItem.id, itemId),
            eq(schema.lessonContentItem.lessonId, lessonId),
          ),
        )
        .returning({ id: schema.lessonContentItem.id });
      if (!deleted.length) throw new NotFoundException('Lesson item not found');

      await tx
        .update(schema.lesson)
        .set({ updatedAt: new Date() })
        .where(eq(schema.lesson.id, lessonId));
    });

    return this.getById(lessonId);
  }

  async reorderItems(lessonId: string, ids: string[], actor: RequestUser) {
    await this.database.$transaction(async (tx) => {
      const lesson = await this.lockLesson(tx, lessonId);
      assertEditable(lesson.status, actor.role);

      const current = await tx
        .select({ id: schema.lessonContentItem.id })
        .from(schema.lessonContentItem)
        .where(eq(schema.lessonContentItem.lessonId, lessonId));
      assertSameIdSet(current.map((i) => i.id), ids);

      await tx
        .update(schema.lessonContentItem)
        .set({ order: sql`-${schema.lessonContentItem.order} - 1` })
        .where(eq(schema.lessonContentItem.lessonId, lessonId));

      for (const [index, id] of ids.entries()) {
        await tx
          .update(schema.lessonContentItem)
          .set({ order: index + 1 })
          .where(eq(schema.lessonContentItem.id, id));
      }

      await tx
        .update(schema.lesson)
        .set({ updatedAt: new Date() })
        .where(eq(schema.lesson.id, lessonId));
    });

    return this.getById(lessonId);
  }

  // ------------- Helper Methods -------------

  private async findOrThrow(id: string) {
    const rows = await this.database.db
      .select()
      .from(schema.lesson)
      .where(eq(schema.lesson.id, id))
      .limit(1);
    const lesson = rows[0];
    if (!lesson) throw new NotFoundException('Lesson not found');
    return lesson;
  }

  private async lockLesson(tx: DatabaseTransaction, lessonId: string) {
    const rows = await tx
      .select()
      .from(schema.lesson)
      .where(eq(schema.lesson.id, lessonId))
      .limit(1)
      .for('update');
    const lesson = rows[0];
    if (!lesson) throw new NotFoundException('Lesson not found');
    return lesson;
  }

  private itemColumn(type: LessonContentType) {
    if (type === LessonContentType.WORD) return schema.lessonContentItem.wordId;
    if (type === LessonContentType.SENTENCE) return schema.lessonContentItem.sentenceId;
    return schema.lessonContentItem.conversationId;
  }

  private async assertContentExists(
    tx: DatabaseTransaction,
    type: LessonContentType,
    contentId: string,
  ) {
    let rows: { id: string }[];
    if (type === LessonContentType.WORD) {
      rows = await tx.select({ id: schema.word.id }).from(schema.word)
        .where(eq(schema.word.id, contentId)).limit(1);
    } else if (type === LessonContentType.SENTENCE) {
      rows = await tx.select({ id: schema.sentence.id }).from(schema.sentence)
        .where(eq(schema.sentence.id, contentId)).limit(1);
    } else {
      rows = await tx.select({ id: schema.conversation.id }).from(schema.conversation)
        .where(eq(schema.conversation.id, contentId)).limit(1);
    }
    if (!rows.length) {
      throw new BadRequestException(`${type} not found: ${contentId}`);
    }
  }

  // Resolve lesson items by content type and populate preview data. Uses left joins to return preview as null if referenced content was deleted.
  private async loadItems(lessonId: string) {
    const items = await this.database.db
      .select()
      .from(schema.lessonContentItem)
      .where(eq(schema.lessonContentItem.lessonId, lessonId))
      .orderBy(asc(schema.lessonContentItem.order));

    const wordIds = items.flatMap((i) => (i.wordId ? [i.wordId] : []));
    const sentenceIds = items.flatMap((i) => (i.sentenceId ? [i.sentenceId] : []));
    const conversationIds = items.flatMap((i) => (i.conversationId ? [i.conversationId] : []));

    const words = wordIds.length
      ? await this.database.db
          .select({
            id: schema.word.id,
            key: schema.word.wordKey,
            meaningEn: schema.word.meaningEn,
            meaningBn: schema.word.meaningBn,
            status: schema.word.status,
            arabicText: schema.arabicEntity.arabicText,
          })
          .from(schema.word)
          .leftJoin(schema.arabicEntity, eq(schema.arabicEntity.id, schema.word.entityId))
          .where(inArray(schema.word.id, wordIds))
      : [];

    const sentences = sentenceIds.length
      ? await this.database.db
          .select({
            id: schema.sentence.id,
            key: schema.sentence.sentenceKey,
            meaningEn: schema.sentence.meaningEn,
            meaningBn: schema.sentence.meaningBn,
            status: schema.sentence.status,
            arabicText: schema.arabicEntity.arabicText,
          })
          .from(schema.sentence)
          .leftJoin(schema.arabicEntity, eq(schema.arabicEntity.id, schema.sentence.entityId))
          .where(inArray(schema.sentence.id, sentenceIds))
      : [];

    const conversations = conversationIds.length
      ? await this.database.db
          .select({
            id: schema.conversation.id,
            key: schema.conversation.conversationKey,
            title: schema.conversation.title,
            status: schema.conversation.status,
          })
          .from(schema.conversation)
          .where(inArray(schema.conversation.id, conversationIds))
      : [];

    const wordMap = new Map(words.map((w) => [w.id, w]));
    const sentenceMap = new Map(sentences.map((s) => [s.id, s]));
    const conversationMap = new Map(conversations.map((c) => [c.id, c]));

    return items.map((item) => {
      const contentId = item.wordId ?? item.sentenceId ?? item.conversationId;
      let preview: unknown = null;
      if (item.contentType === LessonContentType.WORD) {
        preview = wordMap.get(item.wordId ?? '') ?? null;
      } else if (item.contentType === LessonContentType.SENTENCE) {
        preview = sentenceMap.get(item.sentenceId ?? '') ?? null;
      } else {
        preview = conversationMap.get(item.conversationId ?? '') ?? null;
      }
      return {
        id: item.id,
        order: item.order,
        contentType: item.contentType,
        contentId,
        preview,
      };
    });
  }

  private async assertHasItems(tx: DatabaseTransaction, lessonId: string) {
    const rows = await tx
      .select({ id: schema.lessonContentItem.id })
      .from(schema.lessonContentItem)
      .where(eq(schema.lessonContentItem.lessonId, lessonId))
      .limit(1);
    if (!rows.length) {
      throw new ConflictException('Add at least one item to the lesson first');
    }
  }

  // Ensure all referenced words, sentences, and conversations are published before publishing the lesson
  private async assertAllItemsPublished(tx: DatabaseTransaction, lessonId: string) {
    const words = await tx
      .select({ key: schema.word.wordKey })
      .from(schema.lessonContentItem)
      .innerJoin(schema.word, eq(schema.word.id, schema.lessonContentItem.wordId))
      .where(
        and(
          eq(schema.lessonContentItem.lessonId, lessonId),
          ne(schema.word.status, ContentStatus.PUBLISHED),
        ),
      );
    const sentences = await tx
      .select({ key: schema.sentence.sentenceKey })
      .from(schema.lessonContentItem)
      .innerJoin(schema.sentence, eq(schema.sentence.id, schema.lessonContentItem.sentenceId))
      .where(
        and(
          eq(schema.lessonContentItem.lessonId, lessonId),
          ne(schema.sentence.status, ContentStatus.PUBLISHED),
        ),
      );
    const conversations = await tx
      .select({ key: schema.conversation.conversationKey })
      .from(schema.lessonContentItem)
      .innerJoin(
        schema.conversation,
        eq(schema.conversation.id, schema.lessonContentItem.conversationId),
      )
      .where(
        and(
          eq(schema.lessonContentItem.lessonId, lessonId),
          ne(schema.conversation.status, ContentStatus.PUBLISHED),
        ),
      );

    const keys = [...words, ...sentences, ...conversations].map((r) => r.key);
    if (keys.length) {
      throw new ConflictException(`Publish these first: ${keys.join(', ')}`);
    }
  }
}
