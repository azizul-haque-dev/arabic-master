import type { ArabicEntity, ContentStatus } from "@/lib/types/content";

export interface ArabicEntityListResponse {
  items: ArabicEntity[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ArabicEntityCreatePayload {
  arabicText: string;
  meaningBangla?: string;
  meaningEnglish?: string;
  pronunciationBangla?: string;
  pronunciationEnglish?: string;
  status?: ContentStatus;
}

export type ArabicEntityUpdatePayload = Partial<ArabicEntityCreatePayload> & {
  rejectionReason?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requiredString(record: Record<string, unknown>, key: string): string {
  const value = record[key];
  if (typeof value !== "string") {
    throw new Error(`The service returned an invalid Arabic entity record: missing string ${key}`);
  }
  return value;
}

function optionalString(...values: unknown[]): string | undefined {
  return values.find((value): value is string => typeof value === "string" && value.length > 0);
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
  return "DRAFT";
}

export function normalizeArabicEntity(raw: unknown): ArabicEntity {
  if (!isRecord(raw)) throw new Error("The service returned an invalid Arabic entity record.");

  const id = requiredString(raw, "id");
  const entityKey = optionalString(raw.entityKey) ?? `AE-${id.slice(0, 4)}`;
  const arabicText = requiredString(raw, "arabicText");
  const normalizedText = optionalString(raw.normalizedText) ?? arabicText;
  const meaningBangla = optionalString(raw.meaningBangla, raw.meaningBn) ?? "";
  const meaningEnglish = optionalString(raw.meaningEnglish, raw.meaningEn) ?? "";
  const pronunciationBangla = optionalString(raw.pronunciationBangla, raw.pronunciationBn) ?? "";
  const pronunciationEnglish = optionalString(raw.pronunciationEnglish, raw.pronunciationEn) ?? "";

  const audioUrl = typeof raw.audioUrl === "string" && raw.audioUrl.length > 0 ? raw.audioUrl : undefined;
  const hasAudio = Boolean(raw.hasAudio) || Boolean(audioUrl);

  const wordUsageCount = typeof raw.wordUsageCount === "number" ? raw.wordUsageCount : 0;
  const sentenceUsageCount = typeof raw.sentenceUsageCount === "number" ? raw.sentenceUsageCount : 0;
  const conversationUsageCount = typeof raw.conversationUsageCount === "number" ? raw.conversationUsageCount : 0;

  const createdBy = optionalString(raw.createdBy, raw.createdById) ?? "Content Admin";
  const toIsoDate = (val: unknown): string => {
    if (typeof val === "string") return val;
    if (val instanceof Date) return val.toISOString();
    if (typeof val === "number") return new Date(val).toISOString();
    return new Date().toISOString();
  };
  const createdAt = toIsoDate(raw.createdAt);
  const updatedAt = toIsoDate(raw.updatedAt);

  return {
    id,
    entityKey,
    arabicText,
    normalizedText,
    meaningBangla,
    meaningEnglish,
    pronunciationBangla,
    pronunciationEnglish,
    hasAudio,
    audioUrl,
    status: normalizeStatus(raw.status),
    wordUsageCount,
    sentenceUsageCount,
    conversationUsageCount,
    rejectionReason: typeof raw.rejectionReason === "string" ? raw.rejectionReason : undefined,
    createdBy,
    createdAt,
    updatedAt,
  };
}

export function normalizeArabicEntityList(raw: unknown): ArabicEntityListResponse {
  if (!isRecord(raw)) {
    throw new Error("The service returned an invalid Arabic entities list.");
  }

  const items = Array.isArray(raw.items)
    ? raw.items.map((item) => normalizeArabicEntity(item))
    : [];

  const metaRecord = isRecord(raw.meta) ? raw.meta : {};
  const page = typeof metaRecord.page === "number" ? metaRecord.page : 1;
  const limit = typeof metaRecord.limit === "number" ? metaRecord.limit : 20;
  const total = typeof metaRecord.total === "number" ? metaRecord.total : items.length;
  const totalPages =
    typeof metaRecord.totalPages === "number"
      ? metaRecord.totalPages
      : Math.max(1, Math.ceil(total / limit));

  return {
    items,
    meta: {
      page,
      limit,
      total,
      totalPages,
    },
  };
}
