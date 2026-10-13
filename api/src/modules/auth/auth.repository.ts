import { and, eq, isNull } from 'drizzle-orm';
import { randomUUIDv7 } from 'node:crypto';
import type { Db, Executor } from '../../database/db.js';
import * as schema from '../../database/drizzle/schema.js';
import type { AuthProvider } from '../../database/drizzle/enums.js';

export function createAuthRepository(db: Db) {
  return {
    async invalidateOpenResetTokens(userId: string) {
      await db.update(schema.passwordResetToken).set({ usedAt: new Date() })
        .where(and(eq(schema.passwordResetToken.userId, userId), isNull(schema.passwordResetToken.usedAt)));
    },
    async insertResetToken(v: { userId: string; tokenHash: string; expiresAt: Date }) {
      await db.insert(schema.passwordResetToken).values({ id: randomUUIDv7(), ...v });
    },
    async findResetTokenByHash(tokenHash: string) {
      const [row] = await db.select().from(schema.passwordResetToken)
        .where(eq(schema.passwordResetToken.tokenHash, tokenHash)).limit(1);
      return row ?? null;
    },
    async markResetTokenUsed(id: string, ex: Executor = db) {
      await ex.update(schema.passwordResetToken).set({ usedAt: new Date() }).where(eq(schema.passwordResetToken.id, id));
    },
    async findIdentity(provider: AuthProvider, providerAccountId: string) {
      const [row] = await db.select().from(schema.authIdentity)
        .where(and(eq(schema.authIdentity.provider, provider), eq(schema.authIdentity.providerAccountId, providerAccountId)))
        .limit(1);
      return row ?? null;
    },
    async insertIdentity(v: { provider: AuthProvider; providerAccountId: string; userId: string }, ex: Executor = db) {
      await ex.insert(schema.authIdentity).values({ id: randomUUIDv7(), ...v });
    },
  };
}
export type AuthRepository = ReturnType<typeof createAuthRepository>;
