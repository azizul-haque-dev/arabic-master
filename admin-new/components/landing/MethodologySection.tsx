import {
  methodologySteps,
  type MethodologyStep,
} from "@/lib/mock-data/landing";
import {
  BookOpen,
  Compass,
  ListChecks,
  Mic,
  RotateCcw,
  TrendingUp,
} from "lucide-react";

const iconMap = {
  compass: Compass,
  book: BookOpen,
  list: ListChecks,
  mic: Mic,
  replay: RotateCcw,
  trending: TrendingUp,
} as const;

export function MethodologySection() {
  return (
    <section className="py-space-3xl bg-surface">
      <div className="max-w-container-max mx-auto px-gutter-mobile lg:px-gutter-desktop">
        <div className="text-center max-w-2xl mx-auto mb-space-2xl">
          <span className="mb-space-sm inline-flex items-center rounded-full border border-primary-light/60 bg-primary-light/20 px-3 py-1 font-label-sm text-label-sm font-bold uppercase tracking-[0.16em] text-primary">
            The Methodology
          </span>
          <h2 className="mb-space-md font-headline-lg text-headline-lg font-semibold tracking-tight text-on-surface">
            From Knowing Words to Actually Speaking.
          </h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            Learn vocabulary in context, turn it into useful sentences, and
            practice it through realistic conversations.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-space-sm">
          {methodologySteps.map((step) => (
            <StepCard key={step.id} step={step} />
          ))}
        </div>
      </div>
    </section>
  );
}

function StepCard({ step }: { step: MethodologyStep }) {
  const Icon = iconMap[step.icon];
  const isLast = step.id === "progress";

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-border/70 bg-surface-container-lowest p-space-md shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition-all hover:-translate-y-1 hover:border-primary-light hover:shadow-[0_14px_28px_rgba(15,23,42,0.08)]">
      <div className="mb-space-md">
        <span
          className={`font-code-num text-code-num font-bold ${
            isLast ? "text-secondary" : "text-primary-container"
          }`}
        >
          {step.number}
        </span>
        <h4 className="font-title-md text-title-md text-on-surface mt-1">
          {step.title}
        </h4>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
          {step.description}
        </p>
      </div>
      <div
        className={`text-right ${isLast ? "text-secondary" : "text-primary"}`}
      >
        <Icon className="size-5 inline-block" />
      </div>
    </div>
  );
}
