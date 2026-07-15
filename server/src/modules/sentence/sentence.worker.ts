import { prisma } from "@/config/database.js";
import { workerRedis } from "@/config/redis.js";
import { SentenceStatus } from "@/generated/prisma/enums.js";
import { ApiError } from "@/utils/api-error.js";
import { Job, Worker } from "bullmq";
import { SENTENCE_QUEUE_NAME } from "./sentence.queue.js";
import { getOrCreateWord } from "./sentence.service.js";

const processSentenceJob = async (job: Job<{ sentenceId: string }>) => {
  const { sentenceId } = job.data;
  const startTime = Date.now();
  console.log(`[Worker] Job ${job.id} started processing.`);

  // load sentence
  const sentence = await prisma.sentence.findUnique({
    where: { id: sentenceId },
    include: { arabic: true },
  });
  console.log("woker got the sentence:", sentence);

  if (!sentence) {
    throw ApiError.badRequest(`Sentence not found by id ${sentenceId}`);
  }

  // update sentence status to PROCESSING
  await prisma.sentence.update({
    where: { id: sentenceId },
    data: { status: SentenceStatus.PROCESSING },
  });

  try {
    const wordIdswithPosition = await getOrCreateWord(sentence.arabic.text);
    const sentenceWordsData = wordIdswithPosition.map((item) => ({
      sentenceId,
      wordId: item.wordId,
      position: item.position,
    }));

    await prisma.sentenceWord.createMany({
      data: sentenceWordsData,
    });

    await prisma.sentence.update({
      where: { id: sentenceId },
      data: { status: SentenceStatus.COMPLETED },
    });

    const duration = Date.now() - startTime;
    console.log(
      `[Worker] Job ${job.id} finished in ${duration}ms. Attempts: ${job.attemptsMade}`,
    );
  } catch (error: any) {
    console.log(`[Worker] Error processing job ${job.id}:`, error.stack);

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
