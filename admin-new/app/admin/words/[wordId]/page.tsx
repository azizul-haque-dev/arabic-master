import { notFound } from "next/navigation";
import { WordDetailView } from "@/components/features/words/word-detail-view";
import { serverApiFetch } from "@/lib/auth/server-api";
import { normalizeWord } from "@/lib/words/api";

export default async function WordDetailPage({
  params,
}: {
  params: Promise<{ wordId: string }>;
}) {
  const { wordId } = await params;
  const response = await serverApiFetch(`/words/${wordId}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    notFound();
  }

  const payload = await response.json().catch(() => null);
  const body = payload?.data?.data ?? payload?.data ?? payload;
  const word = normalizeWord(body);

  if (!word?.id) {
    notFound();
  }

  return <WordDetailView initialWord={word} />;
}
