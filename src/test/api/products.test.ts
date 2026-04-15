import { describe, it, expect, vi } from 'vitest';
import { NextRequest } from 'next/server';

// Mock dependencies at top level (vi.mock is hoisted)
vi.mock('@/lib/container', () => ({
  getProductService: vi.fn(),
  getProductRepository: vi.fn(),
  resetContainer: vi.fn(),
}));

vi.mock('@/lib/logger', () => ({
  apiLogger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

// Default: allow all rate limit requests
vi.mock('@/lib/rate-limit', () => ({
  apiRateLimit: {},
  authRateLimit: {},
  checkoutRateLimit: {},
  withRateLimit: vi.fn().mockResolvedValue({ allowed: true, headers: {} }),
  RateLimiter: vi.fn(),
  getClientIp: vi.fn().mockReturnValue('1.2.3.4'),
}));

describe('GET /api/products', () => {
  it('should return 200 with product list', async () => {
    const { getProductService } = await import('@/lib/container');
    vi.mocked(getProductService).mockReturnValue({
      getProducts: vi.fn().mockResolvedValue({
        products: [{ id: 'p1', name: 'Product 1', price: 100 }],
        total: 1,
        page: 1,
        totalPages: 1,
      }),
    } as any);

    const { GET } = await import('@/app/api/products/route');
    const request = new NextRequest('http://localhost:3000/api/products');
    const response = await GET(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data).toHaveLength(1);
    expect(json.meta.total).toBe(1);
  });

  it('should pass filters from query params', async () => {
    const mockGetProducts = vi.fn().mockResolvedValue({
      products: [],
      total: 0,
      page: 1,
      totalPages: 0,
    });

    const { getProductService } = await import('@/lib/container');
    vi.mocked(getProductService).mockReturnValue({
      getProducts: mockGetProducts,
    } as any);

    const { GET } = await import('@/app/api/products/route');
    const request = new NextRequest(
      'http://localhost:3000/api/products?category=Audio&minPrice=100&maxPrice=500&sortBy=price_asc&page=2&limit=10',
    );

    await GET(request);

    expect(mockGetProducts).toHaveBeenCalledWith({
      category: 'Audio',
      minPrice: 100,
      maxPrice: 500,
      sortBy: 'price_asc',
      page: 2,
      limit: 10,
    });
  });

  it('should pass search query param', async () => {
    const mockGetProducts = vi.fn().mockResolvedValue({
      products: [],
      total: 0,
      page: 1,
      totalPages: 0,
    });

    const { getProductService } = await import('@/lib/container');
    vi.mocked(getProductService).mockReturnValue({
      getProducts: mockGetProducts,
    } as any);

    const { GET } = await import('@/app/api/products/route');
    const request = new NextRequest(
      'http://localhost:3000/api/products?search=headphones',
    );

    await GET(request);

    expect(mockGetProducts).toHaveBeenCalledWith(
      expect.objectContaining({ search: 'headphones' }),
    );
  });
});

describe('POST /api/products', () => {
  it('should create a product with valid data', async () => {
    const { getProductService } = await import('@/lib/container');
    vi.mocked(getProductService).mockReturnValue({
      getProductById: vi.fn().mockResolvedValue({ id: 'new', name: 'New Product' }),
    } as any);

    const { POST } = await import('@/app/api/products/route');
    const request = new NextRequest('http://localhost:3000/api/products', {
      method: 'POST',
      body: JSON.stringify({ name: 'New Product', price: 100, sku: 'SKU-001' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(201);
    expect(json.success).toBe(true);
  });

  it('should return 400 when name is missing', async () => {
    const { getProductService } = await import('@/lib/container');
    vi.mocked(getProductService).mockReturnValue({
      getProductById: vi.fn(),
    } as any);

    const { POST } = await import('@/app/api/products/route');
    const request = new NextRequest('http://localhost:3000/api/products', {
      method: 'POST',
      body: JSON.stringify({ price: 100, sku: 'SKU-001' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('should return 422 when price is not positive', async () => {
    const { getProductService } = await import('@/lib/container');
    vi.mocked(getProductService).mockReturnValue({
      getProductById: vi.fn(),
    } as any);

    const { POST } = await import('@/app/api/products/route');
    const request = new NextRequest('http://localhost:3000/api/products', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test', price: -10, sku: 'SKU-001' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    expect(response.status).toBe(422);
  });

  it('should return 400 when SKU is missing', async () => {
    const { getProductService } = await import('@/lib/container');
    vi.mocked(getProductService).mockReturnValue({
      getProductById: vi.fn(),
    } as any);

    const { POST } = await import('@/app/api/products/route');
    const request = new NextRequest('http://localhost:3000/api/products', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test', price: 100 }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });
});
