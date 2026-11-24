import { Suspense } from "react";
import { Trophy } from "lucide-react";
import { getAuthSession } from "@/lib/auth/session";
import { FinalCtaButtonClient } from "./final-cta-button-client";

async function FinalCtaButtonSlot() {
  const { user } = await getAuthSession();
  return <FinalCtaButtonClient initialUser={user ?? null} />;
}

export function FinalCTASection() {
  return (
    <section className="mx-auto max-w-container-max px-4 pt-6 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary-dark via-primary to-primary-dark px-6 py-8 text-white shadow-[0_18px_40px_rgba(17,94,89,0.22)] sm:px-10 sm:py-10">
        <div className="relative z-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <span
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-accent ring-1 ring-white/20"
              aria-hidden="true"
            >
              <Trophy className="h-7 w-7" />
            </span>
            <div>
              <h2 className="font-heading text-xl font-bold sm:text-2xl">
                Start Your Arabic Learning Journey Today!
              </h2>
              <p className="mt-1 text-sm text-primary-light sm:text-base">
                Small steps. Big progress. Practice spoken Arabic in 10 minutes
                a day.
              </p>
            </div>
          </div>

          <Suspense
            fallback={
              <div
                className="h-12 w-44 animate-pulse rounded-xl bg-white/25"
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
