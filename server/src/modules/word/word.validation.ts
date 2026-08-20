import { PAGINATION, VALIDATION } from "@/shared/constants.js";
import { z } from "zod";

export const createWordSchema = z.object({
  text: z.string().trim().min(VALIDATION.ARABIC_TEXT.MIN_LENGTH, "Arabic text is required"),
  audioUrl: z.string().url().optional(),

  meaningEn: z.string().trim().optional(),
  meaningBn: z.string().trim().optional(),
  whenToUseEn: z.string().trim().optional(),
  whenToUseBn: z.string().trim().optional(),

  categoryIds: z.array(z.string()).optional(),
});

export const updateWordSchema = createWordSchema.partial();

export const wordIdParamSchema = z.object({
  id: z.string().min(1),
});

export const listWordsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(PAGINATION.DEFAULT_PAGE),
  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(PAGINATION.MAX_LIMIT)
    .default(PAGINATION.DEFAULT_LIMIT),
  categoryId: z.string().optional(),
  search: z.string().trim().optional(),
  status: z.string().trim().optional(),
});

export type ListWordsQuery = z.infer<typeof listWordsQuerySchema>;

// status/pronunciation/feminine intentionally NOT part of this type -
// those live on ArabicText and are owned by the AI worker, not this API.
export interface WordInput {
  text: string;
  audioUrl?: string;
  meaningEn?: string;
  meaningBn?: string;
  whenToUseEn?: string;
  whenToUseBn?: string;
  categoryIds?: string[];
}

const arabicRegex = /^[\u0600-\u06FF\s]+$/;
export const arabicTextSchema = z.object({
  text: z.string().regex(arabicRegex, {
    message: "Arabic Text only",
  }),
});