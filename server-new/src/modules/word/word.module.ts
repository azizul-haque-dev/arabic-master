import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { AI_PROCESSING, WORD_QUEUE_NAME } from '../../config/constants.js';
import { AiModule } from '../ai/ai.module.js';
import { ArabicEntityModule } from '../arabic-entity/arabic-entity.module.js';
import { WordController } from './word.controller.js';
import { WordProcessor } from './word.processor.js';
import { WordRepository } from './word.repository.js';
import { WordService } from './word.service.js';

@Module({
  imports: [
    BullModule.registerQueue({
      name: WORD_QUEUE_NAME,
      defaultJobOptions: {
        attempts: AI_PROCESSING.QUEUE_RETRY_ATTEMPTS,
        backoff: {
          type: 'exponential',
          delay: AI_PROCESSING.QUEUE_RETRY_DELAY_MS,
        },
      },
    }),
    ArabicEntityModule,
    AiModule, // AiModule-e AiService export kora ache — ager fix mone koro
  ],
  controllers: [WordController],
  providers: [WordService, WordRepository, WordProcessor],
})
export class WordModule {}
