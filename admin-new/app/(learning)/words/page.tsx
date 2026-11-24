import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { LearningGridSkeleton } from "@/components/learning/learning-grid-skeleton";
import { LearningPageHeader } from "@/components/learning/learning-page-header";
import { AudioPreviewButton } from "@/components/shared/audio-preview-button";
import { getPublicWords } from "@/lib/data/public-content";

export const metadata: Metadata = {
  title: "Words — Spoken Arabic Vocabulary",
  description:
    "Explore essential spoken Arabic words with pronunciation, Bangla and English meanings, and everyday usage notes.",
};

interface WordsPageProps {
  searchParams?: Promise<{ page?: string; search?: string }>;
}

async function WordsCatalog({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string; search?: string }>;
}) {
  const params = searchParams ? await searchParams : {};
  const page = Math.max(1, Number(params.page) || 1);
  const search = params.search?.trim() || undefined;
  const { items, meta } = await getPublicWords({ page, limit: 18, search });

  return (
    <div className="mx-auto max-w-container-max px-4 py-10 sm:px-6 lg:px-8">
      <form method="GET" className="mb-8 flex flex-col gap-3 sm:flex-row">
        <label htmlFor="words-search" className="sr-only">
          Search Arabic words
        </label>
        <input
          id="words-search"
          name="search"
          type="search"
          defaultValue={search ?? ""}
          placeholder="Search Arabic, English, or Bangla meaning..."
          className="h-11 w-full max-w-md rounded-xl border border-border bg-white px-4 text-sm text-text placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <button
          type="submit"
          className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
        >
          Search
        </button>
      </form>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-border bg-white p-10 text-center">
          <p className="font-heading text-lg font-semibold text-text">
            No published words found
          </p>
          <p className="mt-1 text-sm text-text-secondary">
            Try clearing your search or check back as new lessons are published.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((word) => (
            <article
              key={word.id}
              className="flex flex-col justify-between rounded-2xl border border-border/80 bg-white p-5 shadow-2xs transition-shadow hover:shadow-md"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <span className="rounded-full bg-neutral-bg px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
                    {word.category}
                  </span>
                  <AudioPreviewButton
                    audioUrl={word.audioUrl}
                    label={word.meaningEn}
                  />
                </div>

                <p
                  dir="rtl"
                  lang="ar"
                  className="mt-3 font-arabic text-3xl font-bold leading-snug text-text"
                >
                  {word.arabicText}
                </p>
                <p className="mt-1 text-xs font-semibold text-primary">
                  {word.pronunciationEn} ·{" "}
                  <span className="font-bengali">{word.pronunciationBn}</span>
                </p>

                <div className="mt-3 space-y-1 border-t border-border/70 pt-3">
                  <p className="text-sm font-semibold text-text">{word.meaningEn}</p>
                  <p className="font-bengali text-sm text-text-secondary">
                    {word.meaningBn}
                  </p>
                </div>
              </div>

              {word.whenToUseEn && (
                <p className="mt-3 rounded-xl bg-neutral-bg/70 px-3 py-2 text-xs text-text-secondary">
                  {word.whenToUseEn}
                </p>
              )}
            </article>
          ))}
        </div>
      )}

      {meta.totalPages > 1 && (
        <nav
          aria-label="Pagination"
          className="mt-8 flex items-center justify-center gap-3"
        >
          {meta.page > 1 && (
            <Link
              href={`/words?page=${meta.page - 1}${search ? `&search=${encodeURIComponent(search)}` : ""}`}
              className="rounded-xl border border-border bg-white px-4 py-2 text-sm font-medium text-text hover:bg-neutral-bg"
            >
              Previous
            </Link>
          )}
          <span className="text-sm text-text-muted">
            Page {meta.page} of {meta.totalPages}
          </span>
          {meta.page < meta.totalPages && (
            <Link
              href={`/words?page=${meta.page + 1}${search ? `&search=${encodeURIComponent(search)}` : ""}`}
              className="rounded-xl border border-border bg-white px-4 py-2 text-sm font-medium text-text hover:bg-neutral-bg"
            >
              Next
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}

export default function WordsPage({ searchParams }: WordsPageProps) {
  return (
    <div>
      <LearningPageHeader
        badge="Vocabulary Library"
        title="Essential Spoken Arabic Words"
        description="Build your everyday vocabulary with clear pronunciation, Bangla and English meanings, and practical usage context."
        icon={BookOpen}
      />
      <Suspense fallback={<LearningGridSkeleton />}>
        <WordsCatalog searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
