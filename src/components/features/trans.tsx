'use client';

import { useLanguage } from '@/lib/i18n';

/**
 * Translation component for use in Server Components.
 * Renders translated text inline without a wrapper element.
 *
 * Usage: <T k="hero.title1" />
 *        <T k="common.sar" className="text-xs" />
 */
export function T({ k, className }: { k: string; className?: string }) {
  const { t } = useLanguage();
  if (className) return <span className={className}>{t(k)}</span>;
  return <>{t(k)}</>;
}
