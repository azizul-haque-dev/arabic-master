"use client";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { AuthShell } from "@/components/layout/auth-shell";
import { UserProvider } from "@/lib/auth/user-context";
import type { SafeUser } from "@/lib/types/auth";
import { usePathname } from "next/navigation";

const adminRoutePrefixes = ["/admin"];
const authRoutePrefixes = ["/login", "/register", "/signup", "/forgot-password", "/reset-password"];

function matchesPrefix(pathname: string, prefixes: string[]) {
  return prefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function RootShell({
  children,
  initialUser = null,
}: {
  children: React.ReactNode;
  initialUser?: SafeUser | null;
}) {
  const pathname = usePathname();
  const isAdminRoute = matchesPrefix(pathname, adminRoutePrefixes);
  const isAuthRoute = matchesPrefix(pathname, authRoutePrefixes);

  return (
    <UserProvider initialUser={initialUser}>
      {isAuthRoute ? (
        <AuthShell>{children}</AuthShell>
      ) : isAdminRoute ? (
        <>{children}</>
      ) : (
        <>
          <Header />
          <main className="pt-24">{children}</main>
          <Footer />
        </>
      )}
    </UserProvider>
  );
}
