import { notFound } from "next/navigation";
import { mockSections } from "@/lib/mock-data/sections";
import { SectionDetailView } from "@/components/features/sections/section-detail-view";

export default async function SectionDetailPage({
    params,
}: {
    params: Promise<{ sectionId: string }>;
}) {
    const { sectionId } = await params;
    const section = mockSections.find((s) => s.id === sectionId);

    if (!section) {
        notFound();
    }

    return <SectionDetailView initialSection={section} />;
}