/**
 * Inventory Service
 * Manages product stock operations with reservation and release patterns
 * Designed as a standalone microservice that could be deployed as a Serverless Function
 */

import { db as prisma } from "@/lib/db";

export interface StockCheckResult {
  available: boolean;
  currentStock: number;
  requested: number;
  productId: string;
}

export interface StockReservationResult {
  success: boolean;
  reserved: number;
  remainingStock: number;
  error?: string;
}

class InventoryService {
  private LOW_STOCK_THRESHOLD = 10;
  private OUT_OF_STOCK_THRESHOLD = 0;

  /**
   * Check if enough stock is available for a product
   */
  async checkStock(productId: string, requestedQuantity: number): Promise<StockCheckResult> {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, stock: true, isActive: true },
    });

    if (!product) {
      throw new Error(`Product not found: ${productId}`);
    }

    if (!product.isActive) {
      return {
        available: false,
        currentStock: product.stock,
        requested: requestedQuantity,
        productId,
      };
    }

    return {
      available: product.stock >= requestedQuantity,
      currentStock: product.stock,
      requested: requestedQuantity,
      productId,
    };
  }

  /**
   * Check stock for multiple products at once (batch)
   */
  async checkBatchStock(
    items: { productId: string; quantity: number }[]
  ): Promise<StockCheckResult[]> {
    const results = await Promise.all(
      items.map((item) => this.checkStock(item.productId, item.quantity))
    );
    return results;
  }

  /**
   * Reserve stock for an order (reduce available stock)
   * Uses atomic increment/decrement to prevent race conditions
   */
  async reserveStock(
    productId: string,
    quantity: number
  ): Promise<StockReservationResult> {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, stock: true },
    });

    if (!product) {
      return { success: false, reserved: 0, remainingStock: 0, error: "المنتج غير موجود" };
    }

    if (product.stock < quantity) {
      return {
        success: false,
        reserved: 0,
        remainingStock: product.stock,
        error: `المخزون غير كافٍ. المتاح: ${product.stock}، المطلوب: ${quantity}`,
      };
    }

    // Atomic stock decrement
    const updated = await prisma.product.update({
      where: { id: productId },
      data: { stock: { decrement: quantity } },
      select: { stock: true },
    });

    // Check for low stock alerts
    if (updated.stock <= this.LOW_STOCK_THRESHOLD) {
      await this.alertLowStock(productId, updated.stock);
    }

    return {
      success: true,
      reserved: quantity,
      remainingStock: updated.stock,
    };
  }

  /**
   * Release reserved stock (increase available stock)
   * Used when an order is cancelled or refunded
   */
  async releaseStock(productId: string, quantity: number): Promise<void> {
    await prisma.product.update({
      where: { id: productId },
      data: { stock: { increment: quantity } },
    });
  }

  /**
   * Update stock level directly (admin action)
   */
  async updateStock(productId: string, newStock: number): Promise<number> {
    const product = await prisma.product.update({
      where: { id: productId },
      data: { stock: newStock },
      select: { stock: true },
    });

    if (product.stock <= this.LOW_STOCK_THRESHOLD) {
      await this.alertLowStock(productId, product.stock);
    }

    return product.stock;
  }

  /**
   * Get all products with low stock
   */
  async getLowStockProducts(): Promise<
    { productId: string; productName: string; stock: number }[]
  > {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        stock: { lte: this.LOW_STOCK_THRESHOLD },
      },
      select: { id: true, name: true, stock: true },
      orderBy: { stock: "asc" },
    });

    return products.map((p) => ({
      productId: p.id,
      productName: p.name,
      stock: p.stock,
    }));
  }

  /**
   * Get out-of-stock products
   */
  async getOutOfStockProducts(): Promise<
    { productId: string; productName: string }[]
  > {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        stock: this.OUT_OF_STOCK_THRESHOLD,
      },
      select: { id: true, name: true },
    });

    return products.map((p) => ({
      productId: p.id,
      productName: p.name,
    }));
  }

  /**
   * Send low stock alert notification
   */
  private async alertLowStock(productId: string, stock: number): Promise<void> {
    console.warn(`LOW STOCK ALERT: Product ${productId} has only ${stock} units remaining`);
    // In production: send email, SMS, or push notification to admin
    // await notificationService.send({
    //   type: 'LOW_STOCK',
    //   productId,
    //   stock,
    //   message: `تنبيه: المنتج ${productId} لديه ${stock} وحدات فقط في المخزون`,
    // });
  }
}

// Singleton instance for use across the application
export const inventoryService = new InventoryService();
