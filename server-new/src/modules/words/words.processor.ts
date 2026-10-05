import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { eq } from 'drizzle-orm';
import { PinoLogger } from 'nestjs-pino';
import {
  DEFAULT_CATEGORY,
  isValidCategory,
} from '../../common/constants/category.constant.js';
import { WORD_QUEUE_NAME } from '../../config/constants.js';
import { DatabaseService } from '../../database/drizzle/db.service.js';
import * as schema from '../../database/drizzle/schema.js';
import { AiService } from '../ai/ai.service.js';
import { ArabicEntityService } from '../arabic-entities/arabic-entities.service.js';

@Processor(WORD_QUEUE_NAME)
export class WordProcessor extends WorkerHost {
  constructor(
    private readonly db: DatabaseService,
    private readonly arabicEntityService: ArabicEntityService,
    private readonly aiService: AiService,
    private readonly logger: PinoLogger,
  ) {
    super();
    this.logger.setContext(WordProcessor.name);
  }

  async process(job: Job<{ wordId: string; arabicText: string }>) {
    const { wordId, arabicText } = job.data;

    const rows = await this.db.db
      .select()
      .from(schema.word)
      .where(eq(schema.word.id, wordId))
      .limit(1);
    const word = rows[0] ?? null;
    if (!word) {
      // Word delete hoye geche AI-r response asar age — kaj korar dorkar nai
      this.logger.warn(
        `Word ${wordId} was deleted before the AI job ran — skipping.`,
      );
      return;
    }

    const result = await this.aiService.generateContent(arabicText);

    // AI-r category-o defensive check — zod enum thakleo double-check
    const category = isValidCategory(result.category)
      ? result.category
      : DEFAULT_CATEGORY;
    if (category !== result.category) {
      this.logger.warn(
        `AI returned unknown category "${result.category}" for word ${wordId} — defaulted to ${DEFAULT_CATEGORY}.`,
      );
    }

    // Mirror pattern: Entity nijer pronunciation copy rakhe, Word-o nijer copy rakhe
    await this.arabicEntityService.updateAiPronunciation(word.entityId, {
      pronunciationBangla: result.pronunciationBn,
      pronunciationEnglish: result.pronunciationEn,
    });

    await this.db.db
      .update(schema.word)
      .set({
        meaningEn: result.meaningEn,
        meaningBn: result.meaningBn,
        whenToUseEn: result.whenToUseEn,
        whenToUseBn: result.whenToUseBn,
        pronunciationEn: result.pronunciationEn,
        pronunciationBn: result.pronunciationBn,
        feminineEn: result.feminineEn,
        feminineBn: result.feminineBn,
        noteEn: result.noteEn ?? null,
        noteBn: result.noteBn ?? null,
        category,
      })
      .where(eq(schema.word.id, wordId));
  }

  // Job fail hole (retry-r pore o) log rakhbe — production e debug korar jonno jaruri
  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(
      `Job ${job.id} failed (attempt ${job.attemptsMade}): ${error.message}`,
    );
  }
}
