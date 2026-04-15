'use client';

import React from 'react';
import Image from 'next/image';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useWishlist } from '@/components/features/wishlist-context';
import { useCart } from '@/components/features/cart-context';
import {
  Heart,
  ShoppingCart,
  Trash2,
  X,
  ArrowRight,
} from 'lucide-react';

export function WishlistSheet() {
  const {
    wishlistItems,
    removeWishlistItem,
    totalWishlistItems,
    isWishlistOpen,
    setIsWishlistOpen,
  } = useWishlist();
  const { addItem } = useCart();

  const handleAddToCart = (item: typeof wishlistItems[0]) => {
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      comparePrice: item.comparePrice,
      image: item.image,
      category: item.category,
    });
    removeWishlistItem(item.id);
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      setIsWishlistOpen(false);
    }
  };

  return (
    <Sheet open={isWishlistOpen} onOpenChange={handleClose}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col p-0">
        {/* Header */}
        <SheetHeader className="px-6 py-4 border-b bg-muted/30 shrink-0">
          <SheetTitle className="flex items-center gap-2 text-lg">
            <Heart className="h-5 w-5" />
            Wishlist
            {totalWishlistItems > 0 && (
              <Badge className="ml-1 bg-primary text-primary-foreground">
                {totalWishlistItems} {totalWishlistItems === 1 ? 'item' : 'items'}
              </Badge>
            )}
          </SheetTitle>
        </SheetHeader>

        {wishlistItems.length === 0 ? (
          /* Empty Wishlist */
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center space-y-4">
              <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mx-auto">
                <Heart className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">Your wishlist is empty</h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                Save items you love for later. Click the heart icon on any product to add it here.
              </p>
              <Button onClick={() => setIsWishlistOpen(false)} className="mt-2">
                Browse Products <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Wishlist Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              {wishlistItems.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 rounded-xl border bg-card p-3 shadow-sm"
                >
                  {/* Item Image */}
                  <div className="relative h-20 w-20 rounded-lg overflow-hidden bg-muted shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>

                  {/* Item Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold leading-snug truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{item.category}</p>
                      </div>
                      <button
                        onClick={() => removeWishlistItem(item.id)}
                        className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      {/* Price */}
                      <div className="text-right">
                        <p className="text-sm font-bold">{item.price} SAR</p>
                        {item.comparePrice && (
                          <p className="text-[10px] text-muted-foreground line-through">{item.comparePrice} SAR</p>
                        )}
                      </div>

                      {/* Add to Cart Button */}
                      <Button
                        size="sm"
                        onClick={() => handleAddToCart(item)}
                        className="h-8 text-xs rounded-lg"
                      >
                        <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Wishlist Footer */}
            <div className="border-t bg-muted/30 px-6 py-4 shrink-0">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    wishlistItems.forEach((item) => removeWishlistItem(item.id));
                  }}
                  className="shrink-0"
                  size="lg"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
                <Button
                  onClick={() => {
                    wishlistItems.forEach((item) => handleAddToCart(item));
                    setIsWishlistOpen(false);
                  }}
                  className="flex-1"
                  size="lg"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add All to Cart
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
