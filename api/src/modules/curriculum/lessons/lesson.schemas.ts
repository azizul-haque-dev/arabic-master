import { z } from 'zod';
import { paginationShape } from '../../../common/schemas.js';
import { contentStatusEnum, lessonContentTypeEnum } from '../../../database/drizzle/enums.js';

export const createLessonSchema = z.strictObject({
  sectionId: z.string().min(1),
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(1000).optional(), // DB-তে NOT NULL, service '' দেয়
});
// lesson এক section থেকে অন্য section-এ যায় না, তাই sectionId বাদ
export const updateLessonSchema = createLessonSchema.omit({ sectionId: true }).partial();
export const listLessonQuerySchema = z.strictObject({
  ...paginationShape,
  sectionId: z.string().optional(),
  courseId: z.string().optional(),
  search: z.string().max(100).optional(),
  status: z.enum(contentStatusEnum.enumValues).optional(),
});
export const addLessonItemSchema = z.strictObject({
  contentType: z.enum(lessonContentTypeEnum.enumValues),
  contentId: z.string().min(1), // Word / Sentence / Conversation-এর id
});
export const itemParamSchema = z.strictObject({ id: z.string().min(1), itemId: z.string().min(1) });

export type CreateLessonInput = z.infer<typeof createLessonSchema>;
export type UpdateLessonInput = z.infer<typeof updateLessonSchema>;
export type ListLessonQuery = z.infer<typeof listLessonQuerySchema>;
export type AddLessonItemInput = z.infer<typeof addLessonItemSchema>;
export type ItemParam = z.infer<typeof itemParamSchema>;
