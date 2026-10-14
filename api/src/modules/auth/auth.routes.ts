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

const authRoutes = Router();

authRoutes.post('/register', limit(5), validate({ body: registerSchema }), AuthController.register);
authRoutes.post('/login', limit(5), validate({ body: loginSchema }), AuthController.login);
authRoutes.post('/refresh', limit(20), csrfGuard, refreshGuard, AuthController.refresh);
authRoutes.post('/logout', authenticate, AuthController.logout);
authRoutes.post('/logout-all', authenticate, AuthController.logoutAll);
authRoutes.post(
  '/forgot-password',
  limit(3),
  validate({ body: forgotPasswordSchema }),
  AuthController.forgotPassword,
);
authRoutes.post(
  '/reset-password',
  limit(5),
  validate({ body: resetPasswordSchema }),
  AuthController.resetPassword,
);
authRoutes.get('/me', authenticate, AuthController.me);

// authRoutes.get(
//   '/google',
//   passport.authenticate('google', {
//     scope: ['email', 'profile'],
//     session: false,
//   }),
// );
// authRoutes.get(
//   '/google/callback',
//   passport.authenticate('google', { session: false }),
//   AuthController.googleCallback,
// );


export { authRoutes };