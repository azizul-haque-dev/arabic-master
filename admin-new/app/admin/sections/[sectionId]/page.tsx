import { Suspense } from "react";
import { notFound } from "next/navigation";
import { SectionDetailView } from "@/components/features/sections/section-detail-view";
import { contentIdSchema } from "@/lib/content/validation";
import { getCourseOptionsForAdmin, getSectionForAdmin } from "@/lib/sections/data";
import Loading from "./loading";

export default function SectionDetailPage({
  params,
}: {
  params: Promise<{ sectionId: string }>;
}) {
  return (
    <Suspense fallback={<Loading />}>
      <SectionDetailData params={params} />
    </Suspense>
  );
}

async function SectionDetailData({
  params,
}: {
  params: Promise<{ sectionId: string }>;
}) {
  const { sectionId } = await params;
  const parsedId = contentIdSchema.safeParse(sectionId);
  if (!parsedId.success) notFound();

  const [section, courseOptions] = await Promise.all([
    getSectionForAdmin(parsedId.data),
    getCourseOptionsForAdmin(),
  ]);

  if (!section) {
    notFound();
  }

  return (
    <SectionDetailView
      initialSection={section}
      courseOptions={courseOptions}
    />
  );
}