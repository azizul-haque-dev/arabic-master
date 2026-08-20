import { z } from "zod";
import {
  updateWordSchema,
  listWordsQuerySchema,
} from "./word.validation.js";
import type { WordInput } from "./word.validation.js";

export type { WordInput };
export type UpdateWordInput = z.infer<typeof updateWordSchema>;
export type ListWordsQuery = z.infer<typeof listWordsQuerySchema>;

// Full ArabicText shape as returned by Prisma - includes fields this
// module never writes (pronunciation/feminine/status/aiStatus) since
// they come back on the relation regardless of who owns the write.
export interface WordArabicText {
  id: string;
  text: string;
  audioUrl?: string | null;
  audioKey?: string | null;
  meaningEn?: string | null;
  meaningBn?: string | null;
  whenToUseEn?: string | null;
  whenToUseBn?: string | null;
  pronunciationEn?: string | null;
  pronunciationBn?: string | null;
  feminineEn?: string | null;
  feminineBn?: string | null;
  errorMessage?: string | null;
  status?: "DRAFT" | "PUBLISHED" | "ACTIVE" | "DISABLED";
  aiStatus?: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
}

export interface WordCategory {
  id: string;
  nameEn: string;
  nameBn?: string | null;
}

export interface WordResponse {
  id: string;
  arabic: WordArabicText;
  meaningEn?: string | null;
  meaningBn?: string | null;
  whenToUseEn?: string | null;
  whenToUseBn?: string | null;
  categories: WordCategory[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateWordResponse {
  word: WordResponse;
  message: string;
}

export interface UpdateWordResponse {
  word: WordResponse;
  message: string;
}

export interface DeleteWordResponse {
  message: string;
}

export interface ListWordsResponse {
  words: WordResponse[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}