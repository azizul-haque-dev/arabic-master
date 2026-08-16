import { queueRedis } from "@/config/redis.js";
import { Queue } from "bullmq";
import { AI_PROCESSING } from "@/shared/constants.js";

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
  // সমাধান: worker যেভাবে রিসিভ করতে চায় সেভাবে 'sentenceId' প্রোপার্টি পাঠান
  await sentenceQueue.add("processing-sentence", { sentenceId: id });
};
