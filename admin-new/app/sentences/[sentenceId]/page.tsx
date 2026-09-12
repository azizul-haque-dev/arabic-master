import { notFound } from "next/navigation";
import { mockSentences } from "@/lib/mock-data/sentences";
import { SentenceDetailView } from "@/components/features/sentences/sentence-detail-view";

export default async function SentenceDetailPage({
    params,
}: {
    params: Promise<{ sentenceId: string }>;
}) {
    const { sentenceId } = await params;
    const sentence = mockSentences.find((s) => s.id === sentenceId);

    if (!sentence) {
        notFound();
    }

    return <SentenceDetailView initialSentence={sentence} />;
}