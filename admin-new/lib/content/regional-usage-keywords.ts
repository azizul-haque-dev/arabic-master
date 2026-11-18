const REGIONAL_USAGE_KEYWORD = /\b(?:saudi arabia|najdi)\b/i;

export function containsRegionalUsageKeyword(
  ...texts: (string | null | undefined)[]
): boolean {
  return texts.some((text) => REGIONAL_USAGE_KEYWORD.test(text ?? ""));
}
