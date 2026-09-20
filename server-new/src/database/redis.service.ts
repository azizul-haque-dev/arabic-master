import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
    Redis
} from 'ioredis'



@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(RedisService.name);
    public readonly client: Redis;

    constructor(private readonly config: ConfigService) {
        this.client = new Redis(this.config.get<string>('redis.url') as string, {
            lazyConnect: true,
            maxRetriesPerRequest: 3,
        });
    }

    async onModuleInit(): Promise<void> {
        await this.client.connect();
        this.logger.log('Redis connected');
    }

    async onModuleDestroy(): Promise<void> {
        await this.client.disconnect();
        this.logger.log('Redis disconnected');
    }

    async revokeSession(sessionId: string, ttlSeconds: number): Promise<void> {
        if (ttlSeconds <= 0) return;
        await this.client.set(`revoked-session:${sessionId}`, "1", "EX", ttlSeconds);
    }

    async isSessionRevoked(sessionId: string): Promise<boolean> {
        const exists = await this.client.exists(`revoked-session:${sessionId}`);
        return exists === 1;
    }
}