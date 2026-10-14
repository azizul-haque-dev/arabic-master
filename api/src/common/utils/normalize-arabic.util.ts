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

export const isArabicText = (text: string): boolean =>
  /^[\u0600-\u06FF\s]+$/.test(text);
