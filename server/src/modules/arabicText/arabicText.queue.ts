import { queueRedis } from "@/config/redis.js";
import { Queue } from "bullmq";
import { AI_PROCESSING } from "@/shared/constants.js";

export const ARABIC_TEXT_QUEUE_NAME = "arabic-text-ai-processing";

export const arabicTextQueue = new Queue(ARABIC_TEXT_QUEUE_NAME, {
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

export const enqueueArabicTextProcessing = async (id: string) => {
    await arabicTextQueue.add("processing-arabic-text", { arabicTextId: id });
};