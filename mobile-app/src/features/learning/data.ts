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

const LEARN_SECTIONS: readonly string[] = [
  "words",
  "sentences",
  "conversations",
];

export function isLearnSection(value: unknown): value is LearnSection {
  return typeof value === "string" && LEARN_SECTIONS.includes(value);
}

export type LearningProductId = LearnSection | "curriculum";
export type LearningProductAccess = "free" | "mixed" | "premium";
export type LearningLessonAccess = "free" | "premium";
export type LearningItemKind =
  "word" | "sentence" | "conversation-line" | "exercise";

export function isLearningProductId(
  value: unknown,
): value is LearningProductId {
  return (
    value === "curriculum" ||
    (typeof value === "string" && LEARN_SECTIONS.includes(value))
  );
}

export type Phrase = {
  arabic: string;
  pronunciation: string;
  translation: string;
  category: string;
};

export type LessonStatus = "done" | "current" | "locked";

export type GrammaticalVariantFixture = {
  form: string;
  arabic: string;
  transliteration?: string;
  meaningEn?: string;
  meaningBn?: string;
};

export type ExampleSentenceFixture = {
  arabic: string;
  transliteration: string;
  meaningEn: string;
  meaningBn?: string;
};

export type LearningContentItemFixture = {
  id: string;
  kind: LearningItemKind;
  arabic: string;
  transliteration: string;
  meaningBn: string;
  meaningEn: string;
  audioAvailable: boolean;
  speaker?: string;
  whenToUseEn?: string;
  whenToUseBn?: string;
  wordType?: string;
  category?: string;
  feminineEn?: string;
  feminineBn?: string;
  noteEn?: string;
  noteBn?: string;
  imageUrl?: string;
  grammaticalVariants?: GrammaticalVariantFixture[];
  exampleSentences?: ExampleSentenceFixture[];
};

export type Lesson = {
  id: string;
  title: string;
  status: LessonStatus;
  completed: number;
  total: number;
  isPro?: boolean;
};

export type LearningLessonFixture = Lesson & {
  access: LearningLessonAccess;
  sampleItemIds: string[];
  dayNumber?: number;
  objective?: string;
};

export type LearningLevelFixture = {
  id: string;
  title: string;
  lessons: LearningLessonFixture[];
};

export type LearningSectionFixture = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  levels?: LearningLevelFixture[];
  lessons?: LearningLessonFixture[];
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
      {
        id: "w1",
        title: "Greetings at the shop",
        status: "done",
        completed: 5,
        total: 5,
      },
      {
        id: "w2",
        title: "Numbers & prices",
        status: "done",
        completed: 5,
        total: 5,
      },
      {
        id: "w3",
        title: "Colours & sizes",
        status: "done",
        completed: 5,
        total: 5,
      },
      {
        id: "w4",
        title: "Useful shopping words",
        status: "current",
        completed: 7,
        total: 10,
      },
      {
        id: "w5",
        title: "Paying & receipts",
        status: "locked",
        completed: 0,
        total: 6,
      },
      {
        id: "w6",
        title: "Returns & exchanges",
        status: "locked",
        completed: 0,
        total: 6,
      },
    ],
    phrases: [
      {
        arabic: "سُوق",
        pronunciation: "sūq",
        translation: "market",
        category: "Shopping",
      },
      {
        arabic: "كَم؟",
        pronunciation: "kam?",
        translation: "how much?",
        category: "Prices & money",
      },
      {
        arabic: "غَالِي",
        pronunciation: "ghālī",
        translation: "expensive",
        category: "Prices & money",
      },
      {
        arabic: "رَخِيص",
        pronunciation: "rakhīṣ",
        translation: "cheap",
        category: "Prices & money",
      },
      {
        arabic: "مَاء",
        pronunciation: "māʾ",
        translation: "water",
        category: "Everyday essentials",
      },
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
      {
        id: "s2",
        title: "Introducing yourself",
        status: "done",
        completed: 6,
        total: 6,
      },
      {
        id: "s3",
        title: "Shopping",
        status: "current",
        completed: 3,
        total: 6,
      },
      {
        id: "s4",
        title: "Restaurant",
        status: "locked",
        completed: 0,
        total: 6,
      },
      {
        id: "s5",
        title: "Transportation",
        status: "locked",
        completed: 0,
        total: 6,
      },
    ],
    phrases: [
      {
        arabic: "كَم هَذا؟",
        pronunciation: "kam hādhā?",
        translation: "How much is this?",
        category: "Shopping",
      },
      {
        arabic: "أُريدُ ماءً، مِن فَضلِك",
        pronunciation: "urīdu māʾan, min faḍlik",
        translation: "I'd like some water, please.",
        category: "At a café",
      },
      {
        arabic: "أَينَ السُّوق؟",
        pronunciation: "ayna as-sūq?",
        translation: "Where is the market?",
        category: "Finding your way",
      },
      {
        arabic: "مُمْكِن الحِسَاب؟",
        pronunciation: "mumkin al-ḥisāb?",
        translation: "Can I have the bill?",
        category: "Restaurant",
      },
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
      {
        id: "c2",
        title: "At the shop",
        status: "done",
        completed: 5,
        total: 5,
      },
      {
        id: "c3",
        title: "At the restaurant",
        status: "current",
        completed: 2,
        total: 5,
      },
      {
        id: "c4",
        title: "Elementary conversations",
        status: "locked",
        completed: 0,
        total: 8,
        isPro: true,
      },
      {
        id: "c5",
        title: "Intermediate conversations",
        status: "locked",
        completed: 0,
        total: 8,
        isPro: true,
      },
    ],
    phrases: [
      {
        arabic: "مَرْحَبًا، كَيْفَ حالُكَ؟",
        pronunciation: "marḥaban, kayfa ḥāluka?",
        translation: "Hello, how are you?",
        category: "Meeting someone",
      },
      {
        arabic: "أُريدُ هَذا، مِن فَضلِك",
        pronunciation: "urīdu hādhā, min faḍlik",
        translation: "I'd like this, please.",
        category: "At the market",
      },
      {
        arabic: "هَل تَتَكَلَّمُ الإِنْجِليزِيَّة؟",
        pronunciation: "hal tatakallamu al-injlīziyya?",
        translation: "Do you speak English?",
        category: "Getting started",
      },
    ],
  },
];

