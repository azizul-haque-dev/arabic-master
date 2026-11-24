import {
  ArrowRight,
  Briefcase,
  Car,
  House,
  MessageCircle,
  ShoppingBag,
  Utensils,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { situations, type Situation } from "@/lib/mock-data/landing";

const iconMap = {
  shopping: ShoppingBag,
  work: Briefcase,
  restaurant: Utensils,
  transportation: Car,
  "daily-life": House,
  conversation: MessageCircle,
} satisfies Record<Situation["icon"], LucideIcon>;

export function SituationsSection() {
  return (
    <section className="bg-surface-container-low py-16 sm:py-20">
      <div className="mx-auto max-w-container-max px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-10 max-w-2xl text-center sm:mb-12">
          <span className="inline-flex items-center rounded-full border border-primary/15 bg-primary-light px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-primary-dark">
            Everyday Arabic
          </span>
          <h2 className="mt-3 font-heading text-2xl font-bold tracking-tight text-text sm:text-3xl">
            Phrases for common situations.
          </h2>
          <p className="mt-3 text-base leading-relaxed text-text-secondary sm:text-lg">
            Learn what to say at shops, at work, in restaurants, and around town.
          </p>
        </div>

        <div className="mb-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {situations.map((situation) => (
            <SituationCard key={situation.id} situation={situation} />
          ))}
        </div>

        <div className="flex justify-center">
          <Link
            href="/conversations"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Browse Conversations
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function SituationCard({ situation }: { situation: Situation }) {
  const Icon = iconMap[situation.icon];

  return (
    <article className="group flex h-full flex-col rounded-2xl border border-border/80 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_16px_30px_rgba(15,23,42,0.08)] sm:p-6">
      <div className="mb-4">
        <span className="inline-flex size-11 items-center justify-center rounded-xl bg-primary-light text-primary">
          <Icon className="size-5" aria-hidden="true" />
        </span>
      </div>
      <h3 className="font-heading text-lg font-bold text-text">
        {situation.title}
      </h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-text-secondary">
        {situation.description}
      </p>

      <div className="mt-5 rounded-xl border border-primary/10 bg-primary-light/35 p-4">
        <p
          dir="rtl"
          lang="ar"
          className="font-arabic text-right text-xl font-bold leading-relaxed text-primary-dark"
        >
          {situation.arabic}
        </p>
        <p className="mt-2 border-t border-primary/10 pt-2 text-sm text-text-secondary">
          <span className="font-semibold text-text">EN:</span> {situation.translation}
        </p>
        <p className="font-bengali mt-1 text-sm leading-relaxed text-text-secondary">
          <span className="font-semibold text-text">বাংলা:</span>{" "}
          {situation.banglaTranslation}
        </p>
      </div>
    </article>
  );
}
