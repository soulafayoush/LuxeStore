// Mock data for the admin dashboard
// This data simulates a populated e-commerce platform

import type { Product, Order, User, Category, Color, Size, DashboardStats } from "./types";

// Colors
export const mockColors: Color[] = [
  { id: "c1", name: "أسود", nameEn: "Black", hexCode: "#000000" },
  { id: "c2", name: "أبيض", nameEn: "White", hexCode: "#FFFFFF" },
  { id: "c3", name: "أحمر", nameEn: "Red", hexCode: "#EF4444" },
  { id: "c4", name: "أزرق", nameEn: "Blue", hexCode: "#3B82F6" },
  { id: "c5", name: "أخضر", nameEn: "Green", hexCode: "#22C55E" },
  { id: "c6", name: "ذهبي", nameEn: "Gold", hexCode: "#F59E0B" },
  { id: "c7", name: "رمادي", nameEn: "Gray", hexCode: "#6B7280" },
  { id: "c8", name: "وردي", nameEn: "Pink", hexCode: "#EC4899" },
];

// Sizes
export const mockSizes: Size[] = [
  { id: "s1", name: "صغير", value: "S", label: "S" },
  { id: "s2", name: "متوسط", value: "M", label: "M" },
  { id: "s3", name: "كبير", value: "L", label: "L" },
  { id: "s4", name: "كبير جداً", value: "XL", label: "XL" },
  { id: "s5", name: "كبير جداً جداً", value: "XXL", label: "XXL" },
];

// Categories
export const mockCategories: Category[] = [
  {
    id: "cat1", name: "ملابس رجالية", nameEn: "Men's Clothing", slug: "mens-clothing",
    image: "https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=400&h=300&fit=crop",
    parentId: null, createdAt: "2024-01-01", updatedAt: "2024-01-01",
    children: [
      { id: "cat11", name: "قمصان", nameEn: "Shirts", slug: "mens-shirts", parentId: "cat1", createdAt: "2024-01-01", updatedAt: "2024-01-01" },
      { id: "cat12", name: "بناطيل", nameEn: "Pants", slug: "mens-pants", parentId: "cat1", createdAt: "2024-01-01", updatedAt: "2024-01-01" },
      { id: "cat13", name: "جاكيتات", nameEn: "Jackets", slug: "mens-jackets", parentId: "cat1", createdAt: "2024-01-01", updatedAt: "2024-01-01" },
    ]
  },
  {
    id: "cat2", name: "ملابس نسائية", nameEn: "Women's Clothing", slug: "womens-clothing",
    image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=300&fit=crop",
    parentId: null, createdAt: "2024-01-01", updatedAt: "2024-01-01",
    children: [
      { id: "cat21", name: "فساتين", nameEn: "Dresses", slug: "dresses", parentId: "cat2", createdAt: "2024-01-01", updatedAt: "2024-01-01" },
      { id: "cat22", name: "عبايات", nameEn: "Abayas", slug: "abayas", parentId: "cat2", createdAt: "2024-01-01", updatedAt: "2024-01-01" },
    ]
  },
  {
    id: "cat3", name: "إلكترونيات", nameEn: "Electronics", slug: "electronics",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop",
    parentId: null, createdAt: "2024-01-01", updatedAt: "2024-01-01",
    children: [
      { id: "cat31", name: "هواتف", nameEn: "Phones", slug: "phones", parentId: "cat3", createdAt: "2024-01-01", updatedAt: "2024-01-01" },
      { id: "cat32", name: "لابتوب", nameEn: "Laptops", slug: "laptops", parentId: "cat3", createdAt: "2024-01-01", updatedAt: "2024-01-01" },
    ]
  },
  {
    id: "cat4", name: "أحذية", nameEn: "Shoes", slug: "shoes",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop",
    parentId: null, createdAt: "2024-01-01", updatedAt: "2024-01-01",
    children: []
  },
  {
    id: "cat5", name: "إكسسوارات", nameEn: "Accessories", slug: "accessories",
    image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400&h=300&fit=crop",
    parentId: null, createdAt: "2024-01-01", updatedAt: "2024-01-01",
    children: []
  },
  {
    id: "cat6", name: "عطور", nameEn: "Perfumes", slug: "perfumes",
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=300&fit=crop",
    parentId: null, createdAt: "2024-01-01", updatedAt: "2024-01-01",
    children: []
  },
];

