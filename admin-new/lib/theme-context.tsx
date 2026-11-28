"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";

export type AppTheme = "dark" | "light";

interface AppThemeContextValue {
  theme: AppTheme;
  toggleTheme: () => void;
}

const THEME_STORAGE_KEY = "arabic-master-theme";
const LEGACY_ADMIN_THEME_STORAGE_KEY = "arabic-master-admin-theme";
const THEME_CHANGE_EVENT = "arabic-master-theme-change";

const AppThemeContext = createContext<AppThemeContextValue | null>(null);

function getThemeSnapshot(): AppTheme {
  if (typeof window === "undefined") {
    return "dark";
  }

  const storedTheme =
    window.localStorage.getItem(THEME_STORAGE_KEY) ??
    window.localStorage.getItem(LEGACY_ADMIN_THEME_STORAGE_KEY);

  return storedTheme === "light" ? "light" : "dark";
}

function getServerThemeSnapshot(): AppTheme {
  return "dark";
}

function subscribeToTheme(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(THEME_CHANGE_EVENT, onChange);

  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(THEME_CHANGE_EVENT, onChange);
  };
}

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    getServerThemeSnapshot,
  );

  const toggleTheme = useCallback(() => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
  }, [theme]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

  return (
    <AppThemeContext.Provider value={value}>{children}</AppThemeContext.Provider>
  );
}

export function useAppTheme() {
  const context = useContext(AppThemeContext);

  if (!context) {
    throw new Error("useAppTheme must be used within AppThemeProvider");
  }

  return context;
}
