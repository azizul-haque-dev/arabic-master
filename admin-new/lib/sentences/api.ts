import { z } from "zod";
import type { DifficultyLevel, Sentence, SentenceFormValues } from "@/lib/types/content";

const sentenceRecordSchema = z.object({
  id: z.string(),
  sentenceKey: z.string(),
  entityId: z.string(),
  meaningBn: z.string(),
  meaningEn: z.string(),
  pronunciationBn: z.string(),
  pronunciationEn: z.string(),
  whenToUseEn: z.string(),
  whenToUseBn: z.string(),
  feminineEn: z.string(),
  feminineBn: z.string(),
  difficulty: z.enum(["BEGINNER", "ELEMENTARY", "INTERMEDIATE", "ADVANCED"]),
  category: z.string(),
  relatedWordId: z.string().nullable(),
  status: z.enum(["DRAFT", "IN_REVIEW", "APPROVED", "PUBLISHED", "REJECTED", "ARCHIVED"]),
  rejectionReason: z.string().nullable(),
  createdById: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  entity: z.object({ arabicText: z.string() }).nullable().optional(),
});

export interface SentenceListResponse {
  items: Sentence[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SentenceCreatePayload {
  text: string;
  meaningEn: string;
  meaningBn: string;
  whenToUseEn: string;
  whenToUseBn: string;
  pronunciationEn: string;
  pronunciationBn: string;
  feminineEn: string;
  feminineBn: string;
  category: string;
  difficulty: DifficultyLevel;
  relatedWordId?: string;
}

export type SentenceUpdatePayload = Omit<SentenceCreatePayload, "text" | "relatedWordId"> & {
  relatedWordId?: string | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function normalizeSentence(value: unknown): Sentence {
  const parsed = sentenceRecordSchema.safeParse(value);
  if (!parsed.success) throw new Error("The service returned an invalid sentence record.");
  const record = parsed.data;
  return {
    id: record.id,
    sentenceKey: record.sentenceKey,
    entityId: record.entityId,
    arabicText: record.entity?.arabicText ?? "",
    meaningBangla: record.meaningBn,
    meaningEnglish: record.meaningEn,
    pronunciationBangla: record.pronunciationBn,
    pronunciationEnglish: record.pronunciationEn,
    context: record.whenToUseEn,
    contextBangla: record.whenToUseBn,
    feminineEnglish: record.feminineEn,
    feminineBangla: record.feminineBn,
    difficulty: record.difficulty,
    category: record.category,
    relatedWordId: record.relatedWordId ?? undefined,
    status: record.status,
    rejectionReason: record.rejectionReason ?? undefined,
    createdBy: record.createdById ?? "Unknown",
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

export function normalizeSentenceList(value: unknown): SentenceListResponse {
  if (!isRecord(value) || !Array.isArray(value.items) || !isRecord(value.meta)) {
    throw new Error("The service returned an invalid sentence list.");
  }
  const page = value.meta.page;
  const limit = value.meta.limit;
  const total = value.meta.total;
  const totalPages = value.meta.totalPages;
  if (
    typeof page !== "number" ||
    typeof limit !== "number" ||
    typeof total !== "number" ||
    typeof totalPages !== "number"
  ) {
    throw new Error("The service returned invalid sentence pagination data.");
  }
  return {
    items: value.items.map(normalizeSentence),
    meta: { page, limit, total, totalPages },
  };
}

export function buildSentenceCreatePayload(values: SentenceFormValues): SentenceCreatePayload {
  return {
    text: values.arabicText,
    meaningEn: values.meaningEnglish,
    meaningBn: values.meaningBangla,
    whenToUseEn: values.context,
    whenToUseBn: values.contextBangla,
    pronunciationEn: values.pronunciationEnglish,
    pronunciationBn: values.pronunciationBangla,
    feminineEn: values.feminineEnglish,
    feminineBn: values.feminineBangla,
    category: values.category,
    difficulty: values.difficulty,
    relatedWordId: values.relatedWordId,
  };
}

export function buildSentenceUpdatePayload(values: SentenceFormValues): SentenceUpdatePayload {
  return {
    meaningEn: values.meaningEnglish,
    meaningBn: values.meaningBangla,
    whenToUseEn: values.context,
    whenToUseBn: values.contextBangla,
    pronunciationEn: values.pronunciationEnglish,
    pronunciationBn: values.pronunciationBangla,
    feminineEn: values.feminineEnglish,
    feminineBn: values.feminineBangla,
    category: values.category,
    difficulty: values.difficulty,
    relatedWordId: values.relatedWordId ?? null,
  };
}
