import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
  status: string;
}

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

const REFRESH_TOKEN_KEY = "refresh_token";
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "");

let accessToken: string | null = null;
let refreshPromise: Promise<string> | null = null;

function getApiUrl(path: string): string {
  if (!API_BASE_URL) {
    throw new Error("Set EXPO_PUBLIC_API_URL to the API /api/v1 URL.");
  }
  return `${API_BASE_URL}${path}`;
}

function requireNativeSecureStorage(): void {
  if (Platform.OS === "web") {
    throw new Error("Secure sign-in is available in the iOS and Android apps.");
  }
}

async function readRefreshToken(): Promise<string | null> {
  requireNativeSecureStorage();
  return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

async function clearSession(): Promise<void> {
  accessToken = null;
  if (Platform.OS !== "web") {
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  }
}

function unwrapResponse(body: unknown): unknown {
  if (typeof body === "object" && body !== null && "data" in body) {
    return body.data;
  }
  return body;
}

async function readResponse(response: Response): Promise<unknown> {
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new Error("The authentication server returned an invalid response.");
  }

  const data = unwrapResponse(body);
  if (!response.ok) {
    const message =
      typeof body === "object" && body !== null && "message" in body &&
      typeof body.message === "string"
        ? body.message
        : "Authentication request failed. Please try again.";
    throw new Error(message);
  }
  return data;
}

function tokenResponse(value: unknown): TokenResponse {
  if (
    typeof value !== "object" ||
    value === null ||
    !("accessToken" in value) ||
    typeof value.accessToken !== "string" ||
    !("refreshToken" in value) ||
    typeof value.refreshToken !== "string"
  ) {
    throw new Error("The authentication server did not return valid tokens.");
  }
  return { accessToken: value.accessToken, refreshToken: value.refreshToken };
}

function userFrom(value: unknown): AuthUser {
  const candidate =
    typeof value === "object" &&
    value !== null &&
    "user" in value
      ? value.user
      : value;
  if (
    typeof candidate !== "object" ||
    candidate === null ||
    !("id" in candidate) ||
    typeof candidate.id !== "string" ||
    !("email" in candidate) ||
    typeof candidate.email !== "string" ||
    !("fullName" in candidate) ||
    typeof candidate.fullName !== "string" ||
    !("role" in candidate) ||
    typeof candidate.role !== "string" ||
    !("status" in candidate) ||
    typeof candidate.status !== "string"
  ) {
    throw new Error("The authentication server did not return a valid user.");
  }
  return {
    id: candidate.id,
    email: candidate.email,
    fullName: candidate.fullName,
    role: candidate.role,
    status: candidate.status,
  };
}

async function refreshAccessToken(): Promise<string> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const refreshToken = await readRefreshToken();
    if (!refreshToken) {
      throw new Error("Your session has expired. Please sign in again.");
    }

    const response = await fetch(getApiUrl("/auth/refresh"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-client-type": "mobile",
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (response.status === 401 || response.status === 403) {
      await clearSession();
      throw new Error("Your session has expired. Please sign in again.");
    }

    const data = await readResponse(response);
    const tokens = tokenResponse(data);
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, tokens.refreshToken);
    accessToken = tokens.accessToken;
    return accessToken;
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

export async function signIn(
  email: string,
  password: string,
): Promise<AuthUser> {
  requireNativeSecureStorage();
  const response = await fetch(getApiUrl("/auth/login"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-client-type": "mobile",
    },
    body: JSON.stringify({ email, password }),
  });
  const data = await readResponse(response);
  const tokens = tokenResponse(data);
  const user = userFrom(data);

  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, tokens.refreshToken);
  accessToken = tokens.accessToken;
  return user;
}

export async function restoreSession(): Promise<AuthUser | null> {
  if (Platform.OS === "web") return null;
  const refreshToken = await readRefreshToken();
  if (!refreshToken) return null;

  await refreshAccessToken();
  const response = await fetch(getApiUrl("/auth/me"), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "x-client-type": "mobile",
    },
  });
  return userFrom(await readResponse(response));
}

export async function authenticatedFetch(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const token = accessToken ?? (await refreshAccessToken());
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);
  headers.set("x-client-type", "mobile");

  let response = await fetch(getApiUrl(path), { ...init, headers });
  if (response.status === 401) {
    const refreshedToken = await refreshAccessToken();
    headers.set("Authorization", `Bearer ${refreshedToken}`);
    response = await fetch(getApiUrl(path), { ...init, headers });
  }
  return response;
}

export async function signOut(): Promise<void> {
  try {
    if (accessToken) {
      await authenticatedFetch("/auth/logout", { method: "POST" });
    }
  } finally {
    await clearSession();
  }
}

export type { AuthUser };
