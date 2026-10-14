import type { RequestHandler } from 'express';
import type { Role } from '../../database/drizzle/enums.js';
import { ForbiddenError } from '../errors/app-error.js';

export const authorize =
  (...roles: Role[]): RequestHandler =>
  (req, _res, next) => {
    if (!req.auth || !roles.includes(req.auth.role)) {
      throw new ForbiddenError('You do not have permission to do this.');
    }
    next();
  };
