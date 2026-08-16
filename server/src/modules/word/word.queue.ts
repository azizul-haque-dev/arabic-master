import { queueRedis } from "@/config/redis.js";
import { Queue } from "bullmq";
import { AI_PROCESSING } from "@/shared/constants.js";

export const WORD_QUEUE_NAME = "word-ai-processing";
export const wordQueue = new Queue(WORD_QUEUE_NAME, {
  connection: queueRedis,
  defaultJobOptions: {
    attempts: AI_PROCESSING.QUEUE_RETRY_ATTEMPTS,
    backoff: { type: "exponential", delay: AI_PROCESSING.QUEUE_RETRY_DELAY_MS },
  },
});

export function enqueueWordProcessing(wordId: string) {
  return wordQueue.add("process-word", { wordId });
}
