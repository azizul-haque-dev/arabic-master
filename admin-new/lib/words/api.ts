import type { ContentStatus, Word, WordFormValues, WordType } from "@/lib/types/content";

export interface WordListResponse {
  items: Word[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface WordCreatePayload {
  text: string;
  meaningEn: string;
  meaningBn: string;
  pronunciationEn: string;
  pronunciationBn: string;
  whenToUseEn: string;
  whenToUseBn: string;
  wordType: WordType;
  category: string;
  feminineEn: string;
  feminineBn: string;
}

export type WordUpdatePayload = Omit<WordCreatePayload, "text">;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requiredString(record: Record<string, unknown>, key: string): string {
  const value = record[key];
  if (typeof value !== "string") {
    throw new Error("The service returned an invalid word record.");
  }
  return value;
}

function optionalString(...values: unknown[]): string | undefined {
  return values.find((value): value is string => typeof value === "string");
}

function normalizeWordType(value: unknown): WordType {
  if (value === "NOUN" || value === "VERB" || value === "ADJECTIVE" || value === "OTHER") {
    return value;
  }
  if (value === "UNKNOWN") return "OTHER";
  throw new Error("The service returned an invalid word type.");
}

function normalizeStatus(value: unknown): ContentStatus {
  if (
    value === "DRAFT" ||
    value === "IN_REVIEW" ||
    value === "APPROVED" ||
    value === "PUBLISHED" ||
    value === "REJECTED" ||
    value === "ARCHIVED"
  ) {
    return value;
  }
  throw new Error("The service returned an invalid word status.");
}

export function normalizeWord(raw: unknown, arabicTextOverride?: string): Word {
  if (!isRecord(raw)) throw new Error("The service returned an invalid word record.");
  const entity = isRecord(raw.entity) ? raw.entity : {};
  const createdById = raw.createdById;
  const rejectionReason = raw.rejectionReason;
  if (createdById !== undefined && createdById !== null && typeof createdById !== "string") {
    throw new Error("The service returned an invalid word creator.");
  }
  if (rejectionReason !== undefined && rejectionReason !== null && typeof rejectionReason !== "string") {
    throw new Error("The service returned an invalid word rejection reason.");
  }

  return {
    id: requiredString(raw, "id"),
    wordKey: requiredString(raw, "wordKey"),
    entityId: requiredString(raw, "entityId"),
    arabicText: arabicTextOverride ?? optionalString(raw.arabicText, entity.arabicText) ?? "",
    meaningBangla: optionalString(raw.meaningBn, raw.meaningBangla) ?? requiredString(raw, "meaningBn"),
    meaningEnglish: optionalString(raw.meaningEn, raw.meaningEnglish) ?? requiredString(raw, "meaningEn"),
    pronunciationBangla: optionalString(raw.pronunciationBn, raw.pronunciationBangla) ?? requiredString(raw, "pronunciationBn"),
    pronunciationEnglish: optionalString(raw.pronunciationEn, raw.pronunciationEnglish) ?? requiredString(raw, "pronunciationEn"),
    whenToUseBangla: optionalString(raw.whenToUseBn, raw.whenToUseBangla) ?? requiredString(raw, "whenToUseBn"),
    whenToUseEnglish: optionalString(raw.whenToUseEn, raw.whenToUseEnglish) ?? requiredString(raw, "whenToUseEn"),
    wordType: normalizeWordType(raw.wordType),
    category: requiredString(raw, "category"),
    status: normalizeStatus(raw.status),
    rejectionReason: typeof rejectionReason === "string" ? rejectionReason : undefined,
    createdBy: optionalString(raw.createdBy, createdById) ?? "Unknown",
    createdAt: requiredString(raw, "createdAt"),
    updatedAt: requiredString(raw, "updatedAt"),
  };
}

export function normalizeWordList(raw: unknown): WordListResponse {
  if (!isRecord(raw) || !Array.isArray(raw.items) || !isRecord(raw.meta)) {
    throw new Error("The service returned an invalid word list.");
  }
  const { page, limit, total, totalPages } = raw.meta;
  if (
    typeof page !== "number" ||
    typeof limit !== "number" ||
    typeof total !== "number" ||
    typeof totalPages !== "number"
  ) {
    throw new Error("The service returned invalid word pagination data.");
  }
  return {
    items: raw.items.map((item) => normalizeWord(item)),
    meta: { page, limit, total, totalPages },
  };
}

export function buildWordPayload(
  values: WordFormValues,
  entity: { arabicText: string },
): WordCreatePayload {
  return {
    text: entity.arabicText,
    meaningEn: values.meaningEnglish,
    meaningBn: values.meaningBangla,
    pronunciationEn: values.pronunciationEnglish,
    pronunciationBn: values.pronunciationBangla,
    whenToUseEn: values.whenToUseEnglish,
    whenToUseBn: values.whenToUseBangla,
    wordType: values.wordType,
    category: values.category,
    feminineEn: values.meaningEnglish,
    feminineBn: values.meaningBangla,
  };
}

export function buildWordUpdatePayload(values: WordFormValues): WordUpdatePayload {
  return {
    meaningEn: values.meaningEnglish,
    meaningBn: values.meaningBangla,
    pronunciationEn: values.pronunciationEnglish,
    pronunciationBn: values.pronunciationBangla,
    whenToUseEn: values.whenToUseEnglish,
    whenToUseBn: values.whenToUseBangla,
    wordType: values.wordType,
    category: values.category,
    feminineEn: values.meaningEnglish,
    feminineBn: values.meaningBangla,
  };
}
