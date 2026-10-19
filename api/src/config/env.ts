import 'dotenv/config';
import { z } from 'zod';

const duration = z.string().regex(/^\d+(s|m|h|d)$/);

const EnvSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().int().min(0).max(65535).default(5000),
  API_PREFIX: z.string().default('api'),
  LOG_LEVEL: z.string().default('debug'),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),

  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),

  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES_IN: duration.default('15m'),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_REFRESH_EXPIRES_IN: duration.default('30d'),
  TOKEN_HASH_SECRET: z.string().min(32),
  PASSWORD_RESET_EXPIRES_IN: duration.default('15m'),

  GOOGLE_API_KEY: z.string().min(1),
  AI_MODEL_NAME: z.string().min(1),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  GOOGLE_CALLBACK_URL: z.string().min(1),
  GOOGLE_ANDROID_CLIENT_ID: z.string().optional(),

  AUTH_COOKIE_NAME: z.string().default('refresh_token'),
  AUTH_COOKIE_SECURE: z.stringbool().default(true),
  AUTH_COOKIE_HTTP_ONLY: z.stringbool().default(true),
  AUTH_COOKIE_SAME_SITE: z.enum(['lax', 'strict', 'none']).default('lax'),
  FRONTEND_URL: z.url().optional(),

  // Cloudflare R2 Object Storage
  R2_ACCOUNT_ID: z.string().optional(),
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  R2_BUCKET_NAME: z.string().optional(),
  R2_ENDPOINT: z.string().optional(),
  R2_REGION: z.string().default('auto'),
  R2_PUBLIC_BASE_URL: z.string().url().optional(),
  R2_KEY_PREFIX: z.string().default('arabic-entities/audio/'),
  R2_MAX_AUDIO_SIZE_BYTES: z.coerce
    .number()
    .int()
    .positive()
    .default(10 * 1024 * 1024),
  R2_PRESIGNED_EXPIRES_IN: z.coerce.number().int().positive().default(3600),
}).superRefine((data, ctx) => {
  if (data.NODE_ENV === 'production') {
    if (!data.R2_ACCESS_KEY_ID) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'R2_ACCESS_KEY_ID is required in production',
        path: ['R2_ACCESS_KEY_ID'],
      });
    }
    if (!data.R2_SECRET_ACCESS_KEY) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'R2_SECRET_ACCESS_KEY is required in production',
        path: ['R2_SECRET_ACCESS_KEY'],
      });
    }
    if (!data.R2_BUCKET_NAME) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'R2_BUCKET_NAME is required in production',
        path: ['R2_BUCKET_NAME'],
      });
    }
    if (!data.R2_ENDPOINT && !data.R2_ACCOUNT_ID) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Either R2_ENDPOINT or R2_ACCOUNT_ID is required in production',
        path: ['R2_ENDPOINT'],
      });
    }
  }
});

const parsed = EnvSchema.safeParse(process.env);
if (!parsed.success) {
  console.error(
    `Environment validation failed:\n${z.prettifyError(parsed.error)}`,
  );
  process.exit(1);
}

export const env = parsed.data;
export const corsOrigins = env.CORS_ORIGIN.split(',').map((o) => o.trim());
export const isProd = env.NODE_ENV === 'production';