/** Mock-only catalog and content previews for designing the learning flows. */
export const isLearningCatalogMock = true;

export const learningContentItems: LearningContentItemFixture[] = [
  {
    id: "demo-word-greeting",
    kind: "word",
    arabic: "مَرْحَبًا",
    transliteration: "marḥaban",
    meaningBn: "হ্যালো / স্বাগতম",
    meaningEn: "Hello / Welcome",
    audioAvailable: true,
    wordType: "Greeting",
    category: "Greetings & Courtesy",
    whenToUseEn: "A friendly, polite greeting used at any time of day when meeting friends, colleagues, or strangers.",
    whenToUseBn: "যেকোনো সময়ে কারো সাথে সাক্ষাতে কুশলবিনিময়ে ব্যবহৃত একটি সার্বজনীন ও বিনম্র সম্ভাষণ।",
    feminineEn: "When addressing a female, you can say 'marḥaban biki' (مَرْحَبًا بِكِ).",
    feminineBn: "কোনো নারীকে সম্বোধনে 'মারহাবান বিকি' (مَرْحَبًا بِكِ) বলা হয়।",
    grammaticalVariants: [
      {
        form: "SINGULAR",
        arabic: "مَرْحَبًا",
        transliteration: "marḥaban",
        meaningEn: "Hello / Welcome",
        meaningBn: "স্বাগতম",
      },
      {
        form: "PLURAL",
        arabic: "مَرْحَبًا بِكُمْ",
        transliteration: "marḥaban bikum",
        meaningEn: "Welcome to all of you",
        meaningBn: "আপনাদের সবাইকে স্বাগতম",
      },
      {
        form: "FEMININE",
        arabic: "مَرْحَبًا بِكِ",
        transliteration: "marḥaban biki",
        meaningEn: "Welcome to you (fem.)",
        meaningBn: "তোমাকে স্বাগতম (স্ত্রীলিঙ্গ)",
      },
    ],
    exampleSentences: [
      {
        arabic: "مَرْحَبًا، يَا صَدِيقِي!",
        transliteration: "marḥaban, yā ṣadīqī!",
        meaningEn: "Hello, my friend!",
        meaningBn: "হ্যালো, আমার বন্ধু!",
      },
      {
        arabic: "مَرْحَبًا بِكُمْ فِي مَنْزِلِي.",
        transliteration: "marḥaban bikum fī manzilī.",
        meaningEn: "Welcome to my home.",
        meaningBn: "আমার বাড়িতে আপনাদের স্বাগতম।",
      },
      {
        arabic: "مَرْحَبًا، كَيْفَ أَسْتَطِيعُ مُسَاعَدَتَكَ؟",
        transliteration: "marḥaban, kayfa astaṭīʿu musāʿadatak?",
        meaningEn: "Hello, how can I help you?",
        meaningBn: "হ্যালো, আমি আপনাকে কীভাবে সাহায্য করতে পারি?",
      },
    ],
  },
  {
    id: "demo-word-thanks",
    kind: "word",
    arabic: "شُكْرًا",
    transliteration: "shukran",
    meaningBn: "ধন্যবাদ",
    meaningEn: "Thank you",
    audioAvailable: true,
    wordType: "Noun",
    category: "Courtesy & Manners",
    whenToUseEn: "Used in everyday speech to express gratitude for a favor, service, gift, or kind gesture.",
    whenToUseBn: "দৈনন্দিন জীবনে কোনো উপকার, সেবা বা উপহারের জন্য আন্তরিক কৃতজ্ঞতা জানাতে ব্যবহৃত হয়।",
    feminineEn: "Common courteous response: 'ʿafwan' (عَفْوًا) meaning 'You are welcome'.",
    feminineBn: "কৃতজ্ঞতার জবাবে বিনম্রভাবে বলা হয় 'আফওয়ান' (عَفْوًا) যার অর্থ 'আপনাকেও স্বাগতম' বা 'কিছু না'。",
    grammaticalVariants: [
      {
        form: "EMPHATIC",
        arabic: "شُكْرًا جَزِيلًا",
        transliteration: "shukran jazīlan",
        meaningEn: "Thank you very much",
        meaningBn: "অনেক অনেক ধন্যবাদ",
      },
      {
        form: "VERBAL (MASC.)",
        arabic: "أَشْكُرُكَ",
        transliteration: "ashkuruka",
        meaningEn: "I thank you (masc.)",
        meaningBn: "আমি তোমাকে ধন্যবাদ জানাই",
      },
      {
        form: "VERBAL (FEM.)",
        arabic: "أَشْكُرُكِ",
        transliteration: "ashkuruki",
        meaningEn: "I thank you (fem.)",
        meaningBn: "আমি তোমাকে ধন্যবাদ জানাই (স্ত্রীলিঙ্গ)",
      },
    ],
    exampleSentences: [
      {
        arabic: "شُكْرًا جَزِيلًا عَلَى المُسَاعَدَةِ.",
        transliteration: "shukran jazīlan ʿalā al-musāʿadah.",
        meaningEn: "Thank you very much for the help.",
        meaningBn: "সাহায্যের জন্য আপনাকে অনেক ধন্যবাদ।",
      },
      {
        arabic: "شُكْرًا لَكَ عَلَى حُسْنِ ضِيَافَتِكَ.",
        transliteration: "shukran laka ʿalā ḥusni ḍiyāfatik.",
        meaningEn: "Thank you for your warm hospitality.",
        meaningBn: "আপনার চমৎকার আতিথেয়তার জন্য ধন্যবাদ।",
      },
    ],
  },
  {
    id: "demo-word-market",
    kind: "word",
    arabic: "سُوق",
    transliteration: "sūq",
    meaningBn: "বাজার",
    meaningEn: "Market / Bazaar",
    audioAvailable: true,
    wordType: "Noun",
    category: "Shopping & Places",
    whenToUseEn: "Used when referring to open-air bazaars, supermarkets, or going out to purchase goods.",
    whenToUseBn: "হাট-বাজার, মার্কেট বা কোনো কেনাকাটা করতে যাওয়ার স্থান নির্দেশ করতে ব্যবহৃত হয়।",
    feminineEn: "Grammatically masculine singular noun.",
    feminineBn: "ব্যাকরণগতভাবে পুংলিঙ্গ একবচন বিশেষ্য পদ।",
    grammaticalVariants: [
      {
        form: "SINGULAR",
        arabic: "سُوق",
        transliteration: "sūq",
        meaningEn: "Market",
        meaningBn: "বাজার",
      },
      {
        form: "PLURAL",
        arabic: "أَسْوَاق",
        transliteration: "aswāq",
        meaningEn: "Markets",
        meaningBn: "বাজারসমূহ",
      },
    ],
    exampleSentences: [
      {
        arabic: "أَنَا ذَاهِبٌ إِلَى السُّوقِ.",
        transliteration: "anā dhāhibun ilā as-sūq.",
        meaningEn: "I am going to the market.",
        meaningBn: "আমি বাজারে যাচ্ছি।",
      },
      {
        arabic: "السُّوقُ قَرِيبٌ مِنْ هُنَا.",
        transliteration: "as-sūqu qarībun min hunā.",
        meaningEn: "The market is near here.",
        meaningBn: "বাজারটি এখান থেকে কাছেই।",
      },
    ],
  },
  {
    id: "demo-word-water",
    kind: "word",
    arabic: "مَاء",
    transliteration: "māʾ",
    meaningBn: "পানি",
    meaningEn: "Water",
    audioAvailable: true,
    wordType: "Noun",
    category: "Food & Refreshments",
    whenToUseEn: "Essential noun for ordering drinks, dining, or asking for pure water.",
    whenToUseBn: "তৃষ্ণা পেলে বা রেস্তোরাঁয় খাবার খাওয়ার সময় খাবার পানি চাওয়ার জন্য ব্যবহৃত প্রধান শব্দ।",
    feminineEn: "Grammatically masculine singular noun.",
    feminineBn: "ব্যাকরণগতভাবে পুংলিঙ্গ একবচন বিশেষ্য পদ।",
    grammaticalVariants: [
      {
        form: "SINGULAR",
        arabic: "مَاء",
        transliteration: "māʾ",
        meaningEn: "Water",
        meaningBn: "পানি",
      },
      {
        form: "PLURAL",
        arabic: "مِيَاه",
        transliteration: "miyāh",
        meaningEn: "Waters / Water supplies",
        meaningBn: "পানি বা জলাশয়সমূহ",
      },
    ],
    exampleSentences: [
      {
        arabic: "أُرِيدُ كُوبًا مِنَ المَاءِ، مِنْ فَضْلِكَ.",
        transliteration: "urīdu kūban mina al-māʾ, min faḍlik.",
        meaningEn: "I would like a glass of water, please.",
        meaningBn: "দয়া করে আমাকে এক গ্লাস পানি দিন।",
      },
      {
        arabic: "هَلِ المَاءُ بَارِدٌ؟",
        transliteration: "hal al-māʾu bārid?",
        meaningEn: "Is the water cold?",
        meaningBn: "পানিটি কি ঠান্ডা?",
      },
    ],
  },
  {
    id: "demo-sentence-how-are-you",
    kind: "sentence",
    arabic: "كَيْفَ حَالُكَ؟",
    transliteration: "kayfa ḥāluka?",
    meaningBn: "আপনি কেমন আছেন?",
    meaningEn: "How are you?",
    audioAvailable: true,
    wordType: "Interrogative",
    category: "Daily Questions",
    whenToUseEn: "Standard polite question used after greeting someone to ask about their health or wellbeing.",
    whenToUseBn: "কুশলবিনিময়ের পর কারো শারীরিক বা মানসিক অবস্থা জানতে অত্যন্ত মার্জিতভাবে ব্যবহৃত প্রশ্ন।",
    feminineEn: "When addressing a female, say 'kayfa ḥāluki?' (كَيْفَ حَالُكِ؟) with kasrah on the kāf.",
    feminineBn: "কোনো নারীকে জিজ্ঞেস করার সময় 'কাইফা হালুকি?' (كَيْفَ حَالُكِ؟) বলতে হয়।",
    grammaticalVariants: [
      {
        form: "MASCULINE",
        arabic: "كَيْفَ حَالُكَ؟",
        transliteration: "kayfa ḥāluka?",
        meaningEn: "How are you? (to a male)",
        meaningBn: "আপনি কেমন আছেন? (পুরুষ)",
      },
      {
        form: "FEMININE",
        arabic: "كَيْفَ حَالُكِ؟",
        transliteration: "kayfa ḥāluki?",
        meaningEn: "How are you? (to a female)",
        meaningBn: "আপনি কেমন আছেন? (নারী)",
      },
      {
        form: "PLURAL",
        arabic: "كَيْفَ حَالُكُمْ؟",
        transliteration: "kayfa ḥālukum?",
        meaningEn: "How are you all?",
        meaningBn: "আপনারা সবাই কেমন আছেন?",
      },
    ],
    exampleSentences: [
      {
        arabic: "مَرْحَبًا، كَيْفَ حَالُكَ اليَوْمَ؟",
        transliteration: "marḥaban, kayfa ḥāluka al-yawm?",
        meaningEn: "Hello, how are you today?",
        meaningBn: "হ্যালো, আজ আপনি কেমন আছেন?",
      },
      {
        arabic: "أَنَا بِخَيْرٍ، وَكَيْفَ حَالُكَ أَنْتَ؟",
        transliteration: "anā bikhayr, wa-kayfa ḥāluka anta?",
        meaningEn: "I am well, and how are you?",
        meaningBn: "আমি ভালো আছি, আর আপনি কেমন আছেন?",
      },
    ],
  },
  {
    id: "demo-sentence-name",
    kind: "sentence",
    arabic: "اِسْمِي عَلِيّ",
    transliteration: "ismī ʿAliyy",
    meaningBn: "আমার নাম আলী।",
    meaningEn: "My name is Ali.",
    audioAvailable: true,
    wordType: "Declarative",
    category: "Introductions",
    whenToUseEn: "Used when introducing your name to new acquaintances in personal or professional settings.",
    whenToUseBn: "নতুন কারো সাথে পরিচিত হওয়ার সময় নিজের নাম প্রকাশ করতে ব্যবহৃত বাক্য।",
    exampleSentences: [
      {
        arabic: "تَشَرَّفْنَا، اِسْمِي عَلِيّ.",
        transliteration: "tasharrafnā, ismī ʿAliyy.",
        meaningEn: "Nice to meet you, my name is Ali.",
        meaningBn: "আপনার সাথে দেখা হয়ে ভালো লাগলো, আমার নাম আলী।",
      },
    ],
  },
  {
    id: "demo-sentence-price",
    kind: "sentence",
    arabic: "كَمْ هَذَا؟",
    transliteration: "kam hādhā?",
    meaningBn: "এটার দাম কত?",
    meaningEn: "How much is this?",
    audioAvailable: true,
    wordType: "Interrogative",
    category: "Shopping & Prices",
    whenToUseEn: "Crucial question when inquiring about the price of an item in a store, souq, or restaurant.",
    whenToUseBn: "বাজারে বা দোকানে কোনো পণ্যের দাম জানার জন্য অত্যন্ত প্রয়োজনীয় একটি প্রশ্ন।",
    feminineEn: "For a feminine item: 'kam hādhihi?' (كَمْ هَذِهِ؟).",
    feminineBn: "স্ত্রীলিঙ্গ কোনো পণ্যের ক্ষেত্রে 'কাম হাযিহী?' (كَمْ هَذِهِ؟) বলা হয়।",
    exampleSentences: [
      {
        arabic: "مِنْ فَضْلِكَ، كَمْ هَذَا القَمِيصُ؟",
        transliteration: "min faḍlika, kam hādhā al-qamīṣ?",
        meaningEn: "Please, how much is this shirt?",
        meaningBn: "দয়া করে বলুন, এই জামাটির দাম কত?",
      },
    ],
  },
  {
    id: "demo-sentence-water",
    kind: "sentence",
    arabic: "أُرِيدُ مَاءً، مِنْ فَضْلِكَ.",
    transliteration: "urīdu māʾan, min faḍlik.",
    meaningBn: "দয়া করে, আমি পানি চাই।",
    meaningEn: "I would like water, please.",
    audioAvailable: true,
    wordType: "Request",
    category: "Polite Requests",
    whenToUseEn: "Polite, respectful way to request drinking water in a restaurant, café, flight, or hotel.",
    whenToUseBn: "রেস্তোরাঁয়, বিমানে বা হোটেলে বিনম্রভাবে খাবার পানি চাওয়ার জন্য ব্যবহৃত হয়।",
    exampleSentences: [
      {
        arabic: "أَنَا عَطْشَانُ، أُرِيدُ مَاءً، مِنْ فَضْلِكَ.",
        transliteration: "anā ʿaṭshān, urīdu māʾan, min faḍlik.",
        meaningEn: "I am thirsty, I would like water, please.",
        meaningBn: "আমি তৃষ্ণার্ত, দয়া করে আমাকে পানি দিন।",
      },
    ],
  },
  {
    id: "demo-conversation-greeting-1",
    kind: "conversation-line",
    arabic: "مَرْحَبًا، كَيْفَ حَالُكَ؟",
    transliteration: "marḥaban, kayfa ḥāluka?",
    meaningBn: "হ্যালো, আপনি কেমন আছেন?",
    meaningEn: "Hello, how are you?",
    audioAvailable: true,
    speaker: "ليلى · Layla",
  },
  {
    id: "demo-conversation-greeting-2",
    kind: "conversation-line",
    arabic: "أَنَا بِخَيْرٍ، شُكْرًا.",
    transliteration: "anā bikhayr, shukran.",
    meaningBn: "আমি ভালো আছি, ধন্যবাদ।",
    meaningEn: "I am well, thank you.",
    audioAvailable: false,
    speaker: "عَلِيّ · Ali",
  },
  {
    id: "demo-conversation-shopping-1",
    kind: "conversation-line",
    arabic: "كَمْ هَذَا؟",
    transliteration: "kam hādhā?",
    meaningBn: "এটার দাম কত?",
    meaningEn: "How much is this?",
    audioAvailable: true,
    speaker: "المُشْتَرِي · Customer",
  },
  {
    id: "demo-conversation-shopping-2",
    kind: "conversation-line",
    arabic: "بِعَشَرَةِ رِيَالَاتٍ.",
    transliteration: "bi-ʿasharati riyālāt.",
    meaningBn: "দশ রিয়াল।",
    meaningEn: "Ten riyals.",
    audioAvailable: false,
    speaker: "البَائِع · Shopkeeper",
  },
];

