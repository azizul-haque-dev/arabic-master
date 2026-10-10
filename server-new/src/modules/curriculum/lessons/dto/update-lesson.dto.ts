import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateLessonDto } from './create-lesson.dto.js';

// Lessons cannot be moved across sections, so sectionId is omitted
export class UpdateLessonDto extends PartialType(
  OmitType(CreateLessonDto, ['sectionId'] as const),
) {}