// Products
export const mockProducts: Product[] = [
  {
    id: "p1", name: "قميص رجالي فاخر", nameEn: "Premium Men's Shirt",
    description: "قميص رجالي مصنوع من أجود أنواع القطن المصري",
    price: 299, comparePrice: 450, sku: "SHR-001", isActive: true, isFeatured: true,
    images: '["https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400&h=500&fit=crop","https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=500&fit=crop"]',
    stock: 150, categoryId: "cat11", createdAt: "2024-01-15", updatedAt: "2024-06-01",
  },
  {
    id: "p2", name: "جاكيت جلد طبيعي", nameEn: "Genuine Leather Jacket",
    description: "جاكيت جلد طبيعي عالي الجودة بتصميم عصري",
    price: 1299, comparePrice: 1800, sku: "JKT-001", isActive: true, isFeatured: true,
    images: '["https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=500&fit=crop"]',
    stock: 45, categoryId: "cat13", createdAt: "2024-02-01", updatedAt: "2024-06-01",
  },
  {
    id: "p3", name: "سماعات لاسلكية", nameEn: "Wireless Headphones",
    description: "سماعات بلوتوث عالية الجودة مع إلغاء الضوضاء",
    price: 549, comparePrice: 699, sku: "AUD-001", isActive: true, isFeatured: true,
    images: '["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=500&fit=crop"]',
    stock: 200, categoryId: "cat3", createdAt: "2024-02-15", updatedAt: "2024-06-01",
  },
  {
    id: "p4", name: "حقيبة يد نسائية", nameEn: "Women's Handbag",
    description: "حقيبة يد أنيقة من الجلد الصناعي الفاخر",
    price: 399, comparePrice: 550, sku: "BAG-001", isActive: true, isFeatured: false,
    images: '["https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=500&fit=crop"]',
    stock: 80, categoryId: "cat5", createdAt: "2024-03-01", updatedAt: "2024-06-01",
  },
  {
    id: "p5", name: "حذاء رياضي", nameEn: "Sports Shoes",
    description: "حذاء رياضي خفيف الوزن مناسب للجري والتمارين",
    price: 459, comparePrice: null, sku: "SHO-001", isActive: true, isFeatured: true,
    images: '["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=500&fit=crop"]',
    stock: 120, categoryId: "cat4", createdAt: "2024-03-15", updatedAt: "2024-06-01",
  },
  {
    id: "p6", name: "عطر رجالي فاخر", nameEn: "Luxury Men's Perfume",
    description: "عطر رجالي فاخر برائحة خشبية مميزة",
    price: 349, comparePrice: 500, sku: "PRF-001", isActive: true, isFeatured: true,
    images: '["https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=500&fit=crop"]',
    stock: 90, categoryId: "cat6", createdAt: "2024-04-01", updatedAt: "2024-06-01",
  },
  {
    id: "p7", name: "ساعة ذكية", nameEn: "Smart Watch",
    description: "ساعة ذكية متعددة الوظائف مع شاشة AMOLED",
    price: 899, comparePrice: 1200, sku: "WCH-001", isActive: true, isFeatured: true,
    images: '["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=500&fit=crop"]',
    stock: 60, categoryId: "cat3", createdAt: "2024-04-15", updatedAt: "2024-06-01",
  },
  {
    id: "p8", name: "بنطلون جينز", nameEn: "Jeans Pants",
    description: "بنطلون جينز كلاسيكي بقصة مريحة",
    price: 249, comparePrice: 350, sku: "JNS-001", isActive: true, isFeatured: false,
    images: '["https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=500&fit=crop"]',
    stock: 200, categoryId: "cat12", createdAt: "2024-05-01", updatedAt: "2024-06-01",
  },
  {
    id: "p9", name: "نظارة شمسية", nameEn: "Sunglasses",
    description: "نظارة شمسية بتصميم عصري وحماية من الأشعة فوق البنفسجية",
    price: 199, comparePrice: 280, sku: "SGL-001", isActive: true, isFeatured: false,
    images: '["https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=500&fit=crop"]',
    stock: 180, categoryId: "cat5", createdAt: "2024-05-15", updatedAt: "2024-06-01",
  },
  {
    id: "p10", name: "لابتوب احترافي", nameEn: "Professional Laptop",
    description: "لابتوب عالي الأداء مناسب للمحترفين والمصممين",
    price: 5499, comparePrice: 6500, sku: "LAP-001", isActive: true, isFeatured: true,
    images: '["https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=500&fit=crop"]',
    stock: 25, categoryId: "cat32", createdAt: "2024-06-01", updatedAt: "2024-06-01",
  },
  {
    id: "p11", name: "عباية سوداء كلاسيكية", nameEn: "Classic Black Abaya",
    description: "عباية سوداء بتصميم كلاسيكي أنيق",
    price: 599, comparePrice: 800, sku: "ABA-001", isActive: true, isFeatured: false,
    images: '["https://images.unsplash.com/photo-1585914924626-15adac1e6402?w=400&h=500&fit=crop"]',
    stock: 100, categoryId: "cat22", createdAt: "2024-06-10", updatedAt: "2024-06-01",
  },
  {
    id: "p12", name: "تيشيرت قطني", nameEn: "Cotton T-Shirt",
    description: "تيشيرت قطني مريح بألوان متعددة",
    price: 129, comparePrice: 180, sku: "TSH-001", isActive: false, isFeatured: false,
    images: '["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop"]',
    stock: 0, categoryId: "cat11", createdAt: "2024-06-15", updatedAt: "2024-06-01",
  },
];

