import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface OnboardingCompletionState {
  hasCompletedOnboarding: boolean;

  markCompleted: () => void;

  reset: () => void;
}

export const useOnboardingCompletionStore = create<OnboardingCompletionState>()(
  persist(
    (set) => ({
      hasCompletedOnboarding: false,

      markCompleted: () => {
        set({
          hasCompletedOnboarding: true,
        });
      },

      reset: () => {
        set({
          hasCompletedOnboarding: false,
        });
      },
    }),
    {
      name: "onboarding-completion",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
