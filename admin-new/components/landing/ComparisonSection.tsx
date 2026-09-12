import { comparisonRows } from "@/lib/mock-data/landing";

export function ComparisonSection() {
  return (
    <section className="py-space-3xl bg-surface-container-low">
      <div className="max-w-container-max mx-auto px-gutter-mobile lg:px-gutter-desktop">
        <div className="text-center max-w-2xl mx-auto mb-space-2xl">
          <span className="mb-space-sm inline-flex items-center rounded-full border border-primary-light/60 bg-primary-light/20 px-3 py-1 font-label-sm text-label-sm font-bold uppercase tracking-[0.16em] text-primary">
            Transparent Comparison
          </span>
          <h2 className="mb-space-md font-headline-lg text-headline-lg font-semibold tracking-tight text-on-surface">
            Choose How You Want to Learn.
          </h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            Clear tiers designed to get you speaking with no hidden friction.
          </p>
        </div>

        <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-border/70 bg-surface-container-lowest shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <caption className="sr-only">
                Feature comparison between Free and Pro membership
              </caption>
              <thead>
                <tr className="bg-surface-container">
                  <th
                    scope="col"
                    className="p-space-md font-title-md text-title-md text-on-surface"
                  >
                    Feature
                  </th>
                  <th
                    scope="col"
                    className="p-space-md font-title-md text-title-md text-on-surface-variant"
                  >
                    Free Tier
                  </th>
                  <th
                    scope="col"
                    className="p-space-md font-title-md text-title-md text-primary font-bold"
                  >
                    Pro Member
                  </th>
                </tr>
              </thead>
              <tbody className="font-body-md text-body-md text-on-surface">
                {comparisonRows.map((row, index) => (
                  <tr
                    key={row.feature}
                    className={
                      index % 2 === 1
                        ? "hover:bg-surface transition-colors bg-surface-container-low"
                        : "hover:bg-surface transition-colors"
                    }
                  >
                    <td className="p-space-md">{row.feature}</td>
                    <td className="p-space-md text-on-surface-variant">
                      {row.free}
                    </td>
                    <td className="p-space-md text-primary font-semibold">
                      {row.pro}
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
