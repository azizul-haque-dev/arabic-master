import { Status } from "@/generated/prisma/enums.js";
import { z } from "zod";

// Each entry links an existing Word into the sentence at a given position.
const sentenceWordSchema = z.object({
  wordId: z.string().min(1),
  position: z.coerce.number().int().nonnegative(),
});

export const createSentenceSchema = z.object({
  text: z.string().trim().min(1, "Arabic text is required"),
  audioUrl: z.string().url().optional(),

  pronunciationEn: z.string().trim().min(1),
  pronunciationBn: z.string().trim().min(1),
  meaningEn: z.string().trim().min(1),
  meaningBn: z.string().trim().min(1),
  whenToUseEn: z.string().trim().optional(),
  whenToUseBn: z.string().trim().optional(),

  status: z.enum(Status).optional(),
  categoryIds: z.array(z.string()).optional(),
  words: z.array(sentenceWordSchema).optional(),
});

export const updateSentenceSchema = createSentenceSchema.partial();

export const generateSentenceSchema = z.object({
  text: z.string().trim().min(1, "Arabic text is required"),
});

export const sentenceIdParamSchema = z.object({
  id: z.string().min(1),
});

export const listSentencesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z.enum(Status).optional(),
  categoryId: z.string().optional(),
  search: z.string().trim().optional(),
});

export type ListSentencesQuery = z.infer<typeof listSentencesQuerySchema>;

export const AIResponseSchema = z.object({
  arabicText: z.string().min(1),
  meaningBn: z.string().min(1),
  categoryEn: z.string().min(1),
  categoryBn: z.string().min(1),
  meaningEn: z.string().min(1),
  pronunciationBn: z.string().min(1),
  pronunciationEn: z.string().min(1),
  whenToUseBn: z.string().min(1),
  whenToUseEn: z.string().min(1),
});

export type SentenceInput = z.infer<typeof createSentenceSchema>;
