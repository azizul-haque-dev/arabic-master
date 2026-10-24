import { Suspense } from "react";
import { notFound } from "next/navigation";
import { CourseDetailView } from "@/components/features/courses/course-detail-view";
import { contentIdSchema } from "@/lib/content/validation";
import { getCourseForAdmin } from "@/lib/courses/data";
import Loading from "./loading";

export default function CourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  return (
    <Suspense fallback={<Loading />}>
      <CourseDetailData params={params} />
    </Suspense>
  );
}

async function CourseDetailData({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const parsedId = contentIdSchema.safeParse(courseId);
  if (!parsedId.success) notFound();

  const course = await getCourseForAdmin(parsedId.data);
  if (!course) {
    notFound();
  }

  return <CourseDetailView initialCourse={course} />;
}