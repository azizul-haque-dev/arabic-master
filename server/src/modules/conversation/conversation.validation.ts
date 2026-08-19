import { PAGINATION } from "@/shared/constants.js";
import { z } from "zod";

// Each entry is one line of dialogue, referencing an existing Sentence.
const conversationLineSchema = z.object({
  sentenceId: z.string().min(1),
  speaker: z.string().trim().min(1).max(50),
  position: z.coerce.number().int().nonnegative(),
  meaningEn: z.string().trim().optional(),
  meaningBn: z.string().trim().optional(),
});

export const createConversationSchema = z.object({
  topicConversationId: z.string().min(1),
  lines: z
    .array(conversationLineSchema)
    .min(1, "At least one line is required"),
});

// On update, `lines` (if provided) fully replaces the existing set - same
// replace-all-then-recreate approach sentence.repository.ts uses for categories.
export const updateConversationSchema = z.object({
  topicConversationId: z.string().min(1).optional(),
  lines: z.array(conversationLineSchema).optional(),
});

export const conversationIdParamSchema = z.object({
  id: z.string().min(1),
});

export const listConversationsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(PAGINATION.DEFAULT_PAGE),
  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(PAGINATION.MAX_LIMIT)
    .default(PAGINATION.DEFAULT_LIMIT),
  topicConversationId: z.string().optional(),
});

export type CreateConversationInput = z.infer<typeof createConversationSchema>;
export type UpdateConversationInput = z.infer<typeof updateConversationSchema>;
export type ListConversationsQuery = z.infer<
  typeof listConversationsQuerySchema
>;
