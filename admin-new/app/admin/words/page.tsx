import { Suspense } from "react";
import { WordListView } from "@/components/features/words/word-list-view";
import { getWordsForAdmin } from "@/lib/words/data";
import Loading from "./loading";

export default function WordsPage() {
  return (
    <Suspense fallback={<Loading />}>
      <WordListData />
    </Suspense>
  );
}

async function WordListData() {
  const result = await getWordsForAdmin({
    page: 1,
    limit: 20,
  });

  return <WordListView initialWords={result.items} />;
}
