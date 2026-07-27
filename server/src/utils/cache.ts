import { createHash } from "node:crypto";
import { cacheRedis } from "../config/redis.js";
import { logger } from "../config/logger.js";

const CACHE_PREFIX = "arabic-master:cache:v1";

export const cacheNamespaces = {
  categories: `${CACHE_PREFIX}:categories`,
  words: `${CACHE_PREFIX}:words`,
  sentences: `${CACHE_PREFIX}:sentences`,
} as const;

export function cacheKey(namespace: string, input: unknown = "all") {
  const hash = createHash("sha256")
    .update(JSON.stringify(input))
    .digest("base64url")
    .slice(0, 20);
  return `${namespace}:${hash}`;
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const value = await cacheRedis.get(key);
    if (!value) return null;
    return JSON.parse(value) as T;
  } catch (err) {
    logger.debug({ err, key }, "Redis cache read failed");
    return null;
  }
}

export async function cacheSet(key: string, value: unknown, ttlSeconds: number) {
  try {
    await cacheRedis.set(key, JSON.stringify(value), "EX", ttlSeconds);
  } catch (err) {
    logger.debug({ err, key }, "Redis cache write failed");
  }
}

// SCAN prevents a large cache from blocking Redis, unlike the KEYS command.
export async function invalidateCacheNamespace(namespace: string) {
  try {
    let cursor = "0";
    do {
      const [nextCursor, keys] = await cacheRedis.scan(
        cursor,
        "MATCH",
        `${namespace}:*`,
        "COUNT",
        100,
      );
      cursor = nextCursor;
      if (keys.length) await cacheRedis.unlink(...keys);
    } while (cursor !== "0");
  } catch (err) {
    logger.debug({ err, namespace }, "Redis cache invalidation failed");
  }
}
