import { api } from "@/lib/axios";
import type { ApiResponse, Category } from "@/types";

export async function fetchCategories(): Promise<Category[]> {
  const { data } = await api.get<ApiResponse<Category[]>>("/categories");
  return data.data;
}

export interface CategoryInput {
  nameEn: string;
  nameBn: string;
}

export async function createCategory(input: CategoryInput): Promise<Category> {
  const { data } = await api.post<ApiResponse<Category>>("/categories", input);
  return data.data;
}

export async function updateCategory(id: string, input: Partial<CategoryInput>): Promise<Category> {
  const { data } = await api.patch<ApiResponse<Category>>(`/categories/${id}`, input);
  return data.data;
}

export async function deleteCategory(id: string): Promise<void> {
  await api.delete(`/categories/${id}`);
}
