import { NextRequest, NextResponse } from "next/server";
import { db as prisma } from "@/lib/db";
import type { OrderStatus } from "@/lib/types";

// Valid order status transitions
const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: ["REFUNDED"],
  CANCELLED: [],
  REFUNDED: [],
};

// GET /api/orders/[id] - Get single order details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        orderItems: {
          include: {
            product: { select: { id: true, name: true, nameEn: true, sku: true, images: true } },
            color: { select: { id: true, name: true, hexCode: true } },
            size: { select: { id: true, name: true, value: true } },
          },
        },
        payment: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "الطلب غير موجود" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    console.error("Order fetch error:", error);
    return NextResponse.json(
      { error: "فشل في جلب تفاصيل الطلب" },
      { status: 500 }
    );
  }
}

// PATCH /api/orders/[id] - Update order status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, notes } = body as { status?: OrderStatus; notes?: string };

    if (!status) {
      return NextResponse.json(
        { error: "حالة الطلب مطلوبة" },
        { status: 400 }
      );
    }

    // Get current order
    const currentOrder = await prisma.order.findUnique({ where: { id } });
    if (!currentOrder) {
      return NextResponse.json(
        { error: "الطلب غير موجود" },
        { status: 404 }
      );
    }

    // Validate status transition
    const validTargets = VALID_TRANSITIONS[currentOrder.status as OrderStatus] || [];
    if (!validTargets.includes(status)) {
      return NextResponse.json(
        {
          error: `لا يمكن تغيير الحالة من "${currentOrder.status}" إلى "${status}"`,
          validTransitions: validTargets,
        },
        { status: 400 }
      );
    }

    // Update order
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status,
        notes: notes ? `${currentOrder.notes || ""}\n[${new Date().toISOString()}] ${notes}` : undefined,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        orderItems: {
          include: {
            product: { select: { id: true, name: true } },
          },
        },
      },
    });

    // If cancelled or refunded, restore stock
    if (status === "CANCELLED" || status === "REFUNDED") {
      const orderItems = await prisma.orderItem.findMany({
        where: { orderId: id },
      });
      for (const item of orderItems) {
        await prisma.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }
    }

    return NextResponse.json({ success: true, data: updatedOrder });
  } catch (error) {
    console.error("Order update error:", error);
    return NextResponse.json(
      { error: "فشل في تحديث الطلب" },
      { status: 500 }
    );
  }
}
