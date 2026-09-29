import { PartialType } from '@nestjs/mapped-types';
import { CreateSentenceDto } from './create-sentence.dto.js';

export class UpdateSentenceDto extends PartialType(CreateSentenceDto) {}
