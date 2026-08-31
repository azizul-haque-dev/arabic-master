import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";

import { onboardingService } from "@/services/onboardingService";

import { useOnboardingCompletionStore } from "@/stores/onboardingCompletionStore";

import type { OnboardingPayload } from "@/services/onboardingService";

export function useCompleteOnboarding() {
  const markCompleted = useOnboardingCompletionStore(
    (state) => state.markCompleted,
  );

  return useMutation({
    mutationFn: (payload: OnboardingPayload) =>
      onboardingService.complete(payload),

    meta: {
      suppressGlobalError: true,
    },

    onSuccess: () => {
      // Backend successfully accepted onboarding
      markCompleted();

      // Leave onboarding flow
      router.replace("/");
    },
  });
}
