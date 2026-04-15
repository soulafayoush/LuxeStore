/**
 * Notification Service
 * Handles sending notifications via multiple channels (email, SMS, push, in-app)
 * Designed as a standalone microservice that could be deployed as a Serverless Function
 *
 * In production, integrate with:
 * - Email: SendGrid, AWS SES, or Resend
 * - SMS: Twilio or Vonage
 * - Push: Firebase Cloud Messaging (FCM)
 * - In-app: WebSocket / Server-Sent Events
 */

export interface NotificationPayload {
  type: NotificationType;
  recipient: string;
  subject?: string;
  message: string;
  data?: Record<string, unknown>;
  channels?: NotificationChannel[];
}

export type NotificationType =
  | "ORDER_CONFIRMED"
  | "ORDER_SHIPPED"
  | "ORDER_DELIVERED"
  | "ORDER_CANCELLED"
  | "ORDER_REFUNDED"
  | "PAYMENT_FAILED"
  | "LOW_STOCK"
  | "OUT_OF_STOCK"
  | "WELCOME"
  | "COUPON_APPLIED"
  | "PASSWORD_RESET";

export type NotificationChannel = "email" | "sms" | "push" | "in_app";

// Type to message templates mapping
const NOTIFICATION_TEMPLATES: Record<NotificationType, { subject: string; template: string }> = {
  ORDER_CONFIRMED: {
    subject: "تأكيد الطلب #{orderNumber}",
    template: "مرحباً {name}، تم تأكيد طلبك بنجاح. رقم الطلب: {orderNumber}. المبلغ الإجمالي: {amount} ر.س",
  },
  ORDER_SHIPPED: {
    subject: "تم شحن طلبك #{orderNumber}",
    template: "مرحباً {name}، تم شحن طلبك {orderNumber}. يمكنك تتبع الشحنة من خلال لوحة التحكم.",
  },
  ORDER_DELIVERED: {
    subject: "تم تسليم طلبك #{orderNumber}",
    template: "مرحباً {name}، تم تسليم طلبك بنجاح! نتمنى أن تكون راضياً عن المنتجات. شاركنا رأيك!",
  },
  ORDER_CANCELLED: {
    subject: "تم إلغاء طلبك #{orderNumber}",
    template: "مرحباً {name}، تم إلغاء طلبك {orderNumber}. سيتم استرداد المبلغ خلال 3-5 أيام عمل.",
  },
  ORDER_REFUNDED: {
    subject: "تم استرداد المبلغ لطلب #{orderNumber}",
    template: "مرحباً {name}، تم استرداد مبلغ {amount} ر.س بنجاح لطلبك {orderNumber}.",
  },
  PAYMENT_FAILED: {
    subject: "فشل عملية الدفع",
    template: "مرحباً {name}، فشلت عملية الدفع لطلبك. يرجى المحاولة مرة أخرى أو استخدام طريقة دفع أخرى.",
  },
  LOW_STOCK: {
    subject: "تنبيه: مخزون منخفض - {productName}",
    template: "المنتج {productName} لديه {stock} وحدات فقط في المخزون. يرجى إعادة التعبئة.",
  },
  OUT_OF_STOCK: {
    subject: "تنبيه: نفاد المخزون - {productName}",
    template: "المنتج {productName} نفد من المخزون تماماً. يرجى تعطيل المنتج أو إعادة التعبئة.",
  },
  WELCOME: {
    subject: "مرحباً بك في متجري!",
    template: "مرحباً {name}، شكراً لتسجيلك في متجري. استمتع بخصم 10% على أول طلب باستخدام كوبون WELCOME10!",
  },
  COUPON_APPLIED: {
    subject: "تم تطبيق كوبون الخصم",
    template: "مرحباً {name}، تم تطبيق كوبون {couponCode} بنجاح! تم خصم {discount} من طلبك.",
  },
  PASSWORD_RESET: {
    subject: "إعادة تعيين كلمة المرور",
    template: "مرحباً {name}، استخدم الرابط التالي لإعادة تعيين كلمة المرور: {resetLink}",
  },
};

/**
 * HTML email templates ready for a real email provider (SendGrid, SES, Resend, etc.)
 * These are simple format-string templates — replace the {variables} at send time.
 */
const EMAIL_TEMPLATES = {
  orderConfirmation: (params: {
    customerName: string;
    orderNumber: string;
    amount: number;
    itemCount: number;
    storeName?: string;
  }): { subject: string; htmlBody: string } => {
    const storeName = params.storeName || 'LUXE Store';
    return {
      subject: `Order Confirmed — #${params.orderNumber}`,
      htmlBody: `<!DOCTYPE html>
<html lang="en" dir="ltr">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background-color:#f9fafb;font-family:system-ui,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
        <tr><td style="background:linear-gradient(135deg,#1e1b4b,#312e81);padding:32px 40px;text-align:center;">
          <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">${storeName}</h1>
        </td></tr>
        <tr><td style="padding:40px;">
          <p style="margin:0 0 16px;font-size:18px;color:#111827;">Hello ${params.customerName},</p>
          <p style="margin:0 0 24px;font-size:16px;color:#374151;">Your order has been confirmed! Here are the details:</p>
          <table width="100%" cellpadding="12" cellspacing="0" style="background-color:#f3f4f6;border-radius:8px;margin-bottom:24px;">
            <tr><td style="font-size:14px;color:#6b7280;">Order Number</td><td style="font-size:14px;color:#111827;font-weight:600;text-align:right;">#${params.orderNumber}</td></tr>
            <tr><td style="font-size:14px;color:#6b7280;">Items</td><td style="font-size:14px;color:#111827;font-weight:600;text-align:right;">${params.itemCount}</td></tr>
            <tr><td style="font-size:14px;color:#6b7280;">Total Amount</td><td style="font-size:14px;color:#111827;font-weight:600;text-align:right;">${params.amount} SAR</td></tr>
          </table>
          <p style="margin:0 0 8px;font-size:14px;color:#6b7280;">You can track your order status from your account dashboard.</p>
        </td></tr>
        <tr><td style="background-color:#f9fafb;padding:24px 40px;text-align:center;border-top:1px solid #e5e7eb;">
          <p style="margin:0;font-size:12px;color:#9ca3af;">&copy; ${new Date().getFullYear()} ${storeName}. All rights reserved.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`,
    };
  },

  welcomeEmail: (params: {
    customerName: string;
    storeName?: string;
  }): { subject: string; htmlBody: string } => {
    const storeName = params.storeName || 'LUXE Store';
    return {
      subject: `Welcome to ${storeName}!`,
      htmlBody: `<!DOCTYPE html>
<html lang="en" dir="ltr">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background-color:#f9fafb;font-family:system-ui,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
        <tr><td style="background:linear-gradient(135deg,#1e1b4b,#312e81);padding:32px 40px;text-align:center;">
          <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">${storeName}</h1>
        </td></tr>
        <tr><td style="padding:40px;">
          <p style="margin:0 0 16px;font-size:18px;color:#111827;">Welcome, ${params.customerName}!</p>
          <p style="margin:0 0 24px;font-size:16px;color:#374151;">Thank you for creating your account. We're excited to have you!</p>
          <p style="margin:0 0 8px;font-size:16px;color:#374151;">As a special welcome gift, enjoy <strong>10% off</strong> your first order with the code:</p>
          <div style="background-color:#fef3c7;border:2px dashed #f59e0b;border-radius:8px;padding:16px;text-align:center;margin:16px 0 24px;">
            <span style="font-size:20px;font-weight:700;color:#92400e;letter-spacing:2px;">WELCOME10</span>
          </div>
          <p style="margin:0;font-size:14px;color:#6b7280;">Browse our collections and start shopping today!</p>
        </td></tr>
        <tr><td style="background-color:#f9fafb;padding:24px 40px;text-align:center;border-top:1px solid #e5e7eb;">
          <p style="margin:0;font-size:12px;color:#9ca3af;">&copy; ${new Date().getFullYear()} ${storeName}. All rights reserved.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`,
    };
  },

  passwordReset: (params: {
    customerName: string;
    resetLink: string;
    storeName?: string;
  }): { subject: string; htmlBody: string } => {
    const storeName = params.storeName || 'LUXE Store';
    return {
      subject: `${storeName} — Password Reset Request`,
      htmlBody: `<!DOCTYPE html>
<html lang="en" dir="ltr">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background-color:#f9fafb;font-family:system-ui,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
        <tr><td style="background:linear-gradient(135deg,#1e1b4b,#312e81);padding:32px 40px;text-align:center;">
          <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">${storeName}</h1>
        </td></tr>
        <tr><td style="padding:40px;">
          <p style="margin:0 0 16px;font-size:18px;color:#111827;">Hello ${params.customerName},</p>
          <p style="margin:0 0 24px;font-size:16px;color:#374151;">We received a request to reset your password. Click the button below to choose a new one:</p>
          <div style="text-align:center;margin:24px 0;">
            <a href="${params.resetLink}" style="display:inline-block;background-color:#312e81;color:#ffffff;padding:14px 32px;border-radius:8px;font-size:16px;font-weight:600;text-decoration:none;">
              Reset Password
            </a>
          </div>
          <p style="margin:16px 0 8px;font-size:14px;color:#6b7280;">If you didn't request a password reset, you can safely ignore this email. This link will expire in 1 hour.</p>
          <p style="margin:0;font-size:14px;color:#9ca3af;">If the button above doesn't work, copy and paste this URL into your browser:<br/><a href="${params.resetLink}" style="color:#312e81;word-break:break-all;">${params.resetLink}</a></p>
        </td></tr>
        <tr><td style="background-color:#f9fafb;padding:24px 40px;text-align:center;border-top:1px solid #e5e7eb;">
          <p style="margin:0;font-size:12px;color:#9ca3af;">&copy; ${new Date().getFullYear()} ${storeName}. All rights reserved.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`,
    };
  },
};

