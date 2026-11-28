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
    cta: "Browse words",
    href: "/words",
    icon: BookOpen,
    iconBg: "bg-primary-light text-primary",
  },
  {
    title: "Sentences",
    description:
      "Read phrases for shops, work, restaurants, and daily errands.",
    cta: "Browse sentences",
    href: "/sentences",
    icon: MessageSquareText,
    iconBg: "bg-primary-light text-primary-dark",
  },
  {
    title: "Conversations",
    description:
      "Follow short Arabic dialogues for common situations.",
    cta: "Browse conversations",
    href: "/conversations",
    icon: MessagesSquare,
    iconBg: "bg-primary-light text-primary-dark",
  },
  {
    title: "Courses",
    description:
      "Follow courses from beginner through advanced levels.",
    cta: "Browse courses",
    href: "/courses",
    icon: GraduationCap,
    iconBg: "bg-primary/10 text-primary",
  },
] as const;

export function LearningModulesSection() {
  return (
    <section className="bg-background py-14 sm:py-16">
      <div className="mx-auto max-w-container-max px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <div className="inline-flex items-center gap-3 text-sm font-medium text-text-secondary">
            <span className="h-px w-6 bg-primary/40" aria-hidden="true" />
            <span>Study Arabic</span>
            <span className="h-px w-6 bg-primary/40" aria-hidden="true" />
          </div>
          <h2 className="mt-2 font-heading text-2xl font-bold tracking-tight text-text sm:text-3xl">
            Choose what to study
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
                className="group flex flex-col justify-between rounded-xl border border-border bg-white p-5 transition-colors hover:bg-background-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <div>
                  <span
                    className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${mod.iconBg}`}
                  >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 font-heading text-lg font-semibold text-text">
                    {mod.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                    {mod.description}
                  </p>
                </div>

                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary group-hover:underline">
                  <span>{mod.cta}</span>
                  <ArrowRight
                    className="h-4 w-4"
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
