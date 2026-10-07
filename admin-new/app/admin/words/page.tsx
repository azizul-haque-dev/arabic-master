import { WordListView } from "@/components/features/words/word-list-view";
import { serverApiFetch } from "@/lib/auth/server-api";
import { normalizeWord } from "@/lib/words/api";

export default async function WordsPage() {
  const response = await serverApiFetch("/words", {
    cache: "no-store",
  });

  const payload = await response.json().catch(() => null);
  const body = payload?.data?.data ?? payload?.data ?? payload;
  const initialWords = Array.isArray(body?.items) ? body.items.map(normalizeWord) : [];

  return <WordListView initialWords={initialWords} />;
}
