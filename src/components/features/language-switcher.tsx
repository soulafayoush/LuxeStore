'use client';

import { useLanguage } from '@/lib/i18n';
import { Globe } from 'lucide-react';

export function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();

  const toggle = () => {
    setLocale(locale === 'ar' ? 'en' : 'ar');
  };

  return (
    <button
      onClick={toggle}
      className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      title={locale === 'ar' ? 'Switch to English' : 'التبديل للعربية'}
    >
      <Globe className="h-5 w-5" />
      <span className="absolute -bottom-0.5 -right-0.5 text-[8px] font-bold text-primary">
        {locale === 'ar' ? 'EN' : 'ع'}
      </span>
    </button>
  );
}