function mockLesson(
  id: string,
  title: string,
  status: LessonStatus,
  sampleItemIds: string[],
  access: LearningLessonAccess = "free",
  details: Pick<LearningLessonFixture, "dayNumber" | "objective"> = {},
): LearningLessonFixture {
  const total = sampleItemIds.length;
  return {
    id,
    title,
    status,
    completed: status === "done" ? total : status === "current" ? 1 : 0,
    total,
    access,
    sampleItemIds,
    ...details,
  };
}

const wordsSections: LearningSectionFixture[] = [
  {
    id: "words-greetings",
    title: "Greetings & Polite Expressions",
    description: "Friendly words for meeting people and showing courtesy.",
    icon: Sun,
    levels: [
      {
        id: "words-greetings-beginner",
        title: "Beginner",
        lessons: [
          mockLesson("demo-wg-1", "Hello and welcome", "done", [
            "demo-word-greeting",
            "demo-word-thanks",
          ]),
          mockLesson("demo-wg-2", "Polite everyday words", "current", [
            "demo-word-thanks",
          ]),
          mockLesson("demo-wg-3", "A little more practice", "locked", [
            "demo-word-greeting",
          ]),
        ],
      },
      {
        id: "words-greetings-elementary",
        title: "Elementary",
        lessons: [
          mockLesson("demo-wg-4", "Warm expressions", "locked", [
            "demo-word-greeting",
          ]),
          mockLesson("demo-wg-5", "Everyday courtesies", "locked", [
            "demo-word-thanks",
          ]),
        ],
      },
    ],
  },
  {
    id: "words-numbers",
    title: "Numbers & Prices",
    description: "Recognize useful numbers when shopping and travelling.",
    icon: BookOpen,
    lessons: [
      mockLesson("demo-wn-1", "Counting essentials", "current", [
        "demo-word-market",
      ]),
      mockLesson("demo-wn-2", "Prices and amounts", "locked", [
        "demo-word-water",
      ]),
    ],
  },
  {
    id: "words-food",
    title: "Food & Drinks",
    description: "Learn common words for meals, cafés, and markets.",
    icon: Utensils,
    lessons: [
      mockLesson("demo-wf-1", "Drinks and refreshments", "done", [
        "demo-word-water",
      ]),
      mockLesson("demo-wf-2", "At the table", "locked", ["demo-word-water"]),
    ],
  },
  {
    id: "words-shopping",
    title: "Shopping",
    description: "Find everyday vocabulary for shops and markets.",
    icon: ShoppingBag,
    levels: [
      {
        id: "words-shopping-beginner",
        title: "Beginner",
        lessons: [
          mockLesson("demo-ws-1", "At the market", "done", [
            "demo-word-market",
          ]),
          mockLesson("demo-ws-2", "Useful essentials", "current", [
            "demo-word-water",
          ]),
        ],
      },
    ],
  },
  {
    id: "words-transport",
    title: "Transportation",
    description: "Practice words for getting around town.",
    icon: Bus,
    lessons: [
      mockLesson("demo-wt-1", "Getting around", "locked", [
        "demo-word-greeting",
      ]),
      mockLesson("demo-wt-2", "On the way", "locked", ["demo-word-market"]),
    ],
  },
];

