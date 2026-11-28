import { CheckCircle2, Lock } from "lucide-react";
import { comparisonRows } from "@/lib/mock-data/landing";

export function ComparisonSection() {
  return (
    <section id="comparison" className="bg-surface-container-low py-16 sm:py-20">
      <div className="mx-auto max-w-container-max px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-10 max-w-2xl text-center sm:mb-12">
          <span className="inline-flex items-center rounded-md bg-primary-light px-2.5 py-1 text-sm font-medium text-primary-dark">
            Free vs Pro
          </span>
          <h2 className="mt-3 font-heading text-2xl font-bold tracking-tight text-text sm:text-3xl">
            Compare the plans
          </h2>
          <p className="mt-3 text-base leading-relaxed text-text-secondary sm:text-lg">
            Free includes words, sentences, and beginner conversations. Pro adds
            the full curriculum and advanced levels.
          </p>
        </div>

        <div className="mx-auto max-w-6xl overflow-hidden rounded-xl border border-border bg-white">
          <p className="px-4 pt-3 text-xs text-text-muted sm:hidden">
            Swipe horizontally to compare Free and Pro
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
                <tr className="bg-neutral-bg">
                  <th
                    scope="col"
                    className="p-4 font-heading font-semibold text-text sm:p-5"
                  >
                    Feature
                  </th>
                  <th
                    scope="col"
                    className="p-4 font-heading font-semibold text-text-secondary sm:p-5"
                  >
                    Free plan
                  </th>
                  <th
                    scope="col"
                    className="border-l border-primary/15 bg-primary-light p-4 font-heading font-semibold text-primary-dark sm:p-5"
                  >
                    <span className="flex flex-wrap items-center gap-2">
                      Pro plan
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="text-sm text-text sm:text-base">
                {comparisonRows.map((row, index) => (
                  <tr
                    key={row.feature}
                    className={index % 2 === 1 ? "bg-background-soft" : "bg-white"}
                  >
                    <th
                      scope="row"
                      className="p-4 text-left font-medium sm:p-5"
                    >
                      {row.feature}
                    </th>
                    <td className="p-4 sm:p-5">
                      <FeatureValue value={row.free} locked={row.freeLocked} />
                    </td>
                    <td className="border-l border-primary/10 bg-primary-light/40 p-4 font-medium text-text sm:p-5">
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
        className={`size-4 shrink-0 sm:size-5 ${locked ? "text-text-muted" : "text-primary"}`}
        aria-hidden="true"
      />
      <span>{value}</span>
    </span>
  );
}
