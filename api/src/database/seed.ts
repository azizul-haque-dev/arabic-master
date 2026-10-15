import { eq, sql } from 'drizzle-orm';
import { v7 as randomUUIDv7 } from 'uuid';
import { normalizeArabicText } from '../common/utils/normalize-arabic.util.js';
import { db } from './db.js';
import * as schema from './drizzle/schema.js';

interface SeedArabicEntity {
  entityKey: string;
  arabicText: string;
  normalizedText: string;
  meaningBangla: string;
  meaningEnglish: string;
  pronunciationBangla: string;
  pronunciationEnglish: string;
  hasAudio: boolean;
  audioUrl?: string | null;
  status: 'DRAFT' | 'IN_REVIEW' | 'APPROVED' | 'PUBLISHED' | 'REJECTED' | 'ARCHIVED';
  rejectionReason?: string | null;
}

const mockArabicEntities: SeedArabicEntity[] = [
  {
    entityKey: 'AE-1002',
    arabicText: 'رخيص',
    normalizedText: 'رخيص',
    meaningBangla: 'সস্তা',
    meaningEnglish: 'Cheap',
    pronunciationBangla: 'রাখিস',
    pronunciationEnglish: 'Rakhees',
    hasAudio: true,
    audioUrl: '/audio/ae-1002.mp3',
    status: 'PUBLISHED',
  },
  {
    entityKey: 'AE-1024',
    arabicText: 'مرحبا',
    normalizedText: 'مرحبا',
    meaningBangla: 'হ্যালো / স্বাগতম',
    meaningEnglish: 'Hello / Welcome',
    pronunciationBangla: 'মারহাবান',
    pronunciationEnglish: 'Marhaban',
    hasAudio: true,
    audioUrl: '/audio/ae-1024.mp3',
    status: 'PUBLISHED',
  },
  {
    entityKey: 'AE-1025',
    arabicText: 'مرحباً بك',
    normalizedText: 'مرحبا بك',
    meaningBangla: 'স্বাগতম',
    meaningEnglish: 'Welcome',
    pronunciationBangla: 'মারহাবান বিক',
    pronunciationEnglish: 'Marhaban bik',
    hasAudio: true,
    audioUrl: '/audio/ae-1025.mp3',
    status: 'PUBLISHED',
  },
  {
    entityKey: 'AE-1032',
    arabicText: 'كم السعر؟',
    normalizedText: 'كم السعر',
    meaningBangla: 'দাম কত?',
    meaningEnglish: 'How much is it?',
    pronunciationBangla: "কাম আস-সি'র",
    pronunciationEnglish: 'Kam as-si\'r?',
    hasAudio: true,
    audioUrl: '/audio/ae-1032.mp3',
    status: 'PUBLISHED',
  },
  {
    entityKey: 'AE-1033',
    arabicText: 'أريد هذا',
    normalizedText: 'اريد هذا',
    meaningBangla: 'আমি এটা চাই',
    meaningEnglish: 'I want this',
    pronunciationBangla: 'উরিদু হাযা',
    pronunciationEnglish: 'Ureedu haza',
    hasAudio: false,
    audioUrl: null,
    status: 'IN_REVIEW',
  },
  {
    entityKey: 'AE-1041',
    arabicText: 'شكراً',
    normalizedText: 'شكرا',
    meaningBangla: 'ধন্যবাদ',
    meaningEnglish: 'Thank you',
    pronunciationBangla: 'শুকরান',
    pronunciationEnglish: 'Shukran',
    hasAudio: true,
    audioUrl: '/audio/ae-1041.mp3',
    status: 'PUBLISHED',
  },
  {
    entityKey: 'AE-1058',
    arabicText: 'أين الحمام؟',
    normalizedText: 'اين الحمام',
    meaningBangla: 'টয়লেট কোথায়?',
    meaningEnglish: 'Where is the bathroom?',
    pronunciationBangla: 'আইনাল হাম্মাম',
    pronunciationEnglish: 'Aynal hammam?',
    hasAudio: false,
    audioUrl: null,
    status: 'DRAFT',
  },
  {
    entityKey: 'AE-1060',
    arabicText: 'بكم هذا؟',
    normalizedText: 'بكم هذا',
    meaningBangla: 'এটার দাম কত?',
    meaningEnglish: 'How much is this?',
    pronunciationBangla: 'বিকাম হাযা',
    pronunciationEnglish: 'Bikam haza?',
    hasAudio: false,
    audioUrl: null,
    status: 'REJECTED',
    rejectionReason:
      "English pronunciation needs correction — should be closer to 'bi-kam' with a short pause.",
  },
];

