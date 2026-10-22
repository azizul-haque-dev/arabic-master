import { Suspense } from "react";
import { EntityListView } from "@/components/features/arabic-entities/entity-list-view";
import { getArabicEntitiesForAdmin } from "@/lib/arabic-entities/data";
import { contentListQuerySchema, queryFromUnknown } from "@/lib/content/validation";
import Loading from "./loading";

interface PageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default function ArabicEntitiesPage({ searchParams }: PageProps) {
  return (
    <Suspense fallback={<Loading />}>
      <EntityListData searchParams={searchParams} />
    </Suspense>
  );
}

async function EntityListData({ searchParams }: PageProps) {
  const resolvedParams = searchParams ? await searchParams : {};
  const parsed = contentListQuerySchema.safeParse(queryFromUnknown(resolvedParams));

  const query = parsed.success
    ? parsed.data
    : { page: 1, limit: 20 };

  const result = await getArabicEntitiesForAdmin(query);

  return (
    <EntityListView
      initialEntities={result.items}
      initialMeta={result.meta}
    />
  );
}
