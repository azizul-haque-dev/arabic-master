export const Role = {
  USER: 'USER',
  CONTENT_MANAGER: 'CONTENT_MANAGER',
  ADMIN: 'ADMIN',
} as const;

export const UserStatus = {
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
} as const;

export const AuthProvider = {
  GOOGLE: 'GOOGLE',
} as const;

export const PreferredLanguage = {
  BN: 'BN',
  EN: 'EN',
} as const;

export const OnboardingLevel = {
  BEGINNER: 'BEGINNER',
  BASIC: 'BASIC',
  INTERMEDIATE: 'INTERMEDIATE',
} as const;

export const ContentStatus = {
  DRAFT: 'DRAFT',
  IN_REVIEW: 'IN_REVIEW',
  APPROVED: 'APPROVED',
  PUBLISHED: 'PUBLISHED',
  REJECTED: 'REJECTED',
  ARCHIVED: 'ARCHIVED',
} as const;

export const WordType = {
  NOUN: 'NOUN',
  VERB: 'VERB',
  ADJECTIVE: 'ADJECTIVE',
  OTHER: 'OTHER',
  UNKNOWN: 'UNKNOWN',
} as const;

export const DifficultyLevel = {
  BEGINNER: 'BEGINNER',
  ELEMENTARY: 'ELEMENTARY',
  INTERMEDIATE: 'INTERMEDIATE',
  ADVANCED: 'ADVANCED',
} as const;

export const CourseType = {
  FREE: 'FREE',
  PRO: 'PRO',
} as const;

export const LessonContentType = {
  WORD: 'WORD',
  SENTENCE: 'SENTENCE',
  CONVERSATION: 'CONVERSATION',
} as const;

export const SubscriptionStatus = {
  ACTIVE: 'ACTIVE',
  EXPIRED: 'EXPIRED',
  CANCELLED: 'CANCELLED',
  PENDING: 'PENDING',
} as const;

export const PaymentProvider = {
  SSLCOMMERZ: 'SSLCOMMERZ',
  SHURJOPAY: 'SHURJOPAY',
  AAMARPAY: 'AAMARPAY',
  APPLE_IAP: 'APPLE_IAP',
  GOOGLE_PLAY: 'GOOGLE_PLAY',
} as const;

export const TransactionStatus = {
  SUCCESS: 'SUCCESS',
  PENDING: 'PENDING',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
} as const;

export type Role = (typeof Role)[keyof typeof Role];
export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];
export type AuthProvider = (typeof AuthProvider)[keyof typeof AuthProvider];
export type PreferredLanguage = (typeof PreferredLanguage)[keyof typeof PreferredLanguage];
export type OnboardingLevel = (typeof OnboardingLevel)[keyof typeof OnboardingLevel];
export type ContentStatus = (typeof ContentStatus)[keyof typeof ContentStatus];
export type WordType = (typeof WordType)[keyof typeof WordType];
export type DifficultyLevel = (typeof DifficultyLevel)[keyof typeof DifficultyLevel];
export type CourseType = (typeof CourseType)[keyof typeof CourseType];
export type LessonContentType = (typeof LessonContentType)[keyof typeof LessonContentType];
export type SubscriptionStatus = (typeof SubscriptionStatus)[keyof typeof SubscriptionStatus];
export type PaymentProvider = (typeof PaymentProvider)[keyof typeof PaymentProvider];
export type TransactionStatus = (typeof TransactionStatus)[keyof typeof TransactionStatus];
