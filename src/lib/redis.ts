/**
 * Redis Client Configuration
 *
 * This module provides a Redis client configuration for production use.
 * In the current demo environment, caching is handled by cache.service.ts
 * using an in-memory Map. When deploying to production with Redis:
 *
 * 1. Install: bun add ioredis
 * 2. Set env var: REDIS_URL=redis://your-redis-host:6379
 * 3. Update cache.service.ts to use Redis instead of Map
 *
 * Example usage:
 *
 * import { getRedisClient } from "@/lib/redis";
 * const redis = getRedisClient();
 * await redis.setex("key", 300, "value");
 * const value = await redis.get("key");
 */

export interface RedisConfig {
  url: string;
  ttl: {
    products: number;
    categories: number;
    dashboard: number;
    userSession: number;
    orderStats: number;
  };
}

export const redisConfig: RedisConfig = {
  url: process.env.REDIS_URL || "redis://localhost:6379",
  ttl: {
    products: 5 * 60,          // 5 minutes
    categories: 60 * 60,       // 1 hour
    dashboard: 5 * 60,         // 5 minutes
    userSession: 24 * 60 * 60, // 24 hours
    orderStats: 10 * 60,       // 10 minutes
  },
};

/**
 * Cache key prefixes for organized Redis namespaces
 */
export const CACHE_KEYS = {
  product: (id: string) => `product:${id}`,
  products: "products:all",
  productsByCategory: (catId: string) => `products:category:${catId}`,
  category: (id: string) => `category:${id}`,
  categoryTree: "categories:tree",
  user: (id: string) => `user:${id}`,
  userSession: (id: string) => `session:${id}`,
  order: (id: string) => `order:${id}`,
  dashboardStats: "dashboard:stats",
  revenueChart: "dashboard:revenue",
  lowStockProducts: "inventory:low-stock",
};

/**
 * Redis helper functions (for production with real Redis)
 * These are mock implementations that log actions for demo purposes
 */
export const redisHelpers = {
  async cacheProduct(productId: string, data: unknown): Promise<void> {
    console.log(`[Redis] Caching product ${productId}`);
    // await redis.setex(CACHE_KEYS.product(productId), redisConfig.ttl.products, JSON.stringify(data));
  },

  async cacheCategoryTree(data: unknown): Promise<void> {
    console.log(`[Redis] Caching category tree`);
    // await redis.setex(CACHE_KEYS.categoryTree, redisConfig.ttl.categories, JSON.stringify(data));
  },

  async cacheDashboardStats(data: unknown): Promise<void> {
    console.log(`[Redis] Caching dashboard stats`);
    // await redis.setex(CACHE_KEYS.dashboardStats, redisConfig.ttl.dashboard, JSON.stringify(data));
  },

  async invalidateProduct(productId: string): Promise<void> {
    console.log(`[Redis] Invalidating product cache: ${productId}`);
    // await redis.del(CACHE_KEYS.product(productId));
    // await redis.del(CACHE_KEYS.products);
  },

  async invalidateAllProducts(): Promise<void> {
    console.log(`[Redis] Invalidating all product caches`);
    // const keys = await redis.keys("products:*");
    // if (keys.length > 0) await redis.del(...keys);
  },

  async invalidateDashboard(): Promise<void> {
    console.log(`[Redis] Invalidating dashboard caches`);
    // await redis.del(CACHE_KEYS.dashboardStats, CACHE_KEYS.revenueChart);
  },
};
