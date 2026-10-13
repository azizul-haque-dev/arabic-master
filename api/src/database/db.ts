import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import { env } from '../config/env.js';
import * as schema from './drizzle/schema.js';

export const pool = new pg.Pool({ connectionString: env.DATABASE_URL });
export const db = drizzle(pool, { schema });

export type Db = typeof db;
export type Tx = Parameters<Parameters<Db['transaction']>[0]>[0];
/** repository method-গুলো db বা transaction, দুটোই নিতে পারে */
export type Executor = Db | Tx;

export const withTransaction = <T>(cb: (tx: Tx) => Promise<T>): Promise<T> => db.transaction(cb);
