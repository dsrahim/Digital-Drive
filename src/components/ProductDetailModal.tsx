import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Zap, 
  Coins, 
  ShieldCheck, 
  Plus, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Check, 
  Info,
  Award,
  ArrowRight,
  Heart
} from 'lucide-react';
import { BrandIcon } from './BrandIcon';
import { DurationOption } from '../types';
import { useSupplierBalance } from '../hooks/useSupplierBalance';

export const ProductDetailModal: React.FC = () => {
  const { 
    selectedProductForDetail, 
    setSelectedProductForDetail, 
    currentUser, 
    placeOrder, 
    setIsTopUpModalOpen, 
    setActiveView,
    isInWishlist,
    toggleWishlist
  } = useApp();

  const [selectedDurationIndex, setSelectedDurationIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderResult, setOrderResult] = useState<{ success: boolean; message: string; orderId?: string } | null>(null);

  // Unconditional Hook Call (Must execute before any early return to satisfy React Rules of Hooks)
  const productPriceBDT = selectedProductForDetail?.baseSupplierPriceBDT;
  const { isLowBalance: isSupplierBalanceLow, balanceBDT: supplierBalanceBDT } = useSupplierBalance(productPriceBDT);

  if (!selectedProductForDetail) return null;

  const product = selectedProductForDetail;
  const isSaved = Boolean(product?.id && isInWishlist(product.id));
  const isOutOfStock = product?.stock === null || product?.stock === undefined || product?.stock <= 0;
  
  const durationOptions: DurationOption[] = Array.isArray(product?.durationOptions) && product.durationOptions.length > 0
    ? product.durationOptions
    : [
        {
          label: '1 Month Access',
          durationMonths: 1,
          priceDSTokens: product?.priceDSTokens ?? 0
        }
      ];

  const currentDuration: DurationOption = durationOptions[selectedDurationIndex] || durationOptions[0];
  const tokenPrice = currentDuration?.priceDSTokens ?? (product?.priceDSTokens ?? 0);
  const userBalance = currentUser?.tokenBalance ?? 0;
  const hasEnoughTokens = userBalance >= tokenPrice;
  const tokensNeeded = Math.max(0, tokenPrice - userBalance);

  const title = product?.title || 'Subscription Item';
  const description = product?.description || 'Automated digital subscription with guaranteed warranty.';
  const category = product?.category || 'AI Tools';
  const brandColor = product?.brandColor || '#ec4899';
  const iconName = product?.iconName || 'Sparkles';
  const stockCount = Math.max(0, product?.stock ?? 0);

  const handleBuy = async () => {
    if (!hasEnoughTokens || isOutOfStock || isSubmitting) return;

    setIsSubmitting(true);
    setOrderResult(null);

    const res = await placeOrder(
      product?.id || '',
      currentDuration?.label || '1 Month Access',
      currentDuration?.durationMonths || 1,
      tokenPrice
    );

    setIsSubmitting(false);
    setOrderResult(res);

    if (res.success) {
      setTimeout(() => {
        setSelectedProductForDetail(null);
        setActiveView('dashboard');
      }, 1500);
    }
  };

  const getFormatLabel = (fmt?: string) => {
    switch (fmt) {
      case 'email_password':
        return 'Dedicated Account (Private Email & Password + PIN)';
      case 'license_key':
        return 'Official Digital License Key';
      case 'invite_link':
        return 'VIP Direct Upgrade / Team Invite Link';
      case 'session_cookie':
        return 'Encrypted Session Token';
      default:
        return 'Instant Digital Credentials';
    }
  };

  const bannerImage: string | null = (product?.customCoverUrl && typeof product.customCoverUrl === 'string' && product.customCoverUrl.trim() !== '')
    ? product.customCoverUrl.trim()
    : (product?.coverImage && typeof product.coverImage === 'string' && product.coverImage.trim() !== '')
      ? product.coverImage.trim()
      : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/65 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl bg-white border border-pink-100 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Floating Close Button */}
        <button
          onClick={() => setSelectedProductForDetail(null)}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-2xl bg-white/90 hover:bg-pink-50 text-slate-500 hover:text-slate-900 border border-pink-100 flex items-center justify-center transition-all shadow-sm"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Scrollable Container: 2-Column Desktop Layout */}
        <div className="overflow-y-auto p-4 sm:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            
            {/* LEFT COLUMN: Visual Media, Brand Icon, Guarantee & Warranty Box (5 Cols on Desktop) */}
            <div className="lg:col-span-5 space-y-4">
              
              {/* Product Visual Card */}
              <div className="relative w-full aspect-[16/11] sm:aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-pink-50 via-rose-50/40 to-white border border-pink-100 flex items-center justify-center shadow-sm">
                {bannerImage ? (
                  <img 
                    src={bannerImage} 
                    alt={title} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center gap-3 p-6 text-center">
                    <div 
                      className="w-16 h-16 rounded-3xl flex items-center justify-center shadow-md border border-white/80"
                      style={{ backgroundColor: `${brandColor}18` }}
                    >
                      <BrandIcon name={iconName} color={brandColor} className="w-8 h-8" />
                    </div>
                    <span className="text-xs font-bold text-slate-700 tracking-wider font-display break-words whitespace-normal px-2">
                      {title}
                    </span>
                  </div>
                )}

                {/* Stock Tag on Image */}
                <div className="absolute top-3 left-3">
                  {isOutOfStock ? (
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-rose-600 text-white shadow-sm ring-1 ring-white/50">
                      Out of Stock
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-white/95 text-slate-800 border border-pink-200 shadow-sm backdrop-blur-sm">
                      {stockCount} units ready
                    </span>
                  )}
                </div>

                {product?.discountPercent && product.discountPercent > 0 && (
                  <div className="absolute top-3 right-3">
                    <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-pink-500 text-white shadow-sm">
                      {product.discountPercent}% OFF
                    </span>
                  </div>
                )}
              </div>

              {/* Official Validity Warranty (Conditional: Visible ONLY if product has warranty, completely hidden if none) */}
              {product?.warranty ? (
                <div className="p-4 bg-emerald-50/90 border border-emerald-200 rounded-2xl flex items-start gap-3 text-xs shadow-sm">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="font-extrabold text-emerald-950 block text-xs">Official Validity Warranty</span>
                    <p className="text-emerald-800 font-semibold mt-0.5 whitespace-normal break-words leading-relaxed text-[11px]">
                      {product.warranty}
                    </p>
                  </div>
                </div>
              ) : null}

              {/* Delivery Format & Trust Badges */}
              <div className="p-4 bg-pink-50/50 rounded-2xl border border-pink-100 space-y-2.5 text-xs text-slate-600">
                <div className="flex items-center gap-2 text-slate-900 font-bold">
                  <Award className="w-4 h-4 text-pink-500 shrink-0" />
                  <span>Verified Service Guarantee</span>
                </div>
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="break-words whitespace-normal">{getFormatLabel(product?.credentialFormat)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Immediate deposit to your encrypted Credential Vault</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>24/7 dedicated support assistance via WhatsApp</span>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Details, Pricing, Duration Options & Purchase Action (7 Cols on Desktop) */}
            <div className="lg:col-span-7 space-y-5">
              
              {/* Category & Title Header */}
              <div className="space-y-1 pr-8">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-bold text-pink-600 font-mono uppercase tracking-wider">
                    {category}
                  </span>
                  <span className="text-pink-300">·</span>
                  <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                    <Zap className="w-3 h-3 fill-emerald-600 text-emerald-600" />
                    Instant Automated Delivery
                  </span>
                </div>

                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug font-display whitespace-normal break-words">
                  {title}
                </h1>
              </div>

              {/* Status feedback alerts if order placed */}
              {orderResult && (
                <div className={`p-4 rounded-2xl border flex items-center gap-3 text-xs font-bold ${
                  orderResult.success 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}>
                  {orderResult.success ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <span className="whitespace-normal break-words">{orderResult.message} Opening your Credential Vault...</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                      <span className="whitespace-normal break-words">{orderResult.message}</span>
                    </>
                  )}
                </div>
              )}

              {/* Product Full Description */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-pink-500" />
                  <span>Subscription Features & Plan Overview</span>
                </h4>
                <div className="p-4 rounded-2xl bg-[#faf8f9] border border-pink-100 text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line break-words">
                  {description}
                </div>
              </div>

              {/* Dynamic Subscription Duration Options */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">
                    Plan Validity / Duration
                  </h4>
                  <span className="text-[11px] font-bold text-pink-600">Best Price Guaranteed</span>
                </div>

                {durationOptions.length === 1 ? (
                  <div className="p-3.5 rounded-2xl bg-pink-50/70 border border-pink-200 flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-900 font-display">
                      {durationOptions[0]?.label || '1 Month Access'}
                    </span>
                    <div className="flex items-center gap-1 text-pink-600 font-mono font-extrabold text-sm">
                      <Coins className="w-3.5 h-3.5 text-pink-500" />
                      <span>{(durationOptions[0]?.priceDSTokens ?? tokenPrice).toLocaleString()} DS Tokens</span>
                    </div>
                  </div>
                ) : (
                  <div className={`grid grid-cols-1 ${durationOptions.length === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-3'} gap-2.5`}>
                    {durationOptions.map((opt, idx) => {
                      const isSelected = idx === selectedDurationIndex;
                      const optPrice = opt?.priceDSTokens ?? 0;

                      return (
                        <div
                          key={idx}
                          onClick={() => setSelectedDurationIndex(idx)}
                          className={`relative p-3.5 rounded-2xl border cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-pink-50/90 border-pink-500 shadow-sm ring-1 ring-pink-400'
                              : 'bg-white border-pink-100 hover:border-pink-300'
                          }`}
                        >
                          {opt?.discountTag && (
                            <span className="absolute -top-2 right-2 text-[9px] font-bold font-mono px-2 py-0.5 rounded-full bg-pink-500 text-white shadow-sm">
                              {opt.discountTag}
                            </span>
                          )}
                          <span className="text-xs font-bold text-slate-900 block mb-1 whitespace-normal break-words">
                            {opt?.label || '1 Month'}
                          </span>
                          <div className="flex items-center gap-1 text-pink-600 font-mono font-extrabold text-sm">
                            <Coins className="w-3.5 h-3.5 text-pink-500" />
                            <span>{optPrice.toLocaleString()}</span>
                            <span className="text-[10px] text-pink-600 uppercase">DS Tokens</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Pricing & Wallet Summary Box (Strict Token-Only Calculation) */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-pink-50/60 to-rose-50/20 border border-pink-100 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-bold">Total Subscription Price:</span>
                  <div className="flex items-center gap-1.5 font-mono font-extrabold text-base text-pink-600">
                    <Coins className="w-4 h-4 text-pink-500" />
                    <span>{tokenPrice.toLocaleString()} DS Tokens</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-pink-100">
                  <span className="text-slate-600 font-bold">Your Wallet Balance:</span>
                  <span className="font-mono font-bold text-pink-600">
                    {userBalance.toLocaleString()} DS Tokens
                  </span>
                </div>

                {!hasEnoughTokens && !isOutOfStock && (
                  <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-rose-900 bg-rose-50 p-2.5 rounded-xl border border-rose-200 font-semibold">
                    <span className="break-words">Short by {tokensNeeded.toLocaleString()} DS Tokens</span>
                    <button
                      onClick={() => {
                        setSelectedProductForDetail(null);
                        setIsTopUpModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-pink-500 hover:bg-pink-600 text-white font-bold text-[11px] flex items-center justify-center gap-1 transition-colors shadow-sm self-start sm:self-auto"
                    >
                      <Plus className="w-3 h-3 stroke-[3]" />
                      <span>Add Funds Now</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Action Buttons: 100% strict disable if out of stock */}
              <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => product?.id && toggleWishlist(product.id)}
                  className={`w-full sm:w-auto px-4 py-3 rounded-2xl text-xs font-bold border transition-colors flex items-center justify-center gap-1.5 ${
                    isSaved
                      ? 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100'
                      : 'bg-white text-slate-700 border-pink-200 hover:bg-pink-50 hover:text-pink-600'
                  }`}
                  title={isSaved ? "Saved in Wishlist" : "Save to Wishlist"}
                >
                  <Heart className={`w-4 h-4 ${isSaved ? 'fill-rose-500 text-rose-500' : ''}`} />
                  <span>{isSaved ? 'Saved' : 'Wishlist'}</span>
                </button>

                <button
                  onClick={() => setSelectedProductForDetail(null)}
                  className="w-full sm:w-auto px-5 py-3 rounded-2xl text-xs font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-pink-50 border border-pink-200 transition-colors"
                >
                  Close
                </button>

                {isOutOfStock ? (
                  <button
                    disabled
                    className="w-full sm:flex-1 py-3 px-6 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none"
                  >
                    <span>Currently Out of Stock</span>
                  </button>
                ) : isSupplierBalanceLow ? (
                  <button
                    disabled
                    className="w-full sm:flex-1 py-3 px-6 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 bg-amber-100 text-amber-800 border border-amber-300 cursor-not-allowed shadow-none"
                    title={`Supplier wholesale pool balance (৳${supplierBalanceBDT.toLocaleString()} BDT) is less than required price (৳${product?.baseSupplierPriceBDT?.toLocaleString() || 0} BDT). Order placement paused until pool refill.`}
                  >
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Supplier Balance Insufficient</span>
                  </button>
                ) : hasEnoughTokens ? (
                  <button
                    onClick={handleBuy}
                    disabled={isSubmitting}
                    className="w-full sm:flex-1 py-3 px-6 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-pink-500/25 active:scale-[0.99]"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Generating Secure Credentials...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 fill-white" />
                        <span>Confirm Purchase ({tokenPrice.toLocaleString()} DS)</span>
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setSelectedProductForDetail(null);
                      setIsTopUpModalOpen(true);
                    }}
                    className="w-full sm:flex-1 py-3 px-6 rounded-2xl text-xs sm:text-sm font-bold bg-pink-500 hover:bg-pink-600 text-white flex items-center justify-center gap-2 transition-all shadow-md shadow-pink-500/25 active:scale-[0.99]"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>Top Up Wallet (Need {tokensNeeded.toLocaleString()} DS)</span>
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