async function seed() {
  console.log('🌱 Starting database seeding for Arabic Entities...');

  // 1. Migrate existing non-AE entity keys to AE-XXXX
  const nonAeEntities = await db
    .select()
    .from(schema.arabicEntity)
    .where(sql`"entityKey" !~ '^AE-[0-9]+$'`);

  if (nonAeEntities.length > 0) {
    console.log(`Found ${nonAeEntities.length} existing entities with legacy entity keys.`);
    
    // Find all used AE numbers to avoid conflicts
    const allExistingKeys = await db
      .select({ entityKey: schema.arabicEntity.entityKey })
      .from(schema.arabicEntity)
      .where(sql`"entityKey" ~ '^AE-[0-9]+$'`);

    const usedNumbers = new Set<number>();
    for (const row of allExistingKeys) {
      const match = row.entityKey.match(/^AE-(\d+)$/);
      if (match) usedNumbers.add(parseInt(match[1], 10));
    }
    for (const seedItem of mockArabicEntities) {
      const match = seedItem.entityKey.match(/^AE-(\d+)$/);
      if (match) usedNumbers.add(parseInt(match[1], 10));
    }

    let nextAvailable = 1001;
    for (const entity of nonAeEntities) {
      while (usedNumbers.has(nextAvailable)) {
        nextAvailable++;
      }
      const newKey = `AE-${nextAvailable}`;
      usedNumbers.add(nextAvailable);

      await db
        .update(schema.arabicEntity)
        .set({ entityKey: newKey, updatedAt: new Date() })
        .where(eq(schema.arabicEntity.id, entity.id));
      console.log(`  Updated entity "${entity.arabicText}" (${entity.id}): ${entity.entityKey} -> ${newKey}`);
    }
  }

  // 2. Insert or update the 8 canonical mock Arabic entities
  for (const item of mockArabicEntities) {
    const normalized = normalizeArabicText(item.arabicText);

    // Check if an entity with this normalized text already exists
    const [existingByNorm] = await db
      .select()
      .from(schema.arabicEntity)
      .where(eq(schema.arabicEntity.normalizedText, normalized))
      .limit(1);

    if (existingByNorm) {
      await db
        .update(schema.arabicEntity)
        .set({
          entityKey: item.entityKey,
          arabicText: item.arabicText,
          normalizedText: normalized,
          audioUrl: item.audioUrl ?? null,
          pronunciationBangla: item.pronunciationBangla,
          pronunciationEnglish: item.pronunciationEnglish,
          status: item.status,
          rejectionReason: item.rejectionReason ?? null,
          updatedAt: new Date(),
        })
        .where(eq(schema.arabicEntity.id, existingByNorm.id));
      console.log(`  ✅ Synced existing entity "${item.arabicText}" with entityKey ${item.entityKey}`);
    } else {
      // Check if entityKey already exists (under different text)
      const [existingByKey] = await db
        .select()
        .from(schema.arabicEntity)
        .where(eq(schema.arabicEntity.entityKey, item.entityKey))
        .limit(1);

      if (existingByKey) {
        console.log(`  ⚠️ entityKey ${item.entityKey} already in use by ID ${existingByKey.id}. Skipping.`);
        continue;
      }

      await db.insert(schema.arabicEntity).values({
        id: randomUUIDv7(),
        entityKey: item.entityKey,
        arabicText: item.arabicText,
        normalizedText: normalized,
        audioUrl: item.audioUrl ?? null,
        pronunciationBangla: item.pronunciationBangla,
        pronunciationEnglish: item.pronunciationEnglish,
        status: item.status,
        rejectionReason: item.rejectionReason ?? null,
      });
      console.log(`  ✨ Inserted seed entity: [${item.entityKey}] "${item.arabicText}"`);
    }
  }

  console.log('🎉 Seeding completed successfully!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
