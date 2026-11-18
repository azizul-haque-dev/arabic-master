ALTER TABLE "Sentence" ADD COLUMN "replyOptions" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "Word" ADD COLUMN "replyOptions" jsonb DEFAULT '[]'::jsonb NOT NULL;
