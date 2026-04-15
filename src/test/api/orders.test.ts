import { describe, it, expect, vi } from 'vitest';
import { NextRequest } from 'next/server';

// Top-level mocks for all tests in this file
vi.mock('@/lib/db', () => ({
  db: {
    order: {
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    orderItem: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
    product: {
      update: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock('@/lib/logger', () => ({
  apiLogger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

vi.mock('@/lib/rate-limit', () => ({
  apiRateLimit: {},
  authRateLimit: {},
  checkoutRateLimit: {},
  withRateLimit: vi.fn().mockResolvedValue({ allowed: true, headers: {} }),
  RateLimiter: vi.fn(),
  getClientIp: vi.fn().mockReturnValue('1.2.3.4'),
}));

describe('GET /api/orders', () => {
  it('should return orders with pagination', async () => {
    const { db } = await import('@/lib/db');
    vi.mocked(db.order.findMany).mockResolvedValue([
      { id: 'o1', orderNumber: 'ORD-2025-0001', status: 'PENDING', totalAmount: 200 },
    ]);
    vi.mocked(db.order.count).mockResolvedValue(1);

    const { GET } = await import('@/app/api/orders/route');
    const response = await GET(new NextRequest('http://localhost:3000/api/orders'));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data).toHaveLength(1);
    expect(json.pagination.page).toBe(1);
  });

  it('should pass status filter', async () => {
    const { db } = await import('@/lib/db');
    vi.mocked(db.order.findMany).mockResolvedValue([]);
    vi.mocked(db.order.count).mockResolvedValue(0);

    const { GET } = await import('@/app/api/orders/route');
    await GET(new NextRequest('http://localhost:3000/api/orders?status=PROCESSING'));

    expect(db.order.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: 'PROCESSING' }),
      }),
    );
  });

  it('should support custom page and limit', async () => {
    const { db } = await import('@/lib/db');
    vi.mocked(db.order.findMany).mockResolvedValue([]);
    vi.mocked(db.order.count).mockResolvedValue(0);

    const { GET } = await import('@/app/api/orders/route');
    await GET(new NextRequest('http://localhost:3000/api/orders?page=3&limit=5'));

    expect(db.order.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 10, take: 5 }),
    );
  });
});

describe('POST /api/orders', () => {
  it('should create an order with valid data', async () => {
    const newOrder = { id: 'o1', orderNumber: 'ORD-2025-0001', status: 'PENDING', totalAmount: 500 };

    // Set up mocks BEFORE importing route
    const { db } = await import('@/lib/db');
    vi.mocked(db.order.count).mockResolvedValue(0);
    vi.mocked(db.$transaction).mockImplementation(async (callback: any) => {
      const tx = {
        order: { create: vi.fn().mockResolvedValue(newOrder) },
        orderItem: { create: vi.fn().mockResolvedValue({}) },
        product: { update: vi.fn().mockResolvedValue({}) },
      };
      return callback(tx);
    });

    const { POST } = await import('@/app/api/orders/route');
    const response = await POST(
      new NextRequest('http://localhost:3000/api/orders', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'user1',
          items: [{ productId: 'p1', quantity: 1, price: 500 }],
          shippingAddress: '123 Test St, Riyadh',
          totalAmount: 500,
        }),
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    expect(response.status).toBe(201);
    const json = await response.json();
    expect(json.success).toBe(true);
  });

  it('should return 400 when userId is missing', async () => {
    const { POST } = await import('@/app/api/orders/route');
    const response = await POST(
      new NextRequest('http://localhost:3000/api/orders', {
        method: 'POST',
        body: JSON.stringify({ items: [], totalAmount: 0 }),
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    expect(response.status).toBe(400);
  });

  it('should return 400 when items array is empty', async () => {
    const { POST } = await import('@/app/api/orders/route');
    const response = await POST(
      new NextRequest('http://localhost:3000/api/orders', {
        method: 'POST',
        body: JSON.stringify({ userId: 'user1', items: [], totalAmount: 0 }),
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    expect(response.status).toBe(400);
  });
});
