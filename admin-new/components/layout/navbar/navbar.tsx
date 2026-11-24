import { Suspense } from "react";
import { BrandLogo } from "./brand-logo";
import { DesktopNavigation } from "./desktop-navigation";
import { NavbarAuthSlot } from "./navbar-auth-slot";

function DesktopNavSkeleton() {
  return (
    <div className="hidden items-center gap-2 lg:flex" aria-hidden="true">
      <div className="h-9 w-20 animate-pulse rounded-xl border border-white/5 bg-[#26243d]" />
      <div className="h-9 w-20 animate-pulse rounded-xl border border-white/5 bg-[#26243d]" />
      <div className="h-9 w-24 animate-pulse rounded-xl border border-white/5 bg-[#26243d]" />
      <div className="h-9 w-28 animate-pulse rounded-xl border border-white/5 bg-[#26243d]" />
      <div className="h-9 w-24 animate-pulse rounded-xl border border-white/5 bg-[#26243d]" />
    </div>
  );
}

function NavbarAuthSkeleton() {
  return (
    <div className="flex items-center gap-2 lg:justify-self-end" aria-hidden="true">
      <div className="hidden h-10 w-20 animate-pulse rounded-xl border border-white/5 bg-[#26243d] sm:block" />
      <div className="hidden h-10 w-28 animate-pulse rounded-xl border border-white/5 bg-[#26243d] sm:block" />
      <div className="h-10 w-10 animate-pulse rounded-xl border border-white/5 bg-[#26243d] lg:hidden" />
    </div>
  );
}

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#211f37]/95 shadow-[0_4px_20px_rgba(10,9,22,0.24)] backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-container-max items-center justify-between gap-4 px-4 sm:px-6 lg:grid lg:grid-cols-[auto_1fr_auto] lg:px-8">
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
