'use client';

import React, { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollTopButton } from '@/components/features/scroll-buttons';
import {
  Instagram,
  Twitter,
  Facebook,
  Youtube,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  ArrowRight,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

interface LegalPageContent {
  title: string;
  content: string;
}

const LEGAL_PAGES: Record<string, LegalPageContent> = {
  privacy: {
    title: 'Privacy Policy',
    content: `At LUXE Store, your privacy is our top priority. We collect personal information only when you voluntarily provide it to us, such as when you create an account, place an order, subscribe to our newsletter, or contact our customer support team. The types of information we may collect include your name, email address, phone number, shipping address, and payment information. We use this information to process your orders, provide customer support, personalize your shopping experience, send order updates, and improve our services. We never sell your personal information to third parties. We implement industry-standard security measures including SSL encryption, secure payment processing through Stripe, and regular security audits to protect your data. You have the right to access, correct, or delete your personal information at any time by contacting us at privacy@luxestore.sa. We also use cookies and similar technologies to enhance your browsing experience and analyze site traffic. You can manage your cookie preferences through your browser settings. Our privacy practices are in full compliance with the Personal Data Protection Law in the Kingdom of Saudi Arabia. For any questions regarding this policy, please contact our Data Protection Officer at dpo@luxestore.sa.`,
  },
  terms: {
    title: 'Terms of Service',
    content: `By accessing and using LUXE Store, you agree to be bound by these Terms of Service. You must be at least 18 years old to make purchases on our platform. All products listed on our website are subject to availability, and prices may change without prior notice. We reserve the right to refuse or cancel any order for any reason, including suspected fraud, pricing errors, or stock unavailability. All product descriptions and images are provided for informational purposes and we make every effort to display them accurately; however, we do not guarantee that the display of any color will be accurate on your device. You agree to provide accurate and complete information when placing orders. Payment is processed securely through Stripe, and you authorize us to charge the total order amount including shipping and applicable taxes to your chosen payment method. Intellectual property on this website, including logos, text, graphics, and software, is owned by LUXE Store and protected by copyright laws. You may not reproduce, distribute, or create derivative works without our written permission. We are not liable for any indirect, incidental, or consequential damages arising from your use of this website. These terms are governed by the laws of the Kingdom of Saudi Arabia.`,
  },
  returns: {
    title: 'Returns & Exchanges',
    content: `LUXE Store offers a hassle-free 30-day return and exchange policy. If you are not completely satisfied with your purchase, you may return most items within 30 days of delivery for a full refund or exchange. Items must be in their original condition, unused, unwashed, and with all original tags and packaging intact. To initiate a return, please contact our support team at returns@luxestore.sa or use the "Request Return" option in your order history. We will provide you with a prepaid return shipping label within 24 hours. Refunds are typically processed within 5-7 business days after we receive and inspect the returned item. The refund will be issued to your original payment method. Please note that certain items are non-returnable, including personalized products, perishable goods, intimate items, and hazardous materials. Sale items can be returned within the 30-day window but are only eligible for exchange or store credit. If you receive a defective or incorrect item, please contact us immediately and we will arrange a free replacement or full refund including shipping costs. For exchanges, we will ship the replacement item as soon as we receive the original product. Shipping costs for exchanges due to change of mind are the responsibility of the customer.`,
  },
  cookie: {
    title: 'Cookie Policy',
    content: `LUXE Store uses cookies and similar tracking technologies to enhance your browsing experience, analyze site traffic, and improve our services. We use essential cookies that are necessary for the website to function properly, including session cookies, authentication tokens, and security preferences. We also use analytical cookies such as Google Analytics to understand how visitors interact with our website, which helps us identify popular products and optimize page performance. Additionally, we employ marketing cookies from platforms like Facebook Pixel and Google Ads to deliver personalized advertisements and measure the effectiveness of our promotional campaigns. You can manage your cookie preferences at any time through your browser settings or by using the cookie consent banner displayed on your first visit. Please note that disabling certain cookies may affect the functionality of specific features on our website. We do not use cookies to store sensitive personal information such as payment details. For more details on how we handle your data, please refer to our Privacy Policy or contact us at privacy@luxestore.sa.`,
  },
  refund: {
    title: 'Refund Policy',
    content: `At LUXE Store, we strive to ensure your complete satisfaction with every purchase. If you are not satisfied with your order, you may request a full refund within 30 days of delivery, provided the items are in their original condition with all tags and packaging intact. Once we receive and inspect your returned items, the refund will be processed within 5 to 7 business days and credited back to your original payment method. Please allow an additional 3 to 5 business days for the refund to appear on your bank or credit card statement, depending on your financial institution. Refunds for orders paid via credit card or debit card will be returned to the same card used for the purchase. For orders paid through MADA, the refund process may take up to 10 business days. Shipping costs are non-refundable unless the return is due to a defective item or an error on our part. If you receive a damaged or incorrect product, we will issue a full refund including all shipping charges, or arrange a free replacement at your preference. To initiate a refund, please contact our support team at refunds@luxestore.sa or use the return request option in your order history.`,
  },
  shipping: {
    title: 'Shipping Information',
    content: `LUXE Store offers fast and reliable shipping across the Kingdom of Saudi Arabia. Standard shipping takes 2-4 business days and costs 30 SAR for orders below 300 SAR. Orders above 300 SAR qualify for free standard shipping. Express shipping is available for 50 SAR with delivery within 1-2 business days. Same-day delivery is available in Riyadh, Jeddah, and Dammam for orders placed before 12:00 PM for an additional fee of 70 SAR. Once your order is shipped, you will receive a confirmation email with a tracking number that you can use to monitor your delivery status. We partner with leading logistics providers including Saudi Post, Aramex, and SMSA Express to ensure your orders arrive safely and on time. You can track your order through our website or by contacting our support team. Please ensure your shipping address is accurate and complete, as we are not responsible for delays caused by incorrect addresses. International shipping is not currently available. During promotional periods such as Ramadan and Saudi National Day, delivery times may be slightly longer due to high order volumes. We appreciate your patience during these busy periods.`,
  },
  help: {
    title: 'Help Center',
    content: `Welcome to the LUXE Store Help Center! We are here to help you with any questions or concerns you may have. Our customer support team is available 24/7 to assist you. You can reach us through the following channels: Email: support@luxestore.sa (response within 2 hours), Phone: +966 50 000 0000 (available 24/7), Live Chat: Available on our website during business hours (9 AM - 11 PM KST), WhatsApp: +966 50 000 0000. Common topics we can help with include order status and tracking, product inquiries and recommendations, returns and exchanges, payment issues, account management, size guides, and technical support for electronic products. For order tracking, you can enter your order number on our Track Order page to get real-time updates on your shipment status. If you have a complaint or feedback, we would love to hear from you at feedback@luxestore.sa. We take all customer feedback seriously and use it to continuously improve our services. For business inquiries, bulk orders, or partnership opportunities, please contact our B2B team at business@luxestore.sa.`,
  },
  track: {
    title: 'Track Your Order',
    content: `Tracking your order is easy! Simply enter your order number (e.g., ORD-2024-0001) in the Track Order section to get real-time updates on your shipment. Here is what each status means: PENDING - Your order has been received and is being reviewed; PROCESSING - Your order is being prepared and packed; SHIPPED - Your order is on its way and you can track it with the provided tracking number; DELIVERED - Your order has been successfully delivered to your address; CANCELLED - Your order has been cancelled; REFUNDED - Your refund has been processed. If your order shows as SHIPPED, you can click the tracking link to view detailed delivery progress including estimated delivery time and current location. Delivery typically takes 2-4 business days within Saudi Arabia. If your tracking information has not updated for more than 48 hours, or if you have any concerns about your delivery, please contact our support team at support@luxestore.sa or call +966 50 000 0000. We will investigate and provide you with an update within 24 hours. Please note that tracking updates may be delayed during weekends and public holidays.`,
  },
};

interface FooterLinkProps {
  children: React.ReactNode;
  pageKey: string;
  onOpen: (pageKey: string) => void;
}

function FooterLink({ children, pageKey, onOpen }: FooterLinkProps) {
  return (
    <button
      onClick={() => onOpen(pageKey)}
      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
    >
      {children}
    </button>
  );
}

export function EnhancedFooter() {
  const { t } = useLanguage();
  const [legalOpen, setLegalOpen] = useState(false);
  const [activePage, setActivePage] = useState<LegalPageContent | null>(null);

  const openPage = (pageKey: string) => {
    const page = LEGAL_PAGES[pageKey];
    if (page) {
      setActivePage(page);
      setLegalOpen(true);
    }
  };

  return (
    <>
      <footer id="footer" className="border-t bg-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
            {/* Brand */}
            <div className="lg:col-span-2">
              <ScrollTopButton className="flex items-center gap-2.5 mb-4 hover:opacity-80 transition-opacity">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-lg">L</span>
                </div>
                <span className="font-bold text-xl tracking-tight">LUXE <span className="gradient-text">Store</span></span>
              </ScrollTopButton>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mb-6">
                {t('footer.aboutText')}
              </p>
              <div className="flex gap-3">
                {[Instagram, Twitter, Facebook, Youtube].map((Icon, i) => (
                  <button key={i} className="h-10 w-10 rounded-xl border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-primary/5 transition-all">
                    <Icon className="h-4 w-4" />
                  </button>
                ))}
              </div>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-semibold text-sm mb-4">{t('footer.customerService')}</h4>
              <ul className="space-y-2.5">
                <li><FooterLink pageKey="help" onOpen={openPage}>{t('footer.faq')}</FooterLink></li>
                <li><FooterLink pageKey="shipping" onOpen={openPage}>{t('footer.shippingInfo')}</FooterLink></li>
                <li><FooterLink pageKey="returns" onOpen={openPage}>{t('footer.returnPolicy')}</FooterLink></li>
                <li><FooterLink pageKey="track" onOpen={openPage}>Track Order</FooterLink></li>
                <li><FooterLink pageKey="help" onOpen={openPage}>{t('footer.contactUs')}</FooterLink></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold text-sm mb-4">Legal</h4>
              <ul className="space-y-2.5">
                <li><FooterLink pageKey="privacy" onOpen={openPage}>{t('footer.privacyPolicy')}</FooterLink></li>
                <li><FooterLink pageKey="terms" onOpen={openPage}>{t('footer.terms')}</FooterLink></li>
                <li><FooterLink pageKey="cookie" onOpen={openPage}>{t('footer.cookiePolicy')}</FooterLink></li>
                <li><FooterLink pageKey="refund" onOpen={openPage}>{t('footer.refundPolicy')}</FooterLink></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold text-sm mb-4">Contact</h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-2.5 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 text-primary shrink-0" />
                  Riyadh, Kingdom of Saudi Arabia
                </li>
                <li className="flex items-center gap-2.5 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4 text-primary shrink-0" />
                  +966 50 000 0000
                </li>
                <li className="flex items-center gap-2.5 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4 text-primary shrink-0" />
                  support@luxestore.sa
                </li>
              </ul>
              {/* Payment Methods */}
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-muted-foreground mb-2">We Accept</p>
                <div className="flex items-center gap-2">
                  {[
                    { label: 'Visa', bg: 'from-blue-600 to-blue-800' },
                    { label: 'MC', bg: 'from-orange-500 to-red-600' },
                    { label: 'MADA', bg: 'from-emerald-500 to-teal-600' },
                  ].map((card) => (
                    <div key={card.label} className={`h-7 w-10 rounded bg-gradient-to-br ${card.bg} flex items-center justify-center`}>
                      <span className="text-white text-[7px] font-bold">{card.label}</span>
                    </div>
                  ))}
                  <div className="h-7 w-10 rounded bg-white border flex items-center justify-center">
                    <span className="text-[10px] font-medium text-muted-foreground">Pay</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-12 pt-8 border-t">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-muted-foreground">
                &copy; {new Date().getFullYear()} LUXE Store. {t('footer.rights')}.
              </p>
              <p className="text-xs text-muted-foreground">
                Made with passion in Saudi Arabia
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Legal Pages Sheet */}
      <Sheet open={legalOpen} onOpenChange={setLegalOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          {activePage && (
            <>
              <SheetHeader className="mb-6">
                <SheetTitle className="text-xl">{activePage.title}</SheetTitle>
                <SheetDescription>Last updated: January 2025</SheetDescription>
              </SheetHeader>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                {activePage.content.split('\n\n').map((paragraph, i) => (
                  <p key={i} className="text-sm leading-relaxed text-muted-foreground mb-4">
                    {paragraph.trim()}
                  </p>
                ))}
              </div>
              <div className="mt-8 pt-6 border-t">
                <p className="text-xs text-muted-foreground mb-4">
                  Still have questions? Contact our support team.
                </p>
                <div className="flex items-center gap-3">
                  <Button size="sm" className="gap-2">
                    <Mail className="h-4 w-4" />
                    support@luxestore.sa
                  </Button>
                  <Button size="sm" variant="outline" className="gap-2">
                    <Phone className="h-4 w-4" />
                    +966 50 000 0000
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
