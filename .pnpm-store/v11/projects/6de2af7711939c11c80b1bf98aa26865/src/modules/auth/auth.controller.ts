import { CookieOptions, Request, Response } from "express";
import { env, isProd } from "../../config/env.js";
import { ApiError } from "../../utils/api-error.js";
import { sendSuccess } from "../../utils/api-response.js";
import { asyncHandler } from "../../utils/async-handler.js";
import * as authService from "./auth.service.js";

const REFRESH_COOKIE_NAME = "refreshToken";
const ACCESS_COOKIE_NAME = "accessToken";

// httpOnly cookie so the refresh token is never exposed to client-side JS,
// which is the standard mitigation against XSS-based token theft.
const cookieDomain = env.COOKIE_DOMAIN?.trim() || undefined;

const baseCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProd,
  // Cross-origin production clients need SameSite=None for the browser to
  // accept and return the cookie. Secure is mandatory with SameSite=None.
  sameSite: isProd ? "none" : "lax",
  domain: cookieDomain,
  path: "/",
};

const refreshCookieOptions: CookieOptions = {
  ...baseCookieOptions,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};
const accessCookieOptions: CookieOptions = {
  ...baseCookieOptions,
  maxAge: 15 * 60 * 1000,
};

function setRefreshCookie(res: Response, token: string) {
  res.cookie(REFRESH_COOKIE_NAME, token, refreshCookieOptions);
}
function setAccessCookie(res: Response, token: string) {
  res.cookie(ACCESS_COOKIE_NAME, token, accessCookieOptions);
}

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { user, accessToken, refreshToken } = await authService.register(
    req.body,
  );
  const platform = req.headers["x-client-type"]?.toString().trim();
  if (platform !== "mobile") {
    setRefreshCookie(res, refreshToken);
    setAccessCookie(res, accessToken);
    sendSuccess(
      res,
      201,
      "Account created. Please check your email to verify your account.",
      {
        user,
      },
    );
  } else {
    sendSuccess(
      res,
      201,
      "Account created. Please check your email to verify your account.",
      {
        user,
        accessToken,
        refresh,
      },
    );
  }
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { user, accessToken, refreshToken } = await authService.login(req.body);
  const platform = req.headers["x-client-type"]?.toString().trim();
  if (platform !== "mobile") {
    setRefreshCookie(res, refreshToken);
    setAccessCookie(res, accessToken);
    sendSuccess(res, 200, "Logged in successfully.", {
      user,
      accessToken,
      refresh,
    });
  } else {
    sendSuccess(res, 200, "Logged in successfully", {
      user,
      accessToken,
      refresh,
    });
  }
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const rawToken = req.cookies?.refreshToken;

  if (!rawToken) throw ApiError.unauthorized("No refresh token provided");

  const { accessToken, refreshToken } =
    await authService.refreshTokens(rawToken);

  const platform = req.headers["x-client-type"]?.toString().trim();
  if (platform !== "mobile") {
    setRefreshCookie(res, refreshToken);
    setAccessCookie(res, accessToken);
    sendSuccess(res, 200, "Token refreshed");
  } else {
    sendSuccess(res, 200, "Token refreshed", { accessToken, refreshToken });
  }
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const rawToken = req.cookies?.[REFRESH_COOKIE_NAME];
  if (rawToken) await authService.logout(rawToken);

  res.clearCookie(REFRESH_COOKIE_NAME, baseCookieOptions);
  res.clearCookie(ACCESS_COOKIE_NAME, baseCookieOptions);
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
    const platform = req.headers["x-client-type"]?.toString().trim();
    if (platform !== "mobile") {
      setRefreshCookie(res, result.refreshToken);
      setAccessCookie(res, result.accessToken);
    }
    res.redirect(
      `${env.CLIENT_URL}/oauth/callback?accessToken=${result.accessToken}?refreshToken=${result.refreshToken}`,
    );
  },
);
