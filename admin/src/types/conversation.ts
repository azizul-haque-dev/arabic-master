// Types for Topic -> TopicConversation -> Conversation -> ConversationLine.
// Mirrors the Prisma models. Kept separate from "@/types" so this file can
// be dropped in without touching your existing types/index.ts — just import
// from "@/types/conversation" in the files that need these.

export interface Topic {
  id: string;
  titleEn: string;
  titleBn: string | null;
  conversationCount?: number; // present on list responses if the API includes it
  createdAt: string;
  updatedAt: string;
}

export interface TopicConversation {
  id: string;
  topicId: string;
  titleEn: string;
  titleBn: string | null;
  topic?: Pick<Topic, "id" | "titleEn">;
  conversationCount?: number;
  createdAt: string;
  updatedAt: string;
}

// Minimal sentence shape as embedded in a ConversationLine.
export interface LineSentenceRef {
  id: string;
  arabic: { id: string; text: string; audioUrl: string | null };
  meaningEn: string | null;
  meaningBn: string | null;
}

export interface ConversationLine {
  id: string;
  conversationId: string;
  sentenceId: string;
  sentence: LineSentenceRef;
  speaker: string;
  position: number;
  meaningEn: string | null;
  meaningBn: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  id: string;
  topicConversationId: string;
  topicConversation?: Pick<TopicConversation, "id" | "titleEn" | "topicId">;
  lines: ConversationLine[];
  createdAt: string;
  updatedAt: string;
}
