"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { AdminRole } from "@/lib/auth/get-current-user";
import { RoleProvider } from "@/lib/role-context";
import { AdminSidebarContent } from "@/components/layout/admin-sidebar";
import { AdminTopbar } from "@/components/layout/admin-topbar";

export function AdminShell({
  role = "ADMIN",
  children,
}: {
  role?: AdminRole;
  children: React.ReactNode;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <RoleProvider initialRole={role}>
      <div className="admin-theme min-h-screen bg-background text-text lg:flex">
        {/* Desktop sidebar */}
        <aside className="hidden w-64 shrink-0 border-r border-border bg-surface lg:sticky lg:top-0 lg:block lg:h-screen">
          <AdminSidebarContent />
        </aside>

        {/* Mobile drawer */}
        {drawerOpen ? (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div
              className="absolute inset-0 bg-black/60"
              onClick={() => setDrawerOpen(false)}
              aria-hidden="true"
            />
            <div className="absolute inset-y-0 left-0 flex h-full w-72 max-w-[85vw] flex-col border-r border-border bg-surface shadow-xl">
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-neutral-bg hover:text-text"
                aria-label="Close navigation"
              >
                <X className="h-4 w-4" />
              </button>
              <AdminSidebarContent onNavigate={() => setDrawerOpen(false)} />
            </div>
          </div>
        ) : null}

        <div className="flex min-h-screen flex-1 flex-col">
          <AdminTopbar
            onOpenSidebar={() => setDrawerOpen(true)}
          />
          <main className="flex-1 bg-background px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <div className="mx-auto max-w-[1280px]">{children}</div>
          </main>
        </div>
      </div>
    </RoleProvider>
  );
}
