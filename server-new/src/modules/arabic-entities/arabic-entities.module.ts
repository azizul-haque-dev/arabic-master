import { Module } from '@nestjs/common';
import { ArabicEntityService } from './arabic-entities.service.js';

@Module({
  providers: [ArabicEntityService],
  exports: [ArabicEntityService],
})
export class ArabicEntityModule {}
