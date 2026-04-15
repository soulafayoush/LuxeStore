'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/components/features/cart-context';
import { ShoppingCart, Check, Plus } from 'lucide-react';

interface AddToCartButtonProps {
  productId: string;
  productName: string;
  price: number;
  comparePrice: number | null;
  image: string;
  category: string;
  variant?: 'default' | 'icon' | 'full';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

export function AddToCartButton({
  productId,
  productName,
  price,
  comparePrice,
  image,
  category,
  variant = 'default',
  size = 'sm',
  className = '',
}: AddToCartButtonProps) {
  const { addItem, items } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  const cartItem = items.find((i) => i.id === productId);
  const quantityInCart = cartItem?.quantity || 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({ id: productId, name: productName, price, comparePrice, image, category });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  if (variant === 'icon') {
    return (
      <Button
        size="icon"
        variant={quantityInCart > 0 ? 'default' : 'secondary'}
        className={`rounded-lg shadow-lg bg-background/90 backdrop-blur-sm hover:bg-primary hover:text-primary-foreground transition-all h-9 w-9 ${className}`}
        onClick={handleAdd}
        title={quantityInCart > 0 ? `${quantityInCart} in cart` : 'Add to cart'}
      >
        {justAdded ? (
          <Check className="h-4 w-4" />
        ) : (
          <ShoppingCart className="h-4 w-4" />
        )}
        {quantityInCart > 0 && !justAdded && (
          <span className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center bg-primary text-primary-foreground text-[9px] font-bold rounded-full">
            {quantityInCart}
          </span>
        )}
      </Button>
    );
  }

  if (variant === 'full') {
    return (
      <Button
        size={size === 'lg' ? 'lg' : 'default'}
        className={`w-full rounded-xl shadow-lg transition-all ${className}`}
        onClick={handleAdd}
      >
        {justAdded ? (
          <>
            <Check className="h-4 w-4 mr-2" />
            Added to Cart!
          </>
        ) : (
          <>
            <ShoppingCart className="h-4 w-4 mr-2" />
            Add to Cart — {price} SAR
          </>
        )}
      </Button>
    );
  }

  return (
    <Button
      size={size}
      className={`rounded-lg shadow-lg transition-all ${className}`}
      onClick={handleAdd}
    >
      {justAdded ? (
        <>
          <Check className="h-3.5 w-3.5 mr-1" />
          Added
        </>
      ) : (
        <>
          <Plus className="h-3.5 w-3.5 mr-1" />
          Add to Cart
        </>
      )}
    </Button>
  );
}
