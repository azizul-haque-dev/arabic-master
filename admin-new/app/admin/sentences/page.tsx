import { Suspense } from "react";
import { SentenceListView } from "@/components/features/sentences/sentence-list-view";
import { getSentencesForAdmin } from "@/lib/sentences/data";
import Loading from "./loading";

export default function SentencesPage() {
  return (
    <Suspense fallback={<Loading />}>
      <SentenceListData />
    </Suspense>
  );
}

async function SentenceListData() {
  const result = await getSentencesForAdmin({
    page: 1,
    limit: 20,
  });

  return <SentenceListView initialSentences={result.items} initialMeta={result.meta} />;
}
