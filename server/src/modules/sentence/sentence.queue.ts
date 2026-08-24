import { queueRedis } from "@/config/redis.js";
import { AI_PROCESSING } from "@/shared/constants.js";
import { Queue } from "bullmq";

export const SENTENCE_QUEUE_NAME = "sentence-ai-processing";

export const sentenceQueue = new Queue(SENTENCE_QUEUE_NAME, {
  connection: queueRedis,
  defaultJobOptions: {
    attempts: AI_PROCESSING.QUEUE_RETRY_ATTEMPTS,
    backoff: {
      type: "exponential",
      delay: AI_PROCESSING.QUEUE_RETRY_DELAY_MS,
    },
    removeOnComplete: {
      age: AI_PROCESSING.QUEUE_JOB_CLEANUP_COMPLETE_S,
    },
    removeOnFail: {
      age: AI_PROCESSING.QUEUE_JOB_CLEANUP_FAIL_S,
    },
  },
});

export const enQueueSentenceProcessing = async (id: string) => {
  await sentenceQueue.add("processing-sentence", { sentenceId: id });
};

export const enqueueResyncSentenceWords = async (id: string) => {
  await sentenceQueue.add("resync-sentence-words", { sentenceId: id });
};
