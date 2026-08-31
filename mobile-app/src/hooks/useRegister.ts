import type { SignupFormValues } from "@/schemas/authSchema";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/stores/authStore";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";

export function useRegister() {
  const setSession = useAuthStore((state) => state.setSession);

  return useMutation({
    mutationFn: (payload: SignupFormValues) => authService.register(payload),
    meta: { suppressGlobalError: true }, // screen নিজেই inline error দেখাবে
    onSuccess: (data) => {
      setSession({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        user: data.user,
      });
      router.replace("/");
    },
  });
}
