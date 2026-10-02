import React from 'react';
import { useApp } from '../context/AppContext';
import { Coins, ShieldCheck, Zap, KeyRound } from 'lucide-react';

export const Footer: React.FC = () => {
  const { setActiveView, setIsTopUpModalOpen, settings } = useApp();

  return (
    <footer className="w-full bg-white border-t border-pink-100 py-12 mt-20 text-left shadow-[0_-4px_20px_rgba(244,63,94,0.02)]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Brand Col with Dynamic Admin-Uploaded Logo */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
            {(() => {
              const footerLogo = (settings.customFooterLogoUrl && typeof settings.customFooterLogoUrl === 'string' && settings.customFooterLogoUrl.trim() !== '')
                ? settings.customFooterLogoUrl.trim()
                : (settings.customLogoUrl && typeof settings.customLogoUrl === 'string' && settings.customLogoUrl.trim() !== '')
                  ? settings.customLogoUrl.trim()
                  : null;

              if (footerLogo) {
                return (
                  <img 
                    src={footerLogo} 
                    alt={settings.websiteName || 'Digital Drive Logo'} 
                    className="h-9 max-w-[150px] object-contain rounded-lg shadow-sm" 
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                );
              }
              return (
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-500 flex items-center justify-center text-white font-extrabold text-sm shadow-md shadow-pink-500/20">
                  DS
                </div>
              );
            })()}
              <span className="text-lg font-extrabold text-slate-900 tracking-tight font-display">
                {settings.websiteName || 'Digital Drive'}
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed whitespace-normal break-words">
              Premium digital subscription platform. Instant automated account delivery, guaranteed validity warranties, and encrypted credential vault storage.
            </p>

            {/* Social Channels (Updated dynamically by Admin) */}
            <div className="flex items-center gap-2 pt-1 flex-wrap">
              {settings.supportWhatsApp && (
                <a
                  href={`https://wa.me/${settings.supportWhatsApp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-[11px] font-bold transition-all shadow-sm"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>WhatsApp: {settings.supportWhatsApp}</span>
                </a>
              )}
              {settings.supportTelegram && (
                <a
                  href={settings.supportTelegram.startsWith('http') ? settings.supportTelegram : `https://t.me/${settings.supportTelegram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 text-[11px] font-bold transition-all shadow-sm"
                >
                  <span className="w-2 h-2 rounded-full bg-sky-500" />
                  <span>Telegram Channel</span>
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
              Quick Navigation
            </h4>
            <ul className="text-xs text-slate-600 space-y-2 font-medium">
              <li>
                <button onClick={() => setActiveView('store')} className="hover:text-pink-600 transition-colors">
                  Storefront Catalog
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView('dashboard')} className="hover:text-pink-600 transition-colors">
                  My Credentials Vault
                </button>
              </li>
              <li>
                <button onClick={() => setIsTopUpModalOpen(true)} className="hover:text-pink-600 transition-colors">
                  Add DS Tokens (Live Converter)
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView('architecture')} className="hover:text-pink-600 transition-colors">
                  System Architecture
                </button>
              </li>
            </ul>
          </div>

          {/* Wallet Specs */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
              Currency & Exchange
            </h4>
            <div className="p-3.5 bg-gradient-to-br from-pink-50/70 to-rose-50/30 rounded-2xl border border-pink-100 text-xs space-y-1 font-mono">
              <div className="flex items-center justify-between text-pink-700 font-extrabold">
                <span>1 BDT</span>
                <span>= {settings.exchangeRateBDTtoDS} DS Token</span>
              </div>
              <p className="text-[10px] text-slate-500 font-sans font-medium">
                Live converter for bKash, Nagad, Binance USDT, and Bank Transfer.
              </p>
            </div>
          </div>

          {/* Guarantee */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
              Automated Guarantee
            </h4>
            <ul className="text-xs text-slate-600 space-y-2 font-medium">
              <li className="flex items-center gap-1.5 text-emerald-700">
                <Zap className="w-3.5 h-3.5" />
                <span>Instant Automated Credentials Delivery</span>
              </li>
              <li className="flex items-center gap-1.5 text-pink-600">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Full Validity Warranty on All Accounts</span>
              </li>
              <li className="flex items-center gap-1.5 text-slate-700">
                <KeyRound className="w-3.5 h-3.5" />
                <span>Encrypted User Vault Storage</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-pink-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} {settings.websiteName || 'Digital Drive'}. All rights reserved.</p>
          <p className="font-mono text-[11px] text-emerald-600 font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
            Automated Delivery Engine: 100% Operational
          </p>
        </div>
      </div>
    </footer>
  );
};
