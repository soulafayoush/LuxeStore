'use client';

import React, { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useCart } from '@/components/features/cart-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  Truck,
  ShieldCheck,
  Lock,
  CreditCard,
  CheckCircle2,
  Package,
  Tag,
  ShoppingBag,
  MapPin,
  Mail,
  Phone,
  User,
  AlertCircle,
  Zap,
  Globe,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

const TAX_RATE = 0.15;
const FREE_SHIPPING_THRESHOLD = 300;
const SHIPPING_COST = 30;

const SAUDI_CITIES = [
  { value: 'riyadh', label: 'Riyadh' },
  { value: 'jeddah', label: 'Jeddah' },
  { value: 'dammam', label: 'Dammam' },
  { value: 'madinah', label: 'Madinah' },
  { value: 'makkah', label: 'Makkah' },
  { value: 'taif', label: 'Taif' },
];

interface OrderSummaryResponse {
  subtotal: number;
  tax: number;
  shippingCost: number;
  discount: number;
  totalAmount: number;
  currency: string;
  couponApplied: string | null;
}

export function CheckoutPage() {
  const { t } = useLanguage();
  const { items, clearCart, totalItems, subtotal, setShowCheckout } = useCart();
  const searchParams = useSearchParams();
  const [isPending, setIsPending] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [orderSummary, setOrderSummary] = useState<OrderSummaryResponse | null>(null);
  const [paymentMode, setPaymentMode] = useState<'stripe' | 'demo'>('demo');
  const [redirecting, setRedirecting] = useState(false);

  // Form state — shipping only (payment handled by Stripe)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
  });

  // Coupon
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState('');
  const [couponError, setCouponError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCityChange = (value: string) => {
    setFormData((prev) => ({ ...prev, city: value }));
  };

  const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const discount = couponApplied ? Math.round((subtotal * 10) / 100) : 0;
  const total = Math.round((subtotal + tax + shipping - discount) * 100) / 100;

  const isFormValid =
    formData.fullName.trim() &&
    formData.email.trim() &&
    formData.phone.trim() &&
    formData.address.trim() &&
    formData.city &&
    formData.postalCode.trim();

  const handleApplyCoupon = () => {
    const validCoupons = ['SAVE10', 'WELCOME20', 'FLAT50'];
    const code = couponCode.trim().toUpperCase();
    if (validCoupons.includes(code)) {
      setCouponApplied(code);
      setCouponError('');
    } else {
      setCouponError('Invalid coupon code');
      setCouponApplied('');
    }
  };

  // Handle return from Stripe checkout (success or cancelled)
  useEffect(() => {
    const checkoutStatus = searchParams.get('checkout');
    const sessionId = searchParams.get('session_id');

    if (checkoutStatus === 'success' && sessionId) {
      // Returning from a successful Stripe checkout
      clearCart();
      setOrderNumber(sessionId);
      setOrderSummary({
        subtotal: 0,
        tax: 0,
        shippingCost: 0,
        discount: 0,
        totalAmount: 0,
        currency: 'SAR',
        couponApplied: null,
      });
      setOrderPlaced(true);
      // Clean up URL params
      window.history.replaceState({}, '', '/');
    } else if (checkoutStatus === 'cancelled') {
      // User cancelled on Stripe — show error
      setOrderError('Payment was cancelled. You can try again.');
      window.history.replaceState({}, '', '/');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handlePlaceOrder = useCallback(async () => {
    if (!isFormValid || isPending) return;
    setOrderError('');
    setIsPending(true);

    try {
      const response = await fetch('/api/checkout/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
          })),
          userEmail: formData.email,
          shippingAddress: `${formData.address}, ${formData.city}, ${formData.postalCode}`,
          shippingName: formData.fullName,
          shippingPhone: formData.phone,
          couponCode: couponApplied || null,
          paymentMode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setOrderError(data.error?.message || data.error || 'Failed to create order. Please try again.');
        setIsPending(false);
        return;
      }

      // Stripe mode: redirect to Stripe Checkout
      if (data.mode === 'stripe' && data.url) {
        setRedirecting(true);
        window.location.href = data.url;
        return; // Don't clear isPending — keep loading state during redirect
      }

      // Demo mode — show success screen with API response
      const orderNum = `LUXE-${Date.now().toString(36).toUpperCase()}`;
      setOrderNumber(orderNum);
      setOrderSummary(data.orderSummary || null);
      setOrderPlaced(true);
      clearCart();
    } catch {
      // Fallback: offline demo mode
      const orderNum = `LUXE-${Date.now().toString(36).toUpperCase()}`;
      setOrderNumber(orderNum);
      setOrderSummary({
        subtotal,
        tax,
        shippingCost: shipping,
        discount,
        totalAmount: total,
        currency: 'SAR',
        couponApplied: couponApplied || null,
      });
      setOrderPlaced(true);
    } finally {
      setIsPending(false);
      setRedirecting(false);
    }
  }, [isFormValid, isPending, items, formData, couponApplied, paymentMode, subtotal, tax, shipping, discount, total, clearCart]);

  const handleBackToStore = () => {
    clearCart();
    setShowCheckout(false);
  };

  // Stripe redirect loading overlay
  if (redirecting) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6 animate-fade-in-up">
          <div className="relative mx-auto w-24 h-24">
            <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping opacity-20" />
            <div className="relative h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
              <Lock className="h-12 w-12 text-primary" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold">Redirecting to Stripe...</h1>
            <p className="text-muted-foreground text-lg">
              You will be redirected to our secure payment page.
            </p>
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className="h-4 w-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            <span className="text-sm text-muted-foreground">Please wait...</span>
          </div>
          <div className="rounded-xl border bg-muted/30 p-4 space-y-2 text-left">
            <p className="text-sm font-medium">Secure Payment Tips:</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Do not close this window</li>
              <li>• Complete payment on the Stripe page</li>
              <li>• You will be returned here automatically</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Order success screen
  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6 animate-fade-in-up">
          <div className="relative mx-auto w-24 h-24">
            <div className="absolute inset-0 rounded-full bg-green-100 dark:bg-green-900/30 animate-ping opacity-20" />
            <div className="relative h-24 w-24 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold">{t('checkout.orderConfirmed')}</h1>
            <p className="text-muted-foreground text-lg">
              {t('checkout.orderConfirmedMsg')}
            </p>
          </div>

          <div className="bg-muted/50 rounded-xl p-4 space-y-2">
            <p className="text-sm text-muted-foreground">{t('checkout.orderNumber')}</p>
            <p className="text-xl font-bold font-mono tracking-wider">{orderNumber}</p>
          </div>

          {orderSummary && (
            <div className="bg-muted/50 rounded-xl p-4 text-left space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('cart.subtotal')}</span>
                <span className="font-medium">{orderSummary.subtotal.toFixed(2)} {orderSummary.currency}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('cart.vat')}</span>
                <span className="font-medium">{orderSummary.tax.toFixed(2)} {orderSummary.currency}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('cart.shipping')}</span>
                <span className="font-medium">
                  {orderSummary.shippingCost === 0 ? t('cart.free') : `${orderSummary.shippingCost.toFixed(2)} ${orderSummary.currency}`}
                </span>
              </div>
              {orderSummary.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-green-600 dark:text-green-400">{t('cart.discount')}</span>
                  <span className="font-medium text-green-600 dark:text-green-400">-{orderSummary.discount.toFixed(2)} {orderSummary.currency}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-base font-bold">
                <span>{t('cart.total')}</span>
                <span>{orderSummary.totalAmount.toFixed(2)} {orderSummary.currency}</span>
              </div>
            </div>
          )}

          <div className="bg-muted/50 rounded-xl p-4 text-left space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t('checkout.emailConfirm')}</span>
              <span className="font-medium">{formData.email || 'your@email.com'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t('checkout.estimatedDelivery')}</span>
              <span className="font-medium">{t('checkout.businessDays')}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t('checkout.items')}</span>
              <span className="font-medium">{totalItems} {t('checkout.items')}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t('checkout.shippingTo')}</span>
              <span className="font-medium">{formData.city}, Saudi Arabia</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button onClick={handleBackToStore} className="flex-1" size="lg">
              <ShoppingBag className="h-4 w-4 mr-2" />
              {t('checkout.continueShopping')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Empty cart
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mx-auto">
            <ShoppingBag className="h-10 w-10 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold">{t('cart.empty')}</h2>
            <p className="text-muted-foreground">
              {t('cart.emptyDesc')}
            </p>
          </div>
          <Button onClick={handleBackToStore} size="lg">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('checkout.backToCart')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Checkout Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCheckout(false)}
              className="shrink-0"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Cart
            </Button>
            <div className="flex-1" />
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-green-600 dark:text-green-400">{t('checkout.secureCheckout')}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="max-w-6xl mx-auto">
          {/* Page Title */}
          <div className="text-center mb-8 lg:mb-12">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t('checkout.title')}</h1>
            <p className="text-muted-foreground mt-2">
              {t('checkout.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Forms */}
            <div className="lg:col-span-2 space-y-8">
              {/* Shipping Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Truck className="h-5 w-5 text-primary" />
                    {t('checkout.shippingInfo')}
                  </CardTitle>
                  <CardDescription>{t('checkout.shippingDesc')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                        {t('checkout.fullName')}
                      </Label>
                      <Input
                        id="fullName"
                        name="fullName"
                        placeholder="John Doe"
                        value={formData.fullName}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                        {t('checkout.email')}
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                      {t('checkout.phone')}
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+966 5XX XXX XXXX"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address" className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                      {t('checkout.address')}
                    </Label>
                    <Input
                      id="address"
                      name="address"
                      placeholder="Street address, building, apartment"
                      value={formData.address}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t('checkout.city')}</Label>
                      <Select value={formData.city} onValueChange={handleCityChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select city" />
                        </SelectTrigger>
                        <SelectContent>
                          {SAUDI_CITIES.map((city) => (
                            <SelectItem key={city.value} value={city.value}>
                              {city.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postalCode">{t('checkout.postalCode')}</Label>
                      <Input
                        id="postalCode"
                        name="postalCode"
                        placeholder="12345"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>{t('checkout.country')}</Label>
                    <Input
                      value={t('checkout.country')}
                      disabled
                      className="bg-muted/50"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method — Stripe Checkout */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <CreditCard className="h-5 w-5 text-primary" />
                    {t('checkout.paymentMethod')}
                  </CardTitle>
                  <CardDescription>
                    {paymentMode === 'stripe'
                      ? t('checkout.stripeModeDesc')
                      : t('checkout.demoModeDesc')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Payment Mode Toggle */}
                  <div className="flex rounded-xl border bg-muted/30 p-1 gap-1">
                    <button
                      onClick={() => setPaymentMode('demo')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
                        paymentMode === 'demo'
                          ? 'bg-background shadow-sm text-foreground'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Zap className="h-4 w-4" />
                      {t('checkout.demoMode')}
                    </button>
                    <button
                      onClick={() => setPaymentMode('stripe')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
                        paymentMode === 'stripe'
                          ? 'bg-background shadow-sm text-foreground'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Globe className="h-4 w-4" />
                      {t('checkout.stripeMode')}
                    </button>
                  </div>

                  {paymentMode === 'stripe' ? (
                    /* Stripe Checkout Info */
                    <div className="space-y-4">
                      <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                            <Lock className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <div>
                            <p className="font-semibold text-sm">Stripe Secure Checkout</p>
                            <p className="text-xs text-muted-foreground">Industry-leading payment security</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {[
                            '256-bit SSL encryption',
                            'PCI DSS Level 1 compliant',
                            '3D Secure authentication',
                            'Supports Visa, Mastercard, MADA, Apple Pay',
                            'Automatic fraud detection',
                          ].map((feature) => (
                            <div key={feature} className="flex items-center gap-2 text-sm">
                              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0" />
                              <span className="text-muted-foreground">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <p className="text-xs text-center text-muted-foreground">
                        After clicking &quot;Place Order&quot;, you will be redirected to Stripe&apos;s secure payment page to complete your purchase.
                      </p>
                    </div>
                  ) : (
                    /* Demo Mode Info */
                    <div className="space-y-4">
                      <div className="rounded-xl border bg-muted/30 p-5 space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                            <Zap className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                          </div>
                          <div>
                            <p className="font-semibold text-sm">Demo Checkout</p>
                            <p className="text-xs text-muted-foreground">No real payment — for testing only</p>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          In demo mode, no actual payment is processed. Your order will be simulated
                          to show how the checkout flow works. When Stripe keys are configured, the
                          system will automatically switch to real secure payments.
                        </p>
                      </div>

                      {/* Accepted Cards Preview */}
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">{t('checkout.supported')}</span>
                        <div className="flex items-center gap-2">
                          {[
                            { label: 'VISA', bg: 'from-blue-600 to-blue-800' },
                            { label: 'MC', bg: 'from-orange-500 to-red-600' },
                            { label: 'MADA', bg: 'from-emerald-500 to-teal-600' },
                            { label: 'Apple', bg: 'from-gray-700 to-gray-900' },
                          ].map((card) => (
                            <div key={card.label} className={`h-7 w-10 rounded bg-gradient-to-br ${card.bg} flex items-center justify-center`}>
                              <span className="text-white text-[7px] font-bold">{card.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Order Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Package className="h-5 w-5 text-primary" />
                      {t('checkout.orderSummary')}
                    </CardTitle>
                    <CardDescription>
                      {totalItems} {t('checkout.items')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Cart Items */}
                    <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="flex gap-3 rounded-lg border bg-muted/30 p-2.5"
                        >
                          <div className="relative h-14 w-14 rounded-lg overflow-hidden bg-muted shrink-0">
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover"
                              sizes="56px"
                            />
                            {item.quantity > 1 && (
                              <div className="absolute -top-1 -right-1 h-5 min-w-[20px] flex items-center justify-center bg-primary text-primary-foreground text-[10px] font-bold rounded-full px-1">
                                {item.quantity}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold leading-snug truncate">{item.name}</p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">{item.category}</p>
                            <p className="text-xs font-bold mt-1">
                              {(item.price * item.quantity).toFixed(0)} {t('common.sar')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Separator />

                    {/* Coupon */}
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">{t('cart.couponPlaceholder')}</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder={t('checkout.couponPlaceholder')}
                          value={couponCode}
                          onChange={(e) => {
                            setCouponCode(e.target.value);
                            setCouponError('');
                          }}
                          className="flex-1 h-9 text-sm"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleApplyCoupon}
                          disabled={!couponCode.trim()}
                          className="shrink-0 h-9"
                        >
                          {t('cart.apply')}
                        </Button>
                      </div>
                      {couponError && (
                        <p className="text-xs text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {couponError}
                        </p>
                      )}
                      {couponApplied && (
                        <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Coupon &quot;{couponApplied}&quot; {t('checkout.couponApplied')}
                        </p>
                      )}
                      <p className="text-[11px] text-muted-foreground">{t('checkout.tryCoupons')}</p>
                    </div>

                    <Separator />

                    {/* Totals */}
                    <div className="space-y-2.5">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{t('cart.subtotal')}</span>
                        <span className="font-medium">{subtotal.toFixed(2)} {t('common.sar')}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{t('cart.vat')}</span>
                        <span className="font-medium">{tax.toFixed(2)} {t('common.sar')}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Truck className="h-3.5 w-3.5" />
                          {t('cart.shipping')}
                        </span>
                        <span className="font-medium">
                          {shipping === 0 ? (
                            <span className="text-green-600 dark:text-green-400">{t('cart.free')}</span>
                          ) : (
                            `${shipping.toFixed(2)} ${t('common.sar')}`
                          )}
                        </span>
                      </div>
                      {discount > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-green-600 dark:text-green-400">{t('cart.discount')} ({couponApplied})</span>
                          <span className="font-medium text-green-600 dark:text-green-400">-{discount.toFixed(2)} {t('common.sar')}</span>
                        </div>
                      )}
                      {shipping > 0 && (
                        <p className="text-xs text-muted-foreground">
                          Add {Math.ceil(FREE_SHIPPING_THRESHOLD - subtotal)} {t('common.sar')} {t('cart.moreForFree')}
                        </p>
                      )}
                      <Separator />
                      <div className="flex justify-between text-lg font-bold">
                        <span>{t('cart.total')}</span>
                        <span>{total.toFixed(2)} {t('common.sar')}</span>
                      </div>
                    </div>

                    {/* Error */}
                    {orderError && (
                      <div className="flex items-start gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-3">
                        <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                        <p className="text-sm text-destructive">{orderError}</p>
                      </div>
                    )}

                    {/* Place Order Button */}
                    <Button
                      onClick={handlePlaceOrder}
                      disabled={!isFormValid || isPending}
                      className="w-full h-12 text-base font-semibold rounded-xl"
                      size="lg"
                    >
                      {isPending ? (
                        <>
                          <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                          {t('checkout.processingOrder')}
                        </>
                      ) : (
                        <>
                          <Lock className="h-4 w-4 mr-2" />
                          {t('checkout.placeOrder')} — {total.toFixed(2)} {t('common.sar')}
                        </>
                      )}
                    </Button>

                    {!isFormValid && (
                      <p className="text-xs text-center text-muted-foreground">
                        {t('checkout.fillFields')}
                      </p>
                    )}

                    {/* Mode Badge */}
                    <div className="flex items-center justify-center">
                      <span className={`inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full ${
                        paymentMode === 'stripe'
                          ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                      }`}>
                        {paymentMode === 'stripe' ? (
                          <>
                            <Globe className="h-3 w-3" />
                            {t('checkout.stripeMode')}
                          </>
                        ) : (
                          <>
                            <Zap className="h-3 w-3" />
                            {t('checkout.demoMode')}
                          </>
                        )}
                      </span>
                    </div>

                    {/* Trust Badges */}
                    <div className="flex flex-wrap justify-center gap-3 pt-2">
                      {[
                        { icon: ShieldCheck, text: 'SSL Encrypted' },
                        { icon: Truck, text: 'Fast Delivery' },
                        { icon: Tag, text: 'Best Price' },
                      ].map((item) => (
                        <div key={item.text} className="flex items-center gap-1 text-xs text-muted-foreground">
                          <item.icon className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                          <span>{item.text}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
