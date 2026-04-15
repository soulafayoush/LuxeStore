/**
 * Product Service — business logic layer
 * Orchestrates between repositories and handles business rules
 */

import type { Product, ProductFilters, ProductListResponse } from '@/types';
import type { IProductRepository } from '@/lib/repositories';
import { apiLogger } from '@/lib/logger';

export class ProductService {
  constructor(private productRepository: IProductRepository) {}

  async getProducts(filters?: ProductFilters): Promise<ProductListResponse> {
    apiLogger.info('Fetching products', { filters: filters ?? 'none' });
    const result = await this.productRepository.findAll(filters);
    apiLogger.info(`Found ${result.total} products`, { page: result.page });
    return result;
  }

  async getProductById(id: string): Promise<Product> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new Error(`Product with id "${id}" not found`);
    }
    return product;
  }

  async getFeaturedProducts(): Promise<Product[]> {
    return this.productRepository.findFeatured();
  }

  async getDealProducts(): Promise<Product[]> {
    return this.productRepository.findDeals();
  }

  async searchProducts(query: string): Promise<ProductListResponse> {
    if (!query || query.trim().length < 2) {
      return { products: [], total: 0, page: 1, totalPages: 0 };
    }
    return this.productRepository.findAll({ search: query, limit: 20 });
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return this.productRepository.findByCategory(category);
  }
}
