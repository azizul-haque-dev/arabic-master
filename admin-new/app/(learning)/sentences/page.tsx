import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { MessageSquareText } from "lucide-react";
import { LearningGridSkeleton } from "@/components/learning/learning-grid-skeleton";
import { LearningPageHeader } from "@/components/learning/learning-page-header";
import { AudioPreviewButton } from "@/components/shared/audio-preview-button";
import { getPublicSentences } from "@/lib/data/public-content";

export const metadata: Metadata = {
  title: "Sentences — Daily Spoken Arabic Phrases",
  description:
    "Practice practical daily Arabic sentences used in shops, workplaces, restaurants, and everyday life.",
};

interface SentencesPageProps {
  searchParams?: Promise<{ page?: string; search?: string }>;
}

async function SentencesCatalog({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string; search?: string }>;
}) {
  const params = searchParams ? await searchParams : {};
  const page = Math.max(1, Number(params.page) || 1);
  const search = params.search?.trim() || undefined;
  const { items, meta } = await getPublicSentences({ page, limit: 18, search });

  return (
    <div className="mx-auto max-w-container-max px-4 py-10 sm:px-6 lg:px-8">
      <form method="GET" className="mb-8 flex flex-col gap-3 sm:flex-row">
        <label htmlFor="sentences-search" className="sr-only">
          Search Arabic sentences
        </label>
        <input
          id="sentences-search"
          name="search"
          type="search"
          defaultValue={search ?? ""}
          placeholder="Search daily sentences..."
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
            No published sentences found
          </p>
          <p className="mt-1 text-sm text-text-secondary">
            Try another keyword or check back soon for updated phrases.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {items.map((sentence) => (
            <article
              key={sentence.id}
              className="flex flex-col justify-between rounded-2xl border border-border/80 bg-white p-6 shadow-2xs transition-shadow hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-primary-light px-2.5 py-0.5 text-[11px] font-semibold text-primary-dark">
                      {sentence.category}
                    </span>
                    <span className="rounded-full bg-neutral-bg px-2.5 py-0.5 text-[11px] font-medium text-text-secondary">
                      {sentence.difficulty}
                    </span>
                  </div>
                  <AudioPreviewButton
                    audioUrl={sentence.audioUrl}
                    label={sentence.meaningEn}
                  />
                </div>

                <p
                  dir="rtl"
                  lang="ar"
                  className="mt-4 font-arabic text-2xl font-bold leading-relaxed text-text"
                >
                  {sentence.arabicText}
                </p>
                <p className="mt-1 text-xs font-semibold text-primary">
                  {sentence.pronunciationEn} ·{" "}
                  <span className="font-bengali">{sentence.pronunciationBn}</span>
                </p>
              </div>

              <div className="mt-4 space-y-1 border-t border-border/70 pt-3">
                <p className="text-sm font-semibold text-text">
                  {sentence.meaningEn}
                </p>
                <p className="font-bengali text-sm text-text-secondary">
                  {sentence.meaningBn}
                </p>
              </div>
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
              href={`/sentences?page=${meta.page - 1}${search ? `&search=${encodeURIComponent(search)}` : ""}`}
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
              href={`/sentences?page=${meta.page + 1}${search ? `&search=${encodeURIComponent(search)}` : ""}`}
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

export default function SentencesPage({ searchParams }: SentencesPageProps) {
  return (
    <div>
      <LearningPageHeader
        badge="Daily Expressions"
        title="Useful Spoken Arabic Sentences"
        description="Learn natural Arabic expressions used every day across the Gulf, complete with Bangla and English translations."
        icon={MessageSquareText}
      />
      <Suspense fallback={<LearningGridSkeleton />}>
        <SentencesCatalog searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
