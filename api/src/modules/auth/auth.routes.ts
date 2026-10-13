import { Router, type RequestHandler } from 'express';
import passport from 'passport';
import { validate } from '../../common/middleware/validate.js';
import { limit } from '../../common/middleware/rate-limit.js';
import { csrfGuard } from '../../common/middleware/csrf.js';
import type { AuthController } from './auth.controller.js';
import { forgotPasswordSchema, loginSchema, registerSchema, resetPasswordSchema } from './auth.schemas.js';

export function createAuthRouter(d: {
  controller: AuthController; authenticate: RequestHandler; refreshGuard: RequestHandler;
}) {
  const r = Router();
  const c = d.controller;

  r.post('/register', limit(5), validate({ body: registerSchema }), c.register);
  r.post('/login', limit(5), validate({ body: loginSchema }), c.login);
  r.post('/refresh', limit(20), csrfGuard, d.refreshGuard, c.refresh);
  r.post('/logout', d.authenticate, c.logout);
  r.post('/logout-all', d.authenticate, c.logoutAll);
  r.post('/forgot-password', limit(3), validate({ body: forgotPasswordSchema }), c.forgotPassword);
  r.post('/reset-password', limit(5), validate({ body: resetPasswordSchema }), c.resetPassword);
  r.get('/me', d.authenticate, c.me);

  r.get('/google', passport.authenticate('google', { scope: ['email', 'profile'], session: false }));
  r.get('/google/callback', passport.authenticate('google', { session: false }), c.googleCallback);

  return r;
}
