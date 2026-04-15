export type Locale = 'en' | 'ar';

export const LOCALE_NAMES: Record<Locale, string> = {
  en: 'English',
  ar: 'العربية',
};

export const LOCALE_DIRS: Record<Locale, 'ltr' | 'rtl'> = {
  en: 'ltr',
  ar: 'rtl',
};

export const DEFAULT_LOCALE: Locale = 'ar';
export const LOCALES: Locale[] = ['en', 'ar'];

export type TranslationKeys = keyof typeof import('./ar').default;
