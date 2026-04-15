import { describe, it, expect, beforeEach } from 'vitest';
import { MockProductRepository } from '@/lib/repositories/mock-product-repository';
import type { ProductFilters } from '@/types';

describe('MockProductRepository', () => {
  let repo: MockProductRepository;

  beforeEach(() => {
    repo = new MockProductRepository();
  });

  // ==================== findAll ====================
  describe('findAll', () => {
    it('should return all active products by default', async () => {
      const result = await repo.findAll();
      expect(result.products.length).toBeGreaterThan(0);
      expect(result.products.every((p) => p.isActive)).toBe(true);
      expect(result.total).toBe(result.products.length);
      expect(result.page).toBe(1);
    });

    it('should filter by category', async () => {
      const result = await repo.findAll({ category: 'Audio' });
      expect(result.products.every((p) => p.category === 'Audio')).toBe(true);
      expect(result.total).toBeGreaterThan(0);
    });

    it('should return empty for non-existent category', async () => {
      const result = await repo.findAll({ category: 'NonExistent' });
      expect(result.products).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('should filter by search query on name', async () => {
      const result = await repo.findAll({ search: 'Headphones' });
      expect(result.products.length).toBeGreaterThan(0);
      expect(
        result.products.some((p) =>
          p.name.toLowerCase().includes('headphones'),
        ),
      ).toBe(true);
    });

    it('should filter by search query on description', async () => {
      const result = await repo.findAll({ search: 'noise cancellation' });
      expect(result.products.length).toBeGreaterThan(0);
    });

    it('should filter by minPrice', async () => {
      const result = await repo.findAll({ minPrice: 500 });
      expect(result.products.every((p) => p.price >= 500)).toBe(true);
    });

    it('should filter by maxPrice', async () => {
      const result = await repo.findAll({ maxPrice: 200 });
      expect(result.products.every((p) => p.price <= 200)).toBe(true);
    });

    it('should filter by price range', async () => {
      const result = await repo.findAll({ minPrice: 100, maxPrice: 500 });
      expect(
        result.products.every((p) => p.price >= 100 && p.price <= 500),
      ).toBe(true);
    });

    it('should filter by inStock', async () => {
      const result = await repo.findAll({ inStock: true });
      expect(result.products.every((p) => p.stock > 0)).toBe(true);
    });

    it('should filter by minimum rating', async () => {
      const result = await repo.findAll({ rating: 4.8 });
      expect(result.products.every((p) => p.rating >= 4.8)).toBe(true);
    });

    it('should sort by price ascending', async () => {
      const result = await repo.findAll({ sortBy: 'price_asc' });
      for (let i = 1; i < result.products.length; i++) {
        expect(result.products[i].price).toBeGreaterThanOrEqual(
          result.products[i - 1].price,
        );
      }
    });

    it('should sort by price descending', async () => {
      const result = await repo.findAll({ sortBy: 'price_desc' });
      for (let i = 1; i < result.products.length; i++) {
        expect(result.products[i].price).toBeLessThanOrEqual(
          result.products[i - 1].price,
        );
      }
    });

    it('should sort by newest', async () => {
      const result = await repo.findAll({ sortBy: 'newest' });
      for (let i = 1; i < result.products.length; i++) {
        expect(result.products[i].createdAt.getTime()).toBeLessThanOrEqual(
          result.products[i - 1].createdAt.getTime(),
        );
      }
    });

    it('should sort by rating', async () => {
      const result = await repo.findAll({ sortBy: 'rating' });
      for (let i = 1; i < result.products.length; i++) {
        expect(result.products[i].rating).toBeLessThanOrEqual(
          result.products[i - 1].rating,
        );
      }
    });

    it('should sort by popularity (review count)', async () => {
      const result = await repo.findAll({ sortBy: 'popular' });
      for (let i = 1; i < result.products.length; i++) {
        expect(result.products[i].reviewCount).toBeLessThanOrEqual(
          result.products[i - 1].reviewCount,
        );
      }
    });

    it('should paginate results', async () => {
      const result = await repo.findAll({ page: 1, limit: 2 });
      expect(result.products.length).toBeLessThanOrEqual(2);
      expect(result.page).toBe(1);
      expect(result.totalPages).toBeGreaterThanOrEqual(1);
    });

    it('should return correct page 2', async () => {
      const limit = 2;
      const page1 = await repo.findAll({ page: 1, limit });
      const page2 = await repo.findAll({ page: 2, limit });
      if (page1.products.length > 0 && page2.products.length > 0) {
        expect(page1.products[0].id).not.toBe(page2.products[0].id);
      }
    });
  });

  // ==================== findById ====================
  describe('findById', () => {
    it('should return a product by id', async () => {
      const product = await repo.findById('p1');
      expect(product).not.toBeNull();
      expect(product!.id).toBe('p1');
    });

    it('should return null for non-existent id', async () => {
      const product = await repo.findById('nonexistent');
      expect(product).toBeNull();
    });
  });

  // ==================== findBySlug ====================
  describe('findBySlug', () => {
    it('should return a product by slug', async () => {
      const product = await repo.findBySlug('premium-wireless-headphones');
      expect(product).not.toBeNull();
      expect(product!.slug).toBe('premium-wireless-headphones');
    });

    it('should return null for non-existent slug', async () => {
      const product = await repo.findBySlug('nonexistent-slug');
      expect(product).toBeNull();
    });
  });

  // ==================== findByCategory ====================
  describe('findByCategory', () => {
    it('should return products for a category', async () => {
      const products = await repo.findByCategory('Audio');
      expect(products.length).toBeGreaterThan(0);
      expect(products.every((p) => p.category === 'Audio')).toBe(true);
    });

    it('should return empty for non-existent category', async () => {
      const products = await repo.findByCategory('NonExistent');
      expect(products).toHaveLength(0);
    });
  });

  // ==================== findFeatured ====================
  describe('findFeatured', () => {
    it('should return products with reviewCount > 100', async () => {
      const products = await repo.findFeatured();
      expect(products.length).toBeGreaterThan(0);
      expect(products.length).toBeLessThanOrEqual(6);
      expect(products.every((p) => p.reviewCount > 100)).toBe(true);
    });
  });

  // ==================== findDeals ====================
  describe('findDeals', () => {
    it('should return products with comparePrice sorted by discount', async () => {
      const products = await repo.findDeals();
      expect(products.length).toBeGreaterThan(0);
      expect(products.length).toBeLessThanOrEqual(4);
      expect(products.every((p) => p.comparePrice !== null)).toBe(true);
    });
  });

  // ==================== create ====================
  describe('create', () => {
    it('should create a new product', async () => {
      const newProduct = await repo.create({
        name: 'Test Product',
        slug: 'test-product',
        description: 'Test description',
        price: 100,
        comparePrice: null,
        category: 'Test',
        images: [],
        stock: 10,
        isActive: true,
      });
      expect(newProduct.id).toBeDefined();
      expect(newProduct.name).toBe('Test Product');
      expect(newProduct.rating).toBe(0);
      expect(newProduct.reviewCount).toBe(0);

      // Verify it can be found
      const found = await repo.findById(newProduct.id);
      expect(found).not.toBeNull();
      expect(found!.name).toBe('Test Product');
    });
  });

  // ==================== update ====================
  describe('update', () => {
    it('should update an existing product', async () => {
      const updated = await repo.update('p1', { price: 999 });
      expect(updated).not.toBeNull();
      expect(updated!.price).toBe(999);
    });

    it('should return null for non-existent product', async () => {
      const updated = await repo.update('nonexistent', { price: 999 });
      expect(updated).toBeNull();
    });

    it('should update the updatedAt timestamp', async () => {
      const before = new Date();
      await new Promise((r) => setTimeout(r, 10));
      const updated = await repo.update('p1', { price: 800 });
      expect(updated).not.toBeNull();
      expect(updated!.updatedAt.getTime()).toBeGreaterThanOrEqual(
        before.getTime(),
      );
    });
  });

  // ==================== delete ====================
  describe('delete', () => {
    it('should delete an existing product', async () => {
      const result = await repo.delete('p1');
      expect(result).toBe(true);
      // Verify it's gone
      const found = await repo.findById('p1');
      expect(found).toBeNull();
    });

    it('should return false for non-existent product', async () => {
      const result = await repo.delete('nonexistent');
      expect(result).toBe(false);
    });
  });

  // ==================== Combined operations ====================
  describe('combined operations', () => {
    it('should support create, read, update, delete cycle', async () => {
      // Create
      const created = await repo.create({
        name: 'Lifecycle Product',
        slug: 'lifecycle-product',
        description: 'Test',
        price: 50,
        comparePrice: 100,
        category: 'Test',
        images: [],
        stock: 5,
        isActive: true,
      });
      expect(created.id).toBeDefined();

      // Read
      const read = await repo.findById(created.id);
      expect(read!.name).toBe('Lifecycle Product');

      // Update
      const updated = await repo.update(created.id, { price: 75 });
      expect(updated!.price).toBe(75);

      // Delete
      const deleted = await repo.delete(created.id);
      expect(deleted).toBe(true);

      // Verify deleted
      const gone = await repo.findById(created.id);
      expect(gone).toBeNull();
    });
  });
});
