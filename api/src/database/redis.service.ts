import { Redis } from 'ioredis';
import { env } from '../config/env.js';
import { logger, type Logger } from '../common/http/logger.js';

const log = logger.child({ context: 'Redis' });
let shuttingDown = false;

export const client = new Redis(env.REDIS_URL, {
  lazyConnect: true,
  maxRetriesPerRequest: 3,
});

client.on('error', (err) => log.error({ err }, 'Redis connection error'));
client.on('close', () => {
  if (!shuttingDown) log.warn('Redis connection closed');
});
client.on('reconnecting', (delayMs: number) =>
  log.warn({ delayMs }, 'Redis reconnecting'),
);

export const RedisService = {
  client,
  async connect() {
    await client.connect();
    log.info('Redis connected');
  },
  async disconnect() {
    shuttingDown = true;
    await client.quit();
  },
  async revokeSession(sessionId: string, ttlSeconds: number) {
    if (ttlSeconds <= 0) return;
    await client.set(`revoked-session:${sessionId}`, '1', 'EX', ttlSeconds);
  },
  async isSessionRevoked(sessionId: string) {
    return (await client.exists(`revoked-session:${sessionId}`)) === 1;
  },
  async setActiveSession(
    userId: string,
    sessionId: string,
    ttlSeconds: number,
  ) {
    if (ttlSeconds <= 0) return;
    await client.set(
      `user:${userId}:activesession`,
      sessionId,
      'EX',
      ttlSeconds,
    );
  },
  async getActiveSession(userId: string) {
    return client.get(`user:${userId}:activesession`);
  },
};

export const redis = RedisService;
export type RedisService = typeof RedisService;

export function createRedisService(_logger?: Logger): RedisService {
  return RedisService;
}
