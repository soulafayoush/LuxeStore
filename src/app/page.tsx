import { Suspense } from 'react';
import Image from 'next/image';
import { ViewToggle } from '@/components/product/view-toggle';
import { ProductPriceStream } from '@/components/product/product-price-stream';
import { ProductStockStream } from '@/components/product/product-stock-stream';
import { ProductReviewsStream } from '@/components/product/product-reviews-stream';
import { PriceSkeleton, StockSkeleton, ReviewsSkeleton } from '@/components/product/product-skeletons';
import { PlaceOrderForm } from '@/components/product/place-order-form';
import { AIProductAdvisor } from '@/components/features/ai-product-advisor';
import { ScrollButton, ScrollTopButton } from '@/components/features/scroll-buttons';
import { AddToCartButton } from '@/components/features/add-to-cart-btn';
import { WishlistBtn } from '@/components/features/wishlist-btn';
import { ProductsSection } from '@/components/features/products-section';
import { NewsletterSection } from '@/components/features/newsletter-section';
import { EnhancedFooter } from '@/components/features/enhanced-footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { T } from '@/components/features/trans';
import {
  Headphones,
  Battery,
  Bluetooth,
  Shield,
  Mic,
  Star,
  ChevronRight,
  Shirt,
  Watch,
  Sparkles,
  Truck,
  RotateCcw,
  ShieldCheck,
  Clock,
  Tag,
  Zap,
  ArrowRight,
  TrendingUp,
  Award,
  Smartphone,
  Gamepad2,
  Camera,
  CheckCircle2,
  Grid3X3,
  Info,
} from 'lucide-react';

// =============================================================================
// Static Data
// =============================================================================

const HERO_STATS = [
  { value: '50K+', labelKey: 'stats.happyCustomers' as const },
  { value: '10K+', labelKey: 'stats.products' as const },
  { value: '4.9', labelKey: 'stats.avgRating' as const },
  { value: '24/7', labelKey: 'stats.support' as const },
];

const FEATURED_PRODUCTS = [
  {
    id: 'p1',
    name: 'Premium Wireless Headphones',
    price: 549,
    comparePrice: 699,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop',
    rating: 4.8,
    reviews: 247,
    badge: 'Best Seller',
    badgeColor: 'bg-indigo-600',
    category: 'Audio',
  },
  {
    id: 'p2',
    name: 'Smart Watch Pro Ultra',
    price: 899,
    comparePrice: 1200,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop',
    rating: 4.7,
    reviews: 189,
    badge: '-25%',
    badgeColor: 'bg-red-500',
    category: 'Wearables',
  },
  {
    id: 'p3',
    name: 'Sports Running Shoes X',
    price: 369,
    comparePrice: 459,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop',
    rating: 4.6,
    reviews: 156,
    badge: 'New',
    badgeColor: 'bg-emerald-500',
    category: 'Footwear',
  },
  {
    id: 'p4',
    name: 'Leather Crossbody Bag',
    price: 159,
    comparePrice: 249,
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=600&fit=crop',
    rating: 4.9,
    reviews: 312,
    badge: '-36%',
    badgeColor: 'bg-red-500',
    category: 'Accessories',
  },
  {
    id: 'p5',
    name: 'Professional Camera Lens',
    price: 1299,
    comparePrice: 1599,
    image: 'https://images.unsplash.com/photo-1617005082133-548c4dd27f35?w=600&h=600&fit=crop',
    rating: 4.8,
    reviews: 98,
    badge: 'Premium',
    badgeColor: 'bg-amber-600',
    category: 'Photography',
  },
  {
    id: 'p6',
    name: 'Wireless Earbuds Pro',
    price: 249,
    comparePrice: 349,
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=600&h=600&fit=crop',
    rating: 4.5,
    reviews: 421,
    badge: '-29%',
    badgeColor: 'bg-red-500',
    category: 'Audio',
  },
];

const CATEGORIES = [
  { name: 'Electronics', icon: Headphones, count: 420, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop', gradient: 'from-blue-500 to-indigo-600' },
  { name: 'Fashion', icon: Shirt, count: 1280, image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=400&fit=crop', gradient: 'from-purple-500 to-pink-600' },
  { name: 'Watches', icon: Watch, count: 670, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop', gradient: 'from-amber-500 to-orange-600' },
  { name: 'Gaming', icon: Gamepad2, count: 350, image: 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=400&h=400&fit=crop', gradient: 'from-green-500 to-emerald-600' },
  { name: 'Photography', icon: Camera, count: 280, image: 'https://images.unsplash.com/photo-1617005082133-548c4dd27f35?w=400&h=400&fit=crop', gradient: 'from-rose-500 to-red-600' },
  { name: 'Mobile', icon: Smartphone, count: 890, image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop', gradient: 'from-cyan-500 to-blue-600' },
];

const DEALS = [
  { id: 'd1', name: 'Studio Headphones ANC', price: 449, comparePrice: 699, discount: 36, image: 'https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=400&h=400&fit=crop', rating: 4.8, reviews: 342, category: 'Audio' },
  { id: 'd2', name: 'Ultra-Slim Laptop Stand', price: 89, comparePrice: 149, discount: 40, image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop', rating: 4.6, reviews: 178, category: 'Accessories' },
  { id: 'd3', name: 'Smart Home Hub Pro', price: 299, comparePrice: 449, discount: 33, image: 'https://images.unsplash.com/photo-1558089687-f282ffcbc126?w=400&h=400&fit=crop', rating: 4.7, reviews: 256, category: 'Smart Home' },
  { id: 'd4', name: 'Mechanical Keyboard RGB', price: 199, comparePrice: 329, discount: 39, image: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400&h=400&fit=crop', rating: 4.9, reviews: 512, category: 'Gaming' },
];

const PRODUCT_IMAGES = [
  { src: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop', alt: 'Premium Wireless Headphones — Front View' },
  { src: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&h=800&fit=crop', alt: 'Premium Wireless Headphones — Side View' },
  { src: 'https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=800&h=800&fit=crop', alt: 'Premium Wireless Headphones — Studio Shot' },
  { src: 'https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?w=800&h=800&fit=crop', alt: 'Premium Wireless Headphones — Lifestyle' },
];

const FEATURES = [
  { icon: Headphones, titleKey: 'features.anc.title', descKey: 'features.anc.desc' },
  { icon: Battery, titleKey: 'features.battery.title', descKey: 'features.battery.desc' },
  { icon: Bluetooth, titleKey: 'features.bluetooth.title', descKey: 'features.bluetooth.desc' },
  { icon: Shield, titleKey: 'features.build.title', descKey: 'features.build.desc' },
  { icon: Mic, titleKey: 'features.calls.title', descKey: 'features.calls.desc' },
  { icon: Star, titleKey: 'features.hires.title', descKey: 'features.hires.desc' },
];

const BRANDS = [
  'Apple', 'Samsung', 'Sony', 'LG', 'Bose', 'JBL', 'Nike', 'Adidas',
  'Canon', 'Nikon', 'Dell', 'HP', 'ASUS', 'Lenovo', 'Xiaomi', 'Huawei',
];

// =============================================================================
// Sub-components (inline to keep server component)
// =============================================================================

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'lg' }) {
  const sizeClass = size === 'lg' ? 'h-5 w-5' : 'h-3.5 w-3.5';
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`${sizeClass} ${
            i < Math.floor(rating)
              ? 'fill-amber-400 text-amber-400'
              : i < rating
                ? 'fill-amber-400/50 text-amber-400'
                : 'fill-muted text-muted-foreground/30'
          }`}
        />
      ))}
    </div>
  );
}

function ProductCard({ product }: { product: typeof FEATURED_PRODUCTS[0] }) {
  return (
    <div className="group rounded-2xl border bg-card shadow-sm overflow-hidden card-hover-lift">
      <div className="relative aspect-square bg-muted overflow-hidden">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover img-zoom"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className="absolute top-3 left-3">
          <span className={`${product.badgeColor} text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm`}>
            {product.badge}
          </span>
        </div>
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-background/90 backdrop-blur-sm rounded-full px-2 py-1">
          <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
          <span className="text-[11px] font-semibold">{product.rating}</span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute bottom-3 left-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
          <AddToCartButton
            productId={product.id}
            productName={product.name}
            price={product.price}
            comparePrice={product.comparePrice}
            image={product.image}
            category={product.category}
            variant="default"
            size="sm"
            className="flex-1"
          />
          <WishlistBtn
            productId={product.id}
            productName={product.name}
            price={product.price}
            comparePrice={product.comparePrice}
            image={product.image}
            category={product.category}
          />
        </div>
      </div>
      <div className="p-4 space-y-2">
        <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">{product.category}</p>
        <h3 className="font-semibold text-sm leading-snug group-hover:text-primary transition-colors">{product.name}</h3>
        <div className="flex items-center gap-1.5">
          <StarRating rating={product.rating} />
          <span className="text-[11px] text-muted-foreground">({product.reviews})</span>
        </div>
        <div className="flex items-baseline gap-2 pt-1">
          <span className="text-lg font-bold">{product.price} <T k="common.sar" /></span>
          {product.comparePrice && (
            <span className="text-sm text-muted-foreground line-through">{product.comparePrice} <T k="common.sar" /></span>
          )}
        </div>
        <AddToCartButton
          productId={product.id}
          productName={product.name}
          price={product.price}
          comparePrice={product.comparePrice}
          image={product.image}
          category={product.category}
          variant="full"
          size="sm"
          className="mt-1"
        />
      </div>
    </div>
  );
}

function DealCard({ deal }: { deal: typeof DEALS[0] }) {
  return (
    <div className="group rounded-2xl border bg-card shadow-sm overflow-hidden card-hover-lift">
      <div className="relative aspect-[4/3] bg-muted overflow-hidden">
        <Image src={deal.image} alt={deal.name} fill className="object-cover img-zoom" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" />
        <div className="absolute top-3 left-3">
          <span className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full deal-badge-pulse shadow-lg shadow-red-500/30">
            -{deal.discount}%
          </span>
        </div>
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-background/90 backdrop-blur-sm rounded-full px-2.5 py-1">
          <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
          <span className="text-xs font-bold">{deal.rating}</span>
          <span className="text-[10px] text-muted-foreground">({deal.reviews})</span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/30 to-transparent" />
        <div className="absolute bottom-3 right-3">
          <WishlistBtn
            productId={deal.id}
            productName={deal.name}
            price={deal.price}
            comparePrice={deal.comparePrice}
            image={deal.image}
            category={deal.category}
          />
        </div>
      </div>
      <div className="p-4 space-y-2.5">
        <h3 className="font-semibold text-sm leading-snug">{deal.name}</h3>
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-bold">{deal.price} <T k="common.sar" /></span>
          <span className="text-sm text-muted-foreground line-through">{deal.comparePrice} <T k="common.sar" /></span>
        </div>
        <p className="text-xs text-green-600 dark:text-green-400 font-semibold">
          <T k="deals.youSave" /> {deal.comparePrice - deal.price} <T k="common.sar" />
        </p>
        <AddToCartButton
          productId={deal.id}
          productName={deal.name}
          price={deal.price}
          comparePrice={deal.comparePrice}
          image={deal.image}
          category={deal.category}
          variant="full"
          size="sm"
          className="mt-1"
        />
      </div>
    </div>
  );
}

// =============================================================================
// Main Page Component (Server Component)
// =============================================================================

export default function Home() {
  return (
    <ViewToggle>
      <main id="main-content" className="min-h-screen bg-background">

        {/* ================================================================ */}
        {/* SECTION: Hero Banner                                             */}
        {/* ================================================================ */}
        <section id="hero" className="relative overflow-hidden hero-gradient">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-dots-pattern opacity-40" />
          <div className="absolute top-20 right-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />

          <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left: Content */}
              <div className="space-y-8 animate-fade-in-up">
                <div className="space-y-4">
                  <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border-0 px-4 py-1.5 text-sm font-medium">
                    <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                    <T k="hero.badge" />
                  </Badge>
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
                    <T k="hero.title1" />{' '}
                    <span className="gradient-text"><T k="hero.titleHighlight" /></span>{' '}
                    <T k="hero.title2" />
                  </h1>
                  <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
                    <T k="hero.subtitle" />
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <ScrollButton targetId="products" className="inline-block">
                    <Button size="lg" className="rounded-xl px-8 h-12 text-sm font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all">
                      <T k="hero.shopNow" /> <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </ScrollButton>
                  <ScrollButton targetId="deals" className="inline-block">
                    <Button size="lg" variant="outline" className="rounded-xl px-8 h-12 text-sm font-semibold">
                      <Tag className="h-4 w-4 mr-2" />
                      <T k="hero.viewDeals" />
                    </Button>
                  </ScrollButton>
                </div>

                {/* Trust indicators */}
                <div className="flex flex-wrap gap-4 pt-2">
                  {[
                    { icon: Truck, textKey: 'hero.freeShipping' as const },
                    { icon: ShieldCheck, textKey: 'hero.securePayment' as const },
                    { icon: RotateCcw, textKey: 'hero.easyReturns' as const },
                  ].map((item) => (
                    <div key={item.textKey} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <item.icon className="h-4 w-4 text-primary" />
                      <span><T k={item.textKey} /></span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Hero image */}
              <div className="hidden lg:block relative">
                <div className="relative">
                  <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl shadow-indigo-500/10 border bg-muted">
                    <Image
                      src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop"
                      alt="Premium Wireless Headphones"
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      priority
                    />
                  </div>
                  {/* Floating badges */}
                  <div className="absolute -top-4 -right-4 bg-white dark:bg-card rounded-2xl shadow-xl p-4 animate-float">
                    <div className="flex items-center gap-2">
                      <div className="h-10 w-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm font-bold">50K+</p>
                        <p className="text-xs text-muted-foreground"><T k="stats.happyCustomers" /></p>
                      </div>
                    </div>
                  </div>
                  <div className="absolute -bottom-4 -left-4 bg-white dark:bg-card rounded-2xl shadow-xl p-4 animate-float delay-200">
                    <div className="flex items-center gap-2">
                      <div className="h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                        <Award className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div>
                        <p className="text-sm font-bold">4.9/5</p>
                        <p className="text-xs text-muted-foreground"><T k="stats.avgRating" /></p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-16 pt-12 border-t">
              {HERO_STATS.map((stat) => (
                <div key={stat.labelKey} className="text-center">
                  <p className="text-2xl sm:text-3xl font-bold gradient-text">{stat.value}</p>
                  <p className="text-sm text-muted-foreground mt-1"><T k={stat.labelKey} /></p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* SECTION: Brands Marquee                                           */}
        {/* ================================================================ */}
        <section className="border-y bg-muted/30 py-6 overflow-hidden">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4"><T k="brands.title" /></p>
            <div className="flex flex-wrap justify-center gap-6 sm:gap-10">
              {BRANDS.map((brand) => (
                <span key={brand} className="text-lg sm:text-xl font-bold text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors cursor-default">
                  {brand}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* SECTION: Featured Products (with Category Filtering)              */}
        {/* ================================================================ */}
        <ProductsSection />

        {/* ================================================================ */}
        {/* SECTION: Product Detail (with PPR streaming)                      */}
        {/* ================================================================ */}
        <section id="product-detail" className="border-y bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-8">
              <ScrollTopButton className="hover:text-foreground transition-colors font-medium"><T k="product.breadcrumb.home" /></ScrollTopButton>
              <ChevronRight className="h-3.5 w-3.5" />
              <ScrollButton targetId="categories" className="hover:text-foreground transition-colors font-medium">Electronics</ScrollButton>
              <ChevronRight className="h-3.5 w-3.5" />
              <ScrollButton targetId="product-detail" className="hover:text-foreground transition-colors font-medium">Audio</ScrollButton>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-foreground font-medium">Premium Wireless Headphones</span>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-14">
              {/* Images */}
              <div className="lg:col-span-3 space-y-4">
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted border shadow-lg">
                  <Image src={PRODUCT_IMAGES[0].src} alt={PRODUCT_IMAGES[0].alt} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 60vw" priority />
                  <div className="absolute top-4 left-4">
                    <span className="bg-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg shadow-green-500/30">-21% <T k="product.off" /></span>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {PRODUCT_IMAGES.map((image, index) => (
                    <div key={index} className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer hover:ring-2 hover:ring-primary/50 ${index === 0 ? 'border-primary ring-1 ring-primary/30' : 'border-muted hover:border-muted-foreground/30'}`}>
                      <Image src={image.src} alt={image.alt} fill className="object-cover" sizes="120px" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Product Info */}
              <div className="lg:col-span-2 space-y-6">
                <div className="space-y-3">
                  <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Premium Audio</p>
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Premium Wireless Headphones</h2>
                  <div className="flex items-center gap-3">
                    <StarRating rating={4.8} size="lg" />
                    <span className="text-sm font-semibold">4.8</span>
                    <span className="text-sm text-muted-foreground">(247 <T k="products.reviews" />)</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Experience music the way artists intended with our flagship wireless headphones. Featuring advanced Active Noise Cancellation, 30-hour battery life, and Bluetooth 5.3 for studio-quality audio in a sleek, comfortable design.
                  </p>
                </div>

                <div className="border-t pt-4"><Suspense fallback={<PriceSkeleton />}><ProductPriceStream /></Suspense></div>
                <div className="border-t pt-4"><Suspense fallback={<StockSkeleton />}><ProductStockStream /></Suspense></div>
                <div className="border-t pt-4">
                  <h3 className="text-sm font-semibold mb-3"><T k="product.customerReviews" /></h3>
                  <Suspense fallback={<ReviewsSkeleton />}><ProductReviewsStream /></Suspense>
                </div>
                <div className="border-t pt-4"><PlaceOrderForm /></div>
                <AddToCartButton
                  productId="p1"
                  productName="Premium Wireless Headphones"
                  price={549}
                  comparePrice={699}
                  image="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop"
                  category="Audio"
                  variant="full"
                  size="lg"
                  className="mt-4"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* SECTION: Categories                                               */}
        {/* ================================================================ */}
        <section id="categories" className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-3">
              <Grid3X3 className="h-3.5 w-3.5 mr-1" />
              <T k="categories.badge" />
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight"><T k="categories.title" /></h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto text-lg">
              <T k="categories.subtitle" />
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {CATEGORIES.map((cat, index) => (
              <ScrollButton
                key={cat.name}
                targetId="products"
                className="group cursor-pointer"
              >
                <div className="rounded-2xl border bg-card shadow-sm overflow-hidden card-hover-lift">
                  <div className="relative aspect-square overflow-hidden">
                    <Image src={cat.image} alt={cat.name} fill className="object-cover img-zoom" sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw" />
                    <div className={`absolute inset-0 bg-gradient-to-t ${cat.gradient} opacity-40`} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm mb-2 mx-auto">
                        <cat.icon className="h-5 w-5 text-white" />
                      </div>
                      <p className="text-white text-sm font-semibold text-center">{cat.name}</p>
                      <p className="text-white/70 text-[11px] text-center">{cat.count} <T k="categories.products" /></p>
                    </div>
                  </div>
                </div>
              </ScrollButton>
            ))}
          </div>
        </section>

        {/* ================================================================ */}
        {/* SECTION: Hot Deals                                               */}
        {/* ================================================================ */}
        <section id="deals" className="border-t bg-gradient-to-b from-background via-red-50/30 to-background dark:via-red-950/5">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
              <div>
                <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-0 mb-3">
                  <Zap className="h-3.5 w-3.5 mr-1" />
                  <T k="deals.badge" />
                </Badge>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight"><T k="deals.title" /></h2>
                <p className="text-muted-foreground mt-2 text-lg">
                  <T k="deals.subtitle" />
                </p>
              </div>
              <Badge className="bg-red-500 text-white hover:bg-red-600 text-sm px-4 py-1.5 rounded-full shadow-lg shadow-red-500/25 self-start sm:self-auto">
                <TrendingUp className="h-4 w-4 mr-1.5" />
                <T k="deals.upTo" />
              </Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {DEALS.map((deal) => (
                <DealCard key={deal.name} deal={deal} />
              ))}
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* SECTION: AI Smart Search                                          */}
        {/* ================================================================ */}
        <section id="ai-search" className="border-t bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
            <div className="text-center mb-10">
              <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0 mb-3">
                <Sparkles className="h-3.5 w-3.5 mr-1" />
                <T k="ai.badge" />
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight"><T k="ai.title" /></h2>
              <p className="text-muted-foreground mt-3 max-w-2xl mx-auto text-lg">
                <T k="ai.subtitle" />
              </p>
            </div>
            <div className="max-w-2xl mx-auto">
              <AIProductAdvisor currentCategory="electronics" />
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* SECTION: Features / Why Choose Us                                 */}
        {/* ================================================================ */}
        <section id="features" className="border-t">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
            <div className="text-center mb-12">
              <Badge variant="secondary" className="mb-3">
                <Shield className="h-3.5 w-3.5 mr-1" />
                <T k="features.badge" />
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight"><T k="features.title" /></h2>
              <p className="text-muted-foreground mt-3 max-w-xl mx-auto text-lg">
                <T k="features.subtitle" />
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {FEATURES.map((feature, index) => (
                <div
                  key={feature.titleKey}
                  className="flex gap-4 rounded-2xl border bg-card p-6 shadow-sm card-hover-lift"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="font-semibold"><T k={feature.titleKey} /></h3>
                    <p className="text-sm text-muted-foreground leading-relaxed"><T k={feature.descKey} /></p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* SECTION: About / Trust Badges                                     */}
        {/* ================================================================ */}
        <section id="about" className="border-t bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
            <div className="text-center mb-12">
              <Badge variant="secondary" className="mb-3">
                <Info className="h-3.5 w-3.5 mr-1" />
                <T k="about.badge" />
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight"><T k="about.title" /></h2>
              <p className="text-muted-foreground mt-3 max-w-2xl mx-auto text-lg">
                <T k="about.subtitle" />
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: Truck, titleKey: 'about.freeShipping.title' as const, descKey: 'about.freeShipping.desc' as const, color: 'from-blue-500 to-indigo-600', bgColor: 'bg-blue-50 dark:bg-blue-900/20' },
                { icon: RotateCcw, titleKey: 'about.returns.title' as const, descKey: 'about.returns.desc' as const, color: 'from-emerald-500 to-green-600', bgColor: 'bg-emerald-50 dark:bg-emerald-900/20' },
                { icon: ShieldCheck, titleKey: 'about.secure.title' as const, descKey: 'about.secure.desc' as const, color: 'from-amber-500 to-orange-600', bgColor: 'bg-amber-50 dark:bg-amber-900/20' },
                { icon: Clock, titleKey: 'about.support.title' as const, descKey: 'about.support.desc' as const, color: 'from-purple-500 to-indigo-600', bgColor: 'bg-purple-50 dark:bg-purple-900/20' },
              ].map((item, index) => (
                <div
                  key={item.titleKey}
                  className="flex flex-col items-center text-center rounded-2xl border bg-card p-8 shadow-sm card-hover-lift"
                >
                  <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${item.color} text-white mb-4 shadow-lg`}>
                    <item.icon className="h-7 w-7" />
                  </div>
                  <h3 className="font-bold text-base mb-2"><T k={item.titleKey} /></h3>
                  <p className="text-sm text-muted-foreground leading-relaxed"><T k={item.descKey} /></p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* SECTION: Newsletter                                               */}
        {/* ================================================================ */}
        <NewsletterSection />

        {/* ================================================================ */}
        {/* Footer                                                            */}
        {/* ================================================================ */}
        <EnhancedFooter />
      </main>
    </ViewToggle>
  );
}
