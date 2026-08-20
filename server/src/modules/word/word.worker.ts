import { workerRedis } from "@/config/redis.js";
import { ApiError } from "@/lib/api-error.js";
import { getOrCreateCategory } from "@/modules/category/category.service.js";
import { Job, Worker } from "bullmq";
import { generateContent } from "../ai/generateContent.js";
import { AIResponseSchema } from "../ai/schema.js";
import { ArabicTextRepository } from "../arabicText/arabicText.repository.js";
import { WORD_QUEUE_NAME } from "./word.queue.js";
import { WordRepository } from "./word.repository.js";
import { Status } from "@/generated/prisma/enums.js";

const processWordJob = async (job: Job<{ wordId: string }>) => {
  const { wordId } = job.data;

  const word = await WordRepository.findById(wordId);
  if (!word) throw ApiError.notFound(`Word ${wordId} not found`);

  // aiStatus/status live on ArabicText only - never write them via WordRepository.
  await ArabicTextRepository.updateAiResult(word.arabicId, {
    aiStatus: "PROCESSING",
  });

  try {
    const aiResponse = await generateContent(word.arabic.text);
    const parsed = AIResponseSchema.safeParse(aiResponse);
    if (!parsed.success) {
      throw ApiError.internal("AI failed to generate valid word content.");
    }
    const aiData = parsed.data;

    // const categoryId = await getOrCreateCategory({
    //   categoryEn: aiData.categoryEn,
    //   categoryBn: aiData.categoryBn,
    // });

    // ArabicText: owns pronunciation/feminine/aiStatus outright, and
    // gets the mirrored copy of meaning/whenToUse.
    await ArabicTextRepository.updateAiResult(word.arabicId, {
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

    // Word: its own copy of meaning/whenToUse + category assignment.
    await WordRepository.updateAiData(job.data.wordId, {
      meaningEn: aiData.meaningEn,
      meaningBn: aiData.meaningBn,
      pronunciationEn: aiData.pronunciationEn,
      pronunciationBn: aiData.pronunciationBn,
      whenToUseEn: aiData.whenToUseEn,
      whenToUseBn: aiData.whenToUseBn,
      feminineBn: aiData.feminineBn,
      feminineEn: aiData.feminineEn,
      status: Status.DRAFT,
    });

  } catch (error: any) {
    await ArabicTextRepository.updateAiResult(word.arabicId, {
      aiStatus: "FAILED",
      errorMessage: error.message || "Unknown error occurred during processing",
    });

    throw error;
  }
};

export const wordWorker = new Worker(WORD_QUEUE_NAME, processWordJob, {
  connection: workerRedis,
  concurrency: 5,
});

wordWorker.on("failed", (job, error) => {
  console.log(
    `[Word Worker] Job ${job?.id} failed. Attempt ${job?.attemptsMade}. Error: ${error.message}`,
  );
});