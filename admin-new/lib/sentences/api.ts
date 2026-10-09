import type { ContentStatus, DifficultyLevel, Sentence, SentenceFormValues, Word } from "@/lib/types/content";
import { normalizeWord } from "@/lib/words/api";

export interface SentenceListResponse {
  items: Sentence[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface SentenceApiRecord {
  id: string;
  sentenceKey: string;
  entityId: string;
  meaningBn: string;
  meaningEn: string;
  pronunciationBn: string;
  pronunciationEn: string;
  whenToUseEn: string;
  whenToUseBn: string;
  feminineEn: string;
  feminineBn: string;
  difficulty: DifficultyLevel;
  category: string;
  relatedWordId: string | null;
  status: ContentStatus;
  rejectionReason: string | null;
  createdById: string | null;
  createdAt: string;
  updatedAt: string;
  entity?: { arabicText: string } | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function unwrapData(payload: unknown): unknown {
  if (!isRecord(payload) || !("data" in payload)) return payload;
  const data = payload.data;
  if (isRecord(data) && "data" in data) return data.data;
  return data;
}

async function readPayload(response: Response): Promise<unknown> {
  try {
    return await response.json() as unknown;
  } catch {
    return null;
  }
}

function errorMessage(payload: unknown, fallback: string): string {
  if (!isRecord(payload)) return fallback;
  const message = payload.message;
  if (typeof message === "string") return message;
  if (Array.isArray(message)) {
    return message.filter((item): item is string => typeof item === "string").join(". ") || fallback;
  }
  return fallback;
}

async function requestJson(url: string, init?: RequestInit): Promise<unknown> {
  const response = await fetch(url, { ...init, cache: "no-store" });
  const payload = await readPayload(response);
  if (!response.ok) {
    throw new Error(errorMessage(payload, `Request failed (${response.status})`));
  }
  return unwrapData(payload);
}

function asSentenceRecord(value: unknown): SentenceApiRecord {
  if (!isRecord(value)) throw new Error("The server returned an invalid sentence.");
  const requiredStrings = [
    "id",
    "sentenceKey",
    "entityId",
    "meaningBn",
    "meaningEn",
    "pronunciationBn",
    "pronunciationEn",
    "whenToUseEn",
    "whenToUseBn",
    "feminineEn",
    "feminineBn",
    "category",
    "createdAt",
    "updatedAt",
  ] as const;
  if (requiredStrings.some((key) => typeof value[key] !== "string")) {
    throw new Error("The server returned an incomplete sentence.");
  }
  const difficulty = value.difficulty;
  if (
    difficulty !== "BEGINNER" &&
    difficulty !== "ELEMENTARY" &&
    difficulty !== "INTERMEDIATE" &&
    difficulty !== "ADVANCED"
  ) {
    throw new Error("The server returned an invalid sentence difficulty.");
  }
  const status = value.status;
  if (
    status !== "DRAFT" &&
    status !== "IN_REVIEW" &&
    status !== "APPROVED" &&
    status !== "PUBLISHED" &&
    status !== "REJECTED" &&
    status !== "ARCHIVED"
  ) {
    throw new Error("The server returned an invalid sentence status.");
  }
  const relatedWordId = value.relatedWordId;
  const rejectionReason = value.rejectionReason;
  const createdById = value.createdById;
  const entity = value.entity;
  if (relatedWordId !== null && typeof relatedWordId !== "string") {
    throw new Error("The server returned an invalid related word reference.");
  }
  if (rejectionReason !== null && typeof rejectionReason !== "string") {
    throw new Error("The server returned an invalid rejection reason.");
  }
  if (createdById !== null && typeof createdById !== "string") {
    throw new Error("The server returned an invalid sentence creator.");
  }
  if (entity !== undefined && entity !== null && (
    !isRecord(entity) || (entity.arabicText !== undefined && typeof entity.arabicText !== "string")
  )) {
    throw new Error("The server returned an invalid Arabic entity.");
  }
  return {
    id: value.id as string,
    sentenceKey: value.sentenceKey as string,
    entityId: value.entityId as string,
    meaningBn: value.meaningBn as string,
    meaningEn: value.meaningEn as string,
    pronunciationBn: value.pronunciationBn as string,
    pronunciationEn: value.pronunciationEn as string,
    whenToUseEn: value.whenToUseEn as string,
    whenToUseBn: value.whenToUseBn as string,
    feminineEn: value.feminineEn as string,
    feminineBn: value.feminineBn as string,
    difficulty,
    category: value.category as string,
    relatedWordId,
    status,
    rejectionReason,
    createdById,
    createdAt: value.createdAt as string,
    updatedAt: value.updatedAt as string,
    entity: entity as SentenceApiRecord["entity"],
  };
}

export function normalizeSentence(value: unknown): Sentence {
  const record = asSentenceRecord(value);
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

function queryString(params: {
  page?: number;
  limit?: number;
  search?: string;
  status?: ContentStatus;
  category?: string;
}): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") query.set(key, String(value));
  }
  return query.size ? `?${query}` : "";
}

export async function fetchSentences(params: {
  page?: number;
  limit?: number;
  search?: string;
  status?: ContentStatus;
  category?: string;
} = {}): Promise<SentenceListResponse> {
  const body = await requestJson(`/api/sentences${queryString(params)}`);
  if (!isRecord(body) || !Array.isArray(body.items) || !isRecord(body.meta)) {
    throw new Error("The server returned an invalid sentence list.");
  }
  const meta = body.meta;
  const page = meta.page ?? 1;
  const limit = meta.limit ?? 20;
  const total = meta.total ?? 0;
  const totalPages = meta.totalPages ?? 1;
  if (
    typeof page !== "number" ||
    typeof limit !== "number" ||
    typeof total !== "number" ||
    typeof totalPages !== "number"
  ) {
    throw new Error("The server returned invalid sentence pagination data.");
  }
  return {
    items: body.items.map(normalizeSentence),
    meta: { page, limit, total, totalPages },
  };
}

export async function createSentence(payload: SentenceCreatePayload): Promise<Sentence> {
  return normalizeSentence(await requestJson("/api/sentences", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }));
}

export async function updateSentence(id: string, payload: SentenceUpdatePayload): Promise<Sentence> {
  return normalizeSentence(await requestJson(`/api/sentences/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }));
}

export async function deleteSentence(id: string): Promise<void> {
  await requestJson(`/api/sentences/${encodeURIComponent(id)}`, { method: "DELETE" });
}

export async function resyncSentenceWords(id: string): Promise<void> {
  await requestJson(`/api/sentences/${encodeURIComponent(id)}/resync-words`, { method: "POST" });
}

export async function generateSentence(query: string): Promise<Sentence> {
  return normalizeSentence(await requestJson("/api/sentences/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  }));
}

export async function fetchSentenceById(id: string): Promise<Sentence> {
  return normalizeSentence(await requestJson(`/api/sentences/${encodeURIComponent(id)}`));
}

export async function fetchRelatedWords(search = ""): Promise<Word[]> {
  const params = new URLSearchParams({ page: "1", limit: "100" });
  if (search.trim()) params.set("search", search.trim());
  const response = await fetch(`/api/words?${params}`, { cache: "no-store" });
  const payload = await readPayload(response);
  if (!response.ok) {
    throw new Error(errorMessage(payload, `Unable to load related words (${response.status})`));
  }
  const body = unwrapData(payload);
  if (!isRecord(body) || !Array.isArray(body.items)) {
    throw new Error("The server returned an invalid word list.");
  }
  return body.items.map(normalizeWord);
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
  const { text, ...payload } = buildSentenceCreatePayload(values);
  void text;
  return { ...payload, relatedWordId: values.relatedWordId ?? null };
}
