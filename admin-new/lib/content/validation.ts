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

export const sectionCreateSchema = z.object({
  courseId: requiredText,
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(1000).nullish().default(""),
}).strip();

export const sectionUpdateSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(1000).nullish(),
}).strip();

export const sectionStatusSchema = z.object({
  status: z.enum(contentStatuses),
  rejectionReason: z.string().trim().max(500).optional(),
}).strict();

export const sectionListQuerySchema = z.object({
  page: z.number().int().min(1).max(1_000_000).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  courseId: z.string().trim().optional(),
  search: z.string().trim().max(100).optional(),
  status: z.enum(contentStatuses).optional(),
}).strip();

export const sectionReorderSchema = z.object({
  courseId: requiredText,
  ids: z.array(requiredText).min(1).max(500),
}).strict();

export const courseCreateSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().min(1).max(1000),
  level: z.enum(difficulties).optional().default("BEGINNER"),
  courseType: z.enum(["FREE", "PRO"]).optional().default("FREE"),
}).strip();

export const courseUpdateSchema = courseCreateSchema.partial().strip();

export const courseStatusSchema = z.object({
  status: z.enum(contentStatuses),
  rejectionReason: z.string().trim().max(500).optional(),
}).strict();

export const courseListQuerySchema = z.object({
  page: z.number().int().min(1).max(1_000_000).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(100).optional(),
  status: z.enum(contentStatuses).optional(),
  level: z.enum(difficulties).optional(),
  courseType: z.enum(["FREE", "PRO"]).optional(),
}).strip();

export const lessonCreateSchema = z.object({
  sectionId: requiredText,
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(1000).nullish().default(""),
  maxItemsRecommended: z.number().int().min(1).max(50).optional(),
}).strip();

export const lessonUpdateSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(1000).nullish(),
  maxItemsRecommended: z.number().int().min(1).max(50).optional(),
}).strip();

export const lessonStatusSchema = z.object({
  status: z.enum(contentStatuses),
  rejectionReason: z.string().trim().max(500).optional(),
}).strict();

export const lessonListQuerySchema = z.object({
  page: z.number().int().min(1).max(1_000_000).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sectionId: z.string().trim().optional(),
  courseId: z.string().trim().optional(),
  search: z.string().trim().max(100).optional(),
  status: z.enum(contentStatuses).optional(),
}).strip();

export const lessonAddItemSchema = z.object({
  contentType: z.enum(["WORD", "SENTENCE", "CONVERSATION"]),
  contentId: requiredText,
}).strict();

export const lessonReorderItemsSchema = z.object({
  ids: z.array(requiredText).min(1).max(500),
}).strict();

export const lessonReorderInSectionSchema = z.object({
  sectionId: requiredText,
  ids: z.array(requiredText).min(1).max(500),
}).strict();

export type ContentListQuery = z.infer<typeof contentListQuerySchema>;
export type WordCreateInput = z.infer<typeof wordCreateSchema>;
export type WordUpdateInput = z.infer<typeof wordUpdateSchema>;
export type SentenceCreateInput = z.infer<typeof sentenceCreateSchema>;
export type SentenceUpdateInput = z.infer<typeof sentenceUpdateSchema>;
export type ArabicEntityCreateInput = z.infer<typeof arabicEntityCreateSchema>;
export type ArabicEntityUpdateInput = z.infer<typeof arabicEntityUpdateSchema>;
export type ArabicEntityStatusInput = z.infer<typeof arabicEntityStatusSchema>;
export type SectionCreateInput = z.infer<typeof sectionCreateSchema>;
export type SectionUpdateInput = z.infer<typeof sectionUpdateSchema>;
export type SectionStatusInput = z.infer<typeof sectionStatusSchema>;
export type SectionListQuery = z.infer<typeof sectionListQuerySchema>;
export type SectionReorderInput = z.infer<typeof sectionReorderSchema>;
export type CourseCreateInput = z.infer<typeof courseCreateSchema>;
export type CourseUpdateInput = z.infer<typeof courseUpdateSchema>;
export type CourseStatusInput = z.infer<typeof courseStatusSchema>;
export type CourseListQuery = z.infer<typeof courseListQuerySchema>;
export type LessonCreateInput = z.infer<typeof lessonCreateSchema>;
export type LessonUpdateInput = z.infer<typeof lessonUpdateSchema>;
export type LessonStatusInput = z.infer<typeof lessonStatusSchema>;
export type LessonListQuery = z.infer<typeof lessonListQuerySchema>;
export type LessonAddItemInput = z.infer<typeof lessonAddItemSchema>;
export type LessonReorderItemsInput = z.infer<typeof lessonReorderItemsSchema>;
export type LessonReorderInSectionInput = z.infer<typeof lessonReorderInSectionSchema>;

export function queryFromUnknown(value: unknown): unknown {
  if (!isRecord(value)) return value;
  const record = value;
  return {
    ...record,
    ...(typeof record.page === "string" && record.page.trim() ? { page: Number(record.page) } : {}),
    ...(typeof record.limit === "string" && record.limit.trim() ? { limit: Number(record.limit) } : {}),
  };
}
