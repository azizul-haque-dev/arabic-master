"use client";

import type { AdminRole } from "@/lib/types/content";
import { createContext, useContext, useEffect, useState } from "react";
import { SafeUser } from "./types/auth";

interface ISession {
  user: SafeUser;
  accessToken?: string;
  refreshToken?: string;
}

// 1. Expanded context type to share session information globally
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
    } catch (error) {
      console.error("Auth initialization error:", error);
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void Promise.resolve().then(getUser);
  }, []);
  console.log(userSession, "session");
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
