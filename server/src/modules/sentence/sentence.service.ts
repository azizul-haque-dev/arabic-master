import { Prisma } from "@/generated/prisma/client.js";
import { createWordViaAi } from "@/test.js";

import { generateContent } from "@/utils/aiGenrateContent.js";
import { cleanTextAndSpaces } from "@/utils/utils.js";
import { prisma } from "../../config/database.js";
import { ApiError } from "../../utils/api-error.js";
import { aiSententceService } from "../ai/sentence/ai.sentence.services.js";
import { enQueueSentenceProcessing } from "./sentence.queue.js";
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

export async function getOrCreateWord(arabicText: string) {
  console.log({ arabicText });
  const cleanText = cleanTextAndSpaces(arabicText);
  console.log({ cleanText });

  // split(" ") on "يا الحبيب" results in ['يا', 'الحبيب']
  const wordsArr = cleanText.split(" ").map((word, index) => ({
    position: index + 1,
    word,
  }));

  console.log({ wordsArr }); // Verify we have 2 words to process

  const wordIdswithPosition: { wordId: string; position: number }[] = [];

  for (const wordData of wordsArr) {
    try {
      // 1. Check if the word exists in the DB
      let existingWord = await prisma.word.findFirst({
        where: {
          arabic: {
            text: wordData.word,
          },
        },
      });
      console.log(`Checking DB for "${wordData.word}":`, { existingWord });

      // 2. If it doesn't exist, try to generate it using AI
      if (!existingWord) {
        console.log(`Word "${wordData.word}" not found. Triggering AI...`);
        const newWord = await createWordViaAi(wordData.word);

        if (!newWord) {
          console.error(
            `AI failed to generate word structure for: "${wordData.word}"`,
          );
          continue; // Skip this word instead of crashing the entire array generation
        }

        existingWord = newWord;
        console.log(`Successfully created via AI:`, { newWord });
      }

      // 3. Push to results
      wordIdswithPosition.push({
        wordId: existingWord.id,
        position: wordData.position,
      });
    } catch (error) {
      // Catching errors here keeps the loop running for other words
      console.error(`Error processing word "${wordData.word}":`, error);
    }
  }

  console.log({ finalWordIdsWithPosition: wordIdswithPosition });
  return wordIdswithPosition;
}

export async function processNewSentence(input: string) {
  console.log("processNewSentence input:", input);

  // 1. Check if the text already exists in the database
  const existingText = await prisma.arabicText.findUnique({
    where: { text: input },
  });
  if (existingText) {
    throw ApiError.conflict("This Arabic text already exists");
  }

  // 2. Call AI content generator (which can return AiResponse or undefined)
  const aiSentenceResponse = await generateContent(input);

  // Type Guard: If the AI response is undefined, throw an internal error
  if (!aiSentenceResponse) {
    console.error(`AI failed to generate response for: "${input}"`);
    throw ApiError.internal(
      "AI failed to generate a valid response for this sentence.",
    );
  }

  // 3. Create a pending sentence record in the database
  // Note: Corrected the spelling typos from your original code
  const sentence =
    await aiSententceService.createPendingSentence(aiSentenceResponse);

  // 4. Dispatch the job to the background queue for asynchronous processing
  await enQueueSentenceProcessing(sentence.id);

  // 5. Return immediate response back to the client
  return {
    success: true,
    sentenceId: sentence.id,
    status: sentence.status,
  };
}
