import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { ALLOWED_CATEGORIES } from '../../../common/constants/category.constant.js';
import { DifficultyLevel } from '../../../generated/prisma/enums.js';

class SentenceWordLinkDto {
  @IsString() @MinLength(1) wordId!: string;
  @IsInt() @Min(0) position!: number;
}

export class CreateSentenceDto {
  @IsString()
  @MinLength(1, { message: 'Arabic text is required' })
  text!: string;
  @IsOptional() @IsUrl() audioUrl?: string;

  @IsString() @MinLength(1) meaningEn!: string;
  @IsString() @MinLength(1) meaningBn!: string;
  @IsString() @MinLength(1) whenToUseEn!: string;
  @IsString() @MinLength(1) whenToUseBn!: string;
  @IsString() @MinLength(1) pronunciationEn!: string;
  @IsString() @MinLength(1) pronunciationBn!: string;
  @IsString() @MinLength(1) feminineEn!: string;
  @IsString() @MinLength(1) feminineBn!: string;

  @IsIn(ALLOWED_CATEGORIES, {
    message: `category must be one of: ${ALLOWED_CATEGORIES.join(', ')}`,
  })
  category!: string;

  @IsOptional() @IsEnum(DifficultyLevel) difficulty?: DifficultyLevel;
  @IsOptional() @IsString() relatedWordId?: string;
  @IsOptional() @IsString() noteEn?: string;
  @IsOptional() @IsString() noteBn?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SentenceWordLinkDto)
  words?: SentenceWordLinkDto[];
}
