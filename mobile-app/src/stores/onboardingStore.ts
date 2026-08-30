import { create } from "zustand";

export type LevelCode = "beginner" | "some" | "intermediate";

export type SituationCode =
  "shopping" | "restaurant" | "work" | "transportation" | "daily-life";

interface OnboardingState {
  level: LevelCode | null;
  situations: SituationCode[];

  setLevel: (level: LevelCode) => void;

  toggleSituation: (situation: SituationCode) => void;

  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  level: null,

  situations: [],

  setLevel: (level) => {
    set({ level });
  },

  toggleSituation: (situation) => {
    const current = get().situations;

    const next = current.includes(situation)
      ? current.filter((item) => item !== situation)
      : [...current, situation];

    set({
      situations: next,
    });
  },

  reset: () => {
    set({
      level: null,
      situations: [],
    });
  },
}));
