import type { Lesson, LessonContentItem } from "@/lib/types/content";
import { mockWords } from "@/lib/mock-data/words";
import { mockSentences } from "@/lib/mock-data/sentences";
import { mockConversations } from "@/lib/mock-data/conversations";
import { mockSections } from "@/lib/mock-data/sections";

function section(id: string) {
    const found = mockSections.find((s) => s.id === id);
    if (!found) throw new Error(`mock lesson references missing section id ${id}`);
    return found;
}

function assertExists(contentType: LessonContentItem["contentType"], contentId: string) {
    const pool =
        contentType === "WORD" ? mockWords : contentType === "SENTENCE" ? mockSentences : mockConversations;
    const found = pool.find((item) => item.id === contentId);
    if (!found) {
        throw new Error(`mock lesson item references missing ${contentType} id ${contentId}`);
    }
    return found;
}

function item(order: number, contentType: LessonContentItem["contentType"], contentId: string): LessonContentItem {
    assertExists(contentType, contentId);
    return { id: `${contentType}-${contentId}-${order}`, order, contentType, contentId };
}

export const mockLessons: Lesson[] = [
    {
        id: "l1",
        lessonKey: "LSN-4021",
        title: "Shopping Basics — Lesson 1",
        sectionId: section("sec1").id, // Free Words / Shopping
        items: [
            item(1, "WORD", "w2"), // رخيص - cheap
            item(1, "SENTENCE", "s1"), // كم السعر؟
            item(2, "SENTENCE", "s6"), // can you make it cheaper?
        ],
        maxItemsRecommended: 10,
        status: "PUBLISHED",
        createdBy: "Rahim Ahmed",
        createdAt: "2026-06-16T09:00:00Z",
        updatedAt: "2026-09-05T13:30:00Z",
    },
    {
        id: "l2",
        lessonKey: "LSN-4022",
        title: "Shopping Basics — Lesson 2",
        sectionId: section("sec3").id, // Free Sentences / Shopping
        items: [
            item(1, "SENTENCE", "s3"), // أريد هذا
            item(2, "SENTENCE", "s2"), // بكم هذا؟
            item(1, "CONVERSATION", "c1"), // Buying Something at a Shop
        ],
        maxItemsRecommended: 10,
        status: "PUBLISHED",
        createdBy: "Rahim Ahmed",
        createdAt: "2026-06-22T09:00:00Z",
        updatedAt: "2026-09-01T16:45:00Z",
    },
    {
        id: "l3",
        lessonKey: "LSN-4023",
        title: "Greetings — Lesson 1",
        sectionId: section("sec2").id, // Free Words / Greetings
        items: [
            item(1, "WORD", "w1"), // مرحبا
            item(2, "WORD", "w3"), // مرحبا (hello variant word)
            item(1, "SENTENCE", "s4"), // thank you, goodbye
        ],
        maxItemsRecommended: 5,
        status: "IN_REVIEW",
        createdBy: "Nusrat Jahan",
        createdAt: "2026-09-04T09:00:00Z",
        updatedAt: "2026-09-09T09:10:00Z",
    },
    {
        id: "l4",
        lessonKey: "LSN-4024",
        title: "Restaurant Basics — Lesson 1",
        sectionId: section("sec4").id, // Free Sentences / Restaurant
        items: [
            item(1, "SENTENCE", "s5"), // where is the bathroom?
            item(1, "CONVERSATION", "c2"), // Asking for the Bathroom
        ],
        maxItemsRecommended: 5,
        status: "DRAFT",
        createdBy: "Nusrat Jahan",
        createdAt: "2026-09-08T11:00:00Z",
        updatedAt: "2026-09-08T11:00:00Z",
    },
];