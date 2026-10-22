CREATE TYPE "public"."AuthProvider" AS ENUM('GOOGLE');--> statement-breakpoint
CREATE TYPE "public"."ContentStatus" AS ENUM('DRAFT', 'IN_REVIEW', 'APPROVED', 'PUBLISHED', 'REJECTED', 'ARCHIVED');--> statement-breakpoint
CREATE TYPE "public"."CourseType" AS ENUM('FREE', 'PRO');--> statement-breakpoint
CREATE TYPE "public"."DifficultyLevel" AS ENUM('BEGINNER', 'ELEMENTARY', 'INTERMEDIATE', 'ADVANCED');--> statement-breakpoint
CREATE TYPE "public"."GrammaticalForm" AS ENUM('FIRST_PERSON', 'SECOND_PERSON_MASCULINE', 'SECOND_PERSON_FEMININE', 'THIRD_PERSON_MASCULINE', 'THIRD_PERSON_FEMININE', 'FIRST_PERSON_PLURAL', 'THIRD_PERSON_PLURAL', 'SINGULAR', 'DUAL', 'PLURAL', 'MASCULINE', 'FEMININE');--> statement-breakpoint
CREATE TYPE "public"."LessonContentType" AS ENUM('WORD', 'SENTENCE', 'CONVERSATION');--> statement-breakpoint
CREATE TYPE "public"."OnboardingLevel" AS ENUM('BEGINNER', 'BASIC', 'INTERMEDIATE');--> statement-breakpoint
CREATE TYPE "public"."PaymentProvider" AS ENUM('SSLCOMMERZ', 'SHURJOPAY', 'AAMARPAY', 'APPLE_IAP', 'GOOGLE_PLAY');--> statement-breakpoint
CREATE TYPE "public"."PreferredLanguage" AS ENUM('BN', 'EN');--> statement-breakpoint
CREATE TYPE "public"."Role" AS ENUM('USER', 'CONTENT_MANAGER', 'ADMIN');--> statement-breakpoint
CREATE TYPE "public"."SubscriptionStatus" AS ENUM('ACTIVE', 'EXPIRED', 'CANCELLED', 'PENDING');--> statement-breakpoint
CREATE TYPE "public"."Tense" AS ENUM('PAST', 'PRESENT', 'FUTURE');--> statement-breakpoint
CREATE TYPE "public"."TransactionStatus" AS ENUM('SUCCESS', 'PENDING', 'FAILED', 'REFUNDED');--> statement-breakpoint
CREATE TYPE "public"."UserStatus" AS ENUM('ACTIVE', 'SUSPENDED');--> statement-breakpoint
CREATE TYPE "public"."WordType" AS ENUM('NOUN', 'VERB', 'ADJECTIVE', 'OTHER', 'UNKNOWN');--> statement-breakpoint
CREATE TABLE "AuthIdentity" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"provider" "AuthProvider" NOT NULL,
	"providerAccountId" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "EmailVerificationToken" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"tokenHash" text NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"usedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "EmailVerificationToken_tokenHash_unique" UNIQUE("tokenHash")
);
--> statement-breakpoint
CREATE TABLE "GuestUser" (
	"id" text PRIMARY KEY NOT NULL,
	"deviceId" text NOT NULL,
	"xp" integer DEFAULT 0 NOT NULL,
	"level" integer DEFAULT 1 NOT NULL,
	"streakCount" integer DEFAULT 0 NOT NULL,
	"hearts" integer DEFAULT 5 NOT NULL,
	"lastActivityDate" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"migratedToUserId" text,
	CONSTRAINT "GuestUser_deviceId_unique" UNIQUE("deviceId"),
	CONSTRAINT "GuestUser_migratedToUserId_unique" UNIQUE("migratedToUserId")
);
--> statement-breakpoint
CREATE TABLE "LearningActivity" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"activityDate" timestamp NOT NULL,
	"durationSeconds" integer DEFAULT 0 NOT NULL,
	"xpEarned" integer DEFAULT 0 NOT NULL,
	"qualifying" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "PasswordResetToken" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"tokenHash" text NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"usedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "PasswordResetToken_tokenHash_unique" UNIQUE("tokenHash")
);
--> statement-breakpoint
CREATE TABLE "RefreshToken" (
	"id" text PRIMARY KEY NOT NULL,
	"sessionId" text NOT NULL,
	"jwtId" text NOT NULL,
	"tokenHash" text NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"revokedAt" timestamp,
	"replacedByTokenId" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "RefreshToken_jwtId_unique" UNIQUE("jwtId"),
	CONSTRAINT "RefreshToken_tokenHash_unique" UNIQUE("tokenHash")
);
--> statement-breakpoint
CREATE TABLE "Session" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"deviceId" text NOT NULL,
	"userAgent" text,
	"ipAddress" text,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"revokedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "User" (
	"id" text PRIMARY KEY NOT NULL,
	"fullName" text NOT NULL,
	"email" text NOT NULL,
	"passwordHash" text,
	"emailVerified" boolean DEFAULT false NOT NULL,
	"emailVerifiedAt" timestamp,
	"role" "Role" DEFAULT 'USER' NOT NULL,
	"status" "UserStatus" DEFAULT 'ACTIVE' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "User_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "UserProfile" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"preferredLanguage" "PreferredLanguage" NOT NULL,
	"country" text NOT NULL,
	"learningGoals" text[] NOT NULL,
	"arabicLevel" "OnboardingLevel" NOT NULL,
	"dailyGoalMinutes" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "UserProfile_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
