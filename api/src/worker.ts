import { logger } from './common/http/logger.js';
import { appDependencies } from './app.setup.js';
import { createSentenceWorker } from './modules/sentence/sentence.worker.js';
import { createWordWorker } from './modules/words/word.worker.js';

await appDependencies.redis.connect();

const workers = [
  createSentenceWorker(appDependencies.processors.sentence, logger),
  createWordWorker(appDependencies.processors.word, logger),
];

logger.info('Background workers started');

export async function closeWorkers() {
  await Promise.all(workers.map((worker) => worker.close()));
  await Promise.all(
    Object.values(appDependencies.queues).map((queue) => queue.close()),
  );
  await appDependencies.redis.disconnect();
}
