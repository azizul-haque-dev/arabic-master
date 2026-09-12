"use client";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { AdminShell } from "@/components/layout/admin-shell";
import { usePathname } from "next/navigation";

const adminRoutePrefixes = ["/arabic-entities", "/words", "/sentences"];

export function RootShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = adminRoutePrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

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
