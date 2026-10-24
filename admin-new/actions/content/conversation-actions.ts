"use server";

import type { ContentActionResult } from "@/lib/content/action-result";
import { callBackend, requireContentAdmin } from "@/lib/content/server";
import type { Conversation } from "@/lib/types/content";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function listConversationsAction(
  query?: { search?: string; limit?: number; page?: number },
): Promise<ContentActionResult<{ items: Conversation[]; meta: { total: number } }>> {
  const authorization = await requireContentAdmin();
  if (!authorization.success) return authorization;

  const params = new URLSearchParams();
  params.set("page", String(query?.page ?? 1));
  params.set("limit", String(query?.limit ?? 20));
  if (query?.search?.trim()) params.set("search", query.search.trim());

  try {
    const response = await callBackend(`/conversations?${params.toString()}`);
    if (!response.success) return response;

    const data = response.data;
    if (!isRecord(data) || !Array.isArray(data.items)) {
      return { success: true, data: { items: [], meta: { total: 0 } } };
    }

    const items: Conversation[] = data.items.map((item: any) => ({
      id: String(item.id),
      conversationKey: String(item.conversationKey ?? item.id),
      title: String(item.title ?? ""),
      topic: String(item.topic ?? ""),
      category: String(item.category ?? ""),
      turns: Array.isArray(item.turns) ? item.turns : [],
      status: item.status ?? "DRAFT",
      rejectionReason: item.rejectionReason,
      createdBy: item.createdBy ?? "Admin",
      createdAt: String(item.createdAt ?? new Date().toISOString()),
      updatedAt: String(item.updatedAt ?? new Date().toISOString()),
    }));

    const total = isRecord(data.meta) && typeof data.meta.total === "number" ? data.meta.total : items.length;

    return { success: true, data: { items, meta: { total } } };
  } catch {
    return {
      success: false,
      code: "SERVER_ERROR",
      error: "Unable to load conversations.",
    };
  }
}
