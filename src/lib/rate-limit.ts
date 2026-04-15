/**
 * Simple in-memory rate limiter for API routes
 * In production, use Redis-backed rate limiting (e.g., @upstash/ratelimit)
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

export class RateLimiter {
  private store: Map<string, RateLimitEntry>;
  private maxRequests: number;
  private windowMs: number;

  constructor(options: { maxRequests: number; windowMs: number }) {
    this.store = new Map();
    this.maxRequests = options.maxRequests;
    this.windowMs = options.windowMs;

    // Clean up expired entries every 5 minutes
    if (typeof setInterval !== 'undefined') {
      setInterval(() => this.cleanup(), 5 * 60 * 1000);
    }
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.store) {
      if (entry.resetTime <= now) {
        this.store.delete(key);
      }
    }
  }

  check(identifier: string): {
    success: boolean;
    remaining: number;
    resetTime: number;
  } {
    const now = Date.now();
    const entry = this.store.get(identifier);

    if (!entry || entry.resetTime <= now) {
      const resetTime = now + this.windowMs;
      this.store.set(identifier, { count: 1, resetTime });
      return { success: true, remaining: this.maxRequests - 1, resetTime };
    }

    if (entry.count >= this.maxRequests) {
      return { success: false, remaining: 0, resetTime: entry.resetTime };
    }

    entry.count++;
    return {
      success: true,
      remaining: this.maxRequests - entry.count,
      resetTime: entry.resetTime,
    };
  }

  reset(identifier: string) {
    this.store.delete(identifier);
  }
}

// Pre-configured limiters for different use cases
export const apiRateLimit = new RateLimiter({
  maxRequests: 100,
  windowMs: 60 * 1000, // 100 requests per minute
});

export const authRateLimit = new RateLimiter({
  maxRequests: 5,
  windowMs: 60 * 1000, // 5 attempts per minute
});

export const checkoutRateLimit = new RateLimiter({
  maxRequests: 10,
  windowMs: 60 * 1000, // 10 checkouts per minute
});

/**
 * Helper to get client IP from request
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }
  return 'unknown';
}

/**
 * Middleware function to check rate limit and return 429 if exceeded
 */
export async function withRateLimit(
  request: Request,
  limiter: RateLimiter,
): Promise<{ allowed: boolean; headers: HeadersInit }> {
  const ip = getClientIp(request);
  const result = limiter.check(ip);

  const headers: HeadersInit = {
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(Math.ceil(result.resetTime / 1000)),
  };

  if (!result.success) {
    headers['Retry-After'] = String(Math.ceil((result.resetTime - Date.now()) / 1000));
  }

  return { allowed: result.success, headers };
}
