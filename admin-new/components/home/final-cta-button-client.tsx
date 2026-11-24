"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useUser } from "@/lib/auth/user-context";
import type { SafeUser } from "@/lib/types/auth";

export function FinalCtaButtonClient({
  initialUser,
}: {
  initialUser: SafeUser | null;
}) {
  const { user, hasClientOverride } = useUser();
  const isLoggedIn = Boolean(hasClientOverride ? user : initialUser);

  return (
    <Link
      href={isLoggedIn ? "/courses" : "/register"}
      className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl border border-transparent bg-primary px-6 text-sm font-semibold text-white shadow-sm shadow-primary/20 transition-colors hover:bg-[#554ce8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-light sm:text-base"
    >
      <span>{isLoggedIn ? "Continue Learning" : "Start Learning Free"}</span>
      <ArrowRight className="h-4 w-4" aria-hidden="true" />
    </Link>
  );
}
