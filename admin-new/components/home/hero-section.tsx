import { Suspense } from "react";
import { CheckCircle2, Star } from "lucide-react";
import { getAuthSession } from "@/lib/auth/session";
import { HeroCtaClient } from "./hero-cta-client";

async function HeroAuthCtaSlot() {
  const { user } = await getAuthSession();
  return <HeroCtaClient initialUser={user ?? null} />;
}

function HeroCtaSkeleton() {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center" aria-hidden="true">
      <div className="h-12 w-48 animate-pulse rounded-xl bg-primary/20" />
      <div className="h-12 w-36 animate-pulse rounded-xl bg-neutral-bg" />
    </div>
  );
}

const HERO_BENEFITS = [
  "Real-Life Phrases",
  "Natural Pronunciation",
  "Bangla & English Meaning",
] as const;

function HeroIllustration() {
  return (
    <div className="relative mx-auto w-full max-w-lg">
      <div className="relative overflow-hidden rounded-3xl border border-primary/15 bg-gradient-to-br from-primary-light/45 via-white to-sky-50 p-6 shadow-[0_20px_50px_rgba(15,118,110,0.10)] sm:p-8">
        {/* Stylized Riyadh / Gulf Skyline SVG inspired by reference */}
        <svg
          viewBox="0 0 460 220"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto select-none"
          role="img"
          aria-label="Illustration of Riyadh skyline with modern towers and palm trees"
        >
          <circle cx="360" cy="56" r="34" fill="#FEF3C7" />
          <circle cx="360" cy="56" r="22" fill="#FDE68A" />
          {/* Distant skyline */}
          <rect x="30" y="110" width="38" height="90" rx="4" fill="#CCFBF1" />
          <rect x="78" y="88" width="44" height="112" rx="4" fill="#99F6E4" />
          <rect x="132" y="122" width="34" height="78" rx="4" fill="#CCFBF1" />
          {/* Al Faisaliyah silhouette */}
          <path d="M196 200L215 62L234 200H196Z" fill="#0F766E" fillOpacity="0.22" />
          <circle cx="215" cy="96" r="7" fill="#0F766E" fillOpacity="0.45" />
          {/* Kingdom Centre silhouette */}
          <path
            d="M256 200V44C256 38 260 34 266 34H306C312 34 316 38 316 44V200H256Z"
            fill="#0F766E"
            fillOpacity="0.85"
          />
          <path
            d="M270 52C270 46 276 42 286 42C296 42 302 46 302 52V78C302 88 295 94 286 94C277 94 270 88 270 78V52Z"
            fill="#F0FDFA"
          />
          <rect x="328" y="96" width="46" height="104" rx="4" fill="#115E59" fillOpacity="0.22" />
          <rect x="384" y="118" width="42" height="82" rx="4" fill="#99F6E4" />
          {/* Ground curve */}
          <path
            d="M0 198C110 182 310 182 460 198V220H0V198Z"
            fill="#0F766E"
            fillOpacity="0.12"
          />
          {/* Palm tree */}
          <path d="M96 196C98 168 102 150 106 138" stroke="#115E59" strokeWidth="4" strokeLinecap="round" />
          <path d="M106 138C92 130 78 134 72 142" stroke="#0F766E" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M106 138C120 128 134 132 140 140" stroke="#0F766E" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M106 138C96 122 86 118 76 122" stroke="#0F766E" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M106 138C114 120 126 118 134 124" stroke="#0F766E" strokeWidth="3.5" strokeLinecap="round" />
        </svg>

        {/* Practical Phrase Card overlay */}
        <div className="mt-4 rounded-2xl border border-border/80 bg-white/95 p-4 shadow-md">
          <div className="flex items-center justify-between gap-2">
            <span className="rounded-full bg-primary-light px-2.5 py-0.5 text-[11px] font-semibold text-primary-dark">
              Everyday Saudi Spoken
            </span>
            <span className="text-xs font-medium text-text-muted">Shopping</span>
          </div>
          <div className="mt-2.5 flex items-baseline justify-between gap-3">
            <p
              dir="rtl"
              lang="ar"
              className="font-arabic text-2xl font-bold text-text"
            >
              بِكَم هَذا؟
            </p>
            <span className="text-xs font-medium text-primary">Bikam hatha?</span>
          </div>
          <div className="mt-2 grid grid-cols-1 gap-1 border-t border-border/60 pt-2 text-xs sm:grid-cols-2">
            <p className="text-text-secondary">
              <span className="font-semibold text-text">EN:</span> How much is this?
            </p>
            <p className="font-bengali text-text-secondary sm:text-right">
              <span className="font-semibold text-text">BN:</span> এটার দাম কত?
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-white py-10 sm:py-14 lg:py-16">
      <div
        className="pointer-events-none absolute -top-24 right-0 h-80 w-80 rounded-full bg-primary-light/35 blur-3xl"
        aria-hidden="true"
      />
      <div className="mx-auto grid max-w-container-max grid-cols-1 items-center gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:gap-12 lg:px-8">
        <div className="lg:col-span-7">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary-light/60 px-3.5 py-1.5 text-xs font-semibold text-primary-dark">
            <Star className="h-3.5 w-3.5 fill-accent text-accent" aria-hidden="true" />
            <span>Your Arabic Learning Journey Starts Here</span>
          </div>

          <h1 className="font-heading text-3xl font-bold leading-tight tracking-tight text-text sm:text-4xl lg:text-5xl lg:leading-[1.12]">
            Learn the <span className="text-primary">Arabic</span> You Actually
            Need to Speak.
          </h1>

          <p className="mt-4 max-w-xl text-base leading-relaxed text-text-secondary sm:text-lg">
            Practical Arabic for everyday life in Arabic-speaking countries.
            Learn, Practice and Speak with Confidence.
          </p>

          <div className="mt-6">
            <Suspense fallback={<HeroCtaSkeleton />}>
              <HeroAuthCtaSlot />
            </Suspense>
          </div>

          <ul className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-text-secondary">
            {HERO_BENEFITS.map((benefit) => (
              <li key={benefit} className="inline-flex items-center gap-1.5">
                <CheckCircle2
                  className="h-4 w-4 shrink-0 text-primary"
                  aria-hidden="true"
                />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-5">
          <HeroIllustration />
        </div>
      </div>
    </section>
  );
}
