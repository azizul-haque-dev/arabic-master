"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { ContentSearch } from "@/components/shared/content-search";
import { EmptyState } from "@/components/shared/empty-state";
import { mockWords } from "@/lib/mock-data/words";
import type { Word } from "@/lib/types/content";

export function WordSelector({ onSelect }: { onSelect: (word: Word) => void }) {
    const [query, setQuery] = useState("");

    const results = useMemo(() => {
        if (!query.trim()) return mockWords.slice(0, 6);
        const needle = query.trim();
        return mockWords.filter(
            (w) =>
                w.arabicText.includes(needle) ||
                w.meaningEnglish.toLowerCase().includes(needle.toLowerCase()) ||
                w.meaningBangla.includes(needle) ||
                w.wordKey.toLowerCase().includes(needle.toLowerCase()),
        );
    }, [query]);

    return (
        <div className="flex flex-col gap-3">
            <ContentSearch value={query} onChange={setQuery} placeholder="Search words by Arabic, English, Bangla, or ID..." />

            {results.length > 0 ? (
                <ul className="flex max-h-64 flex-col gap-2 overflow-y-auto">
                    {results.map((w) => (
                        <li key={w.id}>
                            <button
                                type="button"
                                onClick={() => onSelect(w)}
                                className="flex w-full items-center justify-between gap-3 rounded-[var(--radius-default)] border border-[var(--color-border)] px-3.5 py-2.5 text-left transition-colors hover:border-[var(--color-border-strong)] hover:bg-[var(--color-neutral-bg)]"
                            >
                                <div>
                                    <p dir="rtl" lang="ar" className="font-[var(--font-arabic)] text-lg text-[var(--color-text)]">
                                        {w.arabicText}
                                    </p>
                                    <p className="text-xs text-[var(--color-text-secondary)]">{w.meaningEnglish}</p>
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