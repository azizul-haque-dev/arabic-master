import { PAGINATION } from "@/shared/constants.js";
import { z } from "zod";

const baseFields = {
  speaker: z.string().trim().min(1).max(50),
  position: z.coerce.number().int().nonnegative(),
  meaningEn: z.string().trim().optional(),
  meaningBn: z.string().trim().optional(),
};

// Exactly one of sentenceId / text must be provided - sentenceId reuses an
// existing sentence directly, text triggers the find-or-create-via-AI flow.
export const createConversationLineSchema = z
  .object({
    conversationId: z.string().min(1),
    sentenceId: z.string().min(1).optional(),
    text: z.string().trim().min(1).optional(),
    ...baseFields,
  })
  .refine((data) => Boolean(data.sentenceId) !== Boolean(data.text), {
    message: "Provide exactly one of sentenceId or text",
    path: ["sentenceId"],
  });

export const updateConversationLineSchema = z
  .object({
    sentenceId: z.string().min(1).optional(),
    text: z.string().trim().min(1).optional(),
    speaker: baseFields.speaker.optional(),
    position: baseFields.position.optional(),
    meaningEn: baseFields.meaningEn,
    meaningBn: baseFields.meaningBn,
  })
  .refine((data) => !(data.sentenceId && data.text), {
    message: "Provide only one of sentenceId or text, not both",
    path: ["sentenceId"],
  });

export const conversationLineIdParamSchema = z.object({
  id: z.string().min(1),
});

export const listConversationLinesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(PAGINATION.DEFAULT_PAGE),
  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(PAGINATION.MAX_LIMIT)
    .default(PAGINATION.DEFAULT_LIMIT),
  conversationId: z.string().optional(),
});

export type CreateConversationLineInput = z.infer<
  typeof createConversationLineSchema
>;
export type UpdateConversationLineInput = z.infer<
  typeof updateConversationLineSchema
>;
export type ListConversationLinesQuery = z.infer<
  typeof listConversationLinesQuerySchema
>;
