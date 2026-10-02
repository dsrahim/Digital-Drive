import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Zap, 
  Sparkles, 
  Coins, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

interface Slide {
  id: string;
  tag: string;
  title: string;
  highlight: string;
  subtitle: string;
  priceTokens: number;
  bdtPrice: number;
  bgGradient: string;
  buttonText: string;
  productId?: string;
  isTopUpPromo?: boolean;
}

export const HeroSlider: React.FC = () => {
  const { setSelectedProductForDetail, products, setIsTopUpModalOpen } = useApp();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides: Slide[] = [
    {
      id: 'slide-1',
      tag: 'INSTANT AUTOMATED DELIVERY',
      title: 'ChatGPT Plus & Claude 3.7 Pro',
      highlight: 'Delivered in 2 Seconds',
      subtitle: 'Official dedicated access with full GPT-4o, canvas reasoning, and Sonnet capabilities. Credentials generated automatically upon checkout.',
      priceTokens: 2430,
      bdtPrice: 2430,
      bgGradient: 'from-pink-500/10 via-rose-500/5 to-white',
      buttonText: 'Order AI Tools',
      productId: (products || []).find(p => p?.title?.includes('ChatGPT'))?.id || products?.[0]?.id
    },
    {
      id: 'slide-2',
      tag: 'HOT ENTERTAINMENT DEAL',
      title: 'Netflix 4K Ultra HD Premium',
      highlight: 'Private Profile + PIN Lock',
      subtitle: 'Pure 4K HDR streaming with your private PIN profile. 100% automated instant replenishment with full validity warranty.',
      priceTokens: 432,
      bdtPrice: 432,
      bgGradient: 'from-rose-500/10 via-pink-500/5 to-white',
      buttonText: 'Get Netflix 4K',
      productId: (products || []).find(p => p?.title?.includes('Netflix'))?.id || products?.[1]?.id
    },
    {
      id: 'slide-3',
      tag: 'CUSTOM CURRENCY WALLET',
      title: 'DS Token Live Wallet System',
      highlight: 'Zero Transaction Fees',
      subtitle: 'Top up instantly with bKash, Nagad, Binance USDT, or Bank. Real-time currency conversion with instant automated checkout on all subscriptions.',
      priceTokens: 1000,
      bdtPrice: 1000,
      bgGradient: 'from-amber-500/10 via-pink-500/5 to-white',
      buttonText: 'Top Up DS Tokens',
      isTopUpPromo: true
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const active = slides[currentSlide];

  const handleAction = () => {
    if (active.isTopUpPromo) {
      setIsTopUpModalOpen(true);
    } else if (active.productId) {
      const prod = products.find(p => p.id === active.productId);
      if (prod) setSelectedProductForDetail(prod);
    }
  };

  return (
    <div className="relative w-full mb-8 group">
      {/* Soft, elegant ambient blur & glow underneath banner */}
      <div className="absolute -inset-1 bg-gradient-to-r from-pink-500/25 via-rose-500/20 to-fuchsia-500/25 rounded-[32px] blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

      {/* Distinct Premium Card with drop-shadow-2xl and shadow-pink-500/20 */}
      <div className="relative w-full rounded-3xl overflow-hidden border border-pink-200/80 bg-white/95 backdrop-blur-md shadow-2xl shadow-pink-500/20 drop-shadow-2xl transition-all duration-300">
        {/* Background Gradient Mesh */}
        <div 
          className={`absolute inset-0 bg-gradient-to-r ${active.bgGradient} transition-all duration-700 pointer-events-none`}
        />
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-pink-200/40 via-rose-100/20 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Content Container */}
      <div className="relative z-10 px-6 py-8 sm:px-12 sm:py-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        
        <div className="max-w-2xl text-left">
          {/* Tag */}
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-pink-600 font-mono tracking-wider uppercase mb-3 bg-pink-50 px-3 py-1 rounded-full border border-pink-200">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{active.tag}</span>
            <span className="text-pink-300">·</span>
            <span className="text-slate-600 font-sans normal-case font-semibold text-[11px]">Instant 24/7 Delivery</span>
          </div>

          {/* Heading */}
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 font-display tracking-tight leading-tight text-balance">
            {active.title} <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-rose-500 to-fuchsia-600">
              {active.highlight}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl whitespace-normal break-words">
            {active.subtitle}
          </p>

          {/* Action Row */}
          <div className="mt-6 flex flex-wrap items-center gap-3 sm:gap-4">
            <button
              onClick={handleAction}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-pink-500/25 flex items-center gap-2 transition-all group"
            >
              <span>{active.buttonText}</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>

            <div className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-pink-50/80 border border-pink-200 text-xs">
              <Coins className="w-4 h-4 text-pink-500" />
              <span className="text-slate-900 font-mono font-extrabold">{active.priceTokens.toLocaleString()}</span>
              <span className="text-pink-600 font-bold uppercase text-[10px]">DS Tokens</span>
            </div>
          </div>
        </div>

        {/* Quick Highlights Card */}
        <div className="hidden lg:flex flex-col gap-3 bg-white/90 border border-pink-100 rounded-2xl p-5 w-72 backdrop-blur-md shadow-sm text-left">
          <div className="flex items-center justify-between text-xs pb-2 border-b border-pink-100">
            <span className="font-bold text-slate-900">Platform Guarantee</span>
            <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
              <Zap className="w-3 h-3 fill-emerald-600 text-emerald-600" />
              100% Automated
            </span>
          </div>

          <div className="flex items-center gap-2.5 text-xs text-slate-700">
            <div className="w-7 h-7 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center shrink-0 font-bold">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-slate-900">Instant Fulfillment</p>
              <p className="text-[10px] text-slate-500">Zero human delay delivery</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 text-xs text-slate-700">
            <div className="w-7 h-7 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center shrink-0 font-bold">
              <Coins className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-slate-900">DS Token Economy</p>
              <p className="text-[10px] text-slate-500">100% Token-Powered</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 text-xs text-slate-700">
            <div className="w-7 h-7 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center shrink-0 font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-slate-900">Encrypted Vault</p>
              <p className="text-[10px] text-slate-500">Secure credential storage</p>
            </div>
          </div>
        </div>

      </div>

      {/* Slide Navigation Dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`h-1.5 rounded-full transition-all ${
              idx === currentSlide ? 'w-6 bg-pink-500' : 'w-2 bg-pink-200 hover:bg-pink-300'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  </div>
);
};
