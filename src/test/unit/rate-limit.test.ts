import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RateLimiter } from '@/lib/rate-limit';

describe('RateLimiter', () => {
  let limiter: RateLimiter;

  beforeEach(() => {
    limiter = new RateLimiter({ maxRequests: 3, windowMs: 1000 });
  });

  it('should allow requests under the limit', () => {
    const result = limiter.check('test-ip');
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(2);
  });

  it('should block requests over the limit', () => {
    limiter.check('test-ip');
    limiter.check('test-ip');
    limiter.check('test-ip');
    const result = limiter.check('test-ip');
    expect(result.success).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('should track different clients independently', () => {
    limiter.check('ip-1');
    limiter.check('ip-1');
    limiter.check('ip-1');
    const result = limiter.check('ip-2');
    expect(result.success).toBe(true);
  });

  it('should reset after window expires', () => {
    vi.useFakeTimers();
    const shortLimiter = new RateLimiter({ maxRequests: 1, windowMs: 100 });
    shortLimiter.check('test-ip');
    expect(shortLimiter.check('test-ip').success).toBe(false);

    vi.advanceTimersByTime(200);
    expect(shortLimiter.check('test-ip').success).toBe(true);
    vi.useRealTimers();
  });

  it('should reset for a specific identifier', () => {
    limiter.check('test-ip');
    limiter.reset('test-ip');
    const result = limiter.check('test-ip');
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(2);
  });
});
