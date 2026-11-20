import "server-only";

import { getAuthSession, setAuthSession, clearAuthSession } from "@/lib/auth/session";
import { getBackendApiUrl } from "@/lib/auth/backend-url";

const REFRESH_TIMEOUT_MS = 4_000;

function refreshUnavailableResponse(): Response {
  return new Response(
    JSON.stringify({
      success: false,
      error: "Unable to verify your session right now. Please try again.",
    }),
    {
      status: 503,
      headers: {
        "Cache-Control": "no-store",
        "Content-Type": "application/json",
        "Retry-After": "2",
      },
    },
  );
}

/**
 * Forward multipart/form-data to the Express backend without overriding Content-Type.
 * Reuses the existing authentication session and handles 401 token refresh automatically.
 */
export async function serverApiFetchMultipart(
  endpoint: string,
  formData: FormData,
  method = "POST"
): Promise<Response> {
  const backendUrl = getBackendApiUrl();
  const url = `${backendUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const { accessToken: initialToken, refreshToken, user } = await getAuthSession();

  const headers = new Headers();
  headers.set("x-client-type", "nextjs");
  if (initialToken) {
    headers.set("Authorization", `Bearer ${initialToken}`);
  }
  // DO NOT set "Content-Type" header here!
  // fetch will automatically populate multipart/form-data with the correct boundary.

  let response = await fetch(url, {
    method,
    headers,
    body: formData,
    cache: "no-store",
  });

  if (response.status === 401 && refreshToken) {
    let refreshRes: Response;
    try {
      refreshRes = await fetch(`${backendUrl}/auth/refresh`, {
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
        console.warn(`[Auth] Audio refresh timed out after ${REFRESH_TIMEOUT_MS}ms`);
      } else {
        console.error("[Auth] Audio refresh request failed:", error);
      }
      return refreshUnavailableResponse();
    }

    if (!refreshRes.ok) {
      if (refreshRes.status === 401 || refreshRes.status === 403) {
        await clearAuthSession();
        return response;
      }
      console.warn(`[Auth] Audio refresh returned HTTP status ${refreshRes.status}`);
      return refreshUnavailableResponse();
    }

    const body = await refreshRes.json();
    const data = body?.data ?? body;
    const refreshedAccessToken = data?.accessToken;
    if (typeof refreshedAccessToken !== "string" || !refreshedAccessToken) {
      console.error("[Auth] Audio refresh response did not contain an access token");
      return refreshUnavailableResponse();
    }

    const newRefreshToken =
      typeof data.refreshToken === "string" && data.refreshToken
        ? data.refreshToken
        : refreshToken;

    await setAuthSession({
      accessToken: refreshedAccessToken,
      refreshToken: newRefreshToken,
      user,
    });

    headers.set("Authorization", `Bearer ${refreshedAccessToken}`);
    response = await fetch(url, {
      method,
      headers,
      body: formData,
      cache: "no-store",
    });
  }

  return response;
}
