export const ALLOWED_CATEGORIES = [
  {
    categoryEn: "Greetings & Introductions",
    categoryBn: "শুভেচ্ছা ও পরিচয়",
  },
  {
    categoryEn: "Pronouns",
    categoryBn: "সর্বনাম",
  },
  {
    categoryEn: "Numbers",
    categoryBn: "সংখ্যা",
  },
  {
    categoryEn: "Days, Time & Date",
    categoryBn: "দিন, সময় ও তারিখ",
  },
  {
    categoryEn: "Questions & Question Words",
    categoryBn: "প্রশ্ন ও প্রশ্নবাচক শব্দ",
  },
  {
    categoryEn: "Verbs",
    categoryBn: "ক্রিয়া",
  },
  {
    categoryEn: "Prepositions",
    categoryBn: "পদান্বয়ী অব্যয়",
  },
  {
    categoryEn: "Connectors & Sentence Linking",
    categoryBn: "সংযোজক ও বাক্য সংযোগ",
  },
  {
    categoryEn: "Conversation Fillers",
    categoryBn: "কথোপকথনের ফিলার শব্দ",
  },
  {
    categoryEn: "Common Daily Expressions",
    categoryBn: "দৈনন্দিন ব্যবহৃত অভিব্যক্তি",
  },
  {
    categoryEn: "Emergency & Survival Phrases",
    categoryBn: "জরুরি ও প্রয়োজনীয় বাক্যাংশ",
  },
  {
    categoryEn: "Family & Relationships",
    categoryBn: "পরিবার ও সম্পর্ক",
  },
  {
    categoryEn: "Body Parts",
    categoryBn: "শরীরের অঙ্গ",
  },
  {
    categoryEn: "Health & Sickness",
    categoryBn: "স্বাস্থ্য ও অসুস্থতা",
  },
  {
    categoryEn: "Food & Drink",
    categoryBn: "খাবার ও পানীয়",
  },
  {
    categoryEn: "Shopping & Money",
    categoryBn: "কেনাকাটা ও অর্থ",
  },
  {
    categoryEn: "Clothing & Appearance",
    categoryBn: "পোশাক ও বাহ্যিক চেহারা",
  },
  {
    categoryEn: "House & Home",
    categoryBn: "বাড়ি ও গৃহস্থালি",
  },
  {
    categoryEn: "Colors",
    categoryBn: "রং",
  },
  {
    categoryEn: "Weather",
    categoryBn: "আবহাওয়া",
  },
  {
    categoryEn: "Transportation",
    categoryBn: "পরিবহন",
  },
  {
    categoryEn: "Directions & Navigation",
    categoryBn: "দিকনির্দেশনা ও পথনির্দেশ",
  },
  {
    categoryEn: "Places & Locations",
    categoryBn: "স্থান ও অবস্থান",
  },
  {
    categoryEn: "Work & Professions",
    categoryBn: "কাজ ও পেশা",
  },
  {
    categoryEn: "Education",
    categoryBn: "শিক্ষা",
  },
  {
    categoryEn: "Technology & Modern Life",
    categoryBn: "প্রযুক্তি ও আধুনিক জীবন",
  },
  {
    categoryEn: "Social & Cultural Etiquette",
    categoryBn: "সামাজিক ও সাংস্কৃতিক শিষ্টাচার",
  },
  {
    categoryEn: "Hospitality Phrases",
    categoryBn: "আতিথেয়তার বাক্যাংশ",
  },
  {
    categoryEn: "Islamic Daily Phrases",
    categoryBn: "দৈনন্দিন ইসলামী বাক্যাংশ",
  },
  {
    categoryEn: "Religious Occasions & Celebrations",
    categoryBn: "ধর্মীয় উপলক্ষ ও শুভেচ্ছা",
  },
  {
    categoryEn: "Opinions & Uncertainty",
    categoryBn: "মতামত ও অনিশ্চয়তা",
  },
  {
    categoryEn: "Agreement, Disagreement & Perspectives",
    categoryBn: "সম্মতি, অসম্মতি ও দৃষ্টিভঙ্গি",
  },
  {
    categoryEn: "Comparisons",
    categoryBn: "তুলনা",
  },
  {
    categoryEn: "Quantity & Counting",
    categoryBn: "পরিমাণ ও গণনা",
  },
  {
    categoryEn: "Storytelling & Conversation Flow",
    categoryBn: "গল্প বলা ও কথোপকথনের ধারাবাহিকতা",
  },
  {
    categoryEn: "High-Frequency Mixed Vocabulary & Sentences",
    categoryBn: "উচ্চ-ব্যবহৃত মিশ্র শব্দভাণ্ডার ও বাক্য",
  },
];

export const categoryList = ALLOWED_CATEGORIES.map(
  ({ categoryEn, categoryBn }) => `- ${categoryEn} (${categoryBn})`,
).join("\n");

export const categoryEnValues = ALLOWED_CATEGORIES.map((c) => c.categoryEn) as [
  string,
  ...string[],
];

export const categoryBnValues = ALLOWED_CATEGORIES.map((c) => c.categoryBn) as [
  string,
  ...string[],
];
