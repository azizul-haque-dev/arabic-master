"use client";

import { ContentSearch } from "@/components/shared/content-search";
import { EmptyState } from "@/components/shared/empty-state";
import { mockSentences } from "@/lib/mock-data/sentences";
import type { Sentence } from "@/lib/types/content";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";

/**
 * Conversations connect to Sentences only — this selector intentionally
 * has no path to an ArabicEntity, enforcing that relationship rule in
 * the UI itself rather than relying on documentation.
 */
export function SentenceSelector({
  onSelect,
}: {
  onSelect: (sentence: Sentence) => void;
}) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    if (!query.trim()) return mockSentences.slice(0, 6);
    const needle = query.trim();
    return mockSentences.filter(
      (s) =>
        s.arabicText.includes(needle) ||
        s.meaningEnglish.toLowerCase().includes(needle.toLowerCase()) ||
        s.meaningBangla.includes(needle) ||
        s.sentenceKey.toLowerCase().includes(needle.toLowerCase()),
    );
  }, [query]);

  return (
    <div className="flex flex-col gap-3">
      <ContentSearch
        value={query}
        onChange={setQuery}
        placeholder="Search sentences by Arabic, English, Bangla, or ID..."
      />

      {results.length > 0 ? (
        <ul className="flex max-h-64 flex-col gap-2 overflow-y-auto">
          {results.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => onSelect(s)}
                className={cn(
                  "flex w-full items-center justify-between gap-3 rounded-[var(--radius-default)] border border-[var(--color-border)] px-3.5 py-2.5 text-left transition-colors hover:border-[var(--color-border-strong)] hover:bg-[var(--color-neutral-bg)]",
                )}
              >
                <div>
                  <p
                    dir="rtl"
                    lang="ar"
                    className="font-[var(--font-arabic)] text-lg text-[var(--color-text)]"
                  >
                    {s.arabicText}
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    {s.meaningEnglish}
                  </p>
                </div>
                <span className="text-xs text-[var(--color-text-muted)]">
                  {s.sentenceKey}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={Search}
          title="No matching sentences found"
          description="Create the sentence first from the Sentences screen, then add it here."
        />
      )}
    </div>
  );
}
