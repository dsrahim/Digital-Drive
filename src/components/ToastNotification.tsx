import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, KeyRound, X, Sparkles, AlertCircle, Info, ShieldCheck } from 'lucide-react';
import { ToastNotificationItem } from '../types';

export const ToastNotification: React.FC = () => {
  const { toasts, removeToast, setActiveView } = useApp();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div 
      className="fixed bottom-6 right-4 sm:right-6 z-50 flex flex-col gap-3 max-w-sm sm:max-w-md w-[calc(100vw-2rem)] pointer-events-none"
      aria-live="polite"
      aria-label="Real-time notifications"
    >
      {toasts.map(toast => (
        <ToastCard 
          key={toast.id} 
          toast={toast} 
          onDismiss={() => removeToast(toast.id)} 
          onOpenVault={() => {
            setActiveView('dashboard');
            removeToast(toast.id);
          }}
        />
      ))}
    </div>
  );
};

interface ToastCardProps {
  toast: ToastNotificationItem;
  onDismiss: () => void;
  onOpenVault: () => void;
}

const ToastCard: React.FC<ToastCardProps> = ({ toast, onDismiss, onOpenVault }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, toast.durationMs || 8000);

    return () => clearTimeout(timer);
  }, [toast.durationMs, onDismiss]);

  const isOrderCompleted = toast.type === 'order_completed';

  return (
    <div 
      className="pointer-events-auto bg-slate-900/95 backdrop-blur-md text-white border-2 border-pink-500/40 rounded-3xl p-4 sm:p-5 shadow-[0_10px_35px_rgba(244,63,94,0.3)] flex items-start gap-3.5 relative overflow-hidden transition-all duration-300 animate-in slide-in-from-bottom-5 fade-in"
    >
      {/* Glow Effect Accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/20 rounded-full blur-2xl pointer-events-none" />

      {/* Icon Badge */}
      <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-pink-500/30 mt-0.5">
        {isOrderCompleted ? <Sparkles className="w-5 h-5 animate-spin-slow" /> : <CheckCircle2 className="w-5 h-5" />}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 text-left space-y-1 z-10">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-extrabold text-sm text-white font-display leading-tight">
            {toast.title}
          </span>
          {toast.orderId && (
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">
              #{toast.orderId}
            </span>
          )}
        </div>

        <p className="text-xs text-slate-300 font-medium leading-relaxed">
          {toast.message}
        </p>

        {/* Action Button */}
        {toast.actionLabel && (
          <div className="pt-2">
            <button
              onClick={onOpenVault}
              className="px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-pink-500/25 transition-all active:scale-95 cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>{toast.actionLabel}</span>
            </button>
          </div>
        )}
      </div>

      {/* Close X Button */}
      <button
        onClick={onDismiss}
        className="w-7 h-7 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors shrink-0 z-10"
        title="Dismiss Notification"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
