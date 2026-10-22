import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import { logger } from '../common/http/logger.js';
import { env } from '../config/env.js';
import * as schema from './drizzle/schema.js';

import { ensureDatabaseSchema } from './ensure-schema.js';

export const pool = new pg.Pool({ connectionString: env.DATABASE_URL });
export const db = drizzle(pool, { schema });

export async function connectDatabase(): Promise<void> {
  await pool.query('SELECT 1');
  await ensureDatabaseSchema(pool);
  logger.info('Database connected');
}

export async function disconnectDatabase(): Promise<void> {
  await pool.end();
  logger.info('Database disconnected');
}

export type Db = typeof db;
export type Tx = Parameters<Parameters<Db['transaction']>[0]>[0];
// The Executor type is used to represent either a database connection (Db) or a transaction (Tx).
export type Executor = Db | Tx;

export const withTransaction = <T>(cb: (tx: Tx) => Promise<T>): Promise<T> =>
  db.transaction(cb);
