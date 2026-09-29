// Arabic diacritics (harakat) strip kore + extra space clean kore,
// jate "كَتَبَ" ar "كتب" same entity hishebe dedup hoy.
export function normalizeArabicText(text: string): string {
  return text
    .replace(/[\u064B-\u0652]/g, '')
    .trim()
    .replace(/\s+/g, ' ');
}

// Diacritics strip kore + Arabic/Latin punctuation-ke space-e convert kore,
// jate split(" ") kore clean word tokens paoya jay (age-r cleanTextAndSpaces()-er kaj).
export function cleanTextAndSpaces(text: string): string {
  return text
    .replace(/[\u064B-\u0652]/g, '')
    .replace(/[،,.!؟?]/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}
