import { Sparkles } from "lucide-react";
import Link from "next/link";

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-surface-container-low px-gutter-mobile py-space-2xl">
      {/* Calm branded backdrop — same blurred treatment as the landing hero. */}
      <div
        className="pointer-events-none absolute -top-24 right-1/4 h-96 w-96 rounded-full bg-primary-fixed/30 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-0 left-10 h-72 w-72 rounded-full bg-surface-container-high/60 blur-2xl"
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-md">
        <Link
          href="/"
          className="mb-space-xl flex items-center justify-center gap-2.5"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-light/35 text-primary-dark">
            <Sparkles className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="text-left">
            <span className="block font-headline-md text-headline-md leading-none tracking-tight text-on-surface">
              Arabic Master
            </span>
            <span className="mt-1 block font-label-sm text-label-sm font-semibold uppercase tracking-[0.14em] text-primary">
              Admin Console
            </span>
          </span>
        </Link>

        {children}
      </div>

      <p className="relative z-10 mt-space-xl max-w-md text-center font-body-sm text-body-sm text-text-muted">
        © {new Date().getFullYear()} Arabic Master. All rights reserved.
      </p>
    </div>
  );
}
