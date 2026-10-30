"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, Link2, Plus, RefreshCw, Trash2, Type } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ContentSearch } from "@/components/shared/content-search";
import { listWordsAction } from "@/actions/content/word-actions";
import {
  resyncSentenceWordsAction,
  updateSentenceAction,
} from "@/actions/content/sentence-actions";
import type { Sentence, Word } from "@/lib/types/content";

export function SentenceWordLinker({
  sentence,
  initialRelatedWord,
  onSentenceUpdated,
}: {
  sentence: Sentence;
  initialRelatedWord?: Word;
  onSentenceUpdated: (updated: Sentence) => void;
}) {
  const router = useRouter();
  const [relatedWord, setRelatedWord] = useState<Word | undefined>(initialRelatedWord);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [wordSearch, setWordSearch] = useState("");
  const [words, setWords] = useState<Word[]>([]);
  const [isLoadingWords, setIsLoadingWords] = useState(false);
  const [selectedWordId, setSelectedWordId] = useState("");
  const [setAsPrimaryRelated, setSetAsPrimaryRelated] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isResyncing, setIsResyncing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const linkedWords = sentence.linkedWords ?? [];

  useEffect(() => {
    setRelatedWord(initialRelatedWord);
  }, [initialRelatedWord]);

  useEffect(() => {
    if (!dialogOpen) return;
    let active = true;
    setIsLoadingWords(true);
    listWordsAction({
      page: 1,
      limit: 50,
      search: wordSearch.trim() || undefined,
    })
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
        if (active) setIsLoadingWords(false);
      });

    return () => {
      active = false;
    };
  }, [dialogOpen, wordSearch]);

  async function handleLinkWord() {
    if (!selectedWordId || isSaving) return;
    setIsSaving(true);
    setError(null);
    setMessage(null);

    try {
      const existingLinks = linkedWords.map((item, idx) => ({
        wordId: item.wordId,
        position: item.position ?? idx + 1,
      }));
      const alreadyLinked = existingLinks.some((w) => w.wordId === selectedWordId);
      const nextWords = alreadyLinked
        ? existingLinks
        : [
            ...existingLinks,
            { wordId: selectedWordId, position: existingLinks.length + 1 },
          ];

      const res = await updateSentenceAction(sentence.id, {
        words: nextWords,
        ...(setAsPrimaryRelated ? { relatedWordId: selectedWordId } : {}),
      });

      if (!res.success) {
        setError(res.error);
        return;
      }

      if (setAsPrimaryRelated) {
        const picked = words.find((w) => w.id === selectedWordId);
        if (picked) setRelatedWord(picked);
      }

      onSentenceUpdated({
        ...res.data,
        arabicText: res.data.arabicText || sentence.arabicText,
      });
      setSelectedWordId("");
      setSetAsPrimaryRelated(false);
      setDialogOpen(false);
      setMessage("Word linked successfully.");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to link word.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleUnlinkWord(wordIdToRemove: string) {
    if (isSaving) return;
    setIsSaving(true);
    setError(null);
    setMessage(null);

    try {
      const nextWords = linkedWords
        .filter((item) => item.wordId !== wordIdToRemove)
        .map((item, idx) => ({
          wordId: item.wordId,
          position: idx + 1,
        }));

      const res = await updateSentenceAction(sentence.id, {
        words: nextWords,
      });

      if (!res.success) {
        setError(res.error);
        return;
      }

      onSentenceUpdated({
        ...res.data,
        arabicText: res.data.arabicText || sentence.arabicText,
      });
      setMessage("Word unlinked.");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to unlink word.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleResyncWords() {
    if (isResyncing) return;
    setIsResyncing(true);
    setError(null);
    setMessage(null);
    try {
      const result = await resyncSentenceWordsAction(sentence.id);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setMessage("Auto word-link resync queued in background.");
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Unable to queue word-link resync.",
      );
    } finally {
      setIsResyncing(false);
    }
  }

  return (
    <section className="rounded-lg border border-border bg-white p-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-1.5 font-heading text-sm font-semibold text-text">
          <Type className="h-3.5 w-3.5 text-secondary" aria-hidden="true" />
          Linked words ({linkedWords.length})
        </h2>
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            disabled={isResyncing}
            onClick={() => void handleResyncWords()}
            title="Automatically resolve and link words from the Arabic text"
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            {isResyncing ? "Syncing…" : "Auto-link"}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setError(null);
              setDialogOpen(true);
            }}
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            Link word
          </Button>
        </div>
      </div>

      {message ? (
        <p role="status" className="mt-2 text-xs text-text-secondary">
          {message}
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="mt-2 text-xs text-error-text">
          {error}
        </p>
      ) : null}

      {relatedWord ? (
        <div className="mt-3">
          <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-text-muted">
            Primary related word
          </p>
          <Link
            href={`/admin/words/${encodeURIComponent(relatedWord.id)}`}
            className="flex items-center justify-between rounded-default border border-primary/30 bg-primary-light/10 px-3 py-2 transition-colors hover:border-primary/50"
          >
            <div>
              <p dir="rtl" lang="ar" className="font-arabic text-base text-text">
                {relatedWord.arabicText}
              </p>
              <p className="text-xs text-text-muted">{relatedWord.meaningEnglish}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-text-muted" aria-hidden="true" />
          </Link>
        </div>
      ) : null}

      {linkedWords.length > 0 ? (
        <ul className="mt-3 flex flex-col gap-2">
          {linkedWords.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-2 rounded-default border border-border px-3 py-2"
            >
              <Link
                href={`/admin/words/${encodeURIComponent(item.wordId)}`}
                className="flex flex-1 items-center justify-between gap-2 hover:text-primary"
              >
                <div>
                  <p dir="rtl" lang="ar" className="font-arabic text-base text-text">
                    {item.arabicText || item.wordKey}
                  </p>
                  <p className="text-xs text-text-muted">
                    {item.meaningEnglish || item.meaningBangla || item.wordKey}
                  </p>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-text-muted" aria-hidden="true" />
              </Link>
              <Button
                variant="ghost"
                size="icon"
                disabled={isSaving}
                aria-label={`Unlink ${item.arabicText || item.wordKey}`}
                onClick={() => void handleUnlinkWord(item.wordId)}
              >
                <Trash2 className="h-3.5 w-3.5 text-text-muted hover:text-error-text" />
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-xs text-text-muted">
          No words linked yet. Click <strong>Link word</strong> to add manually or{" "}
          <strong>Auto-link</strong> to link words from the sentence text.
        </p>
      )}

      <Dialog open={dialogOpen} onOpenChange={(open) => !isSaving && setDialogOpen(open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Link word to {sentence.sentenceType === "SHORT" ? "short sentence" : "sentence"}
            </DialogTitle>
            <DialogDescription>
              Search and select a vocabulary word to link with {sentence.sentenceKey}.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3">
            <div>
              <Label htmlFor="link-word-search">Search words</Label>
              <ContentSearch
                value={wordSearch}
                onChange={setWordSearch}
                placeholder="Search by Arabic, English, or Bangla meaning..."
              />
            </div>

            <div>
              <Label htmlFor="link-word-select">Select word</Label>
              <select
                id="link-word-select"
                value={selectedWordId}
                disabled={isLoadingWords}
                onChange={(event) => setSelectedWordId(event.target.value)}
                className="h-11 w-full rounded-default border border-border-strong bg-white px-3 text-sm text-text focus-visible:outline-none focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/10"
              >
                <option value="">
                  {isLoadingWords ? "Loading words…" : "Choose a word"}
                </option>
                {words.map((word) => (
                  <option key={word.id} value={word.id}>
                    {word.arabicText} — {word.meaningEnglish} ({word.wordKey})
                  </option>
                ))}
              </select>
            </div>

            <label className="flex cursor-pointer items-center gap-2 text-xs text-text-secondary">
              <input
                type="checkbox"
                checked={setAsPrimaryRelated}
                onChange={(event) => setSetAsPrimaryRelated(event.target.checked)}
                className="h-4 w-4 rounded border-border-strong text-primary focus:ring-primary"
              />
              Also set as the primary related word for this sentence
            </label>

            {error ? (
              <p role="alert" className="text-sm text-error-text">
                {error}
              </p>
            ) : null}

            <div className="flex justify-end gap-2 pt-1">
              <Button
                variant="ghost"
                disabled={isSaving}
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                disabled={!selectedWordId || isSaving}
                onClick={() => void handleLinkWord()}
              >
                <Link2 className="h-4 w-4" aria-hidden="true" />
                {isSaving ? "Linking…" : "Link word"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}

