import { NextRequest, NextResponse } from "next/server";
import { LOGIN } from "../routes.data";

export const SESSION_COOKIE_NAME = "session_token";
export const REFRESH_COOKIE_NAME = "refresh_token";
export const USER_COOKIE_NAME = "user";
export const REFRESH_TIMEOUT_MS = 10_000;

export const ADMIN_PREFIX = "/admin";
export const FORBIDDEN_PATH = "/403";
export const ADMIN_ROLES = ["ADMIN", "CONTENT_MANAGER"] as const;
export const AUTH_ENTRY_ROUTES = [LOGIN, "/register"];

export async function fetchRefreshTokenWithRetry(
  backendUrl: string,
  refreshToken: string,
  timeoutMs: number
): Promise<Response> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const response = await fetch(`${backendUrl}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-client-type": "nextjs",
        },
        body: JSON.stringify({ refreshToken }),
        cache: "no-store",
        signal: AbortSignal.timeout(timeoutMs),
      });
      return response;
    } catch (error) {
      lastError = error;
      if (attempt === 1) {
        await new Promise((r) => setTimeout(r, 300));
      }
    }
  }
  throw lastError;
}

export function decodeJwtPayload(
  token: string
): { exp?: number; role?: string; id?: string } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const jsonStr = atob(base64);
    return JSON.parse(jsonStr);
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload || !payload.exp) return true;
  // Expired or expiring within 30 seconds
  return Date.now() >= (payload.exp - 30) * 1000;
}

export function applySessionCookies(
  response: NextResponse,
  accessToken: string,
  refreshToken?: string | null
) {
  const isProd = process.env.NODE_ENV === "production";
  const THIRTY_DAYS = 30 * 24 * 60 * 60;
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: accessToken,
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: THIRTY_DAYS,
  });
  if (refreshToken) {
    response.cookies.set({
      name: REFRESH_COOKIE_NAME,
      value: refreshToken,
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: THIRTY_DAYS,
    });
  }
}

export function clearSessionCookies(response: NextResponse) {
  response.cookies.delete(SESSION_COOKIE_NAME);
  response.cookies.delete(REFRESH_COOKIE_NAME);
  response.cookies.delete(USER_COOKIE_NAME);
}

export function temporaryRefreshFailure(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json(
      {
        success: false,
        error: "Unable to verify your session right now. Please try again.",
      },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store",
          "Retry-After": "2",
        },
      }
    );
  }

  const destination = new URL("/session-unavailable", request.nextUrl);
  destination.searchParams.set(
    "returnTo",
    `${request.nextUrl.pathname}${request.nextUrl.search}`
  );
  // Clean redirect instead of 503 rewrite so browser doesn't show blank/error screen
  const response = NextResponse.redirect(destination);
  response.headers.set("Cache-Control", "no-store");
  return response;
}
