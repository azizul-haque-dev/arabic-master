import { howItWorksSteps } from "@/lib/mock-data/landing";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
export function HowItWorksSection() {
  return (
    <section className="py-space-3xl bg-surface">
      <div className="max-w-container-max mx-auto px-gutter-mobile lg:px-gutter-desktop">
        <div className="text-center max-w-2xl mx-auto mb-space-2xl">
          <span className="mb-space-sm inline-flex items-center rounded-full border border-primary-light/60 bg-primary-light/20 px-3 py-1 font-label-sm text-label-sm font-bold uppercase tracking-[0.16em] text-primary">
            Getting Started
          </span>
          <h2 className="mb-space-md font-headline-lg text-headline-lg font-semibold tracking-tight text-on-surface">
            Start Speaking Arabic in Three Simple Steps.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg mb-space-2xl">
          {howItWorksSteps.map((step) => (
            <div
              key={step.number}
              className="rounded-2xl border border-border/70 bg-surface-container-low p-space-lg shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition-all hover:-translate-y-1 hover:border-primary-light hover:bg-surface-container-lowest"
            >
              <div>
                <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary font-code-num text-code-num font-bold flex items-center justify-center mb-space-md">
                  {step.number}
                </div>
                <h3 className="font-title-lg text-title-lg text-on-surface mb-space-xs">
                  {step.title}
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link
            href="/register"
            className="inline-flex items-center justify-center gap-space-xs h-12 px-space-xl bg-primary-container text-on-primary font-title-md text-title-md rounded-xl shadow-md hover:bg-primary transition-all"
          >
            <span>Start Learning Free</span>
            <ArrowRight className="size-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
