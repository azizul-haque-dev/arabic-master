export interface ValueCard {
    id: string;
    icon: "translate" | "quote" | "forum";
    title: string;
    description: string;
    arabic: string;
    meaning: string;
}

export const valueCards: ValueCard[] = [
    {
        id: "words",
        icon: "translate",
        title: "Words",
        description:
            "Learn useful Arabic vocabulary with pronunciation, meaning, and authentic conversational context.",
        arabic: "فِنجَان",
        meaning: "Finjan • Coffee Cup",
    },
    {
        id: "sentences",
        icon: "quote",
        title: "Sentences",
        description:
            "Practice natural sentences you can actually use in daily conversations with locals and colleagues.",
        arabic: "أَبغَى قَهوَة سَادَة",
        meaning: '"I want black coffee."',
    },
    {
        id: "conversations",
        icon: "forum",
        title: "Conversations",
        description:
            "Build confidence by practicing realistic conversations step by step with guided turns and prompt replies.",
        arabic: "مَسَاء الخَير",
        meaning: "Good evening",
    },
];

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
        title: "Real Situation",
        description: "Identify everyday Gulf and Saudi scenarios.",
        icon: "compass",
    },
    {
        id: "words",
        number: "02",
        title: "Words",
        description: "Acquire targeted core vocabulary with authentic audio.",
        icon: "book",
    },
    {
        id: "sentences",
        number: "03",
        title: "Sentences",
        description: "Construct practical colloquial phrases.",
        icon: "list",
    },
    {
        id: "conversation",
        number: "04",
        title: "Conversation",
        description: "Simulate authentic two-way dialogue.",
        icon: "mic",
    },
    {
        id: "practice",
        number: "05",
        title: "Practice",
        description: "Active recall & speech recognition drills.",
        icon: "replay",
    },
    {
        id: "progress",
        number: "06",
        title: "Progress",
        description: "Earn XP, track retention & real-world fluency.",
        icon: "trending",
    },
];

export interface Situation {
    id: string;
    emoji: string;
    category: string;
    title: string;
    description: string;
    arabic: string;
    translation: string;
}

export const situations: Situation[] = [
    {
        id: "shopping",
        emoji: "🛍️",
        category: "Retail",
        title: "Shopping",
        description:
            "Learn how to ask about prices, negotiate, buy products, and communicate confidently.",
        arabic: "مُمْكِن تَخفِيض؟",
        translation: "Could you give a discount?",
    },
    {
        id: "work",
        emoji: "💼",
        category: "Professional",
        title: "Work",
        description:
            "Professional etiquette, team communication, and office vocabulary for Gulf workplaces.",
        arabic: "اجتِمَاع السَّاعَة عَشرَة",
        translation: "Meeting at 10:00",
    },
    {
        id: "restaurant",
        emoji: "🍽️",
        category: "Dining",
        title: "Restaurant",
        description:
            "Ordering local dishes, asking for the bill, and specifying dietary preferences.",
        arabic: "الحِسَاب لَو سَمَحت",
        translation: "Check please",
    },
    {
        id: "transportation",
        emoji: "🚗",
        category: "Transit",
        title: "Transportation",
        description:
            "Navigating taxis, ride-hailing apps, airport terminals, and road directions.",
        arabic: "عَلَى اليَمِين هِنَا",
        translation: "Right here on the right",
    },
    {
        id: "daily-life",
        emoji: "🏠",
        category: "Community",
        title: "Daily Life",
        description:
            "Greetings, neighborhood interactions, apartment maintenance, and social greetings.",
        arabic: "صَبَاح الخَير",
        translation: "Good morning",
    },
    {
        id: "conversations",
        emoji: "💬",
        category: "Social",
        title: "Conversations",
        description:
            "Small talk, making friends, expressing gratitude, and polite conversational formulas.",
        arabic: "فُرصَة سَعِيدَة",
        translation: "Nice to meet you",
    },
];

export interface Recommendation {
    id: string;
    emoji: string;
    title: string;
    description: string;
}

export const recommendations: Recommendation[] = [
    {
        id: "shopping-arabic",
        emoji: "🛍️",
        title: "Shopping Arabic",
        description:
            "Asking prices, sizes, and market bargaining phrases commonly heard in Riyadh and Jeddah souqs.",
    },
    {
        id: "arabic-for-work",
        emoji: "💼",
        title: "Arabic for Work",
        description:
            "Workplace greetings, scheduling meetings, and professional courtesies for team environments.",
    },
];

export interface ComparisonRow {
    feature: string;
    free: string;
    pro: string;
    freeLocked?: boolean;
}

