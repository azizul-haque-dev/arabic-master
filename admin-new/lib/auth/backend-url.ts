/**
 * Resolve the backend API base URL with production-safe fallbacks.
 * Checks BACKEND_API_URL, NEXT_PUBLIC_API_URL, and API_URL.
 */
export function getBackendApiUrl(): string {
  const url =
    process.env.BACKEND_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.API_URL ||
    "http://localhost:5000/api/v1";
  return url.replace(/\/$/, "");
}
