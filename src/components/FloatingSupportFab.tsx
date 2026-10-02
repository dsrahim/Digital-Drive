import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Headphones, 
  MessageCircle, 
  Mail, 
  X, 
  ExternalLink
} from 'lucide-react';

export const FloatingSupportFab: React.FC = () => {
  const { settings } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  // Format WhatsApp number for URL
  const cleanPhone = (settings.supportWhatsApp || '+8801700112233').replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent('Hello Digital Drive Support, I need assistance regarding my subscription/order.')}`;
  const mailtoUrl = `mailto:${settings.supportEmail || 'support@digitaldrive.vip'}?subject=${encodeURIComponent('Digital Drive Support Request')}&body=${encodeURIComponent('Hello Team,\n\nI need support with my DS Token wallet or order fulfillment.\n\nUser details:\n')}`;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      {/* Expanded Pop-up Menu */}
      {isOpen && (
        <div className="mb-3 w-80 bg-white border border-pink-100 rounded-3xl shadow-2xl p-5 animate-in fade-in slide-in-from-bottom-3 duration-200 text-left">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-pink-100">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <div>
                <h4 className="text-xs font-bold text-slate-900 leading-none">
                  Customer Help Desk
                </h4>
                <span className="text-[10px] text-emerald-600 font-mono font-bold">
                  Online · Instant Response
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-pink-50 text-slate-400 hover:text-slate-800 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-[11px] text-slate-600 leading-relaxed mb-3.5 font-medium">
            Have questions about digital subscriptions, DS Tokens, or order delivery? Chat with our support team:
          </p>

          {/* Action Buttons */}
          <div className="space-y-2">
            
            {/* WhatsApp Contact */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50/80 hover:bg-emerald-100/80 border border-emerald-200 text-emerald-900 transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold shadow-sm">
                  <MessageCircle className="w-4 h-4 fill-white" />
                </div>
                <div>
                  <span className="text-xs font-bold block text-slate-900">WhatsApp Live Chat</span>
                  <span className="text-[10px] text-emerald-700 font-mono font-semibold">{settings.supportWhatsApp || '+880 1700-112233'}</span>
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-emerald-600 transition-transform group-hover:translate-x-0.5" />
            </a>

            {/* Email Contact */}
            <a
              href={mailtoUrl}
              className="flex items-center justify-between p-3 rounded-2xl bg-pink-50/80 hover:bg-pink-100/80 border border-pink-200 text-pink-900 transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-pink-500 text-white flex items-center justify-center font-bold shadow-sm">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold block text-slate-900">Official Email Help</span>
                  <span className="text-[10px] text-pink-700 font-mono font-semibold truncate max-w-[140px] block">
                    {settings.supportEmail || 'support@digitaldrive.vip'}
                  </span>
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-pink-600 transition-transform group-hover:translate-x-0.5" />
            </a>
          </div>

          <div className="mt-3.5 pt-2 border-t border-pink-100 text-[10px] text-slate-400 text-center font-mono font-semibold">
            Digital Drive 24/7 Automated Support
          </div>
        </div>
      )}

      {/* Main Floating Action Button (FAB) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Customer Support"
        className={`relative w-13 h-13 rounded-full flex items-center justify-center text-white shadow-xl transition-all duration-300 group ${
          isOpen
            ? 'bg-rose-500 hover:bg-rose-600 rotate-90 shadow-rose-500/30'
            : 'bg-gradient-to-tr from-pink-500 via-rose-500 to-pink-600 hover:scale-105 shadow-pink-500/30'
        }`}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <>
            <Headphones className="w-6 h-6" />
            <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-white shadow" />
          </>
        )}
      </button>
    </div>
  );
};
