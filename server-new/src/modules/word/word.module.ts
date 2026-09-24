import { Module } from '@nestjs/common';
import { WordService } from './word.service.js';
import { WordController } from './word.controller.js';

@Module({
  controllers: [WordController],
  providers: [WordService],
})
export class WordModule {}
