import { z } from 'zod';
import { ALLOWED_CATEGORIES } from '../../common/constants/category.constant.js';
import { paginationShape } from '../../common/schemas.js';
import { contentStatusEnum } from '../../database/drizzle/enums.js';

export const MAX_TURNS_PER_CONVERSATION = 100;

export const turnSchema = z.strictObject({
  speaker: z.string().trim().min(1).max(50),
  sentenceId: z.string().min(1),
});

export const createConversationSchema = z.strictObject({
  title: z.string().trim().min(1).max(200),
  topic: z.string().trim().min(1).max(100),
  category: z.enum(ALLOWED_CATEGORIES),
  turns: z.array(turnSchema).max(MAX_TURNS_PER_CONVERSATION).optional(),
});
export const updateConversationSchema = createConversationSchema
  .omit({ turns: true })
  .partial();
export const replaceTurnsSchema = z.strictObject({
  turns: z.array(turnSchema).max(MAX_TURNS_PER_CONVERSATION),
});

export const listConversationQuerySchema = z.strictObject({
  ...paginationShape,
  search: z.string().max(100).optional(),
  category: z.enum(ALLOWED_CATEGORIES).optional(),
  status: z.enum(contentStatusEnum.enumValues).optional(),
});

export type TurnInput = z.infer<typeof turnSchema>;
export type CreateConversationInput = z.infer<typeof createConversationSchema>;
export type UpdateConversationInput = z.infer<typeof updateConversationSchema>;
export type ReplaceTurnsInput = z.infer<typeof replaceTurnsSchema>;
export type ListConversationQuery = z.infer<typeof listConversationQuerySchema>;
