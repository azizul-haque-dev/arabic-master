import { notFound } from "next/navigation";
import { SentenceDetailView } from "@/components/features/sentences/sentence-detail-view";
import { serverApiFetch } from "@/lib/auth/server-api";
import { normalizeSentence } from "@/lib/sentences/api";
import { normalizeWord } from "@/lib/words/api";

function getData(payload: unknown): unknown {
    if (typeof payload !== "object" || payload === null || !("data" in payload)) return payload;
    const outer = payload.data;
    if (typeof outer === "object" && outer !== null && "data" in outer) return outer.data;
    return outer;
}

export default async function SentenceDetailPage({
    params,
}: {
    params: Promise<{ sentenceId: string }>;
}) {
    const { sentenceId } = await params;
    const response = await serverApiFetch(`/sentences/${encodeURIComponent(sentenceId)}`, {
        cache: "no-store",
    });

    if (response.status === 404) notFound();
    if (!response.ok) {
        throw new Error(`Unable to load sentence (${response.status}).`);
    }

    const payload: unknown = await response.json();
    const sentence = normalizeSentence(getData(payload));
    let arabicText = sentence.arabicText;

    if (!arabicText && sentence.meaningEnglish) {
        const listResponse = await serverApiFetch(
            `/sentences?search=${encodeURIComponent(sentence.meaningEnglish)}&limit=100`,
            { cache: "no-store" },
        );
        if (listResponse.ok) {
            const listPayload: unknown = await listResponse.json();
            const listData = getData(listPayload);
            if (
                typeof listData === "object" &&
                listData !== null &&
                "items" in listData &&
                Array.isArray(listData.items)
            ) {
                const matching = listData.items.map(normalizeSentence).find((item) => item.id === sentence.id);
                arabicText = matching?.arabicText ?? "";
            }
        }
    }

    let relatedWord = undefined;
    if (sentence.relatedWordId) {
        const wordResponse = await serverApiFetch(`/words/${encodeURIComponent(sentence.relatedWordId)}`, {
            cache: "no-store",
        });
        if (wordResponse.ok) {
            const wordPayload: unknown = await wordResponse.json();
            const wordData = getData(wordPayload);
            if (typeof wordData === "object" && wordData !== null) {
                relatedWord = normalizeWord(wordData as Parameters<typeof normalizeWord>[0]);
            }
        }
    }

    return (
        <SentenceDetailView
            initialSentence={{ ...sentence, arabicText }}
            initialRelatedWord={relatedWord}
        />
    );
}
