import { Prisma } from "@/generated/prisma/client.js";
import {
  cacheGet,
  cacheKey,
  cacheNamespaces,
  cacheSet,
  invalidateCacheNamespace,
} from "@/integrations/cache.js";
import { ApiError } from "@/lib/api-error.js";
import { CACHE_TTL } from "@/shared/constants.js";
import { cleanTextAndSpaces } from "@/utils/text.js";
import { createWordViaAi } from "../word/word.ai.service.js";
import { WordRepository } from "../word/word.repository.js";
import { createPendingSentence } from "./sentence.ai.service.js";
import { enQueueSentenceProcessing } from "./sentence.queue.js";
import { SentenceRepository, presentSentence } from "./sentence.repository.js";
import { ListSentencesQuery, SentenceInput } from "./sentence.validation.js";

// Re-export for controllers and other modules
export { SENTENCE_INCLUDE } from "./sentence.repository.js";

type SentenceListResult = {
  items: ReturnType<typeof presentSentence>[];
  meta: { page: number; limit: number; total: number; totalPages: number };
};

export async function list(query: ListSentencesQuery) {
  const key = cacheKey(cacheNamespaces.sentences, query);
  const cached = await cacheGet<SentenceListResult>(key);
  if (cached) return cached;

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

  const [items, total] = await Promise.all([
    SentenceRepository.findMany(where, (page - 1) * limit, limit),
    SentenceRepository.count(where),
  ]);

  const result: SentenceListResult = {
    items: items.map(presentSentence),
    meta: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
  await cacheSet(key, result, CACHE_TTL.SENTENCES);
  return result;
}

export async function getById(id: string) {
  const sentence = await SentenceRepository.findById(id);
  if (!sentence) throw ApiError.notFound("Sentence not found");
  return presentSentence(sentence);
}

export async function create(input: SentenceInput) {
  console.log("SentenceInput");
  const { text } = input;

  const existingText = await SentenceRepository.findArabicTextByText(text);
  console.log({ existingText });
  if (existingText) throw ApiError.conflict("This Arabic text already exists");

  const sentence = await SentenceRepository.create(input);

  const result = presentSentence(sentence);
  await invalidateCacheNamespace(cacheNamespaces.sentences);
  return result;
}

export async function update(id: string, input: Partial<SentenceInput>) {
  await getById(id);

  const sentence = await SentenceRepository.update(id, input);

  const result = presentSentence(sentence);
  await invalidateCacheNamespace(cacheNamespaces.sentences);
  return result;
}

export async function remove(id: string): Promise<void> {
  const sentence = await SentenceRepository.findById(id);
  if (!sentence) throw ApiError.notFound("Sentence not found");

  // Cascades to Sentence + its category/word links via ArabicText's onDelete.
  await SentenceRepository.delete(id);
  await invalidateCacheNamespace(cacheNamespaces.sentences);
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
      // For now using a simple lookup - ideally should optimize this query
      const arabicTextRecord = await WordRepository.findArabicTextByText(
        wordData.word,
      );
      const existingWord = arabicTextRecord
        ? await WordRepository.findById(arabicTextRecord.id)
        : null;

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
  const existingText = await SentenceRepository.findArabicTextByText(input);
  console.log(existingText);

  if (existingText) {
    // const deleted = await prisma.arabicText.delete({
    //   where: { id: existingText.id },
    // });
    // console.log(deleted);
    throw ApiError.conflict("This Arabic text already exists");
  }

  // 3. Create a pending sentence record in the database
  const sentence = await createPendingSentence(input);
  await invalidateCacheNamespace(cacheNamespaces.sentences);

  // 4. Dispatch the job to the background queue for asynchronous processing
  await enQueueSentenceProcessing(sentence.id);

  // 5. Return immediate response back to the client
  return {
    sentenceId: sentence.id,
    status: sentence.status,
  };
}
