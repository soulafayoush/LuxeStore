'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/i18n';

interface ProductFilterProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export function ProductFilter({ categories, activeCategory, onCategoryChange }: ProductFilterProps) {
  const { t } = useLanguage();
  const allCategories = ['All', ...categories];

  return (
    <div className="flex flex-wrap justify-center gap-2 mb-8">
      {allCategories.map((cat) => (
        <Button
          key={cat}
          variant={activeCategory === cat ? 'default' : 'outline'}
          size="sm"
          onClick={() => onCategoryChange(cat)}
          className="rounded-full px-4 h-8 text-sm font-medium transition-all"
        >
          {cat === 'All' ? t('products.all') : cat}
        </Button>
      ))}
    </div>
  );
}
