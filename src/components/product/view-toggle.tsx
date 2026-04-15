'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/admin-layout';
import { StoreNav } from '@/components/product/store-nav';
import { CartProvider, useCart } from '@/components/features/cart-context';
import { WishlistProvider } from '@/components/features/wishlist-context';
import { CartSheet } from '@/components/features/cart-sheet';
import { WishlistSheet } from '@/components/features/wishlist-sheet';
import { CheckoutPage } from '@/components/features/checkout-page';
import { OrderTracking } from '@/components/features/order-tracking';
import { ContactUs } from '@/components/features/contact-us';
import { LoginModal } from '@/components/features/login-modal';
import { SessionProvider } from '@/components/features/session-provider';



export function ViewToggle({ children }: { children: React.ReactNode }) {
  const [view, setView] = useState<'store' | 'admin'>('store');
  const [trackingOpen, setTrackingOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  if (view === 'admin') {
    return (
      <SessionProvider>
        <CartProvider>
          <WishlistProvider>
            <CartSheet />
            <WishlistSheet />
            <div className="relative">
              <button
                onClick={() => setView('store')}
                className="absolute top-4 right-4 z-50 bg-background border rounded-xl px-4 py-2 text-sm font-medium hover:bg-muted transition-colors shadow-lg flex items-center gap-2"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m15 18-6-6 6-6" />
                </svg>
                Back to Store
              </button>
              <AdminLayout />
            </div>
          </WishlistProvider>
        </CartProvider>
      </SessionProvider>
    );
  }

  return (
    <SessionProvider>
      <CartProvider>
        <WishlistProvider>
          <CartSheet />
          <WishlistSheet />
          <OrderTracking open={trackingOpen} onOpenChange={setTrackingOpen} />
          <ContactUs open={contactOpen} onOpenChange={setContactOpen} />
          <LoginModal open={loginOpen} onOpenChange={setLoginOpen} />
          <StoreNav
            onAdminClick={() => setView('admin')}
            onTrackOrder={() => setTrackingOpen(true)}
            onContact={() => setContactOpen(true)}
            onLogin={() => setLoginOpen(true)}
          />
          <CheckoutVisibility>{children}</CheckoutVisibility>
        </WishlistProvider>
      </CartProvider>
    </SessionProvider>
  );
}

/** Hides store content when checkout is active, shows checkout page instead */
function CheckoutVisibility({ children }: { children: React.ReactNode }) {
  const { showCheckout } = useCart();

  // Scroll to top when checkout opens so user sees the form
  useEffect(() => {
    if (showCheckout) {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [showCheckout]);

  if (showCheckout) {
    return <CheckoutPage />;
  }

  return <>{children}</>;
}
