import React from 'react';

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div 
      className="relative flex flex-col justify-between bg-white border border-pink-100 rounded-2xl p-3 sm:p-3.5 overflow-hidden text-left shadow-[0_2px_12px_rgba(0,0,0,0.03)] animate-pulse"
      aria-hidden="true"
    >
      {/* Top Banner Skeleton */}
      <div className="flex items-center justify-between gap-1.5 mb-2 min-w-0">
        <div className="w-16 h-3 bg-pink-100/70 rounded-md" />
        <div className="w-12 h-3 bg-pink-100/60 rounded-full" />
      </div>

      {/* Visual Cover Container Skeleton */}
      <div className="w-full aspect-[16/10] sm:aspect-[16/11] rounded-xl mb-2.5 flex items-center justify-center relative overflow-hidden bg-pink-50/60 border border-pink-100/60">
        <div className="w-10 h-10 rounded-2xl bg-pink-200/40" />
        <div className="absolute bottom-1.5 right-1.5 w-14 h-3.5 bg-white/80 rounded-full border border-pink-100" />
      </div>

      {/* Title & Description Skeleton */}
      <div className="flex-1 flex flex-col justify-start mb-2.5 space-y-1.5 min-w-0">
        <div className="w-4/5 h-3.5 bg-slate-200 rounded-md" />
        <div className="w-3/5 h-3 bg-slate-100 rounded-md" />
        <div className="w-24 h-3 bg-emerald-100/60 rounded-md mt-1" />
      </div>

      {/* Pricing & Footer Row Skeleton */}
      <div className="pt-2 border-t border-pink-50 flex flex-col gap-1.5 mt-auto">
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-full bg-pink-200/80" />
          <div className="w-16 h-4 bg-slate-200 rounded-md font-mono" />
          <div className="w-8 h-2.5 bg-pink-100 rounded-md" />
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="w-16 h-3 bg-slate-100 rounded-md" />
          <div className="w-14 h-5 bg-pink-200/80 rounded-xl" />
        </div>
      </div>
    </div>
  );
};
