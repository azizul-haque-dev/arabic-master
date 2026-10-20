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
    if (!result.ok) throw new Error("Unable to load Arabic entities.");
    return normalizeArabicEntityList(result.data);
  } catch {
    throw new Error("Unable to load Arabic entities. Please try again.");
  }
}

export async function requestArabicEntityById(
  id: string,
): Promise<ArabicEntity | null> {
  try {
    const result = await readBackend(`/arabic-entities/${encodeURIComponent(id)}`);
    if (!result.ok) {
      if (result.status === 404) return null;
      throw new Error("Unable to load Arabic entity.");
    }
    return normalizeArabicEntity(result.data);
  } catch {
    throw new Error("Unable to load Arabic entity. Please try again.");
  }
}

export async function getArabicEntitiesForAdmin(
  query: ContentListQuery,
): Promise<ArabicEntityListResponse> {
  const authorization = await requireContentAdmin();
  if (!authorization.success) {
    if (authorization.code === "UNAUTHORIZED") redirect("/login");
    if (authorization.code === "FORBIDDEN") redirect("/403");
    throw new Error(authorization.error);
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
    throw new Error(authorization.error);
  }
  return requestArabicEntityById(id);
}
