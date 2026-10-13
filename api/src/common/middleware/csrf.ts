import type { RequestHandler } from 'express';
import { env } from '../../config/env.js';
import { UnauthorizedError } from '../errors/app-error.js';

export const csrfGuard: RequestHandler = (req, _res, next) => {
  if (req.headers['x-client-type']) return next(); // mobile
  if (!req.cookies?.[env.AUTH_COOKIE_NAME]) return next();

  const cookie = req.cookies?.['csrf_token'];
  const header = req.headers['x-csrf-token'];
  if (!cookie || !header || cookie !== header) throw new UnauthorizedError('Invalid or missing CSRF token');
  next();
};
