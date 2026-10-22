import "server-only";

import { redirect } from "next/navigation";
import type { ContentListQuery } from "@/lib/content/validation";
import { readBackend, requireContentAdmin } from "@/lib/content/server";
import {
  normalizeArabicEntity,
  normalizeArabicEntityList,
  type ArabicEntityListResponse,
} from "./api";
import type { ArabicEntity } from "@/lib/types/content";

function buildQuery(query: ContentListQuery): string {
  const params = new URLSearchParams();
  params.set("page", String(query.page));
  params.set("limit", String(query.limit));
  if (query.search) params.set("search", query.search);
  if (query.status) params.set("status", query.status);
  return params.toString();
}

export async function requestArabicEntityList(
  query: ContentListQuery,
): Promise<ArabicEntityListResponse> {
  try {
    const result = await readBackend(`/arabic-entities?${buildQuery(query)}`);
    if (!result.ok) {
      if (result.status === 401) redirect("/login");
      if (result.status === 403) redirect("/403");
      console.error(`[requestArabicEntityList] Backend error status ${result.status}`);
      return {
        items: [],
        meta: {
          page: Number(query.page) || 1,
          limit: Number(query.limit) || 20,
          total: 0,
          totalPages: 1,
        },
      };
    }
    return normalizeArabicEntityList(result.data);
  } catch (err: unknown) {
    if ((err as { digest?: string })?.digest?.includes("NEXT_REDIRECT")) throw err;
    console.error("[requestArabicEntityList] Failed to load Arabic entities:", err);
    return {
      items: [],
      meta: {
        page: Number(query.page) || 1,
        limit: Number(query.limit) || 20,
        total: 0,
        totalPages: 1,
      },
    };
  }
}

export async function requestArabicEntityById(
  id: string,
): Promise<ArabicEntity | null> {
  try {
    const result = await readBackend(`/arabic-entities/${encodeURIComponent(id)}`);
    if (!result.ok) {
      if (result.status === 401) redirect("/login");
      if (result.status === 403) redirect("/403");
      if (result.status === 404) return null;
      console.error(`[requestArabicEntityById] Backend error status ${result.status} for id ${id}`);
      return null;
    }
    return normalizeArabicEntity(result.data);
  } catch (err: unknown) {
    if ((err as { digest?: string })?.digest?.includes("NEXT_REDIRECT")) throw err;
    console.error("[requestArabicEntityById] Failed to load Arabic entity:", err);
    return null;
  }
}

export async function getArabicEntitiesForAdmin(
  query: ContentListQuery,
): Promise<ArabicEntityListResponse> {
  const authorization = await requireContentAdmin();
  if (!authorization.success) {
    if (authorization.code === "UNAUTHORIZED") redirect("/login");
    if (authorization.code === "FORBIDDEN") redirect("/403");
    console.error("[getArabicEntitiesForAdmin] Admin check:", authorization.error);
    return {
      items: [],
      meta: {
        page: Number(query.page) || 1,
        limit: Number(query.limit) || 20,
        total: 0,
        totalPages: 1,
      },
    };
  }
  return requestArabicEntityList(query);
}

export async function getArabicEntityForAdmin(
  id: string,
): Promise<ArabicEntity | null> {
  const authorization = await requireContentAdmin();
  if (!authorization.success) {
    if (authorization.code === "UNAUTHORIZED") redirect("/login");
    if (authorization.code === "FORBIDDEN") redirect("/403");
    console.error("[getArabicEntityForAdmin] Admin check:", authorization.error);
    return null;
  }
  return requestArabicEntityById(id);
}
