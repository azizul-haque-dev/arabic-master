import { notFound } from "next/navigation";
import { mockCourses } from "@/lib/mock-data/courses";
import { CourseDetailView } from "@/components/features/courses/course-detail-view";

export default async function CourseDetailPage({
    params,
}: {
    params: Promise<{ courseId: string }>;
}) {
    const { courseId } = await params;
    const course = mockCourses.find((c) => c.id === courseId);

    if (!course) {
        notFound();
    }

    return <CourseDetailView initialCourse={course} />;
}