import { api } from "@/lib/axios";
import type { ApiResponse } from "@/types";
import type { ConversationLine } from "@/types/conversation";

export interface ConversationLineInput {
  conversationId: string;
  sentenceId: string;
  speaker: string;
  position: number;
  meaningEn?: string;
  meaningBn?: string;
}

export async function createConversationLine(
  input: ConversationLineInput,
): Promise<ConversationLine> {
  const { data } = await api.post<ApiResponse<ConversationLine>>(
    "/conversation-lines",
    input,
  );
  return data.data;
}

export async function updateConversationLine(
  id: string,
  input: Partial<Omit<ConversationLineInput, "conversationId">>,
): Promise<ConversationLine> {
  const { data } = await api.patch<ApiResponse<ConversationLine>>(
    `/conversation-lines/${id}`,
    input,
  );
  return data.data;
}

export async function deleteConversationLine(id: string): Promise<void> {
  await api.delete(`/conversation-lines/${id}`);
}
