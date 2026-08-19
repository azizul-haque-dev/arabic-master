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
  }) => {
    const { text, audioUrl, categoryIds, status, ...wordFields } = data;
    return prisma.word.create({
      data: {
        ...wordFields,
        ...(status ? { status: status as any } : {}),
        arabic: { create: { text, audioUrl } },
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
    return prisma.word.update({
      where: { id },
      data: {
        ...wordFields,
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
      include: WORD_INCLUDE,
    });
  },

  delete: (id: string) =>
    prisma.word.delete({
      where: { id },
    }),

  deleteArabicText: (arabicId: string) =>
    prisma.arabicText.delete({
      where: { id: arabicId },
    }),

  updateWithStatus: (
    id: string,
    data: {
      meaningEn?: string;
      meaningBn?: string;
      pronunciationEn?: string;
      pronunciationBn?: string;
      whenToUseEn?: string;
      whenToUseBn?: string;
      status?: string;
      categoryId?: string;
    },
  ) => {
    const { status, ...rest } = data;
    return prisma.word.update({
      where: { id },
      data: {
        ...rest,
        ...(status ? { status: status as any } : {}),
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
