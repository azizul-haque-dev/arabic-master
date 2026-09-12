import { testimonials } from "@/lib/mock-data/landing";
import { User } from "lucide-react";

export function TestimonialsSection() {
  return (
    <section className="py-space-3xl bg-surface-container-low">
      <div className="max-w-container-max mx-auto px-gutter-mobile lg:px-gutter-desktop">
        <div className="text-center max-w-2xl mx-auto mb-space-2xl">
          <span className="mb-space-sm inline-flex items-center rounded-full border border-primary-light/60 bg-primary-light/20 px-3 py-1 font-label-sm text-label-sm font-bold uppercase tracking-[0.16em] text-primary">
            Community Feedback
          </span>
          <h2 className="mb-space-md font-headline-lg text-headline-lg font-semibold tracking-tight text-on-surface">
            Real Feedback from Real Learners
          </h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            Read how everyday expatriates and professionals are building
            confidence in spoken Arabic.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg">
          {testimonials.map((testimonial) => (
            <figure
              key={testimonial.id}
              className="flex flex-col justify-between rounded-2xl border border-border/70 bg-surface-container-lowest p-space-lg shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition-all hover:-translate-y-1 hover:border-primary-light hover:shadow-[0_16px_30px_rgba(15,23,42,0.08)]"
            >
              <blockquote className="font-headline-md text-headline-md italic text-on-surface mb-space-lg leading-relaxed">
                &ldquo;{testimonial.quote}&rdquo;
              </blockquote>
              <figcaption className="flex items-center gap-space-xs">
                <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-primary font-bold">
                  <User className="size-[18px]" />
                </div>
                <div>
                  <p className="font-title-md text-title-md text-on-surface leading-tight">
                    Early Learner
                  </p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    {testimonial.role}
                  </p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
