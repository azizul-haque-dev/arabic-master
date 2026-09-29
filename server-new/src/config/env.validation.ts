import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
  validateSync,
} from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

const DURATION_PATTERN = /^\d+(s|m|h|d)$/;

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsNumber()
  @Min(0)
  @Max(65535)
  PORT: number;

  @IsString()
  API_PREFIX: string;

  @IsString()
  DATABASE_URL: string;

  @IsOptional()
  @IsString()
  REDIS_URL?: string;

  @IsOptional()
  @IsString()
  REDIS_HOST?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(65535)
  REDIS_PORT?: number;

  @IsOptional()
  @IsString()
  REDIS_PASSWORD?: string;

  @IsString()
  JWT_ACCESS_SECRET: string;

  @Matches(DURATION_PATTERN)
  JWT_ACCESS_EXPIRES_IN: string;

  @IsString()
  JWT_REFRESH_SECRET: string;

  @Matches(DURATION_PATTERN)
  JWT_REFRESH_EXPIRES_IN: string;

  @IsString()
  TOKEN_HASH_SECRET: string;

  @IsString()
  GOOGLE_API_KEY: string;

  @IsString()
  AI_MODEL_NAME: string;
}

export function validateEnv(
  config: Record<string, unknown>,
): EnvironmentVariables {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    const messages = errors
      .map((error) => Object.values(error.constraints ?? {}).join(', '))
      .join('; ');
    throw new Error(`Environment validation failed: ${messages}`);
  }

  const hasRedisUrl = Boolean(validatedConfig.REDIS_URL);
  const hasRedisHostPort = Boolean(
    validatedConfig.REDIS_HOST && validatedConfig.REDIS_PORT !== undefined,
  );

  if (!hasRedisUrl && !hasRedisHostPort) {
    throw new Error(
      'Environment validation failed: REDIS_URL or REDIS_HOST + REDIS_PORT must be configured.',
    );
  }

  return validatedConfig;
}
