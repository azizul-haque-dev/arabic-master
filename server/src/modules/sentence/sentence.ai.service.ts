/**
 * Sentence AI Service
 * AI-powered sentence creation and word linking
 */

import { GenerationStatus, Status } from "@/generated/prisma/enums.js";

import { cleanTextAndSpaces } from "@/utils/text.js";
import { ArabicTextRepository } from "../arabicText/arabicText.repository.js";
import { createWordViaAi } from "../word/word.ai.service.js";
import { WordRepository } from "../word/word.repository.js";
import { enQueueSentenceProcessing } from "./sentence.queue.js";
import { SentenceRepository } from "./sentence.repository.js";


/**
 * Async path used by POST /sentences/ai and conversation-line's
 * free-text path - creates/attaches a Sentence immediately (PENDING),
 * queues the actual AI call, returns without waiting.
 */
export async function createPendingSentence(text: string) {
  const existingArabic = await ArabicTextRepository.findByText(text);

  if (existingArabic) {
    const linkedSentence = await SentenceRepository.findByArabicId(existingArabic.id);
    if (linkedSentence) {
      return { sentenceId: linkedSentence.id, aiStatus: existingArabic.aiStatus };
    }

    const sentence = await SentenceRepository.createForExistingArabic(existingArabic.id);
    await enQueueSentenceProcessing(sentence.id);
    return { sentenceId: sentence.id, aiStatus: existingArabic.aiStatus };
  }

  const arabicText = await ArabicTextRepository.create({
    text,
    status: Status.DRAFT,
    aiStatus: GenerationStatus.PENDING,
  });

  const sentence = await SentenceRepository.createForExistingArabic(arabicText.id);
  await enQueueSentenceProcessing(sentence.id);

  return { sentenceId: sentence.id, aiStatus: arabicText.aiStatus };
}

export async function processNewSentence(input: string) {
  return createPendingSentence(input);
}

/**
 * Splits a sentence's Arabic text into individual words and get-or-creates
 * a Word for each one via the word AI path. Returns wordId+position pairs
 * ready to be written as SentenceWord rows.
 */
export async function getOrCreateWord(arabicText: string) {
  const cleanText = cleanTextAndSpaces(arabicText);

  const wordsArr = cleanText.split(" ").map((word, index) => ({
    position: index + 1,
    word,
  }));

  const wordIdsWithPosition: { wordId: string; position: number }[] = [];

  for (const wordData of wordsArr) {
    try {
      const arabicTextRecord = await ArabicTextRepository.findByText(wordData.word);
      const existingWord = arabicTextRecord
        ? await WordRepository.findByArabicId(arabicTextRecord.id)
        : null;

      let wordId: string | null;

      if (existingWord) {
        wordId = existingWord.id;
      } else {
        const newWord = await createWordViaAi(wordData.word);
        if (!newWord) {
          console.error(`AI failed to generate word structure for: "${wordData.word}"`);
          continue;
        }
        wordId = newWord.id;
      }

      if (wordId) {
        wordIdsWithPosition.push({ wordId, position: wordData.position });
      }
    } catch (error) {
      // One bad word shouldn't kill the whole sentence's word linking.
      console.error(`Error processing word "${wordData.word}":`, error);
    }
  }

  return wordIdsWithPosition;
}