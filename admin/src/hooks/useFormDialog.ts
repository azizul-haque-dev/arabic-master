import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

interface UseFormDialogOptions<TValues, TData> {
  queryKey: string[];
  createFn: (values: TValues) => Promise<TData>;
  updateFn: (id: string, values: TValues) => Promise<TData>;
  entityId?: string;
  onSuccess?: () => void;
  successMessage?: {
    create: string;
    update: string;
  };
}

export function useFormDialog<TValues, TData>({
  queryKey,
  createFn,
  updateFn,
  entityId,
  onSuccess,
  successMessage = {
    create: "Created successfully",
    update: "Updated successfully",
  },
}: UseFormDialogOptions<TValues, TData>) {
  const queryClient = useQueryClient();
  const isEditing = Boolean(entityId);

  const mutation = useMutation({
    mutationFn: (values: TValues) => {
      return isEditing ? updateFn(entityId!, values) : createFn(values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success(isEditing ? successMessage.update : successMessage.create);
      onSuccess?.();
    },
    onError: (err) => {
      const message =
        err instanceof AxiosError
          ? (err.response?.data?.message ?? "Something went wrong")
          : "Something went wrong";
      toast.error(message);
    },
  });

  return {
    mutation,
    isEditing,
  };
}
