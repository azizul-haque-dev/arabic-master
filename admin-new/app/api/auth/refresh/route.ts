import { getAuthSession, setAuthSession, clearAuthSession } from "@/lib/auth/session";
import { getBackendApiUrl } from "@/lib/auth/backend-url";
import { NextResponse } from "next/server";

const REFRESH_TIMEOUT_MS = 1_500;

export async function POST() {
  try {
    const { refreshToken, user } = await getAuthSession();

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, error: "No refresh token available" },
        { status: 401 }
      );
    }

    const backendUrl = getBackendApiUrl();

    let response: Response;
    try {
      response = await fetch(`${backendUrl}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-client-type": "nextjs",
        },
        body: JSON.stringify({ refreshToken }),
        cache: "no-store",
        signal: AbortSignal.timeout(REFRESH_TIMEOUT_MS),
      });
    } catch (error) {
      if (error instanceof Error && error.name === "TimeoutError") {
        console.warn(`[Auth] Refresh endpoint timed out after ${REFRESH_TIMEOUT_MS}ms`);
      } else {
        console.error("[Auth] Refresh endpoint request failed:", error);
      }
      return NextResponse.json(
        { success: false, error: "Unable to refresh session. Please try again." },
        {
          status: 503,
          headers: { "Cache-Control": "no-store", "Retry-After": "2" },
        },
      );
    }

    if (!response.ok) {
      const rejected =
        response.status === 401 || response.status === 403;
      if (rejected) {
        await clearAuthSession();
      }
      return NextResponse.json(
        {
          success: false,
          error: rejected
            ? "Refresh token expired or invalid"
            : "Unable to refresh session. Please try again.",
        },
        {
          status: rejected ? response.status : 503,
          headers: {
            "Cache-Control": "no-store",
            ...(rejected ? {} : { "Retry-After": "2" }),
          },
        },
      );
    }

    const body = await response.json();
    const data = body?.data ?? body;
    const newAccessToken = data?.accessToken;
    const newRefreshToken = data?.refreshToken || refreshToken;

    if (!newAccessToken) {
      return NextResponse.json(
        { success: false, error: "No access token returned from backend" },
        { status: 500 }
      );
    }

    await setAuthSession({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user,
    });

    return NextResponse.json(
      {
        success: true,
        user: user ?? null,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Silent refresh error:", error);
    return NextResponse.json(
      { success: false, error: "Unable to refresh session" },
      { status: 500 }
    );
  }
}
