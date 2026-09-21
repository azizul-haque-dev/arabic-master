import { notFound } from "next/navigation";
import { mockLessons } from "@/lib/mock-data/lessons";
import { LessonDetailView } from "@/components/features/lessons/lesson-detail-view";

export default async function LessonDetailPage({
    params,
}: {
    params: Promise<{ lessonId: string }>;
}) {
    const { lessonId } = await params;
    const lesson = mockLessons.find((l) => l.id === lessonId);

    if (!lesson) {
        notFound();
    }

    return <LessonDetailView initialLesson={lesson} />;
}