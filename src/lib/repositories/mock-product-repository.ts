/**
 * Mock product repository — returns static data for demo/development.
 * In production, this would be replaced with a PrismaProductRepository.
 */

import type { Product, ProductFilters, ProductListResponse } from '@/types';
import type { IProductRepository } from './index';

const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p1', name: 'Premium Wireless Headphones', slug: 'premium-wireless-headphones',
    description: 'Experience music the way artists intended with our flagship wireless headphones featuring advanced Active Noise Cancellation.',
    price: 549, comparePrice: 699, category: 'Audio',
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop'],
    stock: 45, rating: 4.8, reviewCount: 247, isActive: true,
    createdAt: new Date('2025-01-15'), updatedAt: new Date('2025-03-01'),
  },
  {
    id: 'p2', name: 'Smart Watch Pro Ultra', slug: 'smart-watch-pro-ultra',
    description: 'The ultimate smartwatch with health monitoring, GPS, and a stunning always-on display.',
    price: 899, comparePrice: 1200, category: 'Wearables',
    images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop'],
    stock: 32, rating: 4.7, reviewCount: 189, isActive: true,
    createdAt: new Date('2025-01-20'), updatedAt: new Date('2025-02-28'),
  },
  {
    id: 'p3', name: 'Sports Running Shoes X', slug: 'sports-running-shoes-x',
    description: 'Engineered for performance with responsive cushioning and breathable mesh upper.',
    price: 369, comparePrice: 459, category: 'Footwear',
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop'],
    stock: 78, rating: 4.6, reviewCount: 156, isActive: true,
    createdAt: new Date('2025-02-01'), updatedAt: new Date('2025-03-05'),
  },
  {
    id: 'p4', name: 'Leather Crossbody Bag', slug: 'leather-crossbody-bag',
    description: 'Premium genuine leather crossbody bag with adjustable strap and multiple compartments.',
    price: 159, comparePrice: 249, category: 'Accessories',
    images: ['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=600&fit=crop'],
    stock: 23, rating: 4.9, reviewCount: 312, isActive: true,
    createdAt: new Date('2025-01-10'), updatedAt: new Date('2025-02-15'),
  },
  {
    id: 'p5', name: 'Professional Camera Lens', slug: 'professional-camera-lens',
    description: 'Ultra-sharp 50mm f/1.4 prime lens for stunning portraits and low-light photography.',
    price: 1299, comparePrice: 1599, category: 'Photography',
    images: ['https://images.unsplash.com/photo-1617005082133-548c4dd27f35?w=600&h=600&fit=crop'],
    stock: 12, rating: 4.8, reviewCount: 98, isActive: true,
    createdAt: new Date('2025-02-10'), updatedAt: new Date('2025-03-02'),
  },
  {
    id: 'p6', name: 'Wireless Earbuds Pro', slug: 'wireless-earbuds-pro',
    description: 'True wireless earbuds with adaptive noise cancellation and spatial audio.',
    price: 249, comparePrice: 349, category: 'Audio',
    images: ['https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=600&h=600&fit=crop'],
    stock: 56, rating: 4.5, reviewCount: 421, isActive: true,
    createdAt: new Date('2025-01-05'), updatedAt: new Date('2025-02-20'),
  },
  {
    id: 'd1', name: 'Studio Headphones ANC', slug: 'studio-headphones-anc',
    description: 'Professional-grade studio headphones with active noise cancellation for music production.',
    price: 449, comparePrice: 699, category: 'Audio',
    images: ['https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=400&h=400&fit=crop'],
    stock: 19, rating: 4.8, reviewCount: 342, isActive: true,
    createdAt: new Date('2025-01-25'), updatedAt: new Date('2025-03-01'),
  },
  {
    id: 'd2', name: 'Ultra-Slim Laptop Stand', slug: 'ultra-slim-laptop-stand',
    description: 'Ergonomic aluminum laptop stand with adjustable height and cable management.',
    price: 89, comparePrice: 149, category: 'Accessories',
    images: ['https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop'],
    stock: 34, rating: 4.6, reviewCount: 178, isActive: true,
    createdAt: new Date('2025-02-05'), updatedAt: new Date('2025-02-25'),
  },
  {
    id: 'd3', name: 'Smart Home Hub Pro', slug: 'smart-home-hub-pro',
    description: 'Central smart home controller with voice assistant and multi-protocol support.',
    price: 299, comparePrice: 449, category: 'Smart Home',
    images: ['https://images.unsplash.com/photo-1558089687-f282ffcbc126?w=400&h=400&fit=crop'],
    stock: 41, rating: 4.7, reviewCount: 256, isActive: true,
    createdAt: new Date('2025-01-30'), updatedAt: new Date('2025-02-28'),
  },
  {
    id: 'd4', name: 'Mechanical Keyboard RGB', slug: 'mechanical-keyboard-rgb',
    description: 'Premium mechanical keyboard with per-key RGB lighting and hot-swappable switches.',
    price: 199, comparePrice: 329, category: 'Gaming',
    images: ['https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400&h=400&fit=crop'],
    stock: 67, rating: 4.9, reviewCount: 512, isActive: true,
    createdAt: new Date('2025-02-15'), updatedAt: new Date('2025-03-10'),
  },
];

