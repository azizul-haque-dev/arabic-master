import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  public readonly client: Redis;
  private isShuttingDown = false;

  constructor(
    private readonly config: ConfigService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(RedisService.name);
    this.client = new Redis(this.config.get<string>('redis.url') as string, {
      lazyConnect: true,
      maxRetriesPerRequest: 3,
    });

    this.client.on('error', (error: Error) => {
      this.logger.error({ err: error }, 'Redis connection error');
    });
    this.client.on('close', () => {
      if (!this.isShuttingDown) {
        this.logger.warn('Redis connection closed');
      }
    });
    this.client.on('reconnecting', (delay: number) => {
      this.logger.warn({ delayMs: delay }, 'Redis reconnecting');
    });
    this.client.on('end', () => {
      if (!this.isShuttingDown) {
        this.logger.error('Redis connection ended; reconnect attempts exhausted');
      }
    });
  }

  async onModuleInit(): Promise<void> {
    await this.client.connect();
    this.logger.info('Redis connected');
  }

  async onModuleDestroy(): Promise<void> {
    this.isShuttingDown = true;
    await this.client.disconnect();
    this.logger.info('Redis disconnected');
  }

  async revokeSession(sessionId: string, ttlSeconds: number): Promise<void> {
    if (ttlSeconds <= 0) return;
    await this.client.set(
      `revoked-session:${sessionId}`,
      '1',
      'EX',
      ttlSeconds,
    );
  }

  async isSessionRevoked(sessionId: string): Promise<boolean> {
    const exists = await this.client.exists(`revoked-session:${sessionId}`);
    return exists === 1;
  }

  async setActiveSession(
    userId: string,
    sessionId: string,
    ttlSeconds: number,
  ): Promise<void> {
    if (ttlSeconds <= 0) return;
    await this.client.set(
      `user:${userId}:activesession`,
      sessionId,
      'EX',
      ttlSeconds,
    );
  }

  async getActiveSession(userId: string): Promise<string | null> {
    return this.client.get(`user:${userId}:activesession`);
  }
}
