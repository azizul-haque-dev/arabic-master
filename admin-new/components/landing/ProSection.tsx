import { proFeatures } from "@/lib/mock-data/landing";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
export function ProSection() {
  return (
    <section className="py-space-3xl bg-surface">
      <div className="max-w-container-max mx-auto px-gutter-mobile lg:px-gutter-desktop">
        <div className="relative overflow-hidden rounded-2xl border border-secondary-light/30 bg-secondary p-space-lg text-on-primary shadow-[0_18px_40px_rgba(17,94,89,0.24)] lg:p-space-2xl">
          <div className="relative max-w-3xl text-left">
            <div className="mb-space-md inline-flex items-center gap-space-xs rounded-full bg-accent-light px-space-md py-1 font-label-md text-label-md font-bold tracking-[0.12em] text-warning-text shadow-sm">
              <span>ARABIC MASTER PRO</span>
            </div>

            <h2 className="mb-space-md font-headline-lg text-headline-lg font-semibold tracking-tight text-on-primary lg:text-[2.5rem] lg:leading-tight">
              Go Beyond the Basics.
            </h2>
            <p className="mb-space-xl max-w-2xl font-body-lg text-body-lg leading-relaxed text-secondary-light">
              Unlock the complete Arabic learning experience and follow a
              structured path from beginner to advanced.
            </p>

            <div className="mb-space-sm flex flex-col items-start gap-space-md sm:flex-row">
              <Link
                href="/pricing"
                className="inline-flex h-11 w-full items-center justify-center whitespace-nowrap rounded bg-accent px-space-lg font-title-md text-title-md font-semibold text-white shadow-md transition-all duration-200 hover:bg-accent/85 hover:shadow-lg active:translate-y-px sm:w-auto"
              >
                <span>Get Arabic Master Pro</span>
              </Link>
              <Link
                href="/pricing"
                className="inline-flex h-11 w-full items-center justify-center whitespace-nowrap rounded border border-secondary-light/35 bg-secondary-light/20 px-space-lg font-title-md text-title-md font-semibold text-white transition-all duration-200 hover:bg-secondary-light/35 hover:shadow-md active:translate-y-px sm:w-auto"
              >
                <span>View Pro Plans</span>
              </Link>
            </div>
            <p className="font-body-sm text-body-sm text-secondary-light">
              One year of full access • 14-day money-back guarantee
            </p>
            <div className="mt-space-xl grid max-w-2xl grid-cols-1 gap-x-space-2xl gap-y-space-sm sm:grid-cols-2">
              {proFeatures.map((feature) => (
                <div
                  key={feature}
                  className="flex items-center gap-3 font-title-md text-title-md text-white/95"
                >
                  <CheckCircle2 className="size-5 shrink-0 text-accent-light" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
