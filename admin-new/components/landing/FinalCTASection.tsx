import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function FinalCTASection() {
  return (
    <section className="py-space-3xl bg-surface-container-low">
      <div className="max-w-container-max mx-auto px-gutter-mobile lg:px-gutter-desktop">
        <div className="relative overflow-hidden rounded-2xl border border-primary-light/30 bg-primary-dark p-space-lg text-center text-on-primary shadow-[0_18px_40px_rgba(10,92,70,0.22)] lg:p-space-3xl">
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="font-headline-xl text-headline-xl text-on-primary mb-space-md">
              Ready to Learn Arabic That You Can Actually Use?
            </h2>
            <p className="font-body-lg text-body-lg text-primary-fixed mb-space-xl leading-relaxed">
              Start with the basics, build your confidence, and keep progressing
              one lesson at a time.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-space-md mb-space-md">
              <Link
                href="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-space-xs h-12 px-space-xl rounded-xl bg-surface-container-lowest text-primary font-title-md text-title-md shadow-md transition-all duration-200 hover:bg-primary-light hover:text-primary-dark hover:shadow-lg active:translate-y-[1px]"
              >
                <span>Start Learning Free</span>
                <ArrowRight className="size-5" />
              </Link>
              <Link
                href="/pricing"
                className="w-full sm:w-auto inline-flex items-center justify-center h-12 px-space-xl rounded-xl border border-primary-light/40 bg-primary-container text-on-primary font-title-md text-title-md transition-all duration-200 hover:border-white hover:bg-white hover:text-primary-dark hover:shadow-md active:translate-y-[1px]"
              >
                <span>Explore Pro</span>
              </Link>
            </div>
            <p className="font-body-sm text-body-sm text-primary-fixed">
              No credit card required • Instant access in browser
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
