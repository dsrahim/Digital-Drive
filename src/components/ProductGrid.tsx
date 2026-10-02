import React from 'react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';
import { ProductCardSkeleton } from './ProductCardSkeleton';
import { ErrorBoundary } from './ErrorBoundary';

interface ProductGridProps {
  products: Product[];
  emptyMessage?: string;
  showRanks?: boolean;
  isLoading?: boolean;
  pageSize?: number;
}

export const ProductGrid: React.FC<ProductGridProps> = ({ 
  products, 
  emptyMessage = 'No subscriptions found matching your query.',
  showRanks = false,
  isLoading = false,
  pageSize = 24
}) => {
  // If in loading/transition state, display 24 skeleton cards to prevent layout shift
  if (isLoading) {
    return (
      <div 
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-3.5 lg:gap-4 w-full"
        aria-busy="true"
        aria-label="Loading subscriptions"
      >
        {Array.from({ length: pageSize }).map((_, idx) => (
          <ProductCardSkeleton key={`skeleton-load-${idx}`} />
        ))}
      </div>
    );
  }

  // Defensive filter: Eliminate any null or malformed items from API/cache
  const validProducts = (products || []).filter(
    (product): product is Product => Boolean(product && typeof product === 'object')
  );

  if (validProducts.length === 0) {
    return (
      <div className="w-full py-16 px-6 text-center rounded-3xl bg-white border border-pink-100 shadow-sm">
        <p className="text-xs sm:text-sm font-bold text-slate-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <ErrorBoundary fallbackTitle="Product Catalog Guard Active" fallbackMessage="One or more products could not be displayed. Rest of the catalog is preserved.">
      {/* CRITICAL GRID RULE: Exactly 2 cols on mobile (grid-cols-2), exactly 6 cols on large screens (lg:grid-cols-6) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-3.5 lg:gap-4 w-full">
        {validProducts.map((product, index) => (
          <ErrorBoundary 
            key={product?.id || `product_${index}`}
            fallback={<ProductCardSkeleton />}
          >
            <ProductCard 
              product={product} 
              rankBadge={showRanks ? index + 1 : undefined}
            />
          </ErrorBoundary>
        ))}
      </div>
    </ErrorBoundary>
  );
};
