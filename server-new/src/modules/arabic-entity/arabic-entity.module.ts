import { Module } from '@nestjs/common';
import { ArabicEntityService } from './arabic-entity.service.js';

@Module({
  providers: [ArabicEntityService],
  exports: [ArabicEntityService],
})
export class ArabicEntityModule {}
