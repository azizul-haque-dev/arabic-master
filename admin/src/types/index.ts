// Shared shapes mirroring the API's response payloads. Kept intentionally
// close to the Prisma models so the admin UI stays a thin layer over them.

export type Status =
  | "DRAFT"
  | "PUBLISHED"
  | "ACTIVE"
  | "DISABLED";

export type AiGenerationStatus =
  | "PENDING"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED";


export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  avatarUrl: string | null;
  provider: "LOCAL" | "GOOGLE";
  createdAt: string;
}

export interface Category {
  id: string;
  nameEn: string;
  nameBn: string;
  createdAt: string;
  updatedAt: string;
}

export interface ArabicTextEntry {
  id: string;
  text: string;
  audioUrl: string | null;
  audioKey: string | null;
  meaningEn: string | null;
  meaningBn: string | null;
  whenToUseEn: string | null;
  whenToUseBn: string | null;
  pronunciationEn: string | null;
  pronunciationBn: string | null;
  feminineEn: string | null;
  feminineBn: string | null;
  errorMessage: string | null;
  status: Status;
  aiStatus: AiGenerationStatus;
  word: { id: string } | null;
  sentence: { id: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface Word {
  id: string;
  arabicId: string;
  arabic: ArabicTextEntry;
  meaningEn: string | null;
  meaningBn: string | null;
  whenToUseEn: string | null;
  whenToUseBn: string | null;
  pronunciationEn: string | null;
  pronunciationBn: string | null;
  status: Status;
  categories: Category[];
  createdAt: string;
  updatedAt: string;
}

export interface SentenceWordRef extends Word {
  position: number;
}
export interface SentenceArabicText {
  id: string;
  text: string;
  audioUrl: string | null;
  audioKey: string | null;
  meaningEn: string | null;
  meaningBn: string | null;
  whenToUseEn: string | null;
  whenToUseBn: string | null;
  pronunciationEn: string | null;
  pronunciationBn: string | null;
  feminineEn: string | null;
  feminineBn: string | null;
  errorMessage: string | null;
  status: Status;
  aiStatus: AiGenerationStatus;
}

export interface Sentence {
  id: string;
  arabicId: string;
  arabic: SentenceArabicText;
  meaningEn: string | null;
  meaningBn: string | null;
  whenToUseEn: string | null;
  whenToUseBn: string | null;
  categories: Category[];
  words: SentenceWordRef[];
  createdAt: string;
  updatedAt: string;
}

// Successful responses always have this shape. Endpoints with no payload omit
// the `data` key; endpoints typed with ApiResponse<T> always return it.
export interface ApiResponse<T> {
  success: true;
  message: string;
  data: T;
}

export interface ApiSuccessResponse {
  success: true;
  message: string;
  data?: unknown;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
}

export type ApiEnvelope<T = unknown> = ApiResponse<T> | ApiErrorResponse;

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedData<T> {
  items: T[];
  meta: PaginationMeta;
}

export interface ApiResponseWithOptionalData<T = unknown> {
  success: true;
  message: string;
  data?: T;
}







