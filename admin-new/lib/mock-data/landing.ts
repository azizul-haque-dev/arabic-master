export interface MethodologyStep {
    id: string;
    number: string;
    title: string;
    description: string;
    icon: "compass" | "book" | "list" | "mic" | "replay" | "trending";
}

export const methodologySteps: MethodologyStep[] = [
    {
        id: "situation",
        number: "01",
        title: "Choose a situation",
        description: "Start with shopping, work, a restaurant, or daily life.",
        icon: "compass",
    },
    {
        id: "words",
        number: "02",
        title: "Words",
        description: "Learn useful words with Bangla and English meanings.",
        icon: "book",
    },
    {
        id: "sentences",
        number: "03",
        title: "Sentences",
        description: "See how the words fit into a spoken phrase.",
        icon: "list",
    },
    {
        id: "conversation",
        number: "04",
        title: "Conversation",
        description: "Read both sides of a short conversation.",
        icon: "mic",
    },
    {
        id: "practice",
        number: "05",
        title: "Review",
        description: "Go over the words and phrases from the lesson.",
        icon: "replay",
    },
    {
        id: "progress",
        number: "06",
        title: "Track progress",
        description: "See which lessons you have completed.",
        icon: "trending",
    },
];

export interface Situation {
    id: string;
    icon: "shopping" | "work" | "restaurant" | "transportation" | "daily-life" | "conversation";
    title: string;
    description: string;
    arabic: string;
    translation: string;
    banglaTranslation: string;
}

export const situations: Situation[] = [
    {
        id: "shopping",
        icon: "shopping",
        title: "Shopping",
        description:
            "Ask the price, request another size, or ask whether there is a discount.",
        arabic: "مُمْكِن تَخفِيض؟",
        translation: "Could you give a discount?",
        banglaTranslation: "একটু দাম কম হবে?",
    },
    {
        id: "work",
        icon: "work",
        title: "Work",
        description:
            "Greet a colleague, ask a question, or set a meeting time.",
        arabic: "اجتِمَاع السَّاعَة عَشرَة",
        translation: "Meeting at 10:00",
        banglaTranslation: "মিটিংটা দশটায়।",
    },
    {
        id: "restaurant",
        icon: "restaurant",
        title: "Restaurant",
        description:
            "Order a meal, ask about an item, or request the bill.",
        arabic: "الحِسَاب لَو سَمَحت",
        translation: "Check please",
        banglaTranslation: "বিলটা দেবেন, দয়া করে?",
    },
    {
        id: "transportation",
        icon: "transportation",
        title: "Transportation",
        description:
            "Tell a driver where you are going and ask for directions.",
        arabic: "عَلَى اليَمِين هِنَا",
        translation: "Right here on the right",
        banglaTranslation: "এখানেই ডান দিকে।",
    },
    {
        id: "daily-life",
        icon: "daily-life",
        title: "Daily Life",
        description:
            "Use greetings and short phrases with neighbors and service staff.",
        arabic: "صَبَاح الخَير",
        translation: "Good morning",
        banglaTranslation: "সুপ্রভাত।",
    },
    {
        id: "conversations",
        icon: "conversation",
        title: "Conversations",
        description:
            "Introduce yourself, start a conversation, and respond politely.",
        arabic: "فُرصَة سَعِيدَة",
        translation: "Nice to meet you",
        banglaTranslation: "আপনার সঙ্গে পরিচিত হয়ে ভালো লাগল।",
    },
];

export interface ComparisonRow {
    feature: string;
    free: string;
    pro: string;
    freeLocked?: boolean;
}

export const comparisonRows: ComparisonRow[] = [
    { feature: "Words", free: "Included", pro: "Included" },
    {
        feature: "Sentences",
        free: "Included",
        pro: "Included",
    },
    {
        feature: "Conversation levels",
        free: "Beginner",
        pro: "Beginner to advanced",
    },
    {
        feature: "Pro Curriculum",
        free: "Not included",
        pro: "Included",
        freeLocked: true,
    },
    {
        feature: "Tense courses",
        free: "Not included",
        pro: "Included",
        freeLocked: true,
    },
    {
        feature: "Ads",
        free: "May appear",
        pro: "No ads",
        freeLocked: true,
    },
    { feature: "XP, levels, and streaks", free: "Included", pro: "Included" },
];

export const proFeatures: string[] = [
    "Full curriculum",
    "Beginner to advanced courses",
    "Advanced conversations",
    "Tense courses",
    "Lessons organized by topic",
    "Ad-free learning",
    "Progress tracking",
    "XP, levels, and streaks",
];

export interface FaqItem {
    id: string;
    question: string;
    answer: string;
}

export const faqItems: FaqItem[] = [
    {
        id: "faq-1",
        question: "Is Arabic Master free?",
        answer:
            "Yes. Free learners can study words, sentences, and beginner conversations. Pro adds the full curriculum and advanced conversation levels.",
    },
    {
        id: "faq-2",
        question: "Who is Arabic Master for?",
        answer:
            "It is for learners who want to use spoken Arabic in daily life in Saudi Arabia and the Gulf. Lessons include Bangla and English meanings.",
    },
    {
        id: "faq-3",
        question: "Can beginners use Arabic Master?",
        answer:
            "Yes. Start with beginner lessons and move through the levels as you study.",
    },
    {
        id: "faq-4",
        question: "What does Pro include?",
        answer:
            "Pro includes the beginner-to-advanced curriculum, advanced conversations, tense courses, and ad-free learning.",
    },
    {
        id: "faq-5",
        question: "What will I study?",
        answer:
            "Words, sentences, and conversations for situations such as shopping, work, restaurants, and travel.",
    },
];

