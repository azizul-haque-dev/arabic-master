import { z } from "zod";
import { SENTENCE_CATEGORIES } from "@/lib/sentences/categories";

export const contentStatuses = [
  "DRAFT",
  "IN_REVIEW",
  "APPROVED",
  "PUBLISHED",
  "REJECTED",
  "ARCHIVED",
] as const;

const wordTypes = ["NOUN", "VERB", "ADJECTIVE", "OTHER"] as const;
const difficulties = ["BEGINNER", "ELEMENTARY", "INTERMEDIATE", "ADVANCED"] as const;
const sentenceCategories = z.enum(SENTENCE_CATEGORIES);
const wordCategory = sentenceCategories;
const wordId = z.string().trim().min(1).max(200);
const requiredText = z.string().trim().min(1);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export const contentListQuerySchema = z.object({
  page: z.number().int().min(1).max(1_000_000).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(500).optional(),
  category: sentenceCategories.optional(),
  status: z.enum(contentStatuses).optional(),
}).strip();

export const wordCreateSchema = z.object({
  text: requiredText,
  meaningEn: requiredText,
  meaningBn: requiredText,
  whenToUseEn: requiredText,
  whenToUseBn: requiredText,
  pronunciationEn: requiredText,
  pronunciationBn: requiredText,
  feminineEn: requiredText,
  feminineBn: requiredText,
  category: wordCategory,
  wordType: z.enum(wordTypes).optional(),
}).strict();

export const wordUpdateSchema = wordCreateSchema.partial();

export const sentenceCreateSchema = z.object({
  text: requiredText,
  meaningEn: requiredText,
  meaningBn: requiredText,
  whenToUseEn: requiredText,
  whenToUseBn: requiredText,
  pronunciationEn: requiredText,
  pronunciationBn: requiredText,
  feminineEn: requiredText,
  feminineBn: requiredText,
  category: sentenceCategories,
  difficulty: z.enum(difficulties).optional(),
  relatedWordId: wordId.optional(),
}).strict();

export const sentenceUpdateSchema = sentenceCreateSchema.extend({
  relatedWordId: wordId.nullable().optional(),
}).partial();

export const arabicEntityCreateSchema = z.object({
  arabicText: requiredText,
  meaningEn: z.string().trim().optional().default(""),
  meaningBn: z.string().trim().optional().default(""),
  pronunciationEn: z.string().trim().optional().default(""),
  pronunciationBn: z.string().trim().optional().default(""),
  meaningEnglish: z.string().trim().optional(),
  meaningBangla: z.string().trim().optional(),
  pronunciationEnglish: z.string().trim().optional(),
  pronunciationBangla: z.string().trim().optional(),
  status: z.enum(contentStatuses).optional().default("DRAFT"),
}).strict();

export const arabicEntityUpdateSchema = z.object({
  arabicText: requiredText.optional(),
  meaningEn: z.string().trim().optional(),
  meaningBn: z.string().trim().optional(),
  pronunciationEn: z.string().trim().optional(),
  pronunciationBn: z.string().trim().optional(),
  meaningEnglish: z.string().trim().optional(),
  meaningBangla: z.string().trim().optional(),
  pronunciationEnglish: z.string().trim().optional(),
  pronunciationBangla: z.string().trim().optional(),
  status: z.enum(contentStatuses).optional(),
  rejectionReason: z.string().trim().nullable().optional(),
}).strict();

export const arabicEntityStatusSchema = z.object({
  status: z.enum(contentStatuses),
  rejectionReason: z.string().trim().optional(),
}).strict();

export const generateQuerySchema = z.string().trim().min(1).max(500);
export const contentIdSchema = z.string().trim().min(1).max(200);

export type ContentListQuery = z.infer<typeof contentListQuerySchema>;
export type WordCreateInput = z.infer<typeof wordCreateSchema>;
export type WordUpdateInput = z.infer<typeof wordUpdateSchema>;
export type SentenceCreateInput = z.infer<typeof sentenceCreateSchema>;
export type SentenceUpdateInput = z.infer<typeof sentenceUpdateSchema>;
export type ArabicEntityCreateInput = z.infer<typeof arabicEntityCreateSchema>;
export type ArabicEntityUpdateInput = z.infer<typeof arabicEntityUpdateSchema>;
export type ArabicEntityStatusInput = z.infer<typeof arabicEntityStatusSchema>;

export function queryFromUnknown(value: unknown): unknown {
  if (!isRecord(value)) return value;
  const record = value;
  return {
    ...record,
    ...(typeof record.page === "string" && record.page.trim() ? { page: Number(record.page) } : {}),
    ...(typeof record.limit === "string" && record.limit.trim() ? { limit: Number(record.limit) } : {}),
  };
}
