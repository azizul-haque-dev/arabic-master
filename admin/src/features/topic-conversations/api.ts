import { api } from "@/lib/axios";
import type { ApiResponse, PaginatedData } from "@/types";
import type { TopicConversation } from "@/types/conversation";

export interface ListTopicConversationsParams {
  topicId?: string;
  page?: number;
  limit?: number;
  search?: string;
}

export async function fetchTopicConversations(
  params: ListTopicConversationsParams,
): Promise<PaginatedData<TopicConversation>> {
  const { data } = await api.get<ApiResponse<PaginatedData<TopicConversation>>>(
    "/topic-conversations",
    { params },
  );
  return data.data;
}

export interface TopicConversationInput {
  topicId: string;
  titleEn: string;
  titleBn?: string;
}

export async function createTopicConversation(
  input: TopicConversationInput,
): Promise<TopicConversation> {
  const { data } = await api.post<ApiResponse<TopicConversation>>(
    "/topic-conversations",
    input,
  );
  return data.data;
}

export async function updateTopicConversation(
  id: string,
  input: Partial<Omit<TopicConversationInput, "topicId">>,
): Promise<TopicConversation> {
  const { data } = await api.patch<ApiResponse<TopicConversation>>(
    `/topic-conversations/${id}`,
    input,
  );
  return data.data;
}

export async function deleteTopicConversation(id: string): Promise<void> {
  await api.delete(`/topic-conversations/${id}`);
}