const sentencesSections: LearningSectionFixture[] = [
  {
    id: "sentences-greetings",
    title: "Greetings",
    description: "Start a friendly exchange and ask how someone is.",
    icon: Sun,
    levels: [
      {
        id: "sentences-greetings-beginner",
        title: "Beginner",
        lessons: [
          mockLesson("demo-sg-1", "Say hello", "done", [
            "demo-sentence-how-are-you",
          ]),
          mockLesson("demo-sg-2", "Ask how someone is", "current", [
            "demo-sentence-how-are-you",
          ]),
        ],
      },
    ],
  },
  {
    id: "sentences-introductions",
    title: "Introductions",
    description: "Share your name and make a simple introduction.",
    icon: MessagesSquare,
    lessons: [
      mockLesson("demo-si-1", "Introduce yourself", "done", [
        "demo-sentence-name",
      ]),
      mockLesson("demo-si-2", "Meet someone new", "locked", [
        "demo-sentence-how-are-you",
      ]),
    ],
  },
  {
    id: "sentences-food",
    title: "Food & Drinks",
    description: "Make a simple request at a café or restaurant.",
    icon: Utensils,
    levels: [
      {
        id: "sentences-food-beginner",
        title: "Beginner",
        lessons: [
          mockLesson("demo-sf-1", "Ask for water", "current", [
            "demo-sentence-water",
          ]),
          mockLesson("demo-sf-2", "Make a polite request", "locked", [
            "demo-sentence-water",
          ]),
        ],
      },
    ],
  },
  {
    id: "sentences-shopping",
    title: "Shopping",
    description: "Ask about prices and common shop items.",
    icon: ShoppingBag,
    lessons: [
      mockLesson("demo-ss-1", "Ask the price", "done", ["demo-sentence-price"]),
      mockLesson("demo-ss-2", "At the market", "locked", [
        "demo-sentence-price",
      ]),
    ],
  },
  {
    id: "sentences-transport",
    title: "Transportation",
    description: "Practice short phrases for a journey.",
    icon: Bus,
    lessons: [
      mockLesson("demo-st-1", "Find your way", "locked", [
        "demo-sentence-how-are-you",
      ]),
      mockLesson("demo-st-2", "Plan a trip", "locked", ["demo-sentence-name"]),
    ],
  },
];

