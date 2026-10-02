import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Search, 
  Layers, 
  Bot, 
  Tv, 
  ShieldCheck, 
  Palette, 
  Gamepad2, 
  Code2,
  X,
  Heart,
  ArrowUpDown
} from 'lucide-react';
import { ProductCategory, ProductSortOption } from '../types';

export const CategoryFilter: React.FC = () => {
  const { 
    categories, 
    selectedCategory, 
    setSelectedCategory, 
    searchQuery, 
    setSearchQuery,
    sortBy,
    setSortBy,
    wishlistIds,
    setIsWishlistModalOpen
  } = useApp();

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'AI Tools':
        return <Bot className="w-3.5 h-3.5" />;
      case 'Streaming':
        return <Tv className="w-3.5 h-3.5" />;
      case 'VPN & Security':
        return <ShieldCheck className="w-3.5 h-3.5" />;
      case 'Productivity & Design':
        return <Palette className="w-3.5 h-3.5" />;
      case 'Gaming & Utilities':
        return <Gamepad2 className="w-3.5 h-3.5" />;
      case 'Developer Tools':
        return <Code2 className="w-3.5 h-3.5" />;
      default:
        return <Layers className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="mb-6 space-y-3 text-left">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 sm:pb-0 scrollbar-none min-w-0">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === 'All'
                ? 'bg-pink-500 text-white shadow-md shadow-pink-500/20'
                : 'bg-white text-slate-600 hover:text-pink-600 hover:bg-pink-50/50 border border-pink-100 shadow-sm'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All Subscriptions</span>
          </button>

          {/* Wishlist Quick Filter Chip */}
          <button
            onClick={() => setIsWishlistModalOpen(true)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
              wishlistIds.length > 0
                ? 'bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 shadow-sm'
                : 'bg-white text-slate-600 hover:text-pink-600 hover:bg-pink-50/50 border border-pink-100 shadow-sm'
            }`}
            title="Open Saved Wishlist"
          >
            <Heart className={`w-3.5 h-3.5 ${wishlistIds.length > 0 ? 'fill-rose-500 text-rose-500' : ''}`} />
            <span>Wishlist</span>
            {wishlistIds.length > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] bg-rose-500 text-white rounded-full font-mono font-bold">
                {wishlistIds.length}
              </span>
            )}
          </button>

          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-pink-500 text-white shadow-md shadow-pink-500/20'
                  : 'bg-white text-slate-600 hover:text-pink-600 hover:bg-pink-50/50 border border-pink-100 shadow-sm'
              }`}
            >
              {getCategoryIcon(cat)}
              <span>{cat}</span>
            </button>
          ))}
        </div>

        {/* Controls: Sorting Dropdown & Live Search Bar */}
        <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0">
          
          {/* Sorting Dropdown */}
          <div className="relative shrink-0">
            <div className="flex items-center gap-1.5 px-3 py-2 bg-white border border-pink-200 hover:border-pink-300 rounded-2xl text-xs font-bold text-slate-800 shadow-sm transition-all">
              <ArrowUpDown className="w-3.5 h-3.5 text-pink-500 shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as ProductSortOption)}
                className="bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer pr-1"
                aria-label="Sort subscriptions catalog"
              >
                <option value="featured">✨ Featured</option>
                <option value="price_low_high">🏷️ Price: Low to High</option>
                <option value="price_high_low">💎 Price: High to Low</option>
                <option value="popularity">🔥 Most Popular</option>
                <option value="discount">⚡ Highest Discount</option>
              </select>
            </div>
          </div>

          {/* Live Search Bar for Catalog */}
          <div className="relative w-full md:w-64 lg:w-72 shrink-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ChatGPT, Netflix, VPN..."
              className="w-full bg-white border border-pink-200 focus:border-pink-500 rounded-2xl pl-10 pr-9 py-2 text-xs font-medium text-slate-900 placeholder-slate-400 outline-none transition-all shadow-sm focus:shadow-md focus:shadow-pink-500/10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-pink-600 p-0.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
