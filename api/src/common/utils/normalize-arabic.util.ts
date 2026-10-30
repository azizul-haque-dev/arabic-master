// harakat (diacritics) বাদ দিয়ে + বাড়তি space পরিষ্কার করে,
// যাতে "كَتَبَ" আর "كتب" একই entity হিসেবে dedup হয়।
export function normalizeArabicText(text: string): string {
  return text
    .replace(/[\u064B-\u0652]/g, '')
    .trim()
    .replace(/\s+/g, ' ');
}

// harakat বাদ + Arabic/Latin punctuation → space, যাতে split(' ') করে শব্দ পাওয়া যায়।
export function cleanTextAndSpaces(text: string): string {
  return text
    .replace(/[\u064B-\u0652]/g, '')
    .replace(/[،,.!؟?]/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

/**
 * Checks whether the given string is Arabic text (allowing Arabic characters,
 * diacritics, numbers, whitespace, and any Arabic/Latin punctuation marks),
 * and does not contain Latin or Bengali letters that require translation.
 */
export const isArabicText = (text: string): boolean => {
  const trimmed = text.trim();
  if (!trimmed) return false;
  const hasArabicChar =
    /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(
      trimmed,
    );
  const hasNonArabicLetters = /[a-zA-Z\u0980-\u09FF]/.test(trimmed);
  return hasArabicChar && !hasNonArabicLetters;
};
