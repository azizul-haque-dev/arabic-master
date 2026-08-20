import { PAGINATION, VALIDATION } from "@/shared/constants.js";
import { z } from "zod";

// Each entry links an existing Word into the sentence at a given position.
const sentenceWordSchema = z.object({
  wordId: z.string().min(1),
  position: z.coerce.number().int().nonnegative(),
});

export const createSentenceSchema = z.object({
  text: z.string().trim().min(VALIDATION.ARABIC_TEXT.MIN_LENGTH, "Arabic text is required"),
  audioUrl: z.string().url().optional(),

  meaningEn: z.string().trim().optional(),
  meaningBn: z.string().trim().optional(),
  whenToUseEn: z.string().trim().optional(),
  whenToUseBn: z.string().trim().optional(),

  categoryIds: z.array(z.string()).optional(),
  words: z.array(sentenceWordSchema).optional(),
});

// On update, `words` (if provided) fully replaces the existing set - same
// replace-all-then-recreate approach as categoryIds. This is the fix for
// the old silent-drop bug: previously `words` was accepted here but never
// reached the database.
export const updateSentenceSchema = createSentenceSchema.partial();

export const sentenceIdParamSchema = z.object({
  id: z.string().min(1),
});

export const listSentencesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(PAGINATION.DEFAULT_PAGE),
  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(PAGINATION.MAX_LIMIT)
    .default(PAGINATION.DEFAULT_LIMIT),
  categoryId: z.string().optional(),
  search: z.string().trim().optional(),
});

export type ListSentencesQuery = z.infer<typeof listSentencesQuerySchema>;
export type SentenceInput = z.infer<typeof createSentenceSchema>;