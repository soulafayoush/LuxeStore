'use client';

import React, { useState, useTransition, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { placeOrder } from '@/app/actions/place-order';
import {
  ShoppingCart,
  Loader2,
  CheckCircle2,
  XCircle,
  Package,
  Truck,
  Tag,
  Minus,
  Plus,
} from 'lucide-react';

// Demo products available for selection
const DEMO_PRODUCTS = [
  {
    id: 'DUMMY_ID_1', // Will be replaced with real DB ID
    name: 'Premium Wireless Headphones',
    price: 549,
    comparePrice: 699,
    stock: 200,
  },
  {
    id: 'DUMMY_ID_2',
    name: 'Sports Running Shoes',
    price: 459,
    comparePrice: null,
    stock: 120,
  },
  {
    id: 'DUMMY_ID_3',
    name: 'Smart Watch Pro',
    price: 899,
    comparePrice: 1200,
    stock: 60,
  },
];

interface SelectedItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
}

interface PlaceOrderFormProps {
  /** Real product IDs mapped to demo products, fetched from parent */
  productMap?: Record<string, string>;
}

export function PlaceOrderForm({ productMap }: PlaceOrderFormProps) {
  const [items, setItems] = useState<SelectedItem[]>([]);
  const [shippingAddress, setShippingAddress] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const TAX_RATE = 0.15;
  const FREE_SHIPPING_THRESHOLD = 300;
  const SHIPPING_COST = 30;

  // Use real product IDs if provided, otherwise use demo IDs
  const getRealProductId = useCallback(
    (demoId: string) => {
      if (productMap && productMap[demoId]) {
        return productMap[demoId];
      }
      return demoId;
    },
    [productMap]
  );

  // Add a product to the order
  const addItem = (product: (typeof DEMO_PRODUCTS)[0]) => {
    const realId = getRealProductId(product.id);
    const existing = items.find((item) => item.productId === realId);
    if (existing) {
      setItems(
        items.map((item) =>
          item.productId === realId
            ? { ...item, quantity: Math.min(item.quantity + 1, 99) }
            : item
        )
      );
    } else {
      setItems([
        ...items,
        {
          productId: realId,
          productName: product.name,
          price: product.price,
          quantity: 1,
        },
      ]);
    }
    setResult(null);
  };

  // Update quantity for an item
  const updateQuantity = (productId: string, delta: number) => {
    setItems(
      items
        .map((item) =>
          item.productId === productId
            ? { ...item, quantity: Math.max(1, Math.min(item.quantity + delta, 99)) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
    setResult(null);
  };

  // Remove an item from the order
  const removeItem = (productId: string) => {
    setItems(items.filter((item) => item.productId !== productId));
    setResult(null);
  };

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const total = Math.round((subtotal + tax + shipping) * 100) / 100;

  // Check which products are already added
  const addedProductIds = new Set(items.map((item) => item.productId));

  // Submit order via server action
  const handleSubmit = () => {
    if (items.length === 0) return;
    if (shippingAddress.trim().length < 5) {
      setResult({ success: false, message: 'Shipping address must be at least 5 characters.' });
      return;
    }

    // Use a demo user ID (in production this comes from auth)
    const demoUserId = 'demo-user-placeholder';

    startTransition(async () => {
      const orderResult = await placeOrder({
        userId: demoUserId,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        shippingAddress: shippingAddress.trim(),
        couponCode: couponCode.trim() || undefined,
      });

      if (orderResult.success) {
        setResult({
          success: true,
          message: `Order ${orderResult.order.orderNumber} placed successfully! Total: ${orderResult.order.totalAmount} SAR`,
        });
        setItems([]);
        setShippingAddress('');
        setCouponCode('');
      } else {
        setResult({
          success: false,
          message: orderResult.errors.join('. '),
        });
      }
    });
  };

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <ShoppingCart className="h-5 w-5" />
          Place an Order
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Product Selection */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Select Products</Label>
          <div className="grid gap-2">
            {DEMO_PRODUCTS.map((product) => {
              const realId = getRealProductId(product.id);
              const isAdded = addedProductIds.has(realId);
              return (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => addItem(product)}
                  disabled={isAdded || isPending}
                  className={`flex items-center justify-between rounded-lg border p-3 text-left transition-colors hover:bg-muted/50 ${
                    isAdded ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                  }`}
                >
                  <div>
                    <p className="text-sm font-medium">{product.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-sm font-semibold">{product.price} SAR</span>
                      {product.comparePrice && (
                        <span className="text-xs text-muted-foreground line-through">
                          {product.comparePrice} SAR
                        </span>
                      )}
                      {product.comparePrice && (
                        <Badge variant="secondary" className="text-xs px-1.5 py-0">
                          -{Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}%
                        </Badge>
                      )}
                    </div>
                  </div>
                  {isAdded ? (
                    <Badge variant="outline" className="text-xs">
                      Added
                    </Badge>
                  ) : (
                    <Plus className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Items */}
        {items.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <Label className="text-sm font-medium">Your Cart</Label>
              <div className="space-y-2">
                {items.map((item) => (
                  <div
                    key={item.productId}
                    className="flex items-center justify-between rounded-lg border bg-muted/30 p-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.productName}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.price} SAR each
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => updateQuantity(item.productId, -1)}
                        disabled={isPending}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => updateQuantity(item.productId, 1)}
                        disabled={isPending}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <span className="w-16 text-right text-sm font-semibold ml-1">
                        {item.price * item.quantity} SAR
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => removeItem(item.productId)}
                        disabled={isPending}
                      >
                        <XCircle className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Totals */}
            <div className="rounded-lg border bg-muted/20 p-3 space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{subtotal.toFixed(2)} SAR</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">VAT (15%)</span>
                <span>{tax.toFixed(2)} SAR</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Truck className="h-3.5 w-3.5" />
                  Shipping
                </span>
                <span>
                  {shipping === 0 ? (
                    <span className="text-green-600 dark:text-green-400 font-medium">Free</span>
                  ) : (
                    `${shipping.toFixed(2)} SAR`
                  )}
                </span>
              </div>
              {shipping > 0 && subtotal < FREE_SHIPPING_THRESHOLD && (
                <p className="text-xs text-muted-foreground">
                  Add {Math.ceil(FREE_SHIPPING_THRESHOLD - subtotal)} SAR more for free shipping!
                </p>
              )}
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>{total.toFixed(2)} SAR</span>
              </div>
            </div>
          </>
        )}

        {/* Shipping Address */}
        <div className="space-y-2">
          <Label htmlFor="shipping-address" className="text-sm font-medium">
            Shipping Address
          </Label>
          <Input
            id="shipping-address"
            placeholder="Enter your full shipping address..."
            value={shippingAddress}
            onChange={(e) => {
              setShippingAddress(e.target.value);
              setResult(null);
            }}
            disabled={isPending}
          />
        </div>

        {/* Coupon Code */}
        <div className="space-y-2">
          <Label htmlFor="coupon-code" className="text-sm font-medium flex items-center gap-1">
            <Tag className="h-3.5 w-3.5" />
            Coupon Code (Optional)
          </Label>
          <Input
            id="coupon-code"
            placeholder="e.g. SAVE10"
            value={couponCode}
            onChange={(e) => {
              setCouponCode(e.target.value);
              setResult(null);
            }}
            disabled={isPending}
            className="uppercase"
          />
        </div>

        {/* Result Message */}
        {result && (
          <div
            className={`flex items-start gap-2 rounded-lg p-3 text-sm ${
              result.success
                ? 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300 border border-green-200 dark:border-green-800'
                : 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300 border border-red-200 dark:border-red-800'
            }`}
          >
            {result.success ? (
              <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
            ) : (
              <XCircle className="h-4 w-4 mt-0.5 shrink-0" />
            )}
            <span>{result.message}</span>
          </div>
        )}

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={items.length === 0 || isPending || shippingAddress.trim().length < 5}
          className="w-full"
          size="lg"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing Order...
            </>
          ) : (
            <>
              <Package className="mr-2 h-4 w-4" />
              Place Order — {total.toFixed(2)} SAR
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
