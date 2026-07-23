import { prisma } from "@/config/database.js";
import { workerRedis } from "@/config/redis.js";
import { SentenceStatus } from "@/generated/prisma/enums.js";
import { getOrCreateCategory } from "@/modules/category/category.service.js";
import { ApiError } from "@/utils/api-error.js";
import { Job, Worker } from "bullmq";
import { generateContent } from "../ai/generateContent.js";
import { AIResponseSchema } from "../ai/schema.js";
import { SENTENCE_QUEUE_NAME } from "./sentence.queue.js";
import { getOrCreateWord } from "./sentence.service.js";

const processSentenceJob = async (job: Job<{ sentenceId: string }>) => {
  const { sentenceId } = job.data;
  const startTime = Date.now();
  console.log(`[Worker] Job ${job.id} started processing.`);

  // Load sentence
  const sentence = await prisma.sentence.findUnique({
    where: { id: sentenceId },
    include: { arabic: true },
  });
  console.log("worker got the sentence:", sentence);

  if (!sentence) {
    throw ApiError.badRequest(`Sentence not found by id ${sentenceId}`);
  }

  // Update sentence status to PROCESSING
  await prisma.sentence.update({
    where: { id: sentenceId },
    data: { status: SentenceStatus.PROCESSING },
  });

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

    // Use a Prisma transaction to ensure both idempotency and atomicity
    await prisma.$transaction(async (tx) => {
      // Idempotency Layer: Clean up any partial data from previous failed attempts
      await tx.sentenceWord.deleteMany({
        where: { sentenceId: sentenceId },
      });

      // Insert clean data only if the array contains words
      if (sentenceWordsData.length > 0) {
        await tx.sentenceWord.createMany({
          data: sentenceWordsData,
        });
      }

      await tx.sentenceCategory.deleteMany({ where: { sentenceId } });
      await tx.sentenceCategory.create({ data: { sentenceId, categoryId } });

      // Update sentence status to COMPLETED inside the same atomic block
      await tx.sentence.update({
        where: { id: sentenceId },
        data: {
          meaningEn: aiData.meaningEn,
          meaningBn: aiData.meaningBn,
          pronunciationEn: aiData.pronunciationEn,
          pronunciationBn: aiData.pronunciationBn,
          whenToUseEn: aiData.whenToUseEn,
          whenToUseBn: aiData.whenToUseBn,
          feminineBn: aiData.feminineBn,
          feminineEn: aiData.feminineEn,
          errorMessage: null,
          status: SentenceStatus.COMPLETED,
        },
      });
    });

    const duration = Date.now() - startTime;
    console.log(
      `[Worker] Job ${job.id} finished in ${duration}ms. Attempts: ${job.attemptsMade}`,
    );
  } catch (error: any) {
    console.log(`[Worker] Error processing job ${job.id}:`, error.stack);

    // Fallback status update if the processing fails completely
    await prisma.sentence.update({
      where: { id: sentenceId },
      data: {
        status: SentenceStatus.FAILED,
        errorMessage:
          error.message || "Unknown error occurred during processing",
      },
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
