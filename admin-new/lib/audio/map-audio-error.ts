/**
 * Maps HTTP status codes and API responses to clear, localized error messages.
 * Prevents internal stack traces, DB details, or request IDs from being shown to users.
 */

export function extractErrorMessage(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;

  const record = payload as Record<string, unknown>;
  const msg = record.message ?? record.error;

  if (typeof msg === "string") {
    // Filter out technical stack traces or DB error patterns
    if (
      msg.includes("drizzle") ||
      msg.includes("sql") ||
      msg.includes("Stack trace:") ||
      msg.includes("at ") ||
      msg.includes("node:internal")
    ) {
      return null;
    }
    return msg.trim() || null;
  }

  if (Array.isArray(msg)) {
    const validStrings = msg.filter((m): m is string => typeof m === "string" && !m.includes("at "));
    if (validStrings.length > 0) {
      return validStrings.join(", ");
    }
  }

  return null;
}

export function mapAudioError(statusCode: number, customMessage?: string | null): string {
  if (customMessage) {
    // If backend provided a specific user-facing validation/business message, return it
    return customMessage;
  }

  switch (statusCode) {
    case 400:
      return "ফাইল বা ফর্মে সমস্যা রয়েছে। অনুগ্রহ করে ফর্মটি যাচাই করে আবার চেষ্টা করুন। (Invalid file or parameters)";
    case 401:
      return "আপনার সেশনের মেয়াদ শেষ হয়েছে। অনুগ্রহ করে আবার লগইন করুন। (Session expired, please sign in again)";
    case 403:
      return "এই entity-তে audio যোগ বা পরিবর্তন করার অনুমতি নেই। Content Manager শুধুমাত্র Draft বা Rejected অবস্থায় পরিবর্তন করতে পারে। (Permission denied)";
    case 404:
      return "Arabic Entity বা এই variant-এর audio রেকর্ডটি আর নেই। (Entity or audio variant not found)";
    case 413:
      return "অডিও ফাইলটি অনুমোদিত সীমার (১০MB) চেয়ে বড়। অনুগ্রহ করে ছোট ফাইল আপলোড করুন। (File exceeds 10MB limit)";
    case 415:
      return "ফাইলের ফরম্যাট সমর্থিত নয়। শুধুমাত্র MP3, WAV, OGG, M4A, এবং WebM অডিও ফাইল অনুমোদিত। (Unsupported audio format)";
    case 503:
      return "ক্লাউড স্টোরেজ সাময়িকভাবে অনুপলব্ধ। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন। (Storage temporarily unavailable)";
    default:
      if (statusCode === 0) {
        return "নেটওয়ার্ক সংযোগে সমস্যা হয়েছে অথবা অনুরোধ বাতিল করা হয়েছে। (Network or connection error)";
      }
      return "অনুরোধটি সম্পন্ন করা যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন। (Unable to complete request)";
  }
}
