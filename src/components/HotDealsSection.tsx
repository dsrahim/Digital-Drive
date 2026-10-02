import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ProductCard } from './ProductCard';
import { Flame, Play, Pause } from 'lucide-react';

export const HotDealsSection: React.FC = () => {
  const { hotDeals, settings } = useApp();
  const [isPaused, setIsPaused] = useState(false);

  const isAutoScrollEnabled = settings.hotDealsAutoScroll !== false;
  // Calculate continuous linear scroll speed based on admin setting (e.g. 3s per card)
  const baseSpeedPerCard = Math.max(1, settings.sliderAutoScrollSpeedSec || 3);
  const marqueeDurationSec = Math.max(16, hotDeals.length * baseSpeedPerCard * 1.5);

  if (hotDeals.length === 0) return null;

  return (
    <section 
      id="hot-deals-section" 
      className="mb-8 sm:mb-10 text-left relative"
    >
      {/* Clean Cohesive Section Header Block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 pb-3 border-b border-pink-100">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-500 flex items-center justify-center text-white shadow-md shadow-pink-500/20 shrink-0">
            <Flame className="w-5 h-5 fill-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg md:text-2xl font-bold text-slate-900 tracking-tight font-display">
                Hot Deals & Limited Drops
              </h2>
              <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-700 border border-pink-200 shrink-0 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse"></span>
                <span>Infinite Marquee ({isPaused ? 'Paused' : 'Continuous'})</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5 line-clamp-1">
              Discounted wholesale subscriptions streaming in an infinite linear loop with instant delivery
            </p>
          </div>
        </div>

        {/* Play/Pause Control Button */}
        <div className="flex items-center justify-end gap-2 shrink-0 self-end sm:self-center">
          <button
            onClick={() => setIsPaused(prev => !prev)}
            aria-label={isPaused ? 'Resume auto-scroll' : 'Pause auto-scroll'}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-pink-50 active:scale-95 border border-pink-200 text-slate-600 hover:text-pink-600 flex items-center gap-1.5 text-xs font-bold transition-all shadow-xs"
            title={isPaused ? 'Resume infinite marquee' : 'Pause infinite marquee'}
          >
            {isPaused ? (
              <>
                <Play className="w-3.5 h-3.5 text-pink-600 fill-pink-600" />
                <span className="text-[11px]">Resume</span>
              </>
            ) : (
              <>
                <Pause className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-[11px]">Pause</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Continuous Infinite Marquee Track (Pure CSS, Loop: true, Linear, Zero Jumps) */}
      <div 
        className="infinite-marquee-container relative overflow-hidden w-full rounded-2xl py-1 group"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Soft edge blur vignettes */}
        <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-[#faf7f8] via-[#faf7f8]/80 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-[#faf7f8] via-[#faf7f8]/80 to-transparent z-10 pointer-events-none" />

        <div 
          className={`infinite-marquee-track ${isPaused || !isAutoScrollEnabled ? 'is-paused' : ''}`}
          style={{
            '--marquee-speed': `${marqueeDurationSec}s`
          } as React.CSSProperties}
        >
          {/* Exactly 2 identical halves ensure seamless 100% infinite linear scrolling */}
          {(() => {
            const safeHotDeals = (hotDeals || []).filter(p => Boolean(p && typeof p === 'object'));
            return [...safeHotDeals, ...safeHotDeals].map((product, idx) => (
              <div 
                key={product?.id ? `${product.id}-marquee-${idx}` : `deal-${idx}`}
                className="w-[210px] sm:w-[230px] md:w-[250px] lg:w-[270px] shrink-0 p-1.5 transition-transform hover:scale-[1.02]"
              >
                <ProductCard product={product} />
              </div>
            ));
          })()}
        </div>
      </div>

      {/* Caption & Indicator */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 px-1">
        <span>Hover over any deal to pause marquee</span>
        <span className="font-mono text-[10px]">Speed: {baseSpeedPerCard}s / card · Linear Loop</span>
      </div>
    </section>
  );
};
