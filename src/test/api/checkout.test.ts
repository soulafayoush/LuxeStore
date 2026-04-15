import { describe, it, expect, vi } from 'vitest';
import { NextRequest } from 'next/server';

// Top-level mock for rate-limit
vi.mock('@/lib/rate-limit', () => {
  const mockWithRateLimit = vi.fn().mockResolvedValue({ allowed: true, headers: {} });
  return {
    withRateLimit: mockWithRateLimit,
    checkoutRateLimit: {},
    apiRateLimit: {},
    authRateLimit: {},
    RateLimiter: vi.fn(),
    getClientIp: vi.fn(),
  };
});

vi.mock('@/lib/logger', () => ({
  checkoutLogger: { info: vi.fn(), error: vi.fn(), warn: vi.fn() },
  apiLogger: { info: vi.fn(), error: vi.fn() },
}));

describe('POST /api/checkout/create', () => {
  it('should create a checkout session with valid data', async () => {
    const { POST } = await import('@/app/api/checkout/create/route');
    const response = await POST(
      new NextRequest('http://localhost:3000/api/checkout/create', {
        method: 'POST',
        body: JSON.stringify({
          items: [{ productId: 'p1', price: 100, quantity: 2 }],
          userEmail: 'test@example.com',
          shippingAddress: '123 St',
        }),
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.sessionId).toBeDefined();
    expect(json.orderSummary.subtotal).toBe(200);
    expect(json.orderSummary.tax).toBe(30); // 15% of 200
    expect(json.orderSummary.shippingCost).toBe(30); // below 300 SAR
    expect(json.orderSummary.totalAmount).toBe(260); // 200 + 30 + 30
    expect(json.orderSummary.currency).toBe('SAR');
  });

  it('should apply free shipping above threshold', async () => {
    const { POST } = await import('@/app/api/checkout/create/route');
    const response = await POST(
      new NextRequest('http://localhost:3000/api/checkout/create', {
        method: 'POST',
        body: JSON.stringify({
          items: [{ productId: 'p1', price: 400, quantity: 1 }],
          userEmail: 'test@example.com',
          shippingAddress: '123 St',
        }),
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const json = await response.json();
    expect(json.orderSummary.shippingCost).toBe(0);
    expect(json.orderSummary.subtotal).toBe(400);
  });

  it('should return 400 when items are empty', async () => {
    const { POST } = await import('@/app/api/checkout/create/route');
    const response = await POST(
      new NextRequest('http://localhost:3000/api/checkout/create', {
        method: 'POST',
        body: JSON.stringify({ items: [], userEmail: 'test@example.com' }),
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    expect(response.status).toBe(400);
  });

  it('should return 400 when email is missing', async () => {
    const { POST } = await import('@/app/api/checkout/create/route');
    const response = await POST(
      new NextRequest('http://localhost:3000/api/checkout/create', {
        method: 'POST',
        body: JSON.stringify({
          items: [{ productId: 'p1', price: 100, quantity: 1 }],
        }),
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    expect(response.status).toBe(400);
  });

  it('should return 400 when item has invalid quantity', async () => {
    const { POST } = await import('@/app/api/checkout/create/route');
    const response = await POST(
      new NextRequest('http://localhost:3000/api/checkout/create', {
        method: 'POST',
        body: JSON.stringify({
          items: [{ productId: 'p1', price: 100, quantity: 0 }],
          userEmail: 'test@example.com',
        }),
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    expect(response.status).toBe(400);
  });

  it('should return 400 when item has invalid price', async () => {
    const { POST } = await import('@/app/api/checkout/create/route');
    const response = await POST(
      new NextRequest('http://localhost:3000/api/checkout/create', {
        method: 'POST',
        body: JSON.stringify({
          items: [{ productId: 'p1', price: -5, quantity: 1 }],
          userEmail: 'test@example.com',
        }),
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    expect(response.status).toBe(400);
  });

  it('should apply valid coupon code and reduce total', async () => {
    const { POST } = await import('@/app/api/checkout/create/route');
    const response = await POST(
      new NextRequest('http://localhost:3000/api/checkout/create', {
        method: 'POST',
        body: JSON.stringify({
          items: [{ productId: 'p1', price: 500, quantity: 1 }],
          userEmail: 'test@example.com',
          shippingAddress: '123 St',
          couponCode: 'WELCOME20',
        }),
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.orderSummary.subtotal).toBe(500);
    expect(json.orderSummary.discount).toBeGreaterThan(0);
    expect(json.orderSummary.couponApplied).toBe('WELCOME20');
    // totalAmount should be less than without coupon (575)
    expect(json.orderSummary.totalAmount).toBeLessThan(575);
  });

  it('should not apply expired/invalid coupon code', async () => {
    const { POST } = await import('@/app/api/checkout/create/route');
    const response = await POST(
      new NextRequest('http://localhost:3000/api/checkout/create', {
        method: 'POST',
        body: JSON.stringify({
          items: [{ productId: 'p1', price: 500, quantity: 1 }],
          userEmail: 'test@example.com',
          shippingAddress: '123 St',
          couponCode: 'INVALIDCODE',
        }),
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.orderSummary.discount).toBe(0);
    expect(json.orderSummary.couponApplied).toBeNull();
  });

  it('should return 429 when rate limited', async () => {
    const { withRateLimit } = await import('@/lib/rate-limit');
    vi.mocked(withRateLimit).mockResolvedValueOnce({
      allowed: false,
      headers: { 'Retry-After': '60' },
    });

    const { POST } = await import('@/app/api/checkout/create/route');
    const response = await POST(
      new NextRequest('http://localhost:3000/api/checkout/create', {
        method: 'POST',
        body: JSON.stringify({
          items: [{ productId: 'p1', price: 100, quantity: 1 }],
          userEmail: 'test@example.com',
        }),
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    expect(response.status).toBe(429);
  });
});
