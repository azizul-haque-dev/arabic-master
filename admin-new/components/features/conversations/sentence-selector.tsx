"use client";

import { useEffect, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { ContentSearch } from "@/components/shared/content-search";
import { EmptyState } from "@/components/shared/empty-state";
import { listSentencesAction } from "@/actions/content/sentence-actions";
import type { Sentence } from "@/lib/types/content";
import { cn } from "@/lib/utils";

export function SentenceSelector({
  onSelect,
}: {
  onSelect: (sentence: Sentence) => void;
}) {
  const [query, setQuery] = useState("");
  const [sentences, setSentences] = useState<Sentence[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => {
      setIsLoading(true);
      listSentencesAction({ search: query.trim() || undefined, limit: 20 })
        .then((res) => {
          if (!active) return;
          if (res.success) {
            setSentences(res.data.items);
          } else {
            setSentences([]);
          }
        })
        .catch(() => {
          if (active) setSentences([]);
        })
        .finally(() => {
          if (active) setIsLoading(false);
        });
    }, 250);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query]);

  return (
    <div className="flex flex-col gap-3">
      <ContentSearch
        value={query}
        onChange={setQuery}
        placeholder="Search sentences by Arabic, English, Bangla, or ID..."
      />

      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-5 w-5 animate-spin text-[var(--color-text-muted)]" />
        </div>
      ) : sentences.length > 0 ? (
        <ul className="flex max-h-64 flex-col gap-2 overflow-y-auto">
          {sentences.map((s) => (
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
