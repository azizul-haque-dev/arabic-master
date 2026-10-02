import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import {
  authProviderEnum,
  onboardingLevelEnum,
  preferredLanguageEnum,
  roleEnum,
  userStatusEnum,
} from '../enums.js';

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
  (table) => [
    index('Session_userId_isActive_idx').on(table.userId, table.isActive),
  ],
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
  (table) => [
    index('RefreshToken_sessionId_revokedAt_idx').on(
      table.sessionId,
      table.revokedAt,
    ),
  ],
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
export const userProfile = pgTable('UserProfile', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull().unique(),
  preferredLanguage: preferredLanguageEnum('preferredLanguage').notNull(),
  country: text('country').notNull(),
  learningGoals: text('learningGoals').array().notNull(),
  arabicLevel: onboardingLevelEnum('arabicLevel').notNull(),
  dailyGoalMinutes: integer('dailyGoalMinutes').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});
export const userProgress = pgTable('UserProgress', {
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
});
export const learningActivity = pgTable(
  'LearningActivity',
  {
    id: text('id').primaryKey(),
    userId: text('userId').notNull(),
    activityDate: timestamp('activityDate').notNull(),
    durationSeconds: integer('durationSeconds').default(0).notNull(),
    xpEarned: integer('xpEarned').default(0).notNull(),
    qualifying: boolean('qualifying').default(true).notNull(),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
  },
  (table) => [
    index('LearningActivity_userId_activityDate_idx').on(table.userId, table.activityDate),
  ],
);
export const guestUser = pgTable('GuestUser', {
  id: text('id').primaryKey(),
  deviceId: text('deviceId').notNull().unique(),
  xp: integer('xp').default(0).notNull(),
  level: integer('level').default(1).notNull(),
  streakCount: integer('streakCount').default(0).notNull(),
  hearts: integer('hearts').default(5).notNull(),
  lastActivityDate: timestamp('lastActivityDate'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  migratedToUserId: text('migratedToUserId').unique(),
});
