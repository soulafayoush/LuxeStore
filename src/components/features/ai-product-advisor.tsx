'use client';

import React, { useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Search,
  Sparkles,
  Loader2,
  ShoppingBag,
  X,
  Send,
  Zap,
} from 'lucide-react';

// =============================================================================
// Types
// =============================================================================

interface ProductResult {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  comparePrice?: number | null;
  stock: number;
  images: string[];
  category?: { name: string; slug: string } | null;
  colors: { name: string; hex: string }[];
  isAvailable: boolean;
}

interface SearchResponse {
  success: boolean;
  query: string;
  filters: {
    colors: string[];
    categories: string[];
    priceRange: { min: number; max: number } | null;
    keywords: string[];
    sentiment: string;
  };
  explanation: string;
  results: ProductResult[];
  totalResults: number;
}

interface AIAdvice {
  message: string;
  products: ProductResult[];
  reason: string;
}

// =============================================================================
// AI Product Advisor Component
// =============================================================================

interface AIProductAdvisorProps {
  viewedProducts?: ProductResult[];
  currentCategory?: string;
}

export function AIProductAdvisor({
  viewedProducts = [],
  currentCategory,
}: AIProductAdvisorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<ProductResult[]>([]);
  const [searchExplanation, setSearchExplanation] = useState('');
  const [appliedFilters, setAppliedFilters] = useState<string[]>([]);
  const [aiAdvice, setAiAdvice] = useState<AIAdvice | null>(null);
  const [isGeneratingAdvice, setIsGeneratingAdvice] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestedQueries = [
    'I want a dress the color of the sea',
    'Premium wireless headphones under 700',
    'Luxury gold accessories',
    'Affordable sports shoes',
    'Black elegant watch',
  ];

  // Handle semantic search
  const handleSearch = useCallback(async (query?: string) => {
    const searchQueryText = query || searchQuery.trim();
    if (!searchQueryText) return;

    setIsSearching(true);
    setError(null);
    setSearchResults([]);
    setSearchExplanation('');
    setAiAdvice(null);

    try {
      const response = await fetch('/api/search/semantic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQueryText }),
      });

      const data: SearchResponse = await response.json();

      if (data.success) {
        setSearchResults(data.results);
        setSearchExplanation(data.explanation);

        const filterTags: string[] = [];
        data.filters.colors.forEach((c) => filterTags.push(`Color: ${c}`));
        data.filters.categories.forEach((c) => filterTags.push(`Category: ${c}`));
        if (data.filters.priceRange) {
          filterTags.push(`${data.filters.priceRange.min}-${data.filters.priceRange.max} SAR`);
        }
        if (data.filters.sentiment !== 'neutral') {
          filterTags.push(data.filters.sentiment === 'budget' ? 'Budget Friendly' : 'Premium');
        }
        setAppliedFilters(filterTags);

        // Request AI advice via API route (not direct SDK import)
        if (data.results.length > 0) {
          generateAdvice(searchQueryText, data.results);
        }
      } else {
        setError(data.error || 'Search failed. Please try again.');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to connect to the search service. Please try again.');
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery]);

  // Generate personalized AI advice via API (server-side SDK)
  const generateAdvice = useCallback(
    async (query: string, results: ProductResult[]) => {
      setIsGeneratingAdvice(true);
      try {
        const response = await fetch('/api/search/ai-advice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query,
            results,
            viewedProducts,
            currentCategory,
          }),
        });

        const data = await response.json();

        if (data.success && data.advice) {
          setAiAdvice(data.advice);
        } else {
          // Fallback advice
          setAiAdvice({
            message: `Based on your search for "${query}", I found ${results.length} great options for you!`,
            reason: 'These products match your preferences closely.',
            products: results.slice(0, 2),
          });
        }
      } catch (err) {
        console.warn('AI advice fetch failed:', err);
        setAiAdvice({
          message: `Based on your search for "${query}", I found ${results.length} great options for you!`,
          reason: 'These products match your preferences closely.',
          products: results.slice(0, 2),
        });
      } finally {
        setIsGeneratingAdvice(false);
      }
    },
    [viewedProducts, currentCategory]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isSearching) {
      handleSearch();
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSearchExplanation('');
    setAppliedFilters([]);
    setAiAdvice(null);
    setError(null);
    inputRef.current?.focus();
  };

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="h-5 w-5 text-amber-500" />
          AI Smart Search
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Search in natural language &mdash; e.g. &quot;I want a blue dress under 300 SAR&quot;
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Input */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              placeholder="Describe what you're looking for..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isSearching}
              className="pl-9 pr-9"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>
          <Button
            onClick={() => handleSearch()}
            disabled={!searchQuery.trim() || isSearching}
            size="default"
          >
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Suggested Queries */}
        {!searchResults.length && !isSearching && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Try these searches
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestedQueries.map((q) => (
                <button
                  key={q}
                  onClick={() => {
                    setSearchQuery(q);
                    handleSearch(q);
                  }}
                  className="inline-flex items-center gap-1 text-xs rounded-full border px-3 py-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                >
                  <Zap className="h-3 w-3" />
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading State */}
        {isSearching && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>AI is understanding your query...</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-32 rounded-lg" />
              ))}
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-800 dark:text-red-300">
            {error}
          </div>
        )}

        {/* Applied Filters */}
        {appliedFilters.length > 0 && !isSearching && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Filters:</span>
            {appliedFilters.map((filter) => (
              <Badge key={filter} variant="secondary" className="text-xs">
                {filter}
              </Badge>
            ))}
          </div>
        )}

        {/* Search Explanation */}
        {searchExplanation && !isSearching && (
          <p className="text-sm text-muted-foreground">{searchExplanation}</p>
        )}

        {/* AI Advice */}
        {aiAdvice && !isSearching && (
          <div className="rounded-lg border bg-amber-50 dark:bg-amber-900/10 p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                AI Personal Recommendation
              </span>
            </div>
            <p className="text-sm text-amber-800 dark:text-amber-300 leading-relaxed">
              {aiAdvice.message}
            </p>
            {aiAdvice.reason && (
              <p className="text-xs text-amber-700 dark:text-amber-400 italic">
                {aiAdvice.reason}
              </p>
            )}
          </div>
        )}

        {/* Search Results */}
        {searchResults.length > 0 && !isSearching && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">
              {searchResults.length} Result{searchResults.length !== 1 ? 's' : ''}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {searchResults.map((product) => (
                <div
                  key={product.id}
                  className="flex gap-3 rounded-lg border p-3 hover:bg-muted/30 transition-colors"
                >
                  <div className="h-20 w-20 rounded-lg bg-muted flex-shrink-0 overflow-hidden">
                    {product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{product.name}</p>
                    {product.category && (
                      <p className="text-xs text-muted-foreground">{product.category.name}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-bold">{product.price} SAR</span>
                      {product.comparePrice && (
                        <span className="text-xs text-muted-foreground line-through">
                          {product.comparePrice} SAR
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      {product.isAvailable ? (
                        <Badge variant="secondary" className="text-xs px-1.5 py-0 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          In Stock
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs px-1.5 py-0 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                          Out of Stock
                        </Badge>
                      )}
                      {product.colors.length > 0 && (
                        <div className="flex gap-0.5">
                          {product.colors.slice(0, 3).map((c) => (
                            <div
                              key={c.hex}
                              className="h-3 w-3 rounded-full border border-muted-foreground/20"
                              style={{ backgroundColor: c.hex }}
                              title={c.name}
                            />
                          ))}
                          {product.colors.length > 3 && (
                            <span className="text-xs text-muted-foreground">
                              +{product.colors.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {searchResults.length === 0 && searchExplanation && !isSearching && !error && (
          <div className="text-center py-6">
            <ShoppingBag className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              No products found. Try different keywords or filters.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
