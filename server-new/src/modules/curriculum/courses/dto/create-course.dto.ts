import { Transform } from 'class-transformer';
import { IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { CourseType, DifficultyLevel } from '../../../../database/drizzle/enums.js';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class CreateCourseDto {
  @Transform(trim)
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string;

  @Transform(trim)
  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  description!: string;

  @IsOptional()
  @IsIn(Object.values(DifficultyLevel))
  level?: DifficultyLevel;

  @IsOptional()
  @IsIn(Object.values(CourseType))
  courseType?: CourseType;
}
