import { mockSentences } from "@/lib/mock-data/sentences";
import type { Conversation } from "@/lib/types/content";

function sentence(id: string) {
  const found = mockSentences.find((s) => s.id === id);
  if (!found)
    throw new Error(
      `mock conversation turn references missing sentence id ${id}`,
    );
  return found;
}

export const mockConversations: Conversation[] = [
  {
    id: "c1",
    conversationKey: "CNV-3012",
    title: "Buying Something at a Shop",
    topic: "Shopping",
    category: "Shopping",
    turns: [
      {
        id: "t1",
        order: 1,
        speaker: "Customer",
        sentenceId: sentence("s1").id,
      }, // كم السعر؟
      {
        id: "t2",
        order: 2,
        speaker: "Customer",
        sentenceId: sentence("s3").id,
      }, // أريد هذا
      {
        id: "t3",
        order: 3,
        speaker: "Customer",
        sentenceId: sentence("s6").id,
      }, // negotiating price
      {
        id: "t4",
        order: 4,
        speaker: "Customer",
        sentenceId: sentence("s4").id,
      }, // thank you, goodbye
    ],
    lessonName: "Shopping Basics — Lesson 2",
    status: "PUBLISHED",
    createdBy: "Rahim Ahmed",
    createdAt: "2026-06-20T09:00:00Z",
    updatedAt: "2026-09-01T16:45:00Z",
  },
  {
    id: "c2",
    conversationKey: "CNV-3013",
    title: "Asking for the Bathroom",
    topic: "Restaurant",
    category: "Restaurant",
    turns: [
      { id: "t5", order: 1, speaker: "Guest", sentenceId: sentence("s5").id },
    ],
    status: "DRAFT",
    createdBy: "Nusrat Jahan",
    createdAt: "2026-09-08T10:00:00Z",
    updatedAt: "2026-09-08T10:00:00Z",
  },
  {
    id: "c3",
    conversationKey: "CNV-3014",
    title: "Haggling Over Price",
    topic: "Shopping",
    category: "Shopping",
    turns: [
      {
        id: "t6",
        order: 1,
        speaker: "Customer",
        sentenceId: sentence("s2").id,
      }, // how much is this?
      {
        id: "t7",
        order: 2,
        speaker: "Customer",
        sentenceId: sentence("s6").id,
      }, // can you make it cheaper?
    ],
    status: "IN_REVIEW",
    createdBy: "Nusrat Jahan",
    createdAt: "2026-09-05T09:00:00Z",
    updatedAt: "2026-09-09T11:00:00Z",
  },
];
