/**
 * ArabicText Module Types
 * Request/Response DTOs and related type definitions
 */

import { z } from "zod";
import {
  createArabicTextSchema,
  updateArabicTextSchema,
  listArabicTextsQuerySchema,
  generateArabicTextSchema,
} from "./arabicText.validation.js";

// Request Input Types
export type CreateArabicTextInput = z.infer<typeof createArabicTextSchema>;
export type UpdateArabicTextInput = z.infer<typeof updateArabicTextSchema>;
export type ListArabicTextsQuery = z.infer<typeof listArabicTextsQuerySchema>;
export type GenerateArabicTextInput = z.infer<typeof generateArabicTextSchema>;

// Response Types
export interface ArabicTextResponse {
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
  status: "DRAFT" | "PUBLISHED" | "ACTIVE" | "DISABLED";
  aiStatus: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  word?: { id: string } | null;
  sentence?: { id: string } | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface GenerateArabicTextResponse {
  arabicTextId: string;
  aiStatus: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
}