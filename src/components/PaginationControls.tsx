import React from 'react';
import { useApp } from '../context/AppContext';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

interface PaginationControlsProps {
  onPageChange?: (page: number) => void;
  className?: string;
}

export const PaginationControls: React.FC<PaginationControlsProps> = ({ 
  onPageChange,
  className = ''
}) => {
  const { 
    currentPage, 
    totalPages, 
    totalProductsCount, 
    isProductsLoading, 
    fetchProductsByPage 
  } = useApp();

  if (totalPages <= 1) {
    return null;
  }

  const handlePageClick = async (page: number) => {
    if (page === currentPage || page < 1 || page > totalPages || isProductsLoading) return;
    
    if (onPageChange) {
      onPageChange(page);
    }
    
    await fetchProductsByPage(page);
  };

  // Helper to generate smart page numbers list with ellipsis
  const getPageNumbers = () => {
    const pages: (number | '...')[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage <= 3) {
        end = 4;
      } else if (currentPage >= totalPages - 2) {
        start = totalPages - 3;
      }

      if (start > 2) {
        pages.push('...');
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 1) {
        pages.push('...');
      }

      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();
  const startItem = Math.min((currentPage - 1) * 24 + 1, totalProductsCount);
  const endItem = Math.min(currentPage * 24, totalProductsCount);

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 py-6 border-t border-slate-200/80 mt-8 ${className}`}>
      {/* Item Range & Current Page Indicator */}
      <div className="text-xs font-semibold text-slate-600 flex items-center gap-2">
        {isProductsLoading ? (
          <span className="flex items-center gap-1.5 text-pink-600">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Fetching Page {currentPage}...</span>
          </span>
        ) : (
          <span>
            Showing <strong className="text-slate-900 font-extrabold">{startItem}–{endItem}</strong> of{' '}
            <strong className="text-slate-900 font-extrabold">{totalProductsCount}</strong> subscriptions
            <span className="ml-1 text-slate-400 font-normal">(Page {currentPage} of {totalPages})</span>
          </span>
        )}
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center gap-1.5 flex-wrap justify-center">
        {/* Previous Button */}
        <button
          onClick={() => handlePageClick(currentPage - 1)}
          disabled={currentPage === 1 || isProductsLoading}
          aria-label="Previous Page"
          className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-pink-50 hover:border-pink-200 hover:text-pink-600 font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs disabled:opacity-40 disabled:hover:bg-white disabled:hover:border-slate-200 disabled:hover:text-slate-700 disabled:cursor-not-allowed cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Previous</span>
        </button>

        {/* Page Number Buttons */}
        <div className="flex items-center gap-1">
          {pageNumbers.map((page, idx) => {
            if (page === '...') {
              return (
                <span key={`ellipsis-${idx}`} className="px-2 text-xs font-bold text-slate-400 select-none">
                  ...
                </span>
              );
            }

            const isCurrent = page === currentPage;

            return (
              <button
                key={`page-${page}`}
                onClick={() => handlePageClick(page)}
                disabled={isProductsLoading}
                aria-label={`Page ${page}`}
                className={`min-w-[36px] h-9 px-2.5 rounded-xl font-extrabold text-xs transition-all shadow-xs flex items-center justify-center cursor-pointer ${
                  isCurrent
                    ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md shadow-pink-500/20 scale-105 border border-pink-500'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-pink-50 hover:border-pink-200 hover:text-pink-600'
                }`}
              >
                {page}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <button
          onClick={() => handlePageClick(currentPage + 1)}
          disabled={currentPage === totalPages || isProductsLoading}
          aria-label="Next Page"
          className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-pink-50 hover:border-pink-200 hover:text-pink-600 font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs disabled:opacity-40 disabled:hover:bg-white disabled:hover:border-slate-200 disabled:hover:text-slate-700 disabled:cursor-not-allowed cursor-pointer"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
