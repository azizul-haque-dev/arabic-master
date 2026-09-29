import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PinoLogger } from 'nestjs-pino';
import { isValidCategory } from '../../common/constants/category.constant.js';
import { WORD_QUEUE_NAME } from '../../config/constants.js';
import { AiService } from '../ai/ai.service.js';
import { ArabicEntityService } from '../arabic-entities/arabic-entities.service.js';
import { WordRepository } from './words.repository.js';

@Processor(WORD_QUEUE_NAME)
export class WordProcessor extends WorkerHost {
  constructor(
    private readonly wordRepository: WordRepository,
    private readonly arabicEntityService: ArabicEntityService,
    private readonly aiService: AiService,
    private readonly logger: PinoLogger,
  ) {
    super();
    this.logger.setContext(WordProcessor.name);
  }

  async process(job: Job<{ wordId: string; arabicText: string }>) {
    const { wordId, arabicText } = job.data;

    const word = await this.wordRepository.findById(wordId);
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
      : 'GENERAL';
    if (category !== result.category) {
      this.logger.warn(
        `AI returned unknown category "${result.category}" for word ${wordId} — defaulted to GENERAL.`,
      );
    }

    // Mirror pattern: Entity nijer pronunciation copy rakhe, Word-o nijer copy rakhe
    await this.arabicEntityService.updateAiPronunciation(word.entityId, {
      pronunciationBangla: result.pronunciationBn,
      pronunciationEnglish: result.pronunciationEn,
    });

    await this.wordRepository.update(wordId, {
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
    });
  }

  // Job fail hole (retry-r pore o) log rakhbe — production e debug korar jonno jaruri
  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(
      `Job ${job.id} failed (attempt ${job.attemptsMade}): ${error.message}`,
    );
  }
}
