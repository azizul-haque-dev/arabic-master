import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type LanguageCode = "bn" | "en";

interface LanguageState {
  language: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      // Default language
      language: "bn",

      setLanguage: (language) => {
        set({ language });
      },
    }),
    {
      name: "app-language",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
