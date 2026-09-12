/**
 * Shared content-management types.
 *
 * These mirror the Prisma-level ContentStatus enum and the Arabic Master
 * role model documented in the PRD. Keep this file framework-agnostic —
 * it should be importable from server components, client components,
 * and (later) API response types without modification.
 */

export type ContentStatus =
  | "DRAFT"
  | "IN_REVIEW"
  | "APPROVED"
  | "PUBLISHED"
  | "REJECTED"
  | "ARCHIVED";

export type AdminRole = "ADMIN" | "CONTENT_MANAGER";

/**
 * Arabic Entity — the canonical, reusable Arabic text layer.
 *
 * Relationship rules (enforced in UI, not just documented):
 * - A Word references exactly one ArabicEntity.
 * - A Sentence references exactly one ArabicEntity.
 * - A Conversation references Sentences only — never an ArabicEntity directly.
 */
export interface ArabicEntity {
  id: string;
  entityKey: string; // e.g. "AE-1024"
  arabicText: string;
  normalizedText: string;
  meaningBangla: string;
  meaningEnglish: string;
  pronunciationBangla: string;
  pronunciationEnglish: string;
  hasAudio: boolean;
  audioUrl?: string;
  status: ContentStatus;
  wordUsageCount: number;
  sentenceUsageCount: number;
  conversationUsageCount: number;
  rejectionReason?: string;
  createdBy: string;
  updatedAt: string; // ISO date
  createdAt: string; // ISO date
}

export interface EntityFormValues {
  arabicText: string;
  meaningBangla: string;
  meaningEnglish: string;
  pronunciationBangla: string;
  pronunciationEnglish: string;
}

/**
 * A Word references exactly one ArabicEntity (see relationship rules above).
 * Grammar variant tables (I/You-M/You-F/He/She/We/They for verbs, etc.) are
 * intentionally NOT modeled here — the PRD lists "Advanced Grammar
 * Variants" under Phase 2, so building the full variant editor now would be
 * scope creep ahead of the data it depends on. `wordType` and `gender` are
 * kept so the variant system has somewhere to attach later without a
 * migration.
 */
export type WordType = "NOUN" | "VERB" | "ADJECTIVE" | "OTHER";

export interface Word {
  id: string;
  wordKey: string; // e.g. "W-2048"
  entityId: string;
  arabicText: string; // denormalized copy of the entity's canonical text, for display
  meaningBangla: string;
  meaningEnglish: string;
  pronunciationBangla: string;
  pronunciationEnglish: string;
  whenToUseBangla: string;
  whenToUseEnglish: string;
  wordType: WordType;
  category: string;
  lessonName?: string; // denormalized; lesson assignment UI is Phase 2 scope
  status: ContentStatus;
  rejectionReason?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface WordFormValues {
  meaningBangla: string;
  meaningEnglish: string;
  pronunciationBangla: string;
  pronunciationEnglish: string;
  whenToUseBangla: string;
  whenToUseEnglish: string;
  wordType: WordType;
  category: string;
}

export const WORD_TYPE_LABEL: Record<WordType, string> = {
  NOUN: "Noun",
  VERB: "Verb",
  ADJECTIVE: "Adjective",
  OTHER: "Other",
};

/**
 * A Sentence references exactly one ArabicEntity (same rule as Word).
 * Conversations reference Sentences — never an ArabicEntity directly — so
 * `usedInConversations` here is what actually lets a Sentence be deleted
 * safely or not; it is independent of the source entity's own usage count.
 */
export type DifficultyLevel = "BEGINNER" | "ELEMENTARY" | "INTERMEDIATE" | "ADVANCED";

export interface Sentence {
  id: string;
  sentenceKey: string; // e.g. "SNT-1024"
  entityId: string;
  arabicText: string; // denormalized copy of the entity's canonical text, for display
  meaningBangla: string;
  meaningEnglish: string;
  pronunciationBangla: string;
  pronunciationEnglish: string;
  context: string; // when/how this sentence is typically used
  difficulty: DifficultyLevel;
  category: string;
  relatedWordId?: string; // optional link to a Word that uses the same entity
  usedInLessons: number;
  usedInConversations: number;
  status: ContentStatus;
  rejectionReason?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface SentenceFormValues {
  meaningBangla: string;
  meaningEnglish: string;
  pronunciationBangla: string;
  pronunciationEnglish: string;
  context: string;
  difficulty: DifficultyLevel;
  category: string;
  relatedWordId?: string;
}

export const DIFFICULTY_LABEL: Record<DifficultyLevel, string> = {
  BEGINNER: "Beginner",
  ELEMENTARY: "Elementary",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
};

export const CONTENT_STATUS_LABEL: Record<ContentStatus, string> = {
  DRAFT: "Draft",
  IN_REVIEW: "In review",
  APPROVED: "Approved",
  PUBLISHED: "Published",
  REJECTED: "Rejected",
  ARCHIVED: "Archived",
};