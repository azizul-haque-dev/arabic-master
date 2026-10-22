import {
  BookOpen,
  Briefcase,
  Bus,
  MessageSquareText,
  MessagesSquare,
  ShoppingBag,
  Sun,
  Utensils,
  type LucideIcon,
} from "lucide-react-native";

import type { PracticeDuration } from "@/features/onboarding/store";

/**
 * Mock learning content for the tab screens.
 * There is no API contract yet; keep all placeholder data here so it can be
 * swapped for server state (TanStack Query) in one place later.
 */

export type LearnSection = "words" | "sentences" | "conversations";

const LEARN_SECTIONS: readonly string[] = ["words", "sentences", "conversations"];

export function isLearnSection(value: unknown): value is LearnSection {
  return typeof value === "string" && LEARN_SECTIONS.includes(value);
}

export type Phrase = {
  arabic: string;
  pronunciation: string;
  translation: string;
  category: string;
};

export type LessonStatus = "done" | "current" | "locked";

export type Lesson = {
  id: string;
  title: string;
  status: LessonStatus;
  completed: number;
  total: number;
  isPro?: boolean;
};

export type Course = {
  id: LearnSection;
  title: string;
  subtitle: string;
  pathTitle: string;
  icon: LucideIcon;
  tileClass: string;
  iconColor: string;
  lessons: Lesson[];
  phrases: Phrase[];
};

export const learner = {
  firstName: "Aziz",
  fullName: "Azizul Haque",
  email: "aziz@example.com",
  initials: "AH",
  streakDays: 7,
  longestStreak: 12,
  xp: 420,
  level: 4,
  nextLevelXp: 500,
  hearts: 4,
  maxHearts: 5,
  todayMinutes: 7,
  wordsLearned: 80,
  lessonsCompleted: 12,
};

export function goalMinutesFrom(duration: PracticeDuration | null): number {
  switch (duration) {
    case "5":
      return 5;
    case "15":
      return 15;
    case "20+":
      return 20;
    default:
      return 10;
  }
}

/** Minutes practised Monday → Sunday (mock). */
export const weeklyMinutes = [8, 12, 6, 14, 10, 11, 7];

export const continueLesson = {
  section: "words" as LearnSection,
  situation: "Shopping",
  lessonLabel: "Lesson 4",
  title: "Useful words for shopping",
  arabic: "سُوق",
  completed: 7,
  total: 10,
};

export const wordOfTheDay = {
  arabic: "شُكْرًا",
  pronunciation: "shukran",
  translation: "Thank you",
  exampleArabic: "شُكْرًا جَزِيلًا",
  exampleTranslation: "Thank you very much",
};

export type Situation = {
  id: string;
  title: string;
  arabic: string;
  lessons: number;
  progress: number;
  icon: LucideIcon;
  /** Matches an onboarding goal id so recommendations can be personalised. */
  goalId: string;
};

export const situations: Situation[] = [
  {
    id: "shopping",
    title: "Shopping",
    arabic: "تَسَوُّق",
    lessons: 6,
    progress: 0.7,
    icon: ShoppingBag,
    goalId: "Shopping",
  },
  {
    id: "daily-life",
    title: "Daily life",
    arabic: "يَوْمِيّ",
    lessons: 8,
    progress: 0.45,
    icon: Sun,
    goalId: "Everyday conversation",
  },
  {
    id: "restaurant",
    title: "Restaurant",
    arabic: "مَطْعَم",
    lessons: 5,
    progress: 0.2,
    icon: Utensils,
    goalId: "Restaurant & food",
  },
  {
    id: "work",
    title: "Work",
    arabic: "عَمَل",
    lessons: 7,
    progress: 0,
    icon: Briefcase,
    goalId: "Work",
  },
  {
    id: "transport",
    title: "Transport",
    arabic: "مُوَاصَلَات",
    lessons: 5,
    progress: 0,
    icon: Bus,
    goalId: "Transportation",
  },
];

