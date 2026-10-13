import { v7 as randomUUIDv7 } from 'uuid';
import { CONTENT_MANAGER_EDITABLE_STATUSES } from '../../../common/constants/content-workflow.constant.js';
import { BadRequestError, ConflictError, NotFoundError } from '../../../common/errors/app-error.js';
import { paginated } from '../../../common/http/response.js';
import type { UpdateStatusInput } from '../../../common/schemas.js';
import { assertEditable, assertSameIdSet, resolveStatusChange } from '../../../common/utils/content-workflow.util.js';
import { withTransaction, type Tx } from '../../../database/db.js';
import { ContentStatus, LessonContentType, Role } from '../../../database/drizzle/enums.js';
import type { RequestUser } from '../../auth/auth.types.js';
import type { LessonRepository } from './lesson.repository.js';
import type { AddLessonItemInput, CreateLessonInput, ListLessonQuery, UpdateLessonInput } from './lesson.schemas.js';

export function createLessonService(repo: LessonRepository) {
  async function findOrThrow(id: string) {
    const lesson = await repo.findById(id);
    if (!lesson) throw new NotFoundError('Lesson not found');
    return lesson;
  }

  async function lockLesson(tx: Tx, id: string) {
    const lesson = await repo.lockById(id, tx);
    if (!lesson) throw new NotFoundError('Lesson not found');
    return lesson;
  }

  async function loadItems(lessonId: string) {
    const items = await repo.itemsOf(lessonId);
    const pick = (f: 'wordId' | 'sentenceId' | 'conversationId') => items.flatMap((i) => (i[f] ? [i[f] as string] : []));

    const [words, sentences, conversations] = await Promise.all([
      repo.wordPreviews(pick('wordId')),
      repo.sentencePreviews(pick('sentenceId')),
      repo.conversationPreviews(pick('conversationId')),
    ]);
    const wordMap = new Map(words.map((w) => [w.id, w]));
    const sentenceMap = new Map(sentences.map((s) => [s.id, s]));
    const conversationMap = new Map(conversations.map((c) => [c.id, c]));

    return items.map((item) => {
      let preview: unknown = null;
      if (item.contentType === LessonContentType.WORD) preview = wordMap.get(item.wordId ?? '') ?? null;
      else if (item.contentType === LessonContentType.SENTENCE) preview = sentenceMap.get(item.sentenceId ?? '') ?? null;
      else preview = conversationMap.get(item.conversationId ?? '') ?? null;
      return {
        id: item.id, order: item.order, contentType: item.contentType,
        contentId: item.wordId ?? item.sentenceId ?? item.conversationId, preview,
      };
    });
  }

  async function getById(id: string) {
    const lesson = await findOrThrow(id);
    const section = await repo.sectionSummary(lesson.sectionId);
    const course = section ? await repo.courseSummary(section.courseId) : null;
    return { ...lesson, section, course, items: await loadItems(id) };
  }

  return {
    async list(q: ListLessonQuery) {
      const { rows, total } = await repo.list(q);
      const counts = await repo.itemTypeCounts(rows.map((r) => r.lesson.id));
      const empty = { words: 0, sentences: 0, conversations: 0 };
      return paginated(
        rows.map((r) => ({
          ...r.lesson, sectionTitle: r.sectionTitle, courseId: r.courseId, courseTitle: r.courseTitle,
          counts: counts.get(r.lesson.id) ?? empty,
        })),
        q.page, q.limit, total,
      );
    },

    getById,

    async create(dto: CreateLessonInput, actor: RequestUser) {
      const id = await withTransaction(async (tx) => {
        if (!(await repo.lockSection(dto.sectionId, tx))) throw new NotFoundError('Section not found');
        const maxOrder = await repo.maxOrder(dto.sectionId, tx);
        const created = await repo.insert({
          id: randomUUIDv7(), lessonKey: `lesson_${randomUUIDv7()}`, sectionId: dto.sectionId,
          title: dto.title, description: dto.description ?? '', order: maxOrder + 1,
          status: ContentStatus.DRAFT, createdById: actor.userId,
        }, tx);
        return created.id;
      });
      return getById(id);
    },

    async update(id: string, dto: UpdateLessonInput, actor: RequestUser) {
      const lesson = await findOrThrow(id);
      assertEditable(lesson.status, actor.role);
      return repo.update(id, dto);
    },

    changeStatus: (id: string, dto: UpdateStatusInput, actor: RequestUser) =>
      withTransaction(async (tx) => {
        const lesson = await lockLesson(tx, id);
        const next = resolveStatusChange({ from: lesson.status, to: dto.status, role: actor.role, rejectionReason: dto.rejectionReason });

        if (dto.status === ContentStatus.IN_REVIEW || dto.status === ContentStatus.PUBLISHED) {
          if (!(await repo.hasItems(id, tx))) throw new ConflictError('Add at least one item to the lesson first');
        }
        if (dto.status === ContentStatus.PUBLISHED) {
          const keys = await repo.unpublishedItemKeys(id, tx);
          if (keys.length) throw new ConflictError(`Publish these first: ${keys.join(', ')}`);
        }
        return repo.update(id, next, tx);
      }),

    async reorderInSection(sectionId: string, ids: string[], actor: RequestUser) {
      await withTransaction(async (tx) => {
        if (!(await repo.lockSection(sectionId, tx))) throw new NotFoundError('Section not found');

        const siblings = await repo.siblings(sectionId, tx);
        assertSameIdSet(siblings.map((l) => l.id), ids);

        if (actor.role === Role.CONTENT_MANAGER && siblings.some((l) => !CONTENT_MANAGER_EDITABLE_STATUSES.includes(l.status))) {
          throw new ConflictError('Content Manager can only reorder when all lessons are DRAFT or REJECTED');
        }
        await repo.shiftOrders(sectionId, tx);
        for (const [index, id] of ids.entries()) await repo.setOrder(id, index + 1, tx);
      });
      return repo.listBySection(sectionId);
    },

    async remove(id: string) {
      await withTransaction(async (tx) => {
        await lockLesson(tx, id);
        if (await repo.hasProgress(id, tx)) {
          throw new ConflictError('Learners have progress on this lesson. Archive it instead of deleting.');
        }
        await repo.deleteItems(id, tx);
        await repo.delete(id, tx);
      });
      return { deleted: true };
    },

    // ------------- items -------------
    async addItem(lessonId: string, dto: AddLessonItemInput, actor: RequestUser) {
      await withTransaction(async (tx) => {
        const lesson = await lockLesson(tx, lessonId);
        assertEditable(lesson.status, actor.role);

        if (!(await repo.contentExists(dto.contentType, dto.contentId, tx))) {
          throw new BadRequestError(`${dto.contentType} not found: ${dto.contentId}`);
        }
        if (await repo.hasItem(lessonId, dto.contentType, dto.contentId, tx)) {
          throw new ConflictError('This content is already in the lesson');
        }
        const maxOrder = await repo.maxItemOrder(lessonId, tx);
        await repo.insertItem({
          id: randomUUIDv7(), lessonId, contentType: dto.contentType,
          wordId: dto.contentType === LessonContentType.WORD ? dto.contentId : null,
          sentenceId: dto.contentType === LessonContentType.SENTENCE ? dto.contentId : null,
          conversationId: dto.contentType === LessonContentType.CONVERSATION ? dto.contentId : null,
          order: maxOrder + 1,
        }, tx);
        await repo.update(lessonId, {}, tx); // updatedAt
      });
      return getById(lessonId);
    },

    async removeItem(lessonId: string, itemId: string, actor: RequestUser) {
      await withTransaction(async (tx) => {
        const lesson = await lockLesson(tx, lessonId);
        assertEditable(lesson.status, actor.role);
        if (!(await repo.deleteItem(lessonId, itemId, tx))) throw new NotFoundError('Lesson item not found');
        await repo.update(lessonId, {}, tx);
      });
      return getById(lessonId);
    },

    async reorderItems(lessonId: string, ids: string[], actor: RequestUser) {
      await withTransaction(async (tx) => {
        const lesson = await lockLesson(tx, lessonId);
        assertEditable(lesson.status, actor.role);

        assertSameIdSet(await repo.itemIds(lessonId, tx), ids);
        await repo.shiftItemOrders(lessonId, tx);
        for (const [index, id] of ids.entries()) await repo.setItemOrder(id, index + 1, tx);
        await repo.update(lessonId, {}, tx);
      });
      return getById(lessonId);
    },
  };
}
export type LessonService = ReturnType<typeof createLessonService>;
