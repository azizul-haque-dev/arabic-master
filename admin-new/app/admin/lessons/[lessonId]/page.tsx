import { Suspense } from "react";
import { notFound } from "next/navigation";
import { LessonDetailView } from "@/components/features/lessons/lesson-detail-view";
import { contentIdSchema } from "@/lib/content/validation";
import { getLessonForAdmin, getSectionOptionsForAdmin } from "@/lib/lessons/data";
import Loading from "./loading";

export default function LessonDetailPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  return (
    <Suspense fallback={<Loading />}>
      <LessonDetailData params={params} />
    </Suspense>
  );
}

async function LessonDetailData({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId } = await params;
  const parsedId = contentIdSchema.safeParse(lessonId);
  if (!parsedId.success) notFound();

  const [lesson, sectionOptions] = await Promise.all([
    getLessonForAdmin(parsedId.data),
    getSectionOptionsForAdmin(),
  ]);

  if (!lesson) {
    notFound();
  }

  return (
    <LessonDetailView
      initialLesson={lesson}
      sectionOptions={sectionOptions}
    />
  );
}