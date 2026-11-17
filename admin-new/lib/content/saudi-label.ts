const SAUDI_LABEL_PATTERN =
  /\bsaudi(?:\s*[-–—]?\s*(?:arabia|arabian))?s?\b|সৌদি(?:\s*[-–—]?\s*আরব)?/iu;

export function containsSaudiLabel(
  ...values: Array<string | null | undefined>
): boolean {
  return values.some(
    (value) => typeof value === "string" && SAUDI_LABEL_PATTERN.test(value),
  );
}
