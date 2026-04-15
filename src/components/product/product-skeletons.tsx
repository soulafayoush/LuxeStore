import { Skeleton } from '@/components/ui/skeleton';

// Skeleton loader for the price stream section
export function PriceSkeleton() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-6 w-16" />
      </div>
      <Skeleton className="h-5 w-36" />
      <Skeleton className="h-10 w-full mt-2" />
    </div>
  );
}

// Skeleton loader for the stock stream section
export function StockSkeleton() {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-4 w-28" />
      </div>
      <Skeleton className="h-3 w-48" />
    </div>
  );
}

// Skeleton loader for the reviews stream section
export function ReviewsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-6 w-6" />
        <Skeleton className="h-6 w-28" />
        <Skeleton className="h-4 w-20" />
      </div>
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-lg border p-3 space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16 ml-auto" />
            </div>
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, j) => (
                <Skeleton key={j} className="h-4 w-4 rounded-sm" />
              ))}
            </div>
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        ))}
      </div>
    </div>
  );
}
