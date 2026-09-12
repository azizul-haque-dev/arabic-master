"use client";

import { Menu } from "lucide-react";
import { useRole } from "@/lib/role-context";
import type { AdminRole } from "@/lib/types/content";
import { cn } from "@/lib/utils";

export function AdminTopbar({ onOpenSidebar }: { onOpenSidebar: () => void }) {
  const { role, setRole } = useRole();

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

        <div
          className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-white"
          title="Signed in as Nusrat Jahan"
        >
          NJ
        </div>
      </div>
    </header>
  );
}
