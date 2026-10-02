import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ProductCard } from './ProductCard';
import { TrendingUp, Play, Pause } from 'lucide-react';

export const TopTrendingSection: React.FC = () => {
  const { topTrending, settings } = useApp();
  const [isPaused, setIsPaused] = useState(false);

  const isAutoScrollEnabled = settings.topTrendingAutoScroll !== false;
  // Calculate continuous linear scroll speed based on admin setting
  const baseSpeedPerCard = Math.max(1, settings.sliderAutoScrollSpeedSec || 3);
  const marqueeDurationSec = Math.max(18, topTrending.length * baseSpeedPerCard * 1.6);

  if (topTrending.length === 0) return null;

  return (
    <section 
      id="top-trending-section" 
      className="mb-8 sm:mb-10 text-left relative"
    >
      {/* Clean Cohesive Section Header Block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 pb-3 border-b border-pink-100">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-fuchsia-500 flex items-center justify-center text-white shadow-md shadow-pink-500/20 shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg md:text-2xl font-bold text-slate-900 tracking-tight font-display">
                Top 10 Trending Subscriptions
              </h2>
              <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-700 border border-pink-200 shrink-0 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-500 animate-pulse"></span>
                <span>Infinite Marquee ({isPaused ? 'Paused' : 'Continuous'})</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5 line-clamp-1">
              Top order volume and instant delivery velocity streaming continuously with zero snapping
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
            const safeTopTrending = (topTrending || []).filter(p => Boolean(p && typeof p === 'object'));
            return [...safeTopTrending, ...safeTopTrending].map((product, idx) => {
              const rank = safeTopTrending.length > 0 ? (idx % safeTopTrending.length) + 1 : 1;
              return (
                <div 
                  key={product?.id ? `${product.id}-trending-marquee-${idx}` : `trend-${idx}`}
                  className="w-[210px] sm:w-[230px] md:w-[250px] lg:w-[270px] shrink-0 p-1.5 transition-transform hover:scale-[1.02]"
                >
                  <ProductCard product={product} rankBadge={rank} />
                </div>
              );
            });
          })()}
        </div>
      </div>

      {/* Caption & Indicator */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 px-1">
        <span>Hover over any trending subscription to pause and inspect</span>
        <span className="font-mono text-[10px]">Speed: {baseSpeedPerCard}s / card · Linear Loop</span>
      </div>
    </section>
  );
};
