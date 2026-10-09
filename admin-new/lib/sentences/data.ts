import "server-only";

import type { ContentListQuery } from "@/lib/content/validation";
import { readBackend, requireContentAdmin } from "@/lib/content/server";
import { normalizeSentence, normalizeSentenceList, type SentenceListResponse } from "./api";
import { normalizeWord } from "@/lib/words/api";
import type { Sentence, Word } from "@/lib/types/content";

function buildQuery(query: ContentListQuery): string {
  const params = new URLSearchParams();
  params.set("page", String(query.page));
  params.set("limit", String(query.limit));
  if (query.search) params.set("search", query.search);
  if (query.category) params.set("category", query.category);
  if (query.status) params.set("status", query.status);
  return params.toString();
}

export async function requestSentenceList(query: ContentListQuery): Promise<SentenceListResponse> {
  try {
    const result = await readBackend(`/sentences?${buildQuery(query)}`);
    if (!result.ok) throw new Error("Unable to load sentences.");
    return normalizeSentenceList(result.data);
  } catch {
    throw new Error("Unable to load sentences. Please try again.");
  }
}

export async function requestSentenceById(id: string): Promise<Sentence | null> {
  try {
    const result = await readBackend(`/sentences/${encodeURIComponent(id)}`);
    if (!result.ok) {
      if (result.status === 404) return null;
      throw new Error("Unable to load sentence.");
    }
    return normalizeSentence(result.data);
  } catch {
    throw new Error("Unable to load sentence. Please try again.");
  }
}

export async function getSentencesForAdmin(query: ContentListQuery): Promise<SentenceListResponse> {
  const authorization = await requireContentAdmin(false);
  if (!authorization.success) throw new Error(authorization.error);
  return requestSentenceList(query);
}

export async function getSentenceForAdmin(
  id: string,
): Promise<{ sentence: Sentence; relatedWord?: Word } | null> {
  const authorization = await requireContentAdmin(false);
  if (!authorization.success) throw new Error(authorization.error);
  const sentence = await requestSentenceById(id);
  if (!sentence) return null;

  const [listResult, relatedWordResult] = await Promise.all([
    sentence.arabicText
      ? Promise.resolve(null)
      : requestSentenceList({
          page: 1,
          limit: 100,
          search: sentence.meaningEnglish || undefined,
        }),
    sentence.relatedWordId
      ? readBackend(`/words/${encodeURIComponent(sentence.relatedWordId)}`)
      : Promise.resolve(null),
  ]);

  const sentenceWithText = listResult?.items.find((item) => item.id === sentence.id);
  let relatedWord: Word | undefined;
  if (relatedWordResult && !relatedWordResult.ok && relatedWordResult.status !== 404) {
    throw new Error("Unable to load the related word. Please try again.");
  }
  if (relatedWordResult?.ok) {
    relatedWord = normalizeWord(relatedWordResult.data);
  }

  return {
    sentence: {
      ...sentence,
      arabicText: sentence.arabicText || sentenceWithText?.arabicText || "",
    },
    relatedWord,
  };
}
