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
          <span className="inline-flex items-center rounded-full border border-primary/15 bg-primary-light px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-primary-dark">
            How lessons work
          </span>
          <h2 className="mt-3 font-heading text-2xl font-bold tracking-tight text-text sm:text-3xl">
            A lesson moves from words to conversation.
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
    <article className="relative z-10 flex min-h-52 flex-col rounded-2xl border border-border/80 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_14px_28px_rgba(15,23,42,0.08)]">
      <div className="mb-5 flex items-center justify-between gap-3">
        <span className="inline-flex size-14 items-center justify-center rounded-full border-4 border-white bg-primary-light text-primary shadow-sm">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <span className="font-mono text-sm font-bold tracking-widest text-primary">
          {step.number}
        </span>
      </div>
      <h3 className="font-heading text-base font-bold text-text">{step.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-text-secondary">
        {step.description}
      </p>
    </article>
  );
}
