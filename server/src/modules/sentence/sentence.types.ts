/**
 * Sentence Module Types
 * Request/Response DTOs and related type definitions
 */

import { z } from "zod";
import {
  updateSentenceSchema,
  listSentencesQuerySchema,
} from "./sentence.validation.js";
import type { SentenceInput } from "./sentence.validation.js";

// Request Input Types
export type { SentenceInput };
export type UpdateSentenceInput = z.infer<typeof updateSentenceSchema>;
export type ListSentencesQuery = z.infer<typeof listSentencesQuerySchema>;

// Response Types
export interface SentenceArabicText {
  id: string;
  text: string;
  audioUrl?: string | null;
  audioKey?: string | null;
}

export interface SentenceCategory {
  id: string;
  nameEn: string;
  nameBn?: string | null;
}

export interface SentenceWord {
  id: string;
  arabic: {
    text: string;
  };
  position: number;
  meaningEn?: string | null;
  meaningBn?: string | null;
  pronunciationEn?: string | null;
  pronunciationBn?: string | null;
}

export interface SentenceResponse {
  id: string;
  arabic: SentenceArabicText;
  pronunciationEn: string;
  pronunciationBn: string;
  meaningEn: string;
  meaningBn: string;
  whenToUseEn?: string | null;
  whenToUseBn?: string | null;
  status: "DRAFT" | "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "PUBLISHED" | "ACTIVE" | "DISABLED";
  errorMessage?: string | null;
  categories: SentenceCategory[];
  words: SentenceWord[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateSentenceResponse {
  sentence: SentenceResponse;
  message: string;
}

export interface UpdateSentenceResponse {
  sentence: SentenceResponse;
  message: string;
}

export interface DeleteSentenceResponse {
  message: string;
}

export interface ListSentencesResponse {
  sentences: SentenceResponse[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface GenerateSentenceResponse {
  sentenceId: string;
  message: string;
  status: string;
}
