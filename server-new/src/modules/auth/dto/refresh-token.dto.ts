import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class RefreshTokenDto {
    @ApiPropertyOptional({
        description: 'Only required for clients that cannot use cookies (e.g. the mobile app).',
    })
    @IsOptional()
    @IsString()
    refreshToken?: string;
}