"use client";

import React, { createContext, useCallback, useContext, useState } from "react";
import type { SafeUser } from "@/lib/types/auth";
import type { LearnerOverview } from "@/lib/types/learner";

interface UserContextValue {
  user: SafeUser | null;
  overview: LearnerOverview | null;
  hasClientOverride: boolean;
  setUser: (user: SafeUser | null) => void;
  setOverview: (overview: LearnerOverview | null) => void;
  clearAuth: () => void;
  resetClientOverride: () => void;
  isAuthenticated: boolean;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export function UserProvider({
  children,
  initialUser = null,
  initialOverview = null,
}: {
  children: React.ReactNode;
  initialUser?: SafeUser | null;
  initialOverview?: LearnerOverview | null;
}) {
  const [user, setUserState] = useState<SafeUser | null>(initialUser);
  const [overview, setOverview] = useState<LearnerOverview | null>(initialOverview);
  const [hasClientOverride, setHasClientOverride] = useState(false);

  const setUser = useCallback((nextUser: SafeUser | null) => {
    setHasClientOverride(true);
    setUserState(nextUser);
    if (!nextUser) {
      setOverview(null);
    }
  }, []);

  const clearAuth = useCallback(() => {
    setHasClientOverride(true);
    setUserState(null);
    setOverview(null);
  }, []);

  const resetClientOverride = useCallback(() => {
    setHasClientOverride(false);
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        overview,
        hasClientOverride,
        setUser,
        setOverview,
        clearAuth,
        resetClientOverride,
        isAuthenticated: Boolean(user),
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser(): UserContextValue {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
