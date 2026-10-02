import React from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  isLoading = false
}) => {
  if (totalPages <= 1) return null;

  // Calculate item range e.g. 1-24 of 84
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(totalItems, currentPage * pageSize);

  // Helper to generate smart pagination range with ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always include page 1
      pages.push(1);

      if (currentPage > 3) {
        pages.push('...');
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      // Always include last page
      pages.push(totalPages);
    }

    return pages;
  };

  const handlePageClick = (page: number) => {
    if (page === currentPage || page < 1 || page > totalPages || isLoading) return;
    onPageChange(page);
  };

  return (
    <div className="mt-8 pt-6 border-t border-pink-100/80 flex flex-col sm:flex-row items-center justify-between gap-4 select-none">
      {/* Items Range Summary */}
      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
        <span className="inline-flex items-center gap-1 font-mono font-bold text-pink-600 bg-pink-50 px-2.5 py-1 rounded-full border border-pink-200/80">
          <Sparkles className="w-3 h-3 text-pink-500" />
          <span>Page {currentPage} of {totalPages}</span>
        </span>
        <span className="hidden sm:inline text-slate-400">·</span>
        <span className="hidden sm:inline text-slate-600 font-medium">
          Showing <span className="font-bold text-slate-900 font-mono">{startItem}–{endItem}</span> of <span className="font-bold text-slate-900 font-mono">{totalItems}</span> subscriptions
        </span>
      </div>

      {/* Pagination Controls */}
      <nav aria-label="Catalog pagination" className="flex items-center gap-1.5 sm:gap-2">
        {/* Previous Button */}
        <button
          onClick={() => handlePageClick(currentPage - 1)}
          disabled={currentPage === 1 || isLoading}
          className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
            currentPage === 1 || isLoading
              ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed'
              : 'bg-white text-slate-700 hover:text-pink-600 hover:bg-pink-50 border-pink-200/80 shadow-xs active:scale-95'
          }`}
          aria-label="Previous Page"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Previous</span>
        </button>

        {/* Page Number Buttons */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {getPageNumbers().map((item, index) => {
            if (item === '...') {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="w-8 h-8 flex items-center justify-center text-xs text-slate-400 font-bold select-none"
                >
                  …
                </span>
              );
            }

            const pageNum = Number(item);
            const isActive = pageNum === currentPage;

            return (
              <button
                key={`page-${pageNum}`}
                onClick={() => handlePageClick(pageNum)}
                disabled={isLoading}
                aria-current={isActive ? 'page' : undefined}
                aria-label={`Go to page ${pageNum}`}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl text-xs font-bold font-mono transition-all flex items-center justify-center ${
                  isActive
                    ? 'bg-gradient-to-tr from-pink-500 to-rose-500 text-white shadow-md shadow-pink-500/25 ring-2 ring-pink-300 scale-105'
                    : 'bg-white text-slate-700 hover:text-pink-600 hover:bg-pink-50 border border-pink-200/80 shadow-xs active:scale-95'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <button
          onClick={() => handlePageClick(currentPage + 1)}
          disabled={currentPage === totalPages || isLoading}
          className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
            currentPage === totalPages || isLoading
              ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed'
              : 'bg-white text-slate-700 hover:text-pink-600 hover:bg-pink-50 border-pink-200/80 shadow-xs active:scale-95'
          }`}
          aria-label="Next Page"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </nav>
    </div>
  );
};
