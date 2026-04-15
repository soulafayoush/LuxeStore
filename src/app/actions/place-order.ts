'use server';

import { z } from 'zod';
import { db } from '@/lib/db';

// =============================================================================
// Zod Validation Schemas
// =============================================================================

const OrderItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().min(1, 'Minimum quantity is 1').max(99, 'Maximum quantity is 99'),
  colorId: z.string().optional(),
  sizeId: z.string().optional(),
});

const PlaceOrderSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  items: z.array(OrderItemSchema).min(1, 'At least one item is required'),
  shippingAddress: z.string().min(5, 'Shipping address must be at least 5 characters'),
  couponCode: z.string().optional(),
});

// =============================================================================
// Type Definitions
// =============================================================================

type PlaceOrderInput = z.infer<typeof PlaceOrderSchema>;

interface PlaceOrderSuccess {
  success: true;
  order: {
    id: string;
    orderNumber: string;
    status: string;
    totalAmount: number;
  };
}

interface PlaceOrderError {
  success: false;
  errors: string[];
}

type PlaceOrderResult = PlaceOrderSuccess | PlaceOrderError;

// =============================================================================
// Constants
// =============================================================================

const TAX_RATE = 0.15; // 15% VAT
const FREE_SHIPPING_THRESHOLD = 300; // SAR
const SHIPPING_COST = 30; // SAR

// =============================================================================
// Server Action: placeOrder
// =============================================================================

export async function placeOrder(formData: PlaceOrderInput): Promise<PlaceOrderResult> {
  // Step 1: Validate input with Zod
  const validation = PlaceOrderSchema.safeParse(formData);

  if (!validation.success) {
    const errors = validation.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
    return { success: false, errors };
  }

  const { userId, items, shippingAddress, couponCode } = validation.data;

  // Step 2: Execute all DB operations in a single interactive transaction
  try {
    const result = await db.$transaction(async (tx) => {
      // (a) Fetch all products and verify they exist
      const productIds = items.map((item) => item.productId);
      const products = await tx.product.findMany({
        where: { id: { in: productIds } },
      });

      // Verify all products were found
      if (products.length !== productIds.length) {
        const foundIds = products.map((p) => p.id);
        const missingIds = productIds.filter((id) => !foundIds.includes(id));
        throw new Error(`Products not found: ${missingIds.join(', ')}`);
      }

      // (b) Verify stock availability for all items
      const productMap = new Map(products.map((p) => [p.id, p]));
      for (const item of items) {
        const product = productMap.get(item.productId);
        if (!product) {
          throw new Error(`Product not found: ${item.productId}`);
        }
        if (product.stock < item.quantity) {
          throw new Error(
            `Insufficient stock for "${product.nameEn || product.name}". Available: ${product.stock}, Requested: ${item.quantity}`
          );
        }
      }

      // (c) Calculate subtotal from DB prices (not client-provided!)
      let subtotal = 0;
      const itemPriceMap = new Map<
        string,
        { unitPrice: number; quantity: number; total: number }
      >();

      for (const item of items) {
        const product = productMap.get(item.productId)!;
        const unitPrice = product.price;
        const itemTotal = unitPrice * item.quantity;
        subtotal += itemTotal;
        itemPriceMap.set(item.productId, {
          unitPrice,
          quantity: item.quantity,
          total: itemTotal,
        });
      }

      // (d) Calculate tax and shipping
      const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
      const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
      const totalAmount = Math.round((subtotal + tax + shipping) * 100) / 100;

      // Note: Coupon discount is not applied here for simplicity,
      // but couponCode is stored on the order for reference.

      // (e) Generate unique order number: ORD-{YEAR}-{SEQUENCE}
      const year = new Date().getFullYear();
      const lastOrder = await tx.order.findFirst({
        where: {
          orderNumber: { startsWith: `ORD-${year}` },
        },
        orderBy: { createdAt: 'desc' },
        select: { orderNumber: true },
      });

      let sequence = 1;
      if (lastOrder) {
        const parts = lastOrder.orderNumber.split('-');
        sequence = parseInt(parts[parts.length - 1], 10) + 1;
      }
      const orderNumber = `ORD-${year}-${String(sequence).padStart(4, '0')}`;

      // (f) Create the Order record
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId,
          status: 'PENDING',
          totalAmount,
          subtotal,
          tax,
          shippingCost: shipping,
          shippingAddress,
          couponCode: couponCode || null,
        },
      });

      // (g) Create OrderItem records for each item
      for (const item of items) {
        const priceInfo = itemPriceMap.get(item.productId)!;
        await tx.orderItem.create({
          data: {
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            price: priceInfo.unitPrice,
            colorId: item.colorId || null,
            sizeId: item.sizeId || null,
          },
        });
      }

      // (h) Decrement stock for each product atomically
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        totalAmount: order.totalAmount,
      };
    });

    return { success: true, order: result };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { success: false, errors: [message] };
  }
}
