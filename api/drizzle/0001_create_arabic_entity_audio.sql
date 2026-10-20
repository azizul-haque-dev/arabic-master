CREATE TABLE IF NOT EXISTS "ArabicEntityAudio" (
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
DO $$ BEGIN
  ALTER TABLE "ArabicEntityAudio" ADD CONSTRAINT "ArabicEntityAudio_entityId_ArabicEntity_id_fk" FOREIGN KEY ("entityId") REFERENCES "public"."ArabicEntity"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ArabicEntityAudio_entityId_idx" ON "ArabicEntityAudio" USING btree ("entityId");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "ArabicEntityAudio_entityId_variant_key" ON "ArabicEntityAudio" USING btree ("entityId","variant");
--> statement-breakpoint
ALTER TABLE "ArabicEntity" ADD COLUMN IF NOT EXISTS "meaningBangla" text;
--> statement-breakpoint
ALTER TABLE "ArabicEntity" ADD COLUMN IF NOT EXISTS "meaningEnglish" text;
--> statement-breakpoint
-- Backfill existing ArabicEntity rows that have audioUrl into ArabicEntityAudio if missing
INSERT INTO "ArabicEntityAudio" ("id", "entityId", "objectKey", "mimeType", "fileSizeBytes", "variant", "speaker", "createdById", "createdAt", "updatedAt")
SELECT 
  'legacy-audio-' || ae."id",
  ae."id",
  'legacy-audio/' || ae."id" || '.mp3',
  'audio/mpeg',
  0,
  'DEFAULT',
  'Original',
  ae."createdById",
  ae."createdAt",
  ae."updatedAt"
FROM "ArabicEntity" ae
WHERE ae."audioUrl" IS NOT NULL AND ae."audioUrl" != ''
  AND NOT EXISTS (
    SELECT 1 FROM "ArabicEntityAudio" aea 
    WHERE aea."entityId" = ae."id" AND aea."variant" = 'DEFAULT'
  )
ON CONFLICT DO NOTHING;
