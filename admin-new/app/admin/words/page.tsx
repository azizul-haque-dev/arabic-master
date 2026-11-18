import { Suspense } from "react";
import { WordListView } from "@/components/features/words/word-list-view";
import { queryFromUnknown, wordListQuerySchema } from "@/lib/content/validation";
import { getWordsForAdmin } from "@/lib/words/data";
import Loading from "./loading";

interface PageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default function WordsPage({ searchParams }: PageProps) {
  return (
    <Suspense fallback={<Loading />}>
      <WordListData searchParams={searchParams} />
    </Suspense>
  );
}

async function WordListData({ searchParams }: PageProps) {
  const resolvedParams = searchParams ? await searchParams : {};
  const query = wordListQuerySchema.parse(queryFromUnknown(resolvedParams));
  const result = await getWordsForAdmin(query);

  return <WordListView initialWords={result.items} initialMeta={result.meta} />;
}
