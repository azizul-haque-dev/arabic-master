import { api } from "@/lib/axios";
import type { ApiResponse } from "@/types";
import type { ConversationLine } from "@/types/conversation";

// Mirrors createConversationLineSchema / updateConversationLineSchema exactly:
// exactly one of `sentenceId` (reuse an existing sentence) or `text` (raw
// text — Arabic or not, auto-translated — that gets matched to an existing
// sentence or created fresh via the AI flow) must be provided, never both.

export interface CreateConversationLineInput {
  conversationId: string;
  speaker: string;
  position: number;
  sentenceId?: string;
  text?: string;
  meaningEn?: string;
  meaningBn?: string;
}

export async function createConversationLine(
  input: CreateConversationLineInput,
): Promise<ConversationLine> {
  const { data } = await api.post<ApiResponse<ConversationLine>>(
    "/conversation-lines",
    input,
  );
  return data.data;
}

export interface UpdateConversationLineInput {
  speaker?: string;
  position?: number;
  sentenceId?: string;
  text?: string;
  meaningEn?: string;
  meaningBn?: string;
}

// Note: conversationId is intentionally never accepted here — the backend
// fixes a line to its conversation at create time (moving a line between
// conversations is an unresolved product decision on the API side).
export async function updateConversationLine(
  id: string,
  input: UpdateConversationLineInput,
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