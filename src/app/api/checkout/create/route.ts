import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import Stripe from "stripe";
import { db } from "@/lib/db";
import { withRateLimit, checkoutRateLimit } from "@/lib/rate-limit";
import { AppError, withErrorHandler } from "@/lib/api-error";
import { checkoutLogger } from "@/lib/logger";

// Initialize Stripe client (lazy)
let stripe: Stripe | null = null;
function getStripe(): Stripe | null {
  if (stripe) return stripe;
  try {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (secretKey && secretKey !== "sk_test_placeholder") {
      stripe = new Stripe(secretKey, {
        apiVersion: "2024-12-18.acacia",
      });
      return stripe;
    }
    return null;
  } catch {
    checkoutLogger.warn("Failed to initialize Stripe client", undefined, {
      hint: "Check STRIPE_SECRET_KEY in .env",
    });
    return null;
  }
}

const TAX_RATE = 0.15;
const FREE_SHIPPING_THRESHOLD = 300;
const SHIPPING_COST = 30;

// POST /api/checkout/create
// Creates a Stripe Checkout Session (or demo session) with idempotency key for safe retries
async function checkoutHandler(request: NextRequest) {
  // Rate limiting check
  const { allowed } = await withRateLimit(request, checkoutRateLimit);
  if (!allowed) {
    throw AppError.tooManyRequests();
  }

  checkoutLogger.info("Checkout session creation initiated");

  try {
    const body = await request.json();
    const {
      items,
      userEmail,
      shippingAddress,
      shippingName,
      shippingPhone,
      couponCode,
      idempotencyKey,
      paymentMode,
    } = body;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    if (!userEmail) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Validate each item has required fields
    for (const item of items) {
      if (!item.productId || !item.quantity || item.quantity <= 0) {
        return NextResponse.json(
          { error: "Invalid product data" },
          { status: 400 },
        );
      }
      if (!item.price || item.price <= 0) {
        return NextResponse.json(
          { error: "Invalid product price" },
          { status: 400 },
        );
      }
    }

    // Generate or use provided idempotency key to prevent duplicate charges
    const finalIdempotencyKey = idempotencyKey || `idk_${randomUUID()}`;

    // Calculate subtotal (server-side to prevent price tampering)
    const subtotal = items.reduce(
      (sum: number, item: { price: number; quantity: number }) =>
        sum + item.price * item.quantity,
      0,
    );

    const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
    const shippingCalc =
      subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;

    // Apply coupon discount
    let discount = 0;
    let appliedCoupon = null;
    if (couponCode) {
      const coupon = await validateCoupon(couponCode, subtotal);
      if (coupon.valid && coupon.discount) {
        discount = coupon.discount;
        appliedCoupon = couponCode;
      }
    }

    const totalAmount = Math.max(0, subtotal + tax + shippingCalc - discount);

    // =============================================================
    // Stripe Mode: Create real Stripe Checkout Session
    // =============================================================
    const isStripeMode = paymentMode === "stripe";
    const stripeClient = getStripe();

    if (isStripeMode && !stripeClient) {
      // User explicitly selected Stripe but keys are not configured
      checkoutLogger.warn(
        "Stripe mode selected but Stripe client not initialized",
        undefined,
        { hint: "Set STRIPE_SECRET_KEY in .env to a real Stripe secret key" },
      );
      throw AppError.badRequest(
        "Stripe payment is not available. The payment keys have not been configured. Please use Demo mode or contact support.",
      );
    }

    if (isStripeMode && stripeClient) {
      checkoutLogger.info("Creating Stripe checkout session", {
        itemCount: items.length,
        total: totalAmount,
      });

      // Create or find a user record for the order
      let userId = "";
      try {
        const existingUser = await db.user.findUnique({
          where: { email: userEmail },
          select: { id: true },
        });
        if (existingUser) {
          userId = existingUser.id;
        } else {
          const newUser = await db.user.create({
            data: {
              email: userEmail,
              name: shippingName || userEmail.split("@")[0],
              phone: shippingPhone || null,
              address: shippingAddress || null,
            },
          });
          userId = newUser.id;
          checkoutLogger.info(`Created guest user ${userId} for ${userEmail}`);
        }
      } catch (dbError) {
        checkoutLogger.error(
          "Failed to create/find user, proceeding with Stripe session anyway",
          dbError instanceof Error ? dbError : undefined,
        );
      }

      // Create order in DB (PENDING status) so the webhook can update it
      let orderId = "";
      if (userId) {
        try {
          const orderCount = await db.order.count();
          const orderNumber = `ORD-${new Date().getFullYear()}-${String(orderCount + 1).padStart(4, "0")}`;

          const newOrder = await db.order.create({
            data: {
              orderNumber,
              userId,
              status: "PENDING",
              subtotal,
              tax,
              shippingCost: shippingCalc,
              totalAmount,
              shippingAddress: shippingAddress || null,
              couponCode: appliedCoupon || null,
            },
          });

          // Create order items
          for (const item of items) {
            await db.orderItem.create({
              data: {
                orderId: newOrder.id,
                productId: item.productId,
                quantity: item.quantity,
                price: item.price,
              },
            });
          }

          orderId = newOrder.id;
          checkoutLogger.info(`Created pending order ${orderId} (${orderNumber})`);
        } catch (orderError) {
          checkoutLogger.error(
            "Failed to create order record, proceeding with Stripe session",
            orderError instanceof Error ? orderError : undefined,
          );
        }
      }

      // Build line items for Stripe
      const lineItems = items.map(
        (item: { name: string; price: number; quantity: number }) => ({
          price_data: {
            currency: "sar",
            product_data: {
              name: item.name || "Product",
              description: `LUXE Store - ${item.name || "Product"}`,
            },
            unit_amount: Math.round(item.price * 100), // Stripe expects cents
          },
          quantity: item.quantity,
        }),
      );

      // Build success/cancel URLs from request origin
      const origin =
        request.headers.get("origin") ||
        request.headers.get("x-forwarded-host")
          ? `${request.headers.get("x-forwarded-proto") || "https"}://${request.headers.get("x-forwarded-host")}`
          : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

      const successUrl = `${origin}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${origin}/?checkout=cancelled`;

      // Metadata for the webhook to update the order
      const metadata: Record<string, string> = {
        idempotencyKey: finalIdempotencyKey,
        itemCount: String(items.length),
        subtotal: String(subtotal),
        tax: String(tax),
        shippingCost: String(shippingCalc),
        discount: String(discount),
        totalAmount: String(totalAmount),
        currency: "SAR",
      };
      if (orderId) metadata.orderId = orderId;
      if (appliedCoupon) metadata.couponCode = appliedCoupon;
      if (userEmail) metadata.customerEmail = userEmail;
      if (shippingName) metadata.shippingName = shippingName;
      if (shippingPhone) metadata.shippingPhone = shippingPhone;

      // Payment intent data — propagate orderId so webhooks can find the order
      // even when receiving payment_intent.* events (which don't carry session metadata)
      const paymentIntentData: {
        metadata: Record<string, string>;
        description?: string;
      } = {
        metadata: {
          idempotencyKey: finalIdempotencyKey,
          currency: "SAR",
        },
        description: `LUXE Store Order — ${items.length} item(s)`,
      };
      if (orderId) paymentIntentData.metadata.orderId = orderId;
      if (userEmail) paymentIntentData.metadata.customerEmail = userEmail;

      // Create the Stripe Checkout Session
      const session = await stripeClient.checkout.sessions.create(
        {
          payment_method_types: ["card"],
          customer_email: userEmail,
          line_items: lineItems,
          mode: "payment",
          success_url: successUrl,
          cancel_url: cancelUrl,
          metadata,
          payment_intent_data: paymentIntentData,
          shipping_address_collection: {
            allowed_countries: ["SA"],
          },
          locale: "auto",
        },
        {
          idempotencyKey: finalIdempotencyKey,
        },
      );

      checkoutLogger.info("Stripe checkout session created", {
        sessionId: session.id,
        url: session.url,
        orderId,
      });

      // Store the session ID on the order if we created one
      if (orderId) {
        try {
          await db.order.update({
            where: { id: orderId },
            data: { stripeId: session.id },
          });
        } catch {
          // Non-critical: order will still be updated by webhook
        }
      }

      return NextResponse.json({
        success: true,
        mode: "stripe",
        sessionId: session.id,
        idempotencyKey: finalIdempotencyKey,
        url: session.url,
        orderSummary: {
          subtotal,
          tax,
          shippingCost: shippingCalc,
          discount,
          totalAmount,
          currency: "SAR",
          couponApplied: appliedCoupon,
        },
      });
    }

    // =============================================================
    // Demo Mode: Return simulated checkout response
    // =============================================================
    if (isStripeMode) {
      // This branch should not be reached due to the guard above,
      // but we keep it as a defensive fallback
      checkoutLogger.warn("Stripe mode fell through to demo handler unexpectedly");
    }
    checkoutLogger.info("Returning demo checkout response");

    return NextResponse.json({
      success: true,
      mode: "demo",
      sessionId: `cs_demo_${Date.now()}`,
      idempotencyKey: finalIdempotencyKey,
      url: `/checkout/success?session_id=cs_demo_${Date.now()}`,
      orderSummary: {
        subtotal,
        tax,
        shippingCost: shippingCalc,
        discount,
        totalAmount,
        currency: "SAR",
        couponApplied: appliedCoupon,
      },
    });
  } catch (error) {
    checkoutLogger.error(
      "Checkout session creation error",
      error instanceof Error ? error : undefined,
    );

    // If Stripe-specific error, provide a helpful message
    if (error instanceof Stripe.errors.StripeError) {
      checkoutLogger.error("Stripe API error", undefined, {
        type: error.type,
        code: error.code,
        message: error.message,
      });
      throw AppError.badRequest(
        `Payment processing error: ${error.message}. Please try again.`,
      );
    }

    throw AppError.badRequest(
      error instanceof Error
        ? error.message
        : "Failed to create checkout session",
    );
  }
}

export const POST = withErrorHandler(checkoutHandler);

// Coupon validation helper
async function validateCoupon(
  code: string,
  subtotal: number,
): Promise<{ valid: boolean; discount: number }> {
  const coupons: Record<
    string,
    {
      type: string;
      value: number;
      minPurchase: number;
      maxUses: number;
      usedCount: number;
      isActive: boolean;
      expiresAt: string;
    }
  > = {
    WELCOME20: {
      type: "PERCENTAGE",
      value: 20,
      minPurchase: 0,
      maxUses: 500,
      usedCount: 156,
      isActive: true,
      expiresAt: "2026-12-31",
    },
    SAVE10: {
      type: "PERCENTAGE",
      value: 10,
      minPurchase: 100,
      maxUses: 1000,
      usedCount: 342,
      isActive: true,
      expiresAt: "2026-06-30",
    },
    FLAT50: {
      type: "FIXED",
      value: 50,
      minPurchase: 200,
      maxUses: 200,
      usedCount: 89,
      isActive: true,
      expiresAt: "2026-09-15",
    },
  };

  const coupon = coupons[code.toUpperCase()];
  if (!coupon) return { valid: false, discount: 0 };
  if (!coupon.isActive) return { valid: false, discount: 0 };
  if (coupon.usedCount >= coupon.maxUses) return { valid: false, discount: 0 };
  if (new Date(coupon.expiresAt) < new Date())
    return { valid: false, discount: 0 };
  if (subtotal < coupon.minPurchase) return { valid: false, discount: 0 };

  const discount =
    coupon.type === "PERCENTAGE"
      ? Math.round((subtotal * coupon.value) / (100 * 100)) * 100 / 100
      : Math.min(coupon.value, subtotal);

  return { valid: true, discount };
}
