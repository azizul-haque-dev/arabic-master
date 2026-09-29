import { Module } from '@nestjs/common';
import { AiModule } from '../ai.module.js';
import { AiWordService } from './ai-word.service.js';

@Module({
  imports: [AiModule],
  providers: [AiWordService],
  exports: [AiWordService],
})
export class AiWordModule {}
