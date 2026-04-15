import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import Stripe from "stripe";
import { db } from "@/lib/db";

// Initialize Stripe client (uses STRIPE_SECRET_KEY env var)
let stripe: Stripe | null = null;
try {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (secretKey && secretKey !== "sk_test_placeholder") {
    stripe = new Stripe(secretKey, {
      apiVersion: "2024-12-18.acacia",
    });
  }
} catch {
  console.warn("Failed to initialize Stripe client. Webhook will run in demo mode.");
}

// POST /api/checkout/webhook
// Handles Stripe webhook events to update order status and revalidate cache tags
export async function POST(request: NextRequest) {
  let event: Stripe.Event;

  try {
    const body = await request.text();
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (webhookSecret && stripe) {
      // Production mode: verify Stripe signature
      const sig = request.headers.get("stripe-signature");
      if (!sig) {
        console.error("[Webhook] Missing stripe-signature header");
        return NextResponse.json(
          { error: "Missing stripe-signature header" },
          { status: 200 },
        );
      }

      try {
        event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
      } catch (err) {
        console.error("[Webhook] Signature verification failed:", err);
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 200 },
        );
      }
    } else {
      // Demo mode: parse body as JSON without signature verification
      console.info("[Webhook] Running in demo mode — no signature verification");
      try {
        event = JSON.parse(body) as Stripe.Event;
      } catch {
        // Provide a minimal fallback event for testing
        event = {
          type: "checkout.session.completed",
          data: {
            object: {
              metadata: { orderId: "demo" },
              payment_intent: "pi_demo",
              amount_total: 0,
            } as unknown as Stripe.Checkout.Session,
          },
        } as Stripe.Event;
      }
    }

    console.info(`[Webhook] Received event: ${event.type} (id: ${event.id})`);

    // Handle different event types
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutComplete(session);
        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutExpired(session);
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailed(paymentIntent);
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        await handleRefund(charge);
        break;
      }

      default:
        console.info(`[Webhook] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[Webhook] Processing error:", error);
    // Always return 200 to Stripe to prevent retries, log errors internally
    return NextResponse.json({ received: true }, { status: 200 });
  }
}

// =============================================================================
// Event Handlers
// =============================================================================

/**
 * Handle successful checkout completion
 * - Update order status to PAID
 * - Create Payment record with status SUCCEEDED
 * - Revalidate product-stock and product-price cache tags
 */
async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.orderId as string;
  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id;
  const totalAmount = session.amount_total
    ? session.amount_total / 100 // Convert from cents
    : 0;

  console.info(
    `[Webhook] Checkout completed — Order: ${orderId || "N/A"}, Payment: ${paymentIntentId || "N/A"}, Amount: ${totalAmount} SAR`,
  );

  // If no orderId in metadata, try to find order by stripeId
  let targetOrderId = orderId;
  if (!targetOrderId && session.id) {
    try {
      const existingOrder = await db.order.findFirst({
        where: { stripeId: session.id },
        select: { id: true },
      });
      if (existingOrder) {
        targetOrderId = existingOrder.id;
      }
    } catch {
      // DB not available or order not found
    }
  }

  if (!targetOrderId) {
    console.info(
      "[Webhook] No orderId found in session metadata or DB. Skipping order update. Session ID:",
      session.id,
    );
    return;
  }

  try {
    await db.$transaction(async (tx) => {
      // Update order status to PAID and store stripe checkout session ID
      await tx.order.update({
        where: { id: targetOrderId },
        data: {
          status: "PAID",
          stripeId: session.id || null,
        },
      });

      // Create Payment record
      await tx.payment.create({
        data: {
          orderId: targetOrderId,
          stripePaymentIntentId: paymentIntentId || null,
          amount: totalAmount,
          currency: "SAR",
          status: "SUCCEEDED",
          method: "card",
          paidAt: new Date(),
        },
      });
    });

    console.info(
      `[Webhook] Order ${targetOrderId} updated to PAID. Payment record created.`,
    );

    // Revalidate cache tags to instantly refresh the product page for all users
    revalidateTag("product-stock");
    revalidateTag("product-price");
    revalidateTag("products");
    console.info(
      "[Webhook] Cache tags revalidated: product-stock, product-price, products",
    );
  } catch (error) {
    console.error(
      `[Webhook] Error processing checkout complete for order ${targetOrderId}:`,
      error,
    );
    throw error;
  }
}

/**
 * Handle expired checkout session
 * - Update order status to CANCELLED
 * - Restore stock for all order items
 */
async function handleCheckoutExpired(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.orderId as string;

  if (!orderId) {
    console.info(
      "[Webhook] Checkout session expired but no orderId in metadata. Session:",
      session.id,
    );
    return;
  }

  console.info(
    `[Webhook] Checkout session expired — Order: ${orderId}, Session: ${session.id}`,
  );

  try {
    await db.$transaction(async (tx) => {
      // Update order status to CANCELLED
      await tx.order.update({
        where: { id: orderId },
        data: { status: "CANCELLED" },
      });

      // Restore stock for all order items
      const orderItems = await tx.orderItem.findMany({
        where: { orderId },
        select: { productId: true, quantity: true },
      });

      for (const item of orderItems) {
        await tx.product
          .update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          })
          .catch(() => {
            // Product may not exist in DB (demo products), silently ignore
          });
      }

      console.info(
        `[Webhook] Order ${orderId} cancelled (session expired). Stock restored for ${orderItems.length} items.`,
      );
    });

    revalidateTag("product-stock");
    console.info("[Webhook] Cache tag revalidated: product-stock");
  } catch (error) {
    console.error(
      `[Webhook] Error processing checkout expired for order ${orderId}:`,
      error,
    );
  }
}

/**
 * Handle failed payment
 * - Update order status to CANCELLED
 * - Create Payment record with status FAILED
 * - Restore stock for all order items
 * - Revalidate product-stock cache tag
 */
async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  // Primary: read orderId from payment_intent metadata (set via payment_intent_data during session creation)
  let orderId = paymentIntent.metadata?.orderId as string;

  // Fallback: look up the checkout session associated with this payment intent
  if (!orderId && stripe && paymentIntent.id) {
    try {
      const sessions = await stripe.checkout.sessions.list({
        payment_intent: paymentIntent.id,
        limit: 1,
      });
      if (sessions.data.length > 0) {
        const sessionOrderId = sessions.data[0].metadata?.orderId as string;
        if (sessionOrderId) {
          orderId = sessionOrderId;
          console.info(
            `[Webhook] Found orderId ${orderId} via checkout session lookup for intent ${paymentIntent.id}`,
          );
        }
      }
    } catch (lookupErr) {
      console.warn(
        "[Webhook] Failed to look up checkout session for payment intent",
        lookupErr,
      );
    }
  }

  // Last resort: find order by stripeId or by searching payments table
  if (!orderId && paymentIntent.id) {
    try {
      // Try finding via payment record (if one was already created)
      const existingPayment = await db.payment.findFirst({
        where: { stripePaymentIntentId: paymentIntent.id },
        select: { orderId: true },
      });
      if (existingPayment) {
        orderId = existingPayment.orderId;
        console.info(
          `[Webhook] Found orderId ${orderId} via payment record for intent ${paymentIntent.id}`,
        );
      }
    } catch {
      // DB not available
    }
  }

  if (!orderId) {
    console.error(
      "[Webhook] No orderId found for failed payment intent.",
      paymentIntent.id,
      "Metadata:",
      JSON.stringify(paymentIntent.metadata),
    );
    return;
  }

  console.info(
    `[Webhook] Payment failed — Order: ${orderId}, Intent: ${paymentIntent.id}`,
  );

  try {
    await db.$transaction(async (tx) => {
      // Update order status to CANCELLED
      await tx.order.update({
        where: { id: orderId },
        data: { status: "CANCELLED" },
      });

      // Create Payment record with FAILED status
      await tx.payment.create({
        data: {
          orderId,
          stripePaymentIntentId: paymentIntent.id,
          amount: paymentIntent.amount ? paymentIntent.amount / 100 : 0,
          currency: "SAR",
          status: "FAILED",
          method: "card",
        },
      });

      // Restore stock for all order items
      const orderItems = await tx.orderItem.findMany({
        where: { orderId },
        select: { productId: true, quantity: true },
      });

      for (const item of orderItems) {
        await tx.product
          .update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          })
          .catch(() => {
            // Product may not exist in DB (demo products), silently ignore
          });
      }

      console.info(
        `[Webhook] Order ${orderId} cancelled. Stock restored for ${orderItems.length} items.`,
      );
    });

    revalidateTag("product-stock");
    console.info("[Webhook] Cache tag revalidated: product-stock");
  } catch (error) {
    console.error(
      `[Webhook] Error processing payment failed for order ${orderId}:`,
      error,
    );
    throw error;
  }
}

/**
 * Handle refund
 * - Update order status to REFUNDED
 * - Update Payment status to REFUNDED
 * - Restore stock for all order items
 * - Revalidate product-stock cache tag
 */
async function handleRefund(charge: Stripe.Charge) {
  // The order ID might be in charge.metadata, payment_intent metadata, or we find it via DB
  let orderId = charge.metadata?.orderId as string;

  // Fallback 1: look up the payment intent to get metadata
  if (!orderId && stripe) {
    const paymentIntentId = charge.payment_intent as string;
    if (paymentIntentId) {
      try {
        const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
        if (pi.metadata?.orderId) {
          orderId = pi.metadata.orderId as string;
          console.info(
            `[Webhook] Found orderId ${orderId} via PaymentIntent metadata for charge ${charge.id}`,
          );
        }
      } catch {
        // Stripe API unavailable
      }
    }
  }

  // Fallback 2: find order by payment_intent ID in payments table
  if (!orderId) {
    const paymentIntentId = charge.payment_intent as string;
    if (paymentIntentId) {
      try {
        const payment = await db.payment.findFirst({
          where: { stripePaymentIntentId: paymentIntentId },
          select: { orderId: true },
        });
        if (payment) {
          orderId = payment.orderId;
        }
      } catch {
        // DB not available
      }
    }
  }

  if (!orderId) {
    console.error(
      "[Webhook] No orderId found for refund. Charge:",
      charge.id,
    );
    return;
  }

  console.info(
    `[Webhook] Refund processed — Order: ${orderId}, Charge: ${charge.id}`,
  );

  try {
    await db.$transaction(async (tx) => {
      // Update order status to REFUNDED
      await tx.order.update({
        where: { id: orderId },
        data: { status: "REFUNDED" },
      });

      // Update Payment status to REFUNDED
      const paymentIntentId = charge.payment_intent as string;
      await tx.payment.updateMany({
        where: {
          orderId,
          ...(paymentIntentId
            ? { stripePaymentIntentId: paymentIntentId }
            : {}),
        },
        data: { status: "REFUNDED" },
      });

      // Restore stock for all order items
      const orderItems = await tx.orderItem.findMany({
        where: { orderId },
        select: { productId: true, quantity: true },
      });

      for (const item of orderItems) {
        await tx.product
          .update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          })
          .catch(() => {
            // Product may not exist in DB (demo products), silently ignore
          });
      }

      console.info(
        `[Webhook] Order ${orderId} refunded. Stock restored for ${orderItems.length} items.`,
      );
    });

    revalidateTag("product-stock");
    console.info("[Webhook] Cache tag revalidated: product-stock");
  } catch (error) {
    console.error(
      `[Webhook] Error processing refund for order ${orderId}:`,
      error,
    );
    throw error;
  }
}
