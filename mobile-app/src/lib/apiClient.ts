import { useAuthStore } from "@/stores/authStore";
import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    // backend web vs mobile client বুঝে token delivery (cookie vs body)
    // আলাদা করে হ্যান্ডেল করে এই header দিয়ে
    "x-client-type": "mobile",
  },
});

// Attach the current access token to every outgoing request.
apiClient.interceptors.request.use((config) => {
  const accessToken = useAuthStore.getState().accessToken;
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// --- single-flight refresh queue -----------------------------------------
// Without this, N parallel requests that all get a 401 at the same time
// would each fire their own /auth/refresh call. This queues them behind
// one refresh call and replays them once it resolves.
let isRefreshing = false;
let pendingQueue: Array<(token: string | null) => void> = [];

function resolveQueue(token: string | null) {
  pendingQueue.forEach((cb) => cb(token));
  pendingQueue = [];
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    const { refreshToken, setTokens, clearSession } = useAuthStore.getState();

    if (!refreshToken) {
      clearSession();
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push((token) => {
          if (!token) return reject(error);
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(apiClient(originalRequest));
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // plain axios call here, not apiClient — avoids re-triggering
      // this same interceptor on the refresh request itself
      const { data } = await axios.post<{
        accessToken: string;
        refreshToken: string;
      }>(
        `${BASE_URL}/auth/refresh`,
        { refreshToken },
        { headers: { "x-client-type": "mobile" } }, // apiClient defaults bypass হয়ে যায়, তাই আলাদা করে দিতে হলো
      );

      // backend rotates refreshToken on every call — must persist both,
      // reusing the old refreshToken here would fail on the next refresh
      setTokens(data.accessToken, data.refreshToken);
      resolveQueue(data.accessToken);

      originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      resolveQueue(null);
      clearSession();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
