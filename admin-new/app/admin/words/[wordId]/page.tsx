import { Suspense } from "react";
import { notFound } from "next/navigation";
import { WordDetailView } from "@/components/features/words/word-detail-view";
import { contentIdSchema } from "@/lib/content/validation";
import { getWordForAdmin } from "@/lib/words/data";
import Loading from "./loading";

export default function WordDetailPage({
  params,
}: {
  params: Promise<{ wordId: string }>;
}) {
  return (
    <Suspense fallback={<Loading />}>
      <WordDetailData params={params} />
    </Suspense>
  );
}

async function WordDetailData({
  params,
}: {
  params: Promise<{ wordId: string }>;
}) {
  const { wordId } = await params;
  const parsedId = contentIdSchema.safeParse(wordId);
  if (!parsedId.success) notFound();
  const word = await getWordForAdmin(parsedId.data);

  if (!word) notFound();
  return <WordDetailView initialWord={word} />;
}
