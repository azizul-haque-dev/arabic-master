import type { User } from "@/types";
import { create } from "zustand";

interface AuthState {
  user: User | null;
  isBootstrapping: boolean;
  setUser: (user: User | null) => void;
  setBootstrapping: (value: boolean) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isBootstrapping: true,
  setUser: (user) => set({ user }),
  setBootstrapping: (value) => set({ isBootstrapping: value }),
  clear: () => set({ user: null }),
}));
