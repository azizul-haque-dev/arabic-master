import { ArrowRight, Play, ShieldCheck, Volume2 } from "lucide-react";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative w-full overflow-hidden pt-space-xl pb-space-3xl lg:pt-space-2xl lg:pb-space-3xl bg-surface">
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary-fixed/30 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 left-10 w-72 h-72 bg-surface-container rounded-full blur-2xl pointer-events-none -z-10" />

      <div className="max-w-container-max mx-auto px-gutter-mobile lg:px-gutter-desktop">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-space-2xl">
          <div className="inline-flex items-center gap-space-xs px-space-md py-1.5 rounded-full bg-surface-container-high text-primary font-label-md text-label-md mb-space-lg shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-primary-container animate-pulse" />
            <span>
              Practical Arabic • Real Conversations • Learn at Your Pace
            </span>
          </div>

          <h1 className="mb-space-lg font-headline-xl text-headline-xl font-normal tracking-tight text-on-surface lg:text-[56px] lg:leading-[64px]">
            Learn the Arabic You Actually Need to Speak.
          </h1>

          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mb-space-xl leading-relaxed">
            Build practical Arabic skills through real-life words, useful
            sentences, and conversations designed for everyday situations.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-space-md w-full sm:w-auto mb-space-md">
            <Link
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-space-xs h-12 px-space-xl rounded-xl bg-primary-container text-on-primary font-title-md text-title-md shadow-md transition-all duration-200 hover:bg-primary-dark hover:shadow-lg active:translate-y-[1px]"
            >
              <span>Start Learning Free</span>
              <ArrowRight className="size-5" />
            </Link>
            <Link
              href="/pricing"
              className="w-full sm:w-auto inline-flex items-center justify-center h-12 px-space-xl rounded-xl border border-border bg-surface-container-lowest text-on-surface font-title-md text-title-md shadow-sm transition-all hover:border-primary hover:bg-primary hover:text-on-primary hover:shadow-md active:translate-y-[1px]"
            >
              <span>Explore Pro</span>
            </Link>
          </div>

          <div className="flex items-center justify-center gap-space-xs text-on-surface-variant font-body-sm text-body-sm">
            <ShieldCheck className="size-4 text-primary-container" />
            <span>
              No credit card required • 10-minute daily bite-sized sessions •
              Gulf &amp; Saudi spoken dialect focus
            </span>
          </div>
        </div>

        <DashboardPreview />
      </div>
    </section>
  );
}

function DashboardPreview() {
  return (
    <div className="w-full max-w-4xl mx-auto rounded-xl bg-surface-container-lowest shadow-xl p-space-md lg:p-space-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md pb-space-md mb-space-lg bg-surface-container-low p-space-md rounded-lg">
        <div className="flex items-center gap-space-sm">
          <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary font-title-md">
            A
          </div>
          <div>
            <p className="font-title-md text-title-md text-on-surface flex items-center gap-1">
              Good morning, Ahmed{" "}
              <span className="inline-block animate-bounce">👋</span>
            </p>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Riyadh Spoken Track • Daily Goal: 10m
            </p>
          </div>
        </div>

        <div className="flex items-center gap-space-xs flex-wrap">
          <div className="inline-flex items-center gap-1 px-space-sm py-1 rounded-full bg-amber-50 text-secondary font-label-md text-label-md shadow-sm">
            <span>🔥</span>
            <span>7 Day Streak</span>
          </div>
          <div className="inline-flex items-center gap-1 px-space-sm py-1 rounded-full bg-surface-container text-primary font-label-md text-label-md">
            <span>⭐</span>
            <span>420 XP</span>
          </div>
          <div className="inline-flex items-center gap-1 px-space-sm py-1 rounded-full bg-error-container text-on-error-container font-label-md text-label-md">
            <span>❤️</span>
            <span>4 Hearts</span>
          </div>
        </div>
      </div>

      <div className="bg-surface p-space-md lg:p-space-lg rounded-xl mb-space-lg shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md mb-space-md">
          <div>
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-bold">
              Continue Learning
            </span>
            <h3 className="font-title-lg text-title-lg text-on-surface mt-0.5">
              Shopping Essentials
            </h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Progress: 7 / 10 lessons completed (70%)
            </p>
          </div>
          <button
            type="button"
            className="inline-flex items-center justify-center gap-space-xs h-10 px-space-lg bg-primary-container text-on-primary font-label-md text-label-md rounded-lg shadow-sm hover:bg-primary transition-colors"
          >
            <Play className="size-[18px]" />
            <span>Continue Lesson</span>
          </button>
        </div>

        <div className="w-full bg-surface-container h-2.5 rounded-full overflow-hidden mb-space-md">
          <div
            className="bg-primary-container h-full rounded-full transition-all duration-1000"
            style={{ width: "70%" }}
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-space-md p-space-md rounded-lg bg-surface-container-lowest shadow-sm">
          <div className="flex items-center gap-space-md">
            <button
              type="button"
              aria-label="Listen to pronunciation of বিকাম হাথা"
              className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary-container hover:scale-105 transition-transform"
            >
              <Volume2 className="size-5" />
            </button>
            <div>
              <span
                dir="rtl"
                lang="ar"
                className="text-xl font-headline-md text-on-surface font-semibold"
              >
                بِكَم هَذا؟
              </span>
              <span className="text-on-surface-variant font-code-num text-code-num ml-2">
                (Bikam hatha?)
              </span>
              <p className="font-body-md text-body-md text-on-surface mt-0.5">
                How much is this?
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-primary text-body-sm font-label-md bg-surface-container px-space-sm py-1 rounded-md">
            <span>Spoken Riyadh Dialect</span>
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant mb-space-sm">
          Recommended for You
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm">
          {[
            {
              emoji: "🛍️",
              rating: "4.9",
              title: "Arabic for Shopping",
              lessons: "12 practical lessons",
            },
            {
              emoji: "💼",
              rating: "4.8",
              title: "Arabic for Work",
              lessons: "16 practical lessons",
            },
            {
              emoji: "💬",
              rating: "4.9",
              title: "Everyday Conversations",
              lessons: "20 practical lessons",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="p-space-sm rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xl">{item.emoji}</span>
                <span className="font-label-sm text-label-sm font-bold text-secondary">
                  {item.rating} ★
                </span>
              </div>
              <p className="font-title-md text-title-md text-on-surface">
                {item.title}
              </p>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                {item.lessons}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
