import { apiClient } from "@/lib/apiClient";

import type { LanguageCode } from "@/stores/languageStore";
import type { LevelCode, SituationCode } from "@/stores/onboardingStore";

export interface OnboardingPayload {
  language: LanguageCode;

  level: LevelCode;

  situations: SituationCode[];
}

export const onboardingService = {
  complete: async (payload: OnboardingPayload): Promise<void> => {
    await apiClient.post("/onboarding/complete", payload);
  },
};
