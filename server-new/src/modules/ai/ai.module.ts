import { Module } from '@nestjs/common';
import { AiController } from './ai.controller.js';
import { AiService } from './ai.service.js';
import { ModelProviderService } from './providers/providers.model.js';

@Module({
  controllers: [AiController],
  providers: [AiService, ModelProviderService],
  exports: [AiService],
})
export class AiModule {}
