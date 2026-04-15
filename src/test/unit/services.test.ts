import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CacheService } from '@/services/cache.service';

// Mock db at top level for InventoryService tests
vi.mock('@/lib/db', () => ({
  db: {
    product: {
      findUnique: vi.fn(),
      update: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

// ==================== CacheService Tests ====================
describe('CacheService', () => {
  let cache: CacheService;

  beforeEach(() => {
    cache = new CacheService();
  });

  it('should set and get a value', () => {
    cache.set('key1', 'value1');
    expect(cache.get('key1')).toBe('value1');
  });

  it('should return null for non-existent key', () => {
    expect(cache.get('nonexistent')).toBeNull();
  });

  it('should expire entries after TTL', () => {
    vi.useFakeTimers();
    cache.set('key1', 'value1', 1000);
    expect(cache.get('key1')).toBe('value1');
    vi.advanceTimersByTime(1500);
    expect(cache.get('key1')).toBeNull();
    vi.useRealTimers();
  });

  it('should delete a key', () => {
    cache.set('key1', 'value1');
    expect(cache.delete('key1')).toBe(true);
    expect(cache.get('key1')).toBeNull();
  });

  it('should return false when deleting non-existent key', () => {
    expect(cache.delete('nonexistent')).toBe(false);
  });

  it('should invalidate keys matching a glob pattern', () => {
    cache.set('products:1', 'p1');
    cache.set('products:2', 'p2');
    cache.set('orders:1', 'o1');
    const deleted = cache.invalidate('products:*');
    expect(deleted).toBe(2);
    expect(cache.get('products:1')).toBeNull();
    expect(cache.get('products:2')).toBeNull();
    expect(cache.get('orders:1')).toBe('o1');
  });

  it('should check if key exists', () => {
    cache.set('key1', 'value1');
    expect(cache.has('key1')).toBe(true);
    expect(cache.has('nonexistent')).toBe(false);
  });

  it('should return false for has() on expired key', () => {
    vi.useFakeTimers();
    cache.set('key1', 'value1', 1000);
    vi.advanceTimersByTime(1500);
    expect(cache.has('key1')).toBe(false);
    vi.useRealTimers();
  });

  it('should return TTL for a key', () => {
    cache.set('key1', 'value1', 10000);
    const ttl = cache.ttl('key1');
    expect(ttl).toBeGreaterThan(9000);
    expect(ttl).toBeLessThanOrEqual(10000);
  });

  it('should return -2 for TTL of non-existent key', () => {
    expect(cache.ttl('nonexistent')).toBe(-2);
  });

  it('should return -1 for TTL of expired key', () => {
    vi.useFakeTimers();
    cache.set('key1', 'value1', 500);
    vi.advanceTimersByTime(1000);
    expect(cache.ttl('key1')).toBe(-1);
    vi.useRealTimers();
  });

  it('should clear all entries', () => {
    cache.set('key1', 'value1');
    cache.set('key2', 'value2');
    cache.clear();
    expect(cache.get('key1')).toBeNull();
    expect(cache.get('key2')).toBeNull();
  });

  it('should clean up expired entries', () => {
    vi.useFakeTimers();
    cache.set('key1', 'value1', 200);
    cache.set('key2', 'value2', 5000);
    vi.advanceTimersByTime(500);
    const cleaned = cache.cleanup();
    expect(cleaned).toBe(1);
    expect(cache.get('key1')).toBeNull();
    expect(cache.get('key2')).toBe('value2');
    vi.useRealTimers();
  });

  it('should return all keys', () => {
    cache.set('key1', 'value1');
    cache.set('key2', 'value2');
    const keys = cache.keys();
    expect(keys).toContain('key1');
    expect(keys).toContain('key2');
    expect(keys.length).toBe(2);
  });

  it('should track hits and misses in stats', () => {
    cache.set('key1', 'value1');
    cache.get('key1'); // hit
    cache.get('key1'); // hit
    cache.get('nonexistent'); // miss
    const stats = cache.getStats();
    expect(stats.hits).toBe(2);
    expect(stats.misses).toBe(1);
    expect(stats.hitRate).toBeCloseTo(66.67);
  });

  it('should handle getOrSet pattern', async () => {
    const factory = vi.fn().mockResolvedValue('computed-value');
    const val1 = await cache.getOrSet('key1', factory);
    expect(val1).toBe('computed-value');
    expect(factory).toHaveBeenCalledTimes(1);
    const val2 = await cache.getOrSet('key1', factory);
    expect(val2).toBe('computed-value');
    expect(factory).toHaveBeenCalledTimes(1);
  });

  it('should allow setting default TTL', () => {
    cache.setDefaultTTL(10000);
    cache.set('key1', 'value1');
    expect(cache.ttl('key1')).toBeGreaterThan(9000);
  });
});

// ==================== OrderService Tests ====================
// calculateOrder is a pure method — no DB calls
describe('OrderService - calculateOrder', () => {
  let orderService: ReturnType<typeof import('@/services/order.service').orderService> extends InstanceType<any>
    ? ReturnType<typeof import('@/services/order.service').orderService>
    : never;

  beforeEach(async () => {
    const mod = await import('@/services/order.service');
    orderService = mod.orderService as any;
  });

  it('should calculate order without coupon', () => {
    const result = orderService.calculateOrder([{ price: 100, quantity: 2 }]);
    expect(result.subtotal).toBe(200);
    expect(result.tax).toBe(30);
    expect(result.shippingCost).toBe(30);
    expect(result.discount).toBe(0);
    expect(result.totalAmount).toBe(260);
    expect(result.currency).toBe('SAR');
  });

  it('should give free shipping above threshold', () => {
    const result = orderService.calculateOrder([{ price: 500, quantity: 1 }]);
    expect(result.subtotal).toBe(500);
    expect(result.shippingCost).toBe(0);
    expect(result.totalAmount).toBe(575);
  });

  it('should apply percentage coupon discount', () => {
    const result = orderService.calculateOrder(
      [{ price: 100, quantity: 2 }],
      { type: 'PERCENTAGE', value: 20 },
    );
    expect(result.subtotal).toBe(200);
    expect(result.discount).toBe(40);
    expect(result.totalAmount).toBe(220);
  });

  it('should apply fixed coupon discount', () => {
    const result = orderService.calculateOrder(
      [{ price: 100, quantity: 2 }],
      { type: 'FIXED', value: 50 },
    );
    expect(result.discount).toBe(50);
    expect(result.totalAmount).toBe(210);
  });

  it('should cap fixed discount at subtotal', () => {
    const result = orderService.calculateOrder(
      [{ price: 100, quantity: 1 }],
      { type: 'FIXED', value: 200 },
    );
    expect(result.discount).toBe(100);
    expect(result.totalAmount).toBe(45);
  });

  it('should reject percentage coupon below minPurchase', () => {
    const result = orderService.calculateOrder(
      [{ price: 50, quantity: 1 }],
      { type: 'PERCENTAGE', value: 20, minPurchase: 100 },
    );
    expect(result.discount).toBe(0);
  });

  it('should allow percentage coupon when subtotal meets minPurchase', () => {
    const result = orderService.calculateOrder(
      [{ price: 100, quantity: 1 }],
      { type: 'PERCENTAGE', value: 20, minPurchase: 100 },
    );
    expect(result.discount).toBe(20);
  });

  it('should handle empty items', () => {
    const result = orderService.calculateOrder([]);
    expect(result.subtotal).toBe(0);
    expect(result.tax).toBe(0);
    // Shipping cost is 30 (default) since subtotal (0) < FREE_SHIPPING_THRESHOLD (300)
    expect(result.shippingCost).toBe(30);
    expect(result.totalAmount).toBe(30); // 0 + 0 + 30 - 0
  });

  it('should round tax to 2 decimal places', () => {
    const result = orderService.calculateOrder([{ price: 33, quantity: 3 }]);
    expect(result.tax).toBe(14.85);
  });

  it('should never return negative totalAmount', () => {
    const result = orderService.calculateOrder(
      [{ price: 10, quantity: 1 }],
      { type: 'FIXED', value: 500 },
    );
    expect(result.totalAmount).toBeGreaterThanOrEqual(0);
  });
});

// ==================== InventoryService Tests ====================
describe('InventoryService', () => {
  it('should check stock availability', async () => {
    const { inventoryService } = await import('@/services/inventory.service');
    const { db } = await import('@/lib/db');
    vi.mocked(db.product.findUnique).mockResolvedValue({
      id: 'p1', stock: 10, isActive: true,
    } as any);

    const result = await inventoryService.checkStock('p1', 5);
    expect(result.available).toBe(true);
    expect(result.currentStock).toBe(10);
    expect(result.requested).toBe(5);
  });

  it('should return unavailable when stock insufficient', async () => {
    const { inventoryService } = await import('@/services/inventory.service');
    const { db } = await import('@/lib/db');
    vi.mocked(db.product.findUnique).mockResolvedValue({
      id: 'p1', stock: 3, isActive: true,
    } as any);

    const result = await inventoryService.checkStock('p1', 5);
    expect(result.available).toBe(false);
    expect(result.currentStock).toBe(3);
  });

  it('should return unavailable for inactive product', async () => {
    const { inventoryService } = await import('@/services/inventory.service');
    const { db } = await import('@/lib/db');
    vi.mocked(db.product.findUnique).mockResolvedValue({
      id: 'p1', stock: 100, isActive: false,
    } as any);

    const result = await inventoryService.checkStock('p1', 1);
    expect(result.available).toBe(false);
  });

  it('should throw for non-existent product', async () => {
    const { inventoryService } = await import('@/services/inventory.service');
    const { db } = await import('@/lib/db');
    vi.mocked(db.product.findUnique).mockResolvedValue(null);

    await expect(inventoryService.checkStock('nonexistent', 1)).rejects.toThrow(
      'Product not found',
    );
  });

  it('should check batch stock', async () => {
    const { inventoryService } = await import('@/services/inventory.service');
    const { db } = await import('@/lib/db');
    vi.mocked(db.product.findUnique).mockResolvedValue({
      id: 'p1', stock: 10, isActive: true,
    } as any);

    const results = await inventoryService.checkBatchStock([
      { productId: 'p1', quantity: 5 },
      { productId: 'p1', quantity: 2 },
    ]);
    expect(results).toHaveLength(2);
    expect(results[0].available).toBe(true);
    expect(results[1].available).toBe(true);
  });

  it('should reserve stock successfully', async () => {
    const { inventoryService } = await import('@/services/inventory.service');
    const { db } = await import('@/lib/db');
    vi.mocked(db.product.findUnique).mockResolvedValue({
      id: 'p1', stock: 10, isActive: true,
    } as any);
    vi.mocked(db.product.update).mockResolvedValue({ stock: 7 } as any);

    const result = await inventoryService.reserveStock('p1', 3);
    expect(result.success).toBe(true);
    expect(result.reserved).toBe(3);
    expect(result.remainingStock).toBe(7);
  });

  it('should fail to reserve when stock insufficient', async () => {
    const { inventoryService } = await import('@/services/inventory.service');
    const { db } = await import('@/lib/db');
    vi.mocked(db.product.findUnique).mockResolvedValue({
      id: 'p1', stock: 2, isActive: true,
    } as any);

    const result = await inventoryService.reserveStock('p1', 5);
    expect(result.success).toBe(false);
    expect(result.reserved).toBe(0);
    expect(result.error).toContain('المخزون غير كافٍ');
  });

  it('should fail to reserve non-existent product', async () => {
    const { inventoryService } = await import('@/services/inventory.service');
    const { db } = await import('@/lib/db');
    vi.mocked(db.product.findUnique).mockResolvedValue(null);

    const result = await inventoryService.reserveStock('nonexistent', 1);
    expect(result.success).toBe(false);
    expect(result.error).toContain('غير موجود');
  });
});