// Orders
export const mockOrders: Order[] = [
  {
    id: "ord1", orderNumber: "ORD-2024-0001", userId: "u1", status: "DELIVERED",
    totalAmount: 848, subtotal: 798, tax: 0, shippingCost: 50,
    shippingAddress: "الرياض، حي العليا، شارع التحلية", couponCode: null,
    createdAt: "2024-06-01T10:30:00Z", updatedAt: "2024-06-05T14:00:00Z",
  },
  {
    id: "ord2", orderNumber: "ORD-2024-0002", userId: "u2", status: "PROCESSING",
    totalAmount: 1353, subtotal: 1299, tax: 0, shippingCost: 54,
    shippingAddress: "جدة، حي الروضة، شارع فلسطين", couponCode: "SAVE10",
    createdAt: "2024-06-02T14:15:00Z", updatedAt: "2024-06-03T09:00:00Z",
  },
  {
    id: "ord3", orderNumber: "ORD-2024-0003", userId: "u3", status: "SHIPPED",
    totalAmount: 708, subtotal: 659, tax: 0, shippingCost: 49,
    shippingAddress: "الدمام، حي الفيصلية", couponCode: null,
    createdAt: "2024-06-03T09:45:00Z", updatedAt: "2024-06-04T16:30:00Z",
  },
  {
    id: "ord4", orderNumber: "ORD-2024-0004", userId: "u4", status: "PENDING",
    totalAmount: 5499, subtotal: 5499, tax: 0, shippingCost: 0,
    shippingAddress: "المدينة المنورة، حي العزيزية", couponCode: null,
    createdAt: "2024-06-04T11:00:00Z", updatedAt: "2024-06-04T11:00:00Z",
  },
  {
    id: "ord5", orderNumber: "ORD-2024-0005", userId: "u1", status: "CANCELLED",
    totalAmount: 459, subtotal: 459, tax: 0, shippingCost: 0,
    shippingAddress: "الرياض، حي النرجس", couponCode: null,
    createdAt: "2024-06-05T08:20:00Z", updatedAt: "2024-06-05T12:00:00Z",
  },
  {
    id: "ord6", orderNumber: "ORD-2024-0006", userId: "u5", status: "DELIVERED",
    totalAmount: 954, subtotal: 899, tax: 0, shippingCost: 55,
    shippingAddress: "الرياض، حي الملقا", couponCode: null,
    createdAt: "2024-05-28T16:00:00Z", updatedAt: "2024-06-01T10:00:00Z",
  },
  {
    id: "ord7", orderNumber: "ORD-2024-0007", userId: "u2", status: "DELIVERED",
    totalAmount: 1598, subtotal: 1548, tax: 0, shippingCost: 50,
    shippingAddress: "جدة، حي الحمراء", couponCode: null,
    createdAt: "2024-05-25T12:30:00Z", updatedAt: "2024-05-29T14:00:00Z",
  },
  {
    id: "ord8", orderNumber: "ORD-2024-0008", userId: "u6", status: "REFUNDED",
    totalAmount: 399, subtotal: 399, tax: 0, shippingCost: 0,
    shippingAddress: "الطائف، حي الصفا", couponCode: null,
    createdAt: "2024-05-20T09:00:00Z", updatedAt: "2024-05-22T11:00:00Z",
  },
  {
    id: "ord9", orderNumber: "ORD-2024-0009", userId: "u3", status: "PROCESSING",
    totalAmount: 2298, subtotal: 2199, tax: 0, shippingCost: 99,
    shippingAddress: "الدمام، حي الشاطئ", couponCode: "WELCOME20",
    createdAt: "2024-06-06T15:45:00Z", updatedAt: "2024-06-07T08:00:00Z",
  },
  {
    id: "ord10", orderNumber: "ORD-2024-0010", userId: "u7", status: "PENDING",
    totalAmount: 648, subtotal: 598, tax: 0, shippingCost: 50,
    shippingAddress: "أبها، حي المنهل", couponCode: null,
    createdAt: "2024-06-07T10:15:00Z", updatedAt: "2024-06-07T10:15:00Z",
  },
];

