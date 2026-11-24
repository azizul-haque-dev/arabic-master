"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import Link from "next/link";
import {
  ChevronDown,
  Crown,
  LayoutDashboard,
  LogOut,
  Shield,
  User as UserIcon,
} from "lucide-react";
import { logoutAction } from "@/actions/auth/logout-action";
import { useUser } from "@/lib/auth/user-context";
import type { SafeUser } from "@/lib/types/auth";
import type { LearnerOverview } from "@/lib/types/learner";
import { cn } from "@/lib/utils";
import { UserStats } from "./user-stats";

interface UserProfileMenuProps {
  user: SafeUser;
  overview: LearnerOverview | null;
}

export function getDisplayName(user: SafeUser): {
  fullName: string;
  firstName: string;
  initials: string;
} {
  const rawName =
    typeof user.fullName === "string" && user.fullName.trim()
      ? user.fullName.trim()
      : typeof user.name === "string" && user.name.trim()
        ? user.name.trim()
        : undefined;
  const emailPrefix =
    typeof user.email === "string" ? user.email.split("@")[0] : "Learner";
  const fullName = rawName || emailPrefix;
  const parts = fullName.split(/\s+/);
  const firstName = parts[0] || "Learner";
  const initials =
    parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : fullName.slice(0, 2).toUpperCase();

  return { fullName, firstName, initials };
}

export function UserProfileMenu({ user, overview }: UserProfileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [isPending, startTransition] = useTransition();
  const { clearAuth } = useUser();

  const { fullName, firstName, initials } = getDisplayName(user);
  const isAdmin = user.role === "ADMIN" || user.role === "CONTENT_MANAGER";
  const xp = overview?.xp ?? 0;
  const streakCount = overview?.streakCount ?? 0;
  const hearts = overview?.hearts ?? 5;
  const plan = overview?.plan ?? "FREE";

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleLogout = () => {
    clearAuth();
    startTransition(async () => {
      await logoutAction();
    });
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        id="profile-menu-button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex h-10 items-center gap-2 rounded-xl border border-border/80 bg-white px-2.5 py-1.5 shadow-2xs transition-colors hover:bg-neutral-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary text-xs font-bold text-white">
          {initials}
        </span>
        <span className="hidden max-w-[130px] truncate text-sm font-medium text-text sm:inline-block">
          Hello, {firstName}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-text-muted transition-transform duration-150",
            isOpen && "rotate-180",
          )}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-labelledby="profile-menu-button"
          className="absolute right-0 top-full z-50 mt-2 w-72 origin-top-right rounded-2xl border border-border bg-white p-2 shadow-xl"
        >
          <div className="flex items-center gap-3 rounded-xl bg-neutral-bg/80 p-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-bold text-white">
              {initials}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-text">
                Hello, {fullName}
              </p>
              <p className="truncate text-xs text-text-muted">{user.email}</p>
              <div className="mt-1.5 flex items-center gap-1.5">
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                    plan === "PRO"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-primary-light text-primary-dark",
                  )}
                >
                  {plan === "PRO" && <Crown className="h-2.5 w-2.5" />}
                  {plan === "PRO" ? "Pro Plan" : "Free Plan"}
                </span>
                {isAdmin && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                    <Shield className="h-2.5 w-2.5" />
                    {user.role === "ADMIN" ? "Admin" : "Staff"}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-2">
            <UserStats xp={xp} streakCount={streakCount} hearts={hearts} plan={plan} />
          </div>

          <div className="my-2 h-px bg-border/80" />

          <div className="space-y-0.5">
            {plan === "FREE" && (
              <Link
                href="/pricing"
                role="menuitem"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between rounded-xl bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800 transition-colors hover:bg-amber-100"
              >
                <span className="inline-flex items-center gap-2">
                  <Crown className="h-4 w-4 text-amber-600" aria-hidden="true" />
                  <span>Upgrade to Pro</span>
                </span>
                <span className="text-xs">&rarr;</span>
              </Link>
            )}

            {isAdmin && (
              <Link
                href="/admin/arabic-entities"
                role="menuitem"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-text transition-colors hover:bg-neutral-bg hover:text-primary"
              >
                <LayoutDashboard className="h-4 w-4 text-primary" aria-hidden="true" />
                <span>Admin Dashboard</span>
              </Link>
            )}

            <Link
              href="/profile"
              role="menuitem"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-text transition-colors hover:bg-neutral-bg"
            >
              <UserIcon className="h-4 w-4 text-text-muted" aria-hidden="true" />
              <span>Profile &amp; Account</span>
            </Link>
          </div>

          <div className="my-2 h-px bg-border/80" />

          <button
            type="button"
            role="menuitem"
            disabled={isPending}
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50 disabled:opacity-50"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            <span>{isPending ? "Logging out..." : "Log out"}</span>
          </button>
        </div>
      )}
    </div>
  );
}
