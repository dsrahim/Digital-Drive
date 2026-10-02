import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Heart, X, Trash2, ShoppingBag, Coins, ShieldCheck, Sparkles, Search, ExternalLink } from 'lucide-react';
import { BrandIcon } from './BrandIcon';

export const WishlistModal: React.FC = () => {
  const { 
    isWishlistModalOpen, 
    setIsWishlistModalOpen, 
    wishlistProducts, 
    wishlistIds, 
    toggleWishlist, 
    clearWishlist,
    setSelectedProductForDetail,
    setActiveView
  } = useApp();

  const [searchFilter, setSearchFilter] = useState('');

  if (!isWishlistModalOpen) return null;

  const filteredWishlist = wishlistProducts.filter(p => {
    if (!p) return false;
    if (!searchFilter.trim()) return true;
    const query = searchFilter.toLowerCase();
    const title = (p?.title || '').toLowerCase();
    const cat = (p?.category || '').toLowerCase();
    const desc = (p?.description || '').toLowerCase();
    return title.includes(query) || cat.includes(query) || desc.includes(query);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-3xl border border-pink-100 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-left animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-pink-50 via-rose-50/50 to-pink-50 border-b border-pink-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-500 text-white flex items-center justify-center shadow-md shadow-pink-500/20">
              <Heart className="w-5 h-5 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 font-display">
                  My Saved Wishlist
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 font-mono text-xs font-bold border border-pink-200">
                  {wishlistIds.length} {wishlistIds.length === 1 ? 'item' : 'items'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Quick access to your favorite subscriptions and AI tools
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {wishlistIds.length > 0 && (
              <button
                onClick={() => {
                  if (window.confirm('Clear all items from your wishlist?')) {
                    clearWishlist();
                  }
                }}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="Remove all saved items"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            )}

            <button
              onClick={() => setIsWishlistModalOpen(false)}
              className="p-2 rounded-2xl bg-white hover:bg-pink-100/70 text-slate-400 hover:text-slate-700 border border-pink-100 transition-colors shadow-xs"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Bar if 3+ items */}
        {wishlistProducts.length >= 3 && (
          <div className="p-3 bg-slate-50/70 border-b border-pink-50 shrink-0">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text"
                placeholder="Filter saved subscriptions..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl bg-white border border-pink-100 focus:border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-500/10 transition-all"
              />
            </div>
          </div>
        )}

        {/* Modal Body / Items List */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1 custom-scrollbar">
          {wishlistProducts.length === 0 ? (
            <div className="py-12 px-4 text-center space-y-4 max-w-sm mx-auto">
              <div className="w-16 h-16 rounded-3xl bg-pink-50 border border-pink-100 text-pink-500 flex items-center justify-center mx-auto shadow-inner">
                <Heart className="w-8 h-8 text-pink-400" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-slate-900 font-display">
                  Your Wishlist is Empty
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Save your favorite subscriptions, AI tools, and streaming passes by tapping the heart icon on any product card!
                </p>
              </div>
              <button
                onClick={() => {
                  setIsWishlistModalOpen(false);
                  setActiveView('store');
                }}
                className="px-5 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-2xl text-xs font-bold shadow-md shadow-pink-500/20 transition-all inline-flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Browse Subscriptions Catalog</span>
              </button>
            </div>
          ) : filteredWishlist.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500 space-y-2">
              <p>No saved subscriptions matching "{searchFilter}".</p>
              <button 
                onClick={() => setSearchFilter('')}
                className="text-pink-600 font-bold hover:underline"
              >
                Clear filter
              </button>
            </div>
          ) : (
            filteredWishlist.map(product => {
              if (!product) return null;
              const title = product?.title || 'Subscription Item';
              const category = product?.category || 'AI Tools';
              const priceTokens = typeof product?.priceDSTokens === 'number' ? product.priceDSTokens : 0;
              const brandColor = product?.brandColor || '#ec4899';
              const iconName = product?.iconName || 'Sparkles';
              const stockCount = typeof product?.stock === 'number' ? Math.max(0, product.stock) : 0;
              const isOutOfStock = stockCount <= 0;

              const customCover = typeof product?.customCoverUrl === 'string' && product.customCoverUrl.trim() !== '' ? product.customCoverUrl.trim() : null;
              const rawCover = typeof product?.coverImage === 'string' && product.coverImage.trim() !== '' ? product.coverImage.trim() : null;
              const coverUrl = customCover || rawCover;

              return (
                <div 
                  key={product.id}
                  className="p-3.5 bg-white hover:bg-pink-50/30 rounded-2xl border border-pink-100 hover:border-pink-200 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs group"
                >
                  {/* Thumbnail & Title Info */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-12 h-12 rounded-xl border border-pink-100 shrink-0 overflow-hidden bg-pink-50/50 flex items-center justify-center relative">
                      {coverUrl ? (
                        <img src={coverUrl} alt={title} className="w-full h-full object-cover" />
                      ) : (
                        <div 
                          className="w-full h-full flex items-center justify-center"
                          style={{ backgroundColor: `${brandColor}18` }}
                        >
                          <BrandIcon name={iconName} color={brandColor} className="w-6 h-6" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-pink-600 block">
                          {category}
                        </span>
                        {product?.warranty && (
                          <span className="text-[9px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-semibold border border-emerald-100 flex items-center gap-0.5">
                            <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" />
                            <span>{product.warranty}</span>
                          </span>
                        )}
                      </div>

                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-pink-600 transition-colors truncate font-display" title={title}>
                        {title}
                      </h4>

                      <div className="flex items-center gap-2 mt-1 text-[11px] font-mono">
                        <div className="flex items-center gap-1 font-bold text-slate-900">
                          <Coins className="w-3.5 h-3.5 text-pink-500" />
                          <span>{priceTokens.toLocaleString()} DS Tokens</span>
                        </div>
                        <span className="text-slate-300">·</span>
                        <span className={`text-[10px] font-bold ${isOutOfStock ? 'text-rose-600' : 'text-emerald-600'}`}>
                          {isOutOfStock ? 'Out of Stock' : `${stockCount} available`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-pink-50">
                    <button
                      onClick={() => toggleWishlist(product.id)}
                      className="p-2 rounded-xl text-rose-500 hover:text-rose-600 hover:bg-rose-50 transition-colors border border-rose-100"
                      title="Remove from wishlist"
                    >
                      <Heart className="w-4 h-4 fill-rose-500" />
                    </button>

                    <button
                      disabled={isOutOfStock}
                      onClick={() => {
                        setSelectedProductForDetail(product);
                        setIsWishlistModalOpen(false);
                      }}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        isOutOfStock 
                          ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed' 
                          : 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-sm shadow-pink-500/20 active:scale-95'
                      }`}
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>{isOutOfStock ? 'Unavailable' : 'View & Buy'}</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {wishlistIds.length > 0 && (
          <div className="p-3 sm:p-4 bg-slate-50 border-t border-pink-100 flex items-center justify-between text-xs text-slate-500 shrink-0">
            <span className="font-mono text-[11px]">
              Showing {filteredWishlist.length} saved {filteredWishlist.length === 1 ? 'subscription' : 'subscriptions'}
            </span>
            <button
              onClick={() => setIsWishlistModalOpen(false)}
              className="font-bold text-pink-600 hover:text-pink-700 flex items-center gap-1"
            >
              <span>Back to Store</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
