"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import Link from "next/link";
import { ChevronDown, LayoutDashboard, LogOut, Shield, User as UserIcon } from "lucide-react";
import type { SafeUser } from "@/lib/types/auth";
import { logoutAction } from "@/actions/auth/logout-action";

interface ProfileMenuProps {
  user: SafeUser;
}

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

export function ProfileMenu({ user }: ProfileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [isPending, startTransition] = useTransition();

  const rawName = typeof user.fullName === "string" ? user.fullName : typeof user.name === "string" ? user.name : undefined;
  const rawEmail = typeof user.email === "string" ? user.email : undefined;
  const displayName: string = rawName || (rawEmail ? rawEmail.split("@")[0] : "Account");
  const initials = getInitials(rawName, rawEmail);
  const isAdmin = user.role === "ADMIN" || user.role === "CONTENT_MANAGER";

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
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
    startTransition(async () => {
      await logoutAction();
    });
  };

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        type="button"
        id="profile-menu-button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex h-10 items-center gap-2 rounded-xl border border-border/80 bg-surface-container-low px-2.5 py-1.5 shadow-sm transition-all duration-150 hover:bg-surface-container hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-tr from-primary to-primary-dark font-sans text-xs font-semibold text-white shadow-sm ring-1 ring-primary/20">
          {initials}
        </span>
        <span className="hidden max-w-[120px] truncate text-sm font-medium text-on-surface sm:inline-block">
          {displayName}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-on-surface-variant transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-labelledby="profile-menu-button"
          className="absolute right-0 top-full z-50 mt-2 w-64 origin-top-right rounded-2xl border border-border/90 bg-surface/95 p-1.5 shadow-[0_16px_40px_rgba(15,23,42,0.12)] backdrop-blur-2xl ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-100"
        >
          {/* User Details Header */}
          <div className="flex items-center gap-3 rounded-xl bg-surface-container-low/70 p-3">
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
              <div className="mt-1 flex items-center gap-1.5">
                {user.role === "ADMIN" ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-primary">
                    <Shield className="h-2.5 w-2.5" /> Admin
                  </span>
                ) : user.role === "CONTENT_MANAGER" ? (
                  <span className="inline-flex items-center rounded-full border border-purple-500/20 bg-purple-500/10 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-purple-600">
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

          <div className="my-1.5 h-px bg-border/70" />

          {/* Menu Items */}
          <div className="space-y-0.5">
            {isAdmin && (
              <Link
                href="/admin/arabic-entities"
                onClick={() => setIsOpen(false)}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-on-surface transition-colors hover:bg-surface-container hover:text-primary"
              >
                <LayoutDashboard className="h-4 w-4 text-primary" aria-hidden="true" />
                <span>Admin Dashboard</span>
              </Link>
            )}

            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-on-surface transition-colors hover:bg-surface-container"
            >
              <UserIcon className="h-4 w-4 text-on-surface-variant" aria-hidden="true" />
              <span>Profile & Account</span>
            </Link>
          </div>

          <div className="my-1.5 h-px bg-border/70" />

          {/* Logout Action */}
          <button
            type="button"
            disabled={isPending}
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            <span>{isPending ? "Logging out..." : "Log out"}</span>
          </button>
        </div>
      )}
    </div>
  );
}
