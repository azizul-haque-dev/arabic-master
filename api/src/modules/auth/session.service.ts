import { v7 as randomUUIDv7 } from 'uuid';
import { UnauthorizedError } from '../../common/errors/app-error.js';
import { logger } from '../../common/http/logger.js';

import { withTransaction } from '../../database/db.js';
import { RedisService } from '../../database/redis.service.js';
import { TokenService } from './token.service.js';
import { SessionRepository } from './session.repository.js';
import { SecurityLoggerService } from './security-logger.service.js';

const security = SecurityLoggerService;

async function cacheRevoked(sessionId: string) {
  try {
    await RedisService.revokeSession(
      sessionId,
      TokenService.getAccessTokenTtlSeconds(),
    );
  } catch (err) {
    logger.error(
      { err, sessionId },
      'Failed to cache revoked session in Redis',
    );
  }
}

async function revokeSession(sessionId: string) {
  await Promise.all([
    SessionRepository.revoke(sessionId),
    SessionRepository.revokeRefreshBySession(sessionId),
  ]);
  await cacheRevoked(sessionId);
}

async function revokeAllSessionsForUser(userId: string) {
  const ids = await SessionRepository.findOpenIdsByUser(userId);
  if (!ids.length) return;
  await Promise.all([
    SessionRepository.revokeAllForUser(userId),
    SessionRepository.revokeRefreshBySessions(ids),
  ]);
  await Promise.all(ids.map(cacheRevoked));
}

async function createSession(p: {
  userId: string;
  ipAddress?: string;
  userAgent?: string;
}) {
  await revokeAllSessionsForUser(p.userId); // ⚠️ single-device login

  const refreshTokenExpiresAt = TokenService.getRefreshTokenExpiryDate();
  const session = await SessionRepository.insert({
    id: randomUUIDv7(),
    userId: p.userId,
    deviceId: randomUUIDv7(),
    ipAddress: p.ipAddress,
    userAgent: p.userAgent,
    expiresAt: refreshTokenExpiresAt,
  });

  const { token: accessToken } = TokenService.generateAccessToken(
    p.userId,
    session.id,
  );
  const { token: refreshToken, jwtId } = TokenService.generateRefreshToken(
    p.userId,
    session.id,
  );

  await SessionRepository.insertRefresh({
    id: randomUUIDv7(),
    sessionId: session.id,
    jwtId,
    tokenHash: TokenService.hashToken(refreshToken),
    expiresAt: refreshTokenExpiresAt,
  });

  const ttl = Math.ceil(
    (refreshTokenExpiresAt.getTime() - Date.now()) / 1000,
  );
  try {
    await RedisService.setActiveSession(p.userId, session.id, ttl);
  } catch (err) {
    logger.error(
      { err, userId: p.userId, sessionId: session.id },
      'Failed to cache active session in Redis',
    );
  }
  return {
    sessionId: session.id,
    accessToken,
    refreshToken,
    refreshTokenExpiresAt,
  };
}

