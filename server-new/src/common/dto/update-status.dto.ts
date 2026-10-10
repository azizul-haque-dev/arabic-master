import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { ContentStatus } from '../../database/drizzle/enums.js';

export class UpdateStatusDto {
  @IsIn(Object.values(ContentStatus))
  status!: ContentStatus;

  // Rejection reason is mandatory when status is REJECTED
  @IsOptional()
  @IsString()
  @MaxLength(500)
  rejectionReason?: string;
}
