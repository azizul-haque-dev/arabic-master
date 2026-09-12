import { CheckCircle2, Circle, Flame } from "lucide-react";

const stats = [
  { emoji: "🔥", value: "7 Days", label: "Current Streak" },
  { emoji: "⭐", value: "1,240", label: "Total XP" },
  { emoji: "🏆", value: "Level 8", label: "Proficiency" },
  { emoji: "🎯", value: "10 min", label: "Daily Goal" },
];

const week = [
  { day: "Mon", state: "done" },
  { day: "Tue", state: "done" },
  { day: "Wed", state: "done" },
  { day: "Thu", state: "done" },
  { day: "Fri", state: "done" },
  { day: "Sat", state: "current" },
  { day: "Sun", state: "pending" },
] as const;

export function ProgressSection() {
  return (
    <section className="py-space-3xl bg-surface-container-low">
      <div className="max-w-container-max mx-auto px-gutter-mobile lg:px-gutter-desktop">
        <div className="text-center max-w-2xl mx-auto mb-space-2xl">
          <span className="mb-space-sm inline-flex items-center rounded-full border border-primary-light/60 bg-primary-light/20 px-3 py-1 font-label-sm text-label-sm font-bold uppercase tracking-[0.16em] text-primary">
            Proven Habits
          </span>
          <h2 className="mb-space-md font-headline-lg text-headline-lg font-semibold tracking-tight text-on-surface">
            Stay Consistent. See Yourself Improve.
          </h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            Small daily sessions become real progress when you stay consistent.
          </p>
        </div>

        <div className="mx-auto max-w-4xl rounded-2xl border border-border/70 bg-surface-container-lowest p-space-lg shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-sm mb-space-lg">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-border/60 bg-surface-container-low p-space-md text-center"
              >
                <span className="text-2xl block mb-1">{stat.emoji}</span>
                <span className="font-title-lg text-title-lg text-on-surface font-bold block">
                  {stat.value}
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant block">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-border/60 bg-surface p-space-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm mb-space-md">
              <div>
                <span className="font-title-md text-title-md text-on-surface">
                  68% Weekly Progress
                </span>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  5 of 7 days completed this week
                </p>
              </div>
              <div className="w-full sm:w-48 bg-surface-container h-2 rounded-full overflow-hidden">
                <div
                  className="bg-secondary-container h-full rounded-full"
                  style={{ width: "68%" }}
                />
              </div>
            </div>

            <div className="grid grid-cols-7 gap-space-xs text-center font-label-md text-label-md">
              {week.map((item) => (
                <div
                  key={item.day}
                  className={
                    item.state === "current"
                      ? "p-space-xs rounded bg-secondary-fixed text-on-secondary-fixed flex flex-col items-center shadow-2xs"
                      : item.state === "pending"
                        ? "p-space-xs rounded bg-surface-container-low text-on-surface-variant flex flex-col items-center opacity-60"
                        : "p-space-xs rounded bg-surface-container text-primary flex flex-col items-center"
                  }
                >
                  <span
                    className={
                      item.state === "current"
                        ? "text-[11px] mb-1 font-bold"
                        : "text-[11px] text-on-surface-variant mb-1"
                    }
                  >
                    {item.day}
                  </span>
                  {item.state === "done" && (
                    <CheckCircle2 className="size-[18px]" />
                  )}
                  {item.state === "current" && (
                    <Flame className="size-[18px]" />
                  )}
                  {item.state === "pending" && (
                    <Circle className="size-[18px]" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
