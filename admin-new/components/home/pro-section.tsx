import { ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { proFeatures } from "@/lib/mock-data/landing";

export function ProSection() {
  return (
    <section className="bg-surface py-16 sm:py-20">
      <div className="mx-auto max-w-container-max px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 overflow-hidden rounded-2xl bg-primary-dark p-6 text-white sm:p-9 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-12 lg:p-12">
          <div>
            <span className="inline-flex items-center rounded-md bg-white/10 px-2.5 py-1.5 text-sm font-medium text-white">
              Arabic Master Pro
            </span>
            <h2 className="mt-5 max-w-xl font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
              A course path from beginner to advanced
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
              Pro includes beginner-to-advanced courses, advanced
              conversations, and tense courses.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/pricing"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-medium text-primary-dark transition-colors hover:bg-primary-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary-dark"
              >
                Get Arabic Master Pro
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <Link
                href="/pricing#comparison"
                className="inline-flex min-h-12 items-center justify-center rounded-lg border border-white/30 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                View Pro Plans
              </Link>
            </div>
            <p className="mt-4 text-xs text-white/70">
              Annual plan · one year of access
            </p>
          </div>

          <div className="rounded-xl border border-white/20 bg-white/10 p-5 sm:p-7">
            <h3 className="mb-5 font-heading text-lg font-semibold text-white">
              Included with Pro
            </h3>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {proFeatures.map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-sm leading-relaxed text-white/95">
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary-light" aria-hidden="true" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
