import { NextRequest, NextResponse } from "next/server";
import { serverApiFetch } from "@/lib/auth/server-api";
import {
  setAuthSession,
  SESSION_COOKIE_NAME,
  REFRESH_COOKIE_NAME,
  USER_COOKIE_NAME,
} from "@/lib/auth/session";
import { SafeUser } from "@/lib/types/auth";
import { getPostLoginRedirect } from "@/lib/auth/redirect";

function getLoginRedirect(request: NextRequest, reason: string) {
  const url = new URL("/login", request.url);
  url.searchParams.set("error", reason);
  return NextResponse.redirect(url);
}

export async function GET(request: NextRequest) {
  const accessToken = request.nextUrl.searchParams.get("accessToken");
  const refreshToken = request.nextUrl.searchParams.get("refreshToken");

  if (!accessToken) {
    return getLoginRedirect(request, "google_authentication_failed");
  }

  try {
    const response = await serverApiFetch("/auth/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      return getLoginRedirect(request, "google_authentication_failed");
    }

    const body = await response.json();
    const user = (body?.data?.user ?? body?.data ?? body?.user ?? body) as SafeUser;

    if (!user?.id || !user.email) {
      return getLoginRedirect(request, "google_user_unavailable");
    }

    await setAuthSession({ accessToken, refreshToken: refreshToken ?? undefined, user });

    const returnTo = request.nextUrl.searchParams.get("returnTo");
    const redirectPath =
      returnTo && returnTo.startsWith("/") && !returnTo.startsWith("//")
        ? returnTo
        : getPostLoginRedirect(user.role);

    const redirectResponse = NextResponse.redirect(
      new URL(redirectPath, request.url),
    );

    const isProd = process.env.NODE_ENV === "production";
    redirectResponse.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: accessToken,
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
    });

    if (refreshToken) {
      redirectResponse.cookies.set({
        name: REFRESH_COOKIE_NAME,
        value: refreshToken,
        httpOnly: true,
        secure: isProd,
        sameSite: "lax",
        path: "/",
      });
    }

    redirectResponse.cookies.set({
      name: USER_COOKIE_NAME,
      value: JSON.stringify(user),
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
    });

    return redirectResponse;
  } catch (error) {
    console.error("Google OAuth callback failed:", error);
    return getLoginRedirect(request, "google_authentication_failed");
  }
}
