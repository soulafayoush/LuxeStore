'use client';

import { useEffect, useState } from 'react';

interface AnnounceOptions {
  message: string;
  assertive?: boolean;
  timeout?: number;
}

/**
 * Hook to announce messages to screen readers
 */
export function useAnnouncer() {
  const [announcement, setAnnouncement] = useState('');

  const announce = (message: string, assertive = false) => {
    setAnnouncement('');
    // Small delay to allow screen readers to detect the change
    requestAnimationFrame(() => {
      setAnnouncement(message);
    });
  };

  useEffect(() => {
    if (announcement) {
      const timer = setTimeout(() => setAnnouncement(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [announcement]);

  return { announce, announcement };
}

/**
 * Live region component for screen reader announcements
 */
export function LiveRegion({ message, assertive = false }: { message: string; assertive?: boolean }) {
  if (!message) return null;

  return (
    <div
      className="absolute w-px h-px overflow-hidden whitespace-nowrap border-0 p-0"
      role="status"
      aria-live={assertive ? 'assertive' : 'polite'}
      aria-atomic="true"
    >
      {message}
    </div>
  );
}
