"use client";

import { navLinks } from "@/lib/mock-data/landing";
import { LayoutDashboard, LogOut, Menu, Shield, User as UserIcon, X } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { useUser } from "@/lib/auth/user-context";
import { logoutAction } from "@/actions/auth/logout-action";

function getInitials(name?: string, email?: string): string {
  if (name && name.trim().length > 0) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  }
  if (email && email.length > 0) {
    return email.slice(0, 2).toUpperCase();
  }
  return "U";
}

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const { user } = useUser();
  const [isPending, startTransition] = useTransition();

  const rawName = typeof user?.fullName === "string" ? user.fullName : typeof user?.name === "string" ? user.name : undefined;
  const rawEmail = typeof user?.email === "string" ? user.email : undefined;
  const displayName: string = rawName || (rawEmail ? rawEmail.split("@")[0] : "Account");
  const initials = user ? getInitials(rawName, rawEmail) : "U";
  const isAdmin = user?.role === "ADMIN" || user?.role === "CONTENT_MANAGER";

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction();
    });
  };

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center justify-center h-10 w-10 rounded-xl text-on-surface hover:bg-surface-container transition-colors"
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>

      {open && (
        <div
          id="mobile-nav-panel"
          className="absolute inset-x-3 top-[84px] flex flex-col gap-1 rounded-2xl border border-border/80 bg-surface/95 p-3 shadow-[0_16px_35px_rgba(15,23,42,0.12)] backdrop-blur-xl sm:inset-x-5 animate-in fade-in zoom-in-95 duration-100"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-xl px-3 py-2.5 font-label-md text-label-md text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface"
            >
              {link.label}
            </Link>
          ))}

          <div className="my-1.5 h-px bg-border/80" />

          {user ? (
            <div className="flex flex-col gap-2 pt-1">
              {/* User Identity info */}
              <div className="flex items-center gap-3 rounded-xl bg-surface-container-low/80 p-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-primary-dark font-sans text-sm font-bold text-white shadow-sm ring-2 ring-primary/20">
                  {initials}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-on-surface">
                    {displayName}
                  </p>
                  <p className="truncate text-xs text-on-surface-variant">
                    {user.email}
                  </p>
                  <div className="mt-1">
                    {user.role === "ADMIN" ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                        <Shield className="h-2.5 w-2.5" /> Admin
                      </span>
                    ) : user.role === "CONTENT_MANAGER" ? (
                      <span className="inline-flex items-center rounded-full border border-purple-500/20 bg-purple-500/10 px-2 py-0.5 text-[10px] font-semibold text-purple-600">
                        Content Manager
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full border border-border bg-surface-container px-2 py-0.5 text-[10px] font-medium text-on-surface-variant">
                        Learner
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Links */}
              {isAdmin && (
                <Link
                  href="/admin/arabic-entities"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-on-surface transition-colors hover:bg-surface-container-low hover:text-primary"
                >
                  <LayoutDashboard className="h-4 w-4 text-primary" />
                  <span>Admin Dashboard</span>
                </Link>
              )}

              <Link
                href="/profile"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-on-surface transition-colors hover:bg-surface-container-low"
              >
                <UserIcon className="h-4 w-4 text-on-surface-variant" />
                <span>Profile & Account</span>
              </Link>

              <button
                type="button"
                disabled={isPending}
                onClick={handleLogout}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
              >
                <LogOut className="h-4 w-4" />
                <span>{isPending ? "Logging out..." : "Log out"}</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-2.5 font-label-md text-label-md text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface"
              >
                Log In
              </Link>
              <Link
                href="/register"
                onClick={() => setOpen(false)}
                className="mt-1 inline-flex h-11 items-center justify-center rounded-xl bg-primary px-4 font-label-md text-label-md font-semibold text-on-primary transition-colors hover:bg-primary-dark shadow-sm"
              >
                Start Learning
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
