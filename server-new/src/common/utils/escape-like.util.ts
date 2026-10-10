// Escape wildcard characters (%, _, \) to prevent unintended matching in SQL ILIKE queries
export function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, '\\$&');
}
