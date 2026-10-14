import { Queue } from 'bullmq';
import { AI_PROCESSING, WORD_QUEUE_NAME } from '../../config/constants.js';
import { bullConnection } from '../../config/redis.js';

export const wordQueue = new Queue(WORD_QUEUE_NAME, {
  connection: bullConnection(),
  defaultJobOptions: {
    attempts: AI_PROCESSING.QUEUE_RETRY_ATTEMPTS,
    backoff: {
      type: 'exponential' as const,
      delay: AI_PROCESSING.QUEUE_RETRY_DELAY_MS,
    },
  },
});
