'use server';

import { unstable_cache as nextCache } from 'next/cache';
import { db } from '@/lib/db';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';

// The product SKU used for the demo product page
const DEMO_PRODUCT_SKU = 'AUD-001';

// Simulate a network/DB delay for demo purposes
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Fetch stock data with caching and cache tag for revalidation
const getStockData = nextCache(
  async () => {
    // Simulate DB fetch delay
    await delay(2000);

    const product = await db.product.findFirst({
      where: { sku: DEMO_PRODUCT_SKU },
      select: { stock: true },
    });

    if (!product) {
      return { stock: 0 };
    }

    return { stock: product.stock };
  },
  ['product-stock-data'],
  { tags: ['product-stock'] }
);

// Product Stock Stream — async server component
export async function ProductStockStream() {
  const { stock } = await getStockData();

  const inStock = stock > 0;
  const lowStock = stock > 0 && stock < 10;

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <div
          className={`h-2.5 w-2.5 rounded-full ${
            inStock
              ? lowStock
                ? 'bg-amber-500'
                : 'bg-green-500'
              : 'bg-red-500'
          }`}
        />
        <span
          className={`text-sm font-medium ${
            inStock
              ? lowStock
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400'
          }`}
        >
          {inStock ? `In Stock (${stock} units)` : 'Out of Stock'}
        </span>
      </div>
      {lowStock && (
        <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
          <AlertTriangle className="h-3 w-3" />
          <span>Only {stock} left — order soon!</span>
        </div>
      )}
      {!inStock && (
        <Badge variant="secondary" className="text-xs">
          Currently unavailable
        </Badge>
      )}
    </div>
  );
}
