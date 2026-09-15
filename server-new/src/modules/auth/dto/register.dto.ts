import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
    @ApiProperty({ example: 'user@example.com' })
    @IsEmail()
    @Transform(({ value }) => String(value).trim().toLowerCase())
    email: string;

    @ApiProperty({ example: 'John' })
    @IsString()
    @MinLength(1)
    @MaxLength(50)
    firstName: string;

    @ApiProperty({ example: 'Doe' })
    @IsString()
    @MinLength(1)
    @MaxLength(50)
    lastName: string;

    @ApiProperty({ example: 'StrongPassword123!' })
    @IsString()
    @MinLength(8)
    @MaxLength(128)
    password: string;
}
