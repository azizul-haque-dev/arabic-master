import { api } from "@/lib/axios";
import type { ApiResponse, PaginatedData } from "@/types";
import type { Topic } from "@/types/conversation";

export interface ListTopicsParams {
  page?: number;
  limit?: number;
  search?: string;
}

export async function fetchTopics(
  params: ListTopicsParams = {},
): Promise<PaginatedData<Topic>> {
  const { data } = await api.get<ApiResponse<PaginatedData<Topic>>>("/topics", {
    params,
  });
  return data.data;
}

export async function fetchTopic(id: string): Promise<Topic> {
  const { data } = await api.get<ApiResponse<Topic>>(`/topics/${id}`);
  return data.data;
}

export interface TopicInput {
  titleEn: string;
  titleBn?: string;
}

export async function createTopic(input: TopicInput): Promise<Topic> {
  const { data } = await api.post<ApiResponse<Topic>>("/topics", input);
  return data.data;
}

export async function updateTopic(
  id: string,
  input: Partial<TopicInput>,
): Promise<Topic> {
  const { data } = await api.patch<ApiResponse<Topic>>(`/topics/${id}`, input);
  return data.data;
}

export async function deleteTopic(id: string): Promise<void> {
  await api.delete(`/topics/${id}`);
}
