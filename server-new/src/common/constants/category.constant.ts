export const ALLOWED_CATEGORIES = [
  'Greetings & Introductions',
  'Pronouns',
  'Numbers',
  'Days, Time & Date',
  'Questions & Question Words',
  'Verbs',
  'Prepositions',
  'Connectors & Sentence Linking',
  'Conversation Fillers',
  'Common Daily Expressions',
  'Emergency & Survival Phrases',
  'Family & Relationships',
  'Body Parts',
  'Health & Sickness',
  'Food & Drink',
  'Shopping & Money',
  'Clothing & Appearance',
  'House & Home',
  'Colors',
  'Weather',
  'Transportation',
  'Directions & Navigation',
  'Places & Locations',
  'Work & Professions',
  'Education',
  'Technology & Modern Life',
  'Social & Cultural Etiquette',
  'Hospitality Phrases',
  'Islamic Daily Phrases',
  'Religious Occasions & Celebrations',
  'Opinions & Uncertainty',
  'Agreement, Disagreement & Perspectives',
  'Comparisons',
  'Quantity & Counting',
  'Storytelling & Conversation Flow',
  'High-Frequency Mixed Vocabulary & Sentences',
] as const;

export type WordCategory = (typeof ALLOWED_CATEGORIES)[number];

export function isValidCategory(value: string): value is WordCategory {
  return (ALLOWED_CATEGORIES as readonly string[]).includes(value);
}
