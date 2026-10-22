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
import { CourseRepository } from './course.repository.js';
import type {
  CreateCourseInput,
  ListCourseQuery,
  UpdateCourseInput,
} from './course.schemas.js';

async function findOrThrow(id: string) {
  const course = await CourseRepository.findById(id);
  if (!course) throw new NotFoundError('Course not found');
  return course;
}

export const CourseService = {
  async list(q: ListCourseQuery) {
    const { items, total } = await CourseRepository.list(q);
    const ids = items.map((c) => c.id);
    const [sections, lessons] = ids.length
      ? await Promise.all([
          CourseRepository.sectionCounts(ids),
          CourseRepository.lessonCountsByCourse(ids),
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
    const sections = await CourseRepository.sectionsOf(id);
    const counts = await CourseRepository.lessonCountsBySection(
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

  create: async (dto: CreateCourseInput, actor: RequestUser) => {
    let attempts = 0;
    while (attempts < 5) {
      try {
        const courseKey = await CourseRepository.generateNextCourseKey(attempts);
        return await CourseRepository.insert({
          id: randomUUIDv7(),
          courseKey,
          ...dto,
          status: ContentStatus.DRAFT,
          createdById: actor.userId,
        });
      } catch (err: unknown) {
        const pgErr = err as { code?: string; constraint?: string };
        if (pgErr?.code === '23505' && pgErr?.constraint?.includes('courseKey')) {
          attempts++;
          continue;
        }
        throw err;
      }
    }
    throw new Error('Failed to generate unique courseKey after 5 attempts');
  },

  async update(id: string, dto: UpdateCourseInput, actor: RequestUser) {
    const course = await findOrThrow(id);
    assertEditable(course.status, actor.role);
    return CourseRepository.update(id, dto);
  },

  changeStatus: (id: string, dto: UpdateStatusInput, actor: RequestUser) =>
    withTransaction(async (tx) => {
      const course = await CourseRepository.lockById(id, tx);
      if (!course) throw new NotFoundError('Course not found');
      const next = resolveStatusChange({
        from: course.status,
        to: dto.status,
        role: actor.role,
        rejectionReason: dto.rejectionReason,
      });
      return CourseRepository.update(id, next, tx);
    }),

  async remove(id: string) {
    await withTransaction(async (tx) => {
      if (!(await CourseRepository.lockById(id, tx)))
        throw new NotFoundError('Course not found');
      if (await CourseRepository.hasSections(id, tx)) {
        throw new ConflictError(
          'This course still has sections. Delete them first, or archive the course instead.',
        );
      }
      await CourseRepository.delete(id, tx);
    });
    return { deleted: true };
  },
};

export type CourseService = typeof CourseService;
