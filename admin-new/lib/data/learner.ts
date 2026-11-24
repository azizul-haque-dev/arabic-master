import "server-only";
import { cache } from "react";
import { serverApiFetch } from "@/lib/auth/server-api";
import {
  getAuthSession,
  isAccessTokenExpiredOrNearExpiry,
} from "@/lib/auth/session";
import type { LearnerOverview } from "@/lib/types/learner";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Request-scoped deduplicated loader for the current user's learning stats
 * and progress. Never placed in a shared cache.
 */
export const getLearnerOverview = cache(async (): Promise<LearnerOverview | null> => {
  const { accessToken, refreshToken } = await getAuthSession();
  if (!accessToken && !refreshToken) {
    return null;
  }
  if ((!accessToken || isAccessTokenExpiredOrNearExpiry(accessToken, 5)) && !refreshToken) {
    return null;
  }

  try {
    const response = await serverApiFetch("/learner/overview", {
      method: "GET",
      cache: "no-store",
      timeoutMs: 8_000,
      allowCookieMutation: false,
    });

    if (!response.ok) {
      return null;
    }

    const body: unknown = await response.json();
    const data = isRecord(body) && "data" in body ? body.data : body;
    if (!isRecord(data)) {
      return null;
    }

    const rawCurrent = isRecord(data.currentLesson) ? data.currentLesson : null;

    return {
      xp: typeof data.xp === "number" ? data.xp : 0,
      level: typeof data.level === "number" ? data.level : 1,
      streakCount: typeof data.streakCount === "number" ? data.streakCount : 0,
      hearts: typeof data.hearts === "number" ? data.hearts : 5,
      plan: data.plan === "PRO" ? "PRO" : "FREE",
      planName: typeof data.planName === "string" ? data.planName : "Free Plan",
      unreadNotifications:
        typeof data.unreadNotifications === "number" ? data.unreadNotifications : 0,
      notifications: Array.isArray(data.notifications)
        ? data.notifications.filter(
            (n): n is LearnerOverview["notifications"][number] =>
              isRecord(n) &&
              typeof n.id === "string" &&
              typeof n.title === "string" &&
              typeof n.body === "string" &&
              typeof n.createdAt === "string",
          )
        : [],
      currentLesson: rawCurrent
        ? {
            lessonId: String(rawCurrent.lessonId ?? ""),
            lessonKey: String(rawCurrent.lessonKey ?? ""),
            lessonTitle: String(rawCurrent.lessonTitle ?? ""),
            sectionTitle: String(rawCurrent.sectionTitle ?? ""),
            courseId: String(rawCurrent.courseId ?? ""),
            courseTitle: String(rawCurrent.courseTitle ?? ""),
            completedItems: Number(rawCurrent.completedItems ?? 0),
            totalItems: Number(rawCurrent.totalItems ?? 0),
            completedLessons: Number(rawCurrent.completedLessons ?? 0),
            totalLessons: Number(rawCurrent.totalLessons ?? 0),
            progressPercent: Number(rawCurrent.progressPercent ?? 0),
          }
        : null,
    };
  } catch {
    return null;
  }
});
