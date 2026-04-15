/**
 * Core domain types for LUXE Store
 * These types represent the business domain and are framework-agnostic
 */

// ==================== Product ====================
export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice: number | null;
  category: string;
  images: string[];
  stock: number;
  rating: number;
  reviewCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  inStock?: boolean;
  search?: string;
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'rating' | 'popular';
  page?: number;
  limit?: number;
}

export interface ProductListResponse {
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
}

// ==================== Order ====================
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  subtotal: number;
  tax: number;
  shippingCost: number;
  discount: number;
  totalAmount: number;
  status: OrderStatus;
  couponCode: string | null;
  paymentMethod: 'stripe' | 'cod' | 'demo';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  userId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ==================== Cart ====================
export interface CartItem {
  id: string;
  name: string;
  price: number;
  comparePrice: number | null;
  image: string;
  quantity: number;
  category: string;
}

// ==================== User ====================
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'customer';
  isActive: boolean;
  createdAt: Date;
}

// ==================== Coupon ====================
export interface Coupon {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minPurchase: number;
  maxUses: number;
  usedCount: number;
  isActive: boolean;
  expiresAt: string;
}

// ==================== API Response ====================
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    statusCode: number;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

// ==================== Pagination ====================
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
