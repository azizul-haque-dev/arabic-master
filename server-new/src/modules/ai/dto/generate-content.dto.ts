import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

// Use Nest's native validation pipeline instead of manually parsing
// with Zod inside the service — that's what NestJS DTOs + ValidationPipe are for.
export class GenerateContentDto {
    @IsString()
    @IsNotEmpty({ message: 'Query is required' })
    @MaxLength(500, { message: 'Query is too long' })
    query: string;
}