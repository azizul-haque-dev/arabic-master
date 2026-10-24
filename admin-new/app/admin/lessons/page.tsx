import { Suspense } from "react";
import { LessonListView } from "@/components/features/lessons/lesson-list-view";
import { getLessonsForAdmin, getSectionOptionsForAdmin } from "@/lib/lessons/data";
import Loading from "./loading";

export default function LessonsPage() {
  return (
    <Suspense fallback={<Loading />}>
      <LessonListData />
    </Suspense>
  );
}

async function LessonListData() {
  const [lessonsResult, sectionOptions] = await Promise.all([
    getLessonsForAdmin({
      page: 1,
      limit: 20,
    }),
    getSectionOptionsForAdmin(),
  ]);

  return (
    <LessonListView
      initialLessons={lessonsResult.items}
      initialMeta={lessonsResult.meta}
      sectionOptions={sectionOptions}
    />
  );
}