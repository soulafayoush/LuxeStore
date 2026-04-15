'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import type { Locale } from './config';
import { LOCALE_NAMES, LOCALE_DIRS, DEFAULT_LOCALE } from './config';
import ar from './ar';
import en from './en';

const translations = { ar, en } as const;

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
  dir: 'ltr' | 'rtl';
  isRTL: boolean;
  localeName: string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);
const STORAGE_KEY = 'luxe-store-locale';

function getInitialLocale(): Locale {
  if (typeof window === 'undefined') return DEFAULT_LOCALE;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'ar' || saved === 'en') return saved;
  } catch {
    // Ignore localStorage errors
  }
  return DEFAULT_LOCALE;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale);
  const isHydrated = useRef(false);

  // Mark hydration complete
  useEffect(() => {
    isHydrated.current = true;
  }, []);

  // Apply dir and lang to document on mount and locale change
  useEffect(() => {
    const dir = LOCALE_DIRS[locale];
    document.documentElement.dir = dir;
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem(STORAGE_KEY, newLocale);
    } catch {
      // Ignore
    }
  }, []);

  const t = useCallback(
    (key: string): string => {
      const dict = translations[locale];
      const val = (dict as Record<string, string>)[key];
      if (val !== undefined) return val;
      // Fallback: try the other locale
      const other = locale === 'ar' ? translations.en : translations.ar;
      const fallback = (other as Record<string, string>)[key];
      if (fallback !== undefined) return fallback;
      return key;
    },
    [locale],
  );

  const dir = LOCALE_DIRS[locale];
  const isRTL = dir === 'rtl';
  const localeName = LOCALE_NAMES[locale];

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t, dir, isRTL, localeName }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
