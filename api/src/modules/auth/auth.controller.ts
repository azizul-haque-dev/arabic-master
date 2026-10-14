import type { Request, Response } from 'express';
import { ok } from '../../common/http/response.js';
import { bodyOf } from '../../common/middleware/validate.js';
import { env } from '../../config/env.js';
import { clearAuthCookies, setAuthCookies } from './auth.cookies.js';
import type {
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
} from './auth.schemas.js';
import { AuthService } from './auth.service.js';
import type { RequestMeta } from './auth.types.js';
import { UserService } from '../users/user.service.js';
// import

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
  // googleCallback: async (req: Request, res: Response) => {
  //   const result = await AuthService.loginWithGoogle(
  //     req.user as unknown as GoogleProfilePayload,
  //     meta(req),
  //   );
  //   setAuthCookies(
  //     res,
  //     result.tokens.refreshToken,
  //     result.tokens.refreshTokenExpiresAt,
  //   );

  //   if (env.FRONTEND_URL) {
  //     // ⚠️ token URL query-তে। আগের আচরণ রাখা হয়েছে (leak ঝুঁকি, README দেখুন)
  //     const url = new URL('/oauth/callback', env.FRONTEND_URL);
  //     url.searchParams.set('accessToken', result.tokens.accessToken);
  //     url.searchParams.set('refreshToken', result.tokens.refreshToken);
  //     return res.redirect(url.toString());
  //   }
  //   res.json({
  //     user: result.user,
  //     accessToken: result.tokens.accessToken,
  //     refreshToken: result.tokens.refreshToken,
  //   });
  // },
};

export type AuthController = typeof AuthController;



