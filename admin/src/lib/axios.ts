import { useAuthStore } from "@/stores/auth.store";
import axios, {
  AxiosError,
  AxiosHeaders,
  type InternalAxiosRequestConfig,
} from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

const PUBLIC_AUTH_ROUTES = [
  "/auth/login",
  "/auth/register",
  "/auth/forget",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/refresh",
];

let refreshPromise: Promise<void> | null = null;
let isRedirectingToLogin = false;

function getRequestPath(url?: string): string {
  if (!url) return "";
  return url.startsWith("http") ? new URL(url).pathname : url;
}

function isPublicAuthRoute(url?: string): boolean {
  const path = getRequestPath(url);
  return PUBLIC_AUTH_ROUTES.some((route) => path.includes(route));
}

function getCookieValue(name: string): string | null {
  if (typeof document === "undefined") return null;

  const match = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith(`${name}=`));

  return match ? decodeURIComponent(match.split("=").slice(1).join("=")) : null;
}

async function refreshAccessToken(): Promise<void> {
  await api.post("/auth/refresh", {}, { withCredentials: true });
}

api.interceptors.request.use((config) => {
  if (config.withCredentials === false || isPublicAuthRoute(config.url)) {
    return config;
  }

  const accessToken = getCookieValue("accessToken");
  if (!accessToken) {
    return config;
  }

  const headers = config.headers ?? new AxiosHeaders();
  headers.set("Authorization", `Bearer ${accessToken}`);
  config.headers = headers;

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isPublicAuthRoute(originalRequest.url)
    ) {
      originalRequest._retry = true;

      try {
        refreshPromise ??= refreshAccessToken().finally(() => {
          refreshPromise = null;
        });

        await refreshPromise;

        return api(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().clear();
        if (!isRedirectingToLogin && window.location.pathname !== "/login") {
          isRedirectingToLogin = true;
          window.location.assign("/login");
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);