async function rotateRefreshToken(p: {
  rawToken: string;
  userId: string;
  sessionId: string;
  jwtId: string;
  requestId: string;
  ipAddress?: string;
  userAgent?: string;
}) {
  const invalid = () =>
    new UnauthorizedError('Invalid or expired refresh token');
  const {
    rawToken,
    userId,
    sessionId,
    jwtId,
    requestId,
    ipAddress,
    userAgent,
  } = p;
  const logMeta = { requestId, userId, sessionId, ipAddress, userAgent };

  const existing = await SessionRepository.findRefreshByJwtId(jwtId);
  if (!existing || existing.sessionId !== sessionId) throw invalid();

  const session = await SessionRepository.findById(sessionId);
  if (!session || session.revokedAt || existing.expiresAt < new Date())
    throw invalid();

  // Verify token hash authenticity
  const tokenMatches =
    existing.tokenHash === TokenService.hashToken(rawToken);
  if (!tokenMatches) {
    throw invalid();
  }

  // Grace period handling: If token was already revoked/rotated recently (e.g. 30s),
  // this is a concurrent in-flight request from a client or parallel Next.js component.
  const ROTATION_GRACE_PERIOD_MS = 30_000;
  if (existing.revokedAt !== null) {
    const timeSinceRevocation = Date.now() - existing.revokedAt.getTime();

    if (timeSinceRevocation <= ROTATION_GRACE_PERIOD_MS) {
      // 1. Try reading the cached rotation result from Redis
      try {
        const cached = await RedisService.client.get(
          `refresh_rotation:${jwtId}`,
        );
        if (cached) {
          const parsed = JSON.parse(cached);
          return {
            accessToken: parsed.accessToken,
            refreshToken: parsed.refreshToken,
            refreshTokenExpiresAt: new Date(parsed.refreshTokenExpiresAt),
          };
        }
      } catch (err) {
        logger.warn(
          { err, jwtId },
          'Redis get failed during refresh token grace period',
        );
      }

      // 2. Fallback if not cached or Redis down: generate fresh valid tokens for active session
      const { token: accessToken } = TokenService.generateAccessToken(
        userId,
        sessionId,
      );
      const { token: refreshToken, jwtId: newJwtId } =
        TokenService.generateRefreshToken(userId, sessionId);
      const refreshTokenExpiresAt = TokenService.getRefreshTokenExpiryDate();

      try {
        await SessionRepository.insertRefresh({
          id: randomUUIDv7(),
          sessionId,
          jwtId: newJwtId,
          tokenHash: TokenService.hashToken(refreshToken),
          expiresAt: refreshTokenExpiresAt,
        });
      } catch (err) {
        logger.warn(
          { err, sessionId },
          'Failed to insert replacement refresh token during grace period',
        );
      }

      const graceResult = { accessToken, refreshToken, refreshTokenExpiresAt };
      try {
        await RedisService.client.set(
          `refresh_rotation:${jwtId}`,
          JSON.stringify(graceResult),
          'EX',
          60,
        );
      } catch {}

      return graceResult;
    }

    // Token was rotated MORE than 30s ago -> genuine reuse attempt
    await revokeSession(sessionId);
    security.log({ event: 'REFRESH_TOKEN_REUSE_DETECTED', ...logMeta });
    throw invalid();
  }

  // Normal rotation: token is currently active
  const { token: accessToken } = TokenService.generateAccessToken(
    userId,
    sessionId,
  );
  const { token: refreshToken, jwtId: newJwtId } =
    TokenService.generateRefreshToken(userId, sessionId);
  const refreshTokenExpiresAt = TokenService.getRefreshTokenExpiryDate();

  let claimed = false;
  try {
    await withTransaction(async (tx) => {
      const claim = await SessionRepository.claimRefresh(existing.id, tx);
      if (claim.length === 0) {
        // Another concurrent request in this exact millisecond claimed it
        return;
      }
      claimed = true;

      const created = await SessionRepository.insertRefresh(
        {
          id: randomUUIDv7(),
          sessionId,
          jwtId: newJwtId,
          tokenHash: TokenService.hashToken(refreshToken),
          expiresAt: refreshTokenExpiresAt,
        },
        tx,
      );
      await SessionRepository.linkReplacement(existing.id, created.id, tx);
    });
  } catch (err) {
    logger.error(
      { err, sessionId },
      'Database transaction error during refresh token rotation',
    );
    throw err;
  }

  if (!claimed) {
    // Another concurrent request won the claim race. Wait briefly for its Redis cache
    for (let attempt = 0; attempt < 3; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, 60));
      try {
        const cached = await RedisService.client.get(
          `refresh_rotation:${jwtId}`,
        );
        if (cached) {
          const parsed = JSON.parse(cached);
          return {
            accessToken: parsed.accessToken,
            refreshToken: parsed.refreshToken,
            refreshTokenExpiresAt: new Date(parsed.refreshTokenExpiresAt),
          };
        }
      } catch {}
    }
    // Fallback: return the generated valid tokens
    return { accessToken, refreshToken, refreshTokenExpiresAt };
  }

  const result = { accessToken, refreshToken, refreshTokenExpiresAt };
  try {
    await RedisService.client.set(
      `refresh_rotation:${jwtId}`,
      JSON.stringify(result),
      'EX',
      60,
    );
  } catch (err) {
    logger.warn({ err, sessionId }, 'Failed to cache refresh rotation in Redis');
  }

  return result;
}

export const SessionService = {
  cacheRevoked,
  revokeSession,
  revokeAllSessionsForUser,
  createSession,
  rotateRefreshToken,
};
export type SessionService = typeof SessionService;
