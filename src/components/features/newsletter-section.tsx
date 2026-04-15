'use client';

import React, { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Mail, Send, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

export function NewsletterSection() {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    startTransition(async () => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1200));
      setSubscribed(true);
      setEmail('');
    });
  };

  if (subscribed) {
    return (
      <section className="border-t">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="relative rounded-3xl bg-gradient-to-br from-green-600 via-emerald-600 to-green-700 overflow-hidden px-6 py-12 sm:px-12 sm:py-16 text-center">
            <div className="absolute inset-0 bg-dots-pattern opacity-10" />
            <div className="relative z-10 max-w-xl mx-auto space-y-4 animate-fade-in-up">
              <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white">
                {t('newsletter.success')}
              </h3>
              <p className="text-green-100 text-lg">
                {t('newsletter.subtitle')}
              </p>
              <button
                onClick={() => setSubscribed(false)}
                className="text-sm text-white/80 underline underline-offset-4 hover:text-white transition-colors"
              >
                {t('newsletter.unsubscribe')}
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="border-t">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="relative rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 overflow-hidden px-6 py-12 sm:px-12 sm:py-16 text-center">
          <div className="absolute inset-0 bg-dots-pattern opacity-10" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl" />
          <div className="relative z-10 max-w-xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm text-white/90 font-medium">
              <Mail className="h-4 w-4" />
              {t('newsletter.title')}
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-white">
              {t('newsletter.title')}
            </h3>
            <p className="text-indigo-100 text-lg">
              {t('newsletter.subtitle')}
            </p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={handleSubmit}>
              <div className="flex-1 relative">
                <input
                  type="email"
                  placeholder={t('newsletter.placeholder')}
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  className={`w-full h-12 px-5 rounded-xl bg-white/15 backdrop-blur-sm border ${error ? 'border-red-400' : 'border-white/20'} text-white placeholder:text-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-white/40 transition-all`}
                />
              </div>
              <Button
                type="submit"
                disabled={isPending}
                className="h-12 px-6 rounded-xl bg-white text-indigo-700 font-semibold text-sm hover:bg-white/90 transition-colors shadow-lg flex items-center justify-center gap-2"
              >
                {isPending ? (
                  <span className="h-4 w-4 border-2 border-indigo-700/30 border-t-indigo-700 rounded-full animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {t('newsletter.subscribe')}
              </Button>
            </form>
            {error && <p className="text-sm text-red-200">{error}</p>}
            <p className="text-xs text-indigo-200/70">
              {t('newsletter.subtitle')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
