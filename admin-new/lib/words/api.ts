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

interface WordApiEntity {
  arabicText?: string | null;
}

interface WordApiRecord {
  id?: string | null;
  wordKey?: string | null;
  entityId?: string | null;
  arabicText?: string | null;
  entity?: WordApiEntity | null;
  meaningBn?: string | null;
  meaningBangla?: string | null;
  meaningEn?: string | null;
  meaningEnglish?: string | null;
  pronunciationBn?: string | null;
  pronunciationBangla?: string | null;
  pronunciationEn?: string | null;
  pronunciationEnglish?: string | null;
  whenToUseBn?: string | null;
  whenToUseBangla?: string | null;
  whenToUseEn?: string | null;
  whenToUseEnglish?: string | null;
  wordType?: string | null;
  category?: string | null;
  status?: string | null;
  rejectionReason?: string | null;
  createdBy?: string | null;
  createdById?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

const DEFAULT_META = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 1,
};

function normalizeWordType(value?: string | null): WordType {
  if (value === "NOUN" || value === "VERB" || value === "ADJECTIVE" || value === "OTHER") {
    return value;
  }
  return "OTHER";
}

function normalizeStatus(value?: string | null): ContentStatus {
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

export function normalizeWord(raw: WordApiRecord | null | undefined): Word {
  const entity = raw?.entity ?? {};

  return {
    id: raw?.id ?? "",
    wordKey: raw?.wordKey ?? "",
    entityId: raw?.entityId ?? "",
    arabicText: raw?.arabicText ?? entity.arabicText ?? "",
    meaningBangla: raw?.meaningBn ?? raw?.meaningBangla ?? "",
    meaningEnglish: raw?.meaningEn ?? raw?.meaningEnglish ?? "",
    pronunciationBangla: raw?.pronunciationBn ?? raw?.pronunciationBangla ?? "",
    pronunciationEnglish: raw?.pronunciationEn ?? raw?.pronunciationEnglish ?? "",
    whenToUseBangla: raw?.whenToUseBn ?? raw?.whenToUseBangla ?? "",
    whenToUseEnglish: raw?.whenToUseEn ?? raw?.whenToUseEnglish ?? "",
    wordType: normalizeWordType(raw?.wordType),
    category: raw?.category ?? "",
    status: normalizeStatus(raw?.status),
    rejectionReason: raw?.rejectionReason ?? undefined,
    createdBy: raw?.createdBy ?? raw?.createdById ?? "System",
    createdAt: raw?.createdAt ?? new Date().toISOString(),
    updatedAt: raw?.updatedAt ?? raw?.createdAt ?? new Date().toISOString(),
  };
}

function getQueryString(params: Record<string, string | number | undefined>) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (typeof value === "number" && Number.isFinite(value)) {
      searchParams.set(key, String(value));
      return;
    }

    if (typeof value === "string" && value.trim()) {
      searchParams.set(key, value);
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
}

export async function fetchWords(params: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  category?: string;
} = {}): Promise<WordListResponse> {
  const response = await fetch(`/api/words${getQueryString(params)}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    return {
      items: [],
      meta: { ...DEFAULT_META, page: params.page ?? 1, limit: params.limit ?? DEFAULT_META.limit },
    };
  }

  const payload = await response.json();
  const body = payload?.data?.data ?? payload?.data ?? payload;
  const items = Array.isArray(body?.items) ? body.items.map(normalizeWord) : [];
  const meta = body?.meta ?? { ...DEFAULT_META, page: params.page ?? 1, limit: params.limit ?? DEFAULT_META.limit };

  return {
    items,
    meta: {
      page: Number(meta.page ?? params.page ?? 1),
      limit: Number(meta.limit ?? params.limit ?? DEFAULT_META.limit),
      total: Number(meta.total ?? 0),
      totalPages: Number(meta.totalPages ?? 1),
    },
  };
}

export async function fetchWordById(id: string): Promise<Word | null> {
  const response = await fetch(`/api/words/${id}`, { cache: "no-store" });

  if (!response.ok) {
    return null;
  }

  const payload = await response.json();
  const body = payload?.data?.data ?? payload?.data ?? payload ?? null;
  return normalizeWord(body);
}

export function buildWordPayload(values: WordFormValues, entity: { arabicText: string }) {
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

export function buildWordUpdatePayload(values: WordFormValues) {
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

export async function createWord(payload: Record<string, unknown>) {
  const response = await fetch("/api/words", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(errorBody?.message ?? "Unable to create word");
  }

  const body = await response.json();
  const data = body?.data?.data ?? body?.data ?? body;
  return normalizeWord(data);
}

export async function updateWord(id: string, payload: Record<string, unknown>) {
  const response = await fetch(`/api/words/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(errorBody?.message ?? "Unable to update word");
  }

  const body = await response.json();
  const data = body?.data?.data ?? body?.data ?? body;
  return normalizeWord(data);
}

export async function deleteWord(id: string) {
  const response = await fetch(`/api/words/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(errorBody?.message ?? "Unable to delete word");
  }
}
