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
      <div className="relative overflow-hidden rounded-2xl bg-primary-dark px-6 py-8 text-white sm:px-10 sm:py-10">
        <div className="relative z-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <span
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/10 text-primary-light"
              aria-hidden="true"
            >
              <BookOpen className="h-7 w-7" />
            </span>
            <div>
              <h2 className="font-heading text-xl font-semibold sm:text-2xl">
                Start with a free lesson
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-white/80 sm:text-base">
                Create an account to save your lessons, or browse the courses first.
              </p>
            </div>
          </div>

          <Suspense
            fallback={
              <div
                className="h-12 w-44 rounded-lg bg-white/10"
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
