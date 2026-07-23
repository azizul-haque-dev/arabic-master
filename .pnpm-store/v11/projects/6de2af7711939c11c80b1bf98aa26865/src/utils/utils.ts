export function cleanTextAndSpaces(input: string): string {
  return (
    input
      // Added \u0600-\u06FF to preserve Arabic characters
      .replace(/[^a-zA-Z0-9\s\u0980-\u09FF\u0600-\u06FF]/g, "")
      .replace(/\s+/g, " ")
      .trim()
  );
}

// delay simulation
export const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));
