import type { Request, Response } from 'express';
import { ok } from '../../common/http/response.js';
import { bodyOf } from '../../common/middleware/validate.js';
import { clearAuthCookies, setAuthCookies } from './auth.cookies.js';
import type {
  ForgotPasswordInput,
  GoogleAuthInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
} from './auth.schemas.js';
import { AuthService } from './auth.service.js';
import type { RequestMeta } from './auth.types.js';
import { UserService } from '../users/user.service.js';
import { env } from '../../config/env.js';
import { GoogleAuthService } from './google-auth.service.js';

const meta = (req: Request): RequestMeta => ({
  requestId: String(req.id),
  ipAddress: req.ip,
  userAgent: req.headers['user-agent'],
});
const isNonCookieClient = (req: Request) =>
  Boolean(req.headers['x-client-type']);

type Tokens = {
  accessToken: string;
  refreshToken: string;
  refreshTokenExpiresAt: Date;
};

/** web → refresh token cookie-তে, mobile → body-তে */
function sessionBody(req: Request, res: Response, user: unknown, t: Tokens) {
  if (isNonCookieClient(req))
    return { user, accessToken: t.accessToken, refreshToken: t.refreshToken };
  setAuthCookies(res, t.refreshToken, t.refreshTokenExpiresAt);
  return { user, accessToken: t.accessToken };
}

export const AuthController = {
  register: async (req: Request, res: Response) => {
    const r = await AuthService.register(bodyOf<RegisterInput>(req), meta(req));
    ok(res, sessionBody(req, res, r.user, r.tokens), 201);
  },
  login: async (req: Request, res: Response) => {
    const r = await AuthService.login(bodyOf<LoginInput>(req), meta(req));
    ok(res, sessionBody(req, res, r.user, r.tokens));
  },
  refresh: async (req: Request, res: Response) => {
    const t = await AuthService.refresh(req.refreshToken!, meta(req));
    if (isNonCookieClient(req))
      return ok(res, {
        accessToken: t.accessToken,
        refreshToken: t.refreshToken,
      });
    setAuthCookies(res, t.refreshToken, t.refreshTokenExpiresAt);
    ok(res, { accessToken: t.accessToken });
  },
  logout: async (req: Request, res: Response) => {
    await AuthService.logout(req.auth!.sessionId, meta(req));
    if (!isNonCookieClient(req)) clearAuthCookies(res);
    ok(res, { message: 'Logged out' });
  },
  logoutAll: async (req: Request, res: Response) => {
    await AuthService.logoutAll(req.auth!.userId, meta(req));
    if (!isNonCookieClient(req)) clearAuthCookies(res);
    ok(res, { message: 'Logged out of all sessions' });
  },
  forgotPassword: async (req: Request, res: Response) => {
    await AuthService.forgotPassword(
      bodyOf<ForgotPasswordInput>(req).email,
      meta(req),
    );
    ok(res, {
      message:
        'If the account exists, password reset instructions have been sent.',
    });
  },
  resetPassword: async (req: Request, res: Response) => {
    const { token, newPassword } = bodyOf<ResetPasswordInput>(req);
    await AuthService.resetPassword(token, newPassword, meta(req));
    ok(res, { message: 'Password has been reset. Please log in again.' });
  },
  me: async (req: Request, res: Response) => {
    const user = await UserService.findById(req.auth!.userId);
    ok(res, user ? UserService.toSafeUser(user) : null);
  },
  google: async (req: Request, res: Response) => {
    const result = await AuthService.loginWithGoogle(
      bodyOf<GoogleAuthInput>(req),
      meta(req),
    );
    ok(res, result);
  },
  googleRedirect: async (req: Request, res: Response) => {
    const returnTo =
      typeof req.query.returnTo === 'string' ? req.query.returnTo : undefined;
    const state = returnTo
      ? Buffer.from(JSON.stringify({ returnTo })).toString('base64url')
      : undefined;

    const authUrl = GoogleAuthService.getAuthorizationUrl(
      env.GOOGLE_CALLBACK_URL,
      state,
    );
    res.redirect(authUrl);
  },
  googleCallback: async (req: Request, res: Response) => {
    const frontendBase = (env.FRONTEND_URL ?? 'http://localhost:3000').replace(
      /\/$/,
      '',
    );
    const { code, error, state } = req.query;

    let targetPath = '/oauth/callback';
    if (typeof state === 'string') {
      try {
        const decoded = JSON.parse(
          Buffer.from(state, 'base64url').toString('utf8'),
        );
        if (
          decoded.returnTo &&
          typeof decoded.returnTo === 'string' &&
          decoded.returnTo.startsWith('/') &&
          !decoded.returnTo.startsWith('//')
        ) {
          targetPath = decoded.returnTo;
        }
      } catch {
        // ignore malformed state
      }
    }

    if (error || !code || typeof code !== 'string') {
      const errorMsg =
        typeof error === 'string' ? error : 'google_authentication_failed';
      return res.redirect(
        `${frontendBase}/login?error=${encodeURIComponent(errorMsg)}`,
      );
    }

    try {
      const result = await AuthService.loginWithGoogle(
        {
          code,
          redirectUri: env.GOOGLE_CALLBACK_URL,
        },
        meta(req),
      );

      const targetUrl = new URL('/oauth/callback', frontendBase);
      targetUrl.searchParams.set('accessToken', result.accessToken);
      targetUrl.searchParams.set('refreshToken', result.refreshToken);
      if (targetPath !== '/oauth/callback') {
        targetUrl.searchParams.set('returnTo', targetPath);
      }

      return res.redirect(targetUrl.toString());
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : 'google_authentication_failed';
      return res.redirect(
        `${frontendBase}/login?error=${encodeURIComponent(errorMsg)}`,
      );
    }
  },
};

export type AuthController = typeof AuthController;



