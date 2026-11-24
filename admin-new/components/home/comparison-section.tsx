import { CheckCircle2, Lock } from "lucide-react";
import { comparisonRows } from "@/lib/mock-data/landing";

export function ComparisonSection() {
  return (
    <section id="comparison" className="bg-surface-container-low py-16 sm:py-20">
      <div className="mx-auto max-w-container-max px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-10 max-w-2xl text-center sm:mb-12">
          <span className="inline-flex items-center rounded-full border border-primary/15 bg-primary-light px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-primary-dark">
            Free vs Pro
          </span>
          <h2 className="mt-3 font-heading text-2xl font-bold tracking-tight text-text sm:text-3xl">
            Compare the plans.
          </h2>
          <p className="mt-3 text-base leading-relaxed text-text-secondary sm:text-lg">
            Free includes words, sentences, and beginner conversations. Pro adds
            the full curriculum and advanced levels.
          </p>
        </div>

        <div className="mx-auto max-w-5xl overflow-hidden rounded-2xl border border-border bg-white shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
          <p className="px-4 pt-3 text-xs text-text-muted sm:hidden">
            Swipe horizontally to compare Free and Pro.
          </p>
          <div
            role="region"
            aria-label="Free and Pro feature comparison"
            tabIndex={0}
            className="overflow-x-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
          >
            <table className="w-full min-w-[680px] text-left">
              <caption className="sr-only">
                Feature comparison between Free and Pro membership
              </caption>
              <thead>
                <tr className="bg-surface-container">
                  <th
                    scope="col"
                    className="p-4 font-heading text-sm font-bold text-text sm:p-5"
                  >
                    Feature
                  </th>
                  <th
                    scope="col"
                    className="p-4 font-heading text-sm font-bold text-text-secondary sm:p-5"
                  >
                    Free Tier
                  </th>
                  <th
                    scope="col"
                    className="bg-primary-light/60 p-4 font-heading text-sm font-bold text-primary-dark sm:p-5"
                  >
                    <span className="flex flex-wrap items-center gap-2">
                      Pro Member
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="text-sm text-text">
                {comparisonRows.map((row, index) => (
                  <tr
                    key={row.feature}
                    className={index % 2 === 1 ? "bg-surface-container-low/70" : "bg-white"}
                  >
                    <th
                      scope="row"
                      className="p-4 text-left font-semibold sm:p-5"
                    >
                      {row.feature}
                    </th>
                    <td className="p-4 sm:p-5">
                      <FeatureValue value={row.free} locked={row.freeLocked} />
                    </td>
                    <td className="bg-primary-light/25 p-4 font-semibold text-primary-dark sm:p-5">
                      <FeatureValue value={row.pro} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureValue({ value, locked = false }: { value: string; locked?: boolean }) {
  const Icon = locked ? Lock : CheckCircle2;

  return (
    <span className="inline-flex items-center gap-2">
      <Icon
        className={`size-4 shrink-0 ${locked ? "text-text-muted" : "text-primary"}`}
        aria-hidden="true"
      />
      <span>{value}</span>
    </span>
  );
}
