'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { useWishlist } from '@/components/features/wishlist-context';
import { Heart } from 'lucide-react';

interface WishlistBtnProps {
  productId: string;
  productName: string;
  price: number;
  comparePrice: number | null;
  image: string;
  category: string;
  size?: number;
  className?: string;
}

export function WishlistBtn({
  productId,
  productName,
  price,
  comparePrice,
  image,
  category,
  size = 16,
  className = '',
}: WishlistBtnProps) {
  const { toggleWishlist, isWishlisted } = useWishlist();
  const wishlisted = isWishlisted(productId);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist({ id: productId, name: productName, price, comparePrice, image, category });
  };

  return (
    <Button
      size="sm"
      variant="secondary"
      className={`rounded-lg shadow-lg bg-background/90 backdrop-blur-sm hover:bg-background transition-all h-9 w-9 p-0 ${className}`}
      onClick={handleToggle}
      title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <Heart
        className="transition-all duration-200"
        style={{ width: size, height: size }}
        fill={wishlisted ? 'currentColor' : 'none'}
      />
    </Button>
  );
}
