import { create } from "zustand";

export type LearningLanguage = "bn" | "en";
export type PracticeDuration = "5" | "10" | "15" | "20+";

type OnboardingState = {
  language: LearningLanguage | null;
  country: string | null;
  goals: string[];
  practiceDuration: PracticeDuration | null;
  setLanguage: (language: LearningLanguage) => void;
  setCountry: (country: string) => void;
  toggleGoal: (goal: string) => void;
  setPracticeDuration: (duration: PracticeDuration) => void;
  reset: () => void;
};

const initialAnswers = {
  language: null,
  country: null,
  goals: [],
  practiceDuration: null,
} satisfies Pick<
  OnboardingState,
  "language" | "country" | "goals" | "practiceDuration"
>;

export const useOnboardingStore = create<OnboardingState>((set) => ({
  ...initialAnswers,
  setLanguage: (language) => set({ language }),
  setCountry: (country) => set({ country }),
  toggleGoal: (goal) =>
    set((state) => ({
      goals: state.goals.includes(goal)
        ? state.goals.filter((item) => item !== goal)
        : [...state.goals, goal],
    })),
  setPracticeDuration: (practiceDuration) => set({ practiceDuration }),
  reset: () => set(initialAnswers),
}));
