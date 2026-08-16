/**
 * Shared Application Constants
 * Magic numbers, timeouts, limits, TTLs, and other configuration values
 */

// === Token Expiry ===
export const TOKEN_EXPIRY = {
  ACCESS_TOKEN: "15m" as const, // Short-lived JWT in memory
  REFRESH_TOKEN: "7d" as const, // Long-lived opaque token in DB
  EMAIL_VERIFICATION: "24h" as const, // Email verification token
  PASSWORD_RESET: "1h" as const, // Password reset token
  VERIFY_EMAIL: "1d" as const, // Email verification token (alternative format)
} as const;

// === Token Expiry (in milliseconds) ===
export const TOKEN_EXPIRY_MS = {
  ACCESS_TOKEN: 15 * 60 * 1000,          // 15m
  REFRESH_TOKEN: 7 * 24 * 60 * 60 * 1000, // 7d
} as const;

// === Cache TTLs (in seconds) ===
export const CACHE_TTL = {
  CATEGORIES: 3600, // 1 hour
  WORDS: 1800, // 30 minutes
  SENTENCES: 1800, // 30 minutes
  USER_PROFILE: 300, // 5 minutes
} as const;

// === Rate Limiting ===
export const RATE_LIMITS = {
  AUTH_LIMITER: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // 20 requests
  },
  GENERAL_LIMITER: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 300, // 300 requests
  },
  UPLOAD_LIMITER: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 50, // 50 uploads
  },
} as const;

// === File Upload ===
export const UPLOAD_LIMITS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10 MB
  ALLOWED_AUDIO_TYPES: ["audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg", "audio/webm"],
} as const;

// === Validation Constraints ===
export const VALIDATION = {
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 120,
  },
  EMAIL: {
    MAX_LENGTH: 255,
  },
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 72, // Practical limit for argon2/bcrypt
  },
  ARABIC_TEXT: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 500,
  },
  CATEGORY_NAME: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 120,
  },
} as const;

// === Pagination ===
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

// === AI Processing ===
export const AI_PROCESSING = {
  QUEUE_RETRY_ATTEMPTS: 3,
  QUEUE_RETRY_DELAY_MS: 5000,
  QUEUE_TIMEOUT_MS: 60000, // 1 minute
  BATCH_SIZE: 10,
  QUEUE_JOB_CLEANUP_COMPLETE_S: 3600, // 1 hour
  QUEUE_JOB_CLEANUP_FAIL_S: 86400, // 24 hours
} as const;

// === HTTP ===
export const HTTP = {
  REQUEST_TIMEOUT_MS: 30000, // 30 seconds
  MAX_REQUEST_SIZE: "1mb" as const,
} as const;

// === Auth Config ===
export const AUTH = {
  TOKEN_BYTES: 32,
} as const;

// === S3 Storage ===
export const S3 = {
  CACHE_MAX_AGE_S: 31536000, // 1 year
} as const;
