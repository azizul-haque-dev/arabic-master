import { notFound } from "next/navigation";
import { mockWords } from "@/lib/mock-data/words";
import { WordDetailView } from "@/components/features/words/word-detail-view";

export default async function WordDetailPage({
  params,
}: {
  params: Promise<{ wordId: string }>;
}) {
  const { wordId } = await params;
  const word = mockWords.find((w) => w.id === wordId);

  if (!word) {
    notFound();
  }

  return <WordDetailView initialWord={word} />;
}
