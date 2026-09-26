import {
  IsEnum,
  IsIn,
  IsOptional,
  IsString,
  IsUrl,
  MinLength,
} from 'class-validator';
import { ALLOWED_CATEGORIES } from '../../../common/constant/category.constant.js';
import { WordType } from '../../../generated/prisma/enums.js';

// This is a FORM with boxes. Any field not listed here gets silently
// stripped out by the global ValidationPipe (see main.ts) — this is what
// stops someone from sneaking in fields like `role: "ADMIN"` in a request body.
export class CreateWordDto {
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

  @IsOptional() @IsEnum(WordType) wordType?: WordType;
  @IsOptional() @IsString() noteEn?: string;
  @IsOptional() @IsString() noteBn?: string;
}
