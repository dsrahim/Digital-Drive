import React from 'react';
import { useApp } from '../context/AppContext';
import { ArrowLeftRight, X, Sparkles } from 'lucide-react';

export const CompareFloatingBar: React.FC = () => {
  const { 
    compareProductIds, 
    compareProducts, 
    toggleCompare, 
    clearCompare, 
    setIsCompareModalOpen 
  } = useApp();

  if (compareProductIds.length === 0) return null;

  return (
    <aside 
      aria-label="Product Comparison Tray"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-in slide-in-from-bottom-5 fade-in duration-200"
    >
      <div className="flex items-center gap-3 backdrop-blur-xl bg-slate-900/95 text-white border border-pink-500/30 rounded-full py-2.5 px-4 sm:px-5 shadow-2xl shadow-pink-500/20 text-xs">
        
        {/* Icon & Label */}
        <div className="flex items-center gap-2 pr-2 border-r border-slate-700/80">
          <div className="w-7 h-7 rounded-full bg-pink-500 text-white flex items-center justify-center font-bold shadow-sm">
            <ArrowLeftRight className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold hidden sm:inline">Compare</span>
        </div>

        {/* Selected Items Previews */}
        <div className="flex items-center gap-2">
          {compareProducts.map(prod => (
            <div 
              key={prod.id} 
              className="flex items-center gap-1.5 bg-slate-800/90 border border-slate-700 px-2.5 py-1 rounded-full text-[11px] max-w-[140px] sm:max-w-[180px]"
            >
              <span className="font-extrabold text-pink-400 truncate">{prod.title}</span>
              <button
                onClick={() => toggleCompare(prod.id)}
                className="text-slate-400 hover:text-white rounded-full p-0.5 shrink-0"
                title="Remove"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}

          {compareProducts.length === 1 && (
            <span className="text-[11px] text-slate-400 font-mono italic hidden md:inline">
              (Select 1 more item)
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-700/80">
          <button
            onClick={() => setIsCompareModalOpen(true)}
            className="px-4 py-1.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-extrabold shadow-sm active:scale-95 transition-all flex items-center gap-1.5 whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Compare ({compareProducts.length}/2)</span>
          </button>

          <button
            onClick={clearCompare}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title="Clear all comparison selections"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </aside>
  );
};
