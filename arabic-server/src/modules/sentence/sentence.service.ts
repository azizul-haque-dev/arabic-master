import { Prisma } from "@/generated/prisma/client.js";
import { prisma } from "../../config/database.js";
import { ApiError } from "../../utils/api-error.js";
import { ListSentencesQuery } from "./sentence.validation.js";

const SENTENCE_INCLUDE = {
  arabic: true,
  categories: { include: { category: true } },
  words: {
    include: { word: { include: { arabic: true } } },
    orderBy: { position: "asc" },
  },
} satisfies Prisma.SentenceInclude;

type SentenceWithRelations = Prisma.SentenceGetPayload<{
  include: typeof SENTENCE_INCLUDE;
}>;

// Flattens join tables (categories, ordered words) into plain arrays.
function present(sentence: SentenceWithRelations) {
  const { categories, words, ...rest } = sentence;
  return {
    ...rest,
    categories: categories.map((c) => c.category),
    words: words.map((w) => ({ position: w.position, ...w.word })),
  };
}

export async function list(query: ListSentencesQuery) {
  const { page, limit, status, categoryId, search } = query;

  const where: Prisma.SentenceWhereInput = {
    ...(status ? { status } : {}),
    ...(categoryId ? { categories: { some: { categoryId } } } : {}),
    ...(search
      ? {
          OR: [
            { arabic: { text: { contains: search, mode: "insensitive" } } },
            { meaningEn: { contains: search, mode: "insensitive" } },
            { meaningBn: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [items, total] = await prisma.$transaction([
    prisma.sentence.findMany({
      where,
      include: SENTENCE_INCLUDE,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.sentence.count({ where }),
  ]);

  return {
    items: items.map(present),
    meta: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
}

export async function getById(id: string) {
  const sentence = await prisma.sentence.findUnique({
    where: { id },
    include: SENTENCE_INCLUDE,
  });
  if (!sentence) throw ApiError.notFound("Sentence not found");
  return present(sentence);
}

interface SentenceInput {
  text: string;
  audioUrl?: string;
  pronunciationEn: string;
  pronunciationBn: string;
  meaningEn: string;
  meaningBn: string;
  whenToUseEn?: string;
  whenToUseBn?: string;
  status?: Prisma.SentenceCreateInput["status"];
  categoryIds?: string[];
  words?: { wordId: string; position: number }[];
}

export async function create(input: SentenceInput) {
  const { text, audioUrl, categoryIds, words, ...sentenceFields } = input;

  const existingText = await prisma.arabicText.findUnique({ where: { text } });
  if (existingText) throw ApiError.conflict("This Arabic text already exists");

  const sentence = await prisma.sentence.create({
    data: {
      ...sentenceFields,
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

  return present(sentence);
}

export async function update(id: string, input: Partial<SentenceInput>) {
  const { text, audioUrl, categoryIds, words, ...sentenceFields } = input;
  await getById(id);

  const sentence = await prisma.sentence.update({
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
      ...(words ? { words: { deleteMany: {}, create: words } } : {}),
    },
    include: SENTENCE_INCLUDE,
  });

  return present(sentence);
}

export async function remove(id: string): Promise<void> {
  const sentence = await prisma.sentence.findUnique({ where: { id } });
  if (!sentence) throw ApiError.notFound("Sentence not found");

  // Cascades to Sentence + its category/word links via ArabicText's onDelete.
  await prisma.arabicText.delete({ where: { id: sentence.arabicId } });
}
