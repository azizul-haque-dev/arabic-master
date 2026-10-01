import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AI_PROCESSING, WORD_QUEUE_NAME } from '../../config/constants.js';
import { AuthModule } from '../auth/auth.module.js';
import { AiModule } from '../ai/ai.module.js';
import { ArabicEntityModule } from '../arabic-entities/arabic-entities.module.js';
import { WordController } from './words.controller.js';
import { WordProcessor } from './words.processor.js';
import { WordRepository } from './words.repository.js';
import { WordService } from './words.service.js';

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
    PassportModule.register({ session: false }),
    AuthModule,
    ArabicEntityModule,
    AiModule, // AiModule-e AiService export kora ache — ager fix mone koro
  ],
  controllers: [WordController],
  providers: [WordService, WordRepository, WordProcessor],
})
export class WordModule {}
