/**
 * Sequential key generator helpers for CMS content entities.
 * Extracts the maximum numeric identifier for a given prefix and increments by 1.
 */

function calculateNextKey(
  keys: (string | undefined | null)[],
  prefix: string,
  baseNumber: number,
): string {
  const regex = new RegExp(`^${prefix}(\\d+)$`);
  let maxNum = baseNumber;

  for (const key of keys) {
    if (!key) continue;
    const match = key.match(regex);
    if (match) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > maxNum) {
        maxNum = num;
      }
    }
  }

  return `${prefix}${maxNum + 1}`;
}

export function generateNextEntityKey(entities: { entityKey?: string }[]): string {
  return calculateNextKey(
    entities.map((e) => e.entityKey),
    "AE-",
    1000,
  );
}

export function generateNextWordKey(words: { wordKey?: string }[]): string {
  return calculateNextKey(
    words.map((w) => w.wordKey),
    "W-",
    2000,
  );
}

export function generateNextSentenceKey(sentences: { sentenceKey?: string }[]): string {
  return calculateNextKey(
    sentences.map((s) => s.sentenceKey),
    "SNT-",
    1000,
  );
}

export function generateNextConversationKey(conversations: { conversationKey?: string }[]): string {
  return calculateNextKey(
    conversations.map((c) => c.conversationKey),
    "CNV-",
    3000,
  );
}

export function generateNextCourseKey(courses: { courseKey?: string }[]): string {
  return calculateNextKey(
    courses.map((c) => c.courseKey),
    "CRS-",
    1000,
  );
}

export function generateNextSectionKey(sections: { sectionKey?: string }[]): string {
  return calculateNextKey(
    sections.map((s) => s.sectionKey),
    "SEC-",
    2000,
  );
}

export function generateNextLessonKey(lessons: { lessonKey?: string }[]): string {
  return calculateNextKey(
    lessons.map((l) => l.lessonKey),
    "LSN-",
    4000,
  );
}
