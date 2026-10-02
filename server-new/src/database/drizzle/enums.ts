import { pgEnum } from 'drizzle-orm/pg-core';

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
export const grammaticalFormEnum = pgEnum('GrammaticalForm', [
  'FIRST_PERSON', 'SECOND_PERSON_MASCULINE', 'SECOND_PERSON_FEMININE',
  'THIRD_PERSON_MASCULINE', 'THIRD_PERSON_FEMININE', 'FIRST_PERSON_PLURAL',
  'THIRD_PERSON_PLURAL', 'SINGULAR', 'DUAL', 'PLURAL', 'MASCULINE', 'FEMININE',
]);
export const tenseEnum = pgEnum('Tense', ['PAST', 'PRESENT', 'FUTURE']);
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

export const Role = {
  USER: roleEnum.enumValues[0],
  CONTENT_MANAGER: roleEnum.enumValues[1],
  ADMIN: roleEnum.enumValues[2],
} as const;

export const UserStatus = {
  ACTIVE: userStatusEnum.enumValues[0],
  SUSPENDED: userStatusEnum.enumValues[1],
} as const;

export const AuthProvider = {
  GOOGLE: authProviderEnum.enumValues[0],
} as const;

export const PreferredLanguage = {
  BN: preferredLanguageEnum.enumValues[0],
  EN: preferredLanguageEnum.enumValues[1],
} as const;

export const OnboardingLevel = {
  BEGINNER: onboardingLevelEnum.enumValues[0],
  BASIC: onboardingLevelEnum.enumValues[1],
  INTERMEDIATE: onboardingLevelEnum.enumValues[2],
} as const;

export const ContentStatus = {
  DRAFT: contentStatusEnum.enumValues[0],
  IN_REVIEW: contentStatusEnum.enumValues[1],
  APPROVED: contentStatusEnum.enumValues[2],
  PUBLISHED: contentStatusEnum.enumValues[3],
  REJECTED: contentStatusEnum.enumValues[4],
  ARCHIVED: contentStatusEnum.enumValues[5],
} as const;

export const WordType = {
  NOUN: wordTypeEnum.enumValues[0],
  VERB: wordTypeEnum.enumValues[1],
  ADJECTIVE: wordTypeEnum.enumValues[2],
  OTHER: wordTypeEnum.enumValues[3],
  UNKNOWN: wordTypeEnum.enumValues[4],
} as const;
export const GrammaticalForm = Object.fromEntries(
  grammaticalFormEnum.enumValues.map((value) => [value, value]),
) as { [K in (typeof grammaticalFormEnum.enumValues)[number]]: K };
export const Tense = { PAST: 'PAST', PRESENT: 'PRESENT', FUTURE: 'FUTURE' } as const;

export const DifficultyLevel = {
  BEGINNER: difficultyLevelEnum.enumValues[0],
  ELEMENTARY: difficultyLevelEnum.enumValues[1],
  INTERMEDIATE: difficultyLevelEnum.enumValues[2],
  ADVANCED: difficultyLevelEnum.enumValues[3],
} as const;

export const CourseType = {
  FREE: courseTypeEnum.enumValues[0],
  PRO: courseTypeEnum.enumValues[1],
} as const;

export const LessonContentType = {
  WORD: lessonContentTypeEnum.enumValues[0],
  SENTENCE: lessonContentTypeEnum.enumValues[1],
  CONVERSATION: lessonContentTypeEnum.enumValues[2],
} as const;

export const SubscriptionStatus = {
  ACTIVE: subscriptionStatusEnum.enumValues[0],
  EXPIRED: subscriptionStatusEnum.enumValues[1],
  CANCELLED: subscriptionStatusEnum.enumValues[2],
  PENDING: subscriptionStatusEnum.enumValues[3],
} as const;

export const PaymentProvider = {
  SSLCOMMERZ: paymentProviderEnum.enumValues[0],
  SHURJOPAY: paymentProviderEnum.enumValues[1],
  AAMARPAY: paymentProviderEnum.enumValues[2],
  APPLE_IAP: paymentProviderEnum.enumValues[3],
  GOOGLE_PLAY: paymentProviderEnum.enumValues[4],
} as const;

export const TransactionStatus = {
  SUCCESS: transactionStatusEnum.enumValues[0],
  PENDING: transactionStatusEnum.enumValues[1],
  FAILED: transactionStatusEnum.enumValues[2],
  REFUNDED: transactionStatusEnum.enumValues[3],
} as const;

export type Role = (typeof Role)[keyof typeof Role];
export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];
export type AuthProvider = (typeof AuthProvider)[keyof typeof AuthProvider];
export type PreferredLanguage =
  (typeof PreferredLanguage)[keyof typeof PreferredLanguage];
export type OnboardingLevel =
  (typeof OnboardingLevel)[keyof typeof OnboardingLevel];
export type ContentStatus = (typeof ContentStatus)[keyof typeof ContentStatus];
export type WordType = (typeof WordType)[keyof typeof WordType];
export type GrammaticalForm = (typeof GrammaticalForm)[keyof typeof GrammaticalForm];
export type Tense = (typeof Tense)[keyof typeof Tense];
export type DifficultyLevel =
  (typeof DifficultyLevel)[keyof typeof DifficultyLevel];
export type CourseType = (typeof CourseType)[keyof typeof CourseType];
export type LessonContentType =
  (typeof LessonContentType)[keyof typeof LessonContentType];
export type SubscriptionStatus =
  (typeof SubscriptionStatus)[keyof typeof SubscriptionStatus];
export type PaymentProvider =
  (typeof PaymentProvider)[keyof typeof PaymentProvider];
export type TransactionStatus =
  (typeof TransactionStatus)[keyof typeof TransactionStatus];
