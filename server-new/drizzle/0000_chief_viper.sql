DO $$ BEGIN CREATE TYPE "public"."AuthProvider" AS ENUM('GOOGLE'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;--> statement-breakpoint
DO $$ BEGIN CREATE TYPE "public"."ContentStatus" AS ENUM('DRAFT', 'IN_REVIEW', 'APPROVED', 'PUBLISHED', 'REJECTED', 'ARCHIVED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;--> statement-breakpoint
DO $$ BEGIN CREATE TYPE "public"."CourseType" AS ENUM('FREE', 'PRO'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;--> statement-breakpoint
DO $$ BEGIN CREATE TYPE "public"."DifficultyLevel" AS ENUM('BEGINNER', 'ELEMENTARY', 'INTERMEDIATE', 'ADVANCED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;--> statement-breakpoint
DO $$ BEGIN CREATE TYPE "public"."GrammaticalForm" AS ENUM('FIRST_PERSON', 'SECOND_PERSON_MASCULINE', 'SECOND_PERSON_FEMININE', 'THIRD_PERSON_MASCULINE', 'THIRD_PERSON_FEMININE', 'FIRST_PERSON_PLURAL', 'THIRD_PERSON_PLURAL', 'SINGULAR', 'DUAL', 'PLURAL', 'MASCULINE', 'FEMININE'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;--> statement-breakpoint
DO $$ BEGIN CREATE TYPE "public"."LessonContentType" AS ENUM('WORD', 'SENTENCE', 'CONVERSATION'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;--> statement-breakpoint
DO $$ BEGIN CREATE TYPE "public"."OnboardingLevel" AS ENUM('BEGINNER', 'BASIC', 'INTERMEDIATE'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;--> statement-breakpoint
DO $$ BEGIN CREATE TYPE "public"."PaymentProvider" AS ENUM('SSLCOMMERZ', 'SHURJOPAY', 'AAMARPAY', 'APPLE_IAP', 'GOOGLE_PLAY'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;--> statement-breakpoint
DO $$ BEGIN CREATE TYPE "public"."PreferredLanguage" AS ENUM('BN', 'EN'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;--> statement-breakpoint
DO $$ BEGIN CREATE TYPE "public"."Role" AS ENUM('USER', 'CONTENT_MANAGER', 'ADMIN'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;--> statement-breakpoint
DO $$ BEGIN CREATE TYPE "public"."SubscriptionStatus" AS ENUM('ACTIVE', 'EXPIRED', 'CANCELLED', 'PENDING'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;--> statement-breakpoint
DO $$ BEGIN CREATE TYPE "public"."Tense" AS ENUM('PAST', 'PRESENT', 'FUTURE'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;--> statement-breakpoint
DO $$ BEGIN CREATE TYPE "public"."TransactionStatus" AS ENUM('SUCCESS', 'PENDING', 'FAILED', 'REFUNDED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;--> statement-breakpoint
DO $$ BEGIN CREATE TYPE "public"."UserStatus" AS ENUM('ACTIVE', 'SUSPENDED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;--> statement-breakpoint
DO $$ BEGIN CREATE TYPE "public"."WordType" AS ENUM('NOUN', 'VERB', 'ADJECTIVE', 'OTHER', 'UNKNOWN'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "AuthIdentity" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"provider" "AuthProvider" NOT NULL,
	"providerAccountId" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "EmailVerificationToken" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"tokenHash" text NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"usedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "EmailVerificationToken_tokenHash_unique" UNIQUE("tokenHash")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "GuestUser" (
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
CREATE TABLE IF NOT EXISTS "LearningActivity" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"activityDate" timestamp NOT NULL,
	"durationSeconds" integer DEFAULT 0 NOT NULL,
	"xpEarned" integer DEFAULT 0 NOT NULL,
	"qualifying" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "PasswordResetToken" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"tokenHash" text NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"usedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "PasswordResetToken_tokenHash_unique" UNIQUE("tokenHash")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "RefreshToken" (
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
CREATE TABLE IF NOT EXISTS "Session" (
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
CREATE TABLE IF NOT EXISTS "User" (
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
CREATE TABLE IF NOT EXISTS "UserProfile" (
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
CREATE TABLE IF NOT EXISTS "UserProgress" (
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
CREATE TABLE IF NOT EXISTS "Subscription" (
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
CREATE TABLE IF NOT EXISTS "Transaction" (
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
CREATE TABLE IF NOT EXISTS "ArabicEntity" (
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
CREATE TABLE IF NOT EXISTS "ArabicEntityRelation" (
	"conceptId" text NOT NULL,
	"relatedEntityId" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ArabicEntityRelation_conceptId_relatedEntityId_pk" PRIMARY KEY("conceptId","relatedEntityId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Conversation" (
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
CREATE TABLE IF NOT EXISTS "ConversationTurn" (
	"id" text PRIMARY KEY NOT NULL,
	"conversationId" text NOT NULL,
	"order" integer NOT NULL,
	"speaker" text NOT NULL,
	"sentenceId" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "GrammaticalVariant" (
	"id" text PRIMARY KEY NOT NULL,
	"wordId" text NOT NULL,
	"form" "GrammaticalForm" NOT NULL,
	"entityId" text NOT NULL,
	"meaningBn" text,
	"meaningEn" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Sentence" (
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
CREATE TABLE IF NOT EXISTS "SentenceWord" (
	"id" text PRIMARY KEY NOT NULL,
	"sentenceId" text NOT NULL,
	"wordId" text NOT NULL,
	"position" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Word" (
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
CREATE TABLE IF NOT EXISTS "ContentCompletion" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"completedItemType" text NOT NULL,
	"completedItemId" text NOT NULL,
	"completedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Course" (
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
CREATE TABLE IF NOT EXISTS "Lesson" (
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
CREATE TABLE IF NOT EXISTS "LessonContentItem" (
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
CREATE TABLE IF NOT EXISTS "LessonProgress" (
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
CREATE TABLE IF NOT EXISTS "Section" (
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

-- Make the initial migration safe for databases that already contain the legacy schema.
ALTER TABLE "Word" ADD COLUMN IF NOT EXISTS "tense" "Tense";--> statement-breakpoint
ALTER TABLE "Lesson" ADD COLUMN IF NOT EXISTS "description" text;--> statement-breakpoint
ALTER TABLE "Lesson" ADD COLUMN IF NOT EXISTS "order" integer;--> statement-breakpoint
UPDATE "Lesson" SET "description" = '' WHERE "description" IS NULL;--> statement-breakpoint
WITH missing_order AS (
  SELECT lesson."id",
    COALESCE((SELECT MAX(existing."order") FROM "Lesson" AS existing WHERE existing."sectionId" = lesson."sectionId"), -1)
      + ROW_NUMBER() OVER (PARTITION BY lesson."sectionId" ORDER BY lesson."createdAt", lesson."id")::integer AS next_order
  FROM "Lesson" AS lesson
  WHERE lesson."order" IS NULL
)
UPDATE "Lesson" AS lesson SET "order" = missing_order.next_order
FROM missing_order WHERE lesson."id" = missing_order."id";--> statement-breakpoint
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM "Lesson" WHERE "description" IS NULL OR "order" IS NULL) THEN
    RAISE EXCEPTION 'Cannot migrate Lesson: description/order backfill left null values';
  END IF;
END $$;--> statement-breakpoint
ALTER TABLE "Lesson" ALTER COLUMN "description" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "Lesson" ALTER COLUMN "order" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "ContentCompletion" ADD COLUMN IF NOT EXISTS "completedItemType" text;--> statement-breakpoint
ALTER TABLE "ContentCompletion" ADD COLUMN IF NOT EXISTS "completedItemId" text;--> statement-breakpoint
DO $$
DECLARE legacy_columns boolean; invalid_rows boolean;
BEGIN
  SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = 'ContentCompletion' AND column_name = 'contentType') INTO legacy_columns;
  IF legacy_columns THEN
    EXECUTE 'UPDATE "ContentCompletion" SET "completedItemType" = COALESCE("completedItemType", "contentType"::text), "completedItemId" = COALESCE("completedItemId", "wordId", "sentenceId", "conversationId") WHERE "completedItemType" IS NULL OR "completedItemId" IS NULL';
    EXECUTE 'SELECT EXISTS (SELECT 1 FROM "ContentCompletion" WHERE "completedItemType" IS NULL OR "completedItemId" IS NULL OR num_nonnulls("wordId", "sentenceId", "conversationId") <> 1)' INTO invalid_rows;
  ELSE
    SELECT EXISTS (SELECT 1 FROM "ContentCompletion" WHERE "completedItemType" IS NULL OR "completedItemId" IS NULL) INTO invalid_rows;
  END IF;
  IF invalid_rows THEN
    RAISE EXCEPTION 'Cannot migrate ContentCompletion: rows cannot be mapped to exactly one completed item';
  END IF;
END $$;--> statement-breakpoint
ALTER TABLE "ContentCompletion" ALTER COLUMN "completedItemType" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "ContentCompletion" ALTER COLUMN "completedItemId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "LessonProgress" ADD COLUMN IF NOT EXISTS "completedItems" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "LessonProgress" ADD COLUMN IF NOT EXISTS "totalItems" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "LessonProgress" ADD COLUMN IF NOT EXISTS "startedAt" timestamp;--> statement-breakpoint
DO $$
DECLARE legacy_created_at boolean;
BEGIN
  SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = 'LessonProgress' AND column_name = 'createdAt') INTO legacy_created_at;
  IF legacy_created_at THEN
    EXECUTE 'UPDATE "LessonProgress" SET "startedAt" = COALESCE("startedAt", "createdAt", now()) WHERE "startedAt" IS NULL';
  ELSE
    UPDATE "LessonProgress" SET "startedAt" = now() WHERE "startedAt" IS NULL;
  END IF;
END $$;--> statement-breakpoint
ALTER TABLE "LessonProgress" ALTER COLUMN "startedAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "LessonProgress" ALTER COLUMN "startedAt" SET NOT NULL;--> statement-breakpoint
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM "UserProfile" WHERE "learningGoals" IS NULL) THEN
    RAISE EXCEPTION 'Cannot migrate UserProfile: learningGoals contains null values';
  END IF;
END $$;--> statement-breakpoint
ALTER TABLE "UserProfile" ALTER COLUMN "learningGoals" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "User" ALTER COLUMN "updatedAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "UserProfile" ALTER COLUMN "updatedAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "UserProgress" ALTER COLUMN "updatedAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "Subscription" ALTER COLUMN "updatedAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "Transaction" ALTER COLUMN "updatedAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "ArabicEntity" ALTER COLUMN "updatedAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "Word" ALTER COLUMN "updatedAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "Sentence" ALTER COLUMN "updatedAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "Conversation" ALTER COLUMN "updatedAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "Course" ALTER COLUMN "updatedAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "Section" ALTER COLUMN "updatedAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "Lesson" ALTER COLUMN "updatedAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "LessonProgress" ALTER COLUMN "updatedAt" SET DEFAULT now();--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "AuthIdentity_provider_providerAccountId_key" ON "AuthIdentity" USING btree ("provider","providerAccountId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "AuthIdentity_userId_idx" ON "AuthIdentity" USING btree ("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "EmailVerificationToken_userId_idx" ON "EmailVerificationToken" USING btree ("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "LearningActivity_userId_activityDate_idx" ON "LearningActivity" USING btree ("userId","activityDate");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "PasswordResetToken_userId_idx" ON "PasswordResetToken" USING btree ("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "RefreshToken_sessionId_revokedAt_idx" ON "RefreshToken" USING btree ("sessionId","revokedAt");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "Session_userId_isActive_idx" ON "Session" USING btree ("userId","isActive");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "Subscription_provider_transactionId_key" ON "Subscription" USING btree ("provider","transactionId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "Subscription_userId_status_idx" ON "Subscription" USING btree ("userId","status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "Transaction_userId_status_idx" ON "Transaction" USING btree ("userId","status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ArabicEntity_status_idx" ON "ArabicEntity" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "Conversation_status_idx" ON "Conversation" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "ConversationTurn_conversationId_order_key" ON "ConversationTurn" USING btree ("conversationId","order");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ConversationTurn_sentenceId_idx" ON "ConversationTurn" USING btree ("sentenceId");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "GrammaticalVariant_wordId_form_key" ON "GrammaticalVariant" USING btree ("wordId","form");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "GrammaticalVariant_entityId_idx" ON "GrammaticalVariant" USING btree ("entityId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "Sentence_entityId_idx" ON "Sentence" USING btree ("entityId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "Sentence_relatedWordId_idx" ON "Sentence" USING btree ("relatedWordId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "Sentence_status_idx" ON "Sentence" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "Sentence_category_idx" ON "Sentence" USING btree ("category");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "SentenceWord_sentenceId_wordId_key" ON "SentenceWord" USING btree ("sentenceId","wordId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "SentenceWord_sentenceId_idx" ON "SentenceWord" USING btree ("sentenceId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "SentenceWord_wordId_idx" ON "SentenceWord" USING btree ("wordId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "Word_entityId_idx" ON "Word" USING btree ("entityId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "Word_status_idx" ON "Word" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "Word_category_idx" ON "Word" USING btree ("category");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ContentCompletion_userId_idx" ON "ContentCompletion" USING btree ("userId");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "ContentCompletion_user_item_key" ON "ContentCompletion" USING btree ("userId","completedItemType","completedItemId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "Course_status_idx" ON "Course" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "Lesson_sectionId_idx" ON "Lesson" USING btree ("sectionId");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "Lesson_sectionId_order_key" ON "Lesson" USING btree ("sectionId","order");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "LessonContentItem_lessonId_idx" ON "LessonContentItem" USING btree ("lessonId");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "LessonContentItem_lessonId_order_key" ON "LessonContentItem" USING btree ("lessonId","order");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "LessonContentItem_id_lessonId_type_key" ON "LessonContentItem" USING btree ("id","lessonId","contentType");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "LessonProgress_userId_lessonId_key" ON "LessonProgress" USING btree ("userId","lessonId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "LessonProgress_userId_updatedAt_idx" ON "LessonProgress" USING btree ("userId","updatedAt");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "Section_courseId_idx" ON "Section" USING btree ("courseId");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "Section_courseId_order_key" ON "Section" USING btree ("courseId","order");