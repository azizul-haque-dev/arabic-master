"use client";

import { SentenceSelector } from "@/components/features/conversations/sentence-selector";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { mockSentences } from "@/lib/mock-data/sentences";
import type { ConversationTurn } from "@/lib/types/content";
import {
  ChevronDown,
  ChevronUp,
  GripVertical,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";

export function ConversationTurnBuilder({
  turns,
  onChange,
}: {
  turns: ConversationTurn[];
  onChange: (turns: ConversationTurn[]) => void;
}) {
  const [addOpen, setAddOpen] = useState(false);

  function renumber(list: ConversationTurn[]) {
    return list.map((t, i) => ({ ...t, order: i + 1 }));
  }

  function addTurn(sentenceId: string) {
    const newTurn: ConversationTurn = {
      id: crypto.randomUUID(),
      order: turns.length + 1,
      speaker: turns.length % 2 === 0 ? "Customer" : "Seller",
      sentenceId,
    };
    onChange(renumber([...turns, newTurn]));
    setAddOpen(false);
  }

  function removeTurn(id: string) {
    onChange(renumber(turns.filter((t) => t.id !== id)));
  }

  function moveTurn(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= turns.length) return;
    const next = [...turns];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(renumber(next));
  }

  function updateSpeaker(id: string, speaker: string) {
    onChange(turns.map((t) => (t.id === id ? { ...t, speaker } : t)));
  }

  return (
    <div className="flex flex-col gap-3">
      {turns.length === 0 ? (
        <div className="rounded-[var(--radius-default)] border border-dashed border-[var(--color-border-strong)] bg-[var(--color-neutral-bg)] px-4 py-8 text-center text-sm text-[var(--color-text-muted)]">
          No turns yet. Add a sentence to start building this conversation.
        </div>
      ) : (
        <ol className="flex flex-col gap-2">
          {turns.map((turn, index) => {
            const sentence = mockSentences.find(
              (s) => s.id === turn.sentenceId,
            );
            return (
              <li
                key={turn.id}
                className="flex items-start gap-3 rounded-[var(--radius-default)] border border-[var(--color-border)] bg-white p-3.5"
              >
                <div className="flex flex-col items-center gap-1 pt-1">
                  <GripVertical
                    className="h-4 w-4 text-[var(--color-text-muted)]"
                    aria-hidden="true"
                  />
                  <span className="text-xs font-semibold text-[var(--color-text-muted)]">
                    {turn.order}
                  </span>
                </div>

                <div className="flex-1">
                  <Input
                    value={turn.speaker}
                    onChange={(e) => updateSpeaker(turn.id, e.target.value)}
                    placeholder="Speaker (e.g. Customer)"
                    className="mb-2 h-9 max-w-48 text-sm"
                    aria-label={`Speaker for turn ${turn.order}`}
                  />
                  {sentence ? (
                    <div>
                      <p
                        dir="rtl"
                        lang="ar"
                        className="font-[var(--font-arabic)] text-xl leading-relaxed text-[var(--color-text)]"
                      >
                        {sentence.arabicText}
                      </p>
                      <p className="text-xs text-[var(--color-text-secondary)]">
                        {sentence.meaningEnglish}
                      </p>
                      <p className="mt-0.5 text-[11px] text-[var(--color-text-muted)]">
                        {sentence.sentenceKey}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-[var(--color-error-text)]">
                      Sentence not found.
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => moveTurn(index, -1)}
                    disabled={index === 0}
                    aria-label={`Move turn ${turn.order} up`}
                    className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-text-muted)] hover:bg-[var(--color-neutral-bg)] disabled:opacity-30"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveTurn(index, 1)}
                    disabled={index === turns.length - 1}
                    aria-label={`Move turn ${turn.order} down`}
                    className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-text-muted)] hover:bg-[var(--color-neutral-bg)] disabled:opacity-30"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeTurn(turn.id)}
                    aria-label={`Remove turn ${turn.order}`}
                    className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-text-muted)] hover:bg-[var(--color-error-bg)] hover:text-[var(--color-error-text)]"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            );
          })}
        </ol>
      )}

      <button
        type="button"
        onClick={() => setAddOpen(true)}
        className="flex items-center justify-center gap-2 rounded-[var(--radius-default)] border border-dashed border-[var(--color-border-strong)] px-3.5 py-2.5 text-sm font-medium text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary-light)]/15"
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
        Add sentence
      </button>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add a sentence</DialogTitle>
            <DialogDescription>
              Search existing sentences. Conversations are built from sentences
              — not Arabic entities directly.
            </DialogDescription>
          </DialogHeader>
          <SentenceSelector onSelect={(s) => addTurn(s.id)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
