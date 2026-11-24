"use client";

import { useEffect, useRef, useState, useTransition } from "react";
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

interface MobileNavigationProps {
  user: SafeUser | null;
  overview: LearnerOverview | null;
}

export function MobileNavigation({ user, overview }: MobileNavigationProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { clearAuth } = useUser();

  const isAdmin = user?.role === "ADMIN" || user?.role === "CONTENT_MANAGER";
  const identity = user ? getDisplayName(user) : null;
  const plan = overview?.plan ?? "FREE";
  const isCoursesActive = pathname === "/courses" || pathname.startsWith("/courses/");

  useEffect(() => {
    if (!open) return;

    const previousBodyOverflow = document.body.style.overflow;
    const previousDocumentOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    function handleOutsideClick(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousDocumentOverflow;
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function handleLogout() {
    setOpen(false);
    clearAuth();
    startTransition(async () => {
      await logoutAction();
    });
  }

  const linkClass = (active: boolean) =>
    cn(
      "flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
      active
        ? "bg-primary/15 text-primary-light"
        : "text-white/80 hover:bg-[#302d48] hover:text-white",
    );

  return (
    <div className="relative lg:hidden" ref={menuRef}>
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        onClick={() => setOpen((previous) => !previous)}
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-xl border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
          open
            ? "border-primary-light/25 bg-primary/15 text-primary-light"
            : "border-white/10 bg-surface text-white hover:bg-[#302d48]",
        )}
      >
        {open ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
      </button>

      {open ? (
        <div
          id="mobile-nav-panel"
          className="scrollbar-hide absolute right-0 top-[calc(100%+0.75rem)] z-50 max-h-[calc(100dvh-6rem)] w-[calc(100vw-1.5rem)] max-w-sm overscroll-contain overflow-y-auto rounded-2xl border border-white/10 bg-surface p-2.5 shadow-xl"
        >
          <nav aria-label="Mobile navigation" className="flex flex-col gap-1">
            {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
              const active = href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setOpen(false)}
                  className={linkClass(active)}
                >
                  <Icon className={cn("h-4 w-4", !active && "text-primary-light")} aria-hidden="true" />
                  {label}
                </Link>
              );
            })}
            <Link
              href="/courses"
              aria-current={isCoursesActive ? "page" : undefined}
              onClick={() => setOpen(false)}
              className={linkClass(isCoursesActive)}
            >
              <GraduationCap className={cn("h-4 w-4", !isCoursesActive && "text-primary-light")} aria-hidden="true" />
              Courses
            </Link>
          </nav>

          {user && identity ? (
            <>
              <div className="my-2 border-t border-white/10" />
              <div className="flex items-center gap-3 rounded-xl bg-[#302d48] p-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-bold text-white">
                  {identity.initials}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white">
                    Hello, {identity.firstName}
                  </p>
                  <p className="truncate text-xs text-white/60">{user.email}</p>
                </div>
                <span
                  className={cn(
                    "rounded-full px-2 py-1 text-[10px] font-semibold",
                    plan === "PRO"
                      ? "bg-amber-300/10 text-amber-200"
                      : "bg-primary-light text-primary-dark",
                  )}
                >
                  {plan === "PRO" ? "Pro" : "Free"}
                </span>
              </div>

              <div className="mt-1 flex flex-col gap-1">
                {isAdmin ? (
                  <Link
                    href="/admin/arabic-entities"
                    onClick={() => setOpen(false)}
                    className={linkClass(false)}
                  >
                    <LayoutDashboard className="h-4 w-4 text-primary-light" aria-hidden="true" />
                    Admin Dashboard
                  </Link>
                ) : null}
                <Link
                  href="/profile"
                  onClick={() => setOpen(false)}
                  className={linkClass(false)}
                >
                  <UserIcon className="h-4 w-4 text-white/60" aria-hidden="true" />
                  Profile &amp; Account
                </Link>
                {plan === "FREE" ? (
                  <Link
                    href="/pricing"
                    onClick={() => setOpen(false)}
                    className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-primary-light transition-colors hover:bg-primary-light/10"
                  >
                    <Crown className="h-4 w-4" aria-hidden="true" />
                    Upgrade to Pro
                  </Link>
                ) : null}
                <button
                  type="button"
                  disabled={isPending}
                  onClick={handleLogout}
                  className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-rose-300 transition-colors hover:bg-rose-300/10 hover:text-rose-200 disabled:opacity-50"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  {isPending ? "Logging out..." : "Log out"}
                </button>
              </div>
            </>
          ) : (
            <div className="mt-2 flex flex-col gap-2 border-t border-white/10 pt-3">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="flex min-h-11 items-center justify-center rounded-xl border border-white/10 bg-[#242239] px-4 text-sm font-semibold text-white hover:bg-[#302d48]"
              >
                Login
              </Link>
              <Link
                href="/register"
                onClick={() => setOpen(false)}
                className="flex min-h-11 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-white hover:bg-[#554ce8]"
              >
                Sign Up Free
              </Link>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
