"use client";

import type { AdminRole } from "@/lib/types/content";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { SafeUser } from "./types/auth";

interface ISession {
  user: SafeUser;
  accessToken?: string;
  refreshToken?: string;
}

interface RoleContextType {
  role: AdminRole;
  user: SafeUser | null;
  isLoading: boolean;
  setRole: (role: AdminRole) => void;
  refreshSession: () => Promise<void>;
}

const RoleContext = createContext<RoleContextType | null>(null);

export function RoleProvider({
  initialRole = "ADMIN",
  children,
}: {
  initialRole?: AdminRole;
  children: React.ReactNode;
}) {
  const [role, setRole] = useState<AdminRole>(initialRole);
  const [userSession, setSession] = useState<ISession | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const isRefreshingRef = useRef<boolean>(false);

  // Initial session loader
  async function getUser() {
    try {
      setIsLoading(true);
      const res = await fetch("/api/me");

      if (!res.ok) {
        throw new Error("Failed to fetch session");
      }

      const data = await res.json();

      if (data?.user?.id) {
        setSession(data);
        if (
          data.user.role === "ADMIN" ||
          data.user.role === "CONTENT_MANAGER"
        ) {
          setRole(data.user.role);
        }
      } else {
        setSession(null);
      }
    } catch {
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  }

  // Silent background token refresh (no UI loading state, completely under the hood)
  async function silentRefresh() {
    if (isRefreshingRef.current) return;
    try {
      isRefreshingRef.current = true;
      const res = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: { "Cache-Control": "no-store" },
      });

      if (res.ok) {
        const data = await res.json();
        if (data?.accessToken) {
          setSession((prev) =>
            prev
              ? {
                  ...prev,
                  accessToken: data.accessToken,
                  user: data.user || prev.user,
                }
              : {
                  user: data.user,
                  accessToken: data.accessToken,
                }
          );
          if (data.user?.role) {
            setRole(data.user.role);
          }
        }
      }
    } catch {
      // Background refresh attempt failed silently; will retry on next interval or navigation
    } finally {
      isRefreshingRef.current = false;
    }
  }

  useEffect(() => {
    // 1. Initial fetch
    void Promise.resolve().then(getUser);

    // 2. Refresh silently every 4 minutes (since access tokens expire after 15 mins)
    const intervalId = setInterval(() => {
      void silentRefresh();
    }, 4 * 60 * 1000);

    // 3. Whenever user comes back to the browser tab/window after inactivity, refresh immediately
    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === "visible") {
        void silentRefresh();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityOrFocus);
    window.addEventListener("focus", handleVisibilityOrFocus);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityOrFocus);
      window.removeEventListener("focus", handleVisibilityOrFocus);
    };
  }, []);

  return (
    <RoleContext.Provider
      value={{
        role,
        user: userSession?.user ?? null,
        isLoading,
        setRole,
        refreshSession: getUser,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used within RoleProvider");
  return ctx;
}
