import { Suspense } from "react";
import { CourseListView } from "@/components/features/courses/course-list-view";
import { getCoursesForAdmin } from "@/lib/courses/data";
import Loading from "./loading";

export default function CoursesPage() {
  return (
    <Suspense fallback={<Loading />}>
      <CourseListData />
    </Suspense>
  );
}

async function CourseListData() {
  const result = await getCoursesForAdmin({
    page: 1,
    limit: 20,
  });

  return (
    <CourseListView
      initialCourses={result.items}
      initialMeta={result.meta}
    />
  );
}