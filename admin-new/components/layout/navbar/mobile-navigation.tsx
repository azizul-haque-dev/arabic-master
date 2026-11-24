"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Crown,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  User as UserIcon,
  X,
} from "lucide-react";
import { logoutAction } from "@/actions/auth/logout-action";
import { useUser } from "@/lib/auth/user-context";
import type { SafeUser } from "@/lib/types/auth";
import type { LearnerOverview } from "@/lib/types/learner";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "./desktop-navigation";
import { getDisplayName } from "./user-profile-menu";
import { UserStats } from "./user-stats";

interface MobileNavigationProps {
  user: SafeUser | null;
  overview: LearnerOverview | null;
}

export function MobileNavigation({ user, overview }: MobileNavigationProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();
  const { clearAuth } = useUser();

  const isAdmin = user?.role === "ADMIN" || user?.role === "CONTENT_MANAGER";
  const identity = user ? getDisplayName(user) : null;
  const xp = overview?.xp ?? 0;
  const streakCount = overview?.streakCount ?? 0;
  const hearts = overview?.hearts ?? 5;
  const plan = overview?.plan ?? "FREE";

  const handleLogout = () => {
    setOpen(false);
    clearAuth();
    startTransition(async () => {
      await logoutAction();
    });
  };

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/80 bg-white text-text transition-colors hover:bg-neutral-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        {open ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
      </button>

      {open && (
        <div
          id="mobile-nav-panel"
          className="absolute inset-x-3 top-[76px] z-50 flex flex-col gap-1.5 rounded-2xl border border-border bg-white p-3 shadow-xl sm:inset-x-5"
        >
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
            const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-white"
                    : "text-text-secondary hover:bg-neutral-bg hover:text-text",
                )}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                <span>{label}</span>
              </Link>
            );
          })}

          <Link
            href="/courses"
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              pathname.startsWith("/courses")
                ? "bg-primary text-white"
                : "text-text-secondary hover:bg-neutral-bg hover:text-text",
            )}
          >
            <GraduationCap className="h-4 w-4" aria-hidden="true" />
            <span>Courses</span>
          </Link>

          <div className="my-1.5 h-px bg-border/80" />

          {user && identity ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3 rounded-xl bg-neutral-bg/80 p-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-bold text-white">
                  {identity.initials}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-text">
                    Hello, {identity.firstName}
                  </p>
                  <p className="truncate text-xs text-text-muted">{user.email}</p>
                  <span
                    className={cn(
                      "mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                      plan === "PRO"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-primary-light text-primary-dark",
                    )}
                  >
                    {plan === "PRO" && <Crown className="h-2.5 w-2.5" />}
                    {plan === "PRO" ? "Pro Plan" : "Free Plan"}
                  </span>
                </div>
              </div>

              <UserStats xp={xp} streakCount={streakCount} hearts={hearts} plan={plan} />

              {isAdmin && (
                <Link
                  href="/admin/arabic-entities"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-text hover:bg-neutral-bg hover:text-primary"
                >
                  <LayoutDashboard className="h-4 w-4 text-primary" aria-hidden="true" />
                  <span>Admin Dashboard</span>
                </Link>
              )}

              <Link
                href="/profile"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-text hover:bg-neutral-bg"
              >
                <UserIcon className="h-4 w-4 text-text-muted" aria-hidden="true" />
                <span>Profile &amp; Account</span>
              </Link>

              <button
                type="button"
                disabled={isPending}
                onClick={handleLogout}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 disabled:opacity-50"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                <span>{isPending ? "Logging out..." : "Log out"}</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 pt-1">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-white px-4 text-sm font-semibold text-text hover:bg-neutral-bg"
              >
                Login
              </Link>
              <Link
                href="/register"
                onClick={() => setOpen(false)}
                className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-white shadow-xs hover:bg-primary-dark"
              >
                Sign Up Free
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
