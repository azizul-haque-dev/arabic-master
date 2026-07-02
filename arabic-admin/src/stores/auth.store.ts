// Holds the current user + access token in memory only (never
// localStorage) so an XSS bug can't read a long-lived credential off
// disk. Sessions survive a page refresh via the httpOnly refresh
// cookie + a silent /auth/refresh call on app boot (see AuthProvider).
import { create } from "zustand";
import type { User } from "@/types";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isBootstrapping: boolean; // true while we're checking for an existing session on load
  setAuth: (user: User, accessToken: string) => void;
  setAccessToken: (accessToken: string) => void;
  setBootstrapping: (value: boolean) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isBootstrapping: true,
  setAuth: (user, accessToken) => set({ user, accessToken }),
  setAccessToken: (accessToken) => set({ accessToken }),
  setBootstrapping: (value) => set({ isBootstrapping: value }),
  clear: () => set({ user: null, accessToken: null }),
}));
