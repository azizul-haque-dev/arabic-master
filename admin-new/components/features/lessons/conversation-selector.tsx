"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { ContentSearch } from "@/components/shared/content-search";
import { EmptyState } from "@/components/shared/empty-state";
import { mockConversations } from "@/lib/mock-data/conversations";
import type { Conversation } from "@/lib/types/content";

export function ConversationSelector({ onSelect }: { onSelect: (conversation: Conversation) => void }) {
    const [query, setQuery] = useState("");

    const results = useMemo(() => {
        if (!query.trim()) return mockConversations.slice(0, 6);
        const needle = query.trim().toLowerCase();
        return mockConversations.filter(
            (c) =>
                c.title.toLowerCase().includes(needle) ||
                c.topic.toLowerCase().includes(needle) ||
                c.conversationKey.toLowerCase().includes(needle),
        );
    }, [query]);

    return (
        <div className="flex flex-col gap-3">
            <ContentSearch value={query} onChange={setQuery} placeholder="Search conversations by title, topic, or ID..." />

            {results.length > 0 ? (
                <ul className="flex max-h-64 flex-col gap-2 overflow-y-auto">
                    {results.map((c) => (
                        <li key={c.id}>
                            <button
                                type="button"
                                onClick={() => onSelect(c)}
                                className="flex w-full items-center justify-between gap-3 rounded-[var(--radius-default)] border border-[var(--color-border)] px-3.5 py-2.5 text-left transition-colors hover:border-[var(--color-border-strong)] hover:bg-[var(--color-neutral-bg)]"
                            >
                                <div>
                                    <p className="font-medium text-[var(--color-text)]">{c.title}</p>
                                    <p className="text-xs text-[var(--color-text-secondary)]">
                                        {c.topic} · {c.turns.length} sentence{c.turns.length !== 1 ? "s" : ""}
                                    </p>
                                </div>
                                <span className="text-xs text-text-muted">{c.conversationKey}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            ) : (
                <EmptyState
                    icon={Search}
                    title="No matching conversations found"
                    description="Create the conversation first from the Conversations screen, then add it here."
                />
            )}
        </div>
    );
}