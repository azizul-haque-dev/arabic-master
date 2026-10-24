"use client";

import { useEffect, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { ContentSearch } from "@/components/shared/content-search";
import { EmptyState } from "@/components/shared/empty-state";
import { listConversationsAction } from "@/actions/content/conversation-actions";
import type { Conversation } from "@/lib/types/content";

export function ConversationSelector({
  onSelect,
}: {
  onSelect: (conversation: Conversation) => void;
}) {
  const [query, setQuery] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => {
      setIsLoading(true);
      listConversationsAction({ search: query.trim() || undefined, limit: 20 })
        .then((res) => {
          if (!active) return;
          if (res.success) {
            setConversations(res.data.items);
          } else {
            setConversations([]);
          }
        })
        .catch(() => {
          if (active) setConversations([]);
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
        placeholder="Search conversations by title, topic, or ID..."
      />

      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-5 w-5 animate-spin text-[var(--color-text-muted)]" />
        </div>
      ) : conversations.length > 0 ? (
        <ul className="flex max-h-64 flex-col gap-2 overflow-y-auto">
          {conversations.map((c) => (
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
                <span className="text-xs text-[var(--color-text-muted)]">{c.conversationKey}</span>
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