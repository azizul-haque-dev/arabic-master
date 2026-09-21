import type { Section } from "@/lib/types/content";
import { mockCourses } from "@/lib/mock-data/courses";

function course(id: string) {
    const found = mockCourses.find((c) => c.id === id);
    if (!found) throw new Error(`mock section references missing course id ${id}`);
    return found;
}

export const mockSections: Section[] = [
    {
        id: "sec1",
        sectionKey: "SEC-2001",
        courseId: course("crs1").id, // Free Words
        title: "Shopping",
        description: "Words for prices, bargaining, and buying things.",
        order: 1,
        status: "PUBLISHED",
        createdBy: "Rahim Ahmed",
        createdAt: "2026-05-05T09:00:00Z",
        updatedAt: "2026-08-11T09:00:00Z",
    },
    {
        id: "sec2",
        sectionKey: "SEC-2002",
        courseId: course("crs1").id, // Free Words
        title: "Greetings",
        description: "Everyday greetings and polite phrases.",
        order: 2,
        status: "PUBLISHED",
        createdBy: "Rahim Ahmed",
        createdAt: "2026-05-06T09:00:00Z",
        updatedAt: "2026-09-08T14:20:00Z",
    },
    {
        id: "sec3",
        sectionKey: "SEC-2003",
        courseId: course("crs2").id, // Free Sentences
        title: "Shopping",
        description: "Full sentences for negotiating prices and making purchases.",
        order: 1,
        status: "PUBLISHED",
        createdBy: "Rahim Ahmed",
        createdAt: "2026-05-07T09:00:00Z",
        updatedAt: "2026-09-01T16:45:00Z",
    },
    {
        id: "sec4",
        sectionKey: "SEC-2004",
        courseId: course("crs2").id, // Free Sentences
        title: "Restaurant",
        description: "Ordering food and asking for basic assistance at a restaurant.",
        order: 2,
        status: "DRAFT",
        createdBy: "Nusrat Jahan",
        createdAt: "2026-09-07T10:00:00Z",
        updatedAt: "2026-09-07T10:00:00Z",
    },
];