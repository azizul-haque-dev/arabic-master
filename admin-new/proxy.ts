import { NextRequest, NextResponse } from "next/server";
import { LOGIN, PUBLIC_ROUTES, ROOT } from "./lib/routes.data";
import { getPostLoginRedirect } from "./lib/auth/redirect";
import { getBackendApiUrl } from "./lib/auth/backend-url";

const SESSION_COOKIE_NAME = "session_token";
const REFRESH_COOKIE_NAME = "refresh_token";
const USER_COOKIE_NAME = "user";

const ADMIN_PREFIX = "/admin";
const FORBIDDEN_PATH = "/403";
const ADMIN_ROLES = ["ADMIN", "CONTENT_MANAGER"] as const;

function decodeJwtPayload(token: string): { exp?: number; role?: string; id?: string } | null {
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

function isTokenExpired(token: string): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload || !payload.exp) return true;
  // If expired or expiring within 30 seconds
  return Date.now() >= (payload.exp - 30) * 1000;
}

function applySessionCookies(
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

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Let API auth and session routes handle their own execution directly (no double-refresh or HTML redirects)
  if (pathname.startsWith("/api/auth") || pathname === "/api/me") {
    return NextResponse.next();
  }

  let token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const refreshToken = request.cookies.get(REFRESH_COOKIE_NAME)?.value;
  const userCookie = request.cookies.get(USER_COOKIE_NAME)?.value;

  const isPublicRoute =
    PUBLIC_ROUTES.some((route) => pathname.startsWith(route)) ||
    pathname === ROOT;

  let refreshed = false;
  let newAccessToken: string | null = null;
  let newRefreshToken: string | null = null;
  let refreshTokenRejected = false;

  // Auto-refresh expired access token if a valid refresh token exists
  if ((!token || isTokenExpired(token)) && refreshToken) {
    try {
      const backendUrl = getBackendApiUrl();
      const refreshRes = await fetch(`${backendUrl}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-client-type": "nextjs",
        },
        body: JSON.stringify({ refreshToken }),
        cache: "no-store",
      });

      if (refreshRes.ok) {
        const body = await refreshRes.json();
        const data = body?.data ?? body;
        if (data?.accessToken) {
          token = data.accessToken;
          newAccessToken = data.accessToken;
          newRefreshToken = data.refreshToken || refreshToken;
          refreshed = true;
        }
      } else if (refreshRes.status === 401 || refreshRes.status === 403) {
        // Backend explicitly rejected the refresh token as invalid or expired
        refreshTokenRejected = true;
      } else {
        console.warn(`[Proxy] Refresh returned HTTP status ${refreshRes.status}`);
      }
    } catch (error) {
      console.error("[Proxy] Token refresh network error:", error);
    }
  }

  const hasValidToken = !!token && !isTokenExpired(token);

  // Protected API routes: return JSON 401 rather than HTML redirect to login
  if (pathname.startsWith("/api/")) {
    if (!hasValidToken) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    return NextResponse.next();
  }

  // Redirect unauthenticated requests away from protected pages
  if (!hasValidToken && !isPublicRoute) {
    const redirectRes = NextResponse.redirect(new URL(LOGIN, request.nextUrl), request);
    // Only delete cookies if refreshToken is missing or was explicitly rejected by backend (401/403).
    // Never delete on transient network failures or backend restarts.
    if (!refreshToken || refreshTokenRejected) {
      redirectRes.cookies.delete(SESSION_COOKIE_NAME);
      redirectRes.cookies.delete(REFRESH_COOKIE_NAME);
      redirectRes.cookies.delete(USER_COOKIE_NAME);
    }
    return redirectRes;
  }

  // Redirect authenticated users away from login/register pages
  if (hasValidToken && (pathname === LOGIN || pathname === "/register")) {
    let redirectPath = "/admin/arabic-entities";
    if (userCookie) {
      try {
        redirectPath = getPostLoginRedirect(JSON.parse(userCookie).role);
      } catch (error) {
        console.error("Error parsing user cookie:", error);
      }
    }
    const redirectRes = NextResponse.redirect(new URL(redirectPath, request.nextUrl), request);
    if (refreshed && newAccessToken) {
      applySessionCookies(redirectRes, newAccessToken, newRefreshToken);
    }
    return redirectRes;
  }

  let userRole: string | undefined;
  let userId: string | undefined;

  if (userCookie) {
    try {
      const decodedUser = JSON.parse(userCookie);
      userRole = decodedUser.role;
      userId = decodedUser.id ? String(decodedUser.id) : undefined;
    } catch (error) {
      console.error("Error parsing user cookie:", error);
    }
  }

  if (hasValidToken && (!userRole || !userId)) {
    const jwtPayload = decodeJwtPayload(token!);
    if (jwtPayload) {
      userRole = userRole || jwtPayload.role;
      userId = userId || (jwtPayload.id ? String(jwtPayload.id) : undefined);
    }
  }

  if (userRole) {
    const isAdminRoute = pathname.startsWith(ADMIN_PREFIX);
    const isUserRoute = pathname.startsWith("/user");

    if (isAdminRoute && !ADMIN_ROLES.includes(userRole as (typeof ADMIN_ROLES)[number])) {
      return NextResponse.redirect(new URL(FORBIDDEN_PATH, request.nextUrl), request);
    }

    if (isUserRoute && !ADMIN_ROLES.includes(userRole as (typeof ADMIN_ROLES)[number])) {
      return NextResponse.redirect(new URL(FORBIDDEN_PATH, request.nextUrl), request);
    }
  }

  const requestHeaders = new Headers(request.headers);
  if (userId) requestHeaders.set("x-user-id", userId);
  if (userRole) requestHeaders.set("x-user-role", userRole);

  if (refreshed && newAccessToken) {
    request.cookies.set(SESSION_COOKIE_NAME, newAccessToken);
    if (newRefreshToken) {
      request.cookies.set(REFRESH_COOKIE_NAME, newRefreshToken);
    }
    // Forward updated cookie string to Server Components for the current request
    requestHeaders.set("cookie", request.cookies.toString());
  }

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  if (refreshed && newAccessToken) {
    applySessionCookies(response, newAccessToken, newRefreshToken);
  }

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/user/:path",
    "/api/:path*",
    "/403/:path*",
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};