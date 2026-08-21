import { api } from "@/lib/axios";
import type { ApiResponse, PaginatedData } from "@/types";
import type { Conversation } from "@/types/conversation";

export interface ListConversationsParams {
  topicConversationId?: string;
  page?: number;
  limit?: number;
}

export async function fetchConversations(
  params: ListConversationsParams,
): Promise<PaginatedData<Conversation>> {
  const { data } = await api.get<ApiResponse<PaginatedData<Conversation>>>(
    "/conversations",
    { params },
  );
  return data.data;
}

// Expected to include nested `lines` (each with its `sentence`).
export async function fetchConversation(id: string): Promise<Conversation> {
  const { data } = await api.get<ApiResponse<Conversation>>(`/conversations/${id}`);
  return data.data;
}

export async function createConversation(
  topicConversationId: string,
): Promise<Conversation> {
  const { data } = await api.post<ApiResponse<Conversation>>("/conversations", {
    topicConversationId,
  });
  return data.data;
}

export async function deleteConversation(id: string): Promise<void> {
  await api.delete(`/conversations/${id}`);
}
