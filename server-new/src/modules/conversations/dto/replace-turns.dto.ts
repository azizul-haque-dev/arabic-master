import { Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, ValidateNested } from 'class-validator';
import { MAX_TURNS_PER_CONVERSATION } from '../conversations.constants.js';
import { TurnInputDto } from './create-conversation.dto.js';

export class ReplaceTurnsDto {
  // An empty array clears all turns for the conversation, which is intentionally permitted
  @IsArray()
  @ArrayMaxSize(MAX_TURNS_PER_CONVERSATION)
  @ValidateNested({ each: true })
  @Type(() => TurnInputDto)
  turns!: TurnInputDto[];
}
