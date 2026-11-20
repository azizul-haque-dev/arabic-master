import type { Request, Response } from 'express';
import { ok } from '../../common/http/response.js';
import { bodyOf } from '../../common/middleware/validate.js';
import {
  clearAuthCookies,
  clearGoogleOAuthStateCookie,
  GOOGLE_OAUTH_STATE_COOKIE_NAME,
  setAuthCookies,
  setGoogleOAuthStateCookie,
} from './auth.cookies.js';
import type {
  ForgotPasswordInput,
  GoogleExchangeInput,
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
import { GoogleOAuthFlowService } from './google-oauth-flow.service.js';
import { UnauthorizedError } from '../../common/errors/app-error.js';

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
  exchangeGoogleCode: async (req: Request, res: Response) => {
    const { code } = bodyOf<GoogleExchangeInput>(req);
    const result = await GoogleOAuthFlowService.consumeExchange(code);
    if (!result) {
      throw new UnauthorizedError('Invalid or expired Google exchange code');
    }
    ok(res, result);
  },
  googleRedirect: async (req: Request, res: Response) => {
    const returnTo =
      typeof req.query.returnTo === 'string' ? req.query.returnTo : undefined;
    const safeReturnTo =
      returnTo?.startsWith('/') && !returnTo.startsWith('//')
        ? returnTo
        : undefined;
    const state = await GoogleOAuthFlowService.createState(safeReturnTo);
    setGoogleOAuthStateCookie(res, state);

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

    const stateCookie = req.cookies?.[GOOGLE_OAUTH_STATE_COOKIE_NAME];
    clearGoogleOAuthStateCookie(res);
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Cache-Control', 'no-store');
    if (
      typeof state !== 'string' ||
      typeof stateCookie !== 'string' ||
      state !== stateCookie
    ) {
      return res.redirect(
        `${frontendBase}/login?error=google_authentication_failed`,
      );
    }

    const returnTo = await GoogleOAuthFlowService.consumeState(state);
    if (returnTo === null) {
      return res.redirect(
        `${frontendBase}/login?error=google_authentication_failed`,
      );
    }
    const targetPath =
      returnTo?.startsWith('/') && !returnTo.startsWith('//')
        ? returnTo
        : '/oauth/callback';

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

      const exchangeCode = await GoogleOAuthFlowService.createExchange({
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });
      const targetUrl = new URL('/oauth/callback', frontendBase);
      targetUrl.searchParams.set('code', exchangeCode);
      if (targetPath !== '/oauth/callback') {
        targetUrl.searchParams.set('returnTo', targetPath);
      }

      res.setHeader('Referrer-Policy', 'no-referrer');
      res.setHeader('Cache-Control', 'no-store');
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



