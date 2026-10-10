import { IsIn, IsString, MinLength } from 'class-validator';
import { LessonContentType } from '../../../../database/drizzle/enums.js';

export class AddLessonItemDto {
  @IsIn(Object.values(LessonContentType))
  contentType!: LessonContentType;

  // ID of the target Word, Sentence, or Conversation entity
  @IsString()
  @MinLength(1)
  contentId!: string;
}
