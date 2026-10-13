import { randomUUIDv7 } from 'node:crypto';
import { UnauthorizedError } from '../../common/errors/app-error.js';
import type { Logger } from '../../common/http/logger.js';
import { withTransaction } from '../../database/db.js';
import type { RedisService } from '../../database/redis.service.js';
import type { SecurityLoggerService } from './security-logger.service.js';
import type { SessionRepository } from './session.repository.js';
import type { TokenService } from './token.service.js';

export function createSessionService(d: {
  repo: SessionRepository; redis: RedisService; tokens: TokenService; security: SecurityLoggerService; logger: Logger;
}) {
  const { repo, redis, tokens, security } = d;
  const logger = d.logger.child({ context: 'SessionService' });

  async function cacheRevoked(sessionId: string) {
    try {
      await redis.revokeSession(sessionId, tokens.getAccessTokenTtlSeconds());
    } catch (err) {
      logger.error({ err, sessionId }, 'Failed to cache revoked session in Redis');
    }
  }

  async function revokeSession(sessionId: string) {
    await Promise.all([repo.revoke(sessionId), repo.revokeRefreshBySession(sessionId)]);
    await cacheRevoked(sessionId);
  }

  async function revokeAllSessionsForUser(userId: string) {
    const ids = await repo.findOpenIdsByUser(userId);
    if (!ids.length) return;
    await Promise.all([repo.revokeAllForUser(userId), repo.revokeRefreshBySessions(ids)]);
    await Promise.all(ids.map(cacheRevoked));
  }

  async function createSession(p: { userId: string; ipAddress?: string; userAgent?: string }) {
    await revokeAllSessionsForUser(p.userId); // ⚠️ single-device login

    const refreshTokenExpiresAt = tokens.getRefreshTokenExpiryDate();
    const session = await repo.insert({
      id: randomUUIDv7(), userId: p.userId, deviceId: randomUUIDv7(),
      ipAddress: p.ipAddress, userAgent: p.userAgent, expiresAt: refreshTokenExpiresAt,
    });

    const { token: accessToken } = tokens.generateAccessToken(p.userId, session.id);
    const { token: refreshToken, jwtId } = tokens.generateRefreshToken(p.userId, session.id);

    await repo.insertRefresh({
      id: randomUUIDv7(), sessionId: session.id, jwtId,
      tokenHash: tokens.hashToken(refreshToken), expiresAt: refreshTokenExpiresAt,
    });

    const ttl = Math.ceil((refreshTokenExpiresAt.getTime() - Date.now()) / 1000);
    try {
      await redis.setActiveSession(p.userId, session.id, ttl);
    } catch (err) {
      logger.error({ err, userId: p.userId, sessionId: session.id }, 'Failed to cache active session in Redis');
    }
    return { sessionId: session.id, accessToken, refreshToken, refreshTokenExpiresAt };
  }

  async function rotateRefreshToken(p: {
    rawToken: string; userId: string; sessionId: string; jwtId: string;
    requestId: string; ipAddress?: string; userAgent?: string;
  }) {
    const invalid = () => new UnauthorizedError('Invalid or expired refresh token');
    const { rawToken, userId, sessionId, jwtId, requestId, ipAddress, userAgent } = p;
    const logMeta = { requestId, userId, sessionId, ipAddress, userAgent };

    const existing = await repo.findRefreshByJwtId(jwtId);
    if (!existing || existing.sessionId !== sessionId) throw invalid();

    const session = await repo.findById(sessionId);
    if (!session || session.revokedAt || existing.expiresAt < new Date()) throw invalid();

    const isReuse = existing.revokedAt !== null || existing.tokenHash !== tokens.hashToken(rawToken);
    if (isReuse) {
      await revokeSession(sessionId); // reuse detected → পুরো session বাতিল
      security.log({ event: 'REFRESH_TOKEN_REUSE_DETECTED', ...logMeta });
      throw invalid();
    }

    const { token: accessToken } = tokens.generateAccessToken(userId, sessionId);
    const { token: refreshToken, jwtId: newJwtId } = tokens.generateRefreshToken(userId, sessionId);
    const refreshTokenExpiresAt = tokens.getRefreshTokenExpiryDate();

    try {
      await withTransaction(async (tx) => {
        const claim = await repo.claimRefresh(existing.id, tx);
        if (claim.length === 0) throw invalid(); // অন্য concurrent request আগে claim করেছে

        const created = await repo.insertRefresh(
          { id: randomUUIDv7(), sessionId, jwtId: newJwtId, tokenHash: tokens.hashToken(refreshToken), expiresAt: refreshTokenExpiresAt },
          tx,
        );
        await repo.linkReplacement(existing.id, created.id, tx);
      });
    } catch (err) {
      await revokeSession(sessionId);
      security.log({ event: 'CONCURRENT_REFRESH_RACE_DETECTED', ...logMeta });
      throw err;
    }
    return { accessToken, refreshToken, refreshTokenExpiresAt };
  }

  return { createSession, rotateRefreshToken, revokeSession, revokeAllSessionsForUser };
}
export type SessionService = ReturnType<typeof createSessionService>;
