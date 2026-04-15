/**
 * Repository interfaces define the data access contracts.
 * Implementations can swap between Prisma, mock data, or any other data source.
 */

import type { Product, ProductFilters, ProductListResponse, Order, OrderStatus } from '@/types';

/**
 * Product Repository — handles all product data operations
 */
export interface IProductRepository {
  findAll(filters?: ProductFilters): Promise<ProductListResponse>;
  findById(id: string): Promise<Product | null>;
  findBySlug(slug: string): Promise<Product | null>;
  findByCategory(category: string): Promise<Product[]>;
  findFeatured(): Promise<Product[]>;
  findDeals(): Promise<Product[]>;
  create(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'rating' | 'reviewCount'>): Promise<Product>;
  update(id: string, data: Partial<Product>): Promise<Product | null>;
  delete(id: string): Promise<boolean>;
}

/**
 * Order Repository — handles all order data operations
 */
export interface IOrderRepository {
  findAll(params?: { page?: number; limit?: number; status?: OrderStatus }): Promise<ProductListResponse>;
  findById(id: string): Promise<Order | null>;
  findByOrderNumber(orderNumber: string): Promise<Order | null>;
  create(data: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order>;
  updateStatus(id: string, status: OrderStatus): Promise<Order | null>;
  findByUserEmail(email: string): Promise<Order[]>;
}
