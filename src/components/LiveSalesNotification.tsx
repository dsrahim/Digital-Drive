import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { X, CheckCircle2, Zap, Coins, ShoppingBag } from 'lucide-react';
import { LiveSalesEvent, LiveSalesApiResponse } from '../types';
import { TextAvatar } from './TextAvatar';

export const LiveSalesNotification: React.FC = () => {
  const { products, setSelectedProductForDetail } = useApp();
  const [salesEvents, setSalesEvents] = useState<LiveSalesEvent[]>([]);
  const [activeItem, setActiveItem] = useState<LiveSalesEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Clean customer names (e.g. "Mehedi", "Tanvir", "Samiya")
  const getFallbackFeed = useCallback((): LiveSalesEvent[] => {
    const customerNames = [
      'Mehedi', 'Tanvir', 'Samiya', 'Asif',
      'Maria', 'Farhan', 'Shakil', 'Sadia'
    ];

    const fallback: LiveSalesEvent[] = [];
    const now = Date.now();

    customerNames.forEach((firstName, idx) => {
      const prod = products[idx % (products.length || 1)];
      const isTopUp = idx % 3 === 0;

      fallback.push({
        id: `local_evt_${idx}`,
        telegramName: firstName,
        customerName: firstName,
        productName: isTopUp 
          ? `${[1000, 1500, 2500][idx % 3].toLocaleString()} DS Tokens to Wallet`
          : (prod?.title || 'ChatGPT Plus (GPT-4o & Canvas)'),
        action: isTopUp ? 'Topped Up' : 'Purchased',
        amountDSTokens: isTopUp ? 1000 : (prod?.priceDSTokens || 2430),
        timestamp: new Date(now - idx * 45000).toISOString(),
        timeAgo: idx === 0 ? 'Just now' : `${idx * 2}m ago`,
        avatarSeed: firstName
      });
    });

    return fallback;
  }, [products]);

  const fetchCachedSales = useCallback(async () => {
    try {
      const response = await fetch('/api/live-sales', {
        headers: { 'Accept': 'application/json' },
        cache: 'default'
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data: LiveSalesApiResponse = await response.json();

      if (data.success && Array.isArray(data.events) && data.events.length > 0) {
        // Clean customer names from events (strip handles)
        const cleanedEvents = data.events.map(evt => {
          const rawName = (evt.customerName || evt.telegramName || 'Customer').replace(/^@/, '');
          const firstName = rawName.split(/[\s_.-]/)[0];
          return {
            ...evt,
            customerName: firstName,
            telegramName: firstName
          };
        });
        setSalesEvents(cleanedEvents);
      } else {
        setSalesEvents(getFallbackFeed());
      }
    } catch {
      setSalesEvents(getFallbackFeed());
    }
  }, [getFallbackFeed]);

  useEffect(() => {
    fetchCachedSales();
    const interval = setInterval(fetchCachedSales, 30000);
    return () => clearInterval(interval);
  }, [fetchCachedSales]);

  useEffect(() => {
    if (isDismissed || salesEvents.length === 0) return;

    let index = 0;
    let timer: NodeJS.Timeout;
    let switchTimeout: NodeJS.Timeout;

    const initialDelay = setTimeout(() => {
      setActiveItem(salesEvents[0]);
      setIsVisible(true);
    }, 1500);

    const scheduleNext = () => {
      timer = setTimeout(() => {
        if (!isHovered) {
          setIsVisible(false);

          switchTimeout = setTimeout(() => {
            index = (index + 1) % salesEvents.length;
            setActiveItem(salesEvents[index]);
            setIsVisible(true);
            scheduleNext();
          }, 650);
        } else {
          scheduleNext();
        }
      }, 5000);
    };

    const loopStarter = setTimeout(scheduleNext, 2000);

    return () => {
      clearTimeout(initialDelay);
      clearTimeout(loopStarter);
      clearTimeout(timer);
      clearTimeout(switchTimeout);
    };
  }, [isDismissed, isHovered, salesEvents]);

  if (isDismissed || !activeItem) return null;

  const handleItemClick = () => {
    if (activeItem.action === 'Purchased') {
      const match = products.find(p => 
        p.title.toLowerCase().includes(activeItem.productName.toLowerCase()) ||
        activeItem.productName.toLowerCase().includes(p.title.toLowerCase())
      );
      if (match) setSelectedProductForDetail(match);
    }
  };

  const cleanFirstName = (activeItem.customerName || activeItem.telegramName || 'Customer').replace(/^@/, '').split(/[\s_.-]/)[0];

  return (
    <aside 
      aria-label="Live customer activity notification"
      className={`fixed bottom-20 sm:bottom-6 left-3 sm:left-6 z-40 transition-all duration-500 ease-out transform ${
        isVisible 
          ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' 
          : 'opacity-0 translate-y-4 scale-95 pointer-events-none'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Glassmorphic Card Container */}
      <div 
        onClick={handleItemClick}
        className="group relative flex items-center gap-3 backdrop-blur-xl bg-white/95 hover:bg-white border border-pink-200/80 hover:border-pink-300 rounded-3xl p-3 sm:py-2.5 sm:px-4 shadow-xl shadow-pink-500/10 hover:shadow-2xl hover:shadow-pink-500/20 cursor-pointer transition-all duration-300 max-w-[340px] sm:max-w-md text-left select-none overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-pink-100/50 rounded-full blur-2xl pointer-events-none" />

        {/* Clean Text Avatar for First Name */}
        <div className="relative shrink-0">
          <TextAvatar name={cleanFirstName} size="md" />
          <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
            <CheckCircle2 className="w-2 h-2 text-white stroke-[3]" />
          </span>
        </div>

        {/* Details */}
        <div className="min-w-0 flex-1 pr-1 relative z-10">
          <div className="flex items-center gap-1.5 text-xs text-slate-800 leading-tight truncate">
            {/* Customer First Name (e.g. Mehedi) */}
            <span className="font-extrabold text-slate-900 tracking-tight font-display text-xs">
              {cleanFirstName}
            </span>
            <span className="text-slate-500 text-[11px] font-medium">
              {activeItem.action.toLowerCase()}
            </span>
          </div>

          <div className="font-bold text-slate-900 text-xs truncate group-hover:text-pink-600 transition-colors mt-0.5">
            {activeItem.productName}
          </div>

          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
            <span>{activeItem.timeAgo}</span>
            <span>·</span>
            <span className="text-emerald-700 font-semibold flex items-center gap-0.5">
              <Zap className="w-2.5 h-2.5 fill-emerald-600 text-emerald-600" />
              Instant Delivery
            </span>
          </div>
        </div>

        {/* Close */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsVisible(false);
            setTimeout(() => setIsDismissed(true), 350);
          }}
          className="w-6 h-6 rounded-full text-slate-400 hover:text-slate-700 hover:bg-pink-50 flex items-center justify-center transition-colors shrink-0 relative z-10"
          title="Dismiss live feed"
          aria-label="Dismiss recent activity"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
};
