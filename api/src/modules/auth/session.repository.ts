import { and, eq, inArray, isNull } from 'drizzle-orm';
import { db, type Db, type Executor } from '../../database/db.js';
import * as schema from '../../database/drizzle/schema.js';

export const SessionRepository= {
    // ---- session ----
    async findById(id: string, ex: Executor = db) {
      const [row] = await ex
        .select()
        .from(schema.session)
        .where(eq(schema.session.id, id))
        .limit(1);
      return row ?? null;
    },
    async insert(v: typeof schema.session.$inferInsert, ex: Executor = db) {
      const [row] = await ex.insert(schema.session).values(v).returning();
      return row;
    },
    async findOpenIdsByUser(userId: string) {
      const rows = await db
        .select({ id: schema.session.id })
        .from(schema.session)
        .where(
          and(
            eq(schema.session.userId, userId),
            isNull(schema.session.revokedAt),
          ),
        );
      return rows.map((r) => r.id);
    },
    async revoke(sessionId: string) {
      await db
        .update(schema.session)
        .set({ revokedAt: new Date(), isActive: false })
        .where(
          and(
            eq(schema.session.id, sessionId),
            isNull(schema.session.revokedAt),
          ),
        );
    },
    async revokeAllForUser(userId: string) {
      await db
        .update(schema.session)
        .set({ revokedAt: new Date(), isActive: false })
        .where(
          and(
            eq(schema.session.userId, userId),
            isNull(schema.session.revokedAt),
          ),
        );
    },
    // ---- refresh token ----
    async insertRefresh(
      v: typeof schema.refreshToken.$inferInsert,
      ex: Executor = db,
    ) {
      const [row] = await ex.insert(schema.refreshToken).values(v).returning();
      return row;
    },
    async findRefreshByJwtId(jwtId: string) {
      const [row] = await db
        .select()
        .from(schema.refreshToken)
        .where(eq(schema.refreshToken.jwtId, jwtId))
        .limit(1);
      return row ?? null;
    },
    async revokeRefreshBySession(sessionId: string) {
      await db
        .update(schema.refreshToken)
        .set({ revokedAt: new Date() })
        .where(
          and(
            eq(schema.refreshToken.sessionId, sessionId),
            isNull(schema.refreshToken.revokedAt),
          ),
        );
    },
    async revokeRefreshBySessions(sessionIds: string[]) {
      if (!sessionIds.length) return;
      await db
        .update(schema.refreshToken)
        .set({ revokedAt: new Date() })
        .where(
          and(
            inArray(schema.refreshToken.sessionId, sessionIds),
            isNull(schema.refreshToken.revokedAt),
          ),
        );
    },
    /** atomic claim: only one concurrent request will succeed */
    claimRefresh(id: string, ex: Executor) {
      return ex
        .update(schema.refreshToken)
        .set({ revokedAt: new Date() })
        .where(
          and(
            eq(schema.refreshToken.id, id),
            isNull(schema.refreshToken.revokedAt),
          ),
        )
        .returning();
    },
    async linkReplacement(id: string, replacedByTokenId: string, ex: Executor) {
      await ex
        .update(schema.refreshToken)
        .set({ replacedByTokenId })
        .where(eq(schema.refreshToken.id, id));
    },
  };
