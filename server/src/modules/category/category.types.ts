/**
 * Category Module Types
 * Request/Response DTOs and related type definitions
 */

import { z } from "zod";
import { createCategorySchema, updateCategorySchema } from "./category.validation.js";

// Request Input Types
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;

// Response Types
export interface CategoryResponse {
  id: string;
  nameEn: string;
  nameBn: string;
  wordCount?: number;
  sentenceCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateCategoryResponse {
  category: CategoryResponse;
  message: string;
}

export interface UpdateCategoryResponse {
  category: CategoryResponse;
  message: string;
}

export interface DeleteCategoryResponse {
  message: string;
}

export interface ListCategoriesResponse {
  categories: CategoryResponse[];
  total: number;
}
