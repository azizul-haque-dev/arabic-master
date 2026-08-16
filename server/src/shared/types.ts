/**
 * Shared Type Definitions
 * Common types used across multiple modules
 */

// === Pagination ===
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

// === API Response ===
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
}

// === User ===
export interface UserPayload {
  id: string;
  email: string;
  name: string;
}

// === Content Status ===
export type ContentStatus = "DRAFT" | "PUBLISHED" | "ACTIVE" | "DISABLED";

export type WordStatus = "DRAFT" | "PUBLISHED" | "ACTIVE" | "DISABLED";

export type SentenceStatus =
  | "DRAFT"
  | "PENDING"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED"
  | "PUBLISHED"
  | "ACTIVE"
  | "DISABLED";

// === File Upload ===
export interface UploadMetadata {
  key: string;
  url: string;
  mimeType: string;
  size: number;
  uploadedAt: Date;
}

// === Cache ===
export interface CacheEntry<T> {
  key: string;
  value: T;
  ttl: number;
  createdAt: Date;
  expiresAt: Date;
}
