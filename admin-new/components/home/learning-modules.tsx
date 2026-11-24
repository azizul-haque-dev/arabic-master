import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  MessageSquareText,
  MessagesSquare,
} from "lucide-react";

const MODULES = [
  {
    title: "Words",
    description:
      "Learn common words with Bangla and English meanings and audio.",
    cta: "Browse Words",
    href: "/words",
    icon: BookOpen,
    iconBg: "bg-primary-light text-primary",
  },
  {
    title: "Sentences",
    description:
      "Read phrases for shops, work, restaurants, and daily errands.",
    cta: "Browse Sentences",
    href: "/sentences",
    icon: MessageSquareText,
    iconBg: "bg-amber-100 text-amber-600",
  },
  {
    title: "Conversations",
    description:
      "Follow short Arabic dialogues for common situations.",
    cta: "Browse Conversations",
    href: "/conversations",
    icon: MessagesSquare,
    iconBg: "bg-sky-100 text-sky-600",
  },
  {
    title: "Courses",
    description:
      "Follow courses from beginner through advanced levels.",
    cta: "Browse Courses",
    href: "/courses",
    icon: GraduationCap,
    iconBg: "bg-indigo-100 text-indigo-600",
  },
] as const;

export function LearningModulesSection() {
  return (
    <section className="bg-background py-14 sm:py-16">
      <div className="mx-auto max-w-container-max px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <div className="inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.18em] text-primary">
            <span className="h-px w-6 bg-primary/40" aria-hidden="true" />
            <span>Study Arabic</span>
            <span className="h-px w-6 bg-primary/40" aria-hidden="true" />
          </div>
          <h2 className="mt-2 font-heading text-2xl font-bold tracking-tight text-text sm:text-3xl">
            Choose what to study.
          </h2>
          <p className="mt-2.5 text-base text-text-secondary">
            Start with words or sentences, practice a conversation, or follow a course.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {MODULES.map((mod) => {
            const Icon = mod.icon;
            return (
              <Link
                key={mod.title}
                href={mod.href}
                className="group flex flex-col justify-between rounded-2xl border border-border/80 bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_16px_32px_rgba(15,23,42,0.07)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <div>
                  <span
                    className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${mod.iconBg}`}
                  >
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 font-heading text-lg font-bold text-text">
                    {mod.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                    {mod.description}
                  </p>
                </div>

                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary group-hover:underline">
                  <span>{mod.cta}</span>
                  <ArrowRight
                    className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
