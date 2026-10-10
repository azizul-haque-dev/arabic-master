import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { ContentStatus } from '../../../database/drizzle/enums.js';

export class UpdateStatusDto {
  @IsIn(Object.values(ContentStatus))
  status!: ContentStatus;

  // Rejection reason is enforced as required in the service when status is set to REJECTED
  @IsOptional()
  @IsString()
  @MaxLength(500)
  rejectionReason?: string;
}
