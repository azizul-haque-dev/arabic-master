import type { Request, Response } from 'express';
import { ok } from '../../common/http/response.js';
import { bodyOf } from '../../common/middleware/validate.js';
import { env } from '../../config/env.js';
import { clearAuthCookies, setAuthCookies } from './auth.cookies.js';
import type { ForgotPasswordInput, LoginInput, RegisterInput, ResetPasswordInput } from './auth.schemas.js';
import type { AuthService } from './auth.service.js';
import type { RequestMeta } from './auth.types.js';
import type { GoogleProfilePayload } from './oauth.service.js';
import type { UserService } from '../users/user.service.js';

const meta = (req: Request): RequestMeta => ({
  requestId: String(req.id),
  ipAddress: req.ip,
  userAgent: req.headers['user-agent'],
});
const isNonCookieClient = (req: Request) => Boolean(req.headers['x-client-type']);

type Tokens = { accessToken: string; refreshToken: string; refreshTokenExpiresAt: Date };

/** web → refresh token cookie-তে, mobile → body-তে */
function sessionBody(req: Request, res: Response, user: unknown, t: Tokens) {
  if (isNonCookieClient(req)) return { user, accessToken: t.accessToken, refreshToken: t.refreshToken };
  setAuthCookies(res, t.refreshToken, t.refreshTokenExpiresAt);
  return { user, accessToken: t.accessToken };
}

export function createAuthController(d: { auth: AuthService; users: UserService }) {
  const { auth, users } = d;

  return {
    register: async (req: Request, res: Response) => {
      const r = await auth.register(bodyOf<RegisterInput>(req), meta(req));
      ok(res, sessionBody(req, res, r.user, r.tokens), 201);
    },
    login: async (req: Request, res: Response) => {
      const r = await auth.login(bodyOf<LoginInput>(req), meta(req));
      ok(res, sessionBody(req, res, r.user, r.tokens));
    },
    refresh: async (req: Request, res: Response) => {
      const t = await auth.refresh(req.refreshToken!, meta(req));
      if (isNonCookieClient(req)) return ok(res, { accessToken: t.accessToken, refreshToken: t.refreshToken });
      setAuthCookies(res, t.refreshToken, t.refreshTokenExpiresAt);
      ok(res, { accessToken: t.accessToken });
    },
    logout: async (req: Request, res: Response) => {
      await auth.logout(req.auth!.sessionId, meta(req));
      if (!isNonCookieClient(req)) clearAuthCookies(res);
      ok(res, { message: 'Logged out' });
    },
    logoutAll: async (req: Request, res: Response) => {
      await auth.logoutAll(req.auth!.userId, meta(req));
      if (!isNonCookieClient(req)) clearAuthCookies(res);
      ok(res, { message: 'Logged out of all sessions' });
    },
    forgotPassword: async (req: Request, res: Response) => {
      await auth.forgotPassword(bodyOf<ForgotPasswordInput>(req).email, meta(req));
      ok(res, { message: 'If the account exists, password reset instructions have been sent.' });
    },
    resetPassword: async (req: Request, res: Response) => {
      const { token, newPassword } = bodyOf<ResetPasswordInput>(req);
      await auth.resetPassword(token, newPassword, meta(req));
      ok(res, { message: 'Password has been reset. Please log in again.' });
    },
    me: async (req: Request, res: Response) => {
      const user = await users.findById(req.auth!.userId);
      ok(res, user ? users.toSafeUser(user) : null);
    },
    googleCallback: async (req: Request, res: Response) => {
      const result = await auth.loginWithGoogle(req.user as unknown as GoogleProfilePayload, meta(req));
      setAuthCookies(res, result.tokens.refreshToken, result.tokens.refreshTokenExpiresAt);

      if (env.FRONTEND_URL) {
        // ⚠️ token URL query-তে। আগের আচরণ রাখা হয়েছে (leak ঝুঁকি, README দেখুন)
        const url = new URL('/oauth/callback', env.FRONTEND_URL);
        url.searchParams.set('accessToken', result.tokens.accessToken);
        url.searchParams.set('refreshToken', result.tokens.refreshToken);
        return res.redirect(url.toString());
      }
      res.json({ user: result.user, accessToken: result.tokens.accessToken, refreshToken: result.tokens.refreshToken });
    },
  };
}
export type AuthController = ReturnType<typeof createAuthController>;
