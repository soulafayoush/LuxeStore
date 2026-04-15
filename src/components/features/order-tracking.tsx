'use client';

import React, { useState, useTransition } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  ArrowRight,
  Loader2,
  AlertCircle,
} from 'lucide-react';

interface OrderStep {
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  label: string;
  description: string;
  time: string;
  completed: boolean;
  active: boolean;
}

const MOCK_ORDER_STEPS: OrderStep[] = [
  {
    status: 'pending',
    label: 'Order Placed',
    description: 'Your order has been received and confirmed',
    time: 'Dec 10, 2025 - 2:30 PM',
    completed: true,
    active: false,
  },
  {
    status: 'processing',
    label: 'Processing',
    description: 'Your order is being prepared and packed',
    time: 'Dec 11, 2025 - 9:15 AM',
    completed: true,
    active: false,
  },
  {
    status: 'shipped',
    label: 'Shipped',
    description: 'Your package is on its way via Aramex',
    time: 'Dec 12, 2025 - 11:00 AM',
    completed: true,
    active: true,
  },
  {
    status: 'delivered',
    label: 'Delivered',
    description: 'Package will arrive at your address',
    time: 'Estimated: Dec 14, 2025',
    completed: false,
    active: false,
  },
];

const MOCK_ORDER_ITEMS = [
  { name: 'Premium Wireless Headphones', quantity: 1, price: 549, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop' },
  { name: 'Wireless Earbuds Pro', quantity: 2, price: 249, image: 'https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=100&h=100&fit=crop' },
];

const MOCK_ORDERS: Record<string, { steps: OrderStep[]; orderNumber: string; total: number; items: typeof MOCK_ORDER_ITEMS; trackingNumber: string }> = {
  'LUXE-DEMO': { steps: MOCK_ORDER_STEPS, orderNumber: 'LUXE-DEMO', total: 1047, items: MOCK_ORDER_ITEMS, trackingNumber: 'SMSA-8876543210' },
};

interface OrderTrackingProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrderTracking({ open, onOpenChange }: OrderTrackingProps) {
  const [orderNumber, setOrderNumber] = useState('');
  const [searchResult, setSearchResult] = useState<typeof MOCK_ORDERS[string] | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) return;

    startTransition(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      const key = orderNumber.trim().toUpperCase();
      const found = MOCK_ORDERS[key] || null;
      setSearchResult(found);
      setNotFound(!found);
    });
  };

  const handleReset = () => {
    setOrderNumber('');
    setSearchResult(null);
    setNotFound(false);
  };

  const getStatusIcon = (status: string, completed: boolean, active: boolean) => {
    if (completed) return <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />;
    if (active) return <Truck className="h-5 w-5 text-indigo-600 dark:text-indigo-400 animate-pulse" />;
    if (status === 'pending') return <Clock className="h-5 w-5 text-muted-foreground" />;
    return <Package className="h-5 w-5 text-muted-foreground/40" />;
  };

  return (
    <Sheet open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) handleReset(); }}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="flex items-center gap-2 text-xl">
            <Truck className="h-5 w-5 text-primary" />
            Track Your Order
          </SheetTitle>
          <SheetDescription>Enter your order number to get real-time shipping updates.</SheetDescription>
        </SheetHeader>

        {!searchResult && (
          <>
            {/* Search Form */}
            <form onSubmit={handleSearch} className="space-y-4 mb-6">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Enter order number (e.g., LUXE-DEMO)"
                    value={orderNumber}
                    onChange={(e) => { setOrderNumber(e.target.value); setNotFound(false); }}
                    className="pl-10"
                  />
                </div>
                <Button type="submit" disabled={!orderNumber.trim() || isPending}>
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  Track
                </Button>
              </div>

              {/* Quick Demo */}
              <div className="flex flex-wrap gap-2">
                <span className="text-xs text-muted-foreground">Try:</span>
                {['LUXE-DEMO'].map((code) => (
                  <button
                    key={code}
                    onClick={() => { setOrderNumber(code); setNotFound(false); }}
                    className="text-xs font-mono bg-muted/60 hover:bg-muted px-2 py-1 rounded-md transition-colors"
                  >
                    {code}
                  </button>
                ))}
              </div>
            </form>

            {/* Not Found */}
            {notFound && (
              <div className="flex items-start gap-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 mb-6">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-red-700 dark:text-red-400">Order Not Found</p>
                  <p className="text-xs text-red-600/80 dark:text-red-400/80 mt-1">
                    Please check your order number and try again. Contact support if the issue persists.
                  </p>
                </div>
              </div>
            )}

            {/* Info */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold">Order Status Meanings</h4>
              {[
                { icon: Clock, label: 'Pending', desc: 'Order received and under review', color: 'text-amber-500' },
                { icon: Package, label: 'Processing', desc: 'Being prepared and packed', color: 'text-blue-500' },
                { icon: Truck, label: 'Shipped', desc: 'On the way to your address', color: 'text-indigo-500' },
                { icon: CheckCircle2, label: 'Delivered', desc: 'Successfully delivered', color: 'text-green-500' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3 text-sm">
                  <item.icon className={`h-4 w-4 ${item.color} shrink-0`} />
                  <span className="font-medium w-24">{item.label}</span>
                  <span className="text-muted-foreground text-xs">{item.desc}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Search Result */}
        {searchResult && (
          <div className="space-y-6">
            {/* Order Info */}
            <div className="rounded-xl border bg-muted/30 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Order Number</p>
                  <p className="text-lg font-bold font-mono">{searchResult.orderNumber}</p>
                </div>
                <Button variant="outline" size="sm" onClick={handleReset}>
                  Track Another
                </Button>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">Tracking:</span>
                <span className="font-mono font-semibold">{searchResult.trackingNumber}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-sm text-muted-foreground">Total Amount</span>
                <span className="font-bold">{searchResult.total} SAR</span>
              </div>
            </div>

            {/* Progress Timeline */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold">Shipment Progress</h4>
              <div className="relative space-y-0">
                {searchResult.steps.map((step, index) => (
                  <div key={step.status} className="relative flex gap-4 pb-6 last:pb-0">
                    {/* Line */}
                    {index < searchResult.steps.length - 1 && (
                      <div className={`absolute left-[9px] top-6 w-0.5 h-full ${
                        step.completed ? 'bg-green-300 dark:bg-green-700' : 'bg-muted'
                      }`} />
                    )}
                    {/* Icon */}
                    <div className={`relative z-10 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-2 ${
                      step.completed ? 'border-green-500 bg-green-50 dark:bg-green-900/30' :
                      step.active ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30' :
                      'border-muted bg-background'
                    }`}>
                      {getStatusIcon(step.status, step.completed, step.active)}
                    </div>
                    {/* Content */}
                    <div className="flex-1 pt-0">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-semibold ${step.active ? 'text-indigo-600 dark:text-indigo-400' : ''}`}>
                          {step.label}
                        </p>
                        {step.active && (
                          <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 text-[10px] px-1.5 py-0">
                            Current
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
                      <p className="text-[11px] text-muted-foreground/70 mt-1">{step.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Items */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold">Order Items</h4>
              <div className="space-y-2">
                {searchResult.items.map((item) => (
                  <div key={item.name} className="flex items-center gap-3 rounded-lg border bg-card p-3">
                    <div className="h-10 w-10 rounded-lg bg-muted shrink-0 overflow-hidden relative">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate">{item.name}</p>
                      <p className="text-[11px] text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-xs font-bold">{item.price * item.quantity} SAR</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Estimate */}
            <div className="rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                  <Truck className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-400">Estimated Delivery</p>
                  <p className="text-xs text-indigo-600/70 dark:text-indigo-400/70">December 14, 2025</p>
                </div>
                <ArrowRight className="h-4 w-4 text-indigo-400" />
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
