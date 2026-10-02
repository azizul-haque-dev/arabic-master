import { and, asc, desc, eq, inArray, isNull, or, sql } from 'drizzle-orm';
import * as tables from './schema.js';
export function normalizeWhere(table: Record<string, any>, where: Record<string, any> | undefined): any {
  if (!where || typeof where !== 'object' || Array.isArray(where)) return undefined;

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
    if (!column) return [];

    if (value === null) return [isNull(column)];
    if (Array.isArray(value)) return [inArray(column, value)];

    if (typeof value === 'object' && !(value instanceof Date)) {
      const nestedEntries = Object.entries(value as Record<string, any>);
      if (nestedEntries.length === 0) return [eq(column, value)];

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

export function getTableApi(table: Record<string, any>, db: any) {
  return {
    async findUnique(args: { where?: Record<string, any>; include?: Record<string, any> } = {}): Promise<any> {
      const condition = normalizeWhere(table, args.where);
      const rows = await db.select().from(table).where(condition as any).limit(1);
      return rows[0] ?? null;
    },
    async findFirst(args: { where?: Record<string, any>; include?: Record<string, any> } = {}): Promise<any> {
      const condition = normalizeWhere(table, args.where);
      const rows = await db.select().from(table).where(condition as any).limit(1);
      return rows[0] ?? null;
    },
    async findMany(args: { where?: Record<string, any>; include?: Record<string, any>; select?: Record<string, any>; orderBy?: Record<string, 'asc' | 'desc'>; skip?: number; take?: number } = {}): Promise<any[]> {
      const { where, orderBy, skip, take } = args;
      const condition = normalizeWhere(table, where);
      let query = db.select().from(table) as any;
      if (condition) query = query.where(condition as any);
      if (orderBy) {
        for (const [field, direction] of Object.entries(orderBy)) {
          const column = table[field];
          if (!column) continue;
          query = direction === 'desc' ? query.orderBy(desc(column)) : query.orderBy(asc(column));
        }
      }
      if (typeof skip === 'number') query = query.offset(skip);
      if (typeof take === 'number') query = query.limit(take);
      return await query;
    },
    async count(args: { where?: Record<string, any> } = {}): Promise<number> {
      const condition = normalizeWhere(table, args.where);
      let query = db.select({ count: sql<number>`count(*)::int`.as('count') }).from(table) as any;
      if (condition) query = query.where(condition as any);
      const result = await query;
      return Number(result[0]?.count ?? 0);
    },
    async create(args: { data: Record<string, any>; include?: Record<string, any> } = { data: {} }): Promise<any> {
      const rows = await db.insert(table).values(args.data).returning();
      return rows[0] ?? null;
    },
    async createMany(args: { data: Record<string, any>[] }): Promise<{ count: number }> {
      if (args.data.length === 0) return { count: 0 };
      const rows = await db.insert(table).values(args.data).returning();
      return { count: rows.length };
    },
    async update(args: { where: Record<string, any>; data: Record<string, any>; include?: Record<string, any> } = { where: {}, data: {} }): Promise<any> {
      const condition = normalizeWhere(table, args.where);
      const rows = condition
        ? await db.update(table).set(args.data).where(condition as any).returning()
        : await db.update(table).set(args.data).returning();
      return rows[0] ?? null;
    },
    async updateMany(args: { where: Record<string, any>; data: Record<string, any> } = { where: {}, data: {} }): Promise<{ count: number }> {
      const condition = normalizeWhere(table, args.where);
      const rows = condition
        ? await db.update(table).set(args.data).where(condition as any).returning()
        : await db.update(table).set(args.data).returning();
      return { count: rows.length };
    },
    async delete(args: { where: Record<string, any> } = { where: {} }): Promise<any> {
      const condition = normalizeWhere(table, args.where);
      const rows = condition
        ? await db.delete(table).where(condition as any).returning()
        : await db.delete(table).returning();
      return rows[0] ?? null;
    },
    async deleteMany(args: { where?: Record<string, any> } = {}): Promise<{ count: number }> {
      const condition = normalizeWhere(table, args.where);
      const rows = condition
        ? await db.delete(table).where(condition as any).returning()
        : await db.delete(table).returning();
      return { count: rows.length };
    },
  };
}


export const tableMap = {
  user: tables.user,
  authIdentity: tables.authIdentity,
  session: tables.session,
  refreshToken: tables.refreshToken,
  passwordResetToken: tables.passwordResetToken,
  emailVerificationToken: tables.emailVerificationToken,
  userProfile: tables.userProfile,
  userProgress: tables.userProgress,
  learningActivity: tables.learningActivity,
  guestUser: tables.guestUser,
  subscription: tables.subscription,
  transaction: tables.transaction,
  arabicEntity: tables.arabicEntity,
  word: tables.word,
  grammaticalVariant: tables.grammaticalVariant,
  sentenceWord: tables.sentenceWord,
  sentence: tables.sentence,
  conversation: tables.conversation,
  conversationTurn: tables.conversationTurn,
  course: tables.course,
  section: tables.section,
  lesson: tables.lesson,
  lessonContentItem: tables.lessonContentItem,
  contentCompletion: tables.contentCompletion,
  lessonProgress: tables.lessonProgress,
};
