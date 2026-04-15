"use client";

import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  ArrowUpLeft,
  ArrowDownLeft,
  PackagePlus,
  ClipboardList,
  BarChart3,
  Settings,
  Star,
  CreditCard,
  UserPlus,
  AlertTriangle,
  Clock,
  ShoppingBag,
  Wifi,
  WifiOff,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import {
  mockDashboardStats,
  revenueChartData,
  categoryDistribution,
  topSellingProducts,
  mockOrders,
  orderStatusLabels,
  orderStatusColors,
  recentActivity,
  lowStockAlerts,
  topCustomers,
} from "@/lib/mock-data";

// Activity icons mapping
const activityIcons: Record<string, React.ElementType> = {
  order: ShoppingCart,
  delivery: Package,
  review: Star,
  product: PackagePlus,
  customer: UserPlus,
  alert: AlertTriangle,
};

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

// Types for live data
interface LiveOrder {
  id: string;
  orderNumber: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}

interface LiveProduct {
  id: string;
  name: string;
  stock: number;
  price: number;
}

interface LowStockItem {
  id: string;
  name: string;
  stock: number;
  threshold: number;
}

interface LiveDashboardData {
  orders: LiveOrder[];
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  totalProducts: number;
  lowStockProducts: LiveProduct[];
}

export function DashboardOverview() {
  const today = new Date();
  const dateStr = today.toLocaleDateString("ar-SA", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  // Live data state
  const [liveData, setLiveData] = useState<LiveDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLive, setIsLive] = useState(false);

  const LOW_STOCK_THRESHOLD = 30;

  // Fetch live data from API on mount
  useEffect(() => {
    fetchLiveData();
  }, []);

  const fetchLiveData = async () => {
    setIsLoading(true);
    try {
      const [ordersRes, productsRes] = await Promise.all([
        fetch('/api/orders?limit=1000'),
        fetch('/api/products?limit=1000'),
      ]);

      if (!ordersRes.ok && !productsRes.ok) {
        setIsLive(false);
        return;
      }

      // Parse orders
      let orders: LiveOrder[] = [];
      let ordersTotal = 0;
      let totalRevenue = 0;
      let pendingOrders = 0;

      if (ordersRes.ok) {
        const ordersJson = await ordersRes.json();
        const allOrders: LiveOrder[] = Array.isArray(ordersJson.data) ? ordersJson.data : [];
        ordersTotal = ordersJson.pagination?.total ?? allOrders.length;
        totalRevenue = allOrders.reduce((sum: number, o: LiveOrder) => sum + (Number(o.totalAmount) || 0), 0);
        pendingOrders = allOrders.filter(
          (o: LiveOrder) => o.status === 'PENDING' || o.status === 'PROCESSING'
        ).length;
        orders = allOrders.slice(0, 5);
      }

      // Parse products
      let productsTotal = 0;
      let lowStockProducts: LiveProduct[] = [];

      if (productsRes.ok) {
        const productsJson = await productsRes.json();
        const allProducts: LiveProduct[] = Array.isArray(productsJson.data) ? productsJson.data : [];
        productsTotal = productsJson.pagination?.total ?? allProducts.length;
        lowStockProducts = allProducts
          .filter((p: LiveProduct) => p.stock < LOW_STOCK_THRESHOLD)
          .sort((a: LiveProduct, b: LiveProduct) => a.stock - b.stock);
      }

      setLiveData({
        orders,
        totalOrders: ordersTotal,
        totalRevenue,
        pendingOrders,
        totalProducts: productsTotal,
        lowStockProducts,
      });
      setIsLive(true);
    } catch {
      setIsLive(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Computed values: live data when available, mock data as fallback
  const totalRevenue = isLive && liveData ? liveData.totalRevenue : mockDashboardStats.totalRevenue;
  const totalOrdersCount = isLive && liveData ? liveData.totalOrders : mockDashboardStats.totalOrders;
  const totalProductsCount = isLive && liveData ? liveData.totalProducts : mockDashboardStats.totalProducts;
  const pendingCount = isLive && liveData
    ? liveData.pendingOrders
    : mockOrders.filter(o => o.status === 'PENDING' || o.status === 'PROCESSING').length;
  const displayOrders = isLive && liveData && liveData.orders.length > 0
    ? liveData.orders
    : mockOrders;
  const displayLowStock: LowStockItem[] = isLive && liveData
    ? liveData.lowStockProducts.map(p => ({
        id: p.id,
        name: p.name,
        stock: p.stock,
        threshold: LOW_STOCK_THRESHOLD,
      }))
    : lowStockAlerts.map(item => ({
        id: item.productId,
        name: item.name,
        stock: item.stock,
        threshold: item.threshold,
      }));
  const lowStockCount = displayLowStock.length;

  const statsCards = [
    {
      title: "إجمالي الإيرادات",
      value: `ر.س ${totalRevenue.toLocaleString("ar-SA")}`,
      change: mockDashboardStats.revenueChange,
      icon: DollarSign,
    },
    {
      title: "إجمالي الطلبات",
      value: totalOrdersCount.toLocaleString("ar-SA"),
      change: mockDashboardStats.ordersChange,
      icon: ShoppingCart,
    },
    {
      title: "إجمالي المنتجات",
      value: totalProductsCount.toLocaleString("ar-SA"),
      change: mockDashboardStats.productsChange,
      icon: Package,
    },
    {
      title: "إجمالي العملاء",
      value: mockDashboardStats.totalCustomers.toLocaleString("ar-SA"),
      change: mockDashboardStats.customersChange,
      icon: Users,
    },
  ];

  const quickActions = [
    { title: "إضافة منتج", icon: PackagePlus, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-900/30" },
    { title: "إدارة الطلبات", icon: ClipboardList, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-900/30" },
    { title: "عرض التقارير", icon: BarChart3, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-100 dark:bg-purple-900/30" },
    { title: "إعدادات المتجر", icon: Settings, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-900/30" },
  ];

  return (
    <div className="space-y-6">
      {/* ================================================================ */}
      {/* Welcome Banner */}
      {/* ================================================================ */}
      <Card className="overflow-hidden border-0">
        <CardContent className="p-0">
          <div className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-xl p-6 md:p-8">
            <div className="absolute top-0 left-0 w-40 h-40 bg-primary/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-primary/5 rounded-full translate-x-1/2 translate-y-1/2" />
            <div className="relative">
              <p className="text-sm text-muted-foreground mb-1">{dateStr}</p>
              <h2 className="text-2xl font-bold mb-1">مرحباً بك، مدير المتجر</h2>
              <p className="text-muted-foreground">
                لديك <span className="font-semibold text-foreground">{pendingCount} طلبات جديدة</span> اليوم و <span className="font-semibold text-foreground">{lowStockCount} منتج</span> بحاجة لمراجعة المخزون
              </p>
              <div className="flex items-center gap-2 mt-3">
                {isLive ? (
                  <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0">
                    <Wifi className="w-3 h-3 mr-1" />
                    متصل بالبيانات الحية
                  </Badge>
                ) : (
                  <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0">
                    <WifiOff className="w-3 h-3 mr-1" />
                    بيانات تجريبية
                  </Badge>
                )}
                <button
                  onClick={fetchLiveData}
                  disabled={isLoading}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                >
                  <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                  تحديث
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ================================================================ */}
      {/* Stats Cards */}
      {/* ================================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          const isPositive = stat.change >= 0;
          return (
            <Card key={stat.title} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-3">
                  {isPositive ? (
                    <ArrowUpLeft className="w-4 h-4 text-green-600" />
                  ) : (
                    <ArrowDownLeft className="w-4 h-4 text-red-600" />
                  )}
                  <span className={`text-sm font-medium ${isPositive ? "text-green-600" : "text-red-600"}`}>
                    {Math.abs(stat.change)}%
                  </span>
                  <span className="text-sm text-muted-foreground">من الشهر الماضي</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ================================================================ */}
      {/* Revenue Chart + Quick Actions */}
      {/* ================================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>الإيرادات الشهرية</CardTitle>
            <CardDescription>نظرة عامة على الإيرادات والطلبات خلال الأشهر الـ 12 الماضية</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueChartData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--foreground))" }}
                    formatter={(value: number, name: string) => [name === "revenue" ? `ر.س ${value.toLocaleString()}` : value, name === "revenue" ? "الإيرادات" : "الطلبات"]}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={2} />
                  <Area type="monotone" dataKey="orders" stroke="hsl(var(--chart-2))" fillOpacity={0} strokeWidth={1.5} strokeDasharray="5 5" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>إجراءات سريعة</CardTitle>
            <CardDescription>وصول مباشر للأدوات الأكثر استخداماً</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.title}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border bg-card hover:bg-accent/50 hover:border-primary/30 transition-all duration-200 text-right"
                >
                  <div className={`w-10 h-10 rounded-lg ${action.bg} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-5 h-5 ${action.color}`} />
                  </div>
                  <span className="font-medium text-sm">{action.title}</span>
                </button>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* ================================================================ */}
      {/* Recent Orders + Recent Activity */}
      {/* ================================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>أحدث الطلبات</CardTitle>
            <CardDescription>آخر 5 طلبات تم استلامها</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>رقم الطلب</TableHead>
                  <TableHead>المبلغ</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>التاريخ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayOrders.slice(0, 5).map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium text-sm">{order.orderNumber}</TableCell>
                    <TableCell className="text-sm">ر.س {Number(order.totalAmount).toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={`text-xs ${orderStatusColors[order.status] || ''}`}>
                        {orderStatusLabels[order.status] || order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString("ar-SA")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>النشاط الأخير</CardTitle>
            <CardDescription>آخر التحديثات والأحداث في المتجر</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => {
                const Icon = activityIcons[activity.type] || Clock;
                return (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-lg ${activity.bgColor} flex items-center justify-center shrink-0 mt-0.5`}>
                      <Icon className={`w-4 h-4 ${activity.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-snug">{activity.message}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{activity.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ================================================================ */}
      {/* Top Products + Top Customers */}
      {/* ================================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Products */}
        <Card>
          <CardHeader>
            <CardTitle>المنتجات الأكثر مبيعاً</CardTitle>
            <CardDescription>أعلى 5 منتجات من حيث المبيعات</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topSellingProducts} layout="vertical" margin={{ right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                  <YAxis type="category" dataKey="name" width={100} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--foreground))" }}
                    formatter={(value: number) => [value, "الكمية المباعة"]}
                  />
                  <Bar dataKey="sold" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Customers */}
        <Card>
          <CardHeader>
            <CardTitle>أفضل العملاء</CardTitle>
            <CardDescription>أعلى 5 عملاء من حيث الإنفاق</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCustomers.map((customer, index) => (
                <div key={customer.customerId} className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">
                        {index + 1}
                      </AvatarFallback>
                    </Avatar>
                    {index === 0 && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center">
                        <Star className="w-2.5 h-2.5 text-white fill-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{customer.name}</p>
                    <p className="text-xs text-muted-foreground">{customer.totalOrders} طلبات</p>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold">ر.س {customer.totalSpent.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ================================================================ */}
      {/* Category Distribution + Low Stock Alerts */}
      {/* ================================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>توزيع المبيعات</CardTitle>
            <CardDescription>حسب التصنيف</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                    {categoryDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--foreground))" }}
                    formatter={(value: number) => [`${value}%`, "النسبة"]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-2">
              {categoryDistribution.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                    <span className="text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="font-medium">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              تنبيهات المخزون
            </CardTitle>
            <CardDescription>منتجات تحتاج إعادة تخزين</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {displayLowStock.map((item) => {
                const isLow = item.stock < item.threshold;
                const percentage = Math.min((item.stock / item.threshold) * 100, 100);
                return (
                  <div key={item.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${isLow ? "bg-red-500" : "bg-amber-500"}`} />
                        <span className="text-sm font-medium">{item.name}</span>
                      </div>
                      <Badge variant="secondary" className={`text-xs ${isLow ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"}`}>
                        {item.stock} قطعة
                      </Badge>
                    </div>
                    <Progress value={percentage} className={`h-1.5 ${isLow ? "[&>div]:bg-red-500" : "[&>div]:bg-amber-500"}`} />
                  </div>
                );
              })}
            </div>
            <div className="mt-6 p-3 rounded-lg bg-muted/50 text-center">
              <p className="text-xs text-muted-foreground">
                إجمالي <span className="font-semibold text-foreground">{lowStockCount} منتجات</span> تحت الحد الأدنى للمخزون
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ================================================================ */}
      {/* Payment Methods Summary */}
      {/* ================================================================ */}
      <Card>
        <CardHeader>
          <CardTitle>ملخص طرق الدفع</CardTitle>
          <CardDescription>توزيع المدفوعات حسب طريقة الدفع هذا الشهر</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { name: "بطاقات ائتمان", percent: 45, icon: CreditCard, amount: "ر.س 65,451", color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30" },
              { name: "مدى", percent: 30, icon: CreditCard, amount: "ر.س 43,634", color: "text-emerald-600", bg: "bg-emerald-100 dark:bg-emerald-900/30" },
              { name: "Apple Pay", percent: 15, icon: CreditCard, amount: "ر.س 21,817", color: "text-purple-600", bg: "bg-purple-100 dark:bg-purple-900/30" },
              { name: "الدفع عند الاستلام", percent: 10, icon: ShoppingBag, amount: "ر.س 14,545", color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-900/30" },
            ].map((method) => {
              const Icon = method.icon;
              return (
                <div key={method.name} className="flex flex-col items-center text-center p-4 rounded-xl border bg-card hover:shadow-sm transition-shadow">
                  <div className={`w-10 h-10 rounded-lg ${method.bg} flex items-center justify-center mb-3`}>
                    <Icon className={`w-5 h-5 ${method.color}`} />
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">{method.name}</p>
                  <p className="text-lg font-bold">{method.percent}%</p>
                  <p className="text-[11px] text-muted-foreground">{method.amount}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
