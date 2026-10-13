import jwt, { type SignOptions } from 'jsonwebtoken';
import { createHmac } from 'node:crypto';
import { v7 as randomUUIDv7 } from 'uuid';
import { env } from '../../config/env.js';
import { parseDurationSeconds } from '../../common/utils/duration.js';
import type { AccessTokenPayload, RefreshTokenPayload } from './auth.types.js';

const ALG = 'HS256' as const;
const exp = (v: string) => v as SignOptions['expiresIn'];

export function createTokenService() {
  const hashToken = (raw: string) => createHmac('sha256', env.TOKEN_HASH_SECRET).update(raw).digest('hex');

  return {
    generateAccessToken(userId: string, sessionId: string) {
      const jwtId = randomUUIDv7();
      const payload: AccessTokenPayload = { sub: userId, type: 'access', sessionId, jwtId };
      const token = jwt.sign(payload, env.JWT_ACCESS_SECRET, { algorithm: ALG, expiresIn: exp(env.JWT_ACCESS_EXPIRES_IN) });
      return { token, jwtId };
    },
    generateRefreshToken(userId: string, sessionId: string) {
      const jwtId = randomUUIDv7();
      const payload: RefreshTokenPayload = { sub: userId, type: 'refresh', sessionId, jwtId };
      const token = jwt.sign(payload, env.JWT_REFRESH_SECRET, { algorithm: ALG, expiresIn: exp(env.JWT_REFRESH_EXPIRES_IN) });
      return { token, jwtId };
    },
    verifyAccessToken: (token: string) =>
      jwt.verify(token, env.JWT_ACCESS_SECRET, { algorithms: [ALG] }) as unknown as AccessTokenPayload,
    verifyRefreshToken: (token: string) =>
      jwt.verify(token, env.JWT_REFRESH_SECRET, { algorithms: [ALG] }) as unknown as RefreshTokenPayload,
    getAccessTokenTtlSeconds: () => parseDurationSeconds(env.JWT_ACCESS_EXPIRES_IN),
    getRefreshTokenExpiryDate: () => new Date(Date.now() + parseDurationSeconds(env.JWT_REFRESH_EXPIRES_IN) * 1000),
    hashToken,
    generateResetToken() {
      const rawToken = randomUUIDv7() + randomUUIDv7();
      return { rawToken, hash: hashToken(rawToken) };
    },
  };
}
export type TokenService = ReturnType<typeof createTokenService>;