const conversationSections: LearningSectionFixture[] = [
  {
    id: "conversations-greetings",
    title: "Meeting People",
    description: "Practice introductions and friendly first exchanges.",
    icon: MessagesSquare,
    lessons: [
      mockLesson("demo-cg-1", "A friendly greeting", "current", [
        "demo-conversation-greeting-1",
        "demo-conversation-greeting-2",
      ]),
      mockLesson(
        "demo-cg-2",
        "Getting acquainted",
        "locked",
        ["demo-conversation-greeting-1"],
        "premium",
      ),
      mockLesson(
        "demo-cg-3",
        "A longer introduction",
        "locked",
        ["demo-conversation-greeting-2"],
        "premium",
      ),
    ],
  },
  {
    id: "conversations-shopping",
    title: "At the Market",
    description: "Follow a short exchange between a customer and shopkeeper.",
    icon: ShoppingBag,
    lessons: [
      mockLesson("demo-cs-1", "Ask the price", "done", [
        "demo-conversation-shopping-1",
        "demo-conversation-shopping-2",
      ]),
      mockLesson(
        "demo-cs-2",
        "Choose an item",
        "locked",
        ["demo-conversation-shopping-1"],
        "premium",
      ),
      mockLesson(
        "demo-cs-3",
        "Pay at the shop",
        "locked",
        ["demo-conversation-shopping-2"],
        "premium",
      ),
    ],
  },
  {
    id: "conversations-restaurant",
    title: "At a Café",
    description: "Explore a practical conversation over food and drinks.",
    icon: Utensils,
    lessons: [
      mockLesson("demo-cr-1", "Order a drink", "current", [
        "demo-conversation-greeting-1",
        "demo-conversation-greeting-2",
      ]),
      mockLesson(
        "demo-cr-2",
        "Ask for the menu",
        "locked",
        ["demo-conversation-shopping-1"],
        "premium",
      ),
      mockLesson(
        "demo-cr-3",
        "Pay the bill",
        "locked",
        ["demo-conversation-shopping-2"],
        "premium",
      ),
    ],
  },
  {
    id: "conversations-travel",
    title: "Getting Around",
    description: "Practice asking for help while travelling.",
    icon: Bus,
    lessons: [
      mockLesson("demo-ct-1", "Ask for directions", "current", [
        "demo-conversation-greeting-1",
        "demo-conversation-greeting-2",
      ]),
      mockLesson(
        "demo-ct-2",
        "Find a taxi",
        "locked",
        ["demo-conversation-shopping-1"],
        "premium",
      ),
      mockLesson(
        "demo-ct-3",
        "Plan the next stop",
        "locked",
        ["demo-conversation-shopping-2"],
        "premium",
      ),
    ],
  },
];

