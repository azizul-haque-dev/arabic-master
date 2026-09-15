import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(RedisService.name);
    public readonly client: Redis;
    constructor(private readonly configService: ConfigService) {
        // Changed: Now cleanly invokes the valid named constructor signature
        this.client = new Redis(this.configService.get<string>('redis.url') as string, {
            lazyConnect: true,
            maxRetriesPerRequest: 3,
        });
    }

    async onModuleInit(): Promise<void> {
        await this.client.connect();
        this.logger.log('Redis connected');
    }

    onModuleDestroy(): void {
        this.client.disconnect();
    }

    /** Blocks already-issued access tokens for a session until their natural (short) TTL expires. */
    async revokeSession(sessionId: string, ttlSeconds: number): Promise<void> {
        if (ttlSeconds <= 0) return;
        await this.client.set(`revoked-session:${sessionId}`, '1', 'EX', ttlSeconds);
    }

    async isSessionRevoked(sessionId: string): Promise<boolean> {
        const value = await this.client.get(`revoked-session:${sessionId}`);
        return value !== null;
    }
}