export class MockProductRepository implements IProductRepository {
  private products: Product[];

  constructor() {
    this.products = [...MOCK_PRODUCTS];
  }

  async findAll(filters?: ProductFilters): Promise<ProductListResponse> {
    let filtered = [...this.products].filter((p) => p.isActive);

    if (filters?.category) {
      filtered = filtered.filter((p) => p.category === filters.category);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      filtered = filtered.filter(
        (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q),
      );
    }
    if (filters?.minPrice !== undefined) {
      filtered = filtered.filter((p) => p.price >= (filters.minPrice ?? 0));
    }
    if (filters?.maxPrice !== undefined) {
      filtered = filtered.filter((p) => p.price <= (filters.maxPrice ?? Infinity));
    }
    if (filters?.inStock) {
      filtered = filtered.filter((p) => p.stock > 0);
    }
    if (filters?.rating) {
      filtered = filtered.filter((p) => p.rating >= (filters.rating ?? 0));
    }

    switch (filters?.sortBy) {
      case 'price_asc': filtered.sort((a, b) => a.price - b.price); break;
      case 'price_desc': filtered.sort((a, b) => b.price - a.price); break;
      case 'newest': filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); break;
      case 'rating': filtered.sort((a, b) => b.rating - a.rating); break;
      case 'popular': filtered.sort((a, b) => b.reviewCount - a.reviewCount); break;
      default: filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }

    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 12;
    const start = (page - 1) * limit;
    const paged = filtered.slice(start, start + limit);

    return {
      products: paged,
      total: filtered.length,
      page,
      totalPages: Math.ceil(filtered.length / limit),
    };
  }

  async findById(id: string): Promise<Product | null> {
    return this.products.find((p) => p.id === id && p.isActive) ?? null;
  }

  async findBySlug(slug: string): Promise<Product | null> {
    return this.products.find((p) => p.slug === slug && p.isActive) ?? null;
  }

  async findByCategory(category: string): Promise<Product[]> {
    return this.products.filter((p) => p.category === category && p.isActive);
  }

  async findFeatured(): Promise<Product[]> {
    return this.products.filter((p) => p.reviewCount > 100).slice(0, 6);
  }

  async findDeals(): Promise<Product[]> {
    return this.products
      .filter((p) => p.comparePrice !== null)
      .sort((a, b) => {
        const discA = ((b.comparePrice ?? 0) - b.price) / (b.comparePrice ?? 1);
        const discB = ((a.comparePrice ?? 0) - a.price) / (a.comparePrice ?? 1);
        return discB - discA;
      })
      .slice(0, 4);
  }

  async create(_data: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'rating' | 'reviewCount'>): Promise<Product> {
    const product: Product = {
      ..._data,
      id: `p_${Date.now()}`,
      rating: 0,
      reviewCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.products.push(product);
    return product;
  }

  async update(id: string, data: Partial<Product>): Promise<Product | null> {
    const index = this.products.findIndex((p) => p.id === id);
    if (index === -1) return null;
    this.products[index] = { ...this.products[index], ...data, updatedAt: new Date() };
    return this.products[index];
  }

  async delete(id: string): Promise<boolean> {
    const index = this.products.findIndex((p) => p.id === id);
    if (index === -1) return false;
    this.products.splice(index, 1);
    return true;
  }
}
