import { faqItems } from "@/lib/mock-data/landing";
import { FaqAccordionClient } from "./faq-accordion-client";

export function FAQSection() {
  return (
    <section id="faq" className="bg-surface-container-low py-16 sm:py-20">
      <div className="mx-auto max-w-container-max px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-8 max-w-2xl text-center sm:mb-10">
          <span className="inline-flex items-center rounded-full border border-primary/15 bg-primary-light px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-primary-dark">
            FAQs
          </span>
          <h2 className="mt-3 font-heading text-2xl font-bold tracking-tight text-text sm:text-3xl">
            Common questions
          </h2>
          <p className="mt-3 text-base leading-relaxed text-text-secondary">
            About free lessons, courses, and Pro.
          </p>
        </div>

        <div className="mx-auto max-w-3xl">
          <FaqAccordionClient items={faqItems} />
        </div>
      </div>
    </section>
  );
}
