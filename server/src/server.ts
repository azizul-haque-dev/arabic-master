// Entry point: boots the HTTP server and wires up graceful shutdown so
// in-flight requests finish and DB connections close cleanly on deploy/restart.
import { createApp } from "./app.js";
import { connectDatabase, disconnectDatabase } from "./config/database.js";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";

async function bootstrap() {
  await connectDatabase();

  // Local development is more convenient with the HTTP API and BullMQ
  // consumers in one process. Production keeps workers in a separate Render
  // Background Worker service, so API replicas never consume jobs.

  await import("./worker.js");
  logger.info("Background workers started in development mode");

  const app = createApp();
  const server = app.listen(env.PORT, async () => {
    logger.info(`Server listening on port ${env.PORT} [${env.NODE_ENV}]`);
  });

  const shutdown = async (signal: string) => {
    logger.info(`${signal} received, shutting down gracefully`);

    server.close(async () => {
      await disconnectDatabase();
      logger.info("Shutdown complete");
      process.exit(0);
    });

    // Force-exit if shutdown hangs (e.g. a stuck connection).
    setTimeout(() => {
      logger.error("Forced shutdown after timeout");
      process.exit(1);
    }, 10_000).unref();
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  process.on("unhandledRejection", (reason) => {
    logger.error({ reason }, "Unhandled promise rejection");
  });
  process.on("uncaughtException", (err) => {
    logger.fatal({ err }, "Uncaught exception - exiting");
    process.exit(1);
  });
}

bootstrap().catch((err) => {
  logger.fatal({ err }, "Failed to start server");
  process.exit(1);
});
