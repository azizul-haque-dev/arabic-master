import "server-only";

import type { ContentListQuery } from "@/lib/content/validation";
import { readBackend, requireContentAdmin } from "@/lib/content/server";
import { normalizeWord, normalizeWordList, type WordListResponse } from "./api";
import type { Word } from "@/lib/types/content";

function buildQuery(query: ContentListQuery): string {
  const params = new URLSearchParams();
  params.set("page", String(query.page));
  params.set("limit", String(query.limit));
  if (query.search) params.set("search", query.search);
  if (query.category) params.set("category", query.category);
  if (query.status) params.set("status", query.status);
  return params.toString();
}

export async function requestWordList(query: ContentListQuery): Promise<WordListResponse> {
  try {
    const result = await readBackend(`/words?${buildQuery(query)}`);
    if (!result.ok) throw new Error("Unable to load words.");
    return normalizeWordList(result.data);
  } catch {
    throw new Error("Unable to load words. Please try again.");
  }
}

export async function requestWordById(id: string): Promise<Word | null> {
  try {
    const result = await readBackend(`/words/${encodeURIComponent(id)}`);
    if (!result.ok) {
      if (result.status === 404) return null;
      throw new Error("Unable to load word.");
    }
    return normalizeWord(result.data);
  } catch {
    throw new Error("Unable to load word. Please try again.");
  }
}

export async function getWordsForAdmin(query: ContentListQuery): Promise<WordListResponse> {
  const authorization = await requireContentAdmin(false);
  if (!authorization.success) throw new Error(authorization.error);
  return requestWordList(query);
}

export async function getWordForAdmin(id: string): Promise<Word | null> {
  const authorization = await requireContentAdmin(false);
  if (!authorization.success) throw new Error(authorization.error);
  return requestWordById(id);
}
