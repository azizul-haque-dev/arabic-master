import { Suspense } from "react";
import { BookOpen } from "lucide-react";
import { getAuthSession } from "@/lib/auth/session";
import { FinalCtaButtonClient } from "./final-cta-button-client";

async function FinalCtaButtonSlot() {
  const { user } = await getAuthSession();
  return <FinalCtaButtonClient initialUser={user ?? null} />;
}

export function FinalCTASection() {
  return (
    <section className="mx-auto max-w-container-max px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-surface px-6 py-8 text-white shadow-[0_18px_50px_rgba(0,0,0,0.2)] sm:px-10 sm:py-10">
        <div className="relative z-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <span
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-primary/25 bg-primary/15 text-primary-light"
              aria-hidden="true"
            >
              <BookOpen className="h-7 w-7" />
            </span>
            <div>
              <h2 className="font-heading text-xl font-bold sm:text-2xl">
                Start with a free lesson.
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-white/75 sm:text-base">
                Create an account to save your lessons, or browse the courses first.
              </p>
            </div>
          </div>

          <Suspense
            fallback={
              <div
                className="h-12 w-44 animate-pulse rounded-xl border border-white/10 bg-[#302d48]"
                aria-hidden="true"
              />
            }
          >
            <FinalCtaButtonSlot />
          </Suspense>
        </div>
      </div>
    </section>
  );
}
