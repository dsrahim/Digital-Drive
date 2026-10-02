import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  ArrowLeftRight, 
  Coins, 
  ShieldCheck, 
  Sparkles, 
  Check, 
  ShoppingBag, 
  Plus, 
  Trash2, 
  Star, 
  Zap,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Product } from '../types';
import { BrandIcon } from './BrandIcon';

export const ProductCompareModal: React.FC = () => {
  const { 
    isCompareModalOpen, 
    setIsCompareModalOpen, 
    compareProductIds, 
    products, 
    toggleCompare, 
    clearCompare, 
    setSelectedProductForDetail,
    convertTokensToBDT
  } = useApp();

  const [searchPicker, setSearchPicker] = useState('');

  if (!isCompareModalOpen) return null;

  const compareList: Product[] = compareProductIds
    .map(id => products.find(p => p.id === id))
    .filter((p): p is Product => Boolean(p));

  const p1 = compareList[0] || null;
  const p2 = compareList[1] || null;

  // Available candidate products to fill empty slot 2
  const candidateProducts = products.filter(p => !compareProductIds.includes(p.id) && (
    !searchPicker || p.title.toLowerCase().includes(searchPicker.toLowerCase()) || p.category.toLowerCase().includes(searchPicker.toLowerCase())
  )).slice(0, 8);

  const handleSelectSlot = (product: Product) => {
    toggleCompare(product.id);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200 text-left overflow-y-auto"
      onClick={() => setIsCompareModalOpen(false)}
    >
      <div 
        className="relative w-full max-w-5xl bg-white border border-pink-200 rounded-3xl shadow-2xl p-4 sm:p-6 space-y-6 max-h-[92vh] overflow-y-auto my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-pink-100 sticky top-0 bg-white/95 backdrop-blur-md z-20 pt-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-500 text-white flex items-center justify-center shadow-md shadow-pink-500/20">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 font-display flex items-center gap-2">
                <span>Side-by-Side Product Comparison</span>
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-pink-50 text-pink-700 border border-pink-200">
                  {compareList.length}/2 Selected
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Compare prices, duration tiers, warranty coverage, and instant delivery specs
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {compareList.length > 0 && (
              <button
                onClick={clearCompare}
                className="px-3 py-1.5 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
                title="Clear comparison selection"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clear All</span>
              </button>
            )}
            <button
              onClick={() => setIsCompareModalOpen(false)}
              className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-pink-100 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
          
          {/* PRODUCT 1 SLOT */}
          <div className="bg-[#faf8f9] rounded-2xl border border-pink-100 p-4 space-y-4 relative flex flex-col justify-between">
            {p1 ? (
              <CompareProductColumn 
                product={p1} 
                otherProduct={p2}
                onRemove={() => toggleCompare(p1.id)} 
                onBuy={() => {
                  setIsCompareModalOpen(false);
                  setSelectedProductForDetail(p1);
                }}
                convertTokensToBDT={convertTokensToBDT}
              />
            ) : (
              <EmptySlotCard slotIndex={1} candidateProducts={candidateProducts} searchPicker={searchPicker} setSearchPicker={setSearchPicker} onSelect={handleSelectSlot} />
            )}
          </div>

          {/* PRODUCT 2 SLOT */}
          <div className="bg-[#faf8f9] rounded-2xl border border-pink-100 p-4 space-y-4 relative flex flex-col justify-between">
            {p2 ? (
              <CompareProductColumn 
                product={p2} 
                otherProduct={p1}
                onRemove={() => toggleCompare(p2.id)} 
                onBuy={() => {
                  setIsCompareModalOpen(false);
                  setSelectedProductForDetail(p2);
                }}
                convertTokensToBDT={convertTokensToBDT}
              />
            ) : (
              <EmptySlotCard slotIndex={2} candidateProducts={candidateProducts} searchPicker={searchPicker} setSearchPicker={setSearchPicker} onSelect={handleSelectSlot} />
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

// Sub-component for rendering a Product Comparison Column
const CompareProductColumn: React.FC<{
  product: Product;
  otherProduct: Product | null;
  onRemove: () => void;
  onBuy: () => void;
  convertTokensToBDT: (tokens: number) => number;
}> = ({ product, otherProduct, onRemove, onBuy, convertTokensToBDT }) => {
  const customCover = typeof product.customCoverUrl === 'string' && product.customCoverUrl.trim() !== '' ? product.customCoverUrl.trim() : null;
  const rawCover = typeof product.coverImage === 'string' && product.coverImage.trim() !== '' ? product.coverImage.trim() : null;
  const bannerImage = customCover || rawCover;

  const bdtPrice = convertTokensToBDT(product.priceDSTokens);

  // Price comparison highlight
  const isCheaper = otherProduct ? product.priceDSTokens < otherProduct.priceDSTokens : false;
  const hasBetterWarranty = otherProduct ? (Boolean(product.warranty) && !otherProduct.warranty) : false;

  return (
    <div className="space-y-4 flex-1 flex flex-col justify-between">
      {/* Top Banner & Header */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-700 uppercase border border-pink-200">
            {product.category}
          </span>
          <button
            onClick={onRemove}
            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            title="Remove from comparison"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Cover Preview */}
        <div className="w-full aspect-[16/9] rounded-xl overflow-hidden bg-white border border-pink-100 flex items-center justify-center relative mb-3">
          {bannerImage ? (
            <img src={bannerImage} alt={product.title} className="w-full h-full object-cover" />
          ) : (
            <div 
              className="w-full h-full flex flex-col items-center justify-center p-3 text-center"
              style={{ background: `radial-gradient(circle at 50% 40%, ${product.brandColor}22 0%, #ffffff 100%)` }}
            >
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm border border-white/60 mb-1"
                style={{ backgroundColor: `${product.brandColor}18` }}
              >
                <BrandIcon name={product.iconName} color={product.brandColor} className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800 line-clamp-1">{product.title}</span>
            </div>
          )}

          {isCheaper && (
            <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-white shadow-sm flex items-center gap-1">
              <Zap className="w-3 h-3 fill-white" />
              <span>Lowest Price</span>
            </span>
          )}
        </div>

        {/* Title & Description */}
        <h3 className="font-extrabold text-sm sm:text-base text-slate-900 font-display leading-snug line-clamp-2">
          {product.title}
        </h3>
        <p className="text-xs text-slate-500 line-clamp-2 mt-1">
          {product.description}
        </p>
      </div>

      {/* Feature Matrix */}
      <div className="space-y-3 pt-3 border-t border-pink-200/80 text-xs">
        
        {/* 1. Base Price & BDT Equivalent */}
        <div className="p-3 bg-white rounded-xl border border-pink-100 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Base Plan Price</span>
          <div className="flex items-baseline gap-2">
            <span className="font-mono font-extrabold text-base text-slate-900">
              {product.priceDSTokens.toLocaleString()} DS Tokens
            </span>
            <span className="text-[11px] font-mono font-semibold text-slate-500">
              (≈ ৳{bdtPrice.toLocaleString()})
            </span>
          </div>
        </div>

        {/* 2. Duration Options */}
        <div className="p-3 bg-white rounded-xl border border-pink-100 space-y-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Available Duration Plans</span>
          <div className="space-y-1">
            {(product.durationOptions || []).map((opt, idx) => (
              <div key={idx} className="flex justify-between items-center text-[11px] font-mono">
                <span className="text-slate-600 font-medium">{opt.label}</span>
                <span className="font-bold text-slate-900">{opt.priceDSTokens.toLocaleString()} DS</span>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Warranty Coverage */}
        <div className={`p-3 rounded-xl border flex items-center gap-2 ${
          product.warranty 
            ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900' 
            : 'bg-white border-slate-200 text-slate-400'
        }`}>
          <ShieldCheck className={`w-4 h-4 shrink-0 ${product.warranty ? 'text-emerald-600' : 'text-slate-400'}`} />
          <div>
            <span className="font-bold block text-[11px]">Warranty Guarantee</span>
            <span className="text-[11px] font-medium">{product.warranty || 'No explicit supplier warranty'}</span>
          </div>
        </div>

        {/* 4. Stock & Delivery Mechanism */}
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div className="p-2.5 bg-white rounded-xl border border-pink-100 space-y-0.5">
            <span className="text-[9px] text-slate-400 font-bold uppercase block">Stock State</span>
            <span className={`font-bold font-mono ${product.stock > 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
              {product.stock > 0 ? `${product.stock} available` : 'Out of Stock'}
            </span>
          </div>

          <div className="p-2.5 bg-white rounded-xl border border-pink-100 space-y-0.5">
            <span className="text-[9px] text-slate-400 font-bold uppercase block">Delivery Type</span>
            <span className="font-bold text-slate-800 flex items-center gap-1">
              <Zap className="w-3 h-3 text-pink-500 fill-pink-500" />
              <span>Instant</span>
            </span>
          </div>
        </div>

        {/* 5. Rating & Community Popularity */}
        <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-pink-100 text-[11px]">
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
            <span className="font-extrabold text-slate-900">{product.rating.toFixed(1)}</span>
            <span className="text-slate-400">/ 5.0</span>
          </div>
          <span className="text-slate-500 font-mono font-medium">{product.salesCount} sold</span>
        </div>

      </div>

      {/* Action Button */}
      <button
        onClick={onBuy}
        disabled={product.stock <= 0}
        className={`w-full py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md mt-4 ${
          product.stock <= 0
            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-pink-500/20 active:scale-95'
        }`}
      >
        <ShoppingBag className="w-4 h-4" />
        <span>{product.stock <= 0 ? 'Out of Stock' : 'Buy / View Options'}</span>
      </button>
    </div>
  );
};

// Sub-component for rendering empty comparison slot picker
const EmptySlotCard: React.FC<{
  slotIndex: number;
  candidateProducts: Product[];
  searchPicker: string;
  setSearchPicker: (q: string) => void;
  onSelect: (p: Product) => void;
}> = ({ slotIndex, candidateProducts, searchPicker, setSearchPicker, onSelect }) => {
  return (
    <div className="p-6 text-center space-y-4 my-auto min-h-[360px] flex flex-col items-center justify-center">
      <div className="w-12 h-12 rounded-2xl bg-pink-50 border border-pink-200 text-pink-500 flex items-center justify-center mx-auto shadow-xs">
        <Plus className="w-6 h-6 stroke-[3]" />
      </div>

      <div>
        <h3 className="font-extrabold text-slate-900 text-sm font-display">
          Select Product #{slotIndex} to Compare
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Pick a subscription from the list below to compare features
        </p>
      </div>

      <input
        type="text"
        placeholder="Filter subscriptions..."
        value={searchPicker}
        onChange={(e) => setSearchPicker(e.target.value)}
        className="w-full p-2.5 bg-white border border-pink-200 rounded-xl text-xs outline-none focus:border-pink-500"
      />

      <div className="w-full space-y-1.5 max-h-48 overflow-y-auto text-left">
        {candidateProducts.map(cand => (
          <button
            key={cand.id}
            onClick={() => onSelect(cand)}
            className="w-full p-2 bg-white hover:bg-pink-50 rounded-xl border border-pink-100 flex items-center justify-between text-xs transition-colors cursor-pointer"
          >
            <span className="font-bold text-slate-800 truncate pr-2">{cand.title}</span>
            <span className="font-mono font-extrabold text-pink-600 shrink-0">{cand.priceDSTokens} DS</span>
          </button>
        ))}
      </div>
    </div>
  );
};
