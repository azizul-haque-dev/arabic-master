"use client";

import { useEffect, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { ContentSearch } from "@/components/shared/content-search";
import { EmptyState } from "@/components/shared/empty-state";
import { listWordsAction } from "@/actions/content/word-actions";
import type { Word } from "@/lib/types/content";

export function WordSelector({ onSelect }: { onSelect: (word: Word) => void }) {
  const [query, setQuery] = useState("");
  const [words, setWords] = useState<Word[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => {
      setIsLoading(true);
      listWordsAction({ search: query.trim() || undefined, limit: 20 })
        .then((res) => {
          if (!active) return;
          if (res.success) {
            setWords(res.data.items);
          } else {
            setWords([]);
          }
        })
        .catch(() => {
          if (active) setWords([]);
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
        placeholder="Search words by Arabic, English, Bangla, or ID..."
      />

      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-5 w-5 animate-spin text-[var(--color-text-muted)]" />
        </div>
      ) : words.length > 0 ? (
        <ul className="flex max-h-64 flex-col gap-2 overflow-y-auto">
          {words.map((w) => (
            <li key={w.id}>
              <button
                type="button"
                onClick={() => onSelect(w)}
                className="flex w-full items-center justify-between gap-3 rounded-[var(--radius-default)] border border-[var(--color-border)] px-3.5 py-2.5 text-left transition-colors hover:border-[var(--color-border-strong)] hover:bg-[var(--color-neutral-bg)]"
              >
                <div>
                  <p
                    dir="rtl"
                    lang="ar"
                    className="font-[var(--font-arabic)] text-lg text-[var(--color-text)]"
                  >
                    {w.arabicText}
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    {w.meaningEnglish}
                  </p>
                </div>
                <span className="text-xs text-[var(--color-text-muted)]">{w.wordKey}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={Search}
          title="No matching words found"
          description="Create the word first from the Words screen, then add it here."
        />
      )}
    </div>
  );
}