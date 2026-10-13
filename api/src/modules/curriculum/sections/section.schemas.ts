import { z } from 'zod';
import { paginationShape } from '../../../common/schemas.js';
import { contentStatusEnum } from '../../../database/drizzle/enums.js';

export const createSectionSchema = z.strictObject({
  courseId: z.string().min(1),
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(1000).optional(), // DB-তে NOT NULL, service '' দেয়
});
// section এক course থেকে অন্য course-এ যায় না, তাই courseId বাদ
export const updateSectionSchema = createSectionSchema.omit({ courseId: true }).partial();
export const listSectionQuerySchema = z.strictObject({
  ...paginationShape,
  courseId: z.string().optional(),
  search: z.string().max(100).optional(),
  status: z.enum(contentStatusEnum.enumValues).optional(),
});

export type CreateSectionInput = z.infer<typeof createSectionSchema>;
export type UpdateSectionInput = z.infer<typeof updateSectionSchema>;
export type ListSectionQuery = z.infer<typeof listSectionQuerySchema>;
