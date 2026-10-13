import type { Response } from 'express';
import { randomUUIDv7 } from 'node:crypto';
import { env } from '../../config/env.js';

const cookiePath = () => `/${env.API_PREFIX}/v1/auth`;

export function setAuthCookies(res: Response, refreshToken: string, expiresAt: Date) {
  const base = { secure: env.AUTH_COOKIE_SECURE, sameSite: env.AUTH_COOKIE_SAME_SITE, expires: expiresAt, path: cookiePath() };
  res.cookie(env.AUTH_COOKIE_NAME, refreshToken, { ...base, httpOnly: env.AUTH_COOKIE_HTTP_ONLY });
  // JS-এর পড়ার জন্য ইচ্ছাকৃতভাবে httpOnly: false (double-submit CSRF token, secret নয়)
  res.cookie('csrf_token', randomUUIDv7(), { ...base, httpOnly: false });
}

export function clearAuthCookies(res: Response) {
  res.clearCookie(env.AUTH_COOKIE_NAME, { path: cookiePath() });
  res.clearCookie('csrf_token', { path: cookiePath() });
}
