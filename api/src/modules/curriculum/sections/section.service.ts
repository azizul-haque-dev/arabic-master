import { v7 as randomUUIDv7 } from 'uuid';
import { CONTENT_MANAGER_EDITABLE_STATUSES } from '../../../common/constants/content-workflow.constant.js';
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from '../../../common/errors/app-error.js';
import { paginated } from '../../../common/http/response.js';
import type { UpdateStatusInput } from '../../../common/schemas.js';
import {
  assertEditable,
  assertSameIdSet,
  resolveStatusChange,
} from '../../../common/utils/content-workflow.util.js';
import { withTransaction } from '../../../database/db.js';
import { ContentStatus, Role } from '../../../database/drizzle/enums.js';
import type { RequestUser } from '../../auth/auth.types.js';
import { SectionRepository } from './section.repository.js';
import type {
  CreateSectionInput,
  ListSectionQuery,
  UpdateSectionInput,
} from './section.schemas.js';

async function findOrThrow(id: string) {
  const section = await SectionRepository.findById(id);
  if (!section) throw new NotFoundError('Section not found');
  return section;
}

async function getById(id: string) {
  const section = await findOrThrow(id);
  const [course, lessons] = await Promise.all([
    SectionRepository.courseSummary(section.courseId),
    SectionRepository.lessonsOf(id),
  ]);
  const itemCounts = await SectionRepository.itemCountsByLesson(
    lessons.map((l) => l.id),
  );
  return {
    ...section,
    course,
    lessons: lessons.map((l) => ({
      ...l,
      itemCount: itemCounts.get(l.id) ?? 0,
    })),
  };
}

export const SectionService = {
  async list(q: ListSectionQuery) {
    const { rows, total } = await SectionRepository.list(q);
    const counts = await SectionRepository.lessonCounts(
      rows.map((r) => r.section.id),
    );
    return paginated(
      rows.map((r) => ({
        ...r.section,
        courseTitle: r.courseTitle,
        lessonCount: counts.get(r.section.id) ?? 0,
      })),
      q.page,
      q.limit,
      total,
    );
  },

  getById,

  async create(dto: CreateSectionInput, actor: RequestUser) {
    const id = await withTransaction(async (tx) => {
      if (!(await SectionRepository.lockCourse(dto.courseId, tx)))
        throw new NotFoundError('Course not found');
      const maxOrder = await SectionRepository.maxOrder(dto.courseId, tx);
      const sectionKey = await SectionRepository.generateNextSectionKey(tx);
      const created = await SectionRepository.insert(
        {
          id: randomUUIDv7(),
          sectionKey,
          courseId: dto.courseId,
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

  async update(id: string, dto: UpdateSectionInput, actor: RequestUser) {
    const section = await findOrThrow(id);
    assertEditable(section.status, actor.role);
    return SectionRepository.update(id, dto);
  },

  changeStatus: (id: string, dto: UpdateStatusInput, actor: RequestUser) =>
    withTransaction(async (tx) => {
      const section = await SectionRepository.lockById(id, tx);
      if (!section) throw new NotFoundError('Section not found');
      const next = resolveStatusChange({
        from: section.status,
        to: dto.status,
        role: actor.role,
        rejectionReason: dto.rejectionReason,
      });
      return SectionRepository.update(id, next, tx);
    }),

  async reorder(courseId: string, ids: string[], actor: RequestUser) {
    await withTransaction(async (tx) => {
      if (!(await SectionRepository.lockCourse(courseId, tx)))
        throw new NotFoundError('Course not found');

      const siblings = await SectionRepository.siblings(courseId, tx);
      assertSameIdSet(
        siblings.map((s) => s.id),
        ids,
      );

      if (
        actor.role === Role.CONTENT_MANAGER &&
        siblings.some(
          (s) => !CONTENT_MANAGER_EDITABLE_STATUSES.includes(s.status),
        )
      ) {
        throw new ForbiddenError(
          'Content Manager can only reorder when all sections are DRAFT or REJECTED',
        );
      }

      await SectionRepository.shiftOrders(courseId, tx);
      for (const [index, id] of ids.entries())
        await SectionRepository.setOrder(id, index + 1, tx);
    });
    return SectionRepository.listByCourse(courseId);
  },

  async remove(id: string) {
    await withTransaction(async (tx) => {
      if (!(await SectionRepository.lockById(id, tx)))
        throw new NotFoundError('Section not found');
      if (await SectionRepository.hasLessons(id, tx)) {
        throw new ConflictError(
          'This section still has lessons. Delete them first, or archive the section instead.',
        );
      }
      await SectionRepository.delete(id, tx);
    });
    return { deleted: true };
  },
};

export type SectionService = typeof SectionService;
