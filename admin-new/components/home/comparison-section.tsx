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

        <div className="mx-auto max-w-6xl overflow-hidden rounded-2xl border border-white/10 bg-surface shadow-[0_18px_50px_rgba(0,0,0,0.24)]">
          <p className="px-4 pt-3 text-xs text-white/60 sm:hidden">
            Swipe horizontally to compare Free and Pro.
          </p>
          <div
            role="region"
            aria-label="Free and Pro feature comparison"
            tabIndex={0}
            className="overflow-x-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
          >
            <table className="w-full min-w-[720px] text-left text-sm sm:text-base">
              <caption className="sr-only">
                Feature comparison between Free and Pro membership
              </caption>
              <thead>
                <tr className="bg-[#302d48]">
                  <th
                    scope="col"
                    className="p-4 font-heading font-bold text-white sm:p-5"
                  >
                    Feature
                  </th>
                  <th
                    scope="col"
                    className="p-4 font-heading font-bold text-white/75 sm:p-5"
                  >
                    Free Tier
                  </th>
                  <th
                    scope="col"
                    className="border-l border-primary-light/30 bg-[#393560] p-4 font-heading font-bold text-primary-light sm:p-5"
                  >
                    <span className="flex flex-wrap items-center gap-2">
                      Pro Member
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="text-sm text-white sm:text-base">
                {comparisonRows.map((row, index) => (
                  <tr
                    key={row.feature}
                    className={index % 2 === 1 ? "bg-[#2a2743]" : "bg-[#242239]"}
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
                    <td className="border-l border-primary-light/20 bg-[#292642] p-4 font-semibold text-white sm:p-5">
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
        className={`size-4 shrink-0 sm:size-5 ${locked ? "text-text-muted" : "text-primary-light"}`}
        aria-hidden="true"
      />
      <span>{value}</span>
    </span>
  );
}
