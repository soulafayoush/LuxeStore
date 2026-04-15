/**
 * Centralized validation schemas using Zod
 * All API input validation should use these schemas
 */

import { z } from 'zod';

// ==================== Auth ====================
export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// ==================== Product ====================
export const productFiltersSchema = z.object({
  category: z.string().optional(),
  search: z.string().min(2).max(200).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  rating: z.coerce.number().min(1).max(5).optional(),
  sortBy: z.enum(['price_asc', 'price_desc', 'newest', 'rating', 'popular']).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(12),
});

// ==================== Cart ====================
export const cartItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  name: z.string().min(1, 'Product name is required'),
  price: z.number().positive('Price must be positive'),
  comparePrice: z.number().min(0).nullable().optional(),
  image: z.string().url('Invalid image URL'),
  category: z.string().min(1, 'Category is required'),
});

export const updateQuantitySchema = z.object({
  quantity: z.number().int().min(1).max(99, 'Quantity must be between 1 and 99'),
});

// ==================== Checkout ====================
export const checkoutItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  name: z.string().min(1, 'Product name is required'),
  price: z.number().positive('Price must be a positive number'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  image: z.string().url('Invalid image URL').optional(),
});

export const shippingAddressSchema = z.object({
  fullName: z.string().min(2, 'Full name is required').max(100, 'Name is too long'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(7, 'Phone number is too short').max(20, 'Phone number is too long'),
  address: z.string().min(5, 'Please enter your full address').max(300),
  city: z.string().min(2, 'City is required'),
  postalCode: z.string().min(4, 'Invalid postal code').max(10),
  country: z.string().min(2).default('Saudi Arabia'),
});

export const checkoutSchema = z.object({
  items: z.array(checkoutItemSchema).min(1, 'Cart cannot be empty'),
  userEmail: z.string().email('Please enter a valid email address'),
  shippingAddress: z.string().min(5, 'Shipping address is required'),
  shippingName: shippingAddressSchema.shape.fullName,
  shippingPhone: shippingAddressSchema.shape.phone,
  couponCode: z.string().uppercase().optional(),
});

// ==================== Contact ====================
export const contactFormSchema = z.object({
  name: z.string().min(2, 'Name is required').max(100),
  email: z.string().email('Please enter a valid email'),
  subject: z.string().min(3, 'Subject is required').max(200),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000),
});

// ==================== Order Tracking ====================
export const orderTrackingSchema = z.object({
  orderNumber: z.string().min(1, 'Order number is required'),
  email: z.string().email('Please enter a valid email').optional(),
});

// ==================== Coupon ====================
export const couponSchema = z.object({
  code: z.string().uppercase().min(3, 'Coupon code is too short').max(20),
});

// ==================== Newsletter ====================
export const newsletterSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

// ==================== Type Inference Helpers ====================
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type ContactFormInput = z.infer<typeof contactFormSchema>;
export type CartItemInput = z.infer<typeof cartItemSchema>;
export type ProductFiltersInput = z.infer<typeof productFiltersSchema>;
