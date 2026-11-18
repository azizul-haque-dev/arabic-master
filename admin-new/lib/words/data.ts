import "server-only";

import { redirect } from "next/navigation";
import type { WordListQuery } from "@/lib/content/validation";
import { readBackend, requireContentAdmin } from "@/lib/content/server";
import { normalizeWord, normalizeWordList, type WordListResponse } from "./api";
import type { Word } from "@/lib/types/content";

function buildQuery(query: WordListQuery): string {
  const params = new URLSearchParams();
  params.set("page", String(query.page));
  params.set("limit", String(query.limit));
  params.set("sort", query.sort);
  if (query.search) params.set("search", query.search);
  if (query.category) params.set("category", query.category);
  if (query.status) params.set("status", query.status);
  if (query.audio) params.set("audio", query.audio);
  return params.toString();
}

export async function requestWordList(query: WordListQuery): Promise<WordListResponse> {
  try {
    const result = await readBackend(`/words?${buildQuery(query)}`);
    if (!result.ok) {
      throw new Error(`GET /words failed with HTTP ${result.status}.`);
    }
    return normalizeWordList(result.data);
  } catch (error) {
    console.error("[requestWordList] Failed to load words:", error);
    throw new Error("Unable to load words. Please try again.");
  }
}

export async function requestWordById(id: string): Promise<Word | null> {
  try {
    const result = await readBackend(`/words/${encodeURIComponent(id)}`);
    if (!result.ok) {
      if (result.status === 404) return null;
      throw new Error(`GET /words/:id failed with HTTP ${result.status}.`);
    }
    return normalizeWord(result.data);
  } catch (error) {
    console.error("[requestWordById] Failed to load word:", error);
    throw new Error("Unable to load word. Please try again.");
  }
}

export async function getWordsForAdmin(query: WordListQuery): Promise<WordListResponse> {
  const authorization = await requireContentAdmin();
  if (!authorization.success) {
    if (authorization.code === "UNAUTHORIZED") redirect("/login");
    if (authorization.code === "FORBIDDEN") redirect("/403");
    throw new Error(authorization.error);
  }
  return requestWordList(query);
}

export async function getWordForAdmin(id: string): Promise<Word | null> {
  const authorization = await requireContentAdmin();
  if (!authorization.success) {
    if (authorization.code === "UNAUTHORIZED") redirect("/login");
    if (authorization.code === "FORBIDDEN") redirect("/403");
    throw new Error(authorization.error);
  }
  return requestWordById(id);
}