const curriculumSections: LearningSectionFixture[] = [
  {
    id: "curriculum-foundations",
    title: "Arabic Foundations",
    description:
      "A sample sequence of short lessons for a structured study plan.",
    icon: BookOpen,
    lessons: [
      mockLesson(
        "demo-curriculum-day-1",
        "Day 1 · Sounds and greetings",
        "done",
        ["demo-word-greeting"],
        "premium",
        {
          dayNumber: 1,
          objective: "Recognize a greeting and respond politely.",
        },
      ),
      mockLesson(
        "demo-curriculum-day-2",
        "Day 2 · Introductions",
        "current",
        ["demo-sentence-name"],
        "premium",
        {
          dayNumber: 2,
          objective: "Introduce yourself with a short sentence.",
        },
      ),
      mockLesson(
        "demo-curriculum-day-3",
        "Day 3 · Everyday words",
        "locked",
        ["demo-word-water"],
        "premium",
        {
          dayNumber: 3,
          objective: "Review useful words for daily situations.",
        },
      ),
      mockLesson(
        "demo-curriculum-day-4",
        "Day 4 · Simple requests",
        "locked",
        ["demo-sentence-water"],
        "premium",
        {
          dayNumber: 4,
          objective: "Make a polite request.",
        },
      ),
      mockLesson(
        "demo-curriculum-day-5",
        "Day 5 · Ask a question",
        "locked",
        ["demo-sentence-price"],
        "premium",
        {
          dayNumber: 5,
          objective: "Ask a simple question in a shop.",
        },
      ),
      mockLesson(
        "demo-curriculum-day-6",
        "Day 6 · Short dialogue",
        "locked",
        ["demo-conversation-greeting-1"],
        "premium",
        {
          dayNumber: 6,
          objective: "Follow a short two-person exchange.",
        },
      ),
      mockLesson(
        "demo-curriculum-day-7",
        "Day 7 · Review",
        "locked",
        ["demo-word-thanks"],
        "premium",
        {
          dayNumber: 7,
          objective: "Review the week’s sample vocabulary.",
        },
      ),
    ],
  },
];

