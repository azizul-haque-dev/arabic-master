"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { CONTENT_NAV } from "@/lib/admin-nav";

export function AdminSidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Admin navigation"
      className="flex h-full flex-col overflow-y-auto px-3 py-5"
    >
      <Link
        href="/admin/arabic-entities"
        className="group flex items-center gap-3 rounded-lg px-3 py-2"
      >
        <BookOpen className="h-6 w-6 shrink-0 text-primary" aria-hidden="true" />
        <div className="flex flex-col">
          <span className="font-heading text-base font-semibold leading-tight tracking-tight text-text">
            Arabic Master
          </span>
          <span className="mt-1 text-[10px] font-medium tracking-[0.12em] text-text-muted uppercase">
            Admin workspace
          </span>
        </div>
      </Link>

      <div className="mt-8">
        <div className="mb-2 flex items-center gap-3 px-3">
          <p className="text-[10px] font-semibold tracking-[0.14em] text-text-muted uppercase">
            Content
          </p>
          <div className="h-px flex-1 bg-border" aria-hidden="true" />
        </div>
        <ul className="flex flex-col gap-1">
          {CONTENT_NAV.map((item) => {
            const active =
              pathname === item.href || pathname?.startsWith(`${item.href}/`);
            const Icon = item.icon;

            if (!item.implemented) {
              return (
                <li key={item.href}>
                  <span
                    className="flex cursor-not-allowed items-center gap-2.5 rounded-md border-l-2 border-transparent px-3 py-2.5 text-sm text-text-muted"
                    title={`${item.label} — coming in a later milestone`}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {item.label}
                    <span className="ml-auto rounded-full bg-neutral-bg px-1.5 py-0.5 text-[10px] font-medium text-text-muted">
                      Soon
                    </span>
                  </span>
                </li>
              );
            }

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md border-l-2 px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                    active
                      ? "border-primary bg-primary-light/35 text-primary"
                      : "border-transparent text-text-secondary hover:bg-neutral-bg hover:text-text",
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-auto border-t border-border px-3 pt-4">
        <p className="text-xs leading-5 text-text-muted">
          Manage the learning library and its content.
        </p>
      </div>
    </nav>
  );
}
