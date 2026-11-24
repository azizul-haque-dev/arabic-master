import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { getBackendApiUrl } from "@/lib/auth/backend-url";
import type {
  PaginatedPublicResponse,
  PublicConversationItem,
  PublicCourseItem,
  PublicSentenceItem,
  PublicWordItem,
} from "@/lib/types/learner";

export interface PublicQuery {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  level?: string;
}

function emptyPage<T>(page: number, limit: number): PaginatedPublicResponse<T> {
  return {
    items: [],
    meta: { page, limit, total: 0, totalPages: 1 },
  };
}

async function fetchPublicList<T>(
  endpoint: string,
  query: PublicQuery,
): Promise<PaginatedPublicResponse<T>> {
  const page = query.page ?? 1;
  const limit = query.limit ?? 24;
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", String(limit));
  if (query.search?.trim()) params.set("search", query.search.trim());
  if (query.category?.trim()) params.set("category", query.category.trim());
  if (query.level?.trim()) params.set("level", query.level.trim());

  try {
    const res = await fetch(`${getBackendApiUrl()}${endpoint}?${params.toString()}`, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(8_000),
    });
    if (!res.ok) return emptyPage<T>(page, limit);

    const json = (await res.json()) as {
      data?: { items?: T[]; meta?: PaginatedPublicResponse<T>["meta"] };
      items?: T[];
      meta?: PaginatedPublicResponse<T>["meta"];
    };
    const payload = json.data ?? json;
    return {
      items: Array.isArray(payload.items) ? payload.items : [],
      meta: payload.meta ?? { page, limit, total: 0, totalPages: 1 },
    };
  } catch {
    return emptyPage<T>(page, limit);
  }
}

export async function getPublicWords(
  query: PublicQuery = {},
): Promise<PaginatedPublicResponse<PublicWordItem>> {
  "use cache";
  cacheLife("minutes");
  cacheTag("words", "learning-modules");
  return fetchPublicList<PublicWordItem>("/learner/words", query);
}

export async function getPublicSentences(
  query: PublicQuery = {},
): Promise<PaginatedPublicResponse<PublicSentenceItem>> {
  "use cache";
  cacheLife("minutes");
  cacheTag("sentences", "learning-modules");
  return fetchPublicList<PublicSentenceItem>("/learner/sentences", query);
}

export async function getPublicConversations(
  query: PublicQuery = {},
): Promise<PaginatedPublicResponse<PublicConversationItem>> {
  "use cache";
  cacheLife("minutes");
  cacheTag("conversations", "learning-modules");
  return fetchPublicList<PublicConversationItem>("/learner/conversations", query);
}

export async function getPublicCourses(
  query: PublicQuery = {},
): Promise<PaginatedPublicResponse<PublicCourseItem>> {
  "use cache";
  cacheLife("minutes");
  cacheTag("courses", "learning-modules");
  return fetchPublicList<PublicCourseItem>("/learner/courses", query);
}
