"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  ChevronRight,
  Link2,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
  Type,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ContentSearch } from "@/components/shared/content-search";
import { generateWordAction, listWordsAction } from "@/actions/content/word-actions";
import {
  getSentenceAction,
  resyncSentenceWordsAction,
  updateSentenceAction,
} from "@/actions/content/sentence-actions";
import type { Sentence, SentenceLinkedWord, Word } from "@/lib/types/content";
import { cn } from "@/lib/utils";

function normalizeArabicToken(text: string): string {
  return text
    .replace(/[\u064B-\u0652]/g, "")
    .replace(/[،,.!؟?؛:"'()[\]{}«»\-–—]/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function extractSentenceTokens(arabicText: string): string[] {
  if (!arabicText) return [];
  return arabicText
    .replace(/[،,.!؟?؛:"'()[\]{}«»\-–—]/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

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
  const [manualMode, setManualMode] = useState<"existing" | "custom">("existing");
  const [wordSearch, setWordSearch] = useState("");
  const [words, setWords] = useState<Word[]>([]);
  const [isLoadingWords, setIsLoadingWords] = useState(false);
  const [selectedWordId, setSelectedWordId] = useState("");
  const [customWordText, setCustomWordText] = useState("");
  const [setAsPrimaryRelated, setSetAsPrimaryRelated] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [linkingTokenKey, setLinkingTokenKey] = useState<string | null>(null);
  const [removingWordId, setRemovingWordId] = useState<string | null>(null);
  const [isResyncing, setIsResyncing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const linkedWords = sentence.linkedWords ?? [];
  const sentenceTokens = extractSentenceTokens(sentence.arabicText);

  useEffect(() => {
    setRelatedWord(initialRelatedWord);
  }, [initialRelatedWord]);

  useEffect(() => {
    if (!dialogOpen || manualMode !== "existing") return;
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
  }, [dialogOpen, manualMode, wordSearch]);

  function findLinkedWordForToken(
    token: string,
    position: number,
  ): SentenceLinkedWord | undefined {
    const normalizedToken = normalizeArabicToken(token);
    if (!normalizedToken) return undefined;
    return linkedWords.find(
      (item) =>
        (item.arabicText &&
          normalizeArabicToken(item.arabicText) === normalizedToken) ||
        item.position === position,
    );
  }

  function pollSentenceForNewWordMeaning() {
    let attempts = 0;
    const interval = setInterval(async () => {
      attempts += 1;
      try {
        const fresh = await getSentenceAction(sentence.id);
        if (fresh.success && fresh.data) {
          const allWordsHaveMeaning = (fresh.data.linkedWords ?? []).every(
            (w) => Boolean(w.meaningEnglish?.trim()) || Boolean(w.meaningBangla?.trim()),
          );
          onSentenceUpdated({
            ...fresh.data,
            arabicText: fresh.data.arabicText || sentence.arabicText,
          });
          if (allWordsHaveMeaning || attempts >= 10) {
            clearInterval(interval);
            if (allWordsHaveMeaning) {
              setMessage("Word linked and AI meaning generated!");
            }
            router.refresh();
          }
        }
      } catch {
        if (attempts >= 10) {
          clearInterval(interval);
        }
      }
    }, 2000);
  }

  async function handleLinkSentenceToken(token: string, position: number) {
    const tokenKey = `${position}:${token}`;
    if (linkingTokenKey || isSaving) return;
    setLinkingTokenKey(tokenKey);
    setError(null);
    setMessage(null);

    try {
      const wordRes = await generateWordAction(token);
      if (!wordRes.success) {
        setError(wordRes.error);
        return;
      }

      const resolvedWord = wordRes.data;
      const isNewlyCreatedByAi =
        !resolvedWord.meaningEnglish?.trim() && !resolvedWord.meaningBangla?.trim();

      const existingLinks = linkedWords.map((item, idx) => ({
        wordId: item.wordId,
        position: item.position ?? idx + 1,
      }));
      const alreadyLinked = existingLinks.some((w) => w.wordId === resolvedWord.id);
      const nextWords = alreadyLinked
        ? existingLinks
        : [...existingLinks, { wordId: resolvedWord.id, position }];

      const updateRes = await updateSentenceAction(sentence.id, {
        words: nextWords,
      });

      if (!updateRes.success) {
        setError(updateRes.error);
        return;
      }

      onSentenceUpdated({
        ...updateRes.data,
        arabicText: updateRes.data.arabicText || sentence.arabicText,
      });

      if (isNewlyCreatedByAi) {
        setMessage(
          `"${token}" was not in vocabulary — created with AI and linked! Generating meaning…`,
        );
        pollSentenceForNewWordMeaning();
      } else {
        setMessage(`"${token}" linked successfully.`);
      }
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to link word.");
    } finally {
      setLinkingTokenKey(null);
    }
  }

  async function handleManualSubmit() {
    if (isSaving) return;
    setIsSaving(true);
    setError(null);
    setMessage(null);

    try {
      let targetWordId = selectedWordId;
      let isNewlyCreatedByAi = false;

      if (manualMode === "custom") {
        const trimmed = customWordText.trim();
        if (!trimmed) {
          setError("Please enter a word to create and link.");
          setIsSaving(false);
          return;
        }
        const wordRes = await generateWordAction(trimmed);
        if (!wordRes.success) {
          setError(wordRes.error);
          setIsSaving(false);
          return;
        }
        targetWordId = wordRes.data.id;
        isNewlyCreatedByAi =
          !wordRes.data.meaningEnglish?.trim() && !wordRes.data.meaningBangla?.trim();
        if (setAsPrimaryRelated) {
          setRelatedWord(wordRes.data);
        }
      } else {
        if (!targetWordId) {
          setError("Please select a word to link.");
          setIsSaving(false);
          return;
        }
        if (setAsPrimaryRelated) {
          const picked = words.find((w) => w.id === targetWordId);
          if (picked) setRelatedWord(picked);
        }
      }

      const existingLinks = linkedWords.map((item, idx) => ({
        wordId: item.wordId,
        position: item.position ?? idx + 1,
      }));
      const alreadyLinked = existingLinks.some((w) => w.wordId === targetWordId);
      const nextWords = alreadyLinked
        ? existingLinks
        : [
            ...existingLinks,
            { wordId: targetWordId, position: existingLinks.length + 1 },
          ];

      const res = await updateSentenceAction(sentence.id, {
        words: nextWords,
        ...(setAsPrimaryRelated ? { relatedWordId: targetWordId } : {}),
      });

      if (!res.success) {
        setError(res.error);
        return;
      }

      onSentenceUpdated({
        ...res.data,
        arabicText: res.data.arabicText || sentence.arabicText,
      });
      setSelectedWordId("");
      setCustomWordText("");
      setSetAsPrimaryRelated(false);
      setDialogOpen(false);

      if (isNewlyCreatedByAi) {
        setMessage("Word created with AI and linked! Generating meaning…");
        pollSentenceForNewWordMeaning();
      } else {
        setMessage("Word linked successfully.");
      }
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to link word.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleUnlinkWord(wordIdToRemove: string) {
    if (isSaving || Boolean(linkingTokenKey) || Boolean(removingWordId)) return;
    setRemovingWordId(wordIdToRemove);
    setIsSaving(true);
    setError(null);
    setMessage(null);

    try {
      const nextWords = linkedWords
        .filter((item) => item.wordId !== wordIdToRemove)
        .map((item, idx) => ({
          wordId: item.wordId,
          position: item.position ?? idx + 1,
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
      setMessage("Word removed from sentence.");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to remove word.");
    } finally {
      setRemovingWordId(null);
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
      pollSentenceForNewWordMeaning();
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
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-1.5 font-heading text-sm font-semibold text-text">
          <Type className="h-3.5 w-3.5 text-secondary" aria-hidden="true" />
          Word Linking ({linkedWords.length} linked)
        </h2>
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            disabled={isResyncing}
            onClick={() => void handleResyncWords()}
            title="Automatically create and link all words from the sentence"
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            {isResyncing ? "Linking all…" : "Link all"}
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
            Add manually
          </Button>
        </div>
      </div>

      {message ? (
        <p
          role="status"
          className="mt-2 rounded-default bg-primary-light/10 px-2.5 py-1.5 text-xs text-text-secondary"
        >
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

      {/* Section 1: Sentence words split by space */}
      {sentenceTokens.length > 0 ? (
        <div className="mt-3">
          <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-text-muted">
            Words in this sentence ({sentenceTokens.length})
          </p>
          <ul className="flex flex-col gap-2">
            {sentenceTokens.map((token, idx) => {
              const position = idx + 1;
              const tokenKey = `${position}:${token}`;
              const linked = findLinkedWordForToken(token, position);
              const isThisLinking = linkingTokenKey === tokenKey;
              const isThisRemoving = Boolean(linked && removingWordId === linked.wordId);

              return (
                <li
                  key={tokenKey}
                  className={cn(
                    "flex items-center justify-between gap-2 rounded-default border px-3 py-2 transition-colors",
                    linked
                      ? "border-success/40 bg-success-bg/25"
                      : "border-border bg-white",
                  )}
                >
                  <div className="flex min-w-0 flex-1 items-center gap-2.5">
                    <span
                      className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-medium",
                        linked
                          ? "bg-success-bg text-success-text"
                          : "bg-neutral-bg text-text-muted",
                      )}
                    >
                      {position}
                    </span>
                    {linked ? (
                      <Link
                        href={`/admin/words/${encodeURIComponent(linked.wordId)}`}
                        className="flex min-w-0 flex-1 items-center justify-between gap-2 hover:text-primary"
                      >
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span dir="rtl" lang="ar" className="font-arabic text-lg text-text">
                              {token}
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-full bg-success-bg px-2 py-0.5 text-[10px] font-semibold text-success-text">
                              <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                              Linked
                            </span>
                          </div>
                          <p className="truncate text-xs text-text-muted">
                            {linked.meaningEnglish ||
                              linked.meaningBangla ||
                              "Generating meaning with AI…"}
                          </p>
                        </div>
                        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-text-muted" aria-hidden="true" />
                      </Link>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span dir="rtl" lang="ar" className="font-arabic text-lg text-text">
                          {token}
                        </span>
                        <span className="rounded-full bg-neutral-bg px-2 py-0.5 text-[10px] text-text-muted">
                          Not linked
                        </span>
                      </div>
                    )}
                  </div>

                  {linked ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={isSaving || Boolean(linkingTokenKey)}
                      aria-label={`Remove ${token}`}
                      onClick={() => void handleUnlinkWord(linked.wordId)}
                      className="text-error-text hover:bg-error-bg hover:text-error-text"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      {isThisRemoving ? "Removing…" : "Remove"}
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={Boolean(linkingTokenKey) || isSaving}
                      onClick={() => void handleLinkSentenceToken(token, position)}
                    >
                      {isThisLinking ? (
                        <>
                          <Sparkles className="h-3.5 w-3.5 animate-pulse text-primary" aria-hidden="true" />
                          Linking…
                        </>
                      ) : (
                        <>
                          <Link2 className="h-3.5 w-3.5" aria-hidden="true" />
                          Link
                        </>
                      )}
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      {/* Section 2: All currently linked words summary + Remove */}
      <div className="mt-4 border-t border-border pt-3">
        <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-text-muted">
          Currently linked words ({linkedWords.length})
        </p>
        {linkedWords.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {linkedWords.map((item) => {
              const isThisRemoving = removingWordId === item.wordId;
              return (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-2 rounded-default border border-border bg-neutral-bg/30 px-3 py-2"
                >
                  <Link
                    href={`/admin/words/${encodeURIComponent(item.wordId)}`}
                    className="flex min-w-0 flex-1 items-center justify-between gap-2 hover:text-primary"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p dir="rtl" lang="ar" className="font-arabic text-base text-text">
                          {item.arabicText || item.wordKey}
                        </p>
                        {item.wordKey ? (
                          <span className="text-[11px] text-text-muted">
                            ({item.wordKey})
                          </span>
                        ) : null}
                      </div>
                      <p className="truncate text-xs text-text-muted">
                        {item.meaningEnglish ||
                          item.meaningBangla ||
                          "Generating meaning with AI…"}
                      </p>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 shrink-0 text-text-muted" aria-hidden="true" />
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={isSaving || Boolean(linkingTokenKey)}
                    aria-label={`Remove ${item.arabicText || item.wordKey}`}
                    onClick={() => void handleUnlinkWord(item.wordId)}
                    className="text-error-text hover:bg-error-bg hover:text-error-text"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    {isThisRemoving ? "Removing…" : "Remove"}
                  </Button>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-xs text-text-muted">
            No words linked yet. Click <strong>Link</strong> on any word above or{" "}
            <strong>Add manually</strong> to link a word.
          </p>
        )}
      </div>

      {/* Manual Add / Link Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => !isSaving && setDialogOpen(open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Manually link word to {sentence.sentenceType === "SHORT" ? "short sentence" : "sentence"}
            </DialogTitle>
            <DialogDescription>
              Select an existing vocabulary word or type any word to create with AI and link to {sentence.sentenceKey}.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-2 rounded-default bg-neutral-bg p-1">
              <button
                type="button"
                onClick={() => {
                  setManualMode("existing");
                  setError(null);
                }}
                className={cn(
                  "rounded-md py-1.5 text-xs font-medium transition-colors",
                  manualMode === "existing"
                    ? "bg-white text-text shadow-sm"
                    : "text-text-muted hover:text-text",
                )}
              >
                Select existing word
              </button>
              <button
                type="button"
                onClick={() => {
                  setManualMode("custom");
                  setError(null);
                }}
                className={cn(
                  "rounded-md py-1.5 text-xs font-medium transition-colors",
                  manualMode === "custom"
                    ? "bg-white text-text shadow-sm"
                    : "text-text-muted hover:text-text",
                )}
              >
                Type / Create new word
              </button>
            </div>

            {manualMode === "existing" ? (
              <>
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
              </>
            ) : (
              <div>
                <Label htmlFor="custom-word-input">
                  Word (Arabic, English, or Bangla)
                </Label>
                <Input
                  id="custom-word-input"
                  value={customWordText}
                  onChange={(event) => setCustomWordText(event.target.value)}
                  placeholder="e.g. أهتم or care"
                />
                <p className="mt-1 text-xs text-text-muted">
                  If this word already exists, it will be linked directly. Otherwise, AI will translate/create it and link it.
                </p>
              </div>
            )}

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
                disabled={
                  isSaving ||
                  (manualMode === "existing" ? !selectedWordId : !customWordText.trim())
                }
                onClick={() => void handleManualSubmit()}
              >
                <Link2 className="h-4 w-4" aria-hidden="true" />
                {isSaving
                  ? "Linking…"
                  : manualMode === "custom"
                    ? "Create & Link"
                    : "Link word"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
