import { z } from 'zod';
import { paginationShape } from '../../../common/schemas.js';
import { contentStatusEnum, courseTypeEnum, difficultyLevelEnum } from '../../../database/drizzle/enums.js';

export const createCourseSchema = z.strictObject({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().min(1).max(1000),
  level: z.enum(difficultyLevelEnum.enumValues).optional(),
  courseType: z.enum(courseTypeEnum.enumValues).optional(),
});
export const updateCourseSchema = createCourseSchema.partial();
export const listCourseQuerySchema = z.strictObject({
  ...paginationShape,
  search: z.string().max(100).optional(),
  status: z.enum(contentStatusEnum.enumValues).optional(),
  level: z.enum(difficultyLevelEnum.enumValues).optional(),
  courseType: z.enum(courseTypeEnum.enumValues).optional(),
});
export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
export type ListCourseQuery = z.infer<typeof listCourseQuerySchema>;
