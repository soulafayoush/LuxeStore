'use server';

import { z } from 'zod';
import { db } from '@/lib/db';
import { revalidateTag } from 'next/cache';

// =============================================================================
// Zod Validation Schemas
// =============================================================================

const RunCampaignSchema = z.object({
  discountPercentage: z
    .number()
    .min(5, 'Minimum discount is 5%')
    .max(50, 'Maximum discount is 50%')
    .default(20),
  daysSinceLastSale: z.number().min(1, 'Minimum 1 day').max(90, 'Maximum 90 days').default(30),
  minPrice: z.number().min(0).default(0),
  sendEmails: z.boolean().default(true),
});

type RunCampaignInput = z.infer<typeof RunCampaignSchema>;

// =============================================================================
// Type Definitions
// =============================================================================

interface CampaignResult {
  success: boolean;
  report: {
    productsAnalyzed: number;
    productsDiscounted: number;
    totalDiscountApplied: number;
    emailsSent: number;
    emailsFailed: number;
    products: CampaignProduct[];
  };
  errors?: string[];
}

interface CampaignProduct {
  id: string;
  name: string;
  sku: string;
  oldPrice: number;
  newPrice: number;
  discount: number;
  lastSoldDaysAgo: number;
}

interface EligibleCustomer {
  id: string;
  email: string;
  name: string | null;
  matchingCategoryIds: string[];
}

// =============================================================================
// Server Action: runMarketingCampaign
// =============================================================================

export async function runMarketingCampaign(
  input: RunCampaignInput
): Promise<CampaignResult> {
  // Step 1: Validate input with Zod
  const validation = RunCampaignSchema.safeParse(input);

  if (!validation.success) {
    const errors = validation.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
    return {
      success: false,
      report: {
        productsAnalyzed: 0,
        productsDiscounted: 0,
        totalDiscountApplied: 0,
        emailsSent: 0,
        emailsFailed: 0,
        products: [],
      },
      errors,
    };
  }

  const { discountPercentage, daysSinceLastSale, minPrice, sendEmails } = validation.data;

  try {
    // Step 2: Analyze — find products with low stock turnover (no sales in X days)
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysSinceLastSale);

    // Find products that have no completed orders since the cutoff date
    // and have a price >= minPrice
    const productsWithSales = await db.orderItem.findMany({
      where: {
        order: {
          status: { in: ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'] },
          createdAt: { gte: cutoffDate },
        },
      },
      select: { productId: true },
      distinct: ['productId'],
    });

    const soldProductIds = new Set(productsWithSales.map((item) => item.productId));

    // Find eligible products: active, not sold recently, price >= minPrice
    const eligibleProducts = await db.product.findMany({
      where: {
        isActive: true,
        price: { gte: minPrice },
        id: { not: { in: Array.from(soldProductIds) } },
        stock: { gt: 0 },
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (eligibleProducts.length === 0) {
      return {
        success: true,
        report: {
          productsAnalyzed: productsWithSales.length + eligibleProducts.length,
          productsDiscounted: 0,
          totalDiscountApplied: 0,
          emailsSent: 0,
          emailsFailed: 0,
          products: [],
        },
      };
    }

    // Step 3: Execute — apply discounts in a transaction
    const discountedProducts: CampaignProduct[] = [];

    await db.$transaction(async (tx) => {
      for (const product of eligibleProducts) {
        const discountAmount = Math.round(product.price * (discountPercentage / 100) * 100) / 100;
        const newPrice = Math.round((product.price - discountAmount) * 100) / 100;

        // Update product price
        await tx.product.update({
          where: { id: product.id },
          data: {
            comparePrice: product.comparePrice || product.price,
            price: newPrice,
          },
        });

        discountedProducts.push({
          id: product.id,
          name: product.nameEn || product.name,
          sku: product.sku,
          oldPrice: product.price,
          newPrice,
          discount: discountPercentage,
          lastSoldDaysAgo: daysSinceLastSale,
        });
      }
    });

    // Step 4: Communication — find customers who bought similar products
    let emailsSent = 0;
    let emailsFailed = 0;

    if (sendEmails && discountedProducts.length > 0) {
      // Get unique category IDs from discounted products
      const categoryIds = [
        ...new Set(
          eligibleProducts
            .filter((p) => p.categoryId)
            .map((p) => p.categoryId!)
        ),
      ];

      // Find customers who previously bought products in these categories
      const pastOrderItems = await db.orderItem.findMany({
        where: {
          product: { categoryId: { in: categoryIds } },
          order: {
            status: { in: ['PAID', 'DELIVERED'] },
          },
        },
        select: {
          order: { select: { userId: true } },
          product: { select: { categoryId: true } },
        },
        distinct: ['order', 'userId'],
      });

      // Group customer IDs by category for targeted emails
      const customerCategoryMap = new Map<string, Set<string>>();
      for (const item of pastOrderItems) {
        const userId = item.order.userId;
        const catId = item.product.categoryId;
        if (catId) {
          if (!customerCategoryMap.has(userId)) {
            customerCategoryMap.set(userId, new Set());
          }
          customerCategoryMap.get(userId)!.add(catId);
        }
      }

      // Fetch customer details
      const customerIds = Array.from(customerCategoryMap.keys());
      const customers = await db.user.findMany({
        where: { id: { in: customerIds } },
        select: { id: true, email: true, name: true },
      });

      // Send targeted emails (simulated for demo)
      const emailPromises = customers.map(async (customer) => {
        const matchingCategoryIds = Array.from(
          customerCategoryMap.get(customer.id) || new Set()
        );

        // Find relevant discounted products for this customer
        const relevantProducts = discountedProducts.filter((p) => {
          const eligibleProduct = eligibleProducts.find((ep) => ep.id === p.id);
          return eligibleProduct?.categoryId && matchingCategoryIds.includes(eligibleProduct.categoryId);
        });

        if (relevantProducts.length === 0) return;

        try {
          // In production: Send email via Resend/SendGrid
          // const resend = new Resend(process.env.RESEND_API_KEY);
          // await resend.emails.send({
          //   from: 'Store <noreply@store.com>',
          //   to: customer.email,
          //   subject: `Exclusive ${discountPercentage}% Off — Just For You!`,
          //   html: generateCampaignEmail(customer, relevantProducts, discountPercentage),
          // });

          console.log(
            `[Campaign] Email would be sent to ${customer.email}: ${relevantProducts.length} products with ${discountPercentage}% discount`
          );

          emailsSent++;
        } catch {
          console.error(`[Campaign] Failed to send email to ${customer.email}`);
          emailsFailed++;
        }
      });

      await Promise.allSettled(emailPromises);
    }

    // Step 5: Revalidate caches for updated product prices
    revalidateTag('product-price');
    revalidateTag('products');

    // Step 6: Return comprehensive report
    const totalDiscountApplied = discountedProducts.reduce(
      (sum, p) => sum + (p.oldPrice - p.newPrice),
      0
    );

    return {
      success: true,
      report: {
        productsAnalyzed: productsWithSales.length + eligibleProducts.length,
        productsDiscounted: discountedProducts.length,
        totalDiscountApplied: Math.round(totalDiscountApplied * 100) / 100,
        emailsSent,
        emailsFailed,
        products: discountedProducts,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    console.error('[Campaign] Marketing campaign failed:', error);
    return {
      success: false,
      report: {
        productsAnalyzed: 0,
        productsDiscounted: 0,
        totalDiscountApplied: 0,
        emailsSent: 0,
        emailsFailed: 0,
        products: [],
      },
      errors: [message],
    };
  }
}
