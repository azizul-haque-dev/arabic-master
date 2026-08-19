import { workerRedis } from "@/config/redis.js";
import { SentenceStatus } from "@/generated/prisma/enums.js";
import { ApiError } from "@/lib/api-error.js";
import { getOrCreateCategory } from "@/modules/category/category.service.js";
import { Job, Worker } from "bullmq";
import { generateContent } from "../ai/generateContent.js";
import { AIResponseSchema } from "../ai/schema.js";
import { SENTENCE_QUEUE_NAME } from "./sentence.queue.js";
import { SentenceRepository } from "./sentence.repository.js";
import { getOrCreateWord } from "./sentence.service.js";

const processSentenceJob = async (job: Job<{ sentenceId: string }>) => {
  const { sentenceId } = job.data;
  const startTime = Date.now();
  console.log(`[Worker] Job ${job.id} started processing.`);

  // Load sentence
  const sentence = await SentenceRepository.findById(sentenceId);
  console.log("worker got the sentence:", sentence);

  if (!sentence) {
    throw ApiError.badRequest(`Sentence not found by id ${sentenceId}`);
  }

  // Update sentence status to PROCESSING
  await SentenceRepository.updateStatus(sentenceId, SentenceStatus.PROCESSING);

  try {
    // All expensive AI enrichment happens in this worker, never in the API.
    const aiResponse = await generateContent(sentence.arabic.text);
    const parsedResponse = AIResponseSchema.safeParse(aiResponse);
    if (!parsedResponse.success) {
      throw ApiError.internal("AI failed to generate valid sentence content.");
    }
    const aiData = parsedResponse.data;
    const categoryId = await getOrCreateCategory({
      categoryEn: aiData.categoryEn,
      categoryBn: aiData.categoryBn,
    });

    // Keep heavy logic outside the transaction to prevent database connection locks
    const wordIdswithPosition = await getOrCreateWord(sentence.arabic.text);
    const sentenceWordsData = wordIdswithPosition.map((item) => ({
      sentenceId,
      wordId: item.wordId,
      position: item.position,
    }));

    // Use the repository method which handles the transaction atomically
    await SentenceRepository.updateStatusAndCategory(
      sentenceId,
      categoryId,
      sentenceWordsData,
      {
        meaningEn: aiData.meaningEn,
        meaningBn: aiData.meaningBn,
        pronunciationEn: aiData.pronunciationEn,
        pronunciationBn: aiData.pronunciationBn,
        whenToUseEn: aiData.whenToUseEn,
        whenToUseBn: aiData.whenToUseBn,
        feminineBn: aiData.feminineBn,
        feminineEn: aiData.feminineEn,
        status: SentenceStatus.COMPLETED,
      },
    );

    const duration = Date.now() - startTime;
    console.log(
      `[Worker] Job ${job.id} finished in ${duration}ms. Attempts: ${job.attemptsMade}`,
    );
  } catch (error: any) {
    console.log(`[Worker] Error processing job ${job.id}:`, error.stack);

    // Fallback status update if the processing fails completely
    await SentenceRepository.updateWithStatus(sentenceId, {
      status: SentenceStatus.FAILED,
      errorMessage: error.message || "Unknown error occurred during processing",
    });

    throw error;
  }
};

// initialize worker
export const sentenceWorker = new Worker(
  SENTENCE_QUEUE_NAME,
  processSentenceJob,
  {
    connection: workerRedis,
    concurrency: 5,
  },
);

// event listeners for logging
sentenceWorker.on("failed", (job, error) => {
  console.log(
    `[Worker] Job ${job?.id} failed. Attempt ${job?.attemptsMade}. Error: ${error.message}`,
  );
});
