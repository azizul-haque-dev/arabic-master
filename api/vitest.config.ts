import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: false,
    include: ['src/**/*.spec.ts'],
    env: {
      NODE_ENV: 'test',
      DATABASE_URL: 'postgres://postgres:postgres@localhost:5432/test',
      REDIS_URL: 'redis://localhost:6379',
      JWT_ACCESS_SECRET: 'test-jwt-access-secret-minimum-32-chars-long',
      JWT_REFRESH_SECRET: 'test-jwt-refresh-secret-minimum-32-chars-long',
      TOKEN_HASH_SECRET: 'test-token-hash-secret-minimum-32-chars-long',
      GOOGLE_API_KEY: 'test-google-api-key',
      AI_MODEL_NAME: 'gemini-1.5-flash',
      GOOGLE_CLIENT_ID: 'test-google-client-id.apps.googleusercontent.com',
      GOOGLE_CLIENT_SECRET: 'test-google-client-secret',
      GOOGLE_CALLBACK_URL: 'http://localhost:5000/api/v1/auth/google/callback',
      R2_ACCOUNT_ID: 'test-r2-account-id',
      R2_ACCESS_KEY_ID: 'test-r2-access-key-id',
      R2_SECRET_ACCESS_KEY: 'test-r2-secret-access-key-minimum-length',
      R2_BUCKET_NAME: 'test-arabic-audio-bucket',
      R2_ENDPOINT: 'https://test-r2-account-id.r2.cloudflarestorage.com',
      R2_REGION: 'auto',
    },
  },
});