CREATE TABLE "UserProgress" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"xp" integer DEFAULT 0 NOT NULL,
	"level" integer DEFAULT 1 NOT NULL,
	"streakCount" integer DEFAULT 0 NOT NULL,
	"lastActivityDate" timestamp,
	"hearts" integer DEFAULT 5 NOT NULL,
	"heartsLastBonusClaimedAt" timestamp,
	"version" integer DEFAULT 0 NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "UserProgress_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
CREATE TABLE "Subscription" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"plan" text NOT NULL,
	"status" "SubscriptionStatus" NOT NULL,
	"startedAt" timestamp NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"provider" "PaymentProvider" NOT NULL,
	"transactionId" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Transaction" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"subscriptionId" text,
	"provider" "PaymentProvider" NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"currency" text DEFAULT 'BDT' NOT NULL,
	"status" "TransactionStatus" NOT NULL,
	"providerTransactionId" text NOT NULL,
	"rawPayload" jsonb,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "Transaction_providerTransactionId_unique" UNIQUE("providerTransactionId")
);
--> statement-breakpoint
CREATE TABLE "ArabicEntity" (
	"id" text PRIMARY KEY NOT NULL,
	"entityKey" text NOT NULL,
	"arabicText" text NOT NULL,
	"normalizedText" text NOT NULL,
	"audioUrl" text,
	"pronunciationBangla" text NOT NULL,
	"pronunciationEnglish" text NOT NULL,
	"status" "ContentStatus" DEFAULT 'DRAFT' NOT NULL,
	"rejectionReason" text,
	"createdById" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ArabicEntity_entityKey_unique" UNIQUE("entityKey"),
	CONSTRAINT "ArabicEntity_normalizedText_unique" UNIQUE("normalizedText")
);
--> statement-breakpoint
CREATE TABLE "ArabicEntityAudio" (
	"id" text PRIMARY KEY NOT NULL,
	"entityId" text NOT NULL,
	"objectKey" text NOT NULL,
	"mimeType" text NOT NULL,
	"fileSizeBytes" integer NOT NULL,
	"variant" text DEFAULT 'DEFAULT' NOT NULL,
	"speaker" text,
	"createdById" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ArabicEntityAudio_objectKey_unique" UNIQUE("objectKey")
);
--> statement-breakpoint
CREATE TABLE "ArabicEntityRelation" (
	"conceptId" text NOT NULL,
	"relatedEntityId" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ArabicEntityRelation_conceptId_relatedEntityId_pk" PRIMARY KEY("conceptId","relatedEntityId")
);
--> statement-breakpoint
CREATE TABLE "Conversation" (
	"id" text PRIMARY KEY NOT NULL,
	"conversationKey" text NOT NULL,
	"title" text NOT NULL,
	"topic" text NOT NULL,
	"category" text NOT NULL,
	"status" "ContentStatus" DEFAULT 'DRAFT' NOT NULL,
	"rejectionReason" text,
	"createdById" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "Conversation_conversationKey_unique" UNIQUE("conversationKey")
);
--> statement-breakpoint
CREATE TABLE "ConversationTurn" (
	"id" text PRIMARY KEY NOT NULL,
	"conversationId" text NOT NULL,
	"order" integer NOT NULL,
	"speaker" text NOT NULL,
	"sentenceId" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "GrammaticalVariant" (
	"id" text PRIMARY KEY NOT NULL,
	"wordId" text NOT NULL,
	"form" "GrammaticalForm" NOT NULL,
	"entityId" text NOT NULL,
	"meaningBn" text,
	"meaningEn" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Sentence" (
	"id" text PRIMARY KEY NOT NULL,
	"sentenceKey" text NOT NULL,
	"entityId" text NOT NULL,
	"meaningBn" text NOT NULL,
	"meaningEn" text NOT NULL,
	"pronunciationBn" text NOT NULL,
	"pronunciationEn" text NOT NULL,
	"whenToUseEn" text NOT NULL,
	"whenToUseBn" text NOT NULL,
	"feminineBn" text NOT NULL,
	"feminineEn" text NOT NULL,
	"difficulty" "DifficultyLevel" DEFAULT 'BEGINNER' NOT NULL,
	"category" text NOT NULL,
	"relatedWordId" text,
	"noteEn" text,
	"noteBn" text,
	"status" "ContentStatus" DEFAULT 'DRAFT' NOT NULL,
	"rejectionReason" text,
	"createdById" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "Sentence_sentenceKey_unique" UNIQUE("sentenceKey")
);
--> statement-breakpoint
CREATE TABLE "SentenceWord" (
	"id" text PRIMARY KEY NOT NULL,
	"sentenceId" text NOT NULL,
	"wordId" text NOT NULL,
	"position" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Word" (
	"id" text PRIMARY KEY NOT NULL,
	"wordKey" text NOT NULL,
	"entityId" text NOT NULL,
	"meaningBn" text NOT NULL,
	"meaningEn" text NOT NULL,
	"pronunciationBn" text NOT NULL,
	"pronunciationEn" text NOT NULL,
	"whenToUseEn" text NOT NULL,
	"whenToUseBn" text NOT NULL,
	"feminineBn" text NOT NULL,
	"feminineEn" text NOT NULL,
	"wordType" "WordType" DEFAULT 'UNKNOWN' NOT NULL,
	"tense" "Tense",
	"category" text NOT NULL,
	"noteEn" text,
	"noteBn" text,
	"status" "ContentStatus" DEFAULT 'DRAFT' NOT NULL,
	"rejectionReason" text,
	"createdById" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "Word_wordKey_unique" UNIQUE("wordKey")
);
--> statement-breakpoint
CREATE TABLE "ContentCompletion" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"completedItemType" text NOT NULL,
	"completedItemId" text NOT NULL,
	"completedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Course" (
	"id" text PRIMARY KEY NOT NULL,
	"courseKey" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"level" "DifficultyLevel" DEFAULT 'BEGINNER' NOT NULL,
	"courseType" "CourseType" DEFAULT 'FREE' NOT NULL,
	"status" "ContentStatus" DEFAULT 'DRAFT' NOT NULL,
	"rejectionReason" text,
	"createdById" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "Course_courseKey_unique" UNIQUE("courseKey")
);
--> statement-breakpoint
CREATE TABLE "Lesson" (
	"id" text PRIMARY KEY NOT NULL,
	"lessonKey" text NOT NULL,
	"sectionId" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"order" integer NOT NULL,
	"status" "ContentStatus" DEFAULT 'DRAFT' NOT NULL,
	"rejectionReason" text,
	"createdById" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "Lesson_lessonKey_unique" UNIQUE("lessonKey")
);
--> statement-breakpoint
CREATE TABLE "LessonContentItem" (
	"id" text PRIMARY KEY NOT NULL,
	"lessonId" text NOT NULL,
	"contentType" "LessonContentType" NOT NULL,
	"wordId" text,
	"sentenceId" text,
	"conversationId" text,
	"order" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "LessonProgress" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"lessonId" text NOT NULL,
	"completedItems" integer DEFAULT 0 NOT NULL,
	"totalItems" integer DEFAULT 0 NOT NULL,
	"startedAt" timestamp DEFAULT now() NOT NULL,
	"completedAt" timestamp,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Section" (
	"id" text PRIMARY KEY NOT NULL,
	"sectionKey" text NOT NULL,
	"courseId" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"order" integer NOT NULL,
	"status" "ContentStatus" DEFAULT 'DRAFT' NOT NULL,
	"rejectionReason" text,
	"createdById" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "Section_sectionKey_unique" UNIQUE("sectionKey")
);
--> statement-breakpoint
ALTER TABLE "ArabicEntityAudio" ADD CONSTRAINT "ArabicEntityAudio_entityId_ArabicEntity_id_fk" FOREIGN KEY ("entityId") REFERENCES "public"."ArabicEntity"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "AuthIdentity_provider_providerAccountId_key" ON "AuthIdentity" USING btree ("provider","providerAccountId");--> statement-breakpoint
CREATE INDEX "AuthIdentity_userId_idx" ON "AuthIdentity" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "EmailVerificationToken_userId_idx" ON "EmailVerificationToken" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "LearningActivity_userId_activityDate_idx" ON "LearningActivity" USING btree ("userId","activityDate");--> statement-breakpoint
CREATE INDEX "PasswordResetToken_userId_idx" ON "PasswordResetToken" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "RefreshToken_sessionId_revokedAt_idx" ON "RefreshToken" USING btree ("sessionId","revokedAt");--> statement-breakpoint
CREATE INDEX "Session_userId_isActive_idx" ON "Session" USING btree ("userId","isActive");--> statement-breakpoint
CREATE INDEX "User_role_idx" ON "User" USING btree ("role");--> statement-breakpoint
CREATE UNIQUE INDEX "Subscription_provider_transactionId_key" ON "Subscription" USING btree ("provider","transactionId");--> statement-breakpoint
CREATE INDEX "Subscription_userId_status_idx" ON "Subscription" USING btree ("userId","status");--> statement-breakpoint
CREATE INDEX "Transaction_userId_status_idx" ON "Transaction" USING btree ("userId","status");--> statement-breakpoint
CREATE INDEX "ArabicEntity_status_idx" ON "ArabicEntity" USING btree ("status");--> statement-breakpoint
CREATE INDEX "ArabicEntityAudio_entityId_idx" ON "ArabicEntityAudio" USING btree ("entityId");--> statement-breakpoint
CREATE UNIQUE INDEX "ArabicEntityAudio_entityId_variant_key" ON "ArabicEntityAudio" USING btree ("entityId","variant");--> statement-breakpoint
CREATE INDEX "Conversation_status_idx" ON "Conversation" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "ConversationTurn_conversationId_order_key" ON "ConversationTurn" USING btree ("conversationId","order");--> statement-breakpoint
CREATE INDEX "ConversationTurn_sentenceId_idx" ON "ConversationTurn" USING btree ("sentenceId");--> statement-breakpoint
CREATE UNIQUE INDEX "GrammaticalVariant_wordId_form_key" ON "GrammaticalVariant" USING btree ("wordId","form");--> statement-breakpoint
CREATE INDEX "GrammaticalVariant_entityId_idx" ON "GrammaticalVariant" USING btree ("entityId");--> statement-breakpoint
CREATE INDEX "Sentence_entityId_idx" ON "Sentence" USING btree ("entityId");--> statement-breakpoint
CREATE INDEX "Sentence_relatedWordId_idx" ON "Sentence" USING btree ("relatedWordId");--> statement-breakpoint
CREATE INDEX "Sentence_status_idx" ON "Sentence" USING btree ("status");--> statement-breakpoint
CREATE INDEX "Sentence_category_idx" ON "Sentence" USING btree ("category");--> statement-breakpoint
CREATE UNIQUE INDEX "SentenceWord_sentenceId_wordId_key" ON "SentenceWord" USING btree ("sentenceId","wordId");--> statement-breakpoint
CREATE INDEX "SentenceWord_sentenceId_idx" ON "SentenceWord" USING btree ("sentenceId");--> statement-breakpoint
CREATE INDEX "SentenceWord_wordId_idx" ON "SentenceWord" USING btree ("wordId");--> statement-breakpoint
CREATE INDEX "Word_entityId_idx" ON "Word" USING btree ("entityId");--> statement-breakpoint
CREATE INDEX "Word_status_idx" ON "Word" USING btree ("status");--> statement-breakpoint
CREATE INDEX "Word_category_idx" ON "Word" USING btree ("category");--> statement-breakpoint
CREATE INDEX "ContentCompletion_userId_idx" ON "ContentCompletion" USING btree ("userId");--> statement-breakpoint
CREATE UNIQUE INDEX "ContentCompletion_user_item_key" ON "ContentCompletion" USING btree ("userId","completedItemType","completedItemId");--> statement-breakpoint
CREATE INDEX "Course_status_idx" ON "Course" USING btree ("status");--> statement-breakpoint
CREATE INDEX "Lesson_sectionId_idx" ON "Lesson" USING btree ("sectionId");--> statement-breakpoint
CREATE UNIQUE INDEX "Lesson_sectionId_order_key" ON "Lesson" USING btree ("sectionId","order");--> statement-breakpoint
CREATE INDEX "LessonContentItem_lessonId_idx" ON "LessonContentItem" USING btree ("lessonId");--> statement-breakpoint
CREATE UNIQUE INDEX "LessonContentItem_lessonId_order_key" ON "LessonContentItem" USING btree ("lessonId","order");--> statement-breakpoint
CREATE UNIQUE INDEX "LessonContentItem_id_lessonId_type_key" ON "LessonContentItem" USING btree ("id","lessonId","contentType");--> statement-breakpoint
CREATE UNIQUE INDEX "LessonProgress_userId_lessonId_key" ON "LessonProgress" USING btree ("userId","lessonId");--> statement-breakpoint
CREATE INDEX "LessonProgress_userId_updatedAt_idx" ON "LessonProgress" USING btree ("userId","updatedAt");--> statement-breakpoint
CREATE INDEX "Section_courseId_idx" ON "Section" USING btree ("courseId");--> statement-breakpoint
CREATE UNIQUE INDEX "Section_courseId_order_key" ON "Section" USING btree ("courseId","order");