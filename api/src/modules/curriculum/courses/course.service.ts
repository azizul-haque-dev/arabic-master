import { v7 as randomUUIDv7 } from 'uuid';
import {
  ConflictError,
  NotFoundError,
} from '../../../common/errors/app-error.js';
import { paginated } from '../../../common/http/response.js';
import type { UpdateStatusInput } from '../../../common/schemas.js';
import {
  assertEditable,
  resolveStatusChange,
} from '../../../common/utils/content-workflow.util.js';
import { withTransaction } from '../../../database/db.js';
import { ContentStatus } from '../../../database/drizzle/enums.js';
import type { RequestUser } from '../../auth/auth.types.js';
import type { CourseRepository } from './course.repository.js';
import type {
  CreateCourseInput,
  ListCourseQuery,
  UpdateCourseInput,
} from './course.schemas.js';

export function createCourseService(repo: CourseRepository) {
  async function findOrThrow(id: string) {
    const course = await repo.findById(id);
    if (!course) throw new NotFoundError('Course not found');
    return course;
  }

  return {
    async list(q: ListCourseQuery) {
      const { items, total } = await repo.list(q);
      const ids = items.map((c) => c.id);
      const [sections, lessons] = ids.length
        ? await Promise.all([
            repo.sectionCounts(ids),
            repo.lessonCountsByCourse(ids),
          ])
        : [new Map<string, number>(), new Map<string, number>()];
      return paginated(
        items.map((c) => ({
          ...c,
          sectionCount: sections.get(c.id) ?? 0,
          lessonCount: lessons.get(c.id) ?? 0,
        })),
        q.page,
        q.limit,
        total,
      );
    },

    async getById(id: string) {
      const course = await findOrThrow(id);
      const sections = await repo.sectionsOf(id);
      const counts = await repo.lessonCountsBySection(
        sections.map((s) => s.id),
      );
      return {
        ...course,
        sections: sections.map((s) => ({
          ...s,
          lessonCount: counts.get(s.id) ?? 0,
        })),
      };
    },

    create: (dto: CreateCourseInput, actor: RequestUser) =>
      repo.insert({
        id: randomUUIDv7(),
        courseKey: `course_${randomUUIDv7()}`,
        ...dto,
        status: ContentStatus.DRAFT,
        createdById: actor.userId,
      }),

    async update(id: string, dto: UpdateCourseInput, actor: RequestUser) {
      const course = await findOrThrow(id);
      assertEditable(course.status, actor.role);
      return repo.update(id, dto);
    },

    changeStatus: (id: string, dto: UpdateStatusInput, actor: RequestUser) =>
      withTransaction(async (tx) => {
        const course = await repo.lockById(id, tx);
        if (!course) throw new NotFoundError('Course not found');
        const next = resolveStatusChange({
          from: course.status,
          to: dto.status,
          role: actor.role,
          rejectionReason: dto.rejectionReason,
        });
        return repo.update(id, next, tx);
      }),

    async remove(id: string) {
      await withTransaction(async (tx) => {
        if (!(await repo.lockById(id, tx)))
          throw new NotFoundError('Course not found');
        if (await repo.hasSections(id, tx)) {
          throw new ConflictError(
            'This course still has sections. Delete them first, or archive the course instead.',
          );
        }
        await repo.delete(id, tx);
      });
      return { deleted: true };
    },
  };
}
export type CourseService = ReturnType<typeof createCourseService>;
