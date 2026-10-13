import { v7 as randomUUIDv7 } from 'uuid';
import { CONTENT_MANAGER_EDITABLE_STATUSES } from '../../../common/constants/content-workflow.constant.js';
import { ConflictError, ForbiddenError, NotFoundError } from '../../../common/errors/app-error.js';
import { paginated } from '../../../common/http/response.js';
import type { UpdateStatusInput } from '../../../common/schemas.js';
import { assertEditable, assertSameIdSet, resolveStatusChange } from '../../../common/utils/content-workflow.util.js';
import { withTransaction } from '../../../database/db.js';
import { ContentStatus, Role } from '../../../database/drizzle/enums.js';
import type { RequestUser } from '../../auth/auth.types.js';
import type { SectionRepository } from './section.repository.js';
import type { CreateSectionInput, ListSectionQuery, UpdateSectionInput } from './section.schemas.js';

export function createSectionService(repo: SectionRepository) {
  async function findOrThrow(id: string) {
    const section = await repo.findById(id);
    if (!section) throw new NotFoundError('Section not found');
    return section;
  }

  async function getById(id: string) {
    const section = await findOrThrow(id);
    const [course, lessons] = await Promise.all([repo.courseSummary(section.courseId), repo.lessonsOf(id)]);
    const itemCounts = await repo.itemCountsByLesson(lessons.map((l) => l.id));
    return { ...section, course, lessons: lessons.map((l) => ({ ...l, itemCount: itemCounts.get(l.id) ?? 0 })) };
  }

  return {
    async list(q: ListSectionQuery) {
      const { rows, total } = await repo.list(q);
      const counts = await repo.lessonCounts(rows.map((r) => r.section.id));
      return paginated(
        rows.map((r) => ({ ...r.section, courseTitle: r.courseTitle, lessonCount: counts.get(r.section.id) ?? 0 })),
        q.page, q.limit, total,
      );
    },

    getById,

    async create(dto: CreateSectionInput, actor: RequestUser) {
      const id = await withTransaction(async (tx) => {
        if (!(await repo.lockCourse(dto.courseId, tx))) throw new NotFoundError('Course not found');
        const maxOrder = await repo.maxOrder(dto.courseId, tx);
        const created = await repo.insert({
          id: randomUUIDv7(), sectionKey: `section_${randomUUIDv7()}`, courseId: dto.courseId,
          title: dto.title, description: dto.description ?? '', order: maxOrder + 1,
          status: ContentStatus.DRAFT, createdById: actor.userId,
        }, tx);
        return created.id;
      });
      return getById(id);
    },

    async update(id: string, dto: UpdateSectionInput, actor: RequestUser) {
      const section = await findOrThrow(id);
      assertEditable(section.status, actor.role);
      return repo.update(id, dto);
    },

    changeStatus: (id: string, dto: UpdateStatusInput, actor: RequestUser) =>
      withTransaction(async (tx) => {
        const section = await repo.lockById(id, tx);
        if (!section) throw new NotFoundError('Section not found');
        const next = resolveStatusChange({ from: section.status, to: dto.status, role: actor.role, rejectionReason: dto.rejectionReason });
        return repo.update(id, next, tx);
      }),

    async reorder(courseId: string, ids: string[], actor: RequestUser) {
      await withTransaction(async (tx) => {
        if (!(await repo.lockCourse(courseId, tx))) throw new NotFoundError('Course not found');

        const siblings = await repo.siblings(courseId, tx);
        assertSameIdSet(siblings.map((s) => s.id), ids);

        if (actor.role === Role.CONTENT_MANAGER && siblings.some((s) => !CONTENT_MANAGER_EDITABLE_STATUSES.includes(s.status))) {
          throw new ForbiddenError('Content Manager can only reorder when all sections are DRAFT or REJECTED');
        }

        await repo.shiftOrders(courseId, tx);
        for (const [index, id] of ids.entries()) await repo.setOrder(id, index + 1, tx);
      });
      return repo.listByCourse(courseId);
    },

    async remove(id: string) {
      await withTransaction(async (tx) => {
        if (!(await repo.lockById(id, tx))) throw new NotFoundError('Section not found');
        if (await repo.hasLessons(id, tx)) {
          throw new ConflictError('This section still has lessons. Delete them first, or archive the section instead.');
        }
        await repo.delete(id, tx);
      });
      return { deleted: true };
    },
  };
}
export type SectionService = ReturnType<typeof createSectionService>;
