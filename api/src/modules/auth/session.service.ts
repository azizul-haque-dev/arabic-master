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

  const isReuse =
    existing.revokedAt !== null ||
    existing.tokenHash !== TokenService.hashToken(rawToken);
  if (isReuse) {
    await revokeSession(sessionId); // reuse detected → revoke entire session
    security.log({ event: 'REFRESH_TOKEN_REUSE_DETECTED', ...logMeta });
    throw invalid();
  }

  const { token: accessToken } = TokenService.generateAccessToken(
    userId,
    sessionId,
  );
  const { token: refreshToken, jwtId: newJwtId } =
    TokenService.generateRefreshToken(userId, sessionId);
  const refreshTokenExpiresAt = TokenService.getRefreshTokenExpiryDate();

  try {
    await withTransaction(async (tx) => {
      const claim = await SessionRepository.claimRefresh(existing.id, tx);
      if (claim.length === 0) throw invalid(); // Another concurrent request already claimed it

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
    await revokeSession(sessionId);
    security.log({ event: 'CONCURRENT_REFRESH_RACE_DETECTED', ...logMeta });
    throw err;
  }
  return { accessToken, refreshToken, refreshTokenExpiresAt };
}

export const SessionService = {
  cacheRevoked,
  revokeSession,
  revokeAllSessionsForUser,
  createSession,
  rotateRefreshToken,
};
export type SessionService = typeof SessionService;
