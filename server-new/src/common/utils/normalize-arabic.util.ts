// Arabic diacritics (harakat) strip kore + extra space clean kore,
// jate "كَتَبَ" ar "كتب" same entity hishebe dedup hoy.
export function normalizeArabicText(text: string): string {
  return text
    .replace(/[\u064B-\u0652]/g, '')
    .trim()
    .replace(/\s+/g, ' ');
}
