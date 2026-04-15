'use client';

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';

export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  comparePrice: number | null;
  image: string;
  category: string;
}

interface WishlistContextType {
  wishlistItems: WishlistItem[];
  addWishlistItem: (item: WishlistItem) => void;
  removeWishlistItem: (id: string) => void;
  toggleWishlist: (item: WishlistItem) => void;
  isWishlisted: (id: string) => boolean;
  totalWishlistItems: number;
  isWishlistOpen: boolean;
  setIsWishlistOpen: (open: boolean) => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);
const WISHLIST_STORAGE_KEY = 'luxe-store-wishlist';

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage on mount (after hydration)
  /* eslint-disable react-hooks/set-state-in-effect -- legitimate hydration pattern for localStorage */
  useEffect(() => {
    try {
      const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setWishlistItems(parsed);
        }
      }
    } catch {
      // Ignore parse errors
    }
    setIsHydrated(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Save to localStorage when wishlist items change (after hydration)
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlistItems));
    } catch {
      // Ignore storage errors
    }
  }, [wishlistItems, isHydrated]);

  const addWishlistItem = useCallback((item: WishlistItem) => {
    setWishlistItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) return prev;
      return [...prev, item];
    });
  }, []);

  const removeWishlistItem = useCallback((id: string) => {
    setWishlistItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const toggleWishlist = useCallback((item: WishlistItem) => {
    setWishlistItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.filter((i) => i.id !== item.id);
      }
      return [...prev, item];
    });
  }, []);

  const isWishlisted = useCallback(
    (id: string) => {
      return wishlistItems.some((i) => i.id === id);
    },
    [wishlistItems]
  );

  const totalWishlistItems = useMemo(() => wishlistItems.length, [wishlistItems]);

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        addWishlistItem,
        removeWishlistItem,
        toggleWishlist,
        isWishlisted,
        totalWishlistItems,
        isWishlistOpen,
        setIsWishlistOpen,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
