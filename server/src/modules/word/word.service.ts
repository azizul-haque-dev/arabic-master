import { Prisma } from "@/generated/prisma/client.js";
import { prisma } from "../../config/database.js";
import { ApiError } from "../../utils/api-error.js";
import { ListWordsQuery } from "./word.validation.js";

// Shared include so every response returns the Arabic text + categories
// in a consistent shape, without repeating the same object everywhere.
export const WORD_INCLUDE = {
  arabic: true,
  categories: { include: { category: true } },
} satisfies Prisma.WordInclude;

// Flattens the WordCategory join rows into a plain array of categories
// so the API response doesn't leak the join-table shape to clients.
function present(
  word: Prisma.WordGetPayload<{ include: typeof WORD_INCLUDE }>,
) {
  const { categories, ...rest } = word;
  return { ...rest, categories: categories.map((c) => c.category) };
}

export async function list(query: ListWordsQuery) {
  const { page, limit, status, categoryId, search } = query;

  const where: Prisma.WordWhereInput = {
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
    prisma.word.findMany({
      where,
      include: WORD_INCLUDE,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.word.count({ where }),
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
  const word = await prisma.word.findUnique({
    where: { id },
    include: WORD_INCLUDE,
  });
  if (!word) throw ApiError.notFound("Word not found");
  return present(word);
}

interface WordInput {
  text: string;
  audioUrl?: string;
  meaningEn?: string;
  meaningBn?: string;
  whenToUseEn?: string;
  whenToUseBn?: string;
  pronunciationEn?: string;
  pronunciationBn?: string;
  status?: Prisma.WordCreateInput["status"];
  categoryIds?: string[];
}

export async function create(input: WordInput) {
  const { text, audioUrl, categoryIds, ...wordFields } = input;

  const existingText = await prisma.arabicText.findUnique({ where: { text } });
  if (existingText) throw ApiError.conflict("This Arabic text already exists");

  const word = await prisma.word.create({
    data: {
      ...wordFields,
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

  return present(word);
}

export async function update(id: string, input: Partial<WordInput>) {
  const { text, audioUrl, categoryIds, ...wordFields } = input;
  await getById(id); // ensures 404 before attempting the update

  const word = await prisma.word.update({
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
      // Replacing category links: drop the old set, attach the new one.
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

  return present(word);
}

export async function remove(id: string): Promise<void> {
  const word = await prisma.word.findUnique({ where: { id } });
  if (!word) throw ApiError.notFound("Word not found");

  // Deleting the ArabicText cascades to Word and its category links.
  await prisma.arabicText.delete({ where: { id: word.arabicId } });
}
