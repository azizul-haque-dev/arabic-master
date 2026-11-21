import { NextRequest, NextResponse } from "next/server";
import { LOGIN, PUBLIC_ROUTES, ROOT } from "./lib/routes.data";
import { getPostLoginRedirect } from "./lib/auth/redirect";
import { getBackendApiUrl } from "./lib/auth/backend-url";
import {
  SESSION_COOKIE_NAME,
  REFRESH_COOKIE_NAME,
  USER_COOKIE_NAME,
  REFRESH_TIMEOUT_MS,
  ADMIN_PREFIX,
  FORBIDDEN_PATH,
  ADMIN_ROLES,
  AUTH_ENTRY_ROUTES,
  fetchRefreshTokenWithRetry,
  decodeJwtPayload,
  isTokenExpired,
  applySessionCookies,
  clearSessionCookies,
  temporaryRefreshFailure,
} from "./lib/auth/proxy-auth";

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
  const isAuthEntryRoute = AUTH_ENTRY_ROUTES.includes(pathname);

  let refreshed = false;
  let newAccessToken: string | null = null;
  let newRefreshToken: string | null = null;
  let refreshTokenRejected = false;
  let refreshUnavailable = false;

  // Public pages should not wait for an auth service they do not need.
  if (
    (!isPublicRoute || isAuthEntryRoute) &&
    (!token || isTokenExpired(token)) &&
    refreshToken
  ) {
    try {
      const backendUrl = getBackendApiUrl();
      const refreshRes = await fetchRefreshTokenWithRetry(
        backendUrl,
        refreshToken,
        REFRESH_TIMEOUT_MS
      );

      if (refreshRes.ok) {
        const body = await refreshRes.json();
        const data = body?.data ?? body;
        if (data?.accessToken) {
          token = data.accessToken;
          newAccessToken = data.accessToken;
          newRefreshToken = data.refreshToken || refreshToken;
          refreshed = true;
        } else {
          console.error("[Proxy] Refresh response did not contain an access token");
          refreshUnavailable = true;
        }
      } else if (refreshRes.status === 401 || refreshRes.status === 403) {
        // Backend explicitly rejected the refresh token as invalid or expired
        refreshTokenRejected = true;
      } else {
        console.warn(`[Proxy] Refresh returned HTTP status ${refreshRes.status}`);
        refreshUnavailable = true;
      }
    } catch (error) {
      refreshUnavailable = true;
      if (error instanceof Error && error.name === "TimeoutError") {
        console.warn(`[Proxy] Token refresh timed out after ${REFRESH_TIMEOUT_MS}ms`);
      } else {
        console.error("[Proxy] Token refresh network error:", error);
      }
    }
  }

  const hasValidToken = !!token && !isTokenExpired(token);

  // Protected API routes: return JSON 401 rather than HTML redirect to login
  if (pathname.startsWith("/api/")) {
    if (!hasValidToken) {
      if (refreshUnavailable) {
        return temporaryRefreshFailure(request);
      }

      const response = NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
      if (refreshTokenRejected || !refreshToken) {
        clearSessionCookies(response);
      }
      return response;
    }
    if (refreshed && newAccessToken) {
      request.cookies.set(SESSION_COOKIE_NAME, newAccessToken);
      if (newRefreshToken) {
        request.cookies.set(REFRESH_COOKIE_NAME, newRefreshToken);
      }
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("cookie", request.cookies.toString());
      const response = NextResponse.next({
        request: { headers: requestHeaders },
      });
      applySessionCookies(response, newAccessToken, newRefreshToken);
      return response;
    }
    return NextResponse.next();
  }

  // Redirect unauthenticated requests away from protected pages
  if (!hasValidToken && !isPublicRoute) {
    if (refreshUnavailable) {
      return temporaryRefreshFailure(request);
    }

    const redirectRes = NextResponse.redirect(new URL(LOGIN, request.nextUrl), request);
    // Only delete cookies if refreshToken is missing or was explicitly rejected by backend (401/403).
    // Never delete on transient network failures or backend restarts.
    if (!refreshToken || refreshTokenRejected) {
      clearSessionCookies(redirectRes);
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
  requestHeaders.set(
    "x-app-path",
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
  );
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
  if (refreshTokenRejected) {
    clearSessionCookies(response);
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
