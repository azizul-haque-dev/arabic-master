"use client";

import { useState, useRef, useEffect } from "react";
import { Menu, LogOut } from "lucide-react";
import { useRole } from "@/lib/role-context";
import type { AdminRole } from "@/lib/types/content";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/actions/auth/logout-action";

export function AdminTopbar({ onOpenSidebar }: { onOpenSidebar: () => void }) {
  const { role, setRole } = useRole();
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
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-white/90 px-4 backdrop-blur sm:px-6">
      <button
        type="button"
        onClick={onOpenSidebar}
        className="flex h-9 w-9 items-center justify-center rounded-default text-text-secondary hover:bg-neutral-bg lg:hidden"
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="hidden lg:block" />

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 rounded-full border border-border bg-background p-1 text-xs">
          <span className="hidden pl-2 text-text-muted sm:inline">Preview as:</span>
          {(["ADMIN", "CONTENT_MANAGER"] as AdminRole[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={cn(
                "rounded-full px-2.5 py-1 font-medium transition-colors",
                role === r
                  ? "bg-primary text-white"
                  : "text-text-secondary hover:bg-neutral-bg",
              )}
            >
              {r === "ADMIN" ? "Admin" : "Content Manager"}
            </button>
          ))}
        </div>

        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-white transition-opacity hover:opacity-90"
            title="Signed in as Nusrat Jahan"
          >
            NJ
          </button>
          
          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 overflow-hidden rounded-default border border-border bg-white shadow-lg">
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="flex w-full items-center gap-2 px-4 py-3 text-sm font-medium text-error-text transition-colors hover:bg-neutral-bg"
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
