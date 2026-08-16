/**
 * Media Module Types
 * Request/Response DTOs and related type definitions
 */

// Response Types
export interface MediaUploadResponse {
  message: string;
  url: string;
  key: string;
}

export interface AudioUploadMetadata {
  originalName: string;
  mimeType: string;
  size: number;
  uploadedAt: Date;
}
