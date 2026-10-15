import { getAuthSession, setAuthSession, clearAuthSession } from "@/lib/auth/session";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const { refreshToken, user } = await getAuthSession();

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, error: "No refresh token available" },
        { status: 401 }
      );
    }

    const backendUrl =
      process.env.BACKEND_API_URL?.replace(/\/$/, "") || "http://localhost:5000/api/v1";

    const response = await fetch(`${backendUrl}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-client-type": "nextjs",
      },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    });

    if (!response.ok) {
      await clearAuthSession();
      return NextResponse.json(
        { success: false, error: "Refresh token expired or invalid" },
        { status: 401 }
      );
    }

    const body = await response.json();
    const data = body?.data ?? body;
    const newAccessToken = data?.accessToken;
    const newRefreshToken = data?.refreshToken || refreshToken;

    if (!newAccessToken) {
      await clearAuthSession();
      return NextResponse.json(
        { success: false, error: "No access token returned from backend" },
        { status: 401 }
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
        accessToken: newAccessToken,
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
