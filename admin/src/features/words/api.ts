import { api } from "@/lib/axios";
import type { ApiResponse, PaginatedData, Status, Word } from "@/types";

export interface ListWordsParams {
  page?: number;
  limit?: number;
  status?: Status;
  categoryId?: string;
  search?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export async function fetchWords(params: ListWordsParams): Promise<PaginatedResult<Word>> {
  const { data } = await api.get<ApiResponse<PaginatedData<Word>>>("/words", { params });
  return data.data;
}

export interface WordInput {
  text: string;
  audioUrl?: string;
  meaningEn?: string;
  meaningBn?: string;
  whenToUseEn?: string;
  whenToUseBn?: string;
  pronunciationEn?: string;
  pronunciationBn?: string;
  status?: Status;
  categoryIds?: string[];
}

export async function createWord(input: WordInput): Promise<Word> {
  const { data } = await api.post<ApiResponse<Word>>("/words", input);
  return data.data;
}

export async function updateWord(id: string, input: Partial<WordInput>): Promise<Word> {
  const { data } = await api.patch<ApiResponse<Word>>(`/words/${id}`, input);
  return data.data;
}

export async function deleteWord(id: string): Promise<void> {
  await api.delete(`/words/${id}`);
}
