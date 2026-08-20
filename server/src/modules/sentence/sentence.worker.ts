import { workerRedis } from "@/config/redis.js";
import { ApiError } from "@/lib/api-error.js";
import { Job, Worker } from "bullmq";
import { generateContent } from "../ai/generateContent.js";
import { AIResponseSchema } from "../ai/schema.js";
import { ArabicTextRepository } from "../arabicText/arabicText.repository.js";
import { getOrCreateWord } from "./sentence.ai.service.js";
import { SENTENCE_QUEUE_NAME } from "./sentence.queue.js";
import { SentenceRepository } from "./sentence.repository.js";

const processSentenceJob = async (job: Job<{ sentenceId: string }>) => {
  const { sentenceId } = job.data;

  const sentence = await SentenceRepository.findById(sentenceId);
  if (!sentence) {
    throw ApiError.badRequest(`Sentence not found by id ${sentenceId}`);
  }

  await ArabicTextRepository.updateAiResult(sentence.arabicId, {
    aiStatus: "PROCESSING",
  });

  try {
    const aiResponse = await generateContent(sentence.arabic.text);
    const parsed = AIResponseSchema.safeParse(aiResponse);
    if (!parsed.success) {
      throw ApiError.internal("AI failed to generate valid sentence content.");
    }
    const aiData = parsed.data;

    // aiData.categoryEn/categoryBn intentionally unused - sentence
    // categories are never set by AI, only by create/update.

    const wordsWithPosition = await getOrCreateWord(sentence.arabic.text);
    const sentenceWordsData = wordsWithPosition.map((item) => ({
      sentenceId,
      wordId: item.wordId,
      position: item.position,
    }));

    // ArabicText: owns pronunciation/feminine/aiStatus outright, gets
    // the mirrored copy of meaning/whenToUse.
    await ArabicTextRepository.updateAiResult(sentence.arabicId, {
      aiStatus: "COMPLETED",
      meaningEn: aiData.meaningEn,
      meaningBn: aiData.meaningBn,
      whenToUseEn: aiData.whenToUseEn,
      whenToUseBn: aiData.whenToUseBn,
      pronunciationEn: aiData.pronunciationEn,
      pronunciationBn: aiData.pronunciationBn,
      feminineEn: aiData.feminineEn,
      feminineBn: aiData.feminineBn,
      errorMessage: null,
    });

    // Sentence: its own meaning/whenToUse mirror + word list. No category.
    await SentenceRepository.updateAiResult(sentenceId, sentenceWordsData, {
      meaningEn: aiData.meaningEn,
      meaningBn: aiData.meaningBn,
      whenToUseEn: aiData.whenToUseEn,
      whenToUseBn: aiData.whenToUseBn,
    });
  } catch (error: any) {
    await ArabicTextRepository.updateAiResult(sentence.arabicId, {
      aiStatus: "FAILED",
      errorMessage: error.message || "Unknown error occurred during processing",
    });

    throw error;
  }
};

export const sentenceWorker = new Worker(SENTENCE_QUEUE_NAME, processSentenceJob, {
  connection: workerRedis,
  concurrency: 5,
});

sentenceWorker.on("failed", (job, error) => {
  console.log(
    `[Sentence Worker] Job ${job?.id} failed. Attempt ${job?.attemptsMade}. Error: ${error.message}`,
  );
});