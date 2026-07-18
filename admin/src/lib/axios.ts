import { useAuthStore } from "@/stores/auth.store";
import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// Scalable Exclusion List: Add any public endpoint patterns that should NEVER trigger a 401 token refresh loop
const PUBLIC_AUTH_ROUTES = [
  "/auth/login",
  "/auth/register",
  "/auth/forget",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/refresh",
];

let refreshPromise: Promise<void> | null = null;

async function refreshAccessToken(): Promise<void> {
  await axios.post(
    `${import.meta.env.VITE_API_URL}/auth/refresh`,
    {},
    { withCredentials: true },
  );
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    // Cast explicitly matching Axios internal type definitions plus your custom flag
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    const isPublicAuthRoute = originalRequest?.url
      ? PUBLIC_AUTH_ROUTES.some((route) => originalRequest.url?.includes(route))
      : false;

    // Notice the safe check on originalRequest
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isPublicAuthRoute
    ) {
      originalRequest._retry = true; // No type errors here now

      try {
        refreshPromise ??= refreshAccessToken().finally(() => {
          refreshPromise = null;
        });

        await refreshPromise;

        //  Passing it back to api() works flawlessly now because types match up
        return api(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().clear();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);
