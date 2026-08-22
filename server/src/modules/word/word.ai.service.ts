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
 * Synchronous path used by sentence.ai.service.ts's getOrCreateWord - a
 * sentence needs each of its words to exist immediately (no queue) so
 * SentenceWord rows can be built in the same request. Kept intentionally
 * separate from the queued path above.
 *
 * FIX: previously, whenever `existingArabic` was truthy (any status), the
 * freshly-generated AI response's pronunciation/feminine/meaning/whenToUse
 * data was silently discarded - nothing was ever written back to that
 * ArabicText row. Now:
 *   - existingArabic missing        -> create ArabicText from AI response (unchanged)
 *   - existingArabic COMPLETED      -> reuse its stored fields as-is, don't
 *                                      let a second AI run overwrite good data
 *   - existingArabic PENDING/
 *     PROCESSING/FAILED             -> this is unfinished work; write the AI
 *                                      response into it via updateAiResult
 *                                      instead of leaving it stale
 */
export async function createWordViaAi(input: string) {
  const existingArabic = await ArabicTextRepository.findByText(input);

  if (existingArabic) {
    const linkedWord = await WordRepository.findByArabicId(existingArabic.id);
    if (linkedWord) return linkedWord;
  }

  const aiResponse = (await generateContent(input)) as AiResponse;

  // NOTE: still calling AI even when existingArabic is already COMPLETED,
  // because categoryEn/categoryBn (needed below) aren't persisted anywhere
  // on ArabicText - the schema has no reuse path for category classification.
  // getOrCreateCategory itself is a known separate violation (see memory
  // issue #1) - not touched by this fix.
  const categoryId = await getOrCreateCategory({
    categoryEn: aiResponse.categoryEn,
    categoryBn: aiResponse.categoryBn,
  });

  let arabicText;

  if (!existingArabic) {
    arabicText = await ArabicTextRepository.create({
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
    });
  } else if (existingArabic.aiStatus === GenerationStatus.COMPLETED) {
    // Already has real, previously-generated content - don't clobber it
    // with a second, possibly-divergent AI run.
    arabicText = existingArabic;
  } else {
    // PENDING / PROCESSING / FAILED - this row exists but was never
    // finished. This is our one chance to fill it in; previously this
    // branch wrote nothing at all.
    arabicText = await ArabicTextRepository.updateAiResult(existingArabic.id, {
      aiStatus: GenerationStatus.COMPLETED,
      meaningEn: aiResponse.meaningEn,
      meaningBn: aiResponse.meaningBn,
      whenToUseEn: aiResponse.whenToUseEn,
      whenToUseBn: aiResponse.whenToUseBn,
      pronunciationEn: aiResponse.pronunciationEn,
      pronunciationBn: aiResponse.pronunciationBn,
      feminineEn: aiResponse.feminineEn,
      feminineBn: aiResponse.feminineBn,
      errorMessage: null,
    });
  }

  const word = await WordRepository.createForExistingArabic(arabicText.id);

  // Mirror onto Word from arabicText's actual stored values - not
  // aiResponse directly - so the COMPLETED-reuse branch doesn't leak the
  // discarded second AI run's data onto the Word either.
  const [, , updatedWord] = await WordRepository.updateWithCategory(
    word.id,
    categoryId,
    {
      meaningEn: arabicText.meaningEn ?? undefined,
      meaningBn: arabicText.meaningBn ?? undefined,
      whenToUseEn: arabicText.whenToUseEn ?? undefined,
      whenToUseBn: arabicText.whenToUseBn ?? undefined,
    },
  );

  return updatedWord;
}