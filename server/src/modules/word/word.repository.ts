// Database access layer for word operations.

import { Prisma, Status } from "@/generated/prisma/client.js";
import { prisma } from "../../config/database.js";
import { WordInput } from "./word.validation.js";

export const WORD_INCLUDE = {
  arabic: true,
  categories: { include: { category: true } },
} satisfies Prisma.WordInclude;

// Flattens the WordCategory join rows into a plain array of categories
// so the API response doesn't leak the join-table shape to clients.
export function presentWord(
  word: Prisma.WordGetPayload<{ include: typeof WORD_INCLUDE }>,
) {
  const { categories, ...rest } = word;
  return { ...rest, categories: categories.map((c) => c.category) };
}

// meaningEn/Bn + whenToUseEn/Bn are duplicated columns on ArabicText in
// the new schema. Word owns the source of truth here, and every write
// mirrors the same values onto ArabicText. Nothing else on ArabicText
// (pronunciation/feminine/status/aiStatus) is touched by this module.
function arabicMirrorFields(data: Partial<WordInput>) {
  return {
    ...(data.meaningEn !== undefined ? { meaningEn: data.meaningEn } : {}),
    ...(data.meaningBn !== undefined ? { meaningBn: data.meaningBn } : {}),
    ...(data.whenToUseEn !== undefined ? { whenToUseEn: data.whenToUseEn } : {}),
    ...(data.whenToUseBn !== undefined ? { whenToUseBn: data.whenToUseBn } : {}),
  };
}

export const WordRepository = {
  findMany: (where: Prisma.WordWhereInput, skip: number, take: number) =>
    prisma.word.findMany({
      where,
      include: WORD_INCLUDE,
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),

  count: (where: Prisma.WordWhereInput) => prisma.word.count({ where }),

  findById: (id: string) =>
    prisma.word.findUnique({
      where: { id },
      include: WORD_INCLUDE,
    }),

  findArabicTextByText: (text: string) =>
    prisma.arabicText.findUnique({
      where: { text },
    }),

  create: (data: WordInput) => {
    const { text, audioUrl, categoryIds, meaningEn, meaningBn, whenToUseEn, whenToUseBn } = data;

    return prisma.word.create({
      data: {
        meaningEn,
        meaningBn,
        whenToUseEn,
        whenToUseBn,
        arabic: {
          create: {
            text,
            audioUrl,
            ...arabicMirrorFields(data),
          },
        },
        ...(categoryIds?.length
          ? {
            categories: {
              create: categoryIds.map((categoryId) => ({ categoryId })),
            },
          }
          : {}),
      },
      include: WORD_INCLUDE,
    });
  },

  update: (id: string, data: Partial<WordInput>) => {
    const { text, audioUrl, categoryIds, ...wordFields } = data;

    const arabicUpdate = {
      ...(text ? { text } : {}),
      ...(audioUrl ? { audioUrl } : {}),
      ...arabicMirrorFields(data),
    };

    return prisma.word.update({
      where: { id },
      data: {
        ...wordFields,
        ...(Object.keys(arabicUpdate).length
          ? { arabic: { update: arabicUpdate } }
          : {}),
        ...(categoryIds
          ? {
            categories: {
              deleteMany: {},
              create: categoryIds.map((categoryId) => ({ categoryId })),
            },
          }
          : {}),
      },
      include: WORD_INCLUDE,
    });
  },

  delete: (id: string) =>
    prisma.word.delete({
      where: { id },
    }),

  // 1:1 relation - deleting ArabicText cascades to Word + its category links.
  deleteArabicText: (arabicId: string) =>
    prisma.arabicText.delete({
      where: { id: arabicId },
    }),

  // Looks up the Word linked to a given ArabicText, if any - used to
  // detect "AI already ran for this text" before attaching a new Word.
  findByArabicId: (arabicId: string) =>
    prisma.word.findUnique({ where: { arabicId } }),

  // Attaches a bare Word row to an ArabicText that already exists
  // (as opposed to WordRepository.create, which nested-creates a new
  // ArabicText). Used only by the AI path.
  createForExistingArabic: (arabicId: string) =>
    prisma.word.create({
      data: { arabicId },
      include: WORD_INCLUDE,
    }),

  // AI-completion write: sets Word's own meaning/whenToUse mirror and
  // replaces its category in one transaction. Word has no status field
  // to touch here - that's ArabicTextRepository.updateAiResult's job.
  updateWithCategory: (
    wordId: string,
    categoryId: string,
    data: {
      meaningEn?: string;
      meaningBn?: string;
      whenToUseEn?: string;
      whenToUseBn?: string;
    },
  ) =>
    prisma.$transaction([
      prisma.wordCategory.deleteMany({ where: { wordId } }),
      prisma.wordCategory.create({ data: { wordId, categoryId } }),
      prisma.word.update({
        where: { id: wordId },
        data,
        include: WORD_INCLUDE,
      }),
    ]),
  updateAiData: (
    wordId: string,
    data: {
      meaningEn?: string;
      meaningBn?: string;
      pronunciationEn?: string;
      pronunciationBn?: string;
      feminineBn?: string;
      feminineEn?: string;
      whenToUseEn?: string;
      whenToUseBn?: string;
      status: Status;
    },
  ) => {
    const {
      meaningEn,
      meaningBn,
      whenToUseEn,
      whenToUseBn,
      pronunciationEn,
      pronunciationBn,
      feminineBn,
      feminineEn,
      status,
    } = data;
    return prisma.word.update({
      where: { id: wordId },
      data: {
        meaningEn,
        meaningBn,
        whenToUseEn,
        whenToUseBn,
        arabic: {
          update: {
            status,
            pronunciationEn,
            pronunciationBn,
            feminineBn,
            feminineEn,
          },
        },
      },
      include: WORD_INCLUDE,
    });
  },

  updateStatusAndCategory: (
    wordId: string,
    categoryId: string,
    data: {
      meaningEn?: string;
      meaningBn?: string;
      pronunciationEn?: string;
      pronunciationBn?: string;
      feminineBn?: string;
      feminineEn?: string;
      whenToUseEn?: string;
      whenToUseBn?: string;
      status: Status;
    },
  ) =>
    prisma.$transaction([
      prisma.wordCategory.deleteMany({ where: { wordId } }),
      prisma.wordCategory.create({ data: { wordId, categoryId } }),
      prisma.word.update({
        where: { id: wordId },
        data,
        include: WORD_INCLUDE,
      }),
    ]),

};