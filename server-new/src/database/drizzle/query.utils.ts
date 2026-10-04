import { and, eq, inArray, isNull, or } from 'drizzle-orm';

export function normalizeWhere(
  table: Record<string, any>,
  where: Record<string, any> | undefined,
): any {
  if (!where || typeof where !== 'object' || Array.isArray(where)) {
    return undefined;
  }

  const clauses: any[] = Object.entries(where).flatMap(([key, value]): any[] => {
    if (key === 'AND') {
      return (Array.isArray(value) ? value : [value])
        .flatMap((entry) => normalizeWhere(table, entry ?? {}) ?? [])
        .filter(Boolean);
    }

    if (key === 'OR') {
      const nested = (Array.isArray(value) ? value : [value])
        .map((entry) => normalizeWhere(table, entry ?? {}))
        .filter(Boolean) as any[];
      return nested.length ? [or(...nested)] : [];
    }

    const column = table[key];
    if (!column) {
      return [];
    }

    if (value === null) return [isNull(column)];
    if (Array.isArray(value)) return [inArray(column, value)];

    if (typeof value === 'object' && !(value instanceof Date)) {
      const nestedEntries = Object.entries(value as Record<string, any>);
      if (nestedEntries.length === 0) {
        return [eq(column, value)];
      }

      const nested = nestedEntries.flatMap(([nestedKey, nestedValue]) => {
        const nestedColumn = table[nestedKey];
        if (!nestedColumn) return [];
        if (nestedValue === null) return [isNull(nestedColumn)];
        if (Array.isArray(nestedValue)) return [inArray(nestedColumn, nestedValue)];
        return [eq(nestedColumn, nestedValue)];
      });

      return nested.length ? nested : [eq(column, value)];
    }

    return [eq(column, value)];
  });

  return clauses.length > 0 ? and(...clauses) : undefined;
}
