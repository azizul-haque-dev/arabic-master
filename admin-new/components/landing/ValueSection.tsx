import { valueCards, type ValueCard } from "@/lib/mock-data/landing";
import { Languages, MessageCircle, Quote, Volume2 } from "lucide-react";

const iconMap = {
  translate: Languages,
  quote: Quote,
  forum: MessageCircle,
} as const;

export function ValueSection() {
  return (
    <section className="py-space-3xl bg-surface-container-low">
      <div className="max-w-container-max mx-auto px-gutter-mobile lg:px-gutter-desktop">
        <div className="text-center max-w-2xl mx-auto mb-space-2xl">
          <span className="mb-space-sm inline-flex items-center rounded-full border border-primary-light/60 bg-primary-light/20 px-3 py-1 font-label-sm text-label-sm font-bold uppercase tracking-[0.16em] text-primary">
            Why Arabic Master
          </span>
          <h2 className="mb-space-md font-headline-lg text-headline-lg font-semibold tracking-tight text-on-surface">
            Learn Arabic for Real Life.
          </h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            Arabic Master focuses on the language you are most likely to use in
            everyday situations—not isolated vocabulary lists.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg">
          {valueCards.map((card) => (
            <ValueCardItem key={card.id} card={card} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ValueCardItem({ card }: { card: ValueCard }) {
  const Icon = iconMap[card.icon];

  return (
    <div className="group flex flex-col justify-between rounded-2xl border border-border/70 bg-surface-container-lowest p-space-lg shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition-all hover:-translate-y-1 hover:border-primary-light hover:shadow-[0_16px_30px_rgba(15,23,42,0.08)]">
      <div>
        <div className="mb-space-md flex h-12 w-12 items-center justify-center rounded-xl bg-primary-light/25 text-primary transition-colors group-hover:bg-primary group-hover:text-on-primary">
          <Icon className="size-7" />
        </div>
        <h3 className="font-title-lg text-title-lg text-on-surface mb-space-xs">
          {card.title}
        </h3>
        <p className="font-body-md text-body-md text-on-surface-variant mb-space-md">
          {card.description}
        </p>
      </div>

      <div className="flex items-center justify-between rounded-xl border border-border/60 bg-surface-container-low p-space-sm">
        <div>
          <span
            dir="rtl"
            lang="ar"
            className="font-headline-md text-headline-md text-on-surface"
          >
            {card.arabic}
          </span>
          <p className="font-code-num text-code-num text-on-surface-variant">
            {card.meaning}
          </p>
        </div>
        {card.id === "words" && (
          <div className="w-8 h-8 rounded-full bg-primary-fixed text-primary flex items-center justify-center">
            <Volume2 className="size-4" />
          </div>
        )}
      </div>
    </div>
  );
}
