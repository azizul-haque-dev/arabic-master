import type { ReactNode } from "react";

import { AuthTabs } from "@/components/auth/auth-tabs";

interface CenteredAuthCardProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}

export function CenteredAuthCard({
  title,
  subtitle,
  children,
  footer,
}: CenteredAuthCardProps) {
  return (
    <main className="min-h-screen bg-(--am-paper) px-4 py-6 sm:px-6 sm:py-10 lg:flex lg:items-center lg:justify-center">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-2xl border border-(--am-line) bg-white shadow-[0_20px_60px_rgba(24,35,31,0.08)] lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="auth-grid-pattern relative hidden min-h-170 flex-col justify-between overflow-hidden bg-(--am-ink) p-10 text-white lg:flex xl:p-14">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-(--am-moss) shadow-lg shadow-black/15">
                <span className="font-serif text-xl">ا</span>
              </div>
              <span className="text-lg font-semibold tracking-tight">
                Arabic Master
              </span>
            </div>
            <div className="mt-24 max-w-sm">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#9bc9b9]">
                Admin workspace
              </p>
              <h2 className="mt-4 font-serif text-4xl leading-tight xl:text-5xl">
                Build a clearer Arabic learning experience.
              </h2>
              <p className="mt-5 text-base leading-7 text-white/65">
                Manage content, guide learners, and keep every lesson moving
                forward from one focused workspace.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm text-white/55">
            <span className="h-2 w-2 rounded-full bg-[#78bea8]" />
            <span>Simple tools for thoughtful learning</span>
          </div>
        </aside>

        <section className="px-5 py-8 sm:px-10 sm:py-12 lg:px-14 lg:py-16">
          <div className="mx-auto w-full max-w-md">
            <div className="flex items-center gap-3 lg:hidden">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-(--am-moss) text-white">
                <span className="font-serif text-lg">ا</span>
              </div>
              <span className="font-semibold tracking-tight text-(--am-ink)">
                Arabic Master
              </span>
            </div>
            <div className="mt-9 lg:mt-0">
              <p className="text-sm font-medium text-(--am-moss)">
                Welcome back
              </p>
              <h1 className="mt-2 font-serif text-3xl leading-tight text-(--am-ink)">
                {title}
              </h1>
              <p className="mt-3 max-w-sm text-sm leading-6 text-(--am-text-muted)">
                {subtitle}
              </p>
            </div>

            <div className="mt-8">
              <AuthTabs />
            </div>

            <div className="mt-8">{children}</div>

            <p className="mt-8 text-center text-sm text-(--am-text-muted)">
              {footer}
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
