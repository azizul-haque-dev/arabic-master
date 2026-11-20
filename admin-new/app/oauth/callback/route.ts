import { NextRequest, NextResponse } from "next/server";
import { getBackendApiUrl } from "@/lib/auth/backend-url";
import {
  SESSION_COOKIE_NAME,
  REFRESH_COOKIE_NAME,
  USER_COOKIE_NAME,
} from "@/lib/auth/session";
import { SafeUser } from "@/lib/types/auth";
import { getPostLoginRedirect } from "@/lib/auth/redirect";

function getLoginRedirect(request: NextRequest, reason: string) {
  const url = new URL("/login", request.url);
  url.searchParams.set("error", reason);
  const response = NextResponse.redirect(url);
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("Referrer-Policy", "no-referrer");
  return response;
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");

  if (!code) {
    return getLoginRedirect(request, "google_authentication_failed");
  }

  try {
    const backendUrl = getBackendApiUrl();
    const response = await fetch(`${backendUrl}/auth/google/exchange`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-client-type": "nextjs",
      },
      body: JSON.stringify({ code }),
      cache: "no-store",
    });

    if (!response.ok) {
      return getLoginRedirect(request, "google_authentication_failed");
    }

    const body = await response.json();
    const data = body?.data ?? body;
    const user = data?.user as SafeUser | undefined;
    const accessToken = data?.accessToken;
    const refreshToken = data?.refreshToken;
    if (
      !user?.id ||
      !user.email ||
      typeof accessToken !== "string" ||
      typeof refreshToken !== "string"
    ) {
      return getLoginRedirect(request, "google_user_unavailable");
    }

    const returnTo = request.nextUrl.searchParams.get("returnTo");
    const redirectPath =
      returnTo && returnTo.startsWith("/") && !returnTo.startsWith("//")
        ? returnTo
        : getPostLoginRedirect(user.role);

    const redirectResponse = NextResponse.redirect(new URL(redirectPath, request.url));
    redirectResponse.headers.set("Cache-Control", "no-store");
    redirectResponse.headers.set("Referrer-Policy", "no-referrer");

    const isProd = process.env.NODE_ENV === "production";
    const THIRTY_DAYS = 30 * 24 * 60 * 60;
    redirectResponse.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: accessToken,
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: THIRTY_DAYS,
    });

    if (refreshToken) {
      redirectResponse.cookies.set({
        name: REFRESH_COOKIE_NAME,
        value: refreshToken,
        httpOnly: true,
        secure: isProd,
        sameSite: "lax",
        path: "/",
        maxAge: THIRTY_DAYS,
      });
    }

    redirectResponse.cookies.set({
      name: USER_COOKIE_NAME,
      value: JSON.stringify(user),
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: THIRTY_DAYS,
    });

    return redirectResponse;
  } catch (error) {
    console.error("Google OAuth callback failed:", error);
    return getLoginRedirect(request, "google_authentication_failed");
  }
}
