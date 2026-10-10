import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { ALLOWED_CATEGORIES } from '../../../common/constants/category.constant.js';
import { MAX_TURNS_PER_CONVERSATION } from '../conversations.constants.js';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class TurnInputDto {
  @Transform(trim)
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  speaker!: string;

  @IsString()
  @MinLength(1)
  sentenceId!: string;
}

export class CreateConversationDto {
  @Transform(trim)
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string;

  @Transform(trim)
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  topic!: string;

  @IsIn(ALLOWED_CATEGORIES, {
    message: `category must be one of: ${ALLOWED_CATEGORIES.join(', ')}`,
  })
  category!: string;

  // Optional initially because the CMS creates metadata first and adds dialogue turns later
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(MAX_TURNS_PER_CONVERSATION)
  @ValidateNested({ each: true })
  @Type(() => TurnInputDto)
  turns?: TurnInputDto[];
}