import { NextRequest, NextResponse } from "next/server";
import { db as prisma } from "@/lib/db";
import type { OrderStatus } from "@/lib/types";
import { withErrorHandler } from "@/lib/api-error";
import { withRateLimit, apiRateLimit } from "@/lib/rate-limit";
import { apiLogger } from "@/lib/logger";

// GET /api/orders - List orders with filters
export const GET = withErrorHandler(async (request: NextRequest) => {
  // Rate limit check
  const rateLimitResult = await withRateLimit(request, apiRateLimit);
  if (!rateLimitResult.allowed) {
    const retryAfter = rateLimitResult.headers['Retry-After'] as string;
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'TOO_MANY_REQUESTS',
          message: 'Too many requests. Please try again later.',
          statusCode: 429,
        },
      },
      {
        status: 429,
        headers: {
          'Retry-After': retryAfter,
          'X-RateLimit-Remaining': String(rateLimitResult.headers['X-RateLimit-Remaining']),
          'X-RateLimit-Reset': String(rateLimitResult.headers['X-RateLimit-Reset']),
        },
      }
    );
  }

  apiLogger.info('Fetching orders', { method: 'GET' });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const search = searchParams.get("search");

  const where: Record<string, unknown> = {};
  if (status && status !== "all") {
    where.status = status;
  }
  if (search) {
    where.orderNumber = { contains: search };
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        orderItems: {
          include: {
            product: { select: { id: true, name: true, images: true } },
          },
        },
        payment: true,
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.order.count({ where }),
  ]);

  apiLogger.info(`Fetched ${orders.length} orders (page ${page})`);

  return NextResponse.json({
    success: true,
    data: orders,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

// POST /api/orders - Create a new order
export const POST = withErrorHandler(async (request: NextRequest) => {
  // Rate limit check
  const rateLimitResult = await withRateLimit(request, apiRateLimit);
  if (!rateLimitResult.allowed) {
    const retryAfter = rateLimitResult.headers['Retry-After'] as string;
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'TOO_MANY_REQUESTS',
          message: 'Too many requests. Please try again later.',
          statusCode: 429,
        },
      },
      {
        status: 429,
        headers: {
          'Retry-After': retryAfter,
          'X-RateLimit-Remaining': String(rateLimitResult.headers['X-RateLimit-Remaining']),
          'X-RateLimit-Reset': String(rateLimitResult.headers['X-RateLimit-Reset']),
        },
      }
    );
  }

  apiLogger.info('Creating new order');

  const body = await request.json();
  const {
    userId,
    items,
    shippingAddress,
    notes,
    couponCode,
    subtotal,
    tax,
    shippingCost,
    totalAmount,
  } = body;

  if (!userId || !items || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'BAD_REQUEST',
          message: 'Order data is incomplete',
          statusCode: 400,
        },
      },
      { status: 400 }
    );
  }

  // Generate unique order number
  const orderCount = await prisma.order.count();
  const orderNumber = `ORD-${new Date().getFullYear()}-${String(orderCount + 1).padStart(4, "0")}`;

  // Create order with items in a transaction
  const order = await prisma.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        orderNumber,
        userId,
        status: "PENDING",
        subtotal,
        tax: tax || 0,
        shippingCost: shippingCost || 0,
        totalAmount,
        shippingAddress,
        notes,
        couponCode,
      },
    });

    // Create order items and update stock
    for (const item of items) {
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

      // Reserve stock
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    return newOrder;
  });

  apiLogger.info(`Order created successfully: ${orderNumber}`);

  return NextResponse.json(
    { success: true, data: order },
    { status: 201 }
  );
});
