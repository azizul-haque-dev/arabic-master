import { logger } from './common/http/logger.js';
import { RedisService } from './database/redis.service.js';
import { sentenceQueue } from './modules/sentence/sentence.queue.js';
import { createSentenceWorker } from './modules/sentence/sentence.worker.js';
import { wordQueue } from './modules/words/word.queue.js';
import { createWordWorker } from './modules/words/word.worker.js';

await RedisService.connect();

const workers = [
  createSentenceWorker(undefined, logger),
  createWordWorker(undefined, logger),
];

logger.info('Background workers started');

export async function closeWorkers() {
  await Promise.all(workers.map((worker) => worker.close()));
  await Promise.all([sentenceQueue.close(), wordQueue.close()]);
  await RedisService.disconnect();
}
