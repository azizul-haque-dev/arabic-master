import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpenCheck, Crown, GraduationCap } from "lucide-react";
import { LearningGridSkeleton } from "@/components/learning/learning-grid-skeleton";
import { LearningPageHeader } from "@/components/learning/learning-page-header";
import { getPublicCourses } from "@/lib/data/public-content";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Courses — Structured Spoken Arabic Paths",
  description:
    "Follow structured Arabic Master courses from Beginner to Advanced with organized sections and bite-sized lessons.",
};

interface CoursesPageProps {
  searchParams?: Promise<{ page?: string; type?: string }>;
}

async function CoursesCatalog({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string; type?: string }>;
}) {
  const params = searchParams ? await searchParams : {};
  const page = Math.max(1, Number(params.page) || 1);
  const typeFilter = params.type === "FREE" || params.type === "PRO" ? params.type : undefined;
  const { items } = await getPublicCourses({ page, limit: 18 });

  const filtered = typeFilter
    ? items.filter((course) => course.courseType === typeFilter)
    : items;

  return (
    <div className="mx-auto max-w-container-max px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-center gap-2">
        {[
          { label: "All Courses", href: "/courses", active: !typeFilter },
          { label: "Free Courses", href: "/courses?type=FREE", active: typeFilter === "FREE" },
          { label: "Pro Courses", href: "/courses?type=PRO", active: typeFilter === "PRO" },
        ].map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "rounded-xl px-4 py-2 text-sm font-semibold transition-colors",
              tab.active
                ? "bg-primary text-white"
                : "border border-border bg-white text-text-secondary hover:bg-neutral-bg",
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-border bg-white p-10 text-center">
          <p className="font-heading text-lg font-semibold text-text">
            No published courses available in this category yet
          </p>
          <p className="mt-1 text-sm text-text-secondary">
            Explore our vocabulary words and daily sentences while new structured
            courses are published.
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <Link
              href="/words"
              className="inline-flex h-10 items-center rounded-xl bg-primary px-5 text-sm font-semibold text-white hover:bg-primary-dark"
            >
              Explore Words
            </Link>
            <Link
              href="/sentences"
              className="inline-flex h-10 items-center rounded-xl border border-border bg-white px-5 text-sm font-semibold text-text hover:bg-neutral-bg"
            >
              Explore Sentences
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((course) => (
            <article
              key={course.id}
              className="flex flex-col justify-between rounded-2xl border border-border/80 bg-white p-6 shadow-2xs transition-shadow hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-full bg-neutral-bg px-2.5 py-0.5 text-[11px] font-semibold text-text-secondary">
                    {course.level}
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold",
                      course.courseType === "PRO"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-primary-light text-primary-dark",
                    )}
                  >
                    {course.courseType === "PRO" && (
                      <Crown className="h-3 w-3" aria-hidden="true" />
                    )}
                    {course.courseType}
                  </span>
                </div>

                <h2 className="mt-4 font-heading text-xl font-bold text-text">
                  {course.title}
                </h2>
                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-text-secondary">
                  {course.description}
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-border/70 pt-4 text-xs text-text-muted">
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <BookOpenCheck className="h-4 w-4 text-primary" aria-hidden="true" />
                  {course.sectionCount} sections · {course.lessonCount} lessons
                </span>
                <Link
                  href={course.courseType === "PRO" ? "/pricing" : "/register"}
                  className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                >
                  <span>Start</span>
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CoursesPage({ searchParams }: CoursesPageProps) {
  return (
    <div>
      <LearningPageHeader
        badge="Structured Curriculum"
        title="Spoken Arabic Courses"
        description="Follow organized beginner-to-advanced learning tracks built around real-life situations in Arabic-speaking countries."
        icon={GraduationCap}
      />
      <Suspense fallback={<LearningGridSkeleton />}>
        <CoursesCatalog searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
