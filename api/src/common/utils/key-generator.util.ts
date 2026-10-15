import { sql } from 'drizzle-orm';
import type { Executor } from '../../database/db.js';

/**
 * Generates the next sequential formatted key (e.g. 'AE-1025', 'W-2048', 'SNT-1024', etc.)
 * by finding the maximum numeric value of existing keys with the given prefix.
 *
 * @param tableName Name of the PostgreSQL table
 * @param columnName Name of the column storing the key
 * @param prefix Key prefix including delimiter (e.g. 'AE-', 'W-', 'SNT-', 'CNV-', 'CRS-', 'SEC-', 'LSN-')
 * @param baseNumber Base number sequence starts after (e.g. 1000 for 1001, 2000 for 2001, etc.)
 * @param ex Database executor (db or transaction)
 */
export async function generateNextSequentialKey(
  tableName: string,
  columnName: string,
  prefix: string,
  baseNumber: number,
  ex: Executor,
): Promise<string> {
  const fromIndex = prefix.length + 1;
  const regexPattern = `^${prefix}[0-9]+$`;

  const query = sql`
    SELECT MAX(CAST(SUBSTRING("${sql.raw(columnName)}" FROM ${fromIndex}) AS INTEGER)) as max_num 
    FROM "${sql.raw(tableName)}" 
    WHERE "${sql.raw(columnName)}" ~ ${regexPattern}
  `;

  const res = await ex.execute(query);
  const maxNum = (res.rows[0] as { max_num: number | null })?.max_num;
  const nextNum = maxNum && maxNum >= baseNumber ? maxNum + 1 : baseNumber + 1;
  return `${prefix}${nextNum}`;
}
