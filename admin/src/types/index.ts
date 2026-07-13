// Shared shapes mirroring the API's response payloads. Kept intentionally
// close to the Prisma models so the admin UI stays a thin layer over them.

export type Status = "DRAFT" | "PUBLISHED" | "ACTIVE" | "DISABLED";

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

export interface ArabicText {
  id: string;
  text: string;
  audioUrl: string | null;
}

export interface Word {
  id: string;
  arabicId: string;
  arabic: ArabicText;
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

export interface Sentence {
  id: string;
  arabicId: string;
  arabic: ArabicText;
  pronunciationEn: string;
  pronunciationBn: string;
  meaningEn: string;
  meaningBn: string;
  whenToUseEn: string | null;
  whenToUseBn: string | null;
  status: Status;
  categories: Category[];
  words: SentenceWordRef[];
  createdAt: string;
  updatedAt: string;
}

// Matches the { success, message, data, meta } envelope every endpoint returns.
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
