import { and, count, desc, eq, gt, isNotNull } from 'drizzle-orm';
import { db } from '../../database/db.js';
import {
  ContentStatus,
  SubscriptionStatus,
} from '../../database/drizzle/enums.js';
import * as schema from '../../database/drizzle/schema.js';
import type { ListConversationQuery } from '../conversations/conversation.schemas.js';
import { ConversationService } from '../conversations/conversation.service.js';
import type { ListCourseQuery } from '../curriculum/courses/course.schemas.js';
import { CourseService } from '../curriculum/courses/course.service.js';
import type { ListSentenceQuery } from '../sentence/sentence.schemas.js';
import { SentenceService } from '../sentence/sentence.service.js';
import type { ListWordQuery } from '../words/word.schemas.js';
import { WordService } from '../words/word.service.js';

export interface CurrentLessonSummary {
  lessonId: string;
  lessonKey: string;
  lessonTitle: string;
  sectionTitle: string;
  courseId: string;
  courseTitle: string;
  completedItems: number;
  totalItems: number;
  completedLessons: number;
  totalLessons: number;
  progressPercent: number;
}

export interface LearnerOverview {
  xp: number;
  level: number;
  streakCount: number;
  hearts: number;
  plan: 'FREE' | 'PRO';
  planName: string;
  currentLesson: CurrentLessonSummary | null;
  unreadNotifications: number;
  notifications: Array<{
    id: string;
    title: string;
    body: string;
    createdAt: string;
  }>;
}

export const LearnerService = {
  async getOverview(userId: string): Promise<LearnerOverview> {
    const now = new Date();
    const [progressRows, subRows, latestLessonRows] = await Promise.all([
      db
        .select()
        .from(schema.userProgress)
        .where(eq(schema.userProgress.userId, userId))
        .limit(1),
      db
        .select()
        .from(schema.subscription)
        .where(
          and(
            eq(schema.subscription.userId, userId),
            eq(schema.subscription.status, SubscriptionStatus.ACTIVE),
            gt(schema.subscription.expiresAt, now),
          ),
        )
        .orderBy(desc(schema.subscription.expiresAt))
        .limit(1),
      db
        .select({
          lessonId: schema.lessonProgress.lessonId,
          completedItems: schema.lessonProgress.completedItems,
          totalItems: schema.lessonProgress.totalItems,
          lessonKey: schema.lesson.lessonKey,
          lessonTitle: schema.lesson.title,
          sectionId: schema.section.id,
          sectionTitle: schema.section.title,
          courseId: schema.course.id,
          courseTitle: schema.course.title,
        })
        .from(schema.lessonProgress)
        .innerJoin(
          schema.lesson,
          eq(schema.lesson.id, schema.lessonProgress.lessonId),
        )
        .innerJoin(
          schema.section,
          eq(schema.section.id, schema.lesson.sectionId),
        )
        .innerJoin(
          schema.course,
          eq(schema.course.id, schema.section.courseId),
        )
        .where(eq(schema.lessonProgress.userId, userId))
        .orderBy(desc(schema.lessonProgress.updatedAt))
        .limit(1),
    ]);

    const progress = progressRows[0];
    const activeSub = subRows[0];
    const latest = latestLessonRows[0];

    let currentLesson: CurrentLessonSummary | null = null;
    if (latest) {
      const [courseLessonsCountRows, completedCourseLessonsRows] =
        await Promise.all([
          db
            .select({ total: count() })
            .from(schema.lesson)
            .innerJoin(
              schema.section,
              eq(schema.section.id, schema.lesson.sectionId),
            )
            .where(
              and(
                eq(schema.section.courseId, latest.courseId),
                eq(schema.lesson.status, ContentStatus.PUBLISHED),
              ),
            ),
          db
            .select({ total: count() })
            .from(schema.lessonProgress)
            .innerJoin(
              schema.lesson,
              eq(schema.lesson.id, schema.lessonProgress.lessonId),
            )
            .innerJoin(
              schema.section,
              eq(schema.section.id, schema.lesson.sectionId),
            )
            .where(
              and(
                eq(schema.lessonProgress.userId, userId),
                eq(schema.section.courseId, latest.courseId),
                isNotNull(schema.lessonProgress.completedAt),
              ),
            ),
        ]);

      const totalLessons = courseLessonsCountRows[0]?.total ?? 0;
      const completedLessons = completedCourseLessonsRows[0]?.total ?? 0;
      const progressPercent =
        totalLessons > 0
          ? Math.min(100, Math.round((completedLessons / totalLessons) * 100))
          : latest.totalItems > 0
            ? Math.min(
                100,
                Math.round((latest.completedItems / latest.totalItems) * 100),
              )
            : 0;

      currentLesson = {
        lessonId: latest.lessonId,
        lessonKey: latest.lessonKey,
        lessonTitle: latest.lessonTitle,
        sectionTitle: latest.sectionTitle,
        courseId: latest.courseId,
        courseTitle: latest.courseTitle,
        completedItems: latest.completedItems,
        totalItems: latest.totalItems,
        completedLessons,
        totalLessons,
        progressPercent,
      };
    }

    const isPro = Boolean(activeSub);

    return {
      xp: progress?.xp ?? 0,
      level: progress?.level ?? 1,
      streakCount: progress?.streakCount ?? 0,
      hearts: progress?.hearts ?? 5,
      plan: isPro ? 'PRO' : 'FREE',
      planName: activeSub?.plan ?? 'Free Plan',
      currentLesson,
      unreadNotifications: 0,
      notifications: [],
    };
  },

  listPublishedWords(query: ListWordQuery) {
    return WordService.list({ ...query, status: ContentStatus.PUBLISHED });
  },

  listPublishedSentences(query: ListSentenceQuery) {
    return SentenceService.list({ ...query, status: ContentStatus.PUBLISHED });
  },

  listPublishedConversations(query: ListConversationQuery) {
    return ConversationService.list({
      ...query,
      status: ContentStatus.PUBLISHED,
    });
  },

  listPublishedCourses(query: ListCourseQuery) {
    return CourseService.list({ ...query, status: ContentStatus.PUBLISHED });
  },
};
