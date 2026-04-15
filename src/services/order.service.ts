/**
 * Order Service
 * Handles order processing logic, status management, and calculations
 * Designed as a standalone microservice that could be deployed as a Serverless Function
 */

import { db as prisma } from "@/lib/db";
import { inventoryService } from "./inventory.service";
import { cacheService } from "./cache.service";
import type { OrderStatus } from "@/lib/types";

export interface OrderCalculation {
  subtotal: number;
  tax: number;
  shippingCost: number;
  discount: number;
  totalAmount: number;
  currency: string;
}

export interface OrderProcessingResult {
  success: boolean;
  order?: Record<string, unknown>;
  error?: string;
  calculation?: OrderCalculation;
}

// Valid status transitions for orders
const STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: ["REFUNDED"],
  CANCELLED: [],
  REFUNDED: [],
};

class OrderService {
  private readonly TAX_RATE = 0.15; // 15% VAT
  private readonly FREE_SHIPPING_THRESHOLD = 300;
  private readonly DEFAULT_SHIPPING_COST = 30;

  /**
   * Calculate order totals including tax, shipping, and discounts
   */
  calculateOrder(
    items: { price: number; quantity: number }[],
    coupon?: { type: string; value: number; minPurchase?: number } | null
  ): OrderCalculation {
    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const tax = Math.round(subtotal * this.TAX_RATE * 100) / 100;

    const shippingCost =
      subtotal >= this.FREE_SHIPPING_THRESHOLD
        ? 0
        : this.DEFAULT_SHIPPING_COST;

    let discount = 0;
    if (coupon) {
      if (coupon.minPurchase && subtotal < coupon.minPurchase) {
        discount = 0;
      } else if (coupon.type === "PERCENTAGE") {
        discount = Math.round((subtotal * coupon.value) / 100 * 100) / 100;
      } else {
        discount = Math.min(coupon.value, subtotal);
      }
    }

    const totalAmount = Math.max(0, subtotal + tax + shippingCost - discount);

    return {
      subtotal,
      tax,
      shippingCost,
      discount,
      totalAmount,
      currency: "SAR",
    };
  }

