import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { SentenceRepository } from './sentence.repository.js';

import { isValidCategory } from '../../common/constants/category.constant.js';
import { cleanTextAndSpaces } from '../../common/utils/normalize-arabic.util.js';
import { SENTENCE_QUEUE_NAME } from '../../config/constants.js';
import { AiService } from '../ai/ai.service.js';
import { AiWordService } from '../ai/word/ai-word.service.js';
import { ArabicEntityService } from '../arabic-entities/arabic-entities.service.js';

interface ProcessSentenceData {
  sentenceId: string;
  arabicText: string;
  createdById?: string;
}
interface ResyncWordsData {
  sentenceId: string;
  arabicText: string;
}

@Processor(SENTENCE_QUEUE_NAME)
export class SentenceProcessor extends WorkerHost {
  private readonly logger = new Logger(SentenceProcessor.name);

  constructor(
    private readonly sentenceRepository: SentenceRepository,
    private readonly arabicEntityService: ArabicEntityService,
    private readonly aiService: AiService,
    private readonly aiWordService: AiWordService,
  ) {
    super();
  }

  // Old code used a name-based dispatch() for two job types — same idea
  // here, just via Nest's process() entrypoint.
  async process(job: Job<ProcessSentenceData | ResyncWordsData>) {
    if (job.name === 'resync-sentence-words') {
      return this.resyncWords(job as Job<ResyncWordsData>);
    }
    return this.processSentence(job as Job<ProcessSentenceData>);
  }

  private async processSentence(job: Job<ProcessSentenceData>) {
    const { sentenceId, arabicText, createdById } = job.data;

    const sentence = await this.sentenceRepository.findById(sentenceId);
    if (!sentence) {
      this.logger.warn(
        `Sentence ${sentenceId} was deleted before the AI job ran — skipping.`,
      );
      return;
    }

    const result = await this.aiService.generateContent(arabicText);

    const category = isValidCategory(result.category)
      ? result.category
      : 'GENERAL';
    if (category !== result.category) {
      this.logger.warn(
        `AI returned unknown category "${result.category}" for sentence ${sentenceId} — defaulted to GENERAL.`,
      );
    }

    await this.arabicEntityService.updateAiPronunciation(sentence.entityId, {
      pronunciationBangla: result.pronunciationBn,
      pronunciationEnglish: result.pronunciationEn,
    });

    await this.sentenceRepository.update(sentenceId, {
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

    const words = await this.getOrCreateWordsForSentence(
      arabicText,
      createdById,
    );
    await this.sentenceRepository.replaceWords(sentenceId, words);
  }

  private async resyncWords(job: Job<ResyncWordsData>) {
    const { sentenceId, arabicText } = job.data;
    const sentence = await this.sentenceRepository.findById(sentenceId);
    if (!sentence) {
      this.logger.warn(
        `Sentence ${sentenceId} was deleted before resync ran — skipping.`,
      );
      return;
    }
    const words = await this.getOrCreateWordsForSentence(arabicText);
    await this.sentenceRepository.replaceWords(sentenceId, words);
  }

  // Splits into tokens, get-or-creates a Word for each (AiWordService
  // already handles dedup + AI generation), returns {wordId, position}.
  //
  // NOTE: SentenceWord has @@unique([sentenceId, wordId]) now — a word
  // can't be linked twice in one sentence. If it repeats, only the
  // FIRST position is kept; later repeats are dropped (logged).
  private async getOrCreateWordsForSentence(
    arabicText: string,
    createdById?: string,
  ) {
    const tokens = cleanTextAndSpaces(arabicText).split(' ').filter(Boolean);

    const seen = new Set<string>();
    const result: { wordId: string; position: number }[] = [];

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      try {
        const word = await this.aiWordService.createWordViaAi(
          token,
          createdById,
        );
        if (seen.has(word.id)) {
          this.logger.warn(
            `Word "${token}" repeats in this sentence — keeping only its first position.`,
          );
          continue;
        }
        seen.add(word.id);
        result.push({ wordId: word.id, position: i + 1 });
      } catch (error: any) {
        // One bad word shouldn't kill the whole sentence's word linking.
        this.logger.error(
          `Failed to resolve word "${token}": ${error.message}`,
        );
      }
    }

    return result;
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(
      `Job ${job.id} (${job.name}) failed (attempt ${job.attemptsMade}): ${error.message}`,
    );
  }
}
