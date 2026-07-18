import type { PaginatedResult } from "@/features/words/api";
import { api } from "@/lib/axios";
import type { ApiResponse, Sentence, Status } from "@/types";

export interface ListSentencesParams {
  page?: number;
  limit?: number;
  status?: Status;
  categoryId?: string;
  search?: string;
}

export async function fetchSentences(
  params: ListSentencesParams,
): Promise<PaginatedResult<Sentence>> {
  const { data } = await api.get<ApiResponse<Sentence[]>>("/sentences", {
    params,
  });
  return { items: data.data, meta: data.meta! };
}

export interface SentenceWordInput {
  wordId: string;
  position: number;
}

export interface SentenceInput {
  text: string;
  audioUrl?: string;
  pronunciationEn: string;
  pronunciationBn: string;
  meaningEn: string;
  meaningBn: string;
  whenToUseEn?: string;
  whenToUseBn?: string;
  status?: Status;
  categoryIds?: string[];
  words?: SentenceWordInput[];
}

export async function createSentence(input: SentenceInput): Promise<Sentence> {
  const { data } = await api.post<ApiResponse<Sentence>>("/sentences", input);
  return data.data;
}

export async function updateSentence(
  id: string,
  input: Partial<SentenceInput>,
): Promise<Sentence> {
  const { data } = await api.patch<ApiResponse<Sentence>>(
    `/sentences/${id}`,
    input,
  );
  return data.data;
}

export async function deleteSentence(id: string): Promise<void> {
  await api.delete(`/sentences/${id}`);
}

export async function generateAiSentenceContent(input: string) {
  const data = await api.post(`/sentences/ai`, input);
}
