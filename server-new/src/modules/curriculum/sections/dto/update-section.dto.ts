import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateSectionDto } from './create-section.dto.js';

// Sections cannot be moved across courses, so courseId is omitted
export class UpdateSectionDto extends PartialType(
  OmitType(CreateSectionDto, ['courseId'] as const),
) {}
