import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { ALLOWED_CATEGORIES } from '../../../common/constants/category.constant.js';
import { PAGINATION } from '../../../config/constants.js';
import { ContentStatus } from '../../../generated/prisma/enums.js';

export class ListWordQueryDto {
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

  @IsOptional() @IsIn(ALLOWED_CATEGORIES) category?: string;
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsIn(Object.values(ContentStatus)) status?: ContentStatus;
}
