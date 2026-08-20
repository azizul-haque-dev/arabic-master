// Database access layer for ArabicText operations.
//
// ArabicText is the shared parent row for Word/Sentence (1:1 each), and
// since the schema migration it is also the sole owner of all AI-generated
// enrichment fields (meaning/pronunciation/feminine/whenToUse) plus the
// generation lifecycle (`status` / `aiStatus`). Word/Sentence-specific data
// (categories, sentence word ordering, etc.) stays in their own modules.

import { Prisma } from "@/generated/prisma/client.js";
import { GenerationStatus } from "@/generated/prisma/enums.js";
import { prisma } from "@/config/database.js";
import {
  CreateArabicTextInput,
  UpdateArabicTextInput,
} from "./arabicText.types.js";

// Minimal linkage info only - whether this text already has a Word and/or
// Sentence attached. Full nested payloads belong to the word/sentence
// modules, not here.
export const ARABIC_TEXT_INCLUDE = {
  word: { select: { id: true } },
  sentence: { select: { id: true } },
} satisfies Prisma.ArabicTextInclude;

export interface UpdateAiResultData {
  aiStatus: GenerationStatus;
  meaningEn?: string;
  meaningBn?: string;
  whenToUseEn?: string;
  whenToUseBn?: string;
  pronunciationEn?: string;
  pronunciationBn?: string;
  feminineEn?: string;
  feminineBn?: string;
  errorMessage?: string | null;
}

export const ArabicTextRepository = {
  findMany: (where: Prisma.ArabicTextWhereInput, skip: number, take: number) =>
    prisma.arabicText.findMany({
      where,
      include: ARABIC_TEXT_INCLUDE,
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),

  count: (where: Prisma.ArabicTextWhereInput) =>
    prisma.arabicText.count({ where }),

  findById: (id: string) =>
    prisma.arabicText.findUnique({
      where: { id },
      include: ARABIC_TEXT_INCLUDE,
    }),

  findByText: (text: string) =>
    prisma.arabicText.findUnique({
      where: { text },
    }),

  create: (data: CreateArabicTextInput) =>
    prisma.arabicText.create({
      data,
      include: ARABIC_TEXT_INCLUDE,
    }),

  update: (id: string, data: UpdateArabicTextInput) =>
    prisma.arabicText.update({
      where: { id },
      data,
      include: ARABIC_TEXT_INCLUDE,
    }),

  delete: (id: string) => prisma.arabicText.delete({ where: { id } }),

  // Used by the AI worker to move an ArabicText through
  // PENDING -> PROCESSING -> COMPLETED/FAILED and fill in generated content.
  updateAiResult: (id: string, data: UpdateAiResultData) =>
    prisma.arabicText.update({
      where: { id },
      data,
    }),
};