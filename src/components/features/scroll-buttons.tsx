'use client';

import React from 'react';

export function ScrollButton({
  targetId,
  children,
  className,
}: {
  targetId: string;
  children: React.ReactNode;
  className?: string;
}) {
  const handleClick = () => {
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div onClick={handleClick} className={className} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick(); }}>
      {children}
    </div>
  );
}

export function ScrollTopButton({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className={className}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') window.scrollTo({ top: 0, behavior: 'smooth' }); }}
    >
      {children}
    </div>
  );
}