"use client";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { AdminShell } from "@/components/layout/admin-shell";
import { AuthShell } from "@/components/layout/auth-shell";
import { usePathname } from "next/navigation";

const adminRoutePrefixes = ["/arabic-entities", "/words", "/sentences"];
const authRoutePrefixes = ["/login", "/register", "/signup"];

function matchesPrefix(pathname: string, prefixes: string[]) {
  return prefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function RootShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = matchesPrefix(pathname, adminRoutePrefixes);
  const isAuthRoute = matchesPrefix(pathname, authRoutePrefixes);

  if (isAuthRoute) {
    return <AuthShell>{children}</AuthShell>;
  }

  if (isAdminRoute) {
    return <AdminShell>{children}</AdminShell>;
  }

  return (
    <>
      <Header />
      <main className="pt-24">{children}</main>
      <Footer />
    </>
  );
}
