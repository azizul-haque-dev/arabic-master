"use client";

import { useState, useRef, useEffect } from "react";
import { LogOut, Menu } from "lucide-react";
import { logoutAction } from "@/actions/auth/logout-action";
import { ThemeToggleButton } from "@/components/layout/theme-toggle-button";

export function AdminTopbar({ onOpenSidebar }: { onOpenSidebar: () => void }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-surface px-4 sm:px-6">
      <button
        type="button"
        onClick={onOpenSidebar}
        className="flex h-9 w-9 items-center justify-center rounded-default text-text-secondary transition-colors hover:bg-neutral-bg hover:text-text lg:hidden"
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="hidden lg:block" />

      <div className="flex items-center gap-3">
        <ThemeToggleButton />

        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-on-secondary-fixed transition-opacity hover:opacity-90"
            title="Signed in as Nusrat Jahan"
          >
            NJ
          </button>
          
          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 overflow-hidden rounded-default border border-border bg-surface shadow-sm">
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="flex w-full items-center gap-2 px-4 py-3 text-sm font-medium text-error transition-colors hover:bg-error-bg"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  Logout
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
