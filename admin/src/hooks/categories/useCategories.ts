import {
  createCategory,
  deleteCategory,
  fetchCategories,
  updateCategory,
} from "@/features/categories/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import z from "zod";

interface UseDeleteCategoryOptions {
  onSuccess?: () => void;
}
interface UseSaveCategoryOptions {
  categoryId?: string;
  isEditing: boolean;
  onSuccessCallback?: () => void;
}
export const categorySchema = z.object({
  nameEn: z.string().trim().min(1, "English name is required").max(120),
  nameBn: z.string().trim().min(1, "Bangla name is required").max(120),
});

export type CategoryValues = z.infer<typeof categorySchema>;

export function useGetCategoris() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 15,
    gcTime: 1000 * 60 * 60,
  });
}

export function useDeleteCategory(options?: UseDeleteCategoryOptions) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category deleted");
      if (options?.onSuccess) {
        options.onSuccess();
      }
    },
    onError: () => toast.error("Could not delete this category"),
  });
}

export function useSaveCategory({
  categoryId,
  isEditing,
  onSuccessCallback,
}: UseSaveCategoryOptions) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: CategoryValues) =>
      isEditing && categoryId
        ? updateCategory(categoryId, values)
        : createCategory(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success(isEditing ? "Category updated" : "Category created");
      if (onSuccessCallback) {
        onSuccessCallback();
      }
    },
    onError: (err) => {
      const message =
        err instanceof AxiosError
          ? (err.response?.data?.message ?? "Something went wrong")
          : "Something went wrong";
      toast.error(message);
    },
  });
}
