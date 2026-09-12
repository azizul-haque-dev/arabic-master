import { recommendations } from "@/lib/mock-data/landing";
import { BadgeCheck, SlidersHorizontal } from "lucide-react";

const profile = [
  { label: "Target Country:", value: "Saudi Arabia 🇸🇦" },
  { label: "Starting Level:", value: "Beginner" },
  { label: "Priority Goals:", value: "Shopping, Work, Daily Life" },
  { label: "Daily Practice Goal:", value: "10 minutes / day" },
  { label: "Dialect Focus:", value: "Spoken Gulf / Khaleeji & Colloquial" },
];

export function PersonalizedLearningSection() {
  return (
    <section className="py-space-3xl bg-surface">
      <div className="max-w-container-max mx-auto px-gutter-mobile lg:px-gutter-desktop">
        <div className="text-center max-w-2xl mx-auto mb-space-2xl">
          <span className="mb-space-sm inline-flex items-center rounded-full border border-primary-light/60 bg-primary-light/20 px-3 py-1 font-label-sm text-label-sm font-bold uppercase tracking-[0.16em] text-primary">
            Adaptive Experience
          </span>
          <h2 className="mb-space-md font-headline-lg text-headline-lg font-semibold tracking-tight text-on-surface">
            Your Learning. Your Goals.
          </h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            Arabic Master uses your goals and learning level to help you focus
            on what matters most.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-center">
          <div className="lg:col-span-5 rounded-2xl border border-border/70 bg-surface-container-lowest p-space-lg shadow-[0_10px_28px_rgba(15,23,42,0.06)]">
            <div className="flex items-center justify-between mb-space-md pb-space-sm bg-surface-container-low p-space-sm rounded">
              <div className="flex items-center gap-space-xs">
                <BadgeCheck className="size-5 text-primary" />
                <span className="font-title-md text-title-md text-on-surface">
                  Your Learning Profile
                </span>
              </div>
              <span className="font-label-sm text-label-sm text-primary-container bg-surface-container px-2 py-0.5 rounded">
                Active
              </span>
            </div>

            <div className="space-y-space-sm font-body-sm text-body-sm">
              {profile.map((row) => (
                <div
                  key={row.label}
                  className="flex justify-between items-center py-1"
                >
                  <span className="text-on-surface-variant">{row.label}</span>
                  <span className="text-on-surface font-semibold text-right">
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7 rounded-2xl border border-border/70 bg-surface-container-low p-space-lg">
            <div className="flex items-center justify-between mb-space-md">
              <h4 className="font-title-md text-title-md text-on-surface">
                Recommended for You based on your profile
              </h4>
              <div className="inline-flex items-center gap-1 font-label-sm text-label-sm text-primary">
                <SlidersHorizontal className="size-4" />
                <span>Personalize Your Path</span>
              </div>
            </div>

            <div className="space-y-space-md">
              {recommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="flex items-start gap-space-md rounded-xl border border-border/60 bg-surface-container-lowest p-space-md shadow-sm transition-colors hover:border-primary-light"
                >
                  <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-xl shrink-0">
                    {rec.emoji}
                  </div>
                  <div>
                    <h5 className="font-title-md text-title-md text-on-surface">
                      {rec.title}
                    </h5>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                      {rec.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
