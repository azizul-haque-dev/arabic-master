import { Suspense } from "react";
import { BrandLogo } from "./brand-logo";
import { DesktopNavigation } from "./desktop-navigation";
import { NavbarAuthSlot } from "./navbar-auth-slot";
import { ThemeToggleButton } from "@/components/layout/theme-toggle-button";

function DesktopNavSkeleton() {
  return (
    <div className="hidden items-center gap-2 lg:flex" aria-hidden="true">
      <div className="h-9 w-20 rounded-lg bg-neutral-bg" />
      <div className="h-9 w-20 rounded-lg bg-neutral-bg" />
      <div className="h-9 w-24 rounded-lg bg-neutral-bg" />
      <div className="h-9 w-28 rounded-lg bg-neutral-bg" />
      <div className="h-9 w-24 rounded-lg bg-neutral-bg" />
    </div>
  );
}

function NavbarAuthSkeleton() {
  return (
    <div className="flex items-center gap-2 lg:justify-self-end" aria-hidden="true">
      <div className="hidden h-10 w-20 rounded-lg bg-neutral-bg sm:block" />
      <div className="hidden h-10 w-28 rounded-lg bg-neutral-bg sm:block" />
      <div className="h-10 w-10 rounded-lg bg-neutral-bg lg:hidden" />
    </div>
  );
}

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-surface">
      <div className="mx-auto grid h-16 max-w-container-max grid-cols-[1fr_auto] items-center gap-3 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:gap-6 lg:px-8">
        <div className="lg:justify-self-start">
          <BrandLogo />
        </div>

        <div className="hidden justify-center lg:flex">
          <Suspense fallback={<DesktopNavSkeleton />}>
            <DesktopNavigation />
          </Suspense>
        </div>

        <div className="flex items-center justify-end gap-2 lg:justify-self-end">
          <ThemeToggleButton />
          <Suspense fallback={<NavbarAuthSkeleton />}>
            <NavbarAuthSlot />
          </Suspense>
        </div>
      </div>
    </header>
  );
}
