"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type ConsoleAppearance = "light" | "dark";

const STORAGE_KEY = "intentspec-console-theme";

type Ctx = {
  theme: ConsoleAppearance;
  setTheme: (t: ConsoleAppearance) => void;
  toggleTheme: () => void;
  isDark: boolean;
};

const ConsoleThemeContext = createContext<Ctx | null>(null);

export function ConsoleThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setThemeState] = useState<ConsoleAppearance>("light");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw === "dark" || raw === "light") setThemeState(raw);
    } catch {
      // ignore
    }
    setReady(true);
  }, []);

  const setTheme = useCallback((t: ConsoleAppearance) => {
    setThemeState(t);
    try {
      localStorage.setItem(STORAGE_KEY, t);
    } catch {
      // ignore
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme,
      isDark: theme === "dark",
    }),
    [theme, setTheme, toggleTheme],
  );

  // Avoid flash: render light until hydrated preference loads
  if (!ready) {
    return (
      <ConsoleThemeContext.Provider
        value={{
          theme: "light",
          setTheme,
          toggleTheme,
          isDark: false,
        }}
      >
        {children}
      </ConsoleThemeContext.Provider>
    );
  }

  return (
    <ConsoleThemeContext.Provider value={value}>
      {children}
    </ConsoleThemeContext.Provider>
  );
}

export function useConsoleTheme() {
  const ctx = useContext(ConsoleThemeContext);
  if (!ctx) {
    return {
      theme: "light" as const,
      setTheme: () => {},
      toggleTheme: () => {},
      isDark: false,
    };
  }
  return ctx;
}
