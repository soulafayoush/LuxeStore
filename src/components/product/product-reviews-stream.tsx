'use server';

import { unstable_cache as nextCache } from 'next/cache';
import { Star, ThumbsUp } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

// Simulate a network/DB delay for demo purposes
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Mock review data for the demo product page
const MOCK_REVIEWS = [
  {
    id: 'r1',
    author: 'Sarah M.',
    rating: 5,
    comment:
      'Absolutely amazing sound quality! The noise cancellation is top-notch. I wear these during my daily commute and they block out all the noise. Battery life is incredible — I only charge them once a week.',
    date: '2024-11-15',
    helpful: 24,
  },
  {
    id: 'r2',
    author: 'James K.',
    rating: 4,
    comment:
      'Great headphones overall. Sound quality is excellent and the build feels premium. Only minor complaint is that they can feel a bit tight after wearing for 3+ hours. Otherwise highly recommended!',
    date: '2024-10-28',
    helpful: 18,
  },
  {
    id: 'r3',
    author: 'Ahmed R.',
    rating: 5,
    comment:
      'Best purchase I have made this year. The Bluetooth range is impressive and the quick-charge feature is a lifesaver. 10 minutes of charging gives you 3 hours of playback!',
    date: '2024-10-05',
    helpful: 31,
  },
  {
    id: 'r4',
    author: 'Lisa T.',
    rating: 4,
    comment:
      'Comfortable and lightweight. The sound is clear with deep bass. Perfect for music and video calls. The carrying case is a nice touch for travel.',
    date: '2024-09-18',
    helpful: 12,
  },
];

// Fetch reviews data with caching and cache tag for revalidation
const getReviewsData = nextCache(
  async () => {
    // Simulate DB fetch delay
    await delay(1000);

    return {
      reviews: MOCK_REVIEWS,
      averageRating: 4.5,
      totalReviews: 247,
    };
  },
  ['product-reviews-data'],
  { tags: ['product-reviews'] }
);

// Star rating display component
function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'lg' }) {
  const sizeClass = size === 'lg' ? 'h-5 w-5' : 'h-3.5 w-3.5';
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < Math.floor(rating);
        const halfFilled = !filled && i < rating;
        return (
          <Star
            key={i}
            className={`${sizeClass} ${
              filled
                ? 'fill-amber-400 text-amber-400'
                : halfFilled
                  ? 'fill-amber-400/50 text-amber-400'
                  : 'fill-muted text-muted-foreground/30'
            }`}
          />
        );
      })}
    </div>
  );
}

// Product Reviews Stream — async server component
export async function ProductReviewsStream() {
  const { reviews, averageRating, totalReviews } = await getReviewsData();

  return (
    <div className="space-y-4">
      {/* Rating Summary */}
      <div className="flex items-center gap-3">
        <span className="text-2xl font-bold">{averageRating}</span>
        <div className="space-y-0.5">
          <StarRating rating={averageRating} size="sm" />
          <p className="text-xs text-muted-foreground">{totalReviews} reviews</p>
        </div>
      </div>

      <Separator />

      {/* Reviews List */}
      <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="rounded-lg border bg-muted/30 p-3 space-y-1.5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold">
                  {review.author.charAt(0)}
                </div>
                <span className="text-sm font-medium">{review.author}</span>
              </div>
              <span className="text-xs text-muted-foreground">{review.date}</span>
            </div>
            <StarRating rating={review.rating} />
            <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <ThumbsUp className="h-3 w-3" />
              <span>{review.helpful} found this helpful</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
