import { describe, it, expect, beforeEach } from 'vitest';
import { getProductService, getProductRepository, resetContainer } from '@/lib/container';

describe('Dependency Injection Container', () => {
  beforeEach(() => {
    resetContainer();
  });

  it('should return a product repository', () => {
    const repo = getProductRepository();
    expect(repo).toBeDefined();
  });

  it('should return a product service', () => {
    const service = getProductService();
    expect(service).toBeDefined();
  });

  it('should return the same repository instance (singleton)', () => {
    const repo1 = getProductRepository();
    const repo2 = getProductRepository();
    expect(repo1).toBe(repo2);
  });

  it('should return the same service instance (singleton)', () => {
    const service1 = getProductService();
    const service2 = getProductService();
    expect(service1).toBe(service2);
  });
});
