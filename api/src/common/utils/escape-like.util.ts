// ILIKE-তে wildcard (%, _, \) escape করে, নইলে "100%" সব record মেলাবে
export function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, '\\$&');
}
