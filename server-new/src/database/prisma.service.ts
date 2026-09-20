
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { PrismaClient } from '../generated/prisma/client.js';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    constructor(configService: ConfigService) {
        // 1. Establish the native pool connection connection
        const pool = new pg.Pool({
            connectionString: configService.get<string>('DATABASE_URL')
        });

        // 2. Initialize the Prisma Adapter
        const adapter = new PrismaPg(pool);

        // 3. Pass the adapter to the parent PrismaClient constructor
        super({ adapter });
    }

    async onModuleInit() {
        await this.$connect();
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}
