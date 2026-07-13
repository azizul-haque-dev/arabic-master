import { CookieOptions, Request, Response } from "express";
import { env, isProd } from "../../config/env.js";
import { ApiError } from "../../utils/api-error.js";
import { sendSuccess } from "../../utils/api-response.js";
import { asyncHandler } from "../../utils/async-handler.js";
import * as authService from "./auth.service.js";

const REFRESH_COOKIE_NAME = "refreshToken";

// httpOnly cookie so the refresh token is never exposed to client-side JS,
// which is the standard mitigation against XSS-based token theft.
const refreshCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: "lax",
  domain: env.COOKIE_DOMAIN,
  path: "/api/v1/auth",
  maxAge: 7 * 24 * 60 * 60 * 1000, // matches JWT_REFRESH_EXPIRES_IN default
};

function setRefreshCookie(res: Response, token: string) {
  res.cookie(REFRESH_COOKIE_NAME, token, refreshCookieOptions);
}

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { user, accessToken, refreshToken } = await authService.register(
    req.body,
  );
  setRefreshCookie(res, refreshToken);
  sendSuccess(
    res,
    201,
    "Account created. Please check your email to verify your account.",
    {
      user,
      accessToken,
    },
  );
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { user, accessToken, refreshToken } = await authService.login(req.body);
  setRefreshCookie(res, refreshToken);
  sendSuccess(res, 200, "Logged in successfully", { user, accessToken });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const rawToken = req.cookies?.[REFRESH_COOKIE_NAME];
  if (!rawToken) throw ApiError.unauthorized("No refresh token provided");

  const { accessToken, refreshToken } =
    await authService.refreshTokens(rawToken);
  setRefreshCookie(res, refreshToken);
  sendSuccess(res, 200, "Token refreshed", { accessToken });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const rawToken = req.cookies?.[REFRESH_COOKIE_NAME];
  if (rawToken) await authService.logout(rawToken);

  res.clearCookie(REFRESH_COOKIE_NAME, { path: refreshCookieOptions.path });
  sendSuccess(res, 200, "Logged out successfully");
});

export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  await authService.verifyEmail(req.body.token);
  sendSuccess(res, 200, "Email verified successfully");
});

export const forgotPassword = asyncHandler(
  async (req: Request, res: Response) => {
    await authService.forgotPassword(req.body.email);
    sendSuccess(
      res,
      200,
      "If an account exists for that email, a reset link has been sent.",
    );
  },
);

export const resetPassword = asyncHandler(
  async (req: Request, res: Response) => {
    await authService.resetPassword(req.body.token, req.body.password);
    sendSuccess(res, 200, "Password reset successfully. Please log in again.");
  },
);

// Called by passport's Google callback route after a successful login.
export const googleCallback = asyncHandler(
  async (req: Request, res: Response) => {
    const result = req.user as unknown as {
      accessToken: string;
      refreshToken: string;
    };
    setRefreshCookie(res, result.refreshToken);
    // Redirect back to the frontend with the access token as a one-time
    // query param; the client should exchange/store it immediately.
    res.redirect(
      `${env.CLIENT_URL}/oauth/callback?accessToken=${result.accessToken}`,
    );
  },
);
