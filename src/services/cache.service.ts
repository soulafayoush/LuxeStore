/**
 * Cache Service
 * Provides Redis-like caching with TTL (Time To Live) support
 * Currently implemented with in-memory Map for demo/development
 * In production, replace with actual Redis client
 *
 * Architecture Note: This service acts as a caching layer that can be
 * swapped to use Redis, Memcached, or any distributed cache without
 * changing the calling code.
 */

interface CacheEntry<T = unknown> {
  data: T;
  expiresAt: number;
  createdAt: number;
  hitCount: number;
}

interface CacheStats {
  totalKeys: number;
  hitRate: number;
  misses: number;
  hits: number;
  memoryUsage: string;
}

export class CacheService {
  private cache = new Map<string, CacheEntry>();
  private hits = 0;
  private misses = 0;
  private defaultTTL = 5 * 60 * 1000; // 5 minutes default TTL

  /**
   * Get a value from cache
   * Returns null if the key doesn't exist or has expired
   */
  get<T = unknown>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      this.misses++;
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }

    // Update hit count
    entry.hitCount++;
    this.hits++;

    return entry.data as T;
  }

  /**
   * Set a value in cache with optional TTL
   */
  set<T = unknown>(key: string, data: T, ttlMs?: number): void {
    const ttl = ttlMs || this.defaultTTL;
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttl,
      createdAt: Date.now(),
      hitCount: 0,
    });
  }

  /**
   * Get or set pattern - returns cached value or computes and caches it
   */
  async getOrSet<T = unknown>(
    key: string,
    factory: () => Promise<T>,
    ttlMs?: number
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) return cached;

    const data = await factory();
    this.set(key, data, ttlMs);
    return data;
  }

  /**
   * Delete a specific key from cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Invalidate cache entries matching a pattern
   * Supports simple glob patterns (*)
   */
  invalidate(pattern: string): number {
    let deleted = 0;
    const regex = new RegExp(
      "^" + pattern.replace(/\*/g, ".*").replace(/\?/g, ".") + "$"
    );

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        deleted++;
      }
    }

    return deleted;
  }

  /**
   * Check if a key exists and is not expired
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Get the remaining TTL for a key in milliseconds
   */
  ttl(key: string): number {
    const entry = this.cache.get(key);
    if (!entry) return -2; // Key does not exist
    const remaining = entry.expiresAt - Date.now();
    return remaining > 0 ? remaining : -1; // -1 = expired
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Clean up expired entries
   */
  cleanup(): number {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    return cleaned;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const totalRequests = this.hits + this.misses;
    return {
      totalKeys: this.cache.size,
      hitRate: totalRequests > 0 ? (this.hits / totalRequests) * 100 : 0,
      misses: this.misses,
      hits: this.hits,
      memoryUsage: this.estimateMemoryUsage(),
    };
  }

  /**
   * Get all cache keys
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Set default TTL for all new cache entries
   */
  setDefaultTTL(ms: number): void {
    this.defaultTTL = ms;
  }

  // Private helper to estimate memory usage
  private estimateMemoryUsage(): string {
    let bytes = 0;
    for (const [key, entry] of this.cache.entries()) {
      bytes += key.length * 2; // UTF-16
      bytes += JSON.stringify(entry.data).length * 2;
    }
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
}

// Singleton instance
export const cacheService = new CacheService();

/**
 * Redis Client Configuration (for production use)
 *
 * To switch to real Redis:
 * 1. Install redis: `bun add redis`
 * 2. Set REDIS_URL in .env
 * 3. Replace CacheService internals with Redis commands
 *
 * Example Redis configuration:
 *
 * import Redis from 'ioredis';
 *
 * export const redis = new Redis(process.env.REDIS_URL!, {
 *   maxRetriesPerRequest: 3,
 *   retryStrategy(times) {
 *     const delay = Math.min(times * 50, 2000);
 *     return delay;
 *   },
 * });
 *
 * Common Redis patterns:
 *
 * // Cache product data
 * await redis.setex(`product:${id}`, 300, JSON.stringify(product));
 * const cached = await redis.get(`product:${id}`);
 *
 * // Cache category tree
 * await redis.setex('categories:tree', 3600, JSON.stringify(tree));
 *
 * // Cache dashboard stats (refresh every 5 min)
 * await redis.setex('dashboard:stats', 300, JSON.stringify(stats));
 *
 * // Cache invalidation
 * await redis.del(`product:${id}`);
 * await redis.del('categories:*');  // Requires keys command (use SCAN in production)
 *
 * // Pub/Sub for real-time updates
 * await redis.publish('orders:new', JSON.stringify(order));
 * await redis.subscribe('orders:*', (channel, message) => { ... });
 */

export const REDIS_CONFIG = {
  url: process.env.REDIS_URL || "redis://localhost:6379",
  ttl: {
    products: 5 * 60,        // 5 minutes
    categories: 60 * 60,     // 1 hour
    dashboard: 5 * 60,       // 5 minutes
    userSession: 24 * 60 * 60, // 24 hours
    orderStats: 10 * 60,    // 10 minutes
  },
};
