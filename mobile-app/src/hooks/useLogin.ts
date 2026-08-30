import type { LoginFormValues } from "@/schemas/authSchema";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/stores/authStore";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";

export function useLogin() {
  const setSession = useAuthStore((state) => state.setSession);

  return useMutation({
    mutationFn: (payload: LoginFormValues) => authService.login(payload),
    onSuccess: (data) => {
      setSession({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        user: data.user,
      });
      router.replace("/(tabs)/home");
    },
  });
}
