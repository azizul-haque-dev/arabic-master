import { Suspense } from "react";
import { CheckCircle2 } from "lucide-react";
import { getAuthSession } from "@/lib/auth/session";
import { HeroCtaClient } from "./hero-cta-client";

async function HeroAuthCtaSlot() {
  const { user } = await getAuthSession();
  return <HeroCtaClient initialUser={user ?? null} />;
}

function HeroCtaSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 sm:flex-row" aria-hidden="true">
      <div className="h-12 w-48 animate-pulse rounded-xl bg-primary/20" />
      <div className="h-12 w-36 animate-pulse rounded-xl bg-neutral-bg" />
    </div>
  );
}

const HERO_FACTS = [
  "Bangla and English meanings",
  "Gulf Arabic expressions",
  "Words, sentences, and conversations",
] as const;

const dotPattern = {
  backgroundImage: "radial-gradient(rgba(100, 116, 139, 0.35) 1.25px, transparent 1.25px)",
  backgroundSize: "16px 16px",
};

export function HeroSection() {
  return (
    <section className="relative isolate overflow-hidden bg-background py-16 sm:py-20 lg:py-24">
      <div
        className="pointer-events-none absolute -right-3 top-7 hidden h-56 w-52 opacity-60 sm:block"
        style={dotPattern}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-10 -left-5 hidden h-48 w-52 opacity-50 sm:block"
        style={dotPattern}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
        <h1 className="mx-auto max-w-4xl font-heading text-4xl font-bold leading-[1.08] tracking-tight text-text sm:text-5xl lg:text-6xl">
          Learn <span className="text-primary">spoken Arabic</span> for
          <span className="block">daily life across the Gulf.</span>
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-text-secondary sm:mt-6 sm:text-lg sm:leading-8">
          Study words and sentences with Bangla and English meanings, then read
          short conversations about daily situations.
        </p>

        <div className="mt-7 sm:mt-8">
          <Suspense fallback={<HeroCtaSkeleton />}>
            <HeroAuthCtaSlot />
          </Suspense>
        </div>

        <ul className="mx-auto mt-8 flex max-w-4xl flex-wrap items-center justify-center gap-x-6 gap-y-3 sm:mt-10">
          {HERO_FACTS.map((fact) => (
            <li
              key={fact}
              className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary"
            >
              <CheckCircle2 className="size-4 shrink-0 text-primary" aria-hidden="true" />
              {fact}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
