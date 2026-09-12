import { navLinks } from "@/lib/mock-data/landing";
import { ArrowUpRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { MobileNav } from "./MobileNav";

export function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5">
      <div className="mx-auto flex h-[68px] max-w-container-max items-center justify-between gap-3 rounded-2xl border border-border/80 bg-surface/90 px-3 shadow-[0_12px_35px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:px-4 lg:grid lg:grid-cols-[1fr_auto_1fr]">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2.5 lg:justify-self-start"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-light/35 text-primary-dark">
            <Sparkles className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <span className="block truncate font-headline-md text-headline-md leading-none tracking-tight text-on-surface">
              Arabic Master
            </span>
            <span className="mt-1 block font-label-sm text-label-sm font-semibold uppercase tracking-[0.14em] text-primary">
              Spoken Arabic
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 rounded-xl bg-surface-container-low p-1 md:flex lg:justify-self-center">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={link.href === "/" ? "page" : undefined}
              className="rounded-lg px-3 py-2 font-label-md text-label-md text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface aria-[current=page]:bg-surface aria-[current=page]:text-primary aria-[current=page]:shadow-sm"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5 lg:justify-self-end">
          <Link
            href="/login"
            className="hidden h-10 items-center justify-center rounded-lg px-3 font-label-md text-label-md text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface sm:inline-flex"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="hidden h-10 items-center justify-center gap-1.5 rounded-lg bg-primary px-4 font-label-md text-label-md font-semibold text-on-primary shadow-sm transition-colors hover:bg-primary-dark active:translate-y-px sm:inline-flex"
          >
            Start learning
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
