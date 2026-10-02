import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { X, Sparkles, ArrowRight, Bell } from 'lucide-react';

const STORAGE_KEY = 'digital_drive_announcement_last_seen_v2';
const COOLDOWN_HOURS = 12;

export const GlobalAnnouncementModal: React.FC = () => {
  const { settings, setActiveView } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Only check if pop-up feature is enabled in system settings
    if (!settings?.popupEnabled) return;

    const lastSeenStr = localStorage.getItem(STORAGE_KEY);
    const now = Date.now();

    if (lastSeenStr) {
      const lastSeenTime = parseInt(lastSeenStr, 10);
      const hoursPassed = (now - lastSeenTime) / (1000 * 60 * 60);

      // Enforce 12-hour cooldown period
      if (hoursPassed < COOLDOWN_HOURS) {
        return;
      }
    }

    // Delay slightly for smooth page entrance
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 1200);

    return () => clearTimeout(timer);
  }, [settings?.popupEnabled]);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
  };

  const handleAction = () => {
    handleClose();
    if (settings?.popupBtnUrl) {
      if (settings.popupBtnUrl.startsWith('/') || settings.popupBtnUrl.startsWith('#')) {
        if (settings.popupBtnUrl.includes('store')) setActiveView('store');
        else if (settings.popupBtnUrl.includes('dashboard')) setActiveView('dashboard');
      } else {
        window.open(settings.popupBtnUrl, '_blank');
      }
    }
  };

  if (!isOpen || !settings?.popupEnabled) return null;

  const defaultBanner = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop';
  const bannerImage = settings.popupBannerUrl || defaultBanner;
  const title = settings.popupTitle || '🎉 Exclusive VIP Subscription Drop & Discounts!';
  const description = settings.popupDescription || 'Get up to 40% OFF ElevenLabs, ChatGPT Plus, Claude 3.5 Sonnet, and Framer Pro with instant token delivery. Limited slots available!';
  const btnText = settings.popupBtnText || 'Claim Offer Now';

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={handleClose}
    >
      <div 
        className="bg-white border border-pink-100 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200 transition-all text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-3.5 right-3.5 w-9 h-9 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white flex items-center justify-center transition-all z-20 backdrop-blur-xs active:scale-95 cursor-pointer"
          title="Close Announcement"
          aria-label="Close Announcement"
        >
          <X className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* Banner Graphic Header */}
        <div className="relative h-48 sm:h-56 w-full bg-slate-900 overflow-hidden">
          <img 
            src={bannerImage} 
            alt="Announcement Banner" 
            className="w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          <div className="absolute bottom-3 left-4 right-4 flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-pink-500 text-white shadow-md flex items-center gap-1.5 uppercase tracking-wider">
              <Sparkles className="w-3 h-3" />
              <span>Special Announcement</span>
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 font-display leading-tight">
            {title}
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
            {description}
          </p>

          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={handleAction}
              className="flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-pink-500/25 transition-all active:scale-95 cursor-pointer"
            >
              <span>{btnText}</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>

            <button
              onClick={handleClose}
              className="px-4 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
