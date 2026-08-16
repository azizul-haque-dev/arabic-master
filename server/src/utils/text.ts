/**
 * Text Utilities
 * Text processing and string manipulation helpers
 */

/**
 * Clean text by removing non-alphanumeric characters
 * Preserves Arabic and Bengali characters
 * @param input Text to clean
 * @returns Cleaned text with normalized spaces
 */
export function cleanTextAndSpaces(input: string): string {
  return (
    input
      // Added \u0600-\u06FF to preserve Arabic characters
      .replace(/[^a-zA-Z0-9\s\u0980-\u09FF\u0600-\u06FF]/g, "")
      .replace(/\s+/g, " ")
      .trim()
  );
}

/**
 * Delay execution for a given number of milliseconds
 * @param ms Milliseconds to delay
 */
export const sleep = (ms: number): Promise<void> =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));
