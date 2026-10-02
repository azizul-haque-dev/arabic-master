import { index, integer, pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import {
  contentStatusEnum,
  courseTypeEnum,
  difficultyLevelEnum,
  lessonContentTypeEnum,
} from '../enums.js';

export const course = pgTable(
  'Course',
  {
    id: text('id').primaryKey(),
    courseKey: text('courseKey').notNull().unique(),
    title: text('title').notNull(),
    description: text('description').notNull(),
    level: difficultyLevelEnum('level').default('BEGINNER').notNull(),
    courseType: courseTypeEnum('courseType').default('FREE').notNull(),
    status: contentStatusEnum('status').default('DRAFT').notNull(),
    rejectionReason: text('rejectionReason'),
    createdById: text('createdById'),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().notNull(),
  },
  (table) => [index('Course_status_idx').on(table.status)],
);
export const section = pgTable(
  'Section',
  {
    id: text('id').primaryKey(),
    sectionKey: text('sectionKey').notNull().unique(),
    courseId: text('courseId').notNull(),
    title: text('title').notNull(),
    description: text('description').notNull(),
    order: integer('order').notNull(),
    status: contentStatusEnum('status').default('DRAFT').notNull(),
    rejectionReason: text('rejectionReason'),
    createdById: text('createdById'),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().notNull(),
  },
  (table) => [
    index('Section_courseId_idx').on(table.courseId),
    uniqueIndex('Section_courseId_order_key').on(table.courseId, table.order),
  ],
);
export const lesson = pgTable(
  'Lesson',
  {
    id: text('id').primaryKey(),
    lessonKey: text('lessonKey').notNull().unique(),
    sectionId: text('sectionId').notNull(),
    title: text('title').notNull(),
    description: text('description').notNull(),
    order: integer('order').notNull(),
    status: contentStatusEnum('status').default('DRAFT').notNull(),
    rejectionReason: text('rejectionReason'),
    createdById: text('createdById'),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().notNull(),
  },
  (table) => [
    index('Lesson_sectionId_idx').on(table.sectionId),
    uniqueIndex('Lesson_sectionId_order_key').on(table.sectionId, table.order),
  ],
);
export const lessonContentItem = pgTable(
  'LessonContentItem',
  {
    id: text('id').primaryKey(),
    lessonId: text('lessonId').notNull(),
    contentType: lessonContentTypeEnum('contentType').notNull(),
    wordId: text('wordId'),
    sentenceId: text('sentenceId'),
    conversationId: text('conversationId'),
    order: integer('order').notNull(),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
  },
  (table) => [
    index('LessonContentItem_lessonId_idx').on(table.lessonId),
    uniqueIndex('LessonContentItem_lessonId_order_key').on(table.lessonId, table.order),
    uniqueIndex('LessonContentItem_id_lessonId_type_key').on(table.id, table.lessonId, table.contentType),
  ],
);
export const contentCompletion = pgTable(
  'ContentCompletion',
  {
    id: text('id').primaryKey(),
    userId: text('userId').notNull(),
    completedItemType: text('completedItemType').notNull(),
    completedItemId: text('completedItemId').notNull(),
    completedAt: timestamp('completedAt').defaultNow().notNull(),
  },
  (table) => [
    index('ContentCompletion_userId_idx').on(table.userId),
    uniqueIndex('ContentCompletion_user_item_key').on(
      table.userId, table.completedItemType, table.completedItemId,
    ),
  ],
);

/** One row per learner and lesson; timestamps support resume/continue-learning UX. */
export const lessonProgress = pgTable(
  'LessonProgress',
  {
    id: text('id').primaryKey(),
    userId: text('userId').notNull(),
    lessonId: text('lessonId').notNull(),
    completedItems: integer('completedItems').default(0).notNull(),
    totalItems: integer('totalItems').default(0).notNull(),
    startedAt: timestamp('startedAt').defaultNow().notNull(),
    completedAt: timestamp('completedAt'),
    updatedAt: timestamp('updatedAt').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('LessonProgress_userId_lessonId_key').on(table.userId, table.lessonId),
    index('LessonProgress_userId_updatedAt_idx').on(table.userId, table.updatedAt),
  ],
);
