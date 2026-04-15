'use client';

import { SKIP_TO_CONTENT_ID } from '@/lib/accessibility';

export function SkipToContent() {
  return (
    <a
      href={`#${SKIP_TO_CONTENT_ID}`}
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
    >
      Skip to main content
    </a>
  );
}
