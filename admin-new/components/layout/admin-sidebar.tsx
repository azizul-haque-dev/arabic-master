"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { CONTENT_NAV } from "@/lib/admin-nav";

export function AdminSidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex h-full flex-col gap-6 overflow-y-auto px-4 py-6">
      <Link href="/arabic-entities" className="px-2 font-heading text-lg font-bold text-text">
        Arabic Master
        <span className="block text-xs font-medium text-text-muted">Admin</span>
      </Link>

      <div>
        <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wide text-text-muted">
          Content
        </p>
        <ul className="flex flex-col gap-0.5">
          {CONTENT_NAV.map((item) => {
            const active = pathname?.startsWith(item.href);
            const Icon = item.icon;

            if (!item.implemented) {
              return (
                <li key={item.href}>
                  <span
                    className="flex cursor-not-allowed items-center gap-2.5 rounded-default px-2.5 py-2 text-sm text-text-muted/60"
                    title={`${item.label} — coming in a later milestone`}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {item.label}
                    <span className="ml-auto rounded-full bg-neutral-bg px-1.5 py-0.5 text-[10px] font-medium">
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
                  className={cn(
                    "flex items-center gap-2.5 rounded-default px-2.5 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary-light/25 text-primary-dark"
                      : "text-text-secondary hover:bg-neutral-bg",
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
    </nav>
  );
}
