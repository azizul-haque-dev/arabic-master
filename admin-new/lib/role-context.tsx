"use client";

import { createContext, useContext, useState } from "react";
import type { AdminRole } from "@/lib/types/content";

const RoleContext = createContext<{
  role: AdminRole;
  setRole: (role: AdminRole) => void;
} | null>(null);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<AdminRole>("ADMIN");
  return <RoleContext.Provider value={{ role, setRole }}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used within RoleProvider");
  return ctx;
}
