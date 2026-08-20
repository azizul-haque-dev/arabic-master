import type { PaginatedResult } from "@/features/words/api";
import { api } from "@/lib/axios";
import type {
  AiGenerationStatus,
  ApiResponse,
  PaginatedData,
  Sentence,
} from "@/types";

export interface ListSentencesParams {
  page?: number;
  limit?: number;
  categoryId?: string;
  search?: string;
}

export async function fetchSentences(
  params: ListSentencesParams,
): Promise<PaginatedResult<Sentence>> {
  const { data } = await api.get<ApiResponse<PaginatedData<Sentence>>>(
    "/sentences",
    { params },
  );
  return data.data;
}

export interface SentenceWordInput {
  wordId: string;
  position: number;
}

export interface SentenceInput {
  text: string;
  audioUrl?: string;
  meaningEn?: string;
  meaningBn?: string;
  whenToUseEn?: string;
  whenToUseBn?: string;
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

export interface GenerateSentenceResponse {
  sentenceId: string;
  aiStatus: AiGenerationStatus;
}

// POST /sentences/ai - fire-and-forget: creates/attaches a PENDING sentence
// and queues AI enrichment (meaning, pronunciation, words, etc).
// Body must be { text } - a raw string body will not populate req.body.text
// on the server.
export async function generateAiSentenceContent(
  text: string,
): Promise<GenerateSentenceResponse> {
  const { data } = await api.post<ApiResponse<GenerateSentenceResponse>>(
    "/sentences/ai",
    { text },
  );
  return data.data;
}