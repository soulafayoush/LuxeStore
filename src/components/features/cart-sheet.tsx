'use client';

import React, { useState, useTransition } from 'react';
import Image from 'next/image';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/components/features/cart-context';
import {
  ShoppingCart,
  Minus,
  Plus,
  Trash2,
  Truck,
  Tag,
  X,
  ShoppingBag,
  ArrowRight,
  CheckCircle2,
  Package,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

const TAX_RATE = 0.15;
const FREE_SHIPPING_THRESHOLD = 300;
const SHIPPING_COST = 30;

export function CartSheet() {
  const { t } = useLanguage();
  const { items, removeItem, updateQuantity, clearCart, totalItems, subtotal, isCartOpen, setIsCartOpen, setShowCheckout } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [isPending, startTransition] = useTransition();

  const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const discount = couponApplied && subtotal > 0 ? Math.round(subtotal * 0.1 * 100) / 100 : 0;
  const total = Math.round((subtotal + tax + shipping - discount) * 100) / 100;

  const handleApplyCoupon = () => {
    if (couponCode.trim().toUpperCase() === 'SAVE10') {
      setCouponApplied(true);
    }
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    setShowCheckout(true);
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      setIsCartOpen(false);
      if (orderPlaced) {
        clearCart();
        setOrderPlaced(false);
      }
    }
  };

  return (
    <Sheet open={isCartOpen} onOpenChange={handleClose}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col p-0">
        {/* Header */}
        <SheetHeader className="px-6 py-4 border-b bg-muted/30 shrink-0">
          <SheetTitle className="flex items-center gap-2 text-lg">
            <ShoppingCart className="h-5 w-5" />
            {t('cart.title')}
            {totalItems > 0 && (
              <Badge className="ml-1 bg-primary text-primary-foreground">
                {totalItems} {t('cart.items')}
              </Badge>
            )}
          </SheetTitle>
        </SheetHeader>

        {/* Order Placed Success */}
        {orderPlaced ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center space-y-4 animate-fade-in-up">
              <div className="h-20 w-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-bold">{t('cart.orderPlaced')}</h3>
              <p className="text-muted-foreground">{t('cart.orderPlacedMsg')}</p>
            </div>
          </div>
        ) : items.length === 0 ? (
          /* Empty Cart */
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center space-y-4">
              <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mx-auto">
                <ShoppingBag className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">{t('cart.empty')}</h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                {t('cart.emptyDesc')}
              </p>
              <Button onClick={() => setIsCartOpen(false)} className="mt-2">
                {t('cart.continueShopping')} <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              {items.map((item) => (
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
                        onClick={() => removeItem(item.id)}
                        className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="h-7 w-7 rounded-md border flex items-center justify-center hover:bg-muted transition-colors"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="h-7 w-7 rounded-md border flex items-center justify-center hover:bg-muted transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <p className="text-sm font-bold">{(item.price * item.quantity).toFixed(0)} {t('common.sar')}</p>
                        {item.quantity > 1 && (
                          <p className="text-[10px] text-muted-foreground">{item.price} {t('common.sar')} each</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Cart Footer */}
            <div className="border-t bg-muted/30 px-6 py-4 space-y-4 shrink-0">
              {/* Coupon Code */}
              {!couponApplied && (
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder={t('cart.couponPlaceholder')}
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="w-full h-9 pl-9 pr-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 uppercase"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleApplyCoupon}
                    disabled={!couponCode.trim()}
                  >
                    {t('cart.apply')}
                  </Button>
                </div>
              )}

              {couponApplied && (
                <div className="flex items-center justify-between rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <span className="text-sm font-medium text-green-700 dark:text-green-400">{t('cart.applied')}</span>
                  </div>
                  <button
                    onClick={() => { setCouponApplied(false); setCouponCode(''); }}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    {t('cart.remove')}
                  </button>
                </div>
              )}

              {/* Totals */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('cart.subtotal')}</span>
                  <span className="font-medium">{subtotal.toFixed(2)} {t('common.sar')}</span>
                </div>
                {couponApplied && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600 dark:text-green-400">{t('cart.discount')} (10%)</span>
                    <span className="text-green-600 dark:text-green-400 font-medium">-{discount.toFixed(2)} {t('common.sar')}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('cart.vat')}</span>
                  <span className="font-medium">{tax.toFixed(2)} {t('common.sar')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Truck className="h-3.5 w-3.5" />
                    {t('cart.shipping')}
                  </span>
                  <span className="font-medium">
                    {shipping === 0 ? (
                      <span className="text-green-600 dark:text-green-400">{t('cart.free')}</span>
                    ) : (
                      `${shipping.toFixed(2)} ${t('common.sar')}`
                    )}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Add {Math.ceil(FREE_SHIPPING_THRESHOLD - subtotal)} {t('common.sar')} {t('cart.moreForFree')}
                  </p>
                )}
                <Separator />
                <div className="flex justify-between text-base font-bold">
                  <span>{t('cart.total')}</span>
                  <span>{total.toFixed(2)} {t('common.sar')}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={clearCart}
                  className="shrink-0"
                  size="lg"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t('cart.clear')}
                </Button>
                <Button
                  onClick={handleCheckout}
                  disabled={isPending}
                  className="flex-1"
                  size="lg"
                >
                  {isPending ? (
                    <>
                      <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                      {t('cart.processing')}
                    </>
                  ) : (
                    <>
                      <Package className="h-4 w-4 mr-2" />
                      {t('cart.checkout')} — {total.toFixed(2)} {t('common.sar')}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
