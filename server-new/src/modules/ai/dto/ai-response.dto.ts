import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { WordType } from '../../../generated/prisma/enums.js';

// The AI is an OUTSIDE source, exactly like a user submitting a form —
// we never trust its answer blindly. This class describes exactly what
// shape we require, and we validate every AI response against it before
// saving anything to the database.
export class AiWordResponseDto {
  @IsString() @MinLength(1) meaningEn!: string;
  @IsString() @MinLength(1) meaningBn!: string;
  @IsString() @MinLength(1) whenToUseEn!: string;
  @IsString() @MinLength(1) whenToUseBn!: string;
  @IsString() @MinLength(1) pronunciationEn!: string;
  @IsString() @MinLength(1) pronunciationBn!: string;
  @IsString() @MinLength(1) feminineEn!: string;
  @IsString() @MinLength(1) feminineBn!: string;
  @IsString() category!: string; // checked against our own allowed list separately, see §5
  @IsOptional() @IsEnum(WordType) wordType?: WordType;
}
