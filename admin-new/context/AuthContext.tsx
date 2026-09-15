// lib/role-context.ts
"use client";

import { AdminRole } from "@/lib/auth/get-current-user";
import { createContext, useContext } from "react";


interface RoleContextValue {
    role: AdminRole;
}

const RoleContext = createContext<RoleContextValue | null>(null);

export function RoleProvider({
    role,
    children,
}: {
    role: AdminRole;
    children: React.ReactNode;
}) {
    return (
        <RoleContext.Provider value={{ role }}>{children}</RoleContext.Provider>
    );
}

export function useRole() {
    const ctx = useContext(RoleContext);
    if (!ctx) {
        throw new Error("useRole() must be used inside RoleProvider.");
    }
    return ctx;
}