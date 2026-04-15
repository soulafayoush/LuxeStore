import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';

describe('POST /api/search/semantic', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  const mockDb = () => {
    vi.doMock('@/lib/db', () => ({
      db: {
        product: {
          findMany: vi.fn().mockResolvedValue([]),
        },
      },
    }));
  };

  it('should return 400 when query is empty', async () => {
    mockDb();
    const { POST } = await import('@/app/api/search/semantic/route');
    const response = await POST(
      new NextRequest('http://localhost:3000/api/search/semantic', {
        method: 'POST',
        body: JSON.stringify({ query: '' }),
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    expect(response.status).toBe(400);
  });

  it('should return 400 when query is missing', async () => {
    mockDb();
    const { POST } = await import('@/app/api/search/semantic/route');
    const response = await POST(
      new NextRequest('http://localhost:3000/api/search/semantic', {
        method: 'POST',
        body: JSON.stringify({}),
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    expect(response.status).toBe(400);
  });

  it('should return results for a valid query', async () => {
    mockDb();
    const { POST } = await import('@/app/api/search/semantic/route');
    const response = await POST(
      new NextRequest('http://localhost:3000/api/search/semantic', {
        method: 'POST',
        body: JSON.stringify({ query: 'headphones' }),
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.query).toBe('headphones');
    expect(json.filters).toBeDefined();
    expect(json.explanation).toBeDefined();
    expect(Array.isArray(json.results)).toBe(true);
  });

  it('should extract color filters from query', async () => {
    mockDb();
    const { POST } = await import('@/app/api/search/semantic/route');
    const response = await POST(
      new NextRequest('http://localhost:3000/api/search/semantic', {
        method: 'POST',
        body: JSON.stringify({ query: 'red dress' }),
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const json = await response.json();
    expect(json.filters.colors).toContain('red');
  });

  it('should extract category filters from query', async () => {
    mockDb();
    const { POST } = await import('@/app/api/search/semantic/route');
    const response = await POST(
      new NextRequest('http://localhost:3000/api/search/semantic', {
        method: 'POST',
        body: JSON.stringify({ query: 'headphones for music' }),
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const json = await response.json();
    expect(json.filters.categories).toContain('electronics');
  });

  it('should detect budget sentiment', async () => {
    mockDb();
    const { POST } = await import('@/app/api/search/semantic/route');
    const response = await POST(
      new NextRequest('http://localhost:3000/api/search/semantic', {
        method: 'POST',
        body: JSON.stringify({ query: 'cheap wireless headphones' }),
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const json = await response.json();
    expect(json.filters.sentiment).toBe('budget');
  });

  it('should detect premium sentiment', async () => {
    mockDb();
    const { POST } = await import('@/app/api/search/semantic/route');
    const response = await POST(
      new NextRequest('http://localhost:3000/api/search/semantic', {
        method: 'POST',
        body: JSON.stringify({ query: 'luxury gold watch' }),
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const json = await response.json();
    expect(json.filters.sentiment).toBe('premium');
    expect(json.filters.colors).toContain('gold');
  });
});

describe('POST /api/search/ai-advice', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('should return 400 when query is missing', async () => {
    const { POST } = await import('@/app/api/search/ai-advice/route');
    const response = await POST(
      new NextRequest('http://localhost:3000/api/search/ai-advice', {
        method: 'POST',
        body: JSON.stringify({ results: [] }),
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    expect(response.status).toBe(400);
  });

  it('should return 400 when results are missing', async () => {
    const { POST } = await import('@/app/api/search/ai-advice/route');
    const response = await POST(
      new NextRequest('http://localhost:3000/api/search/ai-advice', {
        method: 'POST',
        body: JSON.stringify({ query: 'headphones' }),
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    expect(response.status).toBe(400);
  });

  it('should return fallback advice when results are provided', async () => {
    const { POST } = await import('@/app/api/search/ai-advice/route');
    const response = await POST(
      new NextRequest('http://localhost:3000/api/search/ai-advice', {
        method: 'POST',
        body: JSON.stringify({
          query: 'headphones',
          results: [
            { id: 'p1', name: 'Sony Headphones', price: 299 },
            { id: 'p2', name: 'Bose Headphones', price: 399 },
          ],
        }),
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.advice).toBeDefined();
    expect(json.advice.message).toContain('headphones');
    expect(json.advice.reason).toBeDefined();
    expect(json.advice.products).toBeDefined();
    // Fallback returns at most 2 products
    expect(json.advice.products.length).toBeLessThanOrEqual(2);
  });

  it('should include viewed products in context', async () => {
    const { POST } = await import('@/app/api/search/ai-advice/route');
    const response = await POST(
      new NextRequest('http://localhost:3000/api/search/ai-advice', {
        method: 'POST',
        body: JSON.stringify({
          query: 'watch',
          results: [{ id: 'p1', name: 'Smart Watch', price: 500 }],
          viewedProducts: [
            { name: 'Fitness Band' },
            { name: 'Digital Watch' },
          ],
          currentCategory: 'Accessories',
        }),
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.advice.message).toBeDefined();
  });
});
