/**
 * Redis Caching Service
 * Handles cache operations with namespace support
 */

import { logger } from "@/config/logger.js";
import { cacheRedis } from "@/config/redis.js";
import { createHash } from "node:crypto";

const CACHE_PREFIX = "arabic-master:cache:v1";

export const cacheNamespaces = {
  categories: `${CACHE_PREFIX}:categories`,
  words: `${CACHE_PREFIX}:words`,
  sentences: `${CACHE_PREFIX}:sentences`,
  topics: `${CACHE_PREFIX}:topics`,
  topicConversations: `${CACHE_PREFIX}:topic-conversations`,
  conversations: `${CACHE_PREFIX}:conversations`,
  conversationLines: `${CACHE_PREFIX}:conversation-lines`,
  arabicTexts: `${CACHE_PREFIX}:arabic-texts`,
} as const;

/**
 * Generate a cache key from namespace and input data
 * Uses SHA-256 hash for consistent, compact keys
 * @param namespace Cache namespace
 * @param input Data to hash for the key
 * @returns Formatted cache key
 */
export function cacheKey(namespace: string, input: unknown = "all") {
  const hash = createHash("sha256")
    .update(JSON.stringify(input))
    .digest("base64url")
    .slice(0, 20);
  return `${namespace}:${hash}`;
}

/**
 * Get a value from cache
 * @param key Cache key
 * @returns Cached value or null if not found/error
 */
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

/**
 * Set a value in cache with TTL
 * @param key Cache key
 * @param value Value to cache
 * @param ttlSeconds Time to live in seconds
 */
export async function cacheSet(
  key: string,
  value: unknown,
  ttlSeconds: number,
) {
  try {
    await cacheRedis.set(key, JSON.stringify(value), "EX", ttlSeconds);
  } catch (err) {
    logger.debug({ err, key }, "Redis cache write failed");
  }
}

/**
 * Invalidate all keys in a namespace
 * Uses SCAN to avoid blocking Redis (unlike KEYS command)
 * @param namespace Cache namespace to invalidate
 */
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

      if (keys.length > 0) {
        await cacheRedis.del(...keys);
      }

      cursor = nextCursor;
    } while (cursor !== "0");
  } catch (err) {
    logger.debug({ err, namespace }, "Failed to invalidate cache namespace");
  }
}