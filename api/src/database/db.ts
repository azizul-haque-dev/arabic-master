import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import { logger } from '../common/http/logger.js';
import { env } from '../config/env.js';
import * as schema from './drizzle/schema.js';

import { ensureDatabaseSchema } from './ensure-schema.js';

const TRANSIENT_SOCKET_CODES = new Set([
  'ERR_SOCKET_CLOSED',
  'ECONNRESET',
  'EPIPE',
  'ETIMEDOUT',
]);

function isTransientSocketError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const code = (err as NodeJS.ErrnoException).code;
  if (code && TRANSIENT_SOCKET_CODES.has(code)) return true;
  return (
    err.message.includes('Socket is closed') ||
    err.message.includes('Connection terminated unexpectedly') ||
    err.message.includes('Client has encountered a connection error')
  );
}

export const pool = new pg.Pool({
  connectionString: env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 10_000,
  connectionTimeoutMillis: 10_000,
  maxLifetimeSeconds: 60,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10_000,
});

pool.on('error', (err) => {
  logger.warn({ err }, 'Unexpected error on idle PostgreSQL client');
});

const rawPoolQuery = pool.query.bind(pool);
pool.query = ((...args: Parameters<typeof rawPoolQuery>) => {
  const lastArg = args[args.length - 1];
  if (typeof lastArg === 'function') {
    return rawPoolQuery(...args);
  }
  return (rawPoolQuery(...args) as unknown as Promise<unknown>).catch(
    async (err: unknown) => {
      if (isTransientSocketError(err)) {
        logger.warn(
          { err },
          'PostgreSQL socket closed while idle; retrying query on a fresh connection',
        );
        return rawPoolQuery(...args);
      }
      throw err;
    },
  );
}) as typeof pool.query;

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
