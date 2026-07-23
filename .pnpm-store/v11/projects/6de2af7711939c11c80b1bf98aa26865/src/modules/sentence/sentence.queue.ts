import { queueRedis } from "@/config/redis.js";
import { Queue } from "bullmq";

export const SENTENCE_QUEUE_NAME = "sentence-ai-processing";

export const sentenceQueue = new Queue(SENTENCE_QUEUE_NAME, {
  connection: queueRedis,
  defaultJobOptions: {
    attempts: 5,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
    removeOnComplete: {
      age: 3600,
    },
    removeOnFail: {
      age: 86400,
    },
  },
});

export const enQueueSentenceProcessing = async (id: string) => {
  // সমাধান: worker যেভাবে রিসিভ করতে চায় সেভাবে 'sentenceId' প্রোপার্টি পাঠান
  await sentenceQueue.add("processing-sentence", { sentenceId: id });
};
