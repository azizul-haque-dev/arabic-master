import { getAuthSession, setAuthSession, clearAuthSession } from "./session";
import { ActionFailure, AuthActionErrorCode } from "@/lib/types/auth";

function getBackendApiUrl(): string {
  const url = process.env.BACKEND_API_URL || process.env.API_URL || "http://localhost:5000/api/v1";
  return url.replace(/\/$/, "");
}

export function mapHttpError(
  status: number,
  bodyMessage?: string,
  fieldErrors?: Record<string, string[]>
): ActionFailure {
  let code: AuthActionErrorCode = "SERVER_ERROR";
  let defaultMsg = "An unexpected error occurred. Please try again.";

  if (status === 400) {
    code = "VALIDATION_ERROR";
    defaultMsg = "Please check your details and try again.";
  } else if (status === 401) {
    code = "INVALID_CREDENTIALS";
    defaultMsg = "Invalid credentials or unauthorized.";
  } else if (status === 403) {
    code = "FORBIDDEN";
    defaultMsg = "You do not have permission to perform this action.";
  } else if (status === 409) {
    code = "EMAIL_ALREADY_EXISTS";
    defaultMsg = "An account with this email already exists.";
  } else if (status === 429) {
    code = "RATE_LIMITED";
    defaultMsg = "Too many requests. Please wait a moment and try again.";
  } else if (status >= 500) {
    code = "SERVER_ERROR";
    defaultMsg = "Server error. Please try again later.";
  }

  return {
    success: false,
    error: bodyMessage || defaultMsg,
    code,
    ...(fieldErrors && Object.keys(fieldErrors).length > 0 ? { fieldErrors } : {}),
  };
}

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const { refreshToken, user } = await getAuthSession();
      if (!refreshToken) {
        await clearAuthSession();
        return null;
      }

      const backendUrl = getBackendApiUrl();
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
        return null;
      }

      const body = await response.json();
      const data = body?.data ?? body;
      const newAccessToken = data?.accessToken;
      const newRefreshToken = data?.refreshToken || refreshToken;

      if (!newAccessToken) {
        await clearAuthSession();
        return null;
      }

      await setAuthSession({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        user,
      });

      return newAccessToken;
    } catch {
      await clearAuthSession();
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function serverApiFetch(
  endpoint: string,
  options: RequestInit = {},
  retryOn401 = true
): Promise<Response> {
  const backendUrl = getBackendApiUrl();
  const url = `${backendUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const { accessToken } = await getAuthSession();

  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }
  headers.set("x-client-type", "nextjs");

  if (accessToken && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  try {
    let response = await fetch(url, {
      ...options,
      headers,
      cache: "no-store",
    });

    if (response.status === 401 && retryOn401 && !endpoint.includes("/auth/login") && !endpoint.includes("/auth/register")) {
      const newAccessToken = await refreshAccessToken();
      if (newAccessToken) {
        headers.set("Authorization", `Bearer ${newAccessToken}`);
        response = await fetch(url, {
          ...options,
          headers,
          cache: "no-store",
        });
      }
    }

    return response;
  } catch (error) {
    throw error;
  }
}
