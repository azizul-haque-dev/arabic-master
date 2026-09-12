/**
 * Mirrors the backend's normalizedText strategy for ArabicEntity dedup
 * (strip tashkeel/diacritics, normalize alef/ya/ta-marbuta variants,
 * collapse whitespace). Used client-side ONLY for instant duplicate
 * suggestions while typing — the server remains the source of truth
 * and re-normalizes on submit.
 */
export function normalizeArabic(input: string): string {
  return input
    .trim()
    .replace(/[\u064B-\u065F\u0670]/g, "") // strip tashkeel/diacritics
    .replace(/[إأآا]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/\s+/g, " ");
}
