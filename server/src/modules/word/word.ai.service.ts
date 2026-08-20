/**
 * Word AI Service
 * AI-powered word creation and enrichment
 */

import { GenerationStatus, Status } from "@/generated/prisma/enums.js";
import { ApiError } from "@/lib/api-error.js";
import { getOrCreateCategory } from "@/modules/category/category.service.js";
import { ArabicTextRepository } from "../arabicText/arabicText.repository.js";
import { generateContent } from "../ai/generateContent.js";
import { AiResponse } from "../ai/schema.js";
import { enqueueWordProcessing } from "./word.queue.js";
import { WordRepository } from "./word.repository.js";

/**
 * Async path used by POST /words/ai - creates/attaches a Word immediately
 * (PENDING), queues the actual AI call, returns without waiting.
 */
export async function createPendingWord(text: string) {
  const existingArabic = await ArabicTextRepository.findByText(text);

  if (existingArabic) {
    const linkedWord = await WordRepository.findByArabicId(existingArabic.id);
    if (linkedWord) {
      throw ApiError.conflict("A word already exists for this Arabic text");
    }

    const word = await WordRepository.createForExistingArabic(existingArabic.id);
    await enqueueWordProcessing(word.id);
    return word;
  }

  const arabicText = await ArabicTextRepository.create({
    text,
    status: Status.DRAFT,
    aiStatus: GenerationStatus.PENDING,
  });

  const word = await WordRepository.createForExistingArabic(arabicText.id);
  await enqueueWordProcessing(word.id);
  return word;
}

export async function processNewWord(input: string) {
  return createPendingWord(input);
}

/**
 * Synchronous path used by sentence.service.ts's getOrCreateWord - a
 * sentence needs each of its words to exist immediately (no queue) so
 * SentenceWord rows can be built in the same request. Kept intentionally
 * separate from the queued path above.
 */
export async function createWordViaAi(input: string) {
  const existingArabic = await ArabicTextRepository.findByText(input);

  if (existingArabic) {
    const linkedWord = await WordRepository.findByArabicId(existingArabic.id);
    if (linkedWord) return linkedWord;
  }

  const aiResponse = (await generateContent(input)) as AiResponse;

  const categoryId = await getOrCreateCategory({
    categoryEn: aiResponse.categoryEn,
    categoryBn: aiResponse.categoryBn,
  });

  const arabicText =
    existingArabic ??
    (await ArabicTextRepository.create({
      text: input,
      status: Status.DRAFT,
      aiStatus: GenerationStatus.COMPLETED,
      meaningEn: aiResponse.meaningEn,
      meaningBn: aiResponse.meaningBn,
      whenToUseEn: aiResponse.whenToUseEn,
      whenToUseBn: aiResponse.whenToUseBn,
      pronunciationEn: aiResponse.pronunciationEn,
      pronunciationBn: aiResponse.pronunciationBn,
      feminineEn: aiResponse.feminineEn,
      feminineBn: aiResponse.feminineBn,
    }));

  const word = await WordRepository.createForExistingArabic(arabicText.id);

  const [, , updatedWord] = await WordRepository.updateWithCategory(
    word.id,
    categoryId,
    {
      meaningEn: aiResponse.meaningEn,
      meaningBn: aiResponse.meaningBn,
      whenToUseEn: aiResponse.whenToUseEn,
      whenToUseBn: aiResponse.whenToUseBn,
    },
  );

  return updatedWord;
}