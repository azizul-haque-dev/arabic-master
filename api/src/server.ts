import { createApp } from './app.js';
import { buildContainer } from './container.js';
import { env } from './config/env.js';
import { pool } from './database/db.js';
import { registerGoogleStrategy } from './modules/auth/google.strategy.js';
import { createSentenceWorker } from './modules/sentence/sentence.worker.js';
import { createWordWorker } from './modules/words/word.worker.js';

const container = buildContainer();
const { logger } = container;

await pool.query('SELECT 1'); // DB না থাকলে boot-ই হবে না
await container.redis.connect();
registerGoogleStrategy();

const app = createApp(container);
const server = app.listen(env.PORT, () => logger.info(`Listening on :${env.PORT} (${env.NODE_ENV})`));

// prod-এ worker আলাদা process-এ নেওয়াই ভালো; এখন একই process-এ
const workers = [
  createSentenceWorker(container.processors.sentence, logger),
  createWordWorker(container.processors.word, logger),
];

let closing = false;
async function shutdown(signal: string) {
  if (closing) return;
  closing = true;
  logger.info(`${signal} received, shutting down`);
  const force = setTimeout(() => process.exit(1), 15_000);
  force.unref();

  try {
    await new Promise<void>((resolve) => server.close(() => resolve())); // নতুন connection বন্ধ
    await Promise.all(workers.map((w) => w.close()));                    // চলমান job শেষ
    await Promise.all(Object.values(container.queues).map((q) => q.close()));
    await container.redis.disconnect();
    await pool.end();
  } catch (err) {
    logger.error({ err }, 'Error during shutdown');
  } finally {
    clearTimeout(force);
    process.exit(0);
  }
}

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('unhandledRejection', (err) => logger.error({ err }, 'unhandledRejection'));
process.on('uncaughtException', (err) => {
  logger.fatal({ err }, 'uncaughtException');
  void shutdown('uncaughtException');
});
