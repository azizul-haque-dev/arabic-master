import { Redis } from "ioredis";
import { logger } from "./logger.js";

export const cacheRedis = new Redis(process.env.REDIS_URL!, {
  // Cache failures must never make a request fail or wait indefinitely.
  maxRetriesPerRequest: 1,
  enableReadyCheck: true,
  enableOfflineQueue: false,
  connectTimeout: 5_000,
});

cacheRedis.on("error", (err) => {
  logger.warn({ err }, "Redis cache unavailable; falling back to the database");
});

export const queueRedis = new Redis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

export const workerRedis = new Redis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});
