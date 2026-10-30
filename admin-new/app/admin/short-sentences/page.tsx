import { Suspense } from "react";
import { SentenceListView } from "@/components/features/sentences/sentence-list-view";
import { getShortSentencesForAdmin } from "@/lib/sentences/data";
import Loading from "../sentences/loading";

export default function ShortSentencesPage() {
  return (
    <Suspense fallback={<Loading />}>
      <ShortSentenceListData />
    </Suspense>
  );
}

async function ShortSentenceListData() {
  const result = await getShortSentencesForAdmin({
    page: 1,
    limit: 20,
  });

  return (
    <SentenceListView
      initialSentences={result.items}
      initialMeta={result.meta}
      fixedSentenceType="SHORT"
    />
  );
}