export const comparisonRows: ComparisonRow[] = [
    { feature: "Free Words", free: "✓ Included", pro: "✓ Full Access" },
    {
        feature: "Free Sentences",
        free: "✓ Essential Pack",
        pro: "✓ Unlimited",
    },
    {
        feature: "Beginner Conversations",
        free: "✓ 10 Scenarios",
        pro: "✓ Full Library (100+)",
    },
    {
        feature: "Advanced Conversations",
        free: "✕ Locked",
        pro: "✓ Included",
        freeLocked: true,
    },
    {
        feature: "Pro Curriculum",
        free: "✕ Locked",
        pro: "✓ Full Access",
        freeLocked: true,
    },
    {
        feature: "Tense-Based Courses",
        free: "✕ Locked",
        pro: "✓ All Tenses & Conjugations",
        freeLocked: true,
    },
    { feature: "XP & Levels", free: "✓ Included", pro: "✓ 2x XP Multiplier" },
    {
        feature: "Streaks & Habits",
        free: "✓ Included",
        pro: "✓ Streak Freeze & Recovery",
    },
    {
        feature: "Ad-Free Experience",
        free: "✕ Ad-supported",
        pro: "✓ 100% Ad-Free",
        freeLocked: true,
    },
];

export const proFeatures: string[] = [
    "Full Pro Curriculum",
    "Beginner to Advanced Lessons",
    "Advanced Conversations",
    "Tense-Based Courses",
    "Structured Learning Paths",
    "Ad-Free Learning",
    "More Practice",
    "Full Progress Tracking",
];

export interface HowItWorksStep {
    number: string;
    title: string;
    description: string;
}

export const howItWorksSteps: HowItWorksStep[] = [
    {
        number: "01",
        title: "Choose Your Goals",
        description:
            "Tell us your level, goals, and daily practice time during a 60-second onboarding.",
    },
    {
        number: "02",
        title: "Learn & Practice",
        description:
            "Learn words, sentences, and conversations designed around real situations with native pronunciation audio.",
    },
    {
        number: "03",
        title: "Build Your Progress",
        description:
            "Earn XP, maintain your streak, and continue improving every day with measurable conversational milestones.",
    },
];

export interface Testimonial {
    id: string;
    quote: string;
    role: string;
}

export const testimonials: Testimonial[] = [
    {
        id: "t1",
        quote:
            "Arabic Master helped me focus on the Arabic I actually need in everyday situations. Within two weeks I was confident ordering food and speaking to taxi drivers.",
        role: "Healthcare Worker in Riyadh",
    },
    {
        id: "t2",
        quote:
            "The distinction between textbook Arabic and real spoken phrases was exactly what I was missing. The situational approach saves hundreds of hours.",
        role: "Engineer in Jeddah",
    },
    {
        id: "t3",
        quote:
            "The 10-minute daily format fits between meetings. Practicing conversational dialogues made speaking at work feel natural.",
        role: "Business Development Manager in Dammam",
    },
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
            "You can start learning with free content. Pro unlocks the complete curriculum and additional learning features.",
    },
    {
        id: "faq-2",
        question: "Who is Arabic Master for?",
        answer:
            "Arabic Master is designed for people who want to learn practical spoken Arabic for everyday communication, especially expatriates and residents in Saudi Arabia and Gulf countries.",
    },
    {
        id: "faq-3",
        question: "Can beginners use Arabic Master?",
        answer:
            "Yes. The learning experience starts from beginner level and progressively becomes more advanced.",
    },
    {
        id: "faq-4",
        question: "What does Pro include?",
        answer:
            "Pro includes the structured curriculum, advanced conversations, tense courses, and an ad-free learning experience.",
    },
    {
        id: "faq-5",
        question: "Can I learn Arabic for everyday situations?",
        answer:
            "Yes. Courses are organized around practical situations such as shopping, work, restaurants, transportation, and daily life.",
    },
];

export const navLinks = [
    { label: "Learn", href: "/" },
    { label: "Courses", href: "/courses" },
    { label: "How It Works", href: "/how-it-works" },
    { label: "Pricing", href: "/pricing" },
] as const;

export const footerColumns = [
    {
        title: "Product",
        links: [
            { label: "Course Catalog", href: "/courses" },
            { label: "Speech Waveform Engine", href: "/how-it-works" },
            { label: "Dialect Immersion", href: "/pricing" },
            { label: "Pricing Plans", href: "/pricing" },
        ],
    },
    {
        title: "Resources",
        links: [
            { label: "Phonetic Lexicon", href: "/" },
            { label: "Pronunciation Benchmark", href: "/how-it-works" },
            { label: "Acoustic Field Notes", href: "/" },
            { label: "Documentation", href: "/how-it-works" },
        ],
    },
    {
        title: "Company",
        links: [
            { label: "Academic Pedagogy", href: "/how-it-works" },
            { label: "Diplomatic Partnerships", href: "/courses" },
            { label: "Privacy Policy", href: "/pricing" },
            { label: "Terms of Service", href: "/pricing" },
        ],
    },
] as const;