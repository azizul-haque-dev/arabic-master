// Database access layer for sentence operations.

import { Prisma, SentenceStatus } from "@/generated/prisma/client.js";
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
    prisma.arabicText.findUnique({
      where: { text },
    }),
  findByArabicText: (text: string) =>
    prisma.sentence.findFirst({
      where: { arabic: { text } },
      include: SENTENCE_INCLUDE,
    }),

  create: (data: {
    text: string;
    audioUrl?: string;
    status?: string;
    meaningEn?: string;
    meaningBn?: string;
    pronunciationEn?: string;
    pronunciationBn?: string;
    whenToUseEn?: string;
    whenToUseBn?: string;
    categoryIds?: string[];
    words?: Array<{ wordId: string; position: number }>;
  }) => {
    const { text, audioUrl, categoryIds, words, status, ...sentenceFields } =
      data;
    return prisma.sentence.create({
      data: {
        ...sentenceFields,
        ...(status ? { status: status as any } : {}),
        arabic: { create: { text, audioUrl } },
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
    return prisma.sentence.update({
      where: { id },
      data: {
        ...sentenceFields,
        ...(text || audioUrl
          ? {
              arabic: {
                update: {
                  ...(text ? { text } : {}),
                  ...(audioUrl ? { audioUrl } : {}),
                },
              },
            }
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
      include: SENTENCE_INCLUDE,
    });
  },

  updateWithStatus: (
    id: string,
    data: {
      status?: string;
      meaningEn?: string;
      meaningBn?: string;
      pronunciationEn?: string;
      pronunciationBn?: string;
      whenToUseEn?: string;
      whenToUseBn?: string;
      errorMessage?: string | null;
    },
  ) => {
    const { status, ...rest } = data;
    return prisma.sentence.update({
      where: { id },
      data: {
        ...rest,
        ...(status ? { status: status as any } : {}),
      },
      include: SENTENCE_INCLUDE,
    });
  },

  delete: (id: string) =>
    prisma.sentence.delete({
      where: { id },
      include: { arabic: true },
    }),

  updateStatus: (id: string, status: string, errorMessage?: string) =>
    prisma.sentence.update({
      where: { id },
      data: {
        status: status as any,
        ...(errorMessage ? { errorMessage } : {}),
      },
    }),

  updateStatusAndCategory: (
    sentenceId: string,
    categoryId: string,
    sentenceWordsData: Array<{
      sentenceId: string;
      wordId: string;
      position: number;
    }>,
    data: {
      meaningEn?: string;
      meaningBn?: string;
      pronunciationEn?: string;
      pronunciationBn?: string;
      feminineBn?: string;
      feminineEn?: string;
      whenToUseEn?: string;
      whenToUseBn?: string;
      status: SentenceStatus;
    },
  ) =>
    prisma.$transaction(async (tx) => {
      await tx.sentenceWord.deleteMany({
        where: { sentenceId },
      });
      await tx.sentenceCategory.deleteMany({
        where: { sentenceId },
      });
      await tx.sentenceWord.createMany({
        data: sentenceWordsData,
      });
      return tx.sentence.update({
        where: { id: sentenceId },
        data: {
          ...data,
          categories: {
            create: [{ categoryId }],
          },
        },
        include: SENTENCE_INCLUDE,
      });
    }),
};
