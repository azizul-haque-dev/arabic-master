export interface EntityAudio {
  id: string;
  entityId: string;
  entityKey: string;
  variant: string;
  speaker: string | null;
  mimeType: string;
  fileSizeBytes: number;
  objectKey: string;
  playbackUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface AudioApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string | string[];
  statusCode?: number;
}

export interface AudioUploadOptions {
  file: File;
  variant?: string;
  speaker?: string;
  onProgress?: (progressPercent: number) => void;
  signal?: AbortSignal;
}

export class AudioApiError extends Error {
  statusCode: number;
  isAborted: boolean;

  constructor(statusCode: number, message: string, isAborted = false) {
    super(message);
    this.name = "AudioApiError";
    this.statusCode = statusCode;
    this.isAborted = isAborted;
  }
}
