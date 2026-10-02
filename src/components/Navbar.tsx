import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Shield, 
  KeyRound, 
  User, 
  LogOut, 
  ChevronDown,
  Sparkles,
  CreditCard,
  Layers,
  CheckCircle2,
  Lock,
  Heart,
  Search,
  X
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { 
    currentUser, 
    isLoggedIn,
    logoutUser,
    setIsAuthModalOpen,
    switchUserRole, 
    setIsTopUpModalOpen, 
    activeView, 
    setActiveView,
    searchQuery,
    setSearchQuery,
    settings,
    orders,
    wishlistIds,
    setIsWishlistModalOpen
  } = useApp();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const pendingOrdersCount = orders.filter(o => o.status === 'processing').length;

  // Close dropdown menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-pink-100 shadow-[0_4px_20px_rgba(244,63,94,0.04)]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 h-16 sm:h-18 flex items-center justify-between gap-4">
        
        {/* LEFT SIDE ONLY: Website Logo & Website Name */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setActiveView('store')}
            className="flex items-center gap-3 text-left group transition-all"
            aria-label="Digital Drive Homepage"
          >
            {(() => {
              const navLogo = (settings.customLogoUrl && typeof settings.customLogoUrl === 'string' && settings.customLogoUrl.trim() !== '')
                ? settings.customLogoUrl.trim()
                : null;

              if (navLogo) {
                return (
                  <img 
                    src={navLogo} 
                    alt={settings.websiteName || 'Digital Drive Logo'} 
                    className="h-9 sm:h-10 max-w-[150px] object-contain rounded-lg shadow-sm"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                );
              }
              return (
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-500 to-pink-600 flex items-center justify-center shadow-md shadow-pink-500/25 text-white font-display font-extrabold text-lg sm:text-xl tracking-wider group-hover:scale-105 transition-transform">
                  DS
                </div>
              );
            })()}
            
            <div>
              <span className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900 group-hover:text-pink-600 transition-colors block leading-tight font-display">
                {settings.websiteName || 'Digital Drive'}
              </span>
              <span className="text-[10px] font-mono text-pink-600 font-semibold tracking-wider uppercase block">
                {settings.websiteTagline || 'Automated Subscriptions'}
              </span>
            </div>
          </button>
        </div>

        {/* CENTER: Global Search Bar (Directly filters products by name or category across catalog) */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (activeView !== 'store') setActiveView('store');
              }}
              placeholder="Search subscriptions by name or category (e.g. ChatGPT, Netflix, AI Tools)..."
              className="w-full bg-[#faf8f9] hover:bg-white focus:bg-white border border-pink-200/80 focus:border-pink-500 rounded-2xl pl-10 pr-9 py-2 text-xs font-medium text-slate-900 placeholder-slate-400 outline-none transition-all shadow-2xs focus:shadow-md focus:shadow-pink-500/10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-pink-600 p-0.5 cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* RIGHT SIDE: Wishlist & User Profile Icon Access */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Wishlist Quick Button */}
          <button
            onClick={() => setIsWishlistModalOpen(true)}
            className="relative p-2 sm:p-2.5 rounded-2xl bg-pink-50/70 hover:bg-pink-100/70 border border-pink-200/80 hover:border-pink-300 text-slate-700 hover:text-pink-600 transition-all shadow-xs group"
            title="My Saved Wishlist"
            aria-label="Wishlist"
          >
            <Heart className={`w-4 h-4 sm:w-4.5 sm:h-4.5 transition-colors ${wishlistIds.length > 0 ? 'fill-rose-500 text-rose-500' : 'text-slate-600 group-hover:text-pink-600'}`} />
            {wishlistIds.length > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-mono font-bold text-[10px] flex items-center justify-center shadow-sm shadow-pink-500/30 animate-in zoom-in duration-200">
                {wishlistIds.length}
              </span>
            )}
          </button>
          {isLoggedIn ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1.5 pr-2.5 rounded-2xl bg-pink-50/70 hover:bg-pink-100/70 border border-pink-200/80 hover:border-pink-300 transition-all shadow-sm group"
                title="Account & Profile"
                aria-label="User Account Menu"
              >
                {/* Premium Avatar Ring with Active Status Indicator */}
                <div className="relative w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-500 via-rose-500 to-pink-400 p-[1.5px] shadow-sm shadow-pink-500/20">
                  <div className="w-full h-full rounded-[10px] bg-white flex items-center justify-center font-bold text-xs text-pink-600 uppercase font-display">
                    {currentUser.name.charAt(0) || 'U'}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white shadow-sm" />
                </div>

                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-900 leading-tight group-hover:text-pink-600 transition-colors">
                    {currentUser.name.split(' ')[0]}
                  </span>
                  <span className="text-[10px] font-medium text-pink-600">
                    {currentUser.role === 'admin' ? 'Admin Access' : 'VIP Member'}
                  </span>
                </div>

                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 transition-colors" />
              </button>

              {/* Minimalist, Premium Profile Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-pink-100 rounded-2xl shadow-2xl p-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-left text-xs">
                  
                  {/* User Details Summary */}
                  <div className="p-3 bg-gradient-to-br from-pink-50/80 to-rose-50/40 rounded-xl border border-pink-100 mb-2 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm truncate">{currentUser.name}</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-pink-100 text-pink-700 font-bold border border-pink-200">
                        {currentUser.role === 'admin' ? 'ADMIN' : 'VIP'}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono block truncate">{currentUser.email || 'Google Account'}</span>
                    <div className="pt-1.5 flex items-center justify-between text-[11px] font-mono text-pink-700 border-t border-pink-100/80">
                      <span className="text-slate-600">DS Balance:</span>
                      <span className="font-bold text-pink-600">{currentUser.tokenBalance.toLocaleString()} Tokens</span>
                    </div>
                  </div>

                  {/* Navigation Links */}
                  <div className="space-y-1">
                    <button
                      onClick={() => {
                        setActiveView('dashboard');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full px-3 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white flex items-center justify-between transition-colors font-bold shadow-sm shadow-pink-500/20"
                    >
                      <div className="flex items-center gap-2">
                        <KeyRound className="w-4 h-4 text-white" />
                        <span>My Dashboard</span>
                      </div>
                      <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-md font-mono">
                        Vault
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        setIsTopUpModalOpen(true);
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full px-3 py-2 rounded-xl hover:bg-pink-50 text-slate-700 hover:text-pink-700 flex items-center gap-2.5 transition-colors font-medium"
                    >
                      <CreditCard className="w-4 h-4 text-amber-500" />
                      <span>Add Funds / Top-Up Tokens</span>
                    </button>

                    {/* Admin Access Switcher */}
                    {currentUser.role === 'admin' ? (
                      <button
                        onClick={() => {
                          setActiveView('admin');
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 flex items-center gap-2.5 transition-colors font-semibold border border-rose-200"
                      >
                        <Shield className="w-4 h-4 text-rose-600" />
                        <span>Admin Control Panel</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          switchUserRole('admin');
                          setActiveView('admin');
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full px-3 py-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center gap-2.5 transition-colors text-[11px]"
                      >
                        <Shield className="w-4 h-4 text-slate-400" />
                        <span>Switch to Admin Mode</span>
                      </button>
                    )}
                  </div>

                  {/* Log Out */}
                  <div className="pt-2 mt-1 border-t border-slate-100">
                    <button
                      onClick={() => {
                        logoutUser();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full px-3 py-1.5 rounded-xl hover:bg-rose-50 text-rose-600 flex items-center gap-2.5 transition-colors font-medium text-[11px]"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-2xl text-xs font-bold shadow-md shadow-pink-500/20 transition-all flex items-center gap-1.5"
            >
              <User className="w-4 h-4" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
