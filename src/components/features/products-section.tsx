'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AddToCartButton } from '@/components/features/add-to-cart-btn';
import { WishlistBtn } from '@/components/features/wishlist-btn';
import { ProductFilter } from '@/components/features/product-filter';
import { Star, ArrowRight, Package } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

// =============================================================================
// Static Data (matching page.tsx structure)
// =============================================================================

export const FEATURED_PRODUCTS = [
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
  {
    id: 'p7',
    name: 'Gaming Laptop RTX 4070',
    price: 4599,
    comparePrice: 5200,
    image: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&h=600&fit=crop',
    rating: 4.9,
    reviews: 156,
    badge: 'Hot',
    badgeColor: 'bg-orange-600',
    category: 'Gaming',
  },
  {
    id: 'p8',
    name: 'iPhone 15 Pro Max',
    price: 4999,
    comparePrice: 5499,
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&h=600&fit=crop',
    rating: 4.8,
    reviews: 523,
    badge: '-9%',
    badgeColor: 'bg-red-500',
    category: 'Mobile',
  },
  {
    id: 'p9',
    name: 'DSLR Camera Kit Pro',
    price: 3499,
    comparePrice: 4200,
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&h=600&fit=crop',
    rating: 4.7,
    reviews: 89,
    badge: 'Premium',
    badgeColor: 'bg-amber-600',
    category: 'Photography',
  },
  {
    id: 'p10',
    name: 'Designer Sunglasses',
    price: 199,
    comparePrice: 280,
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&h=600&fit=crop',
    rating: 4.6,
    reviews: 234,
    badge: '-29%',
    badgeColor: 'bg-red-500',
    category: 'Fashion',
  },
  {
    id: 'p11',
    name: 'Portable Bluetooth Speaker',
    price: 179,
    comparePrice: 249,
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&h=600&fit=crop',
    rating: 4.5,
    reviews: 567,
    badge: 'Popular',
    badgeColor: 'bg-teal-600',
    category: 'Electronics',
  },
  {
    id: 'p12',
    name: 'Luxury Perfume Collection',
    price: 449,
    comparePrice: 650,
    image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&h=600&fit=crop',
    rating: 4.8,
    reviews: 178,
    badge: '-31%',
    badgeColor: 'bg-red-500',
    category: 'Fashion',
  },
];

// =============================================================================
// Sub-components
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

function ProductCard({ product }: { product: (typeof FEATURED_PRODUCTS)[0] }) {
  const { t } = useLanguage();
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
          <span className="text-[11px] text-muted-foreground">({product.reviews} {t('products.reviews')})</span>
        </div>
        <div className="flex items-baseline gap-2 pt-1">
          <span className="text-lg font-bold">{product.price} {t('common.sar')}</span>
          {product.comparePrice && (
            <span className="text-sm text-muted-foreground line-through">{product.comparePrice} {t('common.sar')}</span>
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

// =============================================================================
// ProductsSection Component
// =============================================================================

export function ProductsSection() {
  const { t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(FEATURED_PRODUCTS.map((p) => p.category)));
    return uniqueCategories.sort();
  }, []);

  const filteredProducts = useMemo(() => {
    if (activeCategory === 'All') return FEATURED_PRODUCTS;
    return FEATURED_PRODUCTS.filter((p) => p.category === activeCategory);
  }, [activeCategory]);

  return (
    <section id="products" className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
      <div className="text-center mb-8">
        <Badge variant="secondary" className="mb-3">
          <Package className="h-3.5 w-3.5 mr-1" />
          {t('products.title')}
        </Badge>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
          {t('products.title')}
        </h2>
        <p className="text-muted-foreground mt-3 max-w-2xl mx-auto text-lg">
          {t('products.subtitle')}
        </p>
      </div>

      {/* Category Filter */}
      <ProductFilter
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      {/* Product Count */}
      <p className="text-sm text-muted-foreground mb-6 text-center">
        {t('products.items')} <span className="font-semibold text-foreground">{filteredProducts.length}</span>
        {activeCategory !== 'All' && (
          <> in <span className="font-semibold text-foreground">{activeCategory}</span></>
        )}
      </p>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* No Results */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">{t('products.subtitle')}</p>
        </div>
      )}

      <div className="text-center mt-12">
        <Button variant="outline" size="lg" className="rounded-xl px-8 font-semibold">
          {t('products.buyNow')} <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </section>
  );
}
