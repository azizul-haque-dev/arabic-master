import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { PAGINATION } from '../../../../config/constants.js';
import {
  ContentStatus,
  CourseType,
  DifficultyLevel,
} from '../../../../database/drizzle/enums.js';

export class ListCourseQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = PAGINATION.DEFAULT_PAGE;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(PAGINATION.MAX_LIMIT)
  limit: number = PAGINATION.DEFAULT_LIMIT;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @IsOptional()
  @IsIn(Object.values(ContentStatus))
  status?: ContentStatus;

  @IsOptional()
  @IsIn(Object.values(DifficultyLevel))
  level?: DifficultyLevel;

  @IsOptional()
  @IsIn(Object.values(CourseType))
  courseType?: CourseType;
}