export type LearningProductFixture = {
  id: LearningProductId;
  title: string;
  description: string;
  access: LearningProductAccess;
  icon: LucideIcon;
  tileClass: string;
  iconColor: string;
  sections: LearningSectionFixture[];
};

export const learningProducts: LearningProductFixture[] = [
  {
    id: "words",
    title: "Words",
    description: "Build practical Arabic vocabulary, one topic at a time.",
    access: "free",
    icon: BookOpen,
    tileClass: "bg-primary-subtle",
    iconColor: "#15803d",
    sections: wordsSections,
  },
  {
    id: "sentences",
    title: "Sentences",
    description: "Practice useful sentences for everyday situations.",
    access: "free",
    icon: MessageSquareText,
    tileClass: "bg-secondary-subtle",
    iconColor: "#b45309",
    sections: sentencesSections,
  },
  {
    id: "conversations",
    title: "Conversations",
    description: "Explore sample dialogues and premium conversation topics.",
    access: "mixed",
    icon: MessagesSquare,
    tileClass: "bg-sky-50",
    iconColor: "#0369a1",
    sections: conversationSections,
  },
  {
    id: "curriculum",
    title: "Premium Curriculum",
    description: "A separate, structured day-by-day learning path.",
    access: "premium",
    icon: BookOpen,
    tileClass: "bg-secondary-subtle",
    iconColor: "#b45309",
    sections: curriculumSections,
  },
];

