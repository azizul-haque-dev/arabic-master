import type { RequestHandler } from 'express';
import { env } from '../../config/env.js';
import { UnauthorizedError } from '../errors/app-error.js';
import type { TokenService } from '../../modules/auth/token.service.js';

export const createRefreshGuard =
  (tokens: TokenService): RequestHandler =>
  (req, _res, next) => {
    const invalid = () =>
      new UnauthorizedError('Invalid or expired refresh token');
    const nonCookie = Boolean(req.headers['x-client-type']);
    const raw = nonCookie
      ? req.body?.refreshToken
      : req.cookies?.[env.AUTH_COOKIE_NAME];
    if (!raw || typeof raw !== 'string') throw invalid();

    let payload;
    try {
      payload = tokens.verifyRefreshToken(raw);
    } catch {
      throw invalid();
    }
    if (payload.type !== 'refresh') throw invalid();

    req.refreshToken = { ...payload, rawToken: raw };
    next();
  };
