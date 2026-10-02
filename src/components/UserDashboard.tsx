import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  KeyRound, 
  Coins, 
  Copy, 
  Check, 
  Eye, 
  EyeOff, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Plus, 
  History, 
  Download, 
  RefreshCw, 
  CreditCard, 
  Smartphone, 
  Sparkles, 
  MessageCircle, 
  Info, 
  X,
  Wallet,
  Building2,
  ShieldCheck,
  ArrowDownLeft,
  ArrowUpRight,
  ShoppingBag,
  Gift,
  Search,
  Receipt,
  ArrowLeftRight,
  Filter,
  Flame,
  Menu,
  User,
  Printer,
  FileText
} from 'lucide-react';
import { Order, PaymentMethodConfig, WalletTransaction } from '../types';

import { TextAvatar } from './TextAvatar';

export const UserDashboard: React.FC = () => {
  const { 
    currentUser, 
    orders, 
    tokenTransactions, 
    walletTransactions,
    settings,
    convertBDTtoTokens,
    addFundsWithTokens, 
    setActiveView,
    retryOrderApiFulfillment,
    toggleAutoRenew
  } = useApp();

  const [activeTab, setActiveTab] = useState<'profile' | 'vault' | 'add_funds' | 'orders' | 'transactions' | 'rewards' | 'support'>('profile');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});
  const [retryingOrderId, setRetryingOrderId] = useState<string | null>(null);
  const [selectedOrderForReceipt, setSelectedOrderForReceipt] = useState<Order | null>(null);

  // Transaction History Tab State
  const [txFilter, setTxFilter] = useState<'all' | 'deposit' | 'purchase' | 'reward'>('all');
  const [txSearch, setTxSearch] = useState('');
  const [selectedTxForModal, setSelectedTxForModal] = useState<WalletTransaction | null>(null);

  // In-dashboard Add Funds state
  const [takaAmount, setTakaAmount] = useState<number | string>(500);
  const [selectedMethodId, setSelectedMethodId] = useState<string>(
    settings.paymentMethods?.[0]?.id || 'pm_bkash'
  );
  const [senderNumber, setSenderNumber] = useState('');
  const [trxId, setTrxId] = useState('');
  const [isProcessingTopUp, setIsProcessingTopUp] = useState(false);
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

  const completedOrders = orders.filter(o => o.status === 'completed' && o.credentials);
  const pendingOrders = orders.filter(o => o.status === 'processing');

  // Transaction Computations & Breakdown
  const depositsList = (walletTransactions || []).filter(t => t.type === 'deposit');
  const purchasesList = (walletTransactions || []).filter(t => t.type === 'purchase');
  const rewardsList = (walletTransactions || []).filter(t => t.type === 'reward');

  const totalDepositsTokens = depositsList.reduce((acc, t) => acc + Math.abs(t.amountTokens), 0);
  const totalDepositsBDT = depositsList.reduce((acc, t) => acc + (t.amountBDT || 0), 0);
  const totalPurchasesTokens = purchasesList.reduce((acc, t) => acc + Math.abs(t.amountTokens), 0);
  const totalRewardsTokens = rewardsList.reduce((acc, t) => acc + Math.abs(t.amountTokens), 0);

  const filteredTransactions = (walletTransactions || []).filter(tx => {
    if (txFilter !== 'all' && tx.type !== txFilter) return false;
    if (txSearch.trim()) {
      const q = txSearch.toLowerCase();
      const matchTitle = tx.title?.toLowerCase().includes(q);
      const matchSub = tx.subtitle?.toLowerCase().includes(q);
      const matchRef = tx.referenceId?.toLowerCase().includes(q);
      const matchId = tx.id.toLowerCase().includes(q);
      const matchMethod = tx.paymentMethod?.toLowerCase().includes(q);
      const matchNote = tx.rewardNote?.toLowerCase().includes(q);
      const matchProduct = tx.productTitle?.toLowerCase().includes(q);
      return Boolean(matchTitle || matchSub || matchRef || matchId || matchMethod || matchNote || matchProduct);
    }
    return true;
  });



  const downloadTransactionStatement = () => {
    if (!walletTransactions || walletTransactions.length === 0) return;
    
    let content = `===============================================================
DIGITAL DRIVE (DS) - OFFICIAL WALLET TRANSACTION STATEMENT
===============================================================
Customer: ${currentUser.name} (${currentUser.email || 'VIP Member'})
Current Token Balance: ${currentUser.tokenBalance.toLocaleString()} DS Tokens
Total Spent: ${currentUser.totalSpentTokens.toLocaleString()} DS Tokens
Exported Date: ${new Date().toLocaleString()}
---------------------------------------------------------------
FINANCIAL STATEMENT SUMMARY:
- Total Deposits: +${totalDepositsTokens.toLocaleString()} DS Tokens (Paid ৳${totalDepositsBDT.toLocaleString()}) [${depositsList.length} Top-ups]
- Total Subscription Purchases: -${totalPurchasesTokens.toLocaleString()} DS Tokens [${purchasesList.length} Orders]
- Total Reward Tokens Earned: +${totalRewardsTokens.toLocaleString()} DS Tokens [${rewardsList.length} Rewards]
===============================================================
RECORDED TRANSACTION LOGS (${walletTransactions.length} Total):
---------------------------------------------------------------
`;

    walletTransactions.forEach((tx, idx) => {
      const sign = tx.amountTokens > 0 ? '+' : '';
      content += `[#${idx + 1}] Date: ${tx.timestamp} | ID: ${tx.id}
  Category: [${tx.type.toUpperCase()}]
  Title: ${tx.title} ${tx.subtitle ? `\n  Details: ${tx.subtitle}` : ''}
  Amount: ${sign}${tx.amountTokens.toLocaleString()} DS Tokens ${tx.amountBDT ? `(৳${tx.amountBDT.toLocaleString()})` : ''}
  Reference / TrxID: ${tx.referenceId || 'N/A'}
  Status: ${tx.status.toUpperCase()}
---------------------------------------------------------------
`;
    });

    content += `\nThank you for choosing Digital Drive for your subscriptions and digital services.\nFor inquiries, contact support via WhatsApp: ${settings.supportWhatsApp || '+8801700112233'}\n===============================================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `DS_Statement_${currentUser.name.replace(/[^a-z0-9]/gi, '_')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

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

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleCopyNumber = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  const togglePassword = (orderId: string) => {
    setRevealedPasswords(prev => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  const downloadCredentialFile = (order: Order) => {
    if (!order.credentials) return;
    const creds = order.credentials;
    const content = `===========================================
DIGITAL DRIVE (DS) - SUBSCRIPTION CREDENTIALS VAULT
===========================================
Product: ${order.productTitle}
Order ID: ${order.id}
Variant: ${order.variantSelected}
Delivered: ${order.createdAt}
Expiry Date: ${creds.expiryDate}

------------------ DELIVERED CREDENTIALS ------------------
${creds.accountEmail ? `Email / Account: ${creds.accountEmail}\n` : ''}${creds.password ? `Password: ${creds.password}\n` : ''}${creds.profilePin ? `Profile PIN: ${creds.profilePin}\n` : ''}${creds.licenseKey ? `License Key: ${creds.licenseKey}\n` : ''}${creds.inviteLink ? `Invitation Link: ${creds.inviteLink}\n` : ''}
----------------- ACTIVATION INSTRUCTIONS -----------------
${creds.instructions}
===========================================
Thank you for choosing Digital Drive!`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `DS_Credentials_${order.id}_${order.productTitle.replace(/[^a-z0-9]/gi, '_')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleRetryOrder = async (orderId: string) => {
    setRetryingOrderId(orderId);
    await retryOrderApiFulfillment(orderId);
    setRetryingOrderId(null);
  };

  const handleTopUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (numTaka <= 0 || isProcessingTopUp) return;

    setIsProcessingTopUp(true);

    const finalTrxId = trxId || `TXN${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    await addFundsWithTokens(numTaka, selectedMethod.name, finalTrxId, senderNumber, selectedMethod.id);

    setIsProcessingTopUp(false);

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
    const msg = `Hello Digital Drive Support,\n\nI have made a payment to top up DS Tokens.\n\n*Payment Details:*\n- Customer: ${currentUser.name} (${currentUser.email || 'Registered Customer'})\n- Gateway: ${lastPaymentSummary.methodName}\n- Account Number: ${lastPaymentSummary.accountNumber}\n- Amount: ৳${lastPaymentSummary.amountBDT} (${lastPaymentSummary.tokens} DS Tokens)\n- Sender Number: ${lastPaymentSummary.senderNumber}\n- TrxID: ${lastPaymentSummary.trxId}\n\nHere is my payment screenshot for instant token verification. Thank you!`;
    
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
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 text-left space-y-6">
      
      {/* 1. TOUCH-OPTIMIZED HEADER WITH HAMBURGER MENU */}
      <div className="bg-white/95 backdrop-blur-md border border-pink-100 rounded-3xl p-4 sm:p-5 shadow-[0_8px_30px_rgba(244,63,94,0.05)] sticky top-20 z-30 flex items-center justify-between gap-4">
        
        {/* Left: Hamburger Button & View Title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="w-11 h-11 rounded-2xl bg-pink-50 hover:bg-pink-100 text-pink-600 border border-pink-200 flex items-center justify-center transition-all shadow-xs shrink-0 active:scale-95"
            aria-label="Open Navigation Menu"
            title="Open Navigation Drawer"
          >
            <Menu className="w-6 h-6 stroke-[2.5]" />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 text-sm sm:text-base font-display truncate">
                {activeTab === 'profile' && 'User Profile & Account Overview'}
                {activeTab === 'vault' && 'License Credentials Vault'}
                {activeTab === 'add_funds' && 'Add Funds & Gateways'}
                {activeTab === 'orders' && 'Order History'}
                {activeTab === 'transactions' && 'Wallet Transactions'}
                {activeTab === 'rewards' && 'Daily Streak & Rewards'}
                {activeTab === 'support' && 'Support & Live Verification'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium truncate">
              {currentUser.name} ({currentUser.email || 'Customer'})
            </p>
          </div>
        </div>

        {/* Right: Quick Token Balance Pill */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="p-2 sm:px-3.5 py-1.5 rounded-2xl bg-pink-50 border border-pink-200/80 flex items-center gap-2">
            <Coins className="w-4 h-4 text-pink-500 shrink-0" />
            <span className="text-xs sm:text-sm font-extrabold font-mono text-slate-900">
              {currentUser.tokenBalance.toLocaleString()} <span className="text-[10px] text-pink-600 font-bold hidden sm:inline">DS</span>
            </span>
          </div>

          <button
            onClick={() => {
              setActiveTab('add_funds');
              setIsDrawerOpen(false);
            }}
            className="w-9 h-9 sm:w-auto sm:px-3.5 sm:py-2 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs shrink-0 active:scale-95"
            title="Top Up"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span className="hidden sm:inline">Top Up</span>
          </button>
        </div>

      </div>

      {/* 2. SIDEBAR DRAWER OVERLAY */}
      {isDrawerOpen && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
          onClick={() => setIsDrawerOpen(false)}
        >
          <div 
            className="fixed inset-y-0 left-0 w-full max-w-xs sm:max-w-sm bg-white border-r border-pink-100 shadow-2xl p-6 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-left duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-pink-100">
                <div className="flex items-center gap-3">
                  <TextAvatar name={currentUser.name} size="md" />
                  <div className="min-w-0">
                    <h3 className="font-extrabold text-sm text-slate-900 truncate font-display">
                      {currentUser.name}
                    </h3>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-pink-100 text-pink-700">
                      VIP MEMBER
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-pink-100 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
                  title="Close Menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Sidebar Links Menu */}
              <nav className="space-y-1.5" aria-label="User Navigation Menu">
                {[
                  { id: 'profile', label: 'Profile Overview', icon: User },
                  { id: 'vault', label: 'License Vault', icon: KeyRound, badge: `${completedOrders.length}` },
                  { id: 'add_funds', label: 'Add Funds & Gateways', icon: CreditCard },
                  { id: 'orders', label: 'Order History', icon: History, badge: pendingOrders.length ? `${pendingOrders.length} Pending` : undefined },
                  { id: 'transactions', label: 'Wallet Transactions', icon: Receipt },
                ].map(item => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id as any);
                        setIsDrawerOpen(false);
                      }}
                      className={`w-full min-h-[48px] px-4 py-3 rounded-2xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                        isActive
                          ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md shadow-pink-500/20'
                          : 'bg-[#faf8f9] hover:bg-pink-50/80 text-slate-700 hover:text-slate-900 border border-pink-100/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                          isActive ? 'bg-white/20 text-white' : 'bg-pink-100 text-pink-700'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Drawer Footer */}
            <div className="pt-6 border-t border-pink-100 space-y-3">
              <button
                onClick={() => {
                  setIsDrawerOpen(false);
                  setActiveView('store');
                }}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Return to Storefront</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* VIEW 0: PROFILE & OVERVIEW */}
      {activeTab === 'profile' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* User Details Header Card */}
          <div className="bg-white border border-pink-100 rounded-3xl p-6 sm:p-8 shadow-[0_10px_30px_rgba(244,63,94,0.06)] flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-pink-100/60 via-rose-50/30 to-transparent rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center gap-4 relative z-10 min-w-0">
              <div className="relative shrink-0">
                <TextAvatar name={currentUser.name} size="xl" />
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-sm" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-display truncate">
                    {currentUser.name}
                  </h1>
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-pink-50 text-pink-700 font-bold border border-pink-200 shrink-0">
                    {currentUser.role === 'admin' ? 'ADMINISTRATOR' : 'VIP MEMBER'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1 font-mono truncate">
                  {currentUser.email || 'Google Account'} · Joined {currentUser.joinedDate || '2026'}
                </p>
              </div>
            </div>

            {/* Balance & Top Up Shortcut */}
            <div className="flex flex-wrap items-center gap-3 relative z-10">
              <div className="p-3.5 px-4 rounded-2xl bg-gradient-to-r from-pink-50/90 to-rose-50/50 border border-pink-200/80 flex items-center gap-3.5 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-pink-500 text-white flex items-center justify-center shadow-sm shrink-0">
                  <Coins className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-pink-700 uppercase font-bold tracking-wider block">
                    DS Token Balance
                  </span>
                  <span className="text-lg sm:text-xl font-extrabold font-mono text-slate-900 tabular-nums leading-tight">
                    {currentUser.tokenBalance.toLocaleString()} <span className="text-xs text-pink-600 font-bold">DS</span>
                  </span>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('add_funds')}
                className="px-5 py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-pink-500/25 active:scale-95 shrink-0"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Top Up Tokens</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
            
            <div className="bg-white border border-pink-100 rounded-3xl p-5 space-y-1 shadow-2xs">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] uppercase font-bold tracking-wider">Active Vault Items</span>
                <KeyRound className="w-4 h-4 text-pink-500" />
              </div>
              <div className="text-2xl font-extrabold font-mono text-slate-900">
                {completedOrders.length}
              </div>
              <span className="text-[11px] text-slate-500 font-medium block">Verified subscriptions</span>
            </div>

            <div className="bg-white border border-pink-100 rounded-3xl p-5 space-y-1 shadow-2xs">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] uppercase font-bold tracking-wider">Pending Orders</span>
                <History className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-extrabold font-mono text-slate-900">
                {pendingOrders.length}
              </div>
              <span className="text-[11px] text-slate-500 font-medium block">Processing delivery</span>
            </div>

            <div className="bg-white border border-pink-100 rounded-3xl p-5 space-y-1 shadow-2xs">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] uppercase font-bold tracking-wider">Total Spent Tokens</span>
                <Coins className="w-4 h-4 text-rose-500" />
              </div>
              <div className="text-2xl font-extrabold font-mono text-slate-900">
                {(currentUser.totalSpentTokens || 0).toLocaleString()}
              </div>
              <span className="text-[11px] text-slate-500 font-medium block">DS Tokens</span>
            </div>

            <div className="bg-white border border-pink-100 rounded-3xl p-5 space-y-1 shadow-2xs">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] uppercase font-bold tracking-wider">Transactions</span>
                <Receipt className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="text-2xl font-extrabold font-mono text-slate-900">
                {(walletTransactions || []).length}
              </div>
              <span className="text-[11px] text-slate-500 font-medium block">Deposits & Purchases</span>
            </div>

          </div>

          {/* Direct Shortcuts Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            <button
              onClick={() => setActiveTab('vault')}
              className="bg-white hover:bg-pink-50/50 border border-pink-100 p-5 rounded-3xl text-left space-y-2 transition-all shadow-2xs group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center font-bold">
                <KeyRound className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="font-extrabold text-sm text-slate-900 font-display">Access Credentials Vault</h3>
              <p className="text-xs text-slate-500">View passwords, profile PINs, and license keys for active orders.</p>
            </button>

            <button
              onClick={() => setActiveTab('add_funds')}
              className="bg-white hover:bg-pink-50/50 border border-pink-100 p-5 rounded-3xl text-left space-y-2 transition-all shadow-2xs group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                <CreditCard className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="font-extrabold text-sm text-slate-900 font-display">Add Funds (Manual bKash/Nagad)</h3>
              <p className="text-xs text-slate-500">Deposit BDT to receive DS Tokens instantly into your wallet.</p>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className="bg-white hover:bg-pink-50/50 border border-pink-100 p-5 rounded-3xl text-left space-y-2 transition-all shadow-2xs group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                <History className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="font-extrabold text-sm text-slate-900 font-display">View Order History</h3>
              <p className="text-xs text-slate-500">Track pending orders or retry Supplier API fulfillment.</p>
            </button>

          </div>

        </div>
      )}

      {/* TAB 1: CREDENTIALS VAULT */}
      {activeTab === 'vault' && (
        <div className="space-y-5">
          {completedOrders.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-pink-100 shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-pink-50 flex items-center justify-center text-pink-500 mx-auto mb-3">
                <KeyRound className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">No Active Credentials in Vault Yet</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mb-5">
                Explore our subscriptions catalog to purchase digital accounts with instant automated credential provisioning.
              </p>
              <button
                onClick={() => setActiveView('store')}
                className="px-5 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-2xl text-xs font-bold shadow-md shadow-pink-500/20"
              >
                Browse Subscriptions Catalog
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              {completedOrders.map((order) => {
                const creds = order.credentials!;
                const isPassVisible = revealedPasswords[order.id];

                return (
                  <div
                    key={order.id}
                    className="bg-white border border-pink-100 hover:border-pink-300 rounded-3xl p-5 sm:p-6 shadow-[0_4px_20px_rgba(244,63,94,0.05)] transition-all flex flex-col justify-between space-y-4 text-left min-w-0"
                  >
                    <div className="flex items-start justify-between gap-3 min-w-0">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Active & Verified
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {order.id}
                          </span>
                        </div>
                        <h3 className="text-base font-extrabold text-slate-900 leading-snug break-words whitespace-normal font-display">
                          {order.productTitle}
                        </h3>
                        <p className="text-xs text-pink-600 font-semibold mt-0.5 break-words whitespace-normal">
                          {order.variantSelected} · Valid till {creds.expiryDate}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => setSelectedOrderForReceipt(order)}
                          className="w-9 h-9 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-600 flex items-center justify-center transition-colors shadow-xs shrink-0 cursor-pointer"
                          title="View & Print Official PDF Subscription Receipt"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => downloadCredentialFile(order)}
                          className="w-9 h-9 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-600 flex items-center justify-center transition-colors shadow-xs shrink-0 cursor-pointer"
                          title="Download Credentials Text File"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Credentials Details Box */}
                    <div className="bg-[#faf8f9] rounded-2xl p-4 border border-pink-100 space-y-3 font-mono text-xs min-w-0">
                      
                      {creds.accountEmail && (
                        <div className="flex items-center justify-between gap-2 min-w-0">
                          <span className="text-slate-500 text-[11px] shrink-0">Email / User:</span>
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="text-slate-900 font-bold truncate">{creds.accountEmail}</span>
                            <button
                              onClick={() => copyToClipboard(creds.accountEmail!, `email-${order.id}`)}
                              className="p-1 rounded-lg hover:bg-pink-100 text-slate-400 hover:text-pink-600 transition-colors shrink-0"
                              title="Copy Email"
                            >
                              {copiedKey === `email-${order.id}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                      )}

                      {creds.password && (
                        <div className="flex items-center justify-between gap-2 min-w-0">
                          <span className="text-slate-500 text-[11px] shrink-0">Password:</span>
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="text-pink-700 font-bold font-mono truncate">
                              {isPassVisible ? creds.password : '••••••••••••'}
                            </span>
                            <button
                              onClick={() => togglePassword(order.id)}
                              className="p-1 rounded-lg hover:bg-pink-100 text-slate-400 hover:text-slate-700 transition-colors shrink-0"
                              title={isPassVisible ? 'Hide Password' : 'Show Password'}
                            >
                              {isPassVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              onClick={() => copyToClipboard(creds.password!, `pass-${order.id}`)}
                              className="p-1 rounded-lg hover:bg-pink-100 text-slate-400 hover:text-pink-600 transition-colors shrink-0"
                              title="Copy Password"
                            >
                              {copiedKey === `pass-${order.id}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                      )}

                      {creds.profilePin && (
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-slate-500 text-[11px]">Profile PIN:</span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-emerald-700 font-bold">{creds.profilePin}</span>
                            <button
                              onClick={() => copyToClipboard(creds.profilePin!, `pin-${order.id}`)}
                              className="p-1 rounded-lg hover:bg-pink-100 text-slate-400 hover:text-pink-600"
                              title="Copy PIN"
                            >
                              {copiedKey === `pin-${order.id}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                      )}

                      {creds.licenseKey && (
                        <div className="flex items-center justify-between gap-2 min-w-0">
                          <span className="text-slate-500 text-[11px] shrink-0">License Key:</span>
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="text-pink-600 font-bold truncate">{creds.licenseKey}</span>
                            <button
                              onClick={() => copyToClipboard(creds.licenseKey!, `lic-${order.id}`)}
                              className="p-1 rounded-lg hover:bg-pink-100 text-slate-400 hover:text-pink-600 shrink-0"
                              title="Copy Key"
                            >
                              {copiedKey === `lic-${order.id}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                      )}

                      {creds.inviteLink && (
                        <div className="flex items-center justify-between gap-2 min-w-0">
                          <span className="text-slate-500 text-[11px] shrink-0">Team Invite:</span>
                          <div className="flex items-center gap-1.5 min-w-0">
                            <a
                              href={creds.inviteLink}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-pink-600 font-semibold underline hover:text-pink-700 flex items-center gap-1 truncate"
                            >
                              <span className="truncate">Accept Invitation Link</span>
                              <ExternalLink className="w-3 h-3 shrink-0" />
                            </a>
                            <button
                              onClick={() => copyToClipboard(creds.inviteLink!, `inv-${order.id}`)}
                              className="p-1 rounded-lg hover:bg-pink-100 text-slate-400 hover:text-pink-600 shrink-0"
                              title="Copy Link"
                            >
                              {copiedKey === `inv-${order.id}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Activation Instructions */}
                    <div className="text-[11px] text-slate-600 bg-pink-50/50 p-3.5 rounded-2xl border border-pink-100 whitespace-normal break-words">
                      <span className="font-bold text-slate-900 block mb-1">Activation Instructions:</span>
                      <p className="whitespace-pre-line leading-relaxed">{creds.instructions}</p>
                    </div>

                    {/* Auto-Renew Subscription Control */}
                    <div className="pt-3 border-t border-pink-100/80 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <RefreshCw className={`w-3.5 h-3.5 ${order.autoRenew ?? true ? 'text-emerald-600 animate-spin-slow' : 'text-slate-400'}`} />
                          <span className="font-extrabold text-xs text-slate-900 font-display">
                            Auto-Renew Subscription
                          </span>
                          <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full ${
                            order.autoRenew ?? true 
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}>
                            {order.autoRenew ?? true ? 'AUTO-RENEW ON' : 'OFF'}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 truncate mt-0.5 font-mono">
                          {order.autoRenew ?? true
                            ? `Auto-deducts ${order.priceTokens.toLocaleString()} DS Tokens on ${creds.expiryDate}`
                            : 'Auto-renew is disabled · Re-order manually at term end'}
                        </p>
                      </div>

                      <button
                        onClick={() => toggleAutoRenew(order.id)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          order.autoRenew ?? true ? 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-xs' : 'bg-slate-300'
                        }`}
                        role="switch"
                        aria-checked={order.autoRenew ?? true}
                        title={order.autoRenew ?? true ? 'Disable Auto-Renew' : 'Enable Auto-Renew'}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                            order.autoRenew ?? true ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ADD FUNDS & CUSTOM MANUAL PAYMENT GATEWAYS */}
      {activeTab === 'add_funds' && (
        <div className="max-w-3xl bg-white rounded-3xl border border-pink-100 p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-pink-500" />
              <span>Add Funds · Custom Manual Payment Gateway</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Top up your balance by transferring funds to our official account and verifying via WhatsApp for instant token credit.
            </p>
          </div>

          <form onSubmit={handleTopUpSubmit} className="space-y-5">
            {/* Live Converter Box */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-pink-50/70 to-rose-50/30 border border-pink-200/80 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">1. Amount & Conversion</span>
                <span className="text-[10px] font-mono font-bold text-pink-700 bg-pink-100 px-2.5 py-0.5 rounded-full">
                  1 BDT = {settings.exchangeRateBDTtoDS} DS Token
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-600">Enter Amount in BDT (৳ Taka)</span>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400">৳</span>
                    <input
                      type="number"
                      min="10"
                      max="100000"
                      value={takaAmount}
                      onChange={(e) => setTakaAmount(e.target.value)}
                      placeholder="500"
                      className="w-full bg-white border border-pink-200 focus:border-pink-500 rounded-xl pl-8 pr-3 py-2.5 text-sm font-mono font-bold text-slate-900 outline-none shadow-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-pink-700 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Tokens to Receive
                  </span>
                  <div className="flex items-center gap-2 bg-white border border-pink-200 rounded-xl px-3.5 py-2.5 shadow-sm">
                    <Coins className="w-4 h-4 text-pink-500 shrink-0" />
                    <span className="font-mono font-extrabold text-base text-pink-600 tabular-nums">
                      {tokensToGet.toLocaleString()}
                    </span>
                    <span className="text-[10px] font-bold text-pink-700 ml-auto">DS TOKENS</span>
                  </div>
                </div>
              </div>

              {/* Quick Amount Chips */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {[100, 300, 500, 1000, 2000, 5000].map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setTakaAmount(amt)}
                    className={`px-3 py-1 text-xs font-mono font-bold rounded-xl border transition-all ${
                      Number(takaAmount) === amt
                        ? 'bg-pink-500 text-white border-pink-500 shadow-sm'
                        : 'bg-white text-slate-700 border-pink-200 hover:bg-pink-50'
                    }`}
                  >
                    ৳{amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-900 block">
                2. Choose Payment Method (Bikash, Nagad, Binance, Bank)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
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

            {/* Account Number Box with Distinct Copy Button */}
            <div className="p-4 rounded-2xl bg-[#faf8f9] border border-pink-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  3. Transfer to Official Account
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 font-bold">
                  {selectedMethod.accountType}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3 p-3.5 bg-white rounded-xl border border-pink-200 shadow-sm">
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Account / Crypto Address</span>
                  <span className="text-sm sm:text-base font-extrabold font-mono text-slate-900 select-all break-all">
                    {selectedMethod.accountNumber}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopyNumber(selectedMethod.accountNumber)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 ${
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

              {/* Custom Admin Instruction */}
              {selectedMethod.instructions && (
                <div className="text-[11px] text-slate-600 leading-relaxed bg-pink-50/50 p-3 rounded-xl border border-pink-100 whitespace-pre-line break-words">
                  <span className="font-bold text-pink-700 block mb-0.5">Verification Instructions:</span>
                  {selectedMethod.instructions}
                </div>
              )}
            </div>

            {/* Sender Phone & TrxID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">Sender Mobile Number / Name</label>
                <input
                  type="text"
                  value={senderNumber}
                  onChange={(e) => setSenderNumber(e.target.value)}
                  placeholder="017XXXXXXXX"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-pink-500 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">Transaction ID (TrxID / Ref)</label>
                <input
                  type="text"
                  value={trxId}
                  onChange={(e) => setTrxId(e.target.value)}
                  placeholder="e.g. BK9X77A19L"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono outline-none focus:border-pink-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={numTaka <= 0 || isProcessingTopUp}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-pink-500/25 disabled:opacity-50"
            >
              {isProcessingTopUp ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Confirm & Verify (Pay ৳{numTaka} for {tokensToGet.toLocaleString()} DS Tokens)</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: ORDER HISTORY */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-3xl border border-pink-100 overflow-hidden shadow-sm">
          <div className="p-5 border-b border-pink-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Order History & Delivery Status</h3>
            <span className="text-xs text-slate-500 font-mono">{orders.length} total orders</span>
          </div>

          <div className="divide-y divide-pink-50">
            {orders.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">No orders placed yet.</div>
            ) : (
              orders.map(order => (
                <div key={order.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs min-w-0">
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-slate-900">{order.id}</span>
                      <span className="text-slate-300">·</span>
                      <span className="text-slate-800 font-bold break-words whitespace-normal">{order.productTitle}</span>
                      <span className="text-slate-500">({order.variantSelected})</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-400 text-[11px] flex-wrap">
                      <span>Ordered: {order.createdAt}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-auto shrink-0">
                    <div className="text-right">
                      <div className="font-mono font-extrabold text-pink-600">
                        {order.priceTokens.toLocaleString()} DS
                      </div>
                      <div className="text-[10px] text-pink-500/80 font-bold uppercase tracking-wider font-mono">
                        Tokens
                      </div>
                    </div>

                    <div>
                      {order.status === 'completed' && (
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Fulfilled</span>
                          </span>

                          <button
                            onClick={() => toggleAutoRenew(order.id)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold flex items-center gap-1 transition-all cursor-pointer border ${
                              order.autoRenew ?? true 
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100' 
                                : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                            }`}
                            title="Click to toggle auto-renewal for this subscription"
                          >
                            <RefreshCw className={`w-3 h-3 ${order.autoRenew ?? true ? 'animate-spin-slow text-emerald-600' : 'text-slate-400'}`} />
                            <span>Auto-Renew: {order.autoRenew ?? true ? 'ON' : 'OFF'}</span>
                          </button>

                          <button
                            onClick={() => setSelectedOrderForReceipt(order)}
                            className="p-1.5 rounded-full bg-pink-50 hover:bg-pink-100 text-pink-600 transition-all cursor-pointer border border-pink-200"
                            title="View & Print Official Subscription PDF Receipt"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                      {order.status === 'processing' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-bold text-[11px] animate-pulse">
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
                          <span>Delivering...</span>
                        </span>
                      )}

                      {order.status === 'failed' && (
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-bold text-[11px]" title={order.failureReason}>
                            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                            <span>Refunded</span>
                          </span>
                          <button
                            onClick={() => handleRetryOrder(order.id)}
                            disabled={retryingOrderId === order.id}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                            title="Retry Order"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${retryingOrderId === order.id ? 'animate-spin' : ''}`} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 4: TRANSACTION HISTORY (Deposits, Purchases, Reward Token Earnings) */}
      {activeTab === 'transactions' && (
        <div className="space-y-6">
          {/* A. 4 Financial Overview Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Deposits */}
            <div className="p-4 sm:p-5 rounded-3xl bg-white border border-emerald-100 shadow-[0_4px_20px_rgba(16,185,129,0.06)] relative overflow-hidden flex flex-col justify-between">
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                  Total Deposits
                </span>
                <div className="w-8 h-8 rounded-xl bg-emerald-100/80 text-emerald-600 flex items-center justify-center">
                  <ArrowDownLeft className="w-4 h-4 stroke-[2.5]" />
                </div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-extrabold font-mono text-emerald-600 tabular-nums">
                  +{totalDepositsTokens.toLocaleString()} <span className="text-xs font-bold text-emerald-700">DS</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Paid ৳{totalDepositsBDT.toLocaleString()} across {depositsList.length} top-ups
                </p>
              </div>
            </div>

            {/* Card 2: Subscription Purchases */}
            <div className="p-4 sm:p-5 rounded-3xl bg-white border border-rose-100 shadow-[0_4px_20px_rgba(244,63,94,0.06)] relative overflow-hidden flex flex-col justify-between">
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800">
                  Subscriptions Spent
                </span>
                <div className="w-8 h-8 rounded-xl bg-rose-100/80 text-rose-600 flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
                </div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-extrabold font-mono text-slate-900 tabular-nums">
                  -{totalPurchasesTokens.toLocaleString()} <span className="text-xs font-bold text-rose-600">DS</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Total spent on {purchasesList.length} digital orders
                </p>
              </div>
            </div>

            {/* Card 3: Reward Token Earnings */}
            <div className="p-4 sm:p-5 rounded-3xl bg-white border border-amber-100 shadow-[0_4px_20px_rgba(245,158,11,0.08)] relative overflow-hidden flex flex-col justify-between">
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Rewards Earned
                </span>
                <div className="w-8 h-8 rounded-xl bg-amber-100/80 text-amber-600 flex items-center justify-center">
                  <Gift className="w-4 h-4 stroke-[2.5]" />
                </div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-extrabold font-mono text-amber-600 tabular-nums">
                  +{totalRewardsTokens.toLocaleString()} <span className="text-xs font-bold text-amber-700">DS</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  From {rewardsList.length} cashbacks & streak drops
                </p>
              </div>
            </div>

            {/* Card 4: Wallet Balance & Top Up */}
            <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-pink-500 to-rose-600 text-white shadow-lg shadow-pink-500/20 flex flex-col justify-between relative overflow-hidden">
              <div className="flex items-center justify-between gap-2 mb-2 relative z-10">
                <span className="text-[11px] font-bold uppercase tracking-wider text-pink-100">
                  Available Balance
                </span>
                <div className="w-8 h-8 rounded-xl bg-white/20 text-white flex items-center justify-center">
                  <Coins className="w-4 h-4 stroke-[2.5]" />
                </div>
              </div>
              <div className="relative z-10">
                <div className="text-xl sm:text-2xl font-extrabold font-mono tabular-nums">
                  {currentUser.tokenBalance.toLocaleString()} <span className="text-xs font-bold text-pink-100">DS</span>
                </div>
                <button
                  onClick={() => setActiveTab('add_funds')}
                  className="mt-2 w-full py-1.5 px-3 rounded-xl bg-white text-pink-600 hover:bg-pink-50 font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Deposit Funds</span>
                </button>
              </div>
            </div>
          </div>



          {/* C. Filter Tabs, Search Bar, and Statement Download */}
          <div className="bg-white rounded-3xl border border-pink-100 p-4 sm:p-5 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => setTxFilter('all')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    txFilter === 'all'
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  All Activity ({walletTransactions.length})
                </button>

                <button
                  onClick={() => setTxFilter('deposit')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    txFilter === 'deposit'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/60'
                  }`}
                >
                  <ArrowDownLeft className="w-3.5 h-3.5" />
                  <span>Deposits ({depositsList.length})</span>
                </button>

                <button
                  onClick={() => setTxFilter('purchase')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    txFilter === 'purchase'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/60'
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Purchases ({purchasesList.length})</span>
                </button>

                <button
                  onClick={() => setTxFilter('reward')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    txFilter === 'reward'
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/60'
                  }`}
                >
                  <Gift className="w-3.5 h-3.5" />
                  <span>Rewards ({rewardsList.length})</span>
                </button>
              </div>

              {/* Statement Export Button */}
              <button
                onClick={downloadTransactionStatement}
                className="px-3.5 py-1.5 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200 text-xs font-bold flex items-center gap-1.5 self-start md:self-auto transition-colors"
                title="Download text transaction statement"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Statement</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={txSearch}
                onChange={(e) => setTxSearch(e.target.value)}
                placeholder="Search transactions by title, reference ID, payment method, or Order #..."
                className="w-full bg-[#faf8f9] border border-pink-100 focus:border-pink-500 rounded-2xl pl-10 pr-10 py-2.5 text-xs text-slate-900 outline-none transition-colors"
              />
              {txSearch && (
                <button
                  onClick={() => setTxSearch('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* D. Transactions List */}
          <div className="bg-white rounded-3xl border border-pink-100 overflow-hidden shadow-sm">
            <div className="p-4 sm:p-5 border-b border-pink-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-pink-500" />
                  <span>Activity Logs & Ledger</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Showing {filteredTransactions.length} of {walletTransactions.length} recorded events
                </p>
              </div>

              <span className="text-[11px] font-mono text-slate-400">
                Sorted by latest
              </span>
            </div>

            <div className="divide-y divide-pink-50">
              {filteredTransactions.length === 0 ? (
                <div className="p-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-pink-50 text-pink-500 flex items-center justify-center mx-auto">
                    <Receipt className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">No Transactions Found</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    {txSearch
                      ? `No transactions match "${txSearch}". Try adjusting your search keyword or clearing filters.`
                      : 'There are no transactions recorded in this category yet.'}
                  </p>
                  {txSearch && (
                    <button
                      onClick={() => setTxSearch('')}
                      className="px-4 py-1.5 rounded-xl bg-pink-100 text-pink-700 font-bold text-xs hover:bg-pink-200"
                    >
                      Clear Search
                    </button>
                  )}
                </div>
              ) : (
                filteredTransactions.map((tx) => {
                  const isDeposit = tx.type === 'deposit';
                  const isPurchase = tx.type === 'purchase';
                  const isReward = tx.type === 'reward';

                  return (
                    <div
                      key={tx.id}
                      onClick={() => setSelectedTxForModal(tx)}
                      className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-pink-50/30 transition-colors cursor-pointer group"
                    >
                      {/* Left: Icon & Description */}
                      <div className="flex items-start gap-3.5 min-w-0 flex-1">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                          isDeposit 
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/80' 
                            : isPurchase 
                              ? 'bg-rose-50 text-rose-600 border border-rose-200/80' 
                              : 'bg-amber-50 text-amber-600 border border-amber-200/80'
                        }`}>
                          {isDeposit && <ArrowDownLeft className="w-5 h-5 stroke-[2.5]" />}
                          {isPurchase && <ShoppingBag className="w-5 h-5 stroke-[2]" />}
                          {isReward && <Gift className="w-5 h-5 stroke-[2]" />}
                        </div>

                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-extrabold text-slate-900 break-words group-hover:text-pink-600 transition-colors font-display">
                              {tx.title}
                            </span>

                            {/* Badge */}
                            {isDeposit && (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                                Deposit Top-Up
                              </span>
                            )}
                            {isPurchase && (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-bold border border-rose-200">
                                Subscription
                              </span>
                            )}
                            {isReward && (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 font-bold border border-amber-200">
                                {tx.rewardSource === 'cashback' ? '5% VIP Cashback' : tx.rewardSource === 'daily_streak' ? 'Streak Bonus' : tx.rewardSource === 'referral' ? 'Referral Bonus' : 'Reward Token'}
                              </span>
                            )}
                          </div>

                          {tx.subtitle && (
                            <p className="text-[11px] text-slate-500 break-words">
                              {tx.subtitle}
                            </p>
                          )}

                          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono flex-wrap">
                            <span>{tx.timestamp}</span>
                            {tx.referenceId && (
                              <>
                                <span>·</span>
                                <span className="text-slate-500">Ref: {tx.referenceId}</span>
                              </>
                            )}
                            {tx.paymentMethod && (
                              <>
                                <span>·</span>
                                <span className="text-slate-600 font-semibold">{tx.paymentMethod}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Amount & Status */}
                      <div className="flex items-center gap-4 self-end sm:self-auto shrink-0">
                        <div className="text-right">
                          <div className={`font-mono font-extrabold text-sm sm:text-base tabular-nums ${
                            isDeposit
                              ? 'text-emerald-600'
                              : isPurchase
                                ? 'text-slate-900'
                                : 'text-amber-600'
                          }`}>
                            {tx.amountTokens > 0 ? `+${tx.amountTokens.toLocaleString()}` : tx.amountTokens.toLocaleString()} DS
                          </div>
                          
                          <div className="text-[10px] text-slate-400 font-mono">
                            {isDeposit && tx.amountBDT ? `Paid ৳${tx.amountBDT.toLocaleString()}` : (isReward ? 'Loyalty Credit' : 'Digital Subscription Order')}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10px]">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Verified</span>
                          </span>

                          <button
                            type="button"
                            className="p-1 rounded-lg text-slate-400 group-hover:text-pink-600 group-hover:bg-pink-100 transition-colors"
                            title="View receipt"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* TRANSACTION DETAILS RECEIPT MODAL */}
      {selectedTxForModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in zoom-in-95 duration-150 text-left">
          <div className="relative w-full max-w-md bg-white border border-pink-200 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-pink-100">
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-md ${
                  selectedTxForModal.type === 'deposit'
                    ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                    : selectedTxForModal.type === 'purchase'
                      ? 'bg-rose-500 text-white shadow-rose-500/20'
                      : 'bg-amber-500 text-white shadow-amber-500/20'
                }`}>
                  {selectedTxForModal.type === 'deposit' && <ArrowDownLeft className="w-5 h-5" />}
                  {selectedTxForModal.type === 'purchase' && <ShoppingBag className="w-5 h-5" />}
                  {selectedTxForModal.type === 'reward' && <Sparkles className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 font-display leading-tight">
                    Transaction Receipt
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono font-bold">
                    Official DS Ledger Record
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedTxForModal(null)}
                className="w-8 h-8 rounded-xl bg-pink-50 hover:bg-pink-100 text-slate-400 hover:text-slate-800 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Big Amount Card */}
            <div className={`p-4 rounded-2xl border text-center ${
              selectedTxForModal.type === 'deposit'
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                : selectedTxForModal.type === 'purchase'
                  ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                  : 'bg-amber-50/70 border-amber-200 text-amber-950'
            }`}>
              <span className="text-[11px] font-bold uppercase tracking-wider block opacity-70">
                {selectedTxForModal.type === 'deposit' ? 'Tokens Credited' : selectedTxForModal.type === 'purchase' ? 'Tokens Deducted' : 'Reward Tokens Earned'}
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono mt-0.5">
                {selectedTxForModal.amountTokens > 0 ? `+${selectedTxForModal.amountTokens.toLocaleString()}` : selectedTxForModal.amountTokens.toLocaleString()} DS
              </div>
              {selectedTxForModal.type === 'deposit' && selectedTxForModal.amountBDT && (
                <span className="text-xs font-mono font-bold block mt-1 opacity-70">
                  Paid ৳{selectedTxForModal.amountBDT.toLocaleString()} via Gateway
                </span>
              )}
            </div>

            {/* Receipt Details Table */}
            <div className="p-4 bg-[#faf8f9] rounded-2xl border border-pink-100 space-y-2.5 text-xs font-mono">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Transaction ID:</span>
                <div className="flex items-center gap-1.5 font-bold text-slate-900">
                  <span>{selectedTxForModal.id}</span>
                  <button
                    onClick={() => copyToClipboard(selectedTxForModal.id, `tx-modal-${selectedTxForModal.id}`)}
                    className="p-1 hover:bg-pink-100 rounded text-slate-400 hover:text-pink-600"
                    title="Copy Transaction ID"
                  >
                    {copiedKey === `tx-modal-${selectedTxForModal.id}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-500">Event Title:</span>
                <span className="font-bold text-slate-900 text-right truncate max-w-[220px]">
                  {selectedTxForModal.title}
                </span>
              </div>

              {selectedTxForModal.referenceId && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Reference / TrxID:</span>
                  <div className="flex items-center gap-1 font-bold text-slate-800">
                    <span className="select-all">{selectedTxForModal.referenceId}</span>
                    <button
                      onClick={() => copyToClipboard(selectedTxForModal.referenceId!, `ref-modal-${selectedTxForModal.referenceId}`)}
                      className="p-1 hover:bg-pink-100 rounded text-slate-400 hover:text-pink-600"
                      title="Copy Reference"
                    >
                      {copiedKey === `ref-modal-${selectedTxForModal.referenceId}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
              )}

              {selectedTxForModal.paymentMethod && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Gateway:</span>
                  <span className="font-bold text-slate-900">{selectedTxForModal.paymentMethod}</span>
                </div>
              )}

              {selectedTxForModal.senderNumber && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Sender Number:</span>
                  <span className="font-bold text-slate-900">{selectedTxForModal.senderNumber}</span>
                </div>
              )}

              {selectedTxForModal.rewardNote && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Reward Note:</span>
                  <span className="font-bold text-amber-700 text-right">{selectedTxForModal.rewardNote}</span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className="text-slate-500">Timestamp:</span>
                <span className="font-bold text-slate-700">{selectedTxForModal.timestamp}</span>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-pink-100/80">
                <span className="text-slate-500">Status:</span>
                <span className="text-emerald-700 font-extrabold uppercase text-[11px] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Completed & Recorded</span>
                </span>
              </div>
            </div>

            <div className="flex gap-2.5 pt-1">
              <button
                onClick={() => {
                  const cleanPhone = (settings.supportWhatsApp || '+8801700112233').replace(/[^0-9]/g, '');
                  const queryMsg = `Hello Digital Drive Support,\n\nI have a question about my transaction:\n- Transaction ID: ${selectedTxForModal.id}\n- Title: ${selectedTxForModal.title}\n- Amount: ${selectedTxForModal.amountTokens} DS\n- Ref: ${selectedTxForModal.referenceId || 'N/A'}\n- Date: ${selectedTxForModal.timestamp}`;
                  window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(queryMsg)}`, '_blank', 'noopener,noreferrer');
                }}
                className="flex-1 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Support Query</span>
              </button>

              <button
                onClick={() => setSelectedTxForModal(null)}
                className="py-3 px-6 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* IN-DASHBOARD WHATSAPP VERIFICATION MODAL */}
      {isWhatsAppModalOpen && lastPaymentSummary && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in zoom-in-95 duration-150 text-left">
          <div className="relative w-full max-w-md bg-white border border-pink-200 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-pink-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
                  <MessageCircle className="w-5 h-5 fill-white" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 font-display leading-tight">
                    WhatsApp Payment Verification
                  </h3>
                  <span className="text-[10px] text-emerald-600 font-mono font-bold">
                    Fast 1-Minute Automated Credit
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsWhatsAppModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-pink-50 hover:bg-pink-100 text-slate-400 hover:text-slate-800 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Instruction Message */}
            <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl space-y-2 text-xs text-emerald-950">
              <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                <Info className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Verification Instruction</span>
              </div>
              <p className="text-[11px] leading-relaxed text-emerald-800 whitespace-pre-line break-words">
                {lastPaymentSummary.instructions || "Please send a screenshot of your payment to our WhatsApp support team to get your DS tokens credited instantly."}
              </p>
            </div>

            {/* Summary */}
            <div className="p-3.5 bg-[#faf8f9] rounded-2xl border border-pink-100 space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Method:</span>
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
                <span className="text-slate-500">Tokens:</span>
                <span className="font-bold text-pink-600">+{lastPaymentSummary.tokens} DS</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">TrxID / Reference:</span>
                <span className="font-bold text-slate-700">{lastPaymentSummary.trxId}</span>
              </div>
            </div>

            <button
              onClick={handleOpenWhatsApp}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all"
            >
              <MessageCircle className="w-5 h-5 fill-white" />
              <span>Verify via WhatsApp Now</span>
              <ExternalLink className="w-4 h-4 ml-1" />
            </button>

            <button
              onClick={() => setIsWhatsAppModalOpen(false)}
              className="w-full py-2 rounded-xl text-xs text-slate-500 hover:text-slate-800 font-bold"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* PRINTABLE PDF SUMMARY & OFFICIAL EMAIL RECEIPT MODAL            */}
      {/* ============================================================== */}
      {selectedOrderForReceipt && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedOrderForReceipt(null)}
        >
          <div 
            className="relative w-full max-w-xl bg-white border border-pink-100 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 text-left max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Action Bar (Print / Close) */}
            <div className="flex items-center justify-between pb-4 border-b border-pink-100 print:hidden">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-pink-500" />
                <h3 className="font-extrabold text-base text-slate-900 font-display">
                  Official Subscription Order Receipt
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                  title="Print or Save as PDF"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / PDF</span>
                </button>
                <button
                  onClick={() => setSelectedOrderForReceipt(null)}
                  className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Printable Receipt Layout */}
            <div className="space-y-6 text-slate-900 font-sans print:p-0">
              
              {/* Receipt Header */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200">
                <div>
                  <h2 className="text-xl font-extrabold text-pink-600 font-display tracking-tight">
                    {settings.websiteName || 'Digital Drive (DS)'}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {settings.websiteTagline || 'Automated Digital Subscriptions'}
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono mt-1">
                    https://digitaldrive.vip
                  </p>
                </div>

                <div className="text-right font-mono">
                  <span className="inline-block px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-full font-bold text-[10px] uppercase tracking-wider mb-1">
                    PAID & DELIVERED
                  </span>
                  <div className="text-xs font-bold text-slate-900">
                    Receipt #{selectedOrderForReceipt.id}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {selectedOrderForReceipt.createdAt}
                  </div>
                </div>
              </div>

              {/* Customer & Billing Details */}
              <div className="grid grid-cols-2 gap-4 bg-[#faf8f9] p-4 rounded-2xl border border-pink-100/80 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Billed To</span>
                  <div className="font-bold text-slate-900">{selectedOrderForReceipt.userName || currentUser.name}</div>
                  <div className="text-slate-500 truncate">{selectedOrderForReceipt.targetUserEmail || currentUser.email || 'customer@digitaldrive.vip'}</div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Payment Method</span>
                  <div className="font-bold text-pink-600">DS Token Wallet</div>
                  <div className="text-slate-500">Instant Automated Clearance</div>
                </div>
              </div>

              {/* Line Items Table */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 font-mono text-[10px] text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-4 font-bold">Item & Description</th>
                      <th className="py-3 px-4 font-bold">Duration</th>
                      <th className="py-3 px-4 font-bold text-right">Amount (DS Tokens)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    <tr>
                      <td className="p-4">
                        <div className="font-bold text-slate-900 font-sans text-sm">
                          {selectedOrderForReceipt.productTitle}
                        </div>
                        <div className="text-slate-400 text-[11px]">
                          Category: {selectedOrderForReceipt.category || 'AI Tools'}
                        </div>
                      </td>
                      <td className="p-4 font-semibold text-slate-700">
                        {selectedOrderForReceipt.variantSelected}
                      </td>
                      <td className="p-4 text-right font-extrabold text-pink-600 text-sm">
                        {selectedOrderForReceipt.priceTokens.toLocaleString()} DS
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Delivered Credentials Details */}
              {selectedOrderForReceipt.credentials && (
                <div className="bg-pink-50/50 p-4 rounded-2xl border border-pink-200 space-y-2 font-mono text-xs">
                  <div className="font-bold text-slate-900 font-sans text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Active Credentials & Access Details</span>
                  </div>

                  {selectedOrderForReceipt.credentials.accountEmail && (
                    <div className="flex justify-between border-b border-pink-100/60 pb-1">
                      <span className="text-slate-500">Email / User:</span>
                      <span className="font-bold text-slate-900">{selectedOrderForReceipt.credentials.accountEmail}</span>
                    </div>
                  )}

                  {selectedOrderForReceipt.credentials.password && (
                    <div className="flex justify-between border-b border-pink-100/60 pb-1">
                      <span className="text-slate-500">Password:</span>
                      <span className="font-bold text-pink-700">{selectedOrderForReceipt.credentials.password}</span>
                    </div>
                  )}

                  {selectedOrderForReceipt.credentials.profilePin && (
                    <div className="flex justify-between border-b border-pink-100/60 pb-1">
                      <span className="text-slate-500">Profile PIN:</span>
                      <span className="font-bold text-emerald-700">{selectedOrderForReceipt.credentials.profilePin}</span>
                    </div>
                  )}

                  {selectedOrderForReceipt.credentials.licenseKey && (
                    <div className="flex justify-between border-b border-pink-100/60 pb-1">
                      <span className="text-slate-500">License Key:</span>
                      <span className="font-bold text-pink-600">{selectedOrderForReceipt.credentials.licenseKey}</span>
                    </div>
                  )}

                  {selectedOrderForReceipt.credentials.expiryDate && (
                    <div className="flex justify-between pt-0.5">
                      <span className="text-slate-500">Term Expiry Date:</span>
                      <span className="font-bold text-slate-900">{selectedOrderForReceipt.credentials.expiryDate}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Footer Stamp */}
              <div className="text-center pt-4 border-t border-slate-200 text-slate-400 text-[11px] space-y-1 font-mono">
                <p className="font-bold text-slate-700">Digital Drive (DS) · Automated Subscription Credentials Vault</p>
                <p>This official receipt was generated automatically upon order fulfillment.</p>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};
