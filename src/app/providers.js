"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { t as translate } from "@/lib/i18n/dictionaries";
import { LANGUAGES } from "@/lib/constants";
import { ToastProvider } from "@/components/ui";

const I18nContext = createContext(null);
const ThemeContext = createContext(null);

function I18nProvider({ children }) {
  const [lang, setLangState] = useState("uz");

  useEffect(() => {
    const stored = window.localStorage.getItem("ecochain_lang");
    if (stored && LANGUAGES.includes(stored)) setLangState(stored);
  }, []);

  function setLang(next) {
    if (!LANGUAGES.includes(next)) return;
    setLangState(next);
    window.localStorage.setItem("ecochain_lang", next);
    document.documentElement.lang = next;
  }

  const value = useMemo(
    () => ({
      lang,
      setLang,
      t: (key, vars) => translate(lang, key, vars),
    }),
    [lang]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState("light");

  useEffect(() => {
    const stored = window.localStorage.getItem("ecochain_theme");
    const initial = stored === "dark" ? "dark" : "light";
    setThemeState(initial);
    document.documentElement.classList.toggle("dark", initial === "dark");
  }, []);

  function setTheme(next) {
    setThemeState(next);
    window.localStorage.setItem("ecochain_theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  }

  function toggleTheme() {
    setTheme(theme === "dark" ? "light" : "dark");
  }

  const value = useMemo(() => ({ theme, setTheme, toggleTheme }), [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

export function Providers({ children }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <I18nProvider>
          <ToastProvider>{children}</ToastProvider>
        </I18nProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
