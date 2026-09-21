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

/**
 * A Conversation is built from Sentences — NEVER directly from an
 * ArabicEntity. This is the strictest relationship rule in the content
 * model; the UI must not offer any path that lets a Conversation turn
 * reference an entity instead of a sentence.
 */
export interface ConversationTurn {
  id: string;
  order: number;
  speaker: string; // free text, e.g. "Customer", "Seller"
  sentenceId: string;
}

export interface Conversation {
  id: string;
  conversationKey: string; // e.g. "CNV-3012"
  title: string;
  topic: string;
  category: string;
  turns: ConversationTurn[];
  lessonName?: string;
  status: ContentStatus;
  rejectionReason?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationMetaFormValues {
  title: string;
  topic: string;
  category: string;
}

/**
 * Lessons are a content workspace, not a single form. `items` holds Word/
 * Sentence/Conversation references grouped by type; `order` is scoped
 * *within* a content type (Words are ordered independently from
 * Sentences), matching the tabbed Words/Sentences/Conversations UI rather
 * than one interleaved sequence.
 *
 * `sectionId` is a real foreign key (Course/Section screens now exist).
 * Course is derived via the section, never stored redundantly on Lesson.
 */
export type LessonContentType = "WORD" | "SENTENCE" | "CONVERSATION";

export interface LessonContentItem {
  id: string;
  order: number;
  contentType: LessonContentType;
  contentId: string; // id of a Word, Sentence, or Conversation
}

export interface Lesson {
  id: string;
  lessonKey: string; // e.g. "LSN-4021"
  title: string;
  /** Real FK now that Course/Section screens exist — no more freeform strings. */
  sectionId: string;
  items: LessonContentItem[];
  /** Configurable per PRD §16/§17 — a recommendation, not a hard cap. */
  maxItemsRecommended: number;
  status: ContentStatus;
  rejectionReason?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface LessonMetaFormValues {
  title: string;
  sectionId: string;
  maxItemsRecommended: number;
}

/**
 * Course → Section → Lesson hierarchy (PRD §10). `Course.level` reuses
 * `DifficultyLevel` rather than a duplicate enum — same four values apply.
 */
export type CourseType = "FREE" | "PRO";

export interface Course {
  id: string;
  courseKey: string; // e.g. "CRS-1001"
  title: string;
  description: string;
  level: DifficultyLevel;
  courseType: CourseType;
  status: ContentStatus;
  rejectionReason?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CourseFormValues {
  title: string;
  description: string;
  level: DifficultyLevel;
  courseType: CourseType;
}

export interface Section {
  id: string;
  sectionKey: string; // e.g. "SEC-2001"
  courseId: string;
  title: string;
  description: string;
  order: number;
  status: ContentStatus;
  rejectionReason?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface SectionFormValues {
  title: string;
  description: string;
  courseId: string;
}

export const CONTENT_STATUS_LABEL: Record<ContentStatus, string> = {
  DRAFT: "Draft",
  IN_REVIEW: "In review",
  APPROVED: "Approved",
  PUBLISHED: "Published",
  REJECTED: "Rejected",
  ARCHIVED: "Archived",
};