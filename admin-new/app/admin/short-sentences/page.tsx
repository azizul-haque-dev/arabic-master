import { Suspense } from "react";
import { SentenceListView } from "@/components/features/sentences/sentence-list-view";
import { getShortSentencesForAdmin } from "@/lib/sentences/data";
import { contentListQuerySchema, queryFromUnknown } from "@/lib/content/validation";
import Loading from "../sentences/loading";

const PAGE_LIMIT = 20;

interface PageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default function ShortSentencesPage({ searchParams }: PageProps) {
  return (
    <Suspense fallback={<Loading />}>
      <ShortSentenceListData searchParams={searchParams} />
    </Suspense>
  );
}

async function ShortSentenceListData({ searchParams }: PageProps) {
  const resolvedParams = searchParams ? await searchParams : {};
  const parsed = contentListQuerySchema.safeParse(
    queryFromUnknown({
      ...resolvedParams,
      limit: PAGE_LIMIT,
      sentenceType: "SHORT",
    }),
  );
  const query = parsed.success
    ? parsed.data
    : { page: 1, limit: PAGE_LIMIT, sentenceType: "SHORT" as const };
  const result = await getShortSentencesForAdmin(query);

  return (
    <SentenceListView
      initialSentences={result.items}
      initialMeta={result.meta}
      fixedSentenceType="SHORT"
    />
  );
}

