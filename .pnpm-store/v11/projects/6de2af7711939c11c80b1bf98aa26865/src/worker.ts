// Dedicated process entry point for BullMQ consumers. Keep this separate from
// the HTTP server so scaling API replicas never multiplies worker processes.
import { connectDatabase, disconnectDatabase } from "./config/database.js";
import { logger } from "./config/logger.js";
import { sentenceWorker } from "./modules/sentence/sentence.worker.js";
import { wordWorker } from "./modules/word/word.worker.js";

async function bootstrap() {
  await connectDatabase();
  logger.info("Sentence worker started");

  let shuttingDown = false;
  const shutdown = async (signal: string) => {
    if (shuttingDown) return;
    shuttingDown = true;

    logger.info(`${signal} received, shutting down worker gracefully`);

    // Worker#close waits for the active job to finish before releasing Redis.
    await sentenceWorker.close();
    await wordWorker.close();
    await disconnectDatabase();
    logger.info("Worker shutdown complete");
  };

  const stop = (signal: string) => {
    shutdown(signal)
      .then(() => process.exit(0))
      .catch((err) => {
        logger.error({ err }, "Worker shutdown failed");
        process.exit(1);
      });
  };

  process.on("SIGTERM", () => stop("SIGTERM"));
  process.on("SIGINT", () => stop("SIGINT"));

  process.on("unhandledRejection", (reason) => {
    logger.error({ reason }, "Unhandled promise rejection in worker");
  });
  process.on("uncaughtException", (err) => {
    logger.fatal({ err }, "Uncaught exception in worker - exiting");
    process.exit(1);
  });
}

bootstrap().catch((err) => {
  logger.fatal({ err }, "Failed to start worker");
  process.exit(1);
});
