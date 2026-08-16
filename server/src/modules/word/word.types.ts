/**
 * Word Module Types
 * Request/Response DTOs and related type definitions
 */

import { z } from "zod";
import {
  updateWordSchema,
  listWordsQuerySchema,
} from "./word.validation.js";
import type { WordInput } from "./word.validation.js";

// Request Input Types
export type { WordInput };
export type UpdateWordInput = z.infer<typeof updateWordSchema>;
export type ListWordsQuery = z.infer<typeof listWordsQuerySchema>;

// Response Types
export interface WordArabicText {
  id: string;
  text: string;
  audioUrl?: string | null;
  audioKey?: string | null;
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
  pronunciationEn?: string | null;
  pronunciationBn?: string | null;
  status: "DRAFT" | "PUBLISHED" | "ACTIVE" | "DISABLED";
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

export interface ProcessWordResponse {
  message: string;
  wordId: string;
  status: string;
}
