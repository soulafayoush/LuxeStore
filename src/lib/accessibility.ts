/**
 * Accessibility utilities for LUXE Store
 * Helps ensure WCAG 2.1 AA compliance
 */

/**
 * Generate accessible props for interactive elements
 */
export function getInteractiveProps(options: {
  label: string;
  role?: string;
  disabled?: boolean;
  expanded?: boolean;
  controls?: string;
  describedBy?: string;
}) {
  return {
    'aria-label': options.label,
    ...(options.role && { role: options.role }),
    ...(options.disabled && { 'aria-disabled': true, tabIndex: options.disabled ? -1 : 0 }),
    ...(options.expanded !== undefined && { 'aria-expanded': options.expanded }),
    ...(options.controls && { 'aria-controls': options.controls }),
    ...(options.describedBy && { 'aria-describedby': options.describedBy }),
  };
}

/**
 * Generate live region props for dynamic content
 */
export function getLiveRegionProps(options: {
  polite?: 'polite' | 'assertive' | 'off';
  atomic?: boolean;
  relevant?: 'additions' | 'removals' | 'text' | 'all';
}) {
  return {
    'aria-live': options.polite ?? 'polite',
    ...(options.atomic !== undefined && { 'aria-atomic': options.atomic }),
    ...(options.relevant && { 'aria-relevant': options.relevant }),
  };
}

/**
 * Screen reader only text class (utility)
 * Usage: <span className={srOnly}>Description for screen readers</span>
 */
export const srOnly = 'absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0';
export const srOnlyStyle: React.CSSProperties = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  borderWidth: 0,
};

/**
 * Keyboard navigation helpers
 */
export const keyboard = {
  isEnter: (e: React.KeyboardEvent) => e.key === 'Enter',
  isSpace: (e: React.KeyboardEvent) => e.key === ' ',
  isEscape: (e: React.KeyboardEvent) => e.key === 'Escape',
  isTab: (e: React.KeyboardEvent) => e.key === 'Tab',
  isArrowDown: (e: React.KeyboardEvent) => e.key === 'ArrowDown',
  isArrowUp: (e: React.KeyboardEvent) => e.key === 'ArrowUp',
  isEnterOrSpace: (e: React.KeyboardEvent) => e.key === 'Enter' || e.key === ' ',
  isActivationKey: (e: React.KeyboardEvent) => ['Enter', ' '].includes(e.key),
};

/**
 * Focus trap utility for modals/dialogs
 */
export function getFocusTrapProps(containerId: string) {
  return {
    role: 'dialog' as const,
    'aria-modal': true as const,
    'aria-labelledby': `${containerId}-title`,
    'aria-describedby': `${containerId}-desc`,
  };
}

/**
 * Skip to content link ID
 */
export const SKIP_TO_CONTENT_ID = 'skip-to-content';
