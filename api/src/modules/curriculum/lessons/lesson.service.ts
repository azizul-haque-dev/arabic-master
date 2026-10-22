import { v7 as randomUUIDv7 } from 'uuid';
import { CONTENT_MANAGER_EDITABLE_STATUSES } from '../../../common/constants/content-workflow.constant.js';
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from '../../../common/errors/app-error.js';
import { paginated } from '../../../common/http/response.js';
import type { UpdateStatusInput } from '../../../common/schemas.js';
import {
  assertEditable,
  assertSameIdSet,
  resolveStatusChange,
} from '../../../common/utils/content-workflow.util.js';
import { withTransaction, type Tx } from '../../../database/db.js';
import {
  ContentStatus,
  LessonContentType,
  Role,
} from '../../../database/drizzle/enums.js';
import type { RequestUser } from '../../auth/auth.types.js';
import { LessonRepository } from './lesson.repository.js';
import type {
  AddLessonItemInput,
  CreateLessonInput,
  ListLessonQuery,
  UpdateLessonInput,
} from './lesson.schemas.js';

async function findOrThrow(id: string) {
  const lesson = await LessonRepository.findById(id);
  if (!lesson) throw new NotFoundError('Lesson not found');
  return lesson;
}

async function lockLesson(tx: Tx, id: string) {
  const lesson = await LessonRepository.lockById(id, tx);
  if (!lesson) throw new NotFoundError('Lesson not found');
  return lesson;
}

async function loadItems(lessonId: string) {
  const items = await LessonRepository.itemsOf(lessonId);
  const pick = (f: 'wordId' | 'sentenceId' | 'conversationId') =>
    items.flatMap((i) => (i[f] ? [i[f] as string] : []));

  const [words, sentences, conversations] = await Promise.all([
    LessonRepository.wordPreviews(pick('wordId')),
    LessonRepository.sentencePreviews(pick('sentenceId')),
    LessonRepository.conversationPreviews(pick('conversationId')),
  ]);
  const wordMap = new Map(words.map((w) => [w.id, w]));
  const sentenceMap = new Map(sentences.map((s) => [s.id, s]));
  const conversationMap = new Map(conversations.map((c) => [c.id, c]));

  return items.map((item) => {
    let preview: unknown = null;
    if (item.contentType === LessonContentType.WORD)
      preview = wordMap.get(item.wordId ?? '') ?? null;
    else if (item.contentType === LessonContentType.SENTENCE)
      preview = sentenceMap.get(item.sentenceId ?? '') ?? null;
    else preview = conversationMap.get(item.conversationId ?? '') ?? null;
    return {
      id: item.id,
      order: item.order,
      contentType: item.contentType,
      contentId: item.wordId ?? item.sentenceId ?? item.conversationId,
      preview,
    };
  });
}

async function getById(id: string) {
  const lesson = await findOrThrow(id);
  const section = await LessonRepository.sectionSummary(lesson.sectionId);
  const course = section ? await LessonRepository.courseSummary(section.courseId) : null;
  return { ...lesson, section, course, items: await loadItems(id) };
}

export const LessonService = {
  async list(q: ListLessonQuery) {
    const { rows, total } = await LessonRepository.list(q);
    const counts = await LessonRepository.itemTypeCounts(
      rows.map((r) => r.lesson.id),
    );
    const empty = { words: 0, sentences: 0, conversations: 0 };
    return paginated(
      rows.map((r) => ({
        ...r.lesson,
        sectionTitle: r.sectionTitle,
        courseId: r.courseId,
        courseTitle: r.courseTitle,
        counts: counts.get(r.lesson.id) ?? empty,
      })),
      q.page,
      q.limit,
      total,
    );
  },

  getById,

  async create(dto: CreateLessonInput, actor: RequestUser) {
    const id = await withTransaction(async (tx) => {
      if (!(await LessonRepository.lockSection(dto.sectionId, tx)))
        throw new NotFoundError('Section not found');
      const maxOrder = await LessonRepository.maxOrder(dto.sectionId, tx);
      const lessonKey = await LessonRepository.generateNextLessonKey(tx);
      const created = await LessonRepository.insert(
        {
          id: randomUUIDv7(),
          lessonKey,
          sectionId: dto.sectionId,
          title: dto.title,
          description: dto.description ?? '',
          order: maxOrder + 1,
          status: ContentStatus.DRAFT,
          createdById: actor.userId,
        },
        tx,
      );
      return created.id;
    });
    return getById(id);
  },

  async update(id: string, dto: UpdateLessonInput, actor: RequestUser) {
    const lesson = await findOrThrow(id);
    assertEditable(lesson.status, actor.role);
    return LessonRepository.update(id, dto);
  },

  changeStatus: (id: string, dto: UpdateStatusInput, actor: RequestUser) =>
    withTransaction(async (tx) => {
      const lesson = await lockLesson(tx, id);
      const next = resolveStatusChange({
        from: lesson.status,
        to: dto.status,
        role: actor.role,
        rejectionReason: dto.rejectionReason,
      });

      if (
        dto.status === ContentStatus.IN_REVIEW ||
        dto.status === ContentStatus.PUBLISHED
      ) {
        if (!(await LessonRepository.hasItems(id, tx)))
          throw new ConflictError(
            'Add at least one item to the lesson first',
          );
      }
      if (dto.status === ContentStatus.PUBLISHED) {
        const keys = await LessonRepository.unpublishedItemKeys(id, tx);
        if (keys.length)
          throw new ConflictError(`Publish these first: ${keys.join(', ')}`);
      }
      return LessonRepository.update(id, next, tx);
    }),

  async reorderInSection(
    sectionId: string,
    ids: string[],
    actor: RequestUser,
  ) {
    await withTransaction(async (tx) => {
      if (!(await LessonRepository.lockSection(sectionId, tx)))
        throw new NotFoundError('Section not found');

      const siblings = await LessonRepository.siblings(sectionId, tx);
      assertSameIdSet(
        siblings.map((l) => l.id),
        ids,
      );

      if (
        actor.role === Role.CONTENT_MANAGER &&
        siblings.some(
          (l) => !CONTENT_MANAGER_EDITABLE_STATUSES.includes(l.status),
        )
      ) {
        throw new ConflictError(
          'Content Manager can only reorder when all lessons are DRAFT or REJECTED',
        );
      }
      await LessonRepository.shiftOrders(sectionId, tx);
      for (const [index, id] of ids.entries())
        await LessonRepository.setOrder(id, index + 1, tx);
    });
    return LessonRepository.listBySection(sectionId);
  },

  async remove(id: string) {
    await withTransaction(async (tx) => {
      await lockLesson(tx, id);
      if (await LessonRepository.hasProgress(id, tx)) {
        throw new ConflictError(
          'Learners have progress on this lesson. Archive it instead of deleting.',
        );
      }
      await LessonRepository.deleteItems(id, tx);
      await LessonRepository.delete(id, tx);
    });
    return { deleted: true };
  },

  // ------------- items -------------
  async addItem(
    lessonId: string,
    dto: AddLessonItemInput,
    actor: RequestUser,
  ) {
    await withTransaction(async (tx) => {
      const lesson = await lockLesson(tx, lessonId);
      assertEditable(lesson.status, actor.role);

      if (!(await LessonRepository.contentExists(dto.contentType, dto.contentId, tx))) {
        throw new BadRequestError(
          `${dto.contentType} not found: ${dto.contentId}`,
        );
      }
      if (await LessonRepository.hasItem(lessonId, dto.contentType, dto.contentId, tx)) {
        throw new ConflictError('This content is already in the lesson');
      }
      const maxOrder = await LessonRepository.maxItemOrder(lessonId, tx);
      await LessonRepository.insertItem(
        {
          id: randomUUIDv7(),
          lessonId,
          contentType: dto.contentType,
          wordId:
            dto.contentType === LessonContentType.WORD ? dto.contentId : null,
          sentenceId:
            dto.contentType === LessonContentType.SENTENCE
              ? dto.contentId
              : null,
          conversationId:
            dto.contentType === LessonContentType.CONVERSATION
              ? dto.contentId
              : null,
          order: maxOrder + 1,
        },
        tx,
      );
      await LessonRepository.update(lessonId, {}, tx); // updatedAt
    });
    return getById(lessonId);
  },

  async removeItem(lessonId: string, itemId: string, actor: RequestUser) {
    await withTransaction(async (tx) => {
      const lesson = await lockLesson(tx, lessonId);
      assertEditable(lesson.status, actor.role);
      if (!(await LessonRepository.deleteItem(lessonId, itemId, tx)))
        throw new NotFoundError('Lesson item not found');
      await LessonRepository.update(lessonId, {}, tx);
    });
    return getById(lessonId);
  },

  async reorderItems(lessonId: string, ids: string[], actor: RequestUser) {
    await withTransaction(async (tx) => {
      const lesson = await lockLesson(tx, lessonId);
      assertEditable(lesson.status, actor.role);

      assertSameIdSet(await LessonRepository.itemIds(lessonId, tx), ids);
      await LessonRepository.shiftItemOrders(lessonId, tx);
      for (const [index, id] of ids.entries())
        await LessonRepository.setItemOrder(id, index + 1, tx);
      await LessonRepository.update(lessonId, {}, tx);
    });
    return getById(lessonId);
  },
};

export type LessonService = typeof LessonService;