class NotificationService {
  private defaultChannels: NotificationChannel[] = ["in_app"];

  /**
   * Send a notification
   */
  async send(payload: NotificationPayload): Promise<boolean> {
    const channels = payload.channels || this.defaultChannels;
    const template = NOTIFICATION_TEMPLATES[payload.type];

    console.info(`[Notification] Type: ${payload.type}, Recipient: ${payload.recipient}, Channels: ${channels.join(", ")}`);

    const results = await Promise.allSettled(
      channels.map((channel) => this.sendToChannel(channel, payload, template))
    );

    const succeeded = results.filter((r) => r.status === "fulfilled").length;
    return succeeded === channels.length;
  }

  /**
   * Send order status change notification
   */
  async sendOrderStatusChange(params: {
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    status: string;
    amount: number;
  }): Promise<void> {
    const statusMap: Record<string, NotificationType> = {
      PROCESSING: "ORDER_CONFIRMED",
      SHIPPED: "ORDER_SHIPPED",
      DELIVERED: "ORDER_DELIVERED",
      CANCELLED: "ORDER_CANCELLED",
      REFUNDED: "ORDER_REFUNDED",
    };

    const notificationType = statusMap[params.status];
    if (!notificationType) return;

    await this.send({
      type: notificationType,
      recipient: params.customerEmail,
      message: NOTIFICATION_TEMPLATES[notificationType].template
        .replace("{name}", params.customerName)
        .replace("{orderNumber}", params.orderNumber)
        .replace("{amount}", String(params.amount)),
      channels: ["email", "in_app"],
      data: { orderNumber: params.orderNumber, status: params.status },
    });
  }

  /**
   * Send low stock alert to admin
   */
  async sendLowStockAlert(params: {
    productId: string;
    productName: string;
    stock: number;
    adminEmail: string;
  }): Promise<void> {
    const type = params.stock === 0 ? "OUT_OF_STOCK" : "LOW_STOCK";

    await this.send({
      type,
      recipient: params.adminEmail,
      message: NOTIFICATION_TEMPLATES[type].template
        .replace("{productName}", params.productName)
        .replace("{stock}", String(params.stock)),
      channels: ["email", "push"],
      data: { productId: params.productId, stock: params.stock },
    });
  }

  /**
   * Send welcome email to new customer
   */
  async sendWelcomeEmail(params: {
    customerName: string;
    customerEmail: string;
  }): Promise<void> {
    await this.send({
      type: "WELCOME",
      recipient: params.customerEmail,
      message: NOTIFICATION_TEMPLATES.WELCOME.template
        .replace("{name}", params.customerName),
      channels: ["email"],
    });
  }

  /**
   * Send payment failure notification
   */
  async sendPaymentFailure(params: {
    customerName: string;
    customerEmail: string;
    orderNumber: string;
  }): Promise<void> {
    await this.send({
      type: "PAYMENT_FAILED",
      recipient: params.customerEmail,
      message: NOTIFICATION_TEMPLATES.PAYMENT_FAILED.template
        .replace("{name}", params.customerName),
      channels: ["email", "in_app"],
      data: { orderNumber: params.orderNumber },
    });
  }

  // =========================================================================
  // Email Template Methods
  // =========================================================================

  /**
   * Send an order confirmation email using the HTML template.
   * Ready for SendGrid / AWS SES / Resend integration.
   */
  async sendOrderConfirmationEmail(params: {
    customerName: string;
    customerEmail: string;
    orderNumber: string;
    amount: number;
    itemCount: number;
    storeName?: string;
  }): Promise<void> {
    const email = EMAIL_TEMPLATES.orderConfirmation(params);

    // In production: replace with real email SDK call, e.g.:
    //   await resend.emails.send({ to: params.customerEmail, subject: email.subject, html: email.htmlBody });
    console.log(`[EMAIL] To: ${params.customerEmail}`);
    console.log(`[EMAIL] Subject: ${email.subject}`);
    console.log(`[EMAIL] HTML Body Length: ${email.htmlBody.length} chars`);
    console.log(`[EMAIL] --- HTML Preview (first 300 chars) ---`);
    console.log(`[EMAIL] ${email.htmlBody.substring(0, 300)}...`);
  }

  /**
   * Send a welcome email using the HTML template.
   * Ready for SendGrid / AWS SES / Resend integration.
   */
  async sendWelcomeEmailTemplate(params: {
    customerName: string;
    customerEmail: string;
    storeName?: string;
  }): Promise<void> {
    const email = EMAIL_TEMPLATES.welcomeEmail(params);

    // In production: replace with real email SDK call
    console.log(`[EMAIL] To: ${params.customerEmail}`);
    console.log(`[EMAIL] Subject: ${email.subject}`);
    console.log(`[EMAIL] HTML Body Length: ${email.htmlBody.length} chars`);
    console.log(`[EMAIL] --- HTML Preview (first 300 chars) ---`);
    console.log(`[EMAIL] ${email.htmlBody.substring(0, 300)}...`);
  }

  /**
   * Send a password reset email using the HTML template.
   * Ready for SendGrid / AWS SES / Resend integration.
   */
  async sendPasswordResetEmail(params: {
    customerName: string;
    customerEmail: string;
    resetLink: string;
    storeName?: string;
  }): Promise<void> {
    const email = EMAIL_TEMPLATES.passwordReset(params);

    // In production: replace with real email SDK call
    console.log(`[EMAIL] To: ${params.customerEmail}`);
    console.log(`[EMAIL] Subject: ${email.subject}`);
    console.log(`[EMAIL] HTML Body Length: ${email.htmlBody.length} chars`);
    console.log(`[EMAIL] --- HTML Preview (first 300 chars) ---`);
    console.log(`[EMAIL] ${email.htmlBody.substring(0, 300)}...`);
  }

  /**
   * Channel-specific sending logic
   */
  private async sendToChannel(
    channel: NotificationChannel,
    payload: NotificationPayload,
    template: { subject: string; template: string }
  ): Promise<void> {
    switch (channel) {
      case "email":
        // In production: integrate SendGrid, AWS SES, or Resend
        console.info(`[Email] To: ${payload.recipient}, Subject: ${template.subject}`);
        console.info(`[Email] Body: ${payload.message}`);
        break;

      case "sms":
        // In production: integrate Twilio
        console.info(`[SMS] To: ${payload.recipient}, Message: ${payload.message}`);
        break;

      case "push":
        // In production: integrate Firebase FCM
        console.info(`[Push] To: ${payload.recipient}, Message: ${payload.message}`);
        break;

      case "in_app":
        // Store in database for in-app notification display
        console.info(`[InApp] To: ${payload.recipient}, Type: ${payload.type}`);
        // await prisma.notification.create({
        //   data: {
        //     userId: payload.recipient,
        //     type: payload.type,
        //     message: payload.message,
        //     data: payload.data || {},
        //     isRead: false,
        //   },
        // });
        break;
    }
  }
}

// Singleton instance
export const notificationService = new NotificationService();
