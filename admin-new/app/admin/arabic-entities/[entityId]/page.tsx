import { Suspense } from "react";
import { notFound } from "next/navigation";
import { EntityDetailView } from "@/components/features/arabic-entities/entity-detail-view";
import { contentIdSchema } from "@/lib/content/validation";
import { getArabicEntityForAdmin } from "@/lib/arabic-entities/data";
import Loading from "./loading";

interface PageProps {
  params: Promise<{ entityId: string }>;
}

export default function ArabicEntityDetailPage({ params }: PageProps) {
  return (
    <Suspense fallback={<Loading />}>
      <EntityDetailData params={params} />
    </Suspense>
  );
}

async function EntityDetailData({ params }: PageProps) {
  const { entityId } = await params;
  const parsedId = contentIdSchema.safeParse(entityId);
  if (!parsedId.success) notFound();

  const entity = await getArabicEntityForAdmin(parsedId.data);
  if (!entity) notFound();

  return <EntityDetailView initialEntity={entity} />;
}