export const courses: Course[] = [
  {
    id: "words",
    title: "Words",
    subtitle: "Practical everyday vocabulary",
    pathTitle: "Shopping · Section 1",
    icon: BookOpen,
    tileClass: "bg-primary-subtle",
    iconColor: "#15803d",
    lessons: [
      { id: "w1", title: "Greetings at the shop", status: "done", completed: 5, total: 5 },
      { id: "w2", title: "Numbers & prices", status: "done", completed: 5, total: 5 },
      { id: "w3", title: "Colours & sizes", status: "done", completed: 5, total: 5 },
      { id: "w4", title: "Useful shopping words", status: "current", completed: 7, total: 10 },
      { id: "w5", title: "Paying & receipts", status: "locked", completed: 0, total: 6 },
      { id: "w6", title: "Returns & exchanges", status: "locked", completed: 0, total: 6, isPro: true },
    ],
    phrases: [
      { arabic: "سُوق", pronunciation: "sūq", translation: "market", category: "Shopping" },
      { arabic: "كَم؟", pronunciation: "kam?", translation: "how much?", category: "Prices & money" },
      { arabic: "غَالِي", pronunciation: "ghālī", translation: "expensive", category: "Prices & money" },
      { arabic: "رَخِيص", pronunciation: "rakhīṣ", translation: "cheap", category: "Prices & money" },
      { arabic: "مَاء", pronunciation: "māʾ", translation: "water", category: "Everyday essentials" },
    ],
  },
  {
    id: "sentences",
    title: "Sentences",
    subtitle: "Useful daily sentences",
    pathTitle: "Daily life · Section 1",
    icon: MessageSquareText,
    tileClass: "bg-secondary-subtle",
    iconColor: "#b45309",
    lessons: [
      { id: "s1", title: "Greetings", status: "done", completed: 6, total: 6 },
      { id: "s2", title: "Introducing yourself", status: "done", completed: 6, total: 6 },
      { id: "s3", title: "Shopping", status: "current", completed: 3, total: 6 },
      { id: "s4", title: "Restaurant", status: "locked", completed: 0, total: 6 },
      { id: "s5", title: "Transportation", status: "locked", completed: 0, total: 6, isPro: true },
    ],
    phrases: [
      { arabic: "كَم هَذا؟", pronunciation: "kam hādhā?", translation: "How much is this?", category: "Shopping" },
      { arabic: "أُريدُ ماءً، مِن فَضلِك", pronunciation: "urīdu māʾan, min faḍlik", translation: "I'd like some water, please.", category: "At a café" },
      { arabic: "أَينَ السُّوق؟", pronunciation: "ayna as-sūq?", translation: "Where is the market?", category: "Finding your way" },
      { arabic: "مُمْكِن الحِسَاب؟", pronunciation: "mumkin al-ḥisāb?", translation: "Can I have the bill?", category: "Restaurant" },
    ],
  },
  {
    id: "conversations",
    title: "Conversations",
    subtitle: "Practise real dialogues",
    pathTitle: "Beginner",
    icon: MessagesSquare,
    tileClass: "bg-sky-50",
    iconColor: "#0369a1",
    lessons: [
      { id: "c1", title: "Greetings", status: "done", completed: 4, total: 4 },
      { id: "c2", title: "At the shop", status: "done", completed: 5, total: 5 },
      { id: "c3", title: "At the restaurant", status: "current", completed: 2, total: 5 },
      { id: "c4", title: "Elementary conversations", status: "locked", completed: 0, total: 8, isPro: true },
      { id: "c5", title: "Intermediate conversations", status: "locked", completed: 0, total: 8, isPro: true },
    ],
    phrases: [
      { arabic: "مَرْحَبًا، كَيْفَ حالُكَ؟", pronunciation: "marḥaban, kayfa ḥāluka?", translation: "Hello, how are you?", category: "Meeting someone" },
      { arabic: "أُريدُ هَذا، مِن فَضلِك", pronunciation: "urīdu hādhā, min faḍlik", translation: "I'd like this, please.", category: "At the market" },
      { arabic: "هَل تَتَكَلَّمُ الإِنْجِليزِيَّة؟", pronunciation: "hal tatakallamu al-injlīziyya?", translation: "Do you speak English?", category: "Getting started" },
    ],
  },
];

export function getCourse(section: LearnSection): Course {
  return courses.find((course) => course.id === section) ?? courses[0];
}

export const skillProgress = [
  { id: "words", label: "Words", done: 80, total: 100, icon: BookOpen, color: "#15803d", tileClass: "bg-primary-subtle" },
  { id: "sentences", label: "Sentences", done: 60, total: 100, icon: MessageSquareText, color: "#b45309", tileClass: "bg-secondary-subtle" },
  { id: "conversations", label: "Conversations", done: 20, total: 50, icon: MessagesSquare, color: "#0369a1", tileClass: "bg-sky-50" },
];

export const recentXp = [
  { id: "x1", amount: 20, label: "Lesson completed", detail: "Shopping · Lesson 3", when: "Today" },
  { id: "x2", amount: 5, label: "Word completed", detail: "غَالِي · expensive", when: "Today" },
  { id: "x3", amount: 30, label: "Conversation completed", detail: "At the shop", when: "Yesterday" },
];
