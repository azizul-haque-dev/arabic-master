"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { CONTENT_NAV } from "@/lib/admin-nav";

export function AdminSidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex h-full flex-col gap-6 overflow-y-auto px-4 py-6">
      <Link
        href="/admin/arabic-entities"
        className="group flex items-center gap-3 px-2 py-1 transition-all"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-dark to-primary text-white shadow-sm transition-all group-hover:scale-105 group-hover:shadow-md">
          <BookOpen className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <span className="font-heading text-lg font-bold leading-tight tracking-tight text-text">
            Arabic Master
          </span>
          <span className="text-[10px] font-semibold tracking-wider text-primary-light uppercase">
            Admin Workspace
          </span>
        </div>
      </Link>

      <div>
        <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wide text-white/60">
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
                    className="flex cursor-not-allowed items-center gap-2.5 rounded-default px-2.5 py-2 text-sm text-white/40"
                    title={`${item.label} — coming in a later milestone`}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {item.label}
                    <span className="ml-auto rounded-full bg-[#302d48] px-1.5 py-0.5 text-[10px] font-medium text-white/65">
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
                      ? "bg-primary-light/15 text-primary-light ring-1 ring-inset ring-primary-light/20"
                      : "text-white/75 hover:bg-[#343052] hover:text-white",
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
