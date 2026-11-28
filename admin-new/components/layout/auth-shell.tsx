import { BookOpen, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { CopyrightYear } from "@/components/shared/copyright-year";
import { ThemeToggleButton } from "@/components/layout/theme-toggle-button";

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-background px-gutter-mobile py-space-2xl">
      <Link 
        href="/" 
        className="absolute left-4 top-4 z-20 inline-flex items-center gap-2 rounded-lg px-3 py-2 font-label-md text-label-md text-text-secondary transition-colors hover:bg-neutral-bg hover:text-text sm:left-6 sm:top-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Link>
      <div className="absolute right-4 top-4 z-20 sm:right-6 sm:top-6">
        <ThemeToggleButton />
      </div>
      <div className="relative z-10 w-full max-w-md">
        <Link
          href="/"
          className="mb-space-xl flex items-center justify-center gap-2.5"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center text-primary">
            <BookOpen className="h-6 w-6" aria-hidden="true" />
          </span>
          <span className="text-left">
            <span className="block font-headline-md text-headline-md leading-none text-text">
              Arabic Master
            </span>
            <span className="mt-1 block font-label-sm text-label-sm font-medium text-text-muted">
              Spoken Arabic
            </span>
          </span>
        </Link>

        {children}
      </div>

      <p className="relative z-10 mt-space-xl max-w-md text-center font-body-sm text-body-sm text-text-muted">
        © <CopyrightYear /> Arabic Master. All rights reserved.
      </p>
    </div>
  );
}