export function getLearningProduct(
  productId: LearningProductId,
): LearningProductFixture {
  const product = learningProducts.find((item) => item.id === productId);
  if (!product) {
    throw new Error(`Unknown learning product: ${productId}`);
  }
  return product;
}

export function getLearningContentItem(
  itemId: string,
): LearningContentItemFixture | undefined {
  return learningContentItems.find((item) => item.id === itemId);
}

export type LearningScreenId =
  | "home"
  | "product-explorer"
  | "section-details"
  | "lesson-list"
  | "word-learning"
  | "sentence-learning"
  | "conversation-list"
  | "conversation-learning"
  | "curriculum-overview"
  | "lesson-completion"
  | "progress";

export type LearningScreenMapEntry = {
  screen: LearningScreenId;
  route: "/home" | "/learn" | "/progress" | "/curriculum";
  navigation: "tab" | "learn-selection" | "route";
  status: "existing" | "planned";
};

/** Existing Expo Router paths and planned Learn-tab states. */
export const learningScreenMap: LearningScreenMapEntry[] = [
  { screen: "home", route: "/home", navigation: "tab", status: "existing" },
  {
    screen: "product-explorer",
    route: "/learn",
    navigation: "tab",
    status: "existing",
  },
  {
    screen: "section-details",
    route: "/learn",
    navigation: "learn-selection",
    status: "existing",
  },
  {
    screen: "lesson-list",
    route: "/learn",
    navigation: "learn-selection",
    status: "existing",
  },
  {
    screen: "word-learning",
    route: "/learn",
    navigation: "learn-selection",
    status: "existing",
  },
  {
    screen: "sentence-learning",
    route: "/learn",
    navigation: "learn-selection",
    status: "existing",
  },
  {
    screen: "conversation-list",
    route: "/learn",
    navigation: "learn-selection",
    status: "existing",
  },
  {
    screen: "conversation-learning",
    route: "/learn",
    navigation: "learn-selection",
    status: "existing",
  },
  {
    screen: "curriculum-overview",
    route: "/curriculum",
    navigation: "route",
    status: "existing",
  },
  {
    screen: "lesson-completion",
    route: "/learn",
    navigation: "learn-selection",
    status: "existing",
  },
  {
    screen: "progress",
    route: "/progress",
    navigation: "tab",
    status: "existing",
  },
];

export type LearningNavigationState = {
  productId: LearningProductId;
  sectionId?: string;
  levelId?: string;
  lessonId?: string;
};

export function getCourse(section: LearnSection): Course {
  return courses.find((course) => course.id === section) ?? courses[0];
}

export const skillProgress = [
  {
    id: "words",
    label: "Words",
    done: 80,
    total: 100,
    icon: BookOpen,
    color: "#15803d",
    tileClass: "bg-primary-subtle",
  },
  {
    id: "sentences",
    label: "Sentences",
    done: 60,
    total: 100,
    icon: MessageSquareText,
    color: "#b45309",
    tileClass: "bg-secondary-subtle",
  },
  {
    id: "conversations",
    label: "Conversations",
    done: 20,
    total: 50,
    icon: MessagesSquare,
    color: "#0369a1",
    tileClass: "bg-sky-50",
  },
];

export const recentXp = [
  {
    id: "x1",
    amount: 20,
    label: "Lesson completed",
    detail: "Shopping · Lesson 3",
    when: "Today",
  },
  {
    id: "x2",
    amount: 5,
    label: "Word completed",
    detail: "غَالِي · expensive",
    when: "Today",
  },
  {
    id: "x3",
    amount: 30,
    label: "Conversation completed",
    detail: "At the shop",
    when: "Yesterday",
  },
];
