import { Suspense } from "react";
import { BrandLogo } from "./brand-logo";
import { DesktopNavigation } from "./desktop-navigation";
import { NavbarAuthSlot } from "./navbar-auth-slot";

function DesktopNavSkeleton() {
  return (
    <div className="hidden items-center gap-2 lg:flex" aria-hidden="true">
      <div className="h-9 w-20 rounded-xl bg-neutral-bg/70" />
      <div className="h-9 w-20 rounded-xl bg-neutral-bg/70" />
      <div className="h-9 w-24 rounded-xl bg-neutral-bg/70" />
      <div className="h-9 w-28 rounded-xl bg-neutral-bg/70" />
      <div className="h-9 w-24 rounded-xl bg-neutral-bg/70" />
    </div>
  );
}

function NavbarAuthSkeleton() {
  return (
    <div className="flex items-center gap-2 lg:justify-self-end" aria-hidden="true">
      <div className="hidden h-10 w-20 animate-pulse rounded-xl bg-neutral-bg sm:block" />
      <div className="hidden h-10 w-28 animate-pulse rounded-xl bg-neutral-bg sm:block" />
      <div className="h-10 w-10 animate-pulse rounded-xl bg-neutral-bg lg:hidden" />
    </div>
  );
}

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-[68px] max-w-container-max items-center justify-between gap-4 px-4 sm:px-6 lg:grid lg:grid-cols-[auto_1fr_auto] lg:px-8">
        <div className="lg:justify-self-start">
          <BrandLogo />
        </div>

        <div className="flex justify-center">
          <Suspense fallback={<DesktopNavSkeleton />}>
            <DesktopNavigation />
          </Suspense>
        </div>

        <Suspense fallback={<NavbarAuthSkeleton />}>
          <NavbarAuthSlot />
        </Suspense>
      </div>
    </header>
  );
}
