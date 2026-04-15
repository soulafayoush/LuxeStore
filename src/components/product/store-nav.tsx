'use client';

import React, { useState, useEffect, useCallback, useSyncExternalStore } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/components/features/cart-context';
import { useWishlist } from '@/components/features/wishlist-context';
import { useTheme } from 'next-themes';
import { useLanguage } from '@/lib/i18n';
import { LanguageSwitcher } from '@/components/features/language-switcher';
import {
  Menu,
  X,
  ShoppingCart,
  Heart,
  User,
  Search,
  Sun,
  Moon,
  Globe,
  Package,
  Grid3X3,
  Tag,
  Info,
  Sparkles,
  Home,
} from 'lucide-react';

const NAV_SECTION_KEYS = [
  { id: 'hero', labelKey: 'nav.home', icon: Home },
  { id: 'products', labelKey: 'nav.products', icon: Package },
  { id: 'categories', labelKey: 'nav.categories', icon: Grid3X3 },
  { id: 'deals', labelKey: 'nav.deals', icon: Tag },
  { id: 'ai-search', labelKey: 'nav.aiSearch', icon: Sparkles },
  { id: 'about', labelKey: 'nav.about', icon: Info },
];

export function StoreNav({ onAdminClick, onTrackOrder, onContact, onLogin }: { onAdminClick: () => void; onTrackOrder: () => void; onContact: () => void; onLogin: () => void }) {
  const [activeSection, setActiveSection] = useState('hero');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { totalItems, setIsCartOpen } = useCart();
  const { totalWishlistItems, setIsWishlistOpen } = useWishlist();
  const { resolvedTheme: theme, setTheme } = useTheme();
  const { t, locale, setLocale } = useLanguage();

  const navSections = NAV_SECTION_KEYS.map((s) => ({ ...s, label: t(s.labelKey) }));

  const mounted = useSyncExternalStore(
    (cb) => { return () => {}; },
    () => document.documentElement.classList.contains('dark') ? 'dark' : 'light',
    () => 'light'
  );

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      const scrollPos = window.scrollY + 120;
      for (let i = NAV_SECTION_KEYS.length - 1; i >= 0; i--) {
        const el = document.getElementById(NAV_SECTION_KEYS[i].id);
        if (el && el.offsetTop <= scrollPos) {
          setActiveSection(NAV_SECTION_KEYS[i].id);
          break;
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = useCallback((sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) { el.scrollIntoView({ behavior: 'smooth' }); setMobileOpen(false); }
  }, []);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      scrollToSection('ai-search');
      setSearchOpen(false);
      const q = searchQuery;
      setSearchQuery('');
      setTimeout(() => {
        const searchInput = document.querySelector('#ai-search input[type="text"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.value = q;
          searchInput.focus();
          const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
          nativeInputValueSetter?.call(searchInput, q);
          searchInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
      }, 800);
    }
  }, [searchQuery, scrollToSection]);

  return (
    <>
      {/* Promo Banner */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 text-white text-center py-2 px-4 text-xs sm:text-sm font-medium">
        <span className="inline-flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5" />
          {t('promo.text')} <span className="font-bold bg-white/20 px-1.5 py-0.5 rounded">{t('promo.code')}</span>
          <Sparkles className="h-3.5 w-3.5" />
        </span>
      </div>

      {/* Main Header */}
      <header className={`sticky top-0 z-50 w-full border-b transition-all duration-300 ${scrolled ? 'bg-background/80 backdrop-blur-xl shadow-lg shadow-black/[0.03]' : 'bg-background/95 backdrop-blur-sm'}`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center gap-4">
            <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden text-foreground hover:bg-muted p-2 rounded-lg transition-colors">
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <button onClick={() => scrollToSection('hero')} className="flex items-center gap-2.5 shrink-0 hover:opacity-80 transition-opacity">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/20">
                <span className="text-white font-bold text-base">L</span>
              </div>
              <div className="hidden sm:block">
                <span className="font-bold text-lg tracking-tight">LUXE <span className="gradient-text">Store</span></span>
              </div>
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-0.5 ml-6">
              {navSections.map((section) => (
                <button key={section.id} onClick={() => scrollToSection(section.id)} className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeSection === section.id ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'}`}>
                  {section.label}
                </button>
              ))}
            </nav>

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-md mx-4">
              <form onSubmit={handleSearch} className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input type="text" placeholder={t('nav.searchPlaceholder')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full h-10 pl-10 pr-4 rounded-xl border bg-muted/40 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all" />
              </form>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-1 ml-auto">
              <button onClick={() => setSearchOpen(!searchOpen)} className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                <Search className="h-5 w-5" />
              </button>

              {mounted && (
                <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" title={theme === 'light' ? t('nav.darkMode') : t('nav.lightMode')}>
                  {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </button>
              )}

              <LanguageSwitcher />

              <button onClick={() => setIsWishlistOpen(true)} className="hidden sm:flex relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                <Heart className="h-5 w-5" />
                {totalWishlistItems > 0 && <span className="absolute -top-0.5 -right-0.5 h-[18px] min-w-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1 animate-[fadeInUp_0.3s_ease-out]">{totalWishlistItems}</span>}
              </button>

              <button onClick={() => setIsCartOpen(true)} className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && <span className="absolute -top-0.5 -right-0.5 h-[18px] min-w-[18px] flex items-center justify-center bg-indigo-600 text-white text-[10px] font-bold rounded-full px-1 animate-[fadeInUp_0.3s_ease-out]">{totalItems}</span>}
              </button>

              <button onClick={onTrackOrder} className="hidden md:flex p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" title={t('nav.trackOrder')}>
                <Package className="h-5 w-5" />
              </button>

              <button onClick={onContact} className="hidden md:flex p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" title={t('nav.contact')}>
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
              </button>

              <button onClick={onLogin} className="hidden sm:flex p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" title={t('nav.myAccount')}>
                <User className="h-5 w-5" />
              </button>

              <button onClick={onAdminClick} className="hidden sm:inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground font-medium px-3 py-2 rounded-lg hover:bg-muted transition-colors ml-1">
                {t('nav.admin')}
              </button>
            </div>
          </div>

          {searchOpen && (
            <div className="md:hidden pb-3 animate-fade-in-up">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input type="text" placeholder={t('nav.searchPlaceholder')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} autoFocus className="w-full h-10 pl-10 pr-4 rounded-xl border bg-muted/40 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all" />
              </form>
            </div>
          )}
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} />
          <div className="fixed top-0 left-0 z-50 h-full w-72 bg-background border-r shadow-2xl lg:hidden animate-fade-in-up">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center"><span className="text-white font-bold text-sm">L</span></div>
                <span className="font-bold text-lg">LUXE <span className="gradient-text">Store</span></span>
              </div>
              <button onClick={() => setMobileOpen(false)} className="p-2 rounded-lg hover:bg-muted transition-colors"><X className="h-5 w-5" /></button>
            </div>

            <nav className="p-3 space-y-1">
              {navSections.map((section) => (
                <button key={section.id} onClick={() => scrollToSection(section.id)} className={`flex items-center gap-3 w-full text-left px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${activeSection === section.id ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'}`}>
                  <section.icon className="h-4.5 w-4.5" />
                  {section.label}
                </button>
              ))}

              <div className="my-3 border-t" />

              {mounted && (
                <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className="flex items-center gap-3 w-full text-left px-3 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors">
                  {theme === 'light' ? <Moon className="h-4.5 w-4.5" /> : <Sun className="h-4.5 w-4.5" />}
                  {theme === 'light' ? t('nav.darkMode') : t('nav.lightMode')}
                </button>
              )}

              <button onClick={() => { setLocale(locale === 'ar' ? 'en' : 'ar'); }} className="flex items-center gap-3 w-full text-left px-3 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors">
                <Globe className="h-4.5 w-4.5" />
                {t('nav.language')}
                <Badge variant="outline" className="ml-auto text-xs">{locale === 'ar' ? 'العربية' : 'English'}</Badge>
              </button>

              <button onClick={() => { setIsCartOpen(true); setMobileOpen(false); }} className="flex items-center gap-3 w-full text-left px-3 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors">
                <ShoppingCart className="h-4.5 w-4.5" /> {t('nav.cart')}
                {totalItems > 0 && <Badge className="ml-auto bg-primary text-primary-foreground text-xs">{totalItems}</Badge>}
              </button>

              <button onClick={() => { setIsWishlistOpen(true); setMobileOpen(false); }} className="flex items-center gap-3 w-full text-left px-3 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors">
                <Heart className="h-4.5 w-4.5" /> {t('nav.wishlist')}
                {totalWishlistItems > 0 && <Badge className="ml-auto bg-red-500 text-white text-xs">{totalWishlistItems}</Badge>}
              </button>

              <button onClick={() => { onTrackOrder(); setMobileOpen(false); }} className="flex items-center gap-3 w-full text-left px-3 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors">
                <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 16h6" /><path d="M19 13v6" /><path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14" /><path d="m7.5 4.27 9 5.15" /><polyline points="3.29 7 12 12 20.71 7" /><line x1="12" x2="12" y1="22" y2="12" /></svg>
                {t('nav.trackOrder')}
              </button>

              <button onClick={() => { onContact(); setMobileOpen(false); }} className="flex items-center gap-3 w-full text-left px-3 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors">
                <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                {t('nav.contact')}
              </button>

              <button onClick={() => { onLogin(); setMobileOpen(false); }} className="flex items-center gap-3 w-full text-left px-3 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors">
                <User className="h-4.5 w-4.5" /> {t('nav.myAccount')}
              </button>

              <button onClick={() => { onAdminClick(); setMobileOpen(false); }} className="flex items-center gap-3 w-full text-left px-3 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors">
                <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" /></svg>
                {t('nav.admin')}
              </button>
            </nav>
          </div>
        </>
      )}
    </>
  );
}
