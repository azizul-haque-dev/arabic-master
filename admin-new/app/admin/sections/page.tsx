import { Suspense } from "react";
import { SectionListView } from "@/components/features/sections/section-list-view";
import { getSectionsForAdmin, getCourseOptionsForAdmin } from "@/lib/sections/data";
import Loading from "./loading";

export default function SectionsPage() {
  return (
    <Suspense fallback={<Loading />}>
      <SectionListData />
    </Suspense>
  );
}

async function SectionListData() {
  const [sectionsResult, courseOptions] = await Promise.all([
    getSectionsForAdmin({
      page: 1,
      limit: 20,
    }),
    getCourseOptionsForAdmin(),
  ]);

  return (
    <SectionListView
      initialSections={sectionsResult.items}
      initialMeta={sectionsResult.meta}
      courseOptions={courseOptions}
    />
  );
}