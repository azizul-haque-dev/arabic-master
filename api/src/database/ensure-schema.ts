import type { Pool } from 'pg';
import { logger } from '../common/http/logger.js';

/**
 * Ensures critical tables, columns, and backfilled audio entries exist in the database.
 * This runs on database startup to prevent errors like relation "ArabicEntityAudio" does not exist
 * when migrations haven't run or when connecting to an existing database.
 */
export async function ensureDatabaseSchema(pool: Pool): Promise<void> {
  // 1. Ensure ArabicEntityAudio table exists
  try {
    await pool.query(`
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
    `);
  } catch (err) {
    logger.warn({ err }, 'Could not ensure ArabicEntityAudio table');
  }

  // 2. Add foreign key if ArabicEntity exists and constraint does not
  try {
    await pool.query(`
      DO $$ BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ArabicEntity') THEN
          BEGIN
            ALTER TABLE "ArabicEntityAudio" 
              ADD CONSTRAINT "ArabicEntityAudio_entityId_ArabicEntity_id_fk" 
              FOREIGN KEY ("entityId") REFERENCES "public"."ArabicEntity"("id") 
              ON DELETE CASCADE ON UPDATE NO ACTION;
          EXCEPTION
            WHEN duplicate_object THEN null;
            WHEN others THEN null;
          END;
        END IF;
      END $$;
    `);
  } catch (err) {
    logger.warn({ err }, 'Could not add foreign key constraint');
  }

  // 3. Ensure indexes exist
  try {
    await pool.query(`
      CREATE INDEX IF NOT EXISTS "ArabicEntityAudio_entityId_idx" ON "ArabicEntityAudio" USING btree ("entityId");
      CREATE UNIQUE INDEX IF NOT EXISTS "ArabicEntityAudio_entityId_variant_key" ON "ArabicEntityAudio" USING btree ("entityId","variant");
    `);
  } catch (err) {
    logger.warn({ err }, 'Could not create indexes on ArabicEntityAudio');
  }

  // 4. Ensure meaningBangla and meaningEnglish columns exist on ArabicEntity
  try {
    await pool.query(`
      DO $$ BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ArabicEntity') THEN
          ALTER TABLE "ArabicEntity" ADD COLUMN IF NOT EXISTS "meaningBangla" text;
          ALTER TABLE "ArabicEntity" ADD COLUMN IF NOT EXISTS "meaningEnglish" text;
          ALTER TABLE "ArabicEntity" ADD COLUMN IF NOT EXISTS "pronunciationBangla" text DEFAULT '';
          ALTER TABLE "ArabicEntity" ADD COLUMN IF NOT EXISTS "pronunciationEnglish" text DEFAULT '';
          BEGIN
            ALTER TABLE "ArabicEntity" ALTER COLUMN "pronunciationBangla" DROP NOT NULL;
            ALTER TABLE "ArabicEntity" ALTER COLUMN "pronunciationEnglish" DROP NOT NULL;
          EXCEPTION
            WHEN others THEN null;
          END;
        END IF;
      END $$;
    `);
  } catch (err) {
    logger.warn({ err }, 'Could not ensure ArabicEntity columns');
  }

  // 5. Backfill: If any ArabicEntity has audioUrl but no record in ArabicEntityAudio, create a DEFAULT audio record
  try {
    await pool.query(`
      DO $$ BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ArabicEntity') 
           AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ArabicEntityAudio') THEN
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
        END IF;
      END $$;
    `);
  } catch (err) {
    logger.warn({ err }, 'Could not backfill legacy audio into ArabicEntityAudio');
  }

  // 6. Ensure SentenceType enum and Sentence.sentenceType column + index exist
  try {
    await pool.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'SentenceType') THEN
          CREATE TYPE "SentenceType" AS ENUM ('SHORT', 'LONG');
        END IF;
      END $$;
    `);
    await pool.query(`
      DO $$ BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Sentence') THEN
          ALTER TABLE "Sentence" ADD COLUMN IF NOT EXISTS "sentenceType" "SentenceType" DEFAULT 'LONG' NOT NULL;
          CREATE INDEX IF NOT EXISTS "Sentence_sentenceType_idx" ON "Sentence" USING btree ("sentenceType");
        END IF;
      END $$;
    `);
  } catch (err) {
    logger.warn({ err }, 'Could not ensure Sentence.sentenceType column');
  }

  logger.info('Database schema and ArabicEntityAudio verified successfully');
}
