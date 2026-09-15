import { plainToInstance } from 'class-transformer';
import {
  IsBooleanString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
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

enum SameSite {
  Lax = 'lax',
  Strict = 'strict',
  None = 'none',
}

const DURATION_PATTERN = /^\d+(s|m|h|d)$/;

class EnvironmentVariables {
  // --- App ---
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsNumber()
  @Min(0)
  @Max(65535)
  PORT: number;

  @IsString()
  API_PREFIX: string;

  @IsString()
  API_VERSION: string;

  @IsString()
  CORS_ORIGIN: string;

  @IsString()
  SWAGGER_ENABLED: string;

  @IsString()
  SWAGGER_PATH: string;

  @IsOptional()
  @IsString()
  LOG_LEVEL?: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  FRONTEND_URL?: string;

  // --- Database / Redis ---
  @IsString()
  DATABASE_URL: string;

  @IsString()
  REDIS_URL: string;

  // --- JWT ---
  @IsString()
  JWT_ACCESS_SECRET: string;

  @Matches(DURATION_PATTERN, { message: 'JWT_ACCESS_EXPIRES_IN must look like 15m, 1h, 30d' })
  JWT_ACCESS_EXPIRES_IN: string;

  @IsString()
  JWT_REFRESH_SECRET: string;

  @Matches(DURATION_PATTERN, { message: 'JWT_REFRESH_EXPIRES_IN must look like 15m, 1h, 30d' })
  JWT_REFRESH_EXPIRES_IN: string;

  @IsString()
  TOKEN_HASH_SECRET: string;

  @Matches(DURATION_PATTERN)
  PASSWORD_RESET_EXPIRES_IN: string;

  // --- Google OAuth ---
  @IsString()
  GOOGLE_CLIENT_ID: string;

  @IsString()
  GOOGLE_CLIENT_SECRET: string;

  @IsUrl({ require_tld: false })
  GOOGLE_CALLBACK_URL: string;

  // --- Auth cookie ---
  @IsString()
  AUTH_COOKIE_NAME: string;

  @IsBooleanString()
  AUTH_COOKIE_SECURE: string;

  @IsBooleanString()
  AUTH_COOKIE_HTTP_ONLY: string;

  @IsEnum(SameSite)
  AUTH_COOKIE_SAME_SITE: SameSite;
}

export function validateEnv(config: Record<string, unknown>): EnvironmentVariables {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, { skipMissingProperties: false });

  if (errors.length > 0) {
    const messages = errors
      .map((error) => Object.values(error.constraints ?? {}).join(', '))
      .join('; ');

    throw new Error(`Environment validation failed: ${messages}`);
  }

  return validatedConfig;
}