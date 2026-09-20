import { NextRequest, NextResponse } from "next/server";
import { serverApiFetch } from "@/lib/auth/server-api";
import { setAuthSession } from "@/lib/auth/session";
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

    return NextResponse.redirect(
      new URL(getPostLoginRedirect(user.role), request.url),
    );
  } catch (error) {
    console.error("Google OAuth callback failed:", error);
    return getLoginRedirect(request, "google_authentication_failed");
  }
}
