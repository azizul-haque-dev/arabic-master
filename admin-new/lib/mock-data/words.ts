import type { Word } from "@/lib/types/content";
import { mockArabicEntities } from "@/lib/mock-data/arabic-entities";

// helper so mock data can't silently reference a non-existent entity
function entity(id: string) {
  const found = mockArabicEntities.find((e) => e.id === id);
  if (!found) throw new Error(`mock word references missing entity id ${id}`);
  return found;
}

export const mockWords: Word[] = [
  {
    id: "w1",
    wordKey: "W-2048",
    entityId: entity("5").id, // شكراً
    arabicText: entity("5").arabicText,
    meaningBangla: "ধন্যবাদ",
    meaningEnglish: "Thank you",
    pronunciationBangla: "শুকরান",
    pronunciationEnglish: "Shukran",
    whenToUseBangla: "কারো সাহায্যের জন্য কৃতজ্ঞতা প্রকাশ করতে",
    whenToUseEnglish: "To express gratitude after someone helps you",
    wordType: "OTHER",
    category: "Greetings",
    lessonName: "Greetings — Lesson 1",
    status: "PUBLISHED",
    createdBy: "Rahim Ahmed",
    createdAt: "2026-06-16T09:00:00Z",
    updatedAt: "2026-09-05T13:30:00Z",
  },
  {
    id: "w2",
    wordKey: "W-2049",
    entityId: entity("8").id, // رخيص
    arabicText: entity("8").arabicText,
    meaningBangla: "সস্তা",
    meaningEnglish: "Cheap",
    pronunciationBangla: "রাখিস",
    pronunciationEnglish: "Rakhees",
    whenToUseBangla: "দাম কম বোঝাতে, সাধারণত shopping-এর সময়",
    whenToUseEnglish: "To describe a low price, typically while shopping",
    wordType: "ADJECTIVE",
    category: "Shopping",
    lessonName: "Shopping Basics — Lesson 1",
    status: "PUBLISHED",
    createdBy: "Rahim Ahmed",
    createdAt: "2026-05-21T09:00:00Z",
    updatedAt: "2026-08-11T09:00:00Z",
  },
  {
    id: "w3",
    wordKey: "W-2050",
    entityId: entity("1").id, // مرحبا
    arabicText: entity("1").arabicText,
    meaningBangla: "হ্যালো / স্বাগতম",
    meaningEnglish: "Hello / Welcome",
    pronunciationBangla: "মারহাবান",
    pronunciationEnglish: "Marhaban",
    whenToUseBangla: "যে কাউকে সাক্ষাতের শুরুতে অভিবাদন জানাতে",
    whenToUseEnglish: "General greeting used at the start of any interaction",
    wordType: "OTHER",
    category: "Greetings",
    lessonName: "Greetings — Lesson 1",
    status: "PUBLISHED",
    createdBy: "Rahim Ahmed",
    createdAt: "2026-06-04T09:00:00Z",
    updatedAt: "2026-09-08T14:20:00Z",
  },
  {
    id: "w4",
    wordKey: "W-2051",
    entityId: entity("4").id, // أريد هذا
    arabicText: entity("4").arabicText,
    meaningBangla: "আমি এটা চাই",
    meaningEnglish: "I want this",
    pronunciationBangla: "উরিদু হাযা",
    pronunciationEnglish: "Ureedu haza",
    whenToUseBangla: "দোকানে কিছু চাওয়ার সময়",
    whenToUseEnglish: "When pointing at something you want to buy",
    wordType: "VERB",
    category: "Shopping",
    status: "IN_REVIEW",
    createdBy: "Nusrat Jahan",
    createdAt: "2026-08-29T12:00:00Z",
    updatedAt: "2026-09-09T09:10:00Z",
  },
  {
    id: "w5",
    wordKey: "W-2052",
    entityId: entity("7").id, // بكم هذا؟
    arabicText: entity("7").arabicText,
    meaningBangla: "এটার দাম কত?",
    meaningEnglish: "How much is this?",
    pronunciationBangla: "বিকাম হাযা",
    pronunciationEnglish: "Bikam haza?",
    whenToUseBangla: "কোনো নির্দিষ্ট জিনিসের দাম জিজ্ঞাসা করতে",
    whenToUseEnglish: "Asking the price of a specific item you're holding or pointing at",
    wordType: "OTHER",
    category: "Shopping",
    status: "REJECTED",
    rejectionReason:
      "English pronunciation needs correction — should be closer to 'bi-kam' with a short pause.",
    createdBy: "Nusrat Jahan",
    createdAt: "2026-09-02T09:30:00Z",
    updatedAt: "2026-09-06T15:00:00Z",
  },
  {
    id: "w6",
    wordKey: "W-2053",
    entityId: entity("6").id, // أين الحمام؟
    arabicText: entity("6").arabicText,
    meaningBangla: "টয়লেট কোথায়?",
    meaningEnglish: "Where is the bathroom?",
    pronunciationBangla: "আইনাল হাম্মাম",
    pronunciationEnglish: "Aynal hammam?",
    whenToUseBangla: "রেস্টুরেন্ট বা পাবলিক জায়গায় টয়লেট খুঁজতে",
    whenToUseEnglish: "Asking for directions to a bathroom in a restaurant or public place",
    wordType: "OTHER",
    category: "Restaurant",
    status: "DRAFT",
    createdBy: "Nusrat Jahan",
    createdAt: "2026-09-07T10:30:00Z",
    updatedAt: "2026-09-07T10:30:00Z",
  },
];
