import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { SentenceController } from './sentence.controller.js';
import { SentenceProcessor } from './sentence.processor.js';
import { SentenceRepository } from './sentence.repository.js';
import { SentenceService } from './sentence.service.js';

import { AI_PROCESSING, SENTENCE_QUEUE_NAME } from '../../config/constants.js';
import { AuthModule } from '../auth/auth.module.js';
import { AiModule } from '../ai/ai.module.js';
import { AiWordModule } from '../ai/word/ai-word.module.js';
import { ArabicEntityModule } from '../arabic-entities/arabic-entities.module.js';

@Module({
  imports: [
    BullModule.registerQueue({
      name: SENTENCE_QUEUE_NAME,
      defaultJobOptions: {
        attempts: AI_PROCESSING.QUEUE_RETRY_ATTEMPTS,
        backoff: {
          type: 'exponential',
          delay: AI_PROCESSING.QUEUE_RETRY_DELAY_MS,
        },
      },
    }),
    PassportModule.register({ session: false }),
    AuthModule,
    ArabicEntityModule,
    AiModule,
    AiWordModule,
  ],
  controllers: [SentenceController],
  providers: [SentenceService, SentenceRepository, SentenceProcessor],
})
export class SentenceModule {}
