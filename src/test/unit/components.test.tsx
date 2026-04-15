import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LanguageSwitcher } from '@/components/features/language-switcher';
import { LanguageProvider } from '@/lib/i18n/context';

function renderWithProvider(ui: React.ReactElement) {
  return render(<LanguageProvider>{ui}</LanguageProvider>);
}

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    window.localStorage.clear();
  });

  it('should render the globe icon', () => {
    renderWithProvider(<LanguageSwitcher />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('should show EN label when locale is ar (default)', () => {
    renderWithProvider(<LanguageSwitcher />);
    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('EN');
  });

  it('should toggle locale from ar to en on click', async () => {
    const user = userEvent.setup();
    renderWithProvider(<LanguageSwitcher />);
    const button = screen.getByRole('button');

    // Default is ar, shows EN
    expect(button).toHaveTextContent('EN');

    // Click to switch to en
    await user.click(button);

    // Now shows ع (Arabic) since we're in English mode
    expect(button).toHaveTextContent('ع');
  });

  it('should toggle locale from en to ar on click', async () => {
    // Start with English locale
    window.localStorage.setItem('luxe-store-locale', 'en');
    const user = userEvent.setup();
    renderWithProvider(<LanguageSwitcher />);
    const button = screen.getByRole('button');

    // Shows ع since we're in English
    expect(button).toHaveTextContent('ع');

    // Click to switch to ar
    await user.click(button);

    // Now shows EN since we're in Arabic
    expect(button).toHaveTextContent('EN');
  });

  it('should persist locale to localStorage', async () => {
    const user = userEvent.setup();
    renderWithProvider(<LanguageSwitcher />);
    const button = screen.getByRole('button');

    // Default is ar
    await user.click(button);

    // Should have saved 'en' to localStorage
    expect(window.localStorage.getItem('luxe-store-locale')).toBe('en');
  });

  it('should have correct title for switching to English', () => {
    renderWithProvider(<LanguageSwitcher />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('title', 'Switch to English');
  });

  it('should have correct title for switching to Arabic', async () => {
    window.localStorage.setItem('luxe-store-locale', 'en');
    const user = userEvent.setup();
    renderWithProvider(<LanguageSwitcher />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('title', 'التبديل للعربية');
  });
});
