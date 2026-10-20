import { getAuthSession, setAuthSession } from "@/lib/auth/session";
import { getBackendApiUrl } from "@/lib/auth/backend-url";
import { NextResponse } from "next/server";

function isTokenExpired(token: string): boolean {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return true;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const jsonStr = atob(base64);
    const payload = JSON.parse(jsonStr);
    if (!payload.exp) return false;
    return Date.now() >= (payload.exp - 30) * 1000;
  } catch {
    return true;
  }
}

export async function GET() {
  let session = await getAuthSession();

  // If access token is missing or expired, attempt refresh
  if ((!session.accessToken || isTokenExpired(session.accessToken)) && session.refreshToken) {
    try {
      const backendUrl = getBackendApiUrl();

      const res = await fetch(`${backendUrl}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-client-type": "nextjs",
        },
        body: JSON.stringify({ refreshToken: session.refreshToken }),
        cache: "no-store",
      });

      if (res.ok) {
        const body = await res.json();
        const data = body?.data ?? body;
        if (data?.accessToken) {
          const freshAccessToken = String(data.accessToken);
          const freshRefreshToken = (data.refreshToken ? String(data.refreshToken) : session.refreshToken);
          session = {
            accessToken: freshAccessToken,
            refreshToken: freshRefreshToken,
            user: session.user,
          };
          await setAuthSession({
            accessToken: freshAccessToken,
            refreshToken: freshRefreshToken,
            user: session.user,
          });
        }
      }
    } catch (error) {
      console.error("Token refresh inside /api/me failed:", error);
    }
  }

  return NextResponse.json(
    {
      user: session.user ?? null,
      accessToken: session.accessToken ?? null,
      refreshToken: session.refreshToken ?? null,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
