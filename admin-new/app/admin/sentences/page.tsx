import { Suspense } from "react";
import { SentenceListView } from "@/components/features/sentences/sentence-list-view";
import { getSentencesForAdmin } from "@/lib/sentences/data";
import { contentListQuerySchema, queryFromUnknown } from "@/lib/content/validation";
import Loading from "./loading";

const PAGE_LIMIT = 20;

interface PageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default function SentencesPage({ searchParams }: PageProps) {
  return (
    <Suspense fallback={<Loading />}>
      <SentenceListData searchParams={searchParams} />
    </Suspense>
  );
}

async function SentenceListData({ searchParams }: PageProps) {
  const resolvedParams = searchParams ? await searchParams : {};
  const parsed = contentListQuerySchema.safeParse(
    queryFromUnknown({ ...resolvedParams, limit: PAGE_LIMIT }),
  );
  const query = parsed.success
    ? parsed.data
    : { page: 1, limit: PAGE_LIMIT };
  const result = await getSentencesForAdmin(query);

  return <SentenceListView initialSentences={result.items} initialMeta={result.meta} />;
}
