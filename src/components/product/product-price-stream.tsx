'use server';

import { cache } from 'react';
import { unstable_cache as nextCache } from 'next/cache';
import { db } from '@/lib/db';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';

// The product ID used for the demo product page
const DEMO_PRODUCT_SKU = 'AUD-001';

// Simulate a network/DB delay for demo purposes
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Fetch price data with caching and cache tag for revalidation
const getPriceData = nextCache(
  async () => {
    // Simulate DB fetch delay
    await delay(1500);

    const product = await db.product.findFirst({
      where: { sku: DEMO_PRODUCT_SKU },
      select: { price: true, comparePrice: true },
    });

    if (!product) {
      return { price: 549, comparePrice: 699 };
    }

    return {
      price: product.price,
      comparePrice: product.comparePrice,
    };
  },
  ['product-price-data'],
  { tags: ['product-price'] }
);

// Product Price Stream — async server component
export async function ProductPriceStream() {
  const { price, comparePrice } = await getPriceData();

  const hasDiscount = comparePrice !== null && comparePrice !== undefined && comparePrice > price;
  const discountPercent = hasDiscount
    ? Math.round(((comparePrice - price) / comparePrice) * 100)
    : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-bold tracking-tight">{price} SAR</span>
        {hasDiscount && (
          <Badge className="bg-green-600 text-white hover:bg-green-700">
            -{discountPercent}% OFF
          </Badge>
        )}
      </div>
      {hasDiscount && (
        <p className="text-sm text-muted-foreground">
          <span className="line-through">{comparePrice} SAR</span>
          <span className="ml-2 text-green-600 dark:text-green-400 font-medium">
            You save {comparePrice - price} SAR
          </span>
        </p>
      )}
      <p className="text-xs text-muted-foreground">
        Tax (15% VAT) will be calculated at checkout
      </p>
      <Button size="lg" className="w-full mt-2">
        <ShoppingCart className="mr-2 h-4 w-4" />
        Add to Cart
      </Button>
    </div>
  );
}
