import {
  BookOpen,
  Compass,
  ListChecks,
  Mic,
  RotateCcw,
  TrendingUp,
} from "lucide-react";
import {
  methodologySteps,
  type MethodologyStep,
} from "@/lib/mock-data/landing";

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
    <section className="bg-surface py-16 sm:py-20">
      <div className="mx-auto max-w-container-max px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-10 max-w-2xl text-center sm:mb-12">
          <span className="inline-flex items-center rounded-md bg-primary-light px-2.5 py-1 text-sm font-medium text-primary-dark">
            How lessons work
          </span>
          <h2 className="mt-3 font-heading text-2xl font-semibold tracking-tight text-text sm:text-3xl">
            A lesson moves from words to conversation
          </h2>
          <p className="mt-3 text-base leading-relaxed text-text-secondary sm:text-lg">
            Start with a situation, learn useful words and phrases, then read a
            short dialogue.
          </p>
        </div>

        <div className="relative grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          <div
            className="absolute left-[8.33%] right-[8.33%] top-7 hidden h-0.5 bg-primary-light lg:block"
            aria-hidden="true"
          />
          {methodologySteps.map((step) => (
            <MethodologyCard key={step.id} step={step} />
          ))}
        </div>
      </div>
    </section>
  );
}

function MethodologyCard({ step }: { step: MethodologyStep }) {
  const Icon = iconMap[step.icon];

  return (
    <article className="relative z-10 flex min-h-52 flex-col rounded-xl border border-border bg-white p-5 transition-colors hover:bg-background-soft">
      <div className="mb-5 flex items-center justify-between gap-3">
        <span className="inline-flex size-11 items-center justify-center rounded-lg bg-primary-light text-primary">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <span className="font-mono text-sm font-medium tabular-nums text-text-muted">
          {step.number}
        </span>
      </div>
      <h3 className="font-heading text-base font-semibold text-text">{step.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-text-secondary">
        {step.description}
      </p>
    </article>
  );
}
