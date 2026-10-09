import { Suspense } from "react";
import { notFound } from "next/navigation";
import { SentenceDetailView } from "@/components/features/sentences/sentence-detail-view";
import { contentIdSchema } from "@/lib/content/validation";
import { getSentenceForAdmin } from "@/lib/sentences/data";
import Loading from "./loading";

export default function SentenceDetailPage({
  params,
}: {
  params: Promise<{ sentenceId: string }>;
}) {
  return (
    <Suspense fallback={<Loading />}>
      <SentenceDetailData params={params} />
    </Suspense>
  );
}

async function SentenceDetailData({
  params,
}: {
  params: Promise<{ sentenceId: string }>;
}) {
  const { sentenceId } = await params;
  const parsedId = contentIdSchema.safeParse(sentenceId);
  if (!parsedId.success) notFound();

  const detail = await getSentenceForAdmin(parsedId.data);
  if (!detail) notFound();

  return (
    <SentenceDetailView
      initialSentence={detail.sentence}
      initialRelatedWord={detail.relatedWord}
    />
  );
}
