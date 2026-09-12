import { situations } from "@/lib/mock-data/landing";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function SituationsSection() {
  return (
    <section className="py-space-3xl bg-surface-container-low">
      <div className="max-w-container-max mx-auto px-gutter-mobile lg:px-gutter-desktop">
        <div className="text-center max-w-2xl mx-auto mb-space-2xl">
          <span className="mb-space-sm inline-flex items-center rounded-full border border-primary-light/60 bg-primary-light/20 px-3 py-1 font-label-sm text-label-sm font-bold uppercase tracking-[0.16em] text-primary">
            Situations That Matter
          </span>
          <h2 className="mb-space-md font-headline-lg text-headline-lg font-semibold tracking-tight text-on-surface">
            Arabic for the Situations That Matter.
          </h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            Learn the Arabic you need for everyday life, work, and
            communication.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-lg mb-space-2xl">
          {situations.map((situation) => (
            <div
              key={situation.id}
              className="group rounded-2xl border border-border/70 bg-surface-container-lowest p-space-lg shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition-all hover:-translate-y-1 hover:border-primary-light hover:shadow-[0_16px_30px_rgba(15,23,42,0.08)]"
            >
              <div className="flex items-center justify-between mb-space-sm">
                <span className="text-2xl">{situation.emoji}</span>
                <span className="font-label-sm text-label-sm uppercase text-on-surface-variant bg-surface-container px-2 py-0.5 rounded">
                  {situation.category}
                </span>
              </div>
              <h3 className="font-title-lg text-title-lg text-on-surface mb-space-xs">
                {situation.title}
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant mb-space-md">
                {situation.description}
              </p>
              <div className="flex items-center justify-between rounded-xl border border-border/60 bg-surface-container-low p-space-sm">
                <span
                  dir="rtl"
                  lang="ar"
                  className="font-headline-md text-headline-md text-primary font-semibold"
                >
                  {situation.arabic}
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  {situation.translation}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center">
          <Link
            href="/courses"
            className="inline-flex items-center justify-center gap-space-xs h-11 px-space-xl rounded-lg border border-border bg-surface-container-lowest text-on-surface font-label-md text-label-md shadow-sm transition-all hover:border-primary hover:bg-primary hover:text-on-primary hover:shadow-md active:translate-y-[1px]"
          >
            <span>Explore Topics</span>
            <ArrowRight className="size-[18px]" />
          </Link>
        </div>
      </div>
    </section>
  );
}
