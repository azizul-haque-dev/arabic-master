import {
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

export const roleEnum = pgEnum('Role', ['USER', 'CONTENT_MANAGER', 'ADMIN']);
export const userStatusEnum = pgEnum('UserStatus', ['ACTIVE', 'SUSPENDED']);
export const authProviderEnum = pgEnum('AuthProvider', ['GOOGLE']);
export const preferredLanguageEnum = pgEnum('PreferredLanguage', ['BN', 'EN']);
export const onboardingLevelEnum = pgEnum('OnboardingLevel', [
  'BEGINNER',
  'BASIC',
  'INTERMEDIATE',
]);
export const contentStatusEnum = pgEnum('ContentStatus', [
  'DRAFT',
  'IN_REVIEW',
  'APPROVED',
  'PUBLISHED',
  'REJECTED',
  'ARCHIVED',
]);
export const wordTypeEnum = pgEnum('WordType', [
  'NOUN',
  'VERB',
  'ADJECTIVE',
  'OTHER',
  'UNKNOWN',
]);
export const difficultyLevelEnum = pgEnum('DifficultyLevel', [
  'BEGINNER',
  'ELEMENTARY',
  'INTERMEDIATE',
  'ADVANCED',
]);
export const courseTypeEnum = pgEnum('CourseType', ['FREE', 'PRO']);
export const lessonContentTypeEnum = pgEnum('LessonContentType', [
  'WORD',
  'SENTENCE',
  'CONVERSATION',
]);
export const subscriptionStatusEnum = pgEnum('SubscriptionStatus', [
  'ACTIVE',
  'EXPIRED',
  'CANCELLED',
  'PENDING',
]);
export const paymentProviderEnum = pgEnum('PaymentProvider', [
  'SSLCOMMERZ',
  'SHURJOPAY',
  'AAMARPAY',
  'APPLE_IAP',
  'GOOGLE_PLAY',
]);
export const transactionStatusEnum = pgEnum('TransactionStatus', [
  'SUCCESS',
  'PENDING',
  'FAILED',
  'REFUNDED',
]);

export const user = pgTable(
  'User',
  {
    id: text('id').primaryKey(),
    fullName: text('fullName').notNull(),
    email: text('email').notNull().unique(),
    passwordHash: text('passwordHash'),
    emailVerified: boolean('emailVerified').default(false).notNull(),
    emailVerifiedAt: timestamp('emailVerifiedAt'),
    role: roleEnum('role').default('USER').notNull(),
    status: userStatusEnum('status').default('ACTIVE').notNull(),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().notNull(),
  },
  (table) => [{ name: 'User_role_idx', columns: [table.role] }],
);

export const authIdentity = pgTable(
  'AuthIdentity',
  {
    id: text('id').primaryKey(),
    userId: text('userId').notNull(),
    provider: authProviderEnum('provider').notNull(),
    providerAccountId: text('providerAccountId').notNull(),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('AuthIdentity_provider_providerAccountId_key').on(
      table.provider,
      table.providerAccountId,
    ),
    index('AuthIdentity_userId_idx').on(table.userId),
  ],
);

export const session = pgTable(
  'Session',
  {
    id: text('id').primaryKey(),
    userId: text('userId').notNull(),
    deviceId: text('deviceId').notNull(),
    userAgent: text('userAgent'),
    ipAddress: text('ipAddress'),
    isActive: boolean('isActive').default(true).notNull(),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    expiresAt: timestamp('expiresAt').notNull(),
    revokedAt: timestamp('revokedAt'),
  },
  (table) => [index('Session_userId_isActive_idx').on(table.userId, table.isActive)],
);

export const refreshToken = pgTable(
  'RefreshToken',
  {
    id: text('id').primaryKey(),
    sessionId: text('sessionId').notNull(),
    jwtId: text('jwtId').notNull().unique(),
    tokenHash: text('tokenHash').notNull().unique(),
    expiresAt: timestamp('expiresAt').notNull(),
    revokedAt: timestamp('revokedAt'),
    replacedByTokenId: text('replacedByTokenId'),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
  },
  (table) => [index('RefreshToken_sessionId_revokedAt_idx').on(table.sessionId, table.revokedAt)],
);

export const passwordResetToken = pgTable(
  'PasswordResetToken',
  {
    id: text('id').primaryKey(),
    userId: text('userId').notNull(),
    tokenHash: text('tokenHash').notNull().unique(),
    expiresAt: timestamp('expiresAt').notNull(),
    usedAt: timestamp('usedAt'),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
  },
  (table) => [index('PasswordResetToken_userId_idx').on(table.userId)],
);

export const emailVerificationToken = pgTable(
  'EmailVerificationToken',
  {
    id: text('id').primaryKey(),
    userId: text('userId').notNull(),
    tokenHash: text('tokenHash').notNull().unique(),
    expiresAt: timestamp('expiresAt').notNull(),
    usedAt: timestamp('usedAt'),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
  },
  (table) => [index('EmailVerificationToken_userId_idx').on(table.userId)],
);

export const userProfile = pgTable(
  'UserProfile',
  {
    id: text('id').primaryKey(),
    userId: text('userId').notNull().unique(),
    preferredLanguage: preferredLanguageEnum('preferredLanguage').notNull(),
    country: text('country').notNull(),
    learningGoals: text('learningGoals').array().notNull(),
    arabicLevel: onboardingLevelEnum('arabicLevel').notNull(),
    dailyGoalMinutes: integer('dailyGoalMinutes').notNull(),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().notNull(),
  },
);

export const userProgress = pgTable(
  'UserProgress',
  {
    id: text('id').primaryKey(),
    userId: text('userId').notNull().unique(),
    xp: integer('xp').default(0).notNull(),
    level: integer('level').default(1).notNull(),
    streakCount: integer('streakCount').default(0).notNull(),
    lastActivityDate: timestamp('lastActivityDate'),
    hearts: integer('hearts').default(5).notNull(),
    heartsLastBonusClaimedAt: timestamp('heartsLastBonusClaimedAt'),
    version: integer('version').default(0).notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().notNull(),
  },
);

export const guestUser = pgTable(
  'GuestUser',
  {
    id: text('id').primaryKey(),
    deviceId: text('deviceId').notNull().unique(),
    xp: integer('xp').default(0).notNull(),
    level: integer('level').default(1).notNull(),
    streakCount: integer('streakCount').default(0).notNull(),
    hearts: integer('hearts').default(5).notNull(),
    lastActivityDate: timestamp('lastActivityDate'),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    migratedToUserId: text('migratedToUserId').unique(),
  },
);

export const subscription = pgTable(
  'Subscription',
  {
    id: text('id').primaryKey(),
    userId: text('userId').notNull(),
    plan: text('plan').notNull(),
    status: subscriptionStatusEnum('status').notNull(),
    startedAt: timestamp('startedAt').notNull(),
    expiresAt: timestamp('expiresAt').notNull(),
    provider: paymentProviderEnum('provider').notNull(),
    transactionId: text('transactionId').notNull(),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('Subscription_provider_transactionId_key').on(
      table.provider,
      table.transactionId,
    ),
    index('Subscription_userId_status_idx').on(table.userId, table.status),
  ],
);

export const transaction = pgTable(
  'Transaction',
  {
    id: text('id').primaryKey(),
    userId: text('userId').notNull(),
    subscriptionId: text('subscriptionId'),
    provider: paymentProviderEnum('provider').notNull(),
    amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
    currency: text('currency').default('BDT').notNull(),
    status: transactionStatusEnum('status').notNull(),
    providerTransactionId: text('providerTransactionId').notNull().unique(),
    rawPayload: jsonb('rawPayload'),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().notNull(),
  },
  (table) => [index('Transaction_userId_status_idx').on(table.userId, table.status)],
);

export const arabicEntity = pgTable(
  'ArabicEntity',
  {
    id: text('id').primaryKey(),
    entityKey: text('entityKey').notNull().unique(),
    arabicText: text('arabicText').notNull(),
    normalizedText: text('normalizedText').notNull().unique(),
    audioUrl: text('audioUrl'),
    pronunciationBangla: text('pronunciationBangla').notNull(),
    pronunciationEnglish: text('pronunciationEnglish').notNull(),
    status: contentStatusEnum('status').default('DRAFT').notNull(),
    rejectionReason: text('rejectionReason'),
    createdById: text('createdById'),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().notNull(),
  },
  (table) => [index('ArabicEntity_status_idx').on(table.status)],
);

export const word = pgTable(
  'Word',
  {
    id: text('id').primaryKey(),
    wordKey: text('wordKey').notNull().unique(),
    entityId: text('entityId').notNull(),
    meaningBn: text('meaningBn').notNull(),
    meaningEn: text('meaningEn').notNull(),
    pronunciationBn: text('pronunciationBn').notNull(),
    pronunciationEn: text('pronunciationEn').notNull(),
    whenToUseEn: text('whenToUseEn').notNull(),
    whenToUseBn: text('whenToUseBn').notNull(),
    feminineBn: text('feminineBn').notNull(),
    feminineEn: text('feminineEn').notNull(),
    wordType: wordTypeEnum('wordType').default('UNKNOWN').notNull(),
    category: text('category').notNull(),
    noteEn: text('noteEn'),
    noteBn: text('noteBn'),
    status: contentStatusEnum('status').default('DRAFT').notNull(),
    rejectionReason: text('rejectionReason'),
    createdById: text('createdById'),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().notNull(),
  },
  (table) => [
    index('Word_entityId_idx').on(table.entityId),
    index('Word_status_idx').on(table.status),
    index('Word_category_idx').on(table.category),
  ],
);

export const sentenceWord = pgTable(
  'SentenceWord',
  {
    id: text('id').primaryKey(),
    sentenceId: text('sentenceId').notNull(),
    wordId: text('wordId').notNull(),
    position: integer('position'),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('SentenceWord_sentenceId_wordId_key').on(table.sentenceId, table.wordId),
    index('SentenceWord_sentenceId_idx').on(table.sentenceId),
    index('SentenceWord_wordId_idx').on(table.wordId),
  ],
);

export const sentence = pgTable(
  'Sentence',
  {
    id: text('id').primaryKey(),
    sentenceKey: text('sentenceKey').notNull().unique(),
    entityId: text('entityId').notNull(),
    meaningBn: text('meaningBn').notNull(),
    meaningEn: text('meaningEn').notNull(),
    pronunciationBn: text('pronunciationBn').notNull(),
    pronunciationEn: text('pronunciationEn').notNull(),
    whenToUseEn: text('whenToUseEn').notNull(),
    whenToUseBn: text('whenToUseBn').notNull(),
    feminineBn: text('feminineBn').notNull(),
    feminineEn: text('feminineEn').notNull(),
    difficulty: difficultyLevelEnum('difficulty').default('BEGINNER').notNull(),
    category: text('category').notNull(),
    relatedWordId: text('relatedWordId'),
    noteEn: text('noteEn'),
    noteBn: text('noteBn'),
    status: contentStatusEnum('status').default('DRAFT').notNull(),
    rejectionReason: text('rejectionReason'),
    createdById: text('createdById'),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().notNull(),
  },
  (table) => [
    index('Sentence_entityId_idx').on(table.entityId),
    index('Sentence_relatedWordId_idx').on(table.relatedWordId),
    index('Sentence_status_idx').on(table.status),
    index('Sentence_category_idx').on(table.category),
  ],
);

export const conversation = pgTable(
  'Conversation',
  {
    id: text('id').primaryKey(),
    conversationKey: text('conversationKey').notNull().unique(),
    title: text('title').notNull(),
    topic: text('topic').notNull(),
    category: text('category').notNull(),
    status: contentStatusEnum('status').default('DRAFT').notNull(),
    rejectionReason: text('rejectionReason'),
    createdById: text('createdById'),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().notNull(),
  },
  (table) => [index('Conversation_status_idx').on(table.status)],
);

export const conversationTurn = pgTable(
  'ConversationTurn',
  {
    id: text('id').primaryKey(),
    conversationId: text('conversationId').notNull(),
    order: integer('order').notNull(),
    speaker: text('speaker').notNull(),
    sentenceId: text('sentenceId').notNull(),
  },
  (table) => [
    uniqueIndex('ConversationTurn_conversationId_order_key').on(
      table.conversationId,
      table.order,
    ),
    index('ConversationTurn_sentenceId_idx').on(table.sentenceId),
  ],
);

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
  (table) => [index('Section_courseId_idx').on(table.courseId)],
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
  (table) => [index('Lesson_sectionId_idx').on(table.sectionId)],
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
  (table) => [index('LessonContentItem_lessonId_idx').on(table.lessonId)],
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
  (table) => [index('ContentCompletion_userId_idx').on(table.userId)],
);

export const arabicEntityRelationTable = pgTable(
  'ArabicEntityRelation',
  {
    conceptId: text('conceptId').notNull(),
    relatedEntityId: text('relatedEntityId').notNull(),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.conceptId, table.relatedEntityId] })],
);
