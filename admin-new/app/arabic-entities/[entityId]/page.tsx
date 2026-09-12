import { notFound } from "next/navigation";
import { mockArabicEntities } from "@/lib/mock-data/arabic-entities";
import { EntityDetailView } from "@/components/features/arabic-entities/entity-detail-view";

export default async function ArabicEntityDetailPage({
  params,
}: {
  params: Promise<{ entityId: string }>;
}) {
  const { entityId } = await params;
  const entity = mockArabicEntities.find((e) => e.id === entityId);

  if (!entity) {
    notFound();
  }

  return <EntityDetailView initialEntity={entity} />;
}
