import { queueRedis } from "@/config/redis.js";
import { Queue } from "bullmq";

export const WORD_QUEUE_NAME = "word-ai-processing";
export const wordQueue = new Queue(WORD_QUEUE_NAME, {
  connection: queueRedis,
  defaultJobOptions: { attempts: 5, backoff: { type: "exponential", delay: 2000 } },
});

export function enqueueWordProcessing(wordId: string) {
  return wordQueue.add("process-word", { wordId });
}
