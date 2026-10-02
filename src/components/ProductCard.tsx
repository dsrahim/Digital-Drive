import React, { useState } from 'react';
import { Product } from '../types';
import { BrandIcon } from './BrandIcon';
import { Zap, Coins, Star, ShieldCheck, ShoppingBag, Sparkles, Heart, ArrowLeftRight, Share2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface ProductCardProps {
  product: Product;
  rankBadge?: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, rankBadge }) => {
  const { setSelectedProductForDetail, isInWishlist, toggleWishlist, toggleCompare, isInCompare, addToast } = useApp();
  const [imageError, setImageError] = useState(false);

  // Strict null/undefined guard for crash-proof rendering
  if (!product || typeof product !== 'object') return null;

  const isSaved = Boolean(product?.id && isInWishlist(product.id));
  const isCompared = Boolean(product?.id && isInCompare(product.id));

  // Safe fallback values with intense Optional Chaining
  const title = product?.title || 'Unknown Product';
  const description = product?.description || 'No description available for this subscription.';
  const category = product?.category || 'AI Tools';
  const brandColor = product?.brandColor || '#ec4899';
  const iconName = product?.iconName || 'Sparkles';
  const priceTokens = typeof product?.priceDSTokens === 'number' ? product.priceDSTokens : 0;
  const rating = typeof product?.rating === 'number' ? product.rating : 4.9;
  const salesCount = typeof product?.salesCount === 'number' ? product.salesCount : 0;
  const stockCount = typeof product?.stock === 'number' ? Math.max(0, product.stock) : 0;

  // Strict Stock check: 0, null, or undefined is strictly Out of Stock
  const isOutOfStock = product?.stock === null || product?.stock === undefined || stockCount <= 0;

  // Determine active banner: Admin custom upload takes priority, then coverImage
  const customCover = typeof product?.customCoverUrl === 'string' && product.customCoverUrl.trim() !== '' ? product.customCoverUrl.trim() : null;
  const rawCover = typeof product?.coverImage === 'string' && product.coverImage.trim() !== '' ? product.coverImage.trim() : null;
  const bannerImage: string | null = (!imageError && (customCover || rawCover)) || null;

  const hasDiscountBadge = Boolean(
    (product?.showDiscountBadge === true && Boolean(product?.customDiscountLabel)) || 
    (typeof product?.discountPercent === 'number' && product.discountPercent > 0)
  );
  const discountLabel = product?.customDiscountLabel || (typeof product?.discountPercent === 'number' && product.discountPercent > 0 ? `Save ${product.discountPercent}%` : '');

  return (
    <div 
      onClick={() => setSelectedProductForDetail(product)}
      className={`group relative flex flex-col justify-between bg-white hover:bg-[#fffbfc] border ${
        product?.isHotDeal 
          ? 'border-pink-300 shadow-[0_4px_20px_rgba(244,63,94,0.09)] hover:border-pink-400 hover:shadow-[0_12px_32px_rgba(244,63,94,0.18)]' 
          : 'border-pink-100/90 hover:border-pink-300/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_28px_rgba(244,63,94,0.12)]'
      } rounded-2xl p-3 sm:p-3.5 transition-all duration-300 ease-out cursor-pointer overflow-hidden text-left hover:-translate-y-1 hover:scale-[1.025] transform-gpu`}
    >
      {/* Top Banner & Rank Indicator */}
      <div className="flex items-center justify-between gap-1.5 mb-2 min-w-0">
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          {rankBadge !== undefined && (
            <span className="shrink-0 flex items-center justify-center w-5 h-5 rounded-md bg-pink-500 text-white text-[11px] font-bold font-mono shadow-sm">
              #{rankBadge}
            </span>
          )}
          <span className="text-[11px] font-semibold text-slate-500 truncate block">
            {category}
          </span>
        </div>

        {hasDiscountBadge ? (
          <span className="text-[10px] font-bold font-mono text-pink-600 bg-pink-50/90 px-1.5 py-0.5 rounded-full border border-pink-200 shrink-0 shadow-xs flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5 text-pink-500 shrink-0" />
            <span>{discountLabel}</span>
          </span>
        ) : (
          <span className="text-[10px] font-bold text-pink-600 flex items-center gap-0.5 shrink-0">
            <Zap className="w-3 h-3 text-pink-500 fill-pink-500" />
            <span className="hidden sm:inline">Instant</span>
          </span>
        )}
      </div>

      {/* Visual Cover Container with Default Image Placeholders & Wishlist Overlay */}
      <div className="w-full aspect-[16/10] sm:aspect-[16/11] rounded-xl mb-2.5 flex items-center justify-center relative overflow-hidden bg-pink-50/50 border border-pink-100 transition-transform duration-300 group-hover:scale-[1.02]">
        {/* Overlay Buttons: Compare & Wishlist */}
        <div className="absolute top-1.5 left-1.5 right-1.5 z-20 flex items-center justify-between pointer-events-none">
          {/* Compare Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (product?.id) toggleCompare(product.id);
            }}
            className={`pointer-events-auto p-1.5 rounded-full backdrop-blur-md transition-all duration-200 shadow-sm flex items-center gap-1 ${
              isCompared 
                ? 'bg-slate-900 text-white scale-105 shadow-pink-500/20 ring-2 ring-pink-400' 
                : 'bg-white/80 hover:bg-white text-slate-500 hover:text-pink-600 hover:scale-105'
            }`}
            title={isCompared ? "Remove from Compare" : "Add to Compare"}
            aria-label={isCompared ? "Remove from Compare" : "Add to Compare"}
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            {isCompared && <span className="text-[9px] font-extrabold pr-0.5">Compare</span>}
          </button>

          {/* Right Group: Share & Wishlist Buttons */}
          <div className="flex items-center gap-1.5 pointer-events-auto">
            {/* Minimal Share Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                const shareUrl = `${window.location.origin}/?product=${product.id}`;
                navigator.clipboard.writeText(shareUrl);
                addToast({
                  type: 'info',
                  title: 'Link Copied!',
                  message: `Shareable product link for "${title}" copied to clipboard.`,
                  durationMs: 4000
                });
              }}
              className="p-1.5 rounded-full bg-white/80 hover:bg-white text-slate-500 hover:text-pink-600 hover:scale-105 backdrop-blur-md transition-all duration-150 shadow-sm cursor-pointer"
              title="Share Product Link"
              aria-label="Share Product Link"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>

            {/* Wishlist Heart Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (product?.id) toggleWishlist(product.id);
              }}
              className={`p-1.5 rounded-full backdrop-blur-md transition-all duration-150 shadow-sm cursor-pointer ${
                isSaved 
                  ? 'bg-white text-rose-500 scale-105 shadow-pink-500/20 ring-2 ring-pink-400' 
                  : 'bg-white/80 hover:bg-white text-slate-400 hover:text-rose-500 hover:scale-105'
              }`}
              title={isSaved ? "Remove from Wishlist" : "Save to Wishlist"}
              aria-label={isSaved ? "Remove from Wishlist" : "Save to Wishlist"}
            >
              <Heart className={`w-3.5 h-3.5 transition-colors ${isSaved ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
          </div>
        </div>

        {bannerImage ? (
          <img 
            src={bannerImage} 
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            onError={() => setImageError(true)}
          />
        ) : (
          <div 
            className="w-full h-full flex flex-col items-center justify-center relative p-3 text-center transition-all duration-300"
            style={{
              background: `radial-gradient(circle at 50% 40%, ${brandColor}22 0%, #ffffff 100%)`
            }}
          >
            <div 
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shadow-md border border-white/60 backdrop-blur-sm mb-1 transition-transform duration-300 group-hover:scale-110"
              style={{ backgroundColor: `${brandColor}18` }}
            >
              <BrandIcon name={iconName} color={brandColor} className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <span className="text-[10px] font-bold text-slate-600 line-clamp-1 max-w-[90%] font-display">
              {title}
            </span>
          </div>
        )}

        {/* Stock Badge Overlay: 100% Exact Supplier Stock Status */}
        <div className="absolute bottom-1.5 right-1.5 z-10">
          {isOutOfStock ? (
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-rose-600 text-white shadow-sm ring-1 ring-white/50">
              Out of Stock
            </span>
          ) : (
            <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/95 text-slate-700 border border-pink-200 shadow-sm backdrop-blur-sm">
              {stockCount} in stock
            </span>
          )}
        </div>
      </div>

      {/* Title & Description with Strict Line Clamps & Clean Ellipsis */}
      <div className="flex-1 flex flex-col justify-start mb-2.5 min-w-0">
        <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug group-hover:text-pink-600 transition-colors duration-200 font-display line-clamp-2 break-words" title={title}>
          {title}
        </h3>
        <p className="text-[11px] text-slate-500 line-clamp-1 mt-1 font-normal break-words" title={description}>
          {description}
        </p>

        {/* Warranty Tag (Render ONLY if product has warranty; completely hide if none) */}
        {product?.warranty ? (
          <div className="mt-1.5 flex items-center gap-1 text-[10px] text-emerald-700 font-semibold bg-emerald-50/80 px-2 py-0.5 rounded-md border border-emerald-200/60 max-w-full">
            <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
            <span className="truncate">{product.warranty}</span>
          </div>
        ) : null}
      </div>

      {/* Pricing & Footer Row */}
      <div className="pt-2 border-t border-pink-100 flex flex-col gap-1.5 mt-auto">
        <div className="flex items-baseline justify-between min-w-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <Coins className="w-3.5 h-3.5 text-pink-500 shrink-0" />
            <span className="text-sm sm:text-base font-extrabold text-slate-900 font-mono tabular-nums tracking-tight truncate">
              {priceTokens.toLocaleString()}
            </span>
            <span className="text-[10px] font-bold text-pink-600 uppercase shrink-0">DS Tokens</span>
          </div>
        </div>

        {/* Quick Meta Footer */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 gap-1">
          <div className="flex items-center gap-1 min-w-0 truncate">
            <Star className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />
            <span className="font-bold text-slate-700">{rating.toFixed(1)}</span>
            <span className="text-slate-300">·</span>
            <span className="text-slate-500 truncate">{salesCount} sold</span>
          </div>

          {/* Conditional Action Button: Active when in stock, strictly disabled/grayed out when out of stock */}
          <button 
            disabled={isOutOfStock}
            onClick={(e) => {
              e.stopPropagation();
              if (!isOutOfStock) {
                setSelectedProductForDetail(product);
              }
            }}
            className={`text-[11px] font-bold px-2.5 py-1 rounded-xl transition-all duration-200 whitespace-nowrap shrink-0 flex items-center gap-1 ${
              isOutOfStock 
                ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60'
                : 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-sm shadow-pink-500/25 active:scale-95'
            }`}
          >
            {isOutOfStock ? (
              <span>Out of Stock</span>
            ) : (
              <>
                <ShoppingBag className="w-3 h-3" />
                <span>Buy Now</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
