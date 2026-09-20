"use client";

import React, { createContext, useContext, useState } from "react";
import type { SafeUser } from "@/lib/types/auth";

interface UserContextValue {
  user: SafeUser | null;
  setUser: React.Dispatch<React.SetStateAction<SafeUser | null>>;
  isAuthenticated: boolean;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export function UserProvider({
  children,
  initialUser = null,
}: {
  children: React.ReactNode;
  initialUser?: SafeUser | null;
}) {
  const [user, setUser] = useState<SafeUser | null>(initialUser);
  const [prevInitialUser, setPrevInitialUser] = useState<SafeUser | null>(initialUser);

  // Synchronize state during rendering when prop changes (React recommended pattern)
  if (initialUser !== prevInitialUser) {
    setPrevInitialUser(initialUser);
    setUser(initialUser);
  }

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        isAuthenticated: !!user,
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