// Users / Customers
export const mockUsers: User[] = [
  { id: "u1", email: "ahmed@example.com", name: "أحمد محمد", role: "USER", phone: "+966501234567", address: "الرياض، حي العليا", createdAt: "2024-01-15", updatedAt: "2024-06-01" },
  { id: "u2", email: "sara@example.com", name: "سارة أحمد", role: "USER", phone: "+966502345678", address: "جدة، حي الروضة", createdAt: "2024-01-20", updatedAt: "2024-06-01" },
  { id: "u3", email: "khalid@example.com", name: "خالد العتيبي", role: "USER", phone: "+966503456789", address: "الدمام، حي الفيصلية", createdAt: "2024-02-01", updatedAt: "2024-06-01" },
  { id: "u4", email: "nora@example.com", name: "نورة القحطاني", role: "USER", phone: "+966504567890", address: "المدينة المنورة", createdAt: "2024-02-15", updatedAt: "2024-06-01" },
  { id: "u5", email: "omar@example.com", name: "عمر الشهري", role: "USER", phone: "+966505678901", address: "الرياض، حي الملقا", createdAt: "2024-03-01", updatedAt: "2024-06-01" },
  { id: "u6", email: "fatima@example.com", name: "فاطمة الدوسري", role: "USER", phone: "+966506789012", address: "الطائف، حي الصفا", createdAt: "2024-03-15", updatedAt: "2024-06-01" },
  { id: "u7", email: "mohammed@example.com", name: "محمد الحربي", role: "USER", phone: "+966507890123", address: "أبها، حي المنهل", createdAt: "2024-04-01", updatedAt: "2024-06-01" },
  { id: "u8", email: "layla@example.com", name: "ليلى الزهراني", role: "USER", phone: "+966508901234", address: "تبوك، حي الورود", createdAt: "2024-04-15", updatedAt: "2024-06-01" },
  { id: "admin1", email: "admin@store.com", name: "مدير المتجر", role: "ADMIN", phone: "+966509012345", address: "الرياض", createdAt: "2024-01-01", updatedAt: "2024-06-01" },
];

// Dashboard stats
export const mockDashboardStats: DashboardStats = {
  totalRevenue: 156780,
  totalOrders: 1247,
  totalProducts: 156,
  totalCustomers: 843,
  revenueChange: 12.5,
  ordersChange: 8.3,
  productsChange: -2.1,
  customersChange: 15.7,
};

// Revenue chart data (last 12 months)
export const revenueChartData = [
  { month: "يناير", revenue: 8200, orders: 65 },
  { month: "فبراير", revenue: 9100, orders: 72 },
  { month: "مارس", revenue: 11500, orders: 89 },
  { month: "أبريل", revenue: 10800, orders: 84 },
  { month: "مايو", revenue: 13200, orders: 103 },
  { month: "يونيو", revenue: 14500, orders: 112 },
  { month: "يوليو", revenue: 12100, orders: 95 },
  { month: "أغسطس", revenue: 15600, orders: 121 },
  { month: "سبتمبر", revenue: 13900, orders: 108 },
  { month: "أكتوبر", revenue: 16800, orders: 131 },
  { month: "نوفمبر", revenue: 18500, orders: 144 },
  { month: "ديسمبر", revenue: 22680, orders: 123 },
];

