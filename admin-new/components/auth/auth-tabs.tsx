"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

export function AuthTabs() {
  const pathname = usePathname();
  const isRegister = pathname?.startsWith("/register");

  return (
    <div className="grid grid-cols-2 gap-1 rounded-xl border border-(--am-line) bg-(--am-paper) p-1">
      <Link
        href="/register"
        className={cn(
          "rounded-lg py-2.5 text-center text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--am-moss)/30",
          isRegister
            ? "bg-white text-(--am-ink) shadow-sm"
            : "text-(--am-text-muted) hover:bg-white/70 hover:text-(--am-ink)",
        )}
      >
        Sign up
      </Link>
      <Link
        href="/login"
        className={cn(
          "rounded-lg py-2.5 text-center text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--am-moss)/30",
          !isRegister
            ? "bg-white text-(--am-ink) shadow-sm"
            : "text-(--am-text-muted) hover:bg-white/70 hover:text-(--am-ink)",
        )}
      >
        Log in
      </Link>
    </div>
  );
}
