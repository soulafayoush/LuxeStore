import { describe, it, expect } from 'vitest';
import {
  loginSchema,
  checkoutSchema,
  contactFormSchema,
  productFiltersSchema,
  newsletterSchema,
} from '@/lib/validations';

describe('Validation Schemas', () => {
  describe('loginSchema', () => {
    it('should validate a valid login input', () => {
      const result = loginSchema.safeParse({ email: 'test@example.com', password: 'password123' });
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const result = loginSchema.safeParse({ email: 'invalid', password: 'password123' });
      expect(result.success).toBe(false);
    });

    it('should reject short password', () => {
      const result = loginSchema.safeParse({ email: 'test@example.com', password: '12345' });
      expect(result.success).toBe(false);
    });
  });

  describe('checkoutSchema', () => {
    it('should validate a valid checkout input', () => {
      const result = checkoutSchema.safeParse({
        items: [{ productId: 'p1', name: 'Test', price: 100, quantity: 1 }],
        userEmail: 'test@example.com',
        shippingAddress: '123 Test St, Riyadh, 12345',
        shippingName: 'John Doe',
        shippingPhone: '+966500000000',
      });
      expect(result.success).toBe(true);
    });

    it('should reject empty items', () => {
      const result = checkoutSchema.safeParse({
        items: [],
        userEmail: 'test@example.com',
        shippingAddress: '123 Test St',
        shippingName: 'John',
        shippingPhone: '+966500000000',
      });
      expect(result.success).toBe(false);
    });

    it('should reject negative price', () => {
      const result = checkoutSchema.safeParse({
        items: [{ productId: 'p1', name: 'Test', price: -10, quantity: 1 }],
        userEmail: 'test@example.com',
        shippingAddress: '123 Test St',
        shippingName: 'John',
        shippingPhone: '+966500000000',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('contactFormSchema', () => {
    it('should validate a valid contact form', () => {
      const result = contactFormSchema.safeParse({
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Question',
        message: 'I have a question about my order.',
      });
      expect(result.success).toBe(true);
    });

    it('should reject short message', () => {
      const result = contactFormSchema.safeParse({
        name: 'John',
        email: 'john@example.com',
        subject: 'Q',
        message: 'Hi',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('productFiltersSchema', () => {
    it('should validate with default pagination', () => {
      const result = productFiltersSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(12);
      }
    });

    it('should validate with custom filters', () => {
      const result = productFiltersSchema.safeParse({
        category: 'Audio',
        minPrice: '100',
        maxPrice: '500',
        sortBy: 'price_asc',
        page: '2',
        limit: '20',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('newsletterSchema', () => {
    it('should validate a valid email', () => {
      const result = newsletterSchema.safeParse({ email: 'test@example.com' });
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const result = newsletterSchema.safeParse({ email: 'not-an-email' });
      expect(result.success).toBe(false);
    });
  });
});
