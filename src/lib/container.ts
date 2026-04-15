/**
 * Simple Dependency Injection Container
 *
 * In production, use a proper DI library (e.g., tsyringe, InversifyJS, Awilix).
 * This demonstrates the pattern for clean architecture separation.
 */

import type { IProductRepository } from './repositories';
import { MockProductRepository } from './repositories/mock-product-repository';
import { ProductService } from './services/product-service';

// ==================== Repositories ====================
let _productRepo: IProductRepository | null = null;

export function getProductRepository(): IProductRepository {
  if (!_productRepo) {
    // Use mock repo in demo/development; replace with PrismaProductRepository in production
    _productRepo = new MockProductRepository();
  }
  return _productRepo;
}

// ==================== Services ====================
let _productService: ProductService | null = null;

export function getProductService(): ProductService {
  if (!_productService) {
    _productService = new ProductService(getProductRepository());
  }
  return _productService;
}

// ==================== Reset (for testing) ====================
export function resetContainer(): void {
  _productRepo = null;
  _productService = null;
}
