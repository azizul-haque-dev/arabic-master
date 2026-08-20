import { z } from "zod";
import {
  updateSentenceSchema,
  listSentencesQuerySchema,
} from "./sentence.validation.js";
import type { SentenceInput } from "./sentence.validation.js";

export type { SentenceInput };
export type UpdateSentenceInput = z.infer<typeof updateSentenceSchema>;
export type ListSentencesQuery = z.infer<typeof listSentencesQuerySchema>;

export interface SentenceArabicText {
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

export interface SentenceCategory {
  id: string;
  nameEn: string;
  nameBn?: string | null;
}

export interface SentenceWord {
  id: string;
  arabic: { text: string };
  position: number;
  meaningEn?: string | null;
  meaningBn?: string | null;
}

export interface SentenceResponse {
  id: string;
  arabic: SentenceArabicText;
  meaningEn?: string | null;
  meaningBn?: string | null;
  whenToUseEn?: string | null;
  whenToUseBn?: string | null;
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