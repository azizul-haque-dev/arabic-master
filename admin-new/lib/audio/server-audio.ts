import "server-only";

import { getAuthSession, setAuthSession, clearAuthSession } from "@/lib/auth/session";

function getBackendApiUrl(): string {
  const url = process.env.BACKEND_API_URL || "http://localhost:5000/api/v1";
  return url.replace(/\/$/, "");
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
  let accessToken = initialToken;

  const headers = new Headers();
  headers.set("x-client-type", "nextjs");
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
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
    try {
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
          accessToken = String(data.accessToken);
          const newRefreshToken = data.refreshToken ? String(data.refreshToken) : refreshToken;

          try {
            await setAuthSession({
              accessToken,
              refreshToken: newRefreshToken,
              user,
            });
          } catch {
            // Ignore cookie write failure in read-only route contexts
          }

          headers.set("Authorization", `Bearer ${accessToken}`);
          response = await fetch(url, {
            method,
            headers,
            body: formData,
            cache: "no-store",
          });
        } else {
          await clearAuthSession().catch(() => {});
        }
      } else {
        await clearAuthSession().catch(() => {});
      }
    } catch {
      // Refresh network failure, return initial 401 response
    }
  }

  return response;
}
