"use client";

import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { useUser } from "@/lib/auth/user-context";
import type { SafeUser } from "@/lib/types/auth";

export function HeroCtaClient({
  initialUser,
}: {
  initialUser: SafeUser | null;
}) {
  const { user, hasClientOverride } = useUser();
  const isLoggedIn = Boolean(hasClientOverride ? user : initialUser);

  return (
    <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:items-center">
      <Link
        href={isLoggedIn ? "/courses" : "/register"}
        className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:text-base"
      >
        <span>{isLoggedIn ? "Continue Learning" : "Start Learning Free"}</span>
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
      <Link
        href="/courses"
        className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-primary-light bg-primary-light px-6 text-sm font-semibold text-primary-dark shadow-2xs transition-colors hover:border-primary hover:bg-primary-light/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:text-base"
      >
        <BookOpen className="h-4 w-4 text-primary" aria-hidden="true" />
        <span>Browse Courses</span>
      </Link>
    </div>
  );
}
