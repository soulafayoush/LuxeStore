// Shared TypeScript types for the e-commerce platform

export type UserRole = "ADMIN" | "USER";

export type OrderStatus = "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "REFUNDED";

export type PaymentStatus = "PENDING" | "SUCCEEDED" | "FAILED" | "REFUNDED";

export type DiscountType = "PERCENTAGE" | "FIXED";

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  avatar?: string | null;
  phone?: string | null;
  address?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  nameEn?: string | null;
  slug: string;
  image?: string | null;
  parentId?: string | null;
  createdAt: string;
  updatedAt: string;
  parent?: Category | null;
  children?: Category[];
  products?: Product[];
}

export interface Color {
  id: string;
  name: string;
  nameEn?: string | null;
  hexCode: string;
}

export interface Size {
  id: string;
  name: string;
  value: string;
  label?: string | null;
}

export interface Product {
  id: string;
  name: string;
  nameEn?: string | null;
  description?: string | null;
  descriptionEn?: string | null;
  price: number;
  comparePrice?: number | null;
  sku: string;
  isActive: boolean;
  isFeatured: boolean;
  images: string;
  stock: number;
  categoryId?: string | null;
  category?: Category | null;
  colors?: ProductColor[];
  sizes?: ProductSize[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductColor {
  productId: string;
  colorId: string;
  color?: Color;
}

export interface ProductSize {
  productId: string;
  sizeId: string;
  size?: Size;
}

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  colorId?: string | null;
  sizeId?: string | null;
  product?: Product;
  color?: Color | null;
  size?: Size | null;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  status: OrderStatus;
  totalAmount: number;
  subtotal: number;
  tax: number;
  shippingCost: number;
  shippingAddress?: string | null;
  notes?: string | null;
  couponCode?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: User;
  orderItems?: OrderItem[];
  payment?: Payment;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  colorId?: string | null;
  sizeId?: string | null;
  order?: Order;
  product?: Product;
  color?: Color | null;
  size?: Size | null;
}

export interface Payment {
  id: string;
  orderId: string;
  stripePaymentIntentId?: string | null;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method?: string | null;
  paidAt?: string | null;
  createdAt: string;
  updatedAt: string;
  order?: Order;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: DiscountType;
  value: number;
  minPurchase?: number | null;
  maxUses?: number | null;
  usedCount: number;
  isActive: boolean;
  expiresAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: User;
  product?: Product;
}

export type AdminPage = "dashboard" | "products" | "orders" | "categories" | "customers" | "settings";

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  revenueChange: number;
  ordersChange: number;
  productsChange: number;
  customersChange: number;
}
