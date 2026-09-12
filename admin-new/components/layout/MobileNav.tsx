"use client";

import { navLinks } from "@/lib/mock-data/landing";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center justify-center h-10 w-10 rounded text-on-surface hover:bg-surface-container transition-colors"
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>

      {open && (
        <div
          id="mobile-nav-panel"
          className="absolute inset-x-3 top-[84px] flex flex-col gap-1 rounded-2xl border border-border/80 bg-surface/95 p-2 shadow-[0_16px_35px_rgba(15,23,42,0.12)] backdrop-blur-xl sm:inset-x-5"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-xl px-3 py-2.5 font-label-md text-label-md text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/login"
            onClick={() => setOpen(false)}
            className="rounded-xl px-3 py-2.5 font-label-md text-label-md text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface"
          >
            Log In
          </Link>
          <Link
            href="/signup"
            onClick={() => setOpen(false)}
            className="mt-1 inline-flex h-11 items-center justify-center rounded-xl bg-primary px-4 font-label-md text-label-md font-semibold text-on-primary transition-colors hover:bg-primary-dark"
          >
            Start Learning
          </Link>
        </div>
      )}
    </div>
  );
}
