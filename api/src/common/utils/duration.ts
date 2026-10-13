export function parseDurationSeconds(duration: string): number {
  const m = /^(\d+)(s|m|h|d)$/.exec(duration);
  if (!m) return 0;
  const mult: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };
  return parseInt(m[1], 10) * mult[m[2]];
}