  /**
   * Create a new order from cart items
   * Uses a database transaction for data consistency
   */
  async createOrder(params: {
    userId: string;
    items: {
      productId: string;
      quantity: number;
      price: number;
      colorId?: string;
      sizeId?: string;
    }[];
    shippingAddress: string;
    notes?: string;
    couponCode?: string;
  }): Promise<OrderProcessingResult> {
    try {
      // 1. Validate stock availability
      const stockChecks = await inventoryService.checkBatchStock(
        params.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        }))
      );

      const outOfStock = stockChecks.find((check) => !check.available);
      if (outOfStock) {
        return {
          success: false,
          error: `المنتج "${outOfStock.productId}" غير متوفر بالكمية المطلوبة. المتاح: ${outOfStock.currentStock}`,
        };
      }

      // 2. Validate coupon if provided
      let coupon = null;
      if (params.couponCode) {
        coupon = await this.validateCoupon(params.couponCode);
        if (!coupon) {
          return {
            success: false,
            error: `كوبون "${params.couponCode}" غير صالح أو منتهي الصلاحية`,
          };
        }
      }

      // 3. Calculate totals (server-side for security)
      const calculation = this.calculateOrder(
        params.items,
        coupon ? { type: coupon.discountType, value: coupon.value, minPurchase: coupon.minPurchase ?? undefined } : null
      );

      // 4. Generate order number
      const orderCount = await prisma.order.count();
      const orderNumber = `ORD-${new Date().getFullYear()}-${String(orderCount + 1).padStart(4, "0")}`;

      // 5. Create order in transaction
      const order = await prisma.$transaction(async (tx) => {
        const newOrder = await tx.order.create({
          data: {
            orderNumber,
            userId: params.userId,
            status: "PENDING",
            subtotal: calculation.subtotal,
            tax: calculation.tax,
            shippingCost: calculation.shippingCost,
            totalAmount: calculation.totalAmount,
            shippingAddress: params.shippingAddress,
            notes: params.notes,
            couponCode: params.couponCode,
          },
        });

        // Create order items
        for (const item of params.items) {
          await tx.orderItem.create({
            data: {
              orderId: newOrder.id,
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
              colorId: item.colorId || null,
              sizeId: item.sizeId || null,
            },
          });
        }

        return newOrder;
      });

      // 6. Reserve stock (outside transaction for independent failure handling)
      for (const item of params.items) {
        await inventoryService.reserveStock(item.productId, item.quantity);
      }

      // 7. Update coupon usage
      if (coupon && params.couponCode) {
        await prisma.coupon.update({
          where: { code: params.couponCode },
          data: { usedCount: { increment: 1 } },
        });
      }

      // 8. Invalidate related caches
      await cacheService.invalidate("dashboard:stats");
      await cacheService.invalidate("products:*");

      return {
        success: true,
        order: order as unknown as Record<string, unknown>,
        calculation,
      };
    } catch (error) {
      console.error("Order creation error:", error);
      return {
        success: false,
        error: "حدث خطأ أثناء إنشاء الطلب. يرجى المحاولة مرة أخرى.",
      };
    }
  }

  /**
   * Process order status transition
   */
  async transitionStatus(
    orderId: string,
    newStatus: OrderStatus
  ): Promise<OrderProcessingResult> {
    try {
      const order = await prisma.order.findUnique({ where: { id: orderId } });
      if (!order) {
        return { success: false, error: "الطلب غير موجود" };
      }

      // Validate transition
      const validTransitions = STATUS_TRANSITIONS[order.status as OrderStatus] || [];
      if (!validTransitions.includes(newStatus)) {
        return {
          success: false,
          error: `لا يمكن تغيير حالة الطلب من "${order.status}" إلى "${newStatus}"`,
        };
      }

      // Update status
      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: { status: newStatus },
      });

      // Handle side effects
      if (newStatus === "CANCELLED" || newStatus === "REFUNDED") {
        // Restore stock
        const orderItems = await prisma.orderItem.findMany({
          where: { orderId },
        });
        for (const item of orderItems) {
          await inventoryService.releaseStock(item.productId, item.quantity);
        }

        // If refunded, update payment status
        if (newStatus === "REFUNDED") {
          await prisma.payment.updateMany({
            where: { orderId },
            data: { status: "REFUNDED" },
          });
        }
      }

      // Invalidate cache
      await cacheService.invalidate("dashboard:stats");
      await cacheService.invalidate("orders:*");

      return { success: true, order: updatedOrder as unknown as Record<string, unknown> };
    } catch (error) {
      console.error("Order status transition error:", error);
      return { success: false, error: "فشل في تحديث حالة الطلب" };
    }
  }

  /**
   * Process a refund for an order
   */
  async processRefund(orderId: string, reason?: string): Promise<OrderProcessingResult> {
    // First transition to REFUNDED
    const result = await this.transitionStatus(orderId, "REFUNDED");
    if (!result.success) return result;

    // In production: initiate Stripe refund
    // const payment = await prisma.payment.findUnique({ where: { orderId } });
    // if (payment?.stripePaymentIntentId) {
    //   const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    //   await stripe.refunds.create({
    //     payment_intent: payment.stripePaymentIntentId,
    //     reason: 'requested_by_customer',
    //   });
    // }

    console.info(`Refund processed for order ${orderId}. Reason: ${reason || "Not specified"}`);

    return result;
  }

  /**
   * Validate a coupon code
   */
  private async validateCoupon(code: string) {
    const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
    if (!coupon) return null;
    if (!coupon.isActive) return null;
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) return null;
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) return null;
    return coupon;
  }
}

// Singleton instance
export const orderService = new OrderService();
