import {
  Injectable,
  type OnModuleDestroy,
  type OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema.js';

export type DatabaseClient = NodePgDatabase<typeof schema>;
export type DatabaseTransaction = Parameters<
  DatabaseClient['transaction']
>[0] extends (tx: infer T, ...args: any[]) => Promise<unknown>
  ? T
  : never;

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  public readonly pool: pg.Pool;
  public readonly db: DatabaseClient;

  constructor(private readonly configService: ConfigService) {
    const connectionString = this.configService.getOrThrow<string>('DATABASE_URL');

    this.pool = new pg.Pool({ connectionString });
    this.db = drizzle(this.pool, { schema });
  }

  async onModuleInit(): Promise<void> {
    await this.pool.query('SELECT 1');
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }

  async $transaction<T>(callback: (tx: DatabaseTransaction) => Promise<T>): Promise<T> {
    return this.db.transaction(async (tx) => callback(tx));
  }
}
