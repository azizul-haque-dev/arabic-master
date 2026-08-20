// Database access layer for sentence operations.

import { Prisma } from "@/generated/prisma/client.js";
import { prisma } from "../../config/database.js";
import { SentenceInput } from "./sentence.validation.js";

export const SENTENCE_INCLUDE = {
  arabic: true,
  categories: { include: { category: true } },
  words: {
    include: { word: { include: { arabic: true } } },
    orderBy: { position: "asc" },
  },
} satisfies Prisma.SentenceInclude;

// Flattens join tables (categories, ordered words) into plain arrays.
export function presentSentence(
  sentence: Prisma.SentenceGetPayload<{ include: typeof SENTENCE_INCLUDE }>,
) {
  const { categories, words, ...rest } = sentence;
  return {
    ...rest,
    categories: categories.map((c) => c.category),
    words: words.map((w) => ({ position: w.position, ...w.word })),
  };
}

// meaningEn/Bn + whenToUseEn/Bn are duplicated columns on ArabicText in
// the new schema. Sentence owns the source of truth here; every write
// mirrors the same values onto ArabicText. pronunciation/feminine/status
// are never touched by this module.
function arabicMirrorFields(data: Partial<SentenceInput>) {
  return {
    ...(data.meaningEn !== undefined ? { meaningEn: data.meaningEn } : {}),
    ...(data.meaningBn !== undefined ? { meaningBn: data.meaningBn } : {}),
    ...(data.whenToUseEn !== undefined ? { whenToUseEn: data.whenToUseEn } : {}),
    ...(data.whenToUseBn !== undefined ? { whenToUseBn: data.whenToUseBn } : {}),
  };
}

export const SentenceRepository = {
  findMany: (where: Prisma.SentenceWhereInput, skip: number, take: number) =>
    prisma.sentence.findMany({
      where,
      include: SENTENCE_INCLUDE,
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),

  count: (where: Prisma.SentenceWhereInput) => prisma.sentence.count({ where }),

  findById: (id: string) =>
    prisma.sentence.findUnique({
      where: { id },
      include: SENTENCE_INCLUDE,
    }),

  findArabicTextByText: (text: string) =>
    prisma.arabicText.findUnique({ where: { text } }),

  findByArabicId: (arabicId: string) =>
    prisma.sentence.findUnique({ where: { arabicId } }),
  findByArabicText: (text: string) =>
    prisma.sentence.findFirst({
      where: { arabic: { text } },
      include: SENTENCE_INCLUDE,
    }),
  createForExistingArabic: (arabicId: string) =>
    prisma.sentence.create({
      data: { arabicId },
      include: SENTENCE_INCLUDE,
    }),

  create: (data: SentenceInput) => {
    const { text, audioUrl, categoryIds, words, meaningEn, meaningBn, whenToUseEn, whenToUseBn } =
      data;

    return prisma.sentence.create({
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
        ...(words?.length ? { words: { create: words } } : {}),
      },
      include: SENTENCE_INCLUDE,
    });
  },

  update: (id: string, data: Partial<SentenceInput>) => {
    const { text, audioUrl, categoryIds, words, ...sentenceFields } = data;

    const arabicUpdate = {
      ...(text ? { text } : {}),
      ...(audioUrl ? { audioUrl } : {}),
      ...arabicMirrorFields(data),
    };

    return prisma.sentence.update({
      where: { id },
      data: {
        ...sentenceFields,
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
        // FIX: old code destructured `words` out and silently dropped it.
        // Now it gets the same replace-all treatment as categories.
        ...(words ? { words: { deleteMany: {}, create: words } } : {}),
      },
      include: SENTENCE_INCLUDE,
    });
  },

  // AI-completion write: replaces the sentence's word list and updates
  // its own meaning/whenToUse mirror. Deliberately takes no categoryId -
  // category is never touched by this path.
  updateAiResult: (
    sentenceId: string,
    sentenceWordsData: Array<{ sentenceId: string; wordId: string; position: number }>,
    data: {
      meaningEn?: string;
      meaningBn?: string;
      whenToUseEn?: string;
      whenToUseBn?: string;
    },
  ) =>
    prisma.$transaction(async (tx) => {
      await tx.sentenceWord.deleteMany({ where: { sentenceId } });
      if (sentenceWordsData.length) {
        await tx.sentenceWord.createMany({ data: sentenceWordsData });
      }
      return tx.sentence.update({
        where: { id: sentenceId },
        data,
        include: SENTENCE_INCLUDE,
      });
    }),

  delete: (id: string) =>
    prisma.sentence.delete({
      where: { id },
      include: { arabic: true },
    }),

  // 1:1 relation - deleting ArabicText cascades to Sentence + its
  // category/word links.
  deleteArabicText: (arabicId: string) =>
    prisma.arabicText.delete({ where: { id: arabicId } }),
};