import { Prisma } from "@/generated/prisma/client.js";
import { cleanTextAndSpaces } from "@/utils/utils.js";
import { prisma } from "../../config/database.js";
import { ApiError } from "../../utils/api-error.js";
import { aiSententceService } from "../ai/sentence/ai.sentence.services.js";
import { createWordViaAi } from "../ai/word/word.services.js";
import { enQueueSentenceProcessing } from "./sentence.queue.js";
import { ListSentencesQuery, SentenceInput } from "./sentence.validation.js";

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
  // await prisma.$transaction
  const [items, total] = await Promise.all([
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

export async function getOrCreateWord(arabicText: string) {
  console.log({ arabicText });
  const cleanText = cleanTextAndSpaces(arabicText);
  console.log({ cleanText });

  // Split sentence into words and assign positions
  const wordsArr = cleanText.split(" ").map((word, index) => ({
    position: index + 1,
    word,
  }));

  console.log({ wordsArr });

  const wordIdswithPosition: { wordId: string; position: number }[] = [];

  for (const wordData of wordsArr) {
    try {
      // 1. Check if the word already exists in the database
      const existingWord = await prisma.word.findFirst({
        where: {
          arabic: {
            text: wordData.word,
          },
        },
      });
      console.log(`Checking DB for "${wordData.word}":`, { existingWord });
      let wordId: string | null;
      // 2. If it doesn't exist, attempt to generate it using AI
      if (existingWord) {
        wordId = existingWord.id;
        console.log(`Word "${wordData.word}" not found. Triggering AI...`);
      } else {
        const newWord = await createWordViaAi(wordData.word);

        if (!newWord) {
          console.error(
            `AI failed to generate word structure for: "${wordData.word}"`,
          );
          // Safely skip this word so it doesn't crash the remaining array iterations
          continue;
        }

        wordId = newWord.id;
        console.log(`Successfully created via AI:`, { newWord });
      }

      // 3. Push to results only if existingWord is guaranteed to be populated
      if (wordId) {
        wordIdswithPosition.push({
          wordId: wordId,
          position: wordData.position,
        });
      }
    } catch (error) {
      // Catching errors here keeps the loop running for other words
      console.error(`Error processing word "${wordData.word}":`, error);
    }
  }

  console.log({ finalWordIdsWithPosition: wordIdswithPosition });
  return wordIdswithPosition;
}

export async function processNewSentence(input: string) {
  // 1. Check if the text already exists in the database
  const existingText = await prisma.arabicText.findUnique({
    where: { text: input },
  });
  if (existingText) {
    throw ApiError.conflict("This Arabic text already exists");
  }

  // 3. Create a pending sentence record in the database

  const sentence = await aiSententceService.createPendingSentence(input);

  // 4. Dispatch the job to the background queue for asynchronous processing
  await enQueueSentenceProcessing(sentence.id);

  // 5. Return immediate response back to the client
  return {
    sentenceId: sentence.id,
    status: sentence.status,
  };
}
