import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
    @ApiProperty({ example: 'user@example.com' })
    @IsEmail()
    @Transform(({ value }) => String(value).trim().toLowerCase())
    email: string;

    @ApiProperty({ example: 'John Doe' })
    @IsString()
    @MinLength(2)
    @MaxLength(50)
    fullName: string;

    @ApiProperty({ example: 'StrongPassword123!' })
    @IsString()
    @MinLength(8)
    @MaxLength(128)
    password: string;
}
