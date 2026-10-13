import type { RequestHandler } from 'express';
import { UnauthorizedError } from '../errors/app-error.js';
import type { Logger } from '../http/logger.js';
import type { RedisService } from '../../database/redis.service.js';
import type { SessionRepository } from '../../modules/auth/session.repository.js';
import type { TokenService } from '../../modules/auth/token.service.js';
import type { UserService } from '../../modules/users/user.service.js';

export function createAuthenticate(d: {
  tokens: TokenService; sessions: SessionRepository; users: UserService; redis: RedisService; logger: Logger;
}): RequestHandler {
  return async (req, _res, next) => {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) throw new UnauthorizedError('Unauthorized');

    let payload;
    try { payload = d.tokens.verifyAccessToken(header.slice(7)); }
    catch { throw new UnauthorizedError('Unauthorized'); }
    if (payload.type !== 'access') throw new UnauthorizedError('Invalid token type');

    let revoked = false;
    try { revoked = await d.redis.isSessionRevoked(payload.sessionId); }
    catch (err) { d.logger.warn({ err, sessionId: payload.sessionId }, 'Redis revocation check failed; checking DB'); }
    if (revoked) throw new UnauthorizedError('Session has been revoked');

    const session = await d.sessions.findById(payload.sessionId);
    if (!session || !session.isActive || session.revokedAt) throw new UnauthorizedError('Session has been revoked');

    const user = await d.users.findById(payload.sub);
    if (!user) throw new UnauthorizedError('User no longer exists');

    req.auth = { userId: payload.sub, sessionId: payload.sessionId, jwtId: payload.jwtId, role: user.role };
    next();
  };
}
