import React, { useRef } from 'react';
import { useApp } from '../context/AppContext';
import { HeroSlider } from './HeroSlider';
import { HotDealsSection } from './HotDealsSection';
import { TopTrendingSection } from './TopTrendingSection';
import { CategoryFilter } from './CategoryFilter';
import { ProductGrid } from './ProductGrid';
import { PaginationControls } from './PaginationControls';
import { CompareFloatingBar } from './CompareFloatingBar';
import { ProductCompareModal } from './ProductCompareModal';
import { ErrorBoundary } from './ErrorBoundary';
import { Layers } from 'lucide-react';

export const StoreView: React.FC = () => {
  const { 
    products, 
    selectedCategory, 
    searchQuery,
    currentPage,
    totalPages,
    totalProductsCount,
    isProductsLoading
  } = useApp();

  const ITEMS_PER_PAGE = 24;
  const catalogHeaderRef = useRef<HTMLDivElement>(null);

  const isFiltering = selectedCategory !== 'All' || (searchQuery || '').trim() !== '';

  const handlePageChange = () => {
    // Smoothly scroll back to top of catalog
    if (catalogHeaderRef.current) {
      catalogHeaderRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-6 text-left">
      {/* Show Hero Slider & Featured Sections only when on main catalog view */}
      {!isFiltering && (
        <>
          <ErrorBoundary fallbackTitle="Hero Slider Unavailable" fallbackMessage="Hero promotions temporarily bypassed. Catalog is accessible below.">
            <HeroSlider />
          </ErrorBoundary>
          
          <ErrorBoundary fallbackTitle="Hot Deals Section Unavailable" fallbackMessage="Deals feed bypassed due to temporary data error.">
            <HotDealsSection />
          </ErrorBoundary>

          <ErrorBoundary fallbackTitle="Top Trending Section Unavailable" fallbackMessage="Trending feed bypassed due to temporary data error.">
            <TopTrendingSection />
          </ErrorBoundary>
        </>
      )}

      {/* Main Catalog Header */}
      <div ref={catalogHeaderRef} className="mb-4 scroll-mt-20">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-xl bg-pink-50 border border-pink-200 flex items-center justify-center text-pink-600 shadow-sm">
            <Layers className="w-4 h-4" />
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight font-display">
            {isFiltering ? `Filtered Subscriptions (${totalProductsCount})` : 'All Subscriptions Catalog'}
          </h2>
        </div>
        <p className="text-[11px] text-slate-500 font-medium">
          {isFiltering 
            ? `Showing results for ${selectedCategory !== 'All' ? selectedCategory : ''} ${searchQuery ? `"${searchQuery}"` : ''}` 
            : `Explore premium verified digital accounts, streaming passes, and AI tools · Page ${currentPage} of ${totalPages}`}
        </p>
      </div>

      {/* Category Tabs & Search Bar */}
      <CategoryFilter />

      {/* Strict 2-col on Mobile / 6-col on Desktop Grid: Only 24 items loaded in state for active page */}
      <ErrorBoundary fallbackTitle="Catalog Grid Shield Active" fallbackMessage="Unable to render product items. Click below to reload.">
        <ProductGrid 
          products={products} 
          isLoading={isProductsLoading}
          pageSize={ITEMS_PER_PAGE}
          emptyMessage={
            isFiltering 
              ? `No subscriptions found matching "${searchQuery || selectedCategory}". Try clearing your filters.`
              : 'Catalog is currently loading products...'
          }
        />
      </ErrorBoundary>

      {/* Pagination Controls Component */}
      <PaginationControls onPageChange={handlePageChange} />

      {/* Side-by-Side Product Comparison Drawer & Modal */}
      <CompareFloatingBar />
      <ProductCompareModal />
    </div>
  );
};
