import { getAuthSession, setAuthSession, clearAuthSession } from "./session";
import { getBackendApiUrl } from "./backend-url";
import { ActionFailure, AuthActionErrorCode } from "@/lib/types/auth";

const API_REQUEST_TIMEOUT_MS = 60_000;
const AUTH_REQUEST_TIMEOUT_MS = 10_000;
const REFRESH_TIMEOUT_MS = 10_000;

export type ServerApiFetchOptions = RequestInit & {
  timeoutMs?: number;
};

type RefreshResult =
  | { kind: "refreshed"; accessToken: string }
  | { kind: "unauthorized" }
  | { kind: "unavailable" };

function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs?: number,
): Promise<Response> {
  if (timeoutMs === undefined) {
    return fetch(url, options);
  }

  const timeoutSignal = AbortSignal.timeout(timeoutMs);
  const signal = options.signal
    ? AbortSignal.any([options.signal, timeoutSignal])
    : timeoutSignal;

  return fetch(url, { ...options, signal });
}

function isAiGenerationEndpoint(endpoint: string): boolean {
  const pathname = endpoint.split("?")[0];
  return /\/ai(?:\/list)?$/.test(pathname) ||
    /\/(?:generate|regenerate-context|regenerate-usage)$/.test(pathname) ||
    /\/lessons\/[^/]+\/(?:sentences|words)(?:\/batch)?$/.test(pathname);
}

async function clearSessionWhenPossible(): Promise<void> {
  try {
    await clearAuthSession();
  } catch (error) {
    console.warn("[Auth] Session cookies could not be cleared in this context:", error);
  }
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

async function refreshAccessToken(): Promise<RefreshResult> {
  const { refreshToken, user } = await getAuthSession();
  if (!refreshToken) {
    await clearSessionWhenPossible();
    return { kind: "unauthorized" };
  }

  const backendUrl = getBackendApiUrl();
  let response: Response;
  try {
    response = await fetchWithTimeout(`${backendUrl}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-client-type": "nextjs",
      },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    }, REFRESH_TIMEOUT_MS);
  } catch (error) {
    if (error instanceof Error && error.name === "TimeoutError") {
      console.warn(`[Auth] Token refresh timed out after ${REFRESH_TIMEOUT_MS}ms`);
    } else {
      console.error("[Auth] Token refresh request failed:", error);
    }
    return { kind: "unavailable" };
  }

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      await clearSessionWhenPossible();
      return { kind: "unauthorized" };
    }
    console.warn(`[Auth] Token refresh returned HTTP status ${response.status}`);
    return { kind: "unavailable" };
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch (error) {
    console.error("[Auth] Token refresh returned invalid JSON:", error);
    return { kind: "unavailable" };
  }

  const data = body && typeof body === "object" && "data" in body
    ? body.data
    : body;
  const newAccessToken =
    data && typeof data === "object" && "accessToken" in data
      ? data.accessToken
      : undefined;
  const newRefreshToken =
    data && typeof data === "object" && "refreshToken" in data
      ? data.refreshToken
      : undefined;

  if (typeof newAccessToken !== "string" || newAccessToken.length === 0) {
    console.error("[Auth] Token refresh response did not contain an access token");
    return { kind: "unavailable" };
  }

  try {
    await setAuthSession({
      accessToken: newAccessToken,
      refreshToken:
        typeof newRefreshToken === "string" && newRefreshToken.length > 0
          ? newRefreshToken
          : refreshToken,
      user,
    });
  } catch {
    // Server Components cannot persist cookies during rendering.
  }

  return { kind: "refreshed", accessToken: newAccessToken };
}

export async function serverApiFetch(
  endpoint: string,
  options: ServerApiFetchOptions = {},
  retryOn401 = true
): Promise<Response> {
  const backendUrl = getBackendApiUrl();
  const url = `${backendUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const { accessToken } = await getAuthSession();
  const token = accessToken;

  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }
  headers.set("x-client-type", "nextjs");

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const timeoutMs =
    options.timeoutMs ??
    (isAiGenerationEndpoint(endpoint)
      ? undefined
      : endpoint === "/auth/me"
        ? AUTH_REQUEST_TIMEOUT_MS
        : API_REQUEST_TIMEOUT_MS);
  let response: Response;

  try {
    response = await fetchWithTimeout(url, {
      ...options,
      headers,
      cache: "no-store",
    }, timeoutMs);
  } catch (error) {
    if (timeoutMs !== undefined && error instanceof Error && error.name === "TimeoutError") {
      console.warn(`[Auth] Backend request to ${endpoint} timed out after ${timeoutMs}ms`);
    }
    throw error;
  }

  if (
    response.status === 401 &&
    retryOn401 &&
    !endpoint.includes("/auth/login") &&
    !endpoint.includes("/auth/register")
  ) {
    const refreshResult = await refreshAccessToken();
    if (refreshResult.kind === "refreshed") {
      headers.set("Authorization", `Bearer ${refreshResult.accessToken}`);
      try {
        return await fetchWithTimeout(url, {
          ...options,
          headers,
          cache: "no-store",
        }, timeoutMs);
      } catch (error) {
        if (timeoutMs !== undefined && error instanceof Error && error.name === "TimeoutError") {
          console.warn(`[Auth] Retried backend request to ${endpoint} timed out after ${timeoutMs}ms`);
        }
        throw error;
      }
    }

    if (refreshResult.kind === "unavailable") {
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
  }

  return response;
}
