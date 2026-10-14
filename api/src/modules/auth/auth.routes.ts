import { Router } from 'express';

import { validate } from '../../common/middleware/validate.js';
import { limit } from '../../common/middleware/rate-limit.js';
import { csrfGuard } from '../../common/middleware/csrf.js';
import { AuthController } from './auth.controller.js';
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from './auth.schemas.js';
import { authenticate } from '../../common/middleware/authenticate.js';
import { refreshGuard } from '../../common/middleware/refresh-guard.js';

const r = Router();

r.post('/register', limit(5), validate({ body: registerSchema }), AuthController.register);
r.post('/login', limit(5), validate({ body: loginSchema }), AuthController.login);
r.post('/refresh', limit(20), csrfGuard, refreshGuard, AuthController.refresh);
r.post('/logout', authenticate, AuthController.logout);
r.post('/logout-all', authenticate, AuthController.logoutAll);
r.post(
  '/forgot-password',
  limit(3),
  validate({ body: forgotPasswordSchema }),
  AuthController.forgotPassword,
);
r.post(
  '/reset-password',
  limit(5),
  validate({ body: resetPasswordSchema }),
  AuthController.resetPassword,
);
r.get('/me', authenticate, AuthController.me);

// r.get(
//   '/google',
//   passport.authenticate('google', {
//     scope: ['email', 'profile'],
//     session: false,
//   }),
// );
// r.get(
//   '/google/callback',
//   passport.authenticate('google', { session: false }),
//   AuthController.googleCallback,
// );

export const authRoutes = r;
export default r;
