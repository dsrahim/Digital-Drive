import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Coins, 
  Smartphone, 
  ShieldCheck, 
  Loader2, 
  Sparkles, 
  Copy, 
  Check, 
  MessageCircle, 
  ExternalLink, 
  Info,
  CreditCard,
  Building2,
  Wallet
} from 'lucide-react';
import { PaymentMethodConfig } from '../types';

export const TopUpModal: React.FC = () => {
  const { 
    isTopUpModalOpen, 
    setIsTopUpModalOpen, 
    settings, 
    convertBDTtoTokens, 
    addFundsWithTokens, 
    currentUser 
  } = useApp();

  const [takaAmount, setTakaAmount] = useState<number | string>(500);
  const [selectedMethodId, setSelectedMethodId] = useState<string>(
    settings.paymentMethods?.[0]?.id || 'pm_bkash'
  );
  const [senderNumber, setSenderNumber] = useState('');
  const [trxId, setTrxId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedNumber, setCopiedNumber] = useState(false);
  
  // WhatsApp Verification Modal State
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [lastPaymentSummary, setLastPaymentSummary] = useState<{
    methodName: string;
    accountNumber: string;
    amountBDT: number;
    tokens: number;
    senderNumber: string;
    trxId: string;
    instructions: string;
  } | null>(null);

  if (!isTopUpModalOpen) return null;

  const numTaka = Number(takaAmount) || 0;
  const tokensToGet = convertBDTtoTokens(numTaka);

  const activeMethods = (settings.paymentMethods || []).filter(pm => pm.isActive);
  const selectedMethod = activeMethods.find(m => m.id === selectedMethodId) || activeMethods[0] || {
    id: 'pm_default',
    name: 'bKash Personal',
    type: 'bkash',
    accountType: 'Personal (Send Money)',
    accountNumber: '01712-345678',
    brandColor: '#e2136e',
    isActive: true,
    instructions: 'Send Money to our personal bKash number and click "Verify via WhatsApp" with screenshot.',
    minAmountBDT: 50
  };

  const quickAmounts = [100, 300, 500, 1000, 2000, 5000];

  const handleCopyNumber = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  const handleConfirmAndVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (numTaka <= 0 || isProcessing) return;

    setIsProcessing(true);

    const finalTrxId = trxId || `TXN${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    await addFundsWithTokens(numTaka, selectedMethod.name, finalTrxId, senderNumber, selectedMethod.id);

    setIsProcessing(false);

    setLastPaymentSummary({
      methodName: selectedMethod.name,
      accountNumber: selectedMethod.accountNumber,
      amountBDT: numTaka,
      tokens: tokensToGet,
      senderNumber: senderNumber || 'Not provided',
      trxId: finalTrxId,
      instructions: selectedMethod.instructions
    });

    setIsWhatsAppModalOpen(true);
  };

  const handleOpenWhatsApp = () => {
    if (!lastPaymentSummary) return;
    const cleanPhone = (settings.supportWhatsApp || '+8801700112233').replace(/[^0-9]/g, '');
    const msg = `Hello Digital Drive Support,\n\nI have completed a payment to top up DS Tokens.\n\n*Payment Summary:*\n- Customer: ${currentUser.name} (${currentUser.email || 'Registered User'})\n- Method: ${lastPaymentSummary.methodName}\n- Account / Wallet: ${lastPaymentSummary.accountNumber}\n- Amount: ৳${lastPaymentSummary.amountBDT} (${lastPaymentSummary.tokens} DS Tokens)\n- Sender Number: ${lastPaymentSummary.senderNumber}\n- TrxID / Ref: ${lastPaymentSummary.trxId}\n\nHere is my payment screenshot for instant token verification. Thank you!`;
    
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const getMethodIcon = (m: PaymentMethodConfig) => {
    const validLogo = (m.logoUrl && typeof m.logoUrl === 'string' && m.logoUrl.trim() !== '') ? m.logoUrl.trim() : null;
    if (validLogo) {
      return (
        <img 
          src={validLogo} 
          alt={m.name} 
          className="w-full h-full object-contain rounded-lg"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }} 
        />
      );
    }
    if (m.type === 'binance') return <Wallet className="w-4 h-4 text-amber-500" />;
    if (m.type === 'bank') return <Building2 className="w-4 h-4 text-blue-600" />;
    if (m.type === 'bkash') return <Smartphone className="w-4 h-4 text-pink-600" />;
    if (m.type === 'nagad') return <Smartphone className="w-4 h-4 text-orange-600" />;
    return <CreditCard className="w-4 h-4 text-pink-500" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/65 backdrop-blur-md animate-in fade-in duration-200 text-left">
      <div 
        className="relative w-full max-w-lg bg-white border border-pink-100 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-5 bg-gradient-to-r from-pink-50/80 via-rose-50/40 to-white border-b border-pink-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-pink-500 text-white flex items-center justify-center shadow-md shadow-pink-500/20">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 font-display flex items-center gap-2">
                Add Funds · DS Token Wallet
              </h2>
              <p className="text-[11px] text-pink-600 font-mono font-bold">
                Exchange Rate: 1 BDT = {settings.exchangeRateBDTtoDS} DS Token
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsTopUpModalOpen(false)}
            className="w-8 h-8 rounded-xl bg-pink-50 hover:bg-pink-100 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleConfirmAndVerify} className="p-5 sm:p-6 overflow-y-auto space-y-5">
          
          {/* Current Balance Row */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-pink-50/50 border border-pink-100 text-xs">
            <span className="text-slate-600 font-medium">Current DS Wallet Balance:</span>
            <div className="flex items-center gap-1 font-mono font-bold text-pink-600">
              <Coins className="w-3.5 h-3.5 text-pink-500" />
              <span>{currentUser.tokenBalance.toLocaleString()} DS Tokens</span>
            </div>
          </div>

          {/* Real-time Live Converter Widget */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-pink-50/70 to-rose-50/30 border border-pink-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900">
                1. Enter Top-Up Amount
              </label>
              <span className="text-[10px] font-mono font-bold text-pink-700 bg-pink-100 px-2 py-0.5 rounded-full">
                Auto Calculating
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              {/* Taka Input */}
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-600">
                  Amount in BDT (৳ Taka)
                </span>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                    ৳
                  </span>
                  <input
                    type="number"
                    min="10"
                    max="100000"
                    value={takaAmount}
                    onChange={(e) => setTakaAmount(e.target.value)}
                    placeholder="500"
                    className="w-full bg-white border border-pink-200 focus:border-pink-500 rounded-xl pl-8 pr-3 py-2 text-sm font-mono font-bold text-slate-900 outline-none transition-colors shadow-sm"
                  />
                </div>
              </div>

              {/* Converted DS Tokens Output */}
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-pink-700 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  You Will Receive (DS Tokens)
                </span>
                <div className="flex items-center gap-2 bg-white border border-pink-200 rounded-xl px-3 py-2 shadow-sm">
                  <Coins className="w-4 h-4 text-pink-500 shrink-0" />
                  <span className="font-mono font-extrabold text-base text-pink-600 tabular-nums">
                    {tokensToGet.toLocaleString()}
                  </span>
                  <span className="text-[10px] font-bold text-pink-700 ml-auto">DS TOKENS</span>
                </div>
              </div>
            </div>

            {/* Quick Amount Chips */}
            <div className="pt-1">
              <span className="text-[11px] text-slate-500 block mb-1.5 font-medium">
                Quick Preset Amounts:
              </span>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                {quickAmounts.map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setTakaAmount(amt)}
                    className={`py-1 text-xs font-mono font-bold rounded-xl border transition-all ${
                      Number(takaAmount) === amt
                        ? 'bg-pink-500 text-white border-pink-500 shadow-sm'
                        : 'bg-white text-slate-700 hover:bg-pink-50 border-pink-200'
                    }`}
                  >
                    ৳{amt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-900 block">
              2. Select Payment Gateway (Bikash, Nagad, Binance, Bank)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {activeMethods.map(m => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelectedMethodId(m.id)}
                  className={`p-3 rounded-2xl border text-xs font-bold flex items-center gap-2.5 transition-all text-left ${
                    selectedMethod.id === m.id
                      ? 'bg-pink-50/90 border-pink-500 text-pink-900 shadow-sm ring-1 ring-pink-400'
                      : 'bg-white border-pink-100 text-slate-700 hover:border-pink-300'
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center shrink-0 overflow-hidden p-1">
                    {getMethodIcon(m)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block truncate font-bold">{m.name}</span>
                    <span className="text-[10px] text-slate-400 font-normal block truncate">{m.accountType}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Selected Method Details with Prominent Copy Button */}
          <div className="p-4 rounded-2xl bg-[#faf8f9] border border-pink-200/90 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">
                3. Send Payment to Account
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 font-bold">
                {selectedMethod.accountType}
              </span>
            </div>

            {/* Account Number Box with Distinct Copy Button */}
            <div className="flex items-center justify-between gap-3 p-3 bg-white rounded-xl border border-pink-200 shadow-sm">
              <div className="min-w-0 flex-1">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Account / Crypto Address</span>
                <span className="text-sm sm:text-base font-extrabold font-mono text-slate-900 select-all break-all">
                  {selectedMethod.accountNumber}
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleCopyNumber(selectedMethod.accountNumber)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 ${
                  copiedNumber 
                    ? 'bg-emerald-500 text-white shadow-sm' 
                    : 'bg-pink-500 hover:bg-pink-600 text-white shadow-md shadow-pink-500/20'
                }`}
                title="Copy account number"
              >
                {copiedNumber ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedNumber ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>

            {/* Admin Custom Instruction */}
            {selectedMethod.instructions && (
              <div className="text-[11px] text-slate-600 leading-relaxed bg-pink-50/50 p-3 rounded-xl border border-pink-100 whitespace-pre-line break-words">
                <span className="font-bold text-pink-700 block mb-0.5">Verification Instructions:</span>
                {selectedMethod.instructions}
              </div>
            )}
          </div>

          {/* Sender & TrxID Verification Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700">
                Your Sender Number / Name
              </label>
              <input
                type="text"
                value={senderNumber}
                onChange={(e) => setSenderNumber(e.target.value)}
                placeholder="e.g. 017XXXXXXXX"
                className="w-full bg-[#faf8f9] border border-pink-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-pink-500 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700">
                Transaction ID (TrxID / Ref)
              </label>
              <input
                type="text"
                value={trxId}
                onChange={(e) => setTrxId(e.target.value)}
                placeholder="e.g. BK9X77A19L"
                className="w-full bg-[#faf8f9] border border-pink-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono outline-none focus:border-pink-500"
              />
            </div>
          </div>

          {/* Confirm & Verify Button */}
          <button
            type="submit"
            disabled={numTaka <= 0 || isProcessing}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-pink-500/25 disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Preparing Verification...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Confirm & Verify (Pay ৳{numTaka} for {tokensToGet.toLocaleString()} Tokens)</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* WHATSAPP VERIFICATION POPUP / MODAL */}
      {isWhatsAppModalOpen && lastPaymentSummary && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in zoom-in-95 duration-150 text-left">
          <div className="relative w-full max-w-md bg-white border border-pink-200 rounded-3xl p-6 shadow-2xl space-y-4">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-pink-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
                  <MessageCircle className="w-5 h-5 fill-white" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 font-display leading-tight">
                    Instant WhatsApp Verification
                  </h3>
                  <span className="text-[10px] text-emerald-600 font-mono font-bold">
                    Fast 1-Minute Automated Credit
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsWhatsAppModalOpen(false);
                  setIsTopUpModalOpen(false);
                }}
                className="w-8 h-8 rounded-xl bg-pink-50 hover:bg-pink-100 text-slate-400 hover:text-slate-800 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Instruction Message from Admin */}
            <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl space-y-2 text-xs text-emerald-950">
              <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                <Info className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Verification Instruction</span>
              </div>
              <p className="text-[11px] leading-relaxed text-emerald-800 whitespace-pre-line break-words">
                {lastPaymentSummary.instructions || "Please send a screenshot of your payment to our WhatsApp support team to get your DS tokens credited instantly."}
              </p>
            </div>

            {/* Payment Summary Box */}
            <div className="p-3.5 bg-[#faf8f9] rounded-2xl border border-pink-100 space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Gateway:</span>
                <span className="font-bold text-slate-900">{lastPaymentSummary.methodName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Account:</span>
                <span className="font-bold text-slate-900 truncate max-w-[200px]">{lastPaymentSummary.accountNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount Paid:</span>
                <span className="font-bold text-slate-900">৳{lastPaymentSummary.amountBDT}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tokens Credited:</span>
                <span className="font-bold text-pink-600">+{lastPaymentSummary.tokens} DS</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Reference / TrxID:</span>
                <span className="font-bold text-slate-700">{lastPaymentSummary.trxId}</span>
              </div>
            </div>

            {/* Prominent Verify via WhatsApp Button */}
            <button
              onClick={handleOpenWhatsApp}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all"
            >
              <MessageCircle className="w-5 h-5 fill-white" />
              <span>Verify via WhatsApp Now</span>
              <ExternalLink className="w-4 h-4 ml-1" />
            </button>

            <button
              onClick={() => {
                setIsWhatsAppModalOpen(false);
                setIsTopUpModalOpen(false);
              }}
              className="w-full py-2 rounded-xl text-xs text-slate-500 hover:text-slate-800 font-bold"
            >
              Done / Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