// Category distribution for pie chart
export const categoryDistribution = [
  { name: "ملابس رجالية", value: 32, fill: "var(--color-chart-1)" },
  { name: "ملابس نسائية", value: 28, fill: "var(--color-chart-2)" },
  { name: "إلكترونيات", value: 22, fill: "var(--color-chart-3)" },
  { name: "أحذية", value: 10, fill: "var(--color-chart-4)" },
  { name: "إكسسوارات", value: 8, fill: "var(--color-chart-5)" },
];

// Top selling products
export const topSellingProducts = [
  { productId: "p1", name: "قميص رجالي فاخر", sold: 245, revenue: 73255 },
  { productId: "p3", name: "سماعات لاسلكية", sold: 198, revenue: 108702 },
  { productId: "p5", name: "حذاء رياضي", sold: 176, revenue: 80784 },
  { productId: "p7", name: "ساعة ذكية", sold: 134, revenue: 120466 },
  { productId: "p6", name: "عطر رجالي فاخر", sold: 128, revenue: 44672 },
];

// Order status labels in Arabic
export const orderStatusLabels: Record<string, string> = {
  PENDING: "قيد الانتظار",
  PROCESSING: "قيد المعالجة",
  SHIPPED: "تم الشحن",
  DELIVERED: "تم التسليم",
  CANCELLED: "ملغي",
  REFUNDED: "مسترجع",
};

// Order status colors
export const orderStatusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  PROCESSING: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  SHIPPED: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  DELIVERED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  REFUNDED: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
};

// Recent activity items
export const recentActivity = [
  { id: 'a1', type: 'order' as const, message: 'طلب جديد #ORD-2024-0010 من محمد الحربي', time: 'منذ 5 دقائق', color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-100 dark:bg-blue-900/30' },
  { id: 'a2', type: 'delivery' as const, message: 'تم تسليم طلب #ORD-2024-0006 بنجاح', time: 'منذ ساعة', color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-100 dark:bg-green-900/30' },
  { id: 'a3', type: 'review' as const, message: 'تقييم 5 نجوم على "قميص رجالي فاخر"', time: 'منذ 2 ساعة', color: 'text-amber-600 dark:text-amber-400', bgColor: 'bg-amber-100 dark:bg-amber-900/30' },
  { id: 'a4', type: 'product' as const, message: 'منتج جديد: عطر رجالي فاخر تمت إضافته', time: 'منذ 3 ساعات', color: 'text-purple-600 dark:text-purple-400', bgColor: 'bg-purple-100 dark:bg-purple-900/30' },
  { id: 'a5', type: 'customer' as const, message: 'عميل جديد: ليلى الزهراني', time: 'منذ 4 ساعات', color: 'text-teal-600 dark:text-teal-400', bgColor: 'bg-teal-100 dark:bg-teal-900/30' },
  { id: 'a6', type: 'alert' as const, message: 'تنبيه مخزون: لابتوب احترافي (25 فقط)', time: 'منذ 5 ساعات', color: 'text-red-600 dark:text-red-400', bgColor: 'bg-red-100 dark:bg-red-900/30' },
];

// Low stock alerts
export const lowStockAlerts = [
  { productId: 'p10', name: 'لابتوب احترافي', stock: 25, threshold: 30 },
  { productId: 'p2', name: 'جاكيت جلد طبيعي', stock: 45, threshold: 50 },
  { productId: 'p7', name: 'ساعة ذكية', stock: 60, threshold: 50 },
  { productId: 'p6', name: 'عطر رجالي فاخر', stock: 90, threshold: 50 },
];

// Top customers
export const topCustomers = [
  { customerId: 'u1', name: 'أحمد محمد', email: 'ahmed@example.com', totalOrders: 8, totalSpent: 12450 },
  { customerId: 'u2', name: 'سارة أحمد', email: 'sara@example.com', totalOrders: 6, totalSpent: 8920 },
  { customerId: 'u3', name: 'خالد العتيبي', email: 'khalid@example.com', totalOrders: 5, totalSpent: 7350 },
  { customerId: 'u4', name: 'نورة القحطاني', email: 'nora@example.com', totalOrders: 4, totalSpent: 6100 },
  { customerId: 'u5', name: 'عمر الشهري', email: 'omar@example.com', totalOrders: 3, totalSpent: 4890 },
];
