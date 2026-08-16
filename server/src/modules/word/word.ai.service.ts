/**
 * Word AI Service
 * AI-powered word creation and enrichment
 */

import { Status } from "@/generated/prisma/enums.js";
import { getOrCreateCategory } from "@/modules/category/category.service.js";
import { enqueueWordProcessing } from "./word.queue.js";
import { create } from "./word.service.js";
import { WordRepository } from "./word.repository.js";
import { generateContent } from "../ai/generateContent.js";
import { AiResponse } from "../ai/schema.js";

/**
 * Create a pending word record for later AI processing
 * Persists minimal data and queues for asynchronous enrichment
 */
export async function createPendingWord(text: string) {
  const word = await create({ text, status: Status.DRAFT });
  await enqueueWordProcessing(word.id);
  return word;
}

/**
 * Create a new word with full AI enrichment immediately
 * Generates AI content for the Arabic text and saves it with appropriate metadata
 */
export async function createWordViaAi(input: string) {
  try {
    const result = (await generateContent(input)) as AiResponse;

    const categoryData = {
      categoryBn: result.categoryBn,
      categoryEn: result.categoryEn,
    };
    const categoryId = await getOrCreateCategory(categoryData);

    const word = await WordRepository.create({
      text: input,
      meaningEn: result.meaningEn,
      meaningBn: result.meaningBn,
      whenToUseEn: result.whenToUseEn,
      whenToUseBn: result.whenToUseBn,
      pronunciationEn: result.pronunciationEn,
      pronunciationBn: result.pronunciationBn,
      status: "DRAFT",
      categoryIds: categoryId ? [categoryId] : undefined,
    });

    return word;
  } catch (error) {
    console.error("Error creating word via AI:", error);
    throw error;
  }
}

export async function processNewWord(input: string) {
  return createPendingWord(input);
}
