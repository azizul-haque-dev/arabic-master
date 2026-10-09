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
}).strict();

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

export const generateQuerySchema = z.string().trim().min(1).max(500);
export const contentIdSchema = z.string().trim().min(1).max(200);

export type ContentListQuery = z.infer<typeof contentListQuerySchema>;
export type WordCreateInput = z.infer<typeof wordCreateSchema>;
export type WordUpdateInput = z.infer<typeof wordUpdateSchema>;
export type SentenceCreateInput = z.infer<typeof sentenceCreateSchema>;
export type SentenceUpdateInput = z.infer<typeof sentenceUpdateSchema>;

export function queryFromUnknown(value: unknown): unknown {
  if (!isRecord(value)) return value;
  const record = value;
  return {
    ...record,
    ...(typeof record.page === "string" && record.page.trim() ? { page: Number(record.page) } : {}),
    ...(typeof record.limit === "string" && record.limit.trim() ? { limit: Number(record.limit) } : {}),
  };
}
