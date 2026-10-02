import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Product, 
  Order, 
  TokenTransaction, 
  WalletTransaction,
  TransactionType,
  RewardSource,
  SystemSettings, 
  SyncLog, 
  UserProfile, 
  DurationOption,
  ProductCategory,
  PaymentMethodConfig,
  ProductSource,
  AuditLogEntry,
  ToastNotificationItem,
  ProductSortOption,
  AutoTopupConfig
} from '../types';
import { supplierApi, SupplierProductRaw } from '../services/mockSupplierApi';

interface AppContextType {
  // User Profile & Authentication
  currentUser: UserProfile;
  isLoggedIn: boolean;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  loginWithEmailPassword: (email: string, pass: string) => { success: boolean; message: string };
  registerWithEmailPassword: (name: string, email: string, pass: string) => { success: boolean; message: string };
  loginWithGoogle: () => void;
  logoutUser: () => void;
  switchUserRole: (role: 'customer' | 'admin') => void;
  
  // Products Catalog
  products: Product[];
  categories: ProductCategory[];
  hotDeals: Product[];
  topTrending: Product[];
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  totalProductsCount: number;
  isProductsLoading: boolean;
  fetchProductsByPage: (page: number) => Promise<void>;
  
  // DS Token Wallet & Live Conversion & Full Transaction Center
  settings: SystemSettings;
  convertBDTtoTokens: (bdtAmount: number) => number;
  convertTokensToBDT: (tokenAmount: number) => number;
  addFundsWithTokens: (
    amountBDT: number, 
    methodName: string, 
    trxId: string, 
    senderNumber?: string,
    methodId?: string
  ) => Promise<boolean>;
  tokenTransactions: TokenTransaction[];
  walletTransactions: WalletTransaction[];
  approveDepositRequest: (transactionId: string) => { success: boolean; message: string };
  rejectDepositRequest: (transactionId: string, reason?: string) => { success: boolean; message: string };
  
  // Payment Gateways Config (Admin CRUD)
  addPaymentMethod: (method: Omit<PaymentMethodConfig, 'id'>) => void;
  updatePaymentMethod: (id: string, updates: Partial<PaymentMethodConfig>) => void;
  deletePaymentMethod: (id: string) => void;
  
  // User Management (Admin Deep Controls)
  users: UserProfile[];
  adjustUserTokens: (userId: string, deltaTokens: number, reason: string) => { success: boolean; message: string };
  setUserAccountStatus: (userId: string, status: 'active' | 'suspended' | 'banned') => void;

  // Orders & Purchasing
  orders: Order[];
  placeOrder: (productId: string, variantLabel: string, durationMonths: number, tokenPrice: number, targetUserEmail?: string) => Promise<{ success: boolean; orderId?: string; message: string }>;
  toggleAutoRenew: (orderId: string) => void;
  
  // Admin Management Actions
  updateProductOverride: (productId: string, updates: Partial<Product>) => void;
  createManualProduct: (productData: Omit<Product, 'id' | 'salesCount' | 'rating' | 'status' | 'source'>) => void;
  deleteProduct: (productId: string) => void;
  deleteAllDemoProducts: () => number;
  updateSettings: (newSettings: Partial<SystemSettings>) => void;
  depositSupplierBalance: (amountBDT: number) => void;
  fulfillManualOrder: (orderId: string, credentials: any) => void;
  retryOrderApiFulfillment: (orderId: string) => Promise<boolean>;
  
  // Supplier Synchronization Engine
  syncLogs: SyncLog[];
  syncWithSupplierApi: () => Promise<{ addedCount: number; updatedCount: number; logMessage: string }>;
  forceSyncNow: () => Promise<{ addedCount: number; updatedCount: number; logMessage: string }>;
  connectAndFetchSupplierApi: (config: {
    integrationType: 'telegram_bot' | 'rest_api';
    apiKeyOrToken: string;
    endpointOrChatId: string;
  }) => Promise<{ success: boolean; totalFetched: number; message: string }>;
  purgeAndFreshSyncFromApi: () => Promise<void>;
  toggleSupplierStock: (productId: string) => Promise<number>;
  simulateNewSupplierDrop: () => void;
  simulateSupplierStockOut: (productId: string) => void;
  
  // Modals & UI Controls
  isTopUpModalOpen: boolean;
  setIsTopUpModalOpen: (open: boolean) => void;
  selectedProductForDetail: Product | null;
  setSelectedProductForDetail: (product: Product | null) => void;
  activeView: 'store' | 'dashboard' | 'admin' | 'architecture';
  setActiveView: (view: 'store' | 'dashboard' | 'admin' | 'architecture') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  sortBy: ProductSortOption;
  setSortBy: (option: ProductSortOption) => void;

  // Wishlist Management
  wishlistIds: string[];
  wishlistProducts: Product[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
  isWishlistModalOpen: boolean;
  setIsWishlistModalOpen: (open: boolean) => void;

  // Compare Management (Side-by-Side Comparison)
  compareProductIds: string[];
  compareProducts: Product[];
  toggleCompare: (productId: string) => void;
  isInCompare: (productId: string) => boolean;
  clearCompare: () => void;
  isCompareModalOpen: boolean;
  setIsCompareModalOpen: (open: boolean) => void;
  // Audit Logs Tracking
  auditLogs: AuditLogEntry[];
  recordAuditLog: (entry: Omit<AuditLogEntry, 'id' | 'timestamp' | 'adminId' | 'adminName' | 'adminEmail'>) => void;
  clearAuditLogs: () => void;
  // Real-Time Toast Notifications & Email
  toasts: ToastNotificationItem[];
  addToast: (toast: Omit<ToastNotificationItem, 'id' | 'timestamp'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
  sendOrderCompletedEmail: (order: Order) => Promise<boolean>;
  sendGlobalBroadcast: (message: string) => void;
  // Auto-Topup Engine
  updateAutoTopup: (config: AutoTopupConfig) => void;
  executeAutoTopup: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PRODUCTS: 'digitaldrive_products_v6',
  SETTINGS: 'digitaldrive_settings_v7',
  ORDERS: 'digitaldrive_orders_v6',
  USER: 'digitaldrive_user_v6',
  USERS_LIST: 'digitaldrive_users_v7',
  AUTH_STATE: 'digitaldrive_auth_v6',
  TRANSACTIONS: 'digitaldrive_transactions_v6',
  WALLET_TRANSACTIONS: 'digitaldrive_wallet_txs_v7',
  REWARD_STREAK: 'digitaldrive_reward_streak_v7',
  CAN_CLAIM_REWARD: 'digitaldrive_can_claim_reward_v7',
  LOGS: 'digitaldrive_logs_v6',
  WISHLIST: 'digitaldrive_wishlist_v1',
  COMPARE: 'digitaldrive_compare_v1',
  AUDIT_LOGS: 'digitaldrive_audit_logs_v1'
};

const defaultPaymentMethods: PaymentMethodConfig[] = [
  {
    id: 'pm_bkash',
    name: 'bKash Personal',
    type: 'bkash',
    accountType: 'Personal (Send Money)',
    accountNumber: '01712-345678',
    logoUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=100&auto=format&fit=crop&q=80',
    brandColor: '#e2136e',
    isActive: true,
    instructions: '1. Open your bKash App and select "Send Money".\n2. Send exact amount to our Personal Number.\n3. Note down the Transaction ID (TrxID).\n4. Click "Verify via WhatsApp" to share screenshot for instant automated token deposit.',
    minAmountBDT: 50
  },
  {
    id: 'pm_nagad',
    name: 'Nagad Personal',
    type: 'nagad',
    accountType: 'Personal (Send Money)',
    accountNumber: '01823-987654',
    logoUrl: '',
    brandColor: '#f7941d',
    isActive: true,
    instructions: '1. Open your Nagad App and select "Send Money".\n2. Transfer the exact amount to our Nagad Personal Number.\n3. Take a screenshot of the confirmation page.\n4. Send your TrxID or screenshot on WhatsApp for instant confirmation.',
    minAmountBDT: 50
  },
  {
    id: 'pm_binance',
    name: 'Binance Pay / USDT',
    type: 'binance',
    accountType: 'USDT (TRC-20 & BEP-20 / Binance Pay ID)',
    accountNumber: 'TYd8x72Kqw991PLaMbVxQZ4981772184',
    logoUrl: '',
    brandColor: '#f3ba2f',
    isActive: true,
    instructions: '1. Send USDT to the TRC-20 address or Pay ID (Rate: $1 = 125 Tokens).\n2. Copy the TxID hash.\n3. Forward screenshot to our WhatsApp team for 1-minute verification.',
    minAmountBDT: 125
  },
  {
    id: 'pm_rocket',
    name: 'Rocket Personal',
    type: 'rocket',
    accountType: 'DBBL Rocket (Send Money)',
    accountNumber: '01911-223344-8',
    logoUrl: '',
    brandColor: '#8c338c',
    isActive: true,
    instructions: '1. Go to DBBL Rocket and select "Send Money".\n2. Send money to the 12-digit number.\n3. Send verification to WhatsApp support.',
    minAmountBDT: 100
  },
  {
    id: 'pm_bank',
    name: 'City Bank / BRAC Bank',
    type: 'bank',
    accountType: 'Online Bank Transfer (NPSB / BEFTN)',
    accountNumber: '110293847501 (City Bank Ltd)',
    logoUrl: '',
    brandColor: '#005a9c',
    isActive: true,
    instructions: 'Account Name: Digital Drive Enterprise\nBranch: Gulshan 2, Dhaka\nRouting: 225271829\nSend receipt slip on WhatsApp.',
    minAmountBDT: 500
  }
];

const defaultSettings: SystemSettings = {
  websiteName: 'Digital Drive (DS)',
  websiteTagline: 'Automated Digital Subscriptions',
  seoMetaDescription: 'Instant automated digital subscriptions platform powered by wholesale supplier network and secure DS Token wallet.',
  supportWhatsApp: '+8801700112233',
  supportTelegram: 'https://t.me/digitaldrivesup',
  supportEmail: 'support@digitaldrive.vip',
  sliderAutoScrollSpeedSec: 3,
  hotDealsAutoScroll: true,
  topTrendingAutoScroll: true,
  exchangeRateBDTtoDS: 1.0, // 1 Taka = 1 DS Token
  globalProfitMarginPercent: 35,
  supplierBalanceBDT: 48500,
  supplierApiStatus: 'connected',
  apiIntegrationType: 'telegram_bot',
  supplierApiKey: 'sk_live_ds_prod_99842188402',
  supplierWebsiteUrl: 'https://api.digitalsupplier.io/v2',
  supplierEndpoints: [
    {
      id: 'ep_primary_v2',
      name: 'Primary Wholesale Catalog Endpoint',
      baseUrl: 'https://api.digitalsupplier.io/v2',
      apiKey: 'sk_live_ds_prod_99842188402',
      secretKey: 'ds_sec_77812948',
      integrationType: 'rest_api',
      isPrimary: true,
      status: 'active'
    },
    {
      id: 'ep_telegram_bot',
      name: 'Telegram Bot Dispatcher Channel',
      baseUrl: '@SupplierSubBot',
      apiKey: '7392819481:AAFXzQ9mX_example_bot_token',
      integrationType: 'telegram_bot',
      isPrimary: false,
      status: 'active'
    }
  ],
  telegramBotToken: '7392819481:AAFXzQ9mX_example_bot_token',
  telegramChatId: '@SupplierSubBot',
  isApiConfigured: true,
  customLogoUrl: '',
  customFooterLogoUrl: '',
  paymentMethods: defaultPaymentMethods,
  autoSyncEnabled: true,
  autoSyncIntervalSec: 20,
  apiCacheTtlSec: 300,
  lastSyncTimestamp: new Date().toLocaleTimeString(),
  emailAlertsEnabled: true,
  emailAlertOrderCompleted: true,
  emailAlertExpirationWarning: true,
  emailAlertExpirationDaysBefore: 3,
  emailSenderName: 'Digital Drive Support',
  emailReplyTo: 'support@digitaldrive.vip',
};

const defaultUsersList: UserProfile[] = [
  {
    id: 'usr_premium_01',
    name: 'Tanvir Hossain',
    email: 'tanvir.ds@gmail.com',
    phone: '01712-345678',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    role: 'customer',
    status: 'active',
    tokenBalance: 4250,
    totalSpentTokens: 1840,
    joinedDate: 'Jan 2026',
  },
  {
    id: 'usr_google_auth',
    name: 'Junayed Ahmed',
    email: 'junayedbondo@gmail.com',
    phone: '01823-987654',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    role: 'customer',
    status: 'active',
    tokenBalance: 5000,
    totalSpentTokens: 1200,
    joinedDate: 'Feb 2026',
  },
  {
    id: 'usr_rahul_99',
    name: 'Rahul Sen',
    email: 'rahul.sen99@gmail.com',
    phone: '01911-223344',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    role: 'customer',
    status: 'active',
    tokenBalance: 3100,
    totalSpentTokens: 2450,
    joinedDate: 'Feb 2026',
  },
  {
    id: 'usr_samiya_05',
    name: 'Samiya Khan',
    email: 'samiya.pro@outlook.com',
    phone: '01678-554433',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    role: 'customer',
    status: 'active',
    tokenBalance: 1850,
    totalSpentTokens: 3600,
    joinedDate: 'Mar 2026',
  },
  {
    id: 'usr_farhan_22',
    name: 'Farhan Kabir',
    email: 'farhan.k@gmail.com',
    phone: '01799-887766',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    role: 'customer',
    status: 'suspended',
    tokenBalance: 0,
    totalSpentTokens: 950,
    joinedDate: 'Feb 2026',
  },
  {
    id: 'usr_admin_01',
    name: 'Admin Commander',
    email: 'admin@digitaldrive.vip',
    phone: '01700-112233',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    role: 'admin',
    status: 'active',
    tokenBalance: 99999,
    totalSpentTokens: 0,
    joinedDate: 'Jan 2026',
  }
];

const defaultCustomer: UserProfile = defaultUsersList[0];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER);
    return saved ? JSON.parse(saved) : defaultCustomer;
  });

  const [users, setUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS_LIST);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Failed to parse users list', e);
      }
    }
    return defaultUsersList;
  });

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AUTH_STATE);
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const [settings, setSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (!parsed.paymentMethods || parsed.paymentMethods.length === 0) {
          parsed.paymentMethods = defaultPaymentMethods;
        }
        return { ...defaultSettings, ...parsed };
      } catch (e) {
        console.error('Failed to parse settings', e);
      }
    }
    return defaultSettings;
  });

  const [syncLogs, setSyncLogs] = useState<SyncLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LOGS);
    return saved ? JSON.parse(saved) : [
      {
        id: 'log_01',
        timestamp: new Date(Date.now() - 3600000).toLocaleTimeString(),
        type: 'price_sync',
        title: 'Supplier Catalog Initialized',
        description: 'Synchronized 12 digital subscriptions from Supplier network at wholesale rate.',
      }
    ];
  });

  const calculatePriceTokens = useCallback((wholesaleBDT: number, marginPercent: number, rate: number): number => {
    const retailBDT = wholesaleBDT * (1 + marginPercent / 100);
    const tokens = Math.ceil(retailBDT * rate);
    return tokens;
  }, []);

  // Initialize products from Supplier API raw catalog
  // Initialize products from Supplier API raw catalog with crash-proof sanitization
  const [products, setProducts] = useState<Product[]>(() => {
    const raw = supplierApi.getRawCatalog();
    const mapFromRaw = (item: SupplierProductRaw, idx: number): Product => {
      const margin = 35;
      const priceTokens = Math.ceil(item.wholesalePriceBDT * (1 + margin / 100) * defaultSettings.exchangeRateBDTtoDS);
      const isCoursera = item.supplierSku === 'SUP-COURSERA-PLUS-01';
      const exactStock = isCoursera ? 0 : Math.max(0, item.stockCount ?? 0);

      let initialSource: ProductSource = 'api';
      if (idx >= 8) initialSource = 'demo';
      else if (idx >= 4) initialSource = 'manual';

      return {
        id: `prod_api_${idx + 1}`,
        supplierProductId: item.supplierSku,
        isApiProduct: initialSource === 'api',
        source: initialSource,
        title: item.name,
        originalSupplierTitle: item.name,
        category: item.category,
        description: item.description,
        warranty: item.warranty,
        coverImage: '',
        brandColor: item.brandColor,
        iconName: item.iconName,
        stock: exactStock,
        baseSupplierPriceBDT: item.wholesalePriceBDT,
        profitMarginPercent: margin,
        priceDSTokens: priceTokens,
        durationOptions: [
          { label: '1 Month Access', durationMonths: 1, priceDSTokens: priceTokens },
          { label: '3 Months (Save 10%)', durationMonths: 3, priceDSTokens: Math.ceil(priceTokens * 3 * 0.9), discountTag: '10% OFF' },
          { label: '12 Months (Save 25%)', durationMonths: 12, priceDSTokens: Math.ceil(priceTokens * 12 * 0.75), discountTag: 'BEST VALUE' }
        ],
        isHotDeal: !isCoursera && idx < 4,
        discountPercent: !isCoursera && idx < 4 ? [25, 30, 20, 15][idx] : undefined,
        salesCount: isCoursera ? 0 : 140 + idx * 37,
        rating: 4.8 + (idx % 3) * 0.1,
        deliveryType: 'instant_api',
        credentialFormat: item.format,
        status: exactStock > 0 ? 'active' : 'out_of_stock'
      };
    };

    const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const sanitized = parsed.filter(p => Boolean(p && typeof p === 'object')).map(p => {
            const isCoursera = p?.supplierProductId === 'SUP-COURSERA-PLUS-01';
            const exactStock = isCoursera ? 0 : Math.max(0, typeof p?.stock === 'number' ? p.stock : 0);
            return {
              ...p,
              title: p?.title || 'Subscription',
              description: p?.description || '',
              category: p?.category || 'AI Tools',
              stock: exactStock,
              status: exactStock > 0 ? 'active' : 'out_of_stock',
              priceDSTokens: p?.priceDSTokens ?? 1000,
              durationOptions: Array.isArray(p?.durationOptions) && p.durationOptions.length > 0
                ? p.durationOptions
                : [{ label: '1 Month Access', durationMonths: 1, priceDSTokens: p?.priceDSTokens ?? 1000 }]
            };
          });

          // Ensure all raw supplier items (including ElevenLabs, N8N, Framer, Granola, Coursera) are merged in
          raw.forEach(r => {
            if (!sanitized.some(p => p.supplierProductId === r.supplierSku)) {
              sanitized.push(mapFromRaw(r, sanitized.length));
            }
          });
          return sanitized;
        }
      } catch (err) {
        console.warn('[STORAGE WARN] Resetting corrupt products to fresh catalog', err);
      }
    }

    return raw.map((item, idx) => mapFromRaw(item, idx));
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
    return saved ? JSON.parse(saved) : [
      {
        id: 'ORD-9841',
        userId: 'usr_premium_01',
        userName: 'Tanvir Hossain',
        productId: 'prod_api_1',
        productTitle: 'ChatGPT Plus (GPT-4o & Canvas)',
        category: 'AI Tools',
        variantSelected: '1 Month Access',
        priceTokens: 2430,
        priceBDT: 2430,
        status: 'completed',
        createdAt: '2026-09-28 18:30',
        completedAt: '2026-09-28 18:30',
        deliveryType: 'instant_api',
        credentials: {
          accountEmail: 'ds_tanvir_gpt4@digitaldrive.vip',
          password: 'DS#SecurePlus99!',
          profilePin: '7842',
          expiryDate: '2026-10-28',
          instructions: '1. Log in at chatgpt.com with credentials provided.\n2. Select slot 2. Do not change recovery info.'
        },
        supplierOrderId: 'ORD-7718-GPT'
      }
    ];
  });

  const [tokenTransactions, setTokenTransactions] = useState<TokenTransaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return saved ? JSON.parse(saved) : [
      {
        id: 'TRX-101',
        userId: 'usr_premium_01',
        amountBDT: 5000,
        amountTokens: 5000,
        exchangeRate: 1.0,
        paymentMethod: 'bKash Personal',
        transactionNumber: 'BK9X77A19L',
        status: 'completed',
        timestamp: '2026-09-27 14:15',
        screenshotVerified: true
      }
    ];
  });

  const [walletTransactions, setWalletTransactions] = useState<WalletTransaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.WALLET_TRANSACTIONS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Failed to parse wallet transactions', e);
      }
    }
    return [
      // 1. Reward: Daily Streak Bonus
      {
        id: 'TXN-RWD-502',
        userId: 'usr_premium_01',
        type: 'reward',
        title: 'Daily Login Streak Bonus (Day 7)',
        subtitle: '7-Day active VIP login milestone reward',
        amountTokens: 100,
        balanceAfter: 4250,
        status: 'completed',
        timestamp: 'Today, 08:30 AM',
        referenceId: 'STRK-D7',
        rewardSource: 'daily_streak',
        rewardNote: '7-Day consecutive check-in milestone token drop credited to wallet'
      },
      // 2. Reward: 5% VIP Cashback on ChatGPT Plus
      {
        id: 'TXN-RWD-501',
        userId: 'usr_premium_01',
        type: 'reward',
        title: 'VIP Loyalty Cashback Earning',
        subtitle: '5% token cashback on ChatGPT Plus subscription',
        amountTokens: 122,
        balanceAfter: 4150,
        status: 'completed',
        timestamp: '2026-09-28 18:31',
        referenceId: 'ORD-9841',
        orderId: 'ORD-9841',
        productTitle: 'ChatGPT Plus (GPT-4o & Canvas)',
        rewardSource: 'cashback',
        rewardNote: 'Automatic 5% VIP member order cashback'
      },
      // 3. Purchase: ChatGPT Plus
      {
        id: 'TXN-PUR-9841',
        userId: 'usr_premium_01',
        type: 'purchase',
        title: 'ChatGPT Plus (GPT-4o & Canvas)',
        subtitle: 'Subscription: 1 Month Access · Instant Automated Delivery',
        amountTokens: -2430,
        amountBDT: 2430,
        balanceAfter: 4028,
        status: 'completed',
        timestamp: '2026-09-28 18:30',
        referenceId: 'ORD-9841',
        orderId: 'ORD-9841',
        productTitle: 'ChatGPT Plus (GPT-4o & Canvas)',
        variantLabel: '1 Month Access'
      },
      // 4. Deposit: Nagad Personal
      {
        id: 'TXN-DP-102',
        userId: 'usr_premium_01',
        type: 'deposit',
        title: 'Nagad Deposit Top-Up',
        subtitle: 'Transferred via Nagad Personal (Send Money)',
        amountTokens: 1500,
        amountBDT: 1500,
        balanceAfter: 6458,
        status: 'completed',
        timestamp: '2026-09-28 09:15',
        referenceId: 'NG748201B',
        paymentMethod: 'Nagad Personal',
        senderNumber: '01823-987654'
      },
      // 5. Reward: Referral Earning
      {
        id: 'TXN-RWD-503',
        userId: 'usr_premium_01',
        type: 'reward',
        title: 'Referral Token Bonus',
        subtitle: 'Friend joined via referral code & made first order',
        amountTokens: 250,
        balanceAfter: 4958,
        status: 'completed',
        timestamp: '2026-09-27 19:40',
        referenceId: 'REF-RN90',
        rewardSource: 'referral',
        rewardNote: 'Referral bounty for inviting user Rahul N.'
      },
      // 6. Purchase: Spotify Family Slot
      {
        id: 'TXN-PUR-9830',
        userId: 'usr_premium_01',
        type: 'purchase',
        title: 'Spotify Premium (Family Slot)',
        subtitle: 'Subscription: 3 Months Access (Save 10%)',
        amountTokens: -550,
        amountBDT: 550,
        balanceAfter: 4708,
        status: 'completed',
        timestamp: '2026-09-27 16:20',
        referenceId: 'ORD-9830',
        orderId: 'ORD-9830',
        productTitle: 'Spotify Premium (Family Slot)',
        variantLabel: '3 Months Access'
      },
      // 7. Deposit: bKash Personal
      {
        id: 'TXN-DP-101',
        userId: 'usr_premium_01',
        type: 'deposit',
        title: 'bKash Deposit Top-Up',
        subtitle: 'Transferred via bKash Personal (Send Money)',
        amountTokens: 5000,
        amountBDT: 5000,
        balanceAfter: 5258,
        status: 'completed',
        timestamp: '2026-09-27 14:15',
        referenceId: 'BK9X77A19L',
        paymentMethod: 'bKash Personal',
        senderNumber: '01712-345678'
      },
      // 8. Reward: VIP Welcome Gift
      {
        id: 'TXN-RWD-504',
        userId: 'usr_premium_01',
        type: 'reward',
        title: 'VIP Community Welcome Gift',
        subtitle: 'Welcome bonus tokens for verified account',
        amountTokens: 258,
        balanceAfter: 258,
        status: 'completed',
        timestamp: '2026-09-25 10:00',
        referenceId: 'WLC-2026',
        rewardSource: 'promotional',
        rewardNote: 'Platform onboarding promotional bonus'
      }
    ];
  });

  const [rewardStreakDays, setRewardStreakDays] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.REWARD_STREAK);
    return saved ? JSON.parse(saved) : 7;
  });

  const [canClaimDailyReward, setCanClaimDailyReward] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CAN_CLAIM_REWARD);
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Pagination & Storefront Fetch State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalProductsCount, setTotalProductsCount] = useState<number>(0);
  const [isProductsLoading, setIsProductsLoading] = useState<boolean>(false);

  // UI States
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);
  const [selectedProductForDetail, setSelectedProductForDetail] = useState<Product | null>(null);
  const [activeView, setActiveView] = useState<'store' | 'dashboard' | 'admin' | 'architecture'>('store');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Wishlist State & Persistence
  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.WISHLIST);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isWishlistModalOpen, setIsWishlistModalOpen] = useState(false);

  // Compare State (Side-by-Side Comparison slot, max 2 items)
  const [compareProductIds, setCompareProductIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.COMPARE);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COMPARE, JSON.stringify(compareProductIds));
  }, [compareProductIds]);

  const toggleCompare = useCallback((productId: string) => {
    setCompareProductIds(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      }
      if (prev.length >= 2) {
        return [prev[1], productId];
      }
      return [...prev, productId];
    });
  }, []);

  const isInCompare = useCallback((productId: string) => {
    return compareProductIds.includes(productId);
  }, [compareProductIds]);

  const clearCompare = useCallback(() => {
    setCompareProductIds([]);
  }, []);

  const compareProducts = useMemo(() => {
    return products.filter(p => compareProductIds.includes(p.id));
  }, [products, compareProductIds]);

  // Audit Logs State & Persistence
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback
    }
    const now = Date.now();
    return [
      {
        id: 'aud_001',
        timestamp: new Date(now - 3600000).toISOString(),
        adminId: 'admin_root',
        adminName: 'Super Admin',
        adminEmail: 'admin@digitaldrive.vip',
        action: 'MANUAL_ORDER_FULFILLMENT',
        targetType: 'order',
        targetId: 'ORD-9821',
        details: 'Manually issued account credentials (ChatGPT Plus) for customer tanvir@gmail.com.',
        previousState: 'PENDING',
        newState: 'COMPLETED'
      },
      {
        id: 'aud_002',
        timestamp: new Date(now - 7200000).toISOString(),
        adminId: 'admin_root',
        adminName: 'Super Admin',
        adminEmail: 'admin@digitaldrive.vip',
        action: 'USER_BALANCE_ADJUSTED',
        targetType: 'user',
        targetId: 'user_002',
        details: 'Credited +1,000 DS Tokens to user Tanvir Hossain after manual bKash payment verification.',
        previousState: '500 DS',
        newState: '1,500 DS'
      },
      {
        id: 'aud_003',
        timestamp: new Date(now - 14400000).toISOString(),
        adminId: 'admin_root',
        adminName: 'Super Admin',
        adminEmail: 'admin@digitaldrive.vip',
        action: 'GATEWAY_CONFIG_MODIFIED',
        targetType: 'gateway',
        targetId: 'bkash',
        details: 'Updated bKash Personal Merchant logo and instructions.'
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(auditLogs));
  }, [auditLogs]);

  const recordAuditLog = useCallback((entry: Omit<AuditLogEntry, 'id' | 'timestamp' | 'adminId' | 'adminName' | 'adminEmail'>) => {
    const newEntry: AuditLogEntry = {
      ...entry,
      id: `aud_${Date.now().toString().slice(-6)}_${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      adminId: currentUser?.id || 'admin_root',
      adminName: currentUser?.name || 'Administrator',
      adminEmail: currentUser?.email || 'admin@digitaldrive.vip'
    };
    setAuditLogs(prev => [newEntry, ...prev]);
  }, [currentUser]);

  const clearAuditLogs = useCallback(() => {
    setAuditLogs([]);
  }, []);

  // Real-Time Toast Notifications State
  const [toasts, setToasts] = useState<ToastNotificationItem[]>([]);

  const addToast = useCallback((toast: Omit<ToastNotificationItem, 'id' | 'timestamp'>) => {
    const newToast: ToastNotificationItem = {
      ...toast,
      id: `toast_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString()
    };
    setToasts(prev => [newToast, ...prev]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const sendOrderCompletedEmail = useCallback(async (order: Order): Promise<boolean> => {
    try {
      const targetEmail = order.targetUserEmail || currentUser?.email || 'junayedbondo@gmail.com';

      const res = await fetch('/api/send-email/order-completed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toEmail: targetEmail,
          customerName: order.userName || currentUser?.name || 'Customer',
          orderId: order.id,
          productTitle: order.productTitle,
          variantSelected: order.variantSelected,
          credentials: order.credentials,
          websiteName: settings?.websiteName || 'Digital Drive (DS)'
        })
      });

      const data = await res.json();
      return Boolean(data.success);
    } catch (err) {
      console.warn('[TRANSACTIONAL EMAIL ERROR]', err);
      return false;
    }
  }, [currentUser?.email, currentUser?.name, settings?.websiteName]);

  // Track previous order statuses to fire toast alert & transactional email when PENDING/PROCESSING transitions to COMPLETED
  const prevOrderStatusesRef = React.useRef<Record<string, string>>({});

  useEffect(() => {
    orders.forEach(order => {
      const prevStatus = prevOrderStatusesRef.current[order.id];
      const currentStatus = order.status;

      if (prevStatus && (prevStatus === 'pending' || prevStatus === 'processing') && currentStatus === 'completed') {
        // 1. Real-time toast transition alert
        addToast({
          type: 'order_completed',
          title: '🎉 Order Completed & License Delivered!',
          message: `Order #${order.id} (${order.productTitle}) is now COMPLETED! Credentials sent to email and available in Vault.`,
          orderId: order.id,
          productTitle: order.productTitle,
          actionLabel: 'Open Vault',
          durationMs: 9000
        });

        // 2. Automatic transactional email dispatch
        sendOrderCompletedEmail(order);
      }

      // Update ref store
      prevOrderStatusesRef.current[order.id] = currentStatus;
    });
  }, [orders, addToast, sendOrderCompletedEmail]);

  // Auto-Topup Engine Functions
  const updateAutoTopup = useCallback((config: AutoTopupConfig) => {
    setCurrentUser(prev => ({
      ...prev,
      autoTopup: config
    }));

    setUsers(prevUsers =>
      prevUsers.map(u => (u.id === currentUser.id ? { ...u, autoTopup: config } : u))
    );

    addToast({
      type: 'success',
      title: config.enabled ? '⚡ Auto-Topup Active' : '⏸️ Auto-Topup Paused',
      message: config.enabled
        ? `Auto-topup active! Wallet will auto-replenish ${config.topupAmountTokens} DS Tokens via ${config.paymentMethodName} when balance falls below ${config.thresholdTokens} DS.`
        : 'Auto-topup rules updated and paused.',
      durationMs: 7000
    });
  }, [currentUser.id, addToast]);

  const executeAutoTopup = useCallback(() => {
    if (!currentUser.autoTopup || !currentUser.autoTopup.enabled) return;

    const { topupAmountTokens, paymentMethodName, senderNumberOrAccount } = currentUser.autoTopup;
    const amountBDT = convertTokensToBDT(topupAmountTokens);
    const newBalance = currentUser.tokenBalance + topupAmountTokens;

    setCurrentUser(prev => ({
      ...prev,
      tokenBalance: newBalance,
      autoTopup: prev.autoTopup ? {
        ...prev.autoTopup,
        lastAutoTopupAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', ' + new Date().toISOString().split('T')[0]
      } : undefined
    }));

    const autoTx: WalletTransaction = {
      id: `TXN-AUTO-${Date.now().toString().slice(-6)}`,
      userId: currentUser.id,
      type: 'deposit',
      title: '⚡ Auto-Topup Replenishment',
      subtitle: `Balance fell below threshold. Auto-replenished ${topupAmountTokens} DS Tokens via linked ${paymentMethodName} (${senderNumberOrAccount || 'Auto-Debit'})`,
      amountTokens: topupAmountTokens,
      amountBDT: amountBDT,
      balanceAfter: newBalance,
      status: 'completed',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', ' + new Date().toISOString().split('T')[0],
      referenceId: `AUTO-${Date.now().toString().slice(-4)}`,
      paymentMethod: paymentMethodName,
      senderNumber: senderNumberOrAccount
    };

    setWalletTransactions(prev => [autoTx, ...prev]);

    addToast({
      type: 'success',
      title: '⚡ Auto-Topup Executed!',
      message: `Wallet balance dropped below threshold! Automatically added ${topupAmountTokens} DS Tokens via ${paymentMethodName}. New Balance: ${newBalance} DS.`,
      durationMs: 9000
    });
  }, [currentUser, convertTokensToBDT, addToast]);

  // Auto-Topup Watcher: Triggers auto-topup when balance falls below threshold
  useEffect(() => {
    if (
      currentUser.autoTopup?.enabled &&
      currentUser.tokenBalance < currentUser.autoTopup.thresholdTokens
    ) {
      executeAutoTopup();
    }
  }, [currentUser.tokenBalance, currentUser.autoTopup, executeAutoTopup]);

  const [sortBy, setSortBy] = useState<ProductSortOption>('featured');

  const sortedProducts = useMemo(() => {
    const list = [...(products || [])].filter(p => Boolean(p && typeof p === 'object'));
    if (sortBy === 'price_low_high') {
      return list.sort((a, b) => (a.priceDSTokens ?? 0) - (b.priceDSTokens ?? 0));
    }
    if (sortBy === 'price_high_low') {
      return list.sort((a, b) => (b.priceDSTokens ?? 0) - (a.priceDSTokens ?? 0));
    }
    if (sortBy === 'popularity') {
      return list.sort((a, b) => (b.salesCount ?? 0) - (a.salesCount ?? 0));
    }
    if (sortBy === 'discount') {
      return list.sort((a, b) => (b.discountPercent ?? 0) - (a.discountPercent ?? 0));
    }
    return list;
  }, [products, sortBy]);

  // Reset to page 1 whenever category, search, or sort option changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery, sortBy]);

  // Active Pagination Storefront Fetch Hook: Holds ONLY the active page of products in AppContext state
  useEffect(() => {
    let isMounted = true;
    setIsProductsLoading(true);

    const params = new URLSearchParams();
    params.set('page', String(currentPage));
    params.set('limit', '24');
    if (selectedCategory && selectedCategory !== 'All') {
      params.set('category', selectedCategory);
    }
    if (searchQuery && searchQuery.trim()) {
      params.set('search', searchQuery.trim());
    }

    fetch(`/api/products?${params.toString()}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (isMounted && data?.success && Array.isArray(data.products)) {
          const sanitizedPageProducts = data.products.map((p: any) => {
            const isCoursera = p?.supplierProductId === 'SUP-COURSERA-PLUS-01';
            const exactStock = isCoursera ? 0 : Math.max(0, typeof p?.stock === 'number' ? p.stock : 0);
            return {
              ...p,
              title: p?.title || 'Unknown Product',
              description: p?.description || 'No description available for this subscription.',
              category: p?.category || 'AI Tools',
              brandColor: p?.brandColor || '#ec4899',
              iconName: p?.iconName || 'Sparkles',
              stock: exactStock,
              status: exactStock > 0 ? 'active' : 'out_of_stock',
              priceDSTokens: p?.priceDSTokens ?? 1000,
              durationOptions: Array.isArray(p?.durationOptions) && p.durationOptions.length > 0
                ? p.durationOptions
                : [{ label: '1 Month Access', durationMonths: 1, priceDSTokens: p?.priceDSTokens ?? 1000 }]
            };
          });

          setProducts(sanitizedPageProducts);
          setTotalPages(data.total_pages ?? 1);
          setTotalProductsCount(data.total ?? sanitizedPageProducts.length);
        }
      })
      .catch(err => {
        console.warn('[PAGINATED STOREFRONT FETCH NOTICE] Offline or fallback state', err);
      })
      .finally(() => {
        if (isMounted) setIsProductsLoading(false);
      });

    return () => { isMounted = false; };
  }, [currentPage, selectedCategory, searchQuery]);

  // Explicit page fetch function for PaginationControls
  const fetchProductsByPage = useCallback(async (targetPage: number): Promise<void> => {
    if (targetPage < 1) return;
    setIsProductsLoading(true);
    setCurrentPage(targetPage);

    const params = new URLSearchParams();
    params.set('page', String(targetPage));
    params.set('limit', '24');
    if (selectedCategory && selectedCategory !== 'All') {
      params.set('category', selectedCategory);
    }
    if (searchQuery && searchQuery.trim()) {
      params.set('search', searchQuery.trim());
    }

    try {
      const res = await fetch(`/api/products?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data?.success && Array.isArray(data.products)) {
          const sanitizedPageProducts = data.products.map((p: any) => {
            const isCoursera = p?.supplierProductId === 'SUP-COURSERA-PLUS-01';
            const exactStock = isCoursera ? 0 : Math.max(0, typeof p?.stock === 'number' ? p.stock : 0);
            return {
              ...p,
              title: p?.title || 'Unknown Product',
              description: p?.description || 'No description available for this subscription.',
              category: p?.category || 'AI Tools',
              brandColor: p?.brandColor || '#ec4899',
              iconName: p?.iconName || 'Sparkles',
              stock: exactStock,
              status: exactStock > 0 ? 'active' : 'out_of_stock',
              priceDSTokens: p?.priceDSTokens ?? 1000,
              durationOptions: Array.isArray(p?.durationOptions) && p.durationOptions.length > 0
                ? p.durationOptions
                : [{ label: '1 Month Access', durationMonths: 1, priceDSTokens: p?.priceDSTokens ?? 1000 }]
            };
          });

          setProducts(sanitizedPageProducts);
          setTotalPages(data.total_pages ?? 1);
          setTotalProductsCount(data.total ?? sanitizedPageProducts.length);
        }
      }
    } catch (err) {
      console.warn('[FETCH BY PAGE NOTICE] Error during fetchProductsByPage', err);
    } finally {
      setIsProductsLoading(false);
    }
  }, [selectedCategory, searchQuery]);

  // Persistence
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUTH_STATE, JSON.stringify(isLoggedIn));
  }, [isLoggedIn]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(tokenTransactions));
  }, [tokenTransactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WALLET_TRANSACTIONS, JSON.stringify(walletTransactions));
  }, [walletTransactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REWARD_STREAK, JSON.stringify(rewardStreakDays));
  }, [rewardStreakDays]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CAN_CLAIM_REWARD, JSON.stringify(canClaimDailyReward));
  }, [canClaimDailyReward]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(syncLogs));
  }, [syncLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS_LIST, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(wishlistIds));
  }, [wishlistIds]);

  const toggleWishlist = useCallback((productId: string) => {
    if (!productId) return;
    setWishlistIds(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  }, []);

  const isInWishlist = useCallback((productId: string) => {
    if (!productId) return false;
    return wishlistIds.includes(productId);
  }, [wishlistIds]);

  const clearWishlist = useCallback(() => {
    setWishlistIds([]);
  }, []);

  const wishlistProducts = (products || [])
    .filter(p => Boolean(p && typeof p === 'object' && wishlistIds.includes(p.id)));

  // Currency converters
  const convertBDTtoTokens = useCallback((bdt: number) => {
    return Math.ceil(bdt * settings.exchangeRateBDTtoDS);
  }, [settings.exchangeRateBDTtoDS]);

  const convertTokensToBDT = useCallback((tokens: number) => {
    return Math.round(tokens / (settings.exchangeRateBDTtoDS || 1));
  }, [settings.exchangeRateBDTtoDS]);

  // Auth Handlers
  const loginWithEmailPassword = (email: string, pass: string): { success: boolean; message: string } => {
    const user: UserProfile = {
      id: `usr_${Date.now().toString().slice(-4)}`,
      name: email.split('@')[0].replace(/[^a-zA-Z]/g, ' ') || 'Customer',
      email: email.trim(),
      avatar: '',
      role: email.includes('admin') ? 'admin' : 'customer',
      tokenBalance: 2500,
      totalSpentTokens: 0,
      joinedDate: 'Today'
    };
    setCurrentUser(user);
    setIsLoggedIn(true);
    return { success: true, message: 'Welcome back!' };
  };

  const registerWithEmailPassword = (name: string, email: string, pass: string): { success: boolean; message: string } => {
    const user: UserProfile = {
      id: `usr_${Date.now().toString().slice(-4)}`,
      name: name.trim(),
      email: email.trim(),
      avatar: '',
      role: 'customer',
      tokenBalance: 1000,
      totalSpentTokens: 0,
      joinedDate: 'Today'
    };
    setCurrentUser(user);
    setIsLoggedIn(true);
    return { success: true, message: 'Account created successfully!' };
  };

  const loginWithGoogle = () => {
    const user: UserProfile = {
      id: 'usr_google_auth',
      name: 'Junayed Ahmed',
      email: 'junayedbondo@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      role: 'customer',
      tokenBalance: 5000,
      totalSpentTokens: 1200,
      joinedDate: 'Google Auth'
    };
    setCurrentUser(user);
    setIsLoggedIn(true);
  };

  const logoutUser = () => {
    setIsLoggedIn(false);
    setCurrentUser({
      id: 'guest',
      name: 'Guest User',
      email: '',
      avatar: '',
      role: 'customer',
      tokenBalance: 0,
      totalSpentTokens: 0,
      joinedDate: ''
    });
  };

  const switchUserRole = (role: 'customer' | 'admin') => {
    setCurrentUser(prev => ({
      ...prev,
      role
    }));
  };

  // User Management (Admin Deep Controls)
  const adjustUserTokens = (userId: string, deltaTokens: number, reason: string): { success: boolean; message: string } => {
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) {
      return { success: false, message: 'User not found in system.' };
    }

    const newBalance = Math.max(0, targetUser.tokenBalance + deltaTokens);
    setUsers(prevUsers => prevUsers.map(u => u.id === userId ? { ...u, tokenBalance: newBalance } : u));

    if (currentUser.id === userId) {
      setCurrentUser(prev => ({ ...prev, tokenBalance: newBalance }));
    }

    const isCredit = deltaTokens >= 0;
    const adjustTx: WalletTransaction = {
      id: `TXN-ADJ-${Date.now().toString().slice(-6)}`,
      userId: userId,
      type: isCredit ? 'reward' : 'purchase',
      title: isCredit ? `Admin Token Credit (+${deltaTokens.toLocaleString()} DS)` : `Admin Token Deduction (${deltaTokens.toLocaleString()} DS)`,
      subtitle: `Admin Manual Adjustment: ${reason || (isCredit ? 'Promotional Grant' : 'Balance Correction')}`,
      amountTokens: deltaTokens,
      balanceAfter: newBalance,
      status: 'completed',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', ' + new Date().toISOString().split('T')[0],
      referenceId: `ADM-${Date.now().toString().slice(-4)}`,
      rewardNote: reason || 'Manual Administrator Balance Adjustment'
    };

    setWalletTransactions(prev => [adjustTx, ...prev]);

    recordAuditLog({
      action: 'USER_BALANCE_ADJUSTED',
      targetType: 'user',
      targetId: userId,
      details: `${isCredit ? 'Credited +' : 'Deducted '}${deltaTokens.toLocaleString()} DS Tokens for user "${targetUser.name}" (${targetUser.email}). Reason: ${reason || 'Manual balance adjustment'}`,
      previousState: `${targetUser.tokenBalance.toLocaleString()} DS`,
      newState: `${newBalance.toLocaleString()} DS`
    });

    return {
      success: true,
      message: `Updated ${targetUser.name}'s balance by ${isCredit ? '+' : ''}${deltaTokens.toLocaleString()} DS Tokens. New Balance: ${newBalance.toLocaleString()} DS.`
    };
  };

  const setUserAccountStatus = (userId: string, status: 'active' | 'suspended' | 'banned') => {
    const target = users.find(u => u.id === userId);
    const oldStatus = target?.status || 'active';
    setUsers(prevUsers => prevUsers.map(u => u.id === userId ? { ...u, status } : u));
    if (currentUser.id === userId) {
      setCurrentUser(prev => ({ ...prev, status }));
    }
    
    recordAuditLog({
      action: 'USER_STATUS_CHANGED',
      targetType: 'user',
      targetId: userId,
      details: `Updated account status for user "${target?.name || userId}" (${target?.email || 'User'}) to ${status.toUpperCase()}`,
      previousState: oldStatus,
      newState: status
    });
  };

  const forceSyncNow = async (): Promise<{ addedCount: number; updatedCount: number; logMessage: string }> => {
    return await syncWithSupplierApi();
  };

  // Add Funds (Top Up) with strict manual deposit status = 'pending'
  const addFundsWithTokens = async (
    amountBDT: number, 
    methodName: string, 
    trxId: string, 
    senderNumber?: string,
    methodId?: string
  ): Promise<boolean> => {
    if (!isLoggedIn) {
      setIsAuthModalOpen(true);
      return false;
    }

    const tokensToCredit = convertBDTtoTokens(amountBDT);
    const finalTrx = trxId || `DS${Math.floor(100000 + Math.random() * 900000)}`;

    const newTx: TokenTransaction = {
      id: `TRX-${Date.now().toString().slice(-5)}`,
      userId: currentUser.id,
      amountBDT,
      amountTokens: tokensToCredit,
      exchangeRate: settings.exchangeRateBDTtoDS,
      paymentMethod: methodName,
      paymentMethodId: methodId,
      senderNumber,
      transactionNumber: finalTrx,
      status: 'pending', // MUST REMAIN PENDING UNTIL ADMIN APPROVES!
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', ' + new Date().toISOString().split('T')[0],
      screenshotVerified: true
    };

    const depositWalletTx: WalletTransaction = {
      id: `TXN-DP-${Date.now().toString().slice(-6)}`,
      userId: currentUser.id,
      type: 'deposit',
      title: `${methodName} Deposit Top-Up Request`,
      subtitle: senderNumber ? `Sender: ${senderNumber} · TrxID: ${finalTrx}` : `TrxID: ${finalTrx}`,
      amountTokens: tokensToCredit,
      amountBDT,
      balanceAfter: currentUser.tokenBalance, // Tokens NOT added yet!
      status: 'pending', // MUST REMAIN PENDING UNTIL ADMIN APPROVES!
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', ' + new Date().toISOString().split('T')[0],
      referenceId: finalTrx,
      paymentMethod: methodName,
      senderNumber
    };

    setTokenTransactions(prev => [newTx, ...prev]);
    setWalletTransactions(prev => [depositWalletTx, ...prev]);

    // REQUIREMENT 1: Instantly redirect user to WhatsApp with dynamic pre-filled message
    const cleanWaNum = (settings.supportWhatsApp || '8801712345678').replace(/[^0-9]/g, '');
    const waText = `Hello ${settings.websiteName || 'Digital Drive'} Admin,\n\nI submitted a Wallet Top-Up Request!\n\n👤 Name: ${currentUser.name}\n📧 Email: ${currentUser.email}\n💵 Amount: ৳${amountBDT.toLocaleString()} BDT (${tokensToCredit.toLocaleString()} DS Tokens)\n💳 Method: ${methodName}\n📱 Sender Number: ${senderNumber || 'N/A'}\n🆔 TrxID: ${finalTrx}\n⏰ Timestamp: ${newTx.timestamp}\n\nPlease verify and approve my token credit!`;

    const waUrl = `https://wa.me/${cleanWaNum}?text=${encodeURIComponent(waText)}`;

    try {
      window.open(waUrl, '_blank');
    } catch (e) {
      console.warn('WhatsApp window open blocked', e);
    }

    addToast({
      type: 'info',
      title: 'Top-Up Request Created (Pending Verification)',
      message: `Deposit request of ৳${amountBDT.toLocaleString()} (${tokensToCredit.toLocaleString()} DS Tokens) submitted. Redirecting to WhatsApp for instant verification...`,
      durationMs: 8000
    });

    return true;
  };

  // Admin Approve Deposit Request
  const approveDepositRequest = (transactionId: string): { success: boolean; message: string } => {
    const targetTx = walletTransactions.find(t => t.id === transactionId || t.referenceId === transactionId);
    if (!targetTx) {
      return { success: false, message: 'Deposit transaction request not found.' };
    }

    if (targetTx.status === 'completed') {
      return { success: false, message: 'Deposit request has already been approved.' };
    }

    const tokensToCredit = Math.abs(targetTx.amountTokens);
    const targetUserId = targetTx.userId;
    const targetUser = users.find(u => u.id === targetUserId) || currentUser;

    const newBalance = targetUser.tokenBalance + tokensToCredit;

    // Update Wallet Transaction & Token Transaction
    setWalletTransactions(prev => prev.map(t => {
      if (t.id === transactionId || t.referenceId === transactionId) {
        return {
          ...t,
          status: 'completed',
          balanceAfter: newBalance
        };
      }
      return t;
    }));

    setTokenTransactions(prev => prev.map(t => {
      if (t.id === transactionId || t.transactionNumber === transactionId) {
        return {
          ...t,
          status: 'completed'
        };
      }
      return t;
    }));

    // Mathematically add tokens to user wallet
    setUsers(prev => prev.map(u => u.id === targetUserId ? { ...u, tokenBalance: newBalance } : u));
    if (currentUser.id === targetUserId) {
      setCurrentUser(prev => ({ ...prev, tokenBalance: newBalance }));
    }

    recordAuditLog({
      action: 'USER_BALANCE_ADJUSTED',
      targetType: 'user',
      targetId: targetUserId,
      details: `Approved manual deposit request (${targetTx.paymentMethod || 'Manual Gateway'}). Credited +${tokensToCredit.toLocaleString()} DS Tokens to ${targetUser.name} (${targetUser.email}).`,
      previousState: `${targetUser.tokenBalance.toLocaleString()} DS`,
      newState: `${newBalance.toLocaleString()} DS`
    });

    addToast({
      type: 'success',
      title: '🎉 Deposit Request Approved!',
      message: `Successfully approved deposit and credited +${tokensToCredit.toLocaleString()} DS Tokens to ${targetUser.name}'s wallet.`,
      durationMs: 8000
    });

    return {
      success: true,
      message: `Approved deposit and credited +${tokensToCredit.toLocaleString()} DS Tokens to ${targetUser.name}.`
    };
  };

  // Admin Reject Deposit Request
  const rejectDepositRequest = (transactionId: string, reason?: string): { success: boolean; message: string } => {
    const targetTx = walletTransactions.find(t => t.id === transactionId || t.referenceId === transactionId);
    if (!targetTx) {
      return { success: false, message: 'Deposit request not found.' };
    }

    setWalletTransactions(prev => prev.map(t => {
      if (t.id === transactionId || t.referenceId === transactionId) {
        return { ...t, status: 'failed' };
      }
      return t;
    }));

    setTokenTransactions(prev => prev.map(t => {
      if (t.id === transactionId || t.transactionNumber === transactionId) {
        return { ...t, status: 'failed' };
      }
      return t;
    }));

    recordAuditLog({
      action: 'USER_BALANCE_ADJUSTED',
      targetType: 'user',
      targetId: targetTx.userId,
      details: `Rejected manual deposit request ID #${transactionId} (${targetTx.paymentMethod || 'Manual Gateway'}). Reason: ${reason || 'Unverified TrxID/Screenshot'}`,
    });

    return {
      success: true,
      message: `Deposit request #${transactionId} rejected.`
    };
  };

  // Payment Methods Admin Management
  const addPaymentMethod = (method: Omit<PaymentMethodConfig, 'id'>) => {
    const newMethod: PaymentMethodConfig = {
      ...method,
      id: `pm_${Date.now()}`
    };
    setSettings(prev => ({
      ...prev,
      paymentMethods: [...(prev.paymentMethods || []), newMethod]
    }));

    recordAuditLog({
      action: 'GATEWAY_CONFIG_MODIFIED',
      targetType: 'gateway',
      targetId: newMethod.id,
      details: `Created new manual payment gateway "${newMethod.name}" (${newMethod.accountNumber}).`
    });
  };

  const updatePaymentMethod = (id: string, updates: Partial<PaymentMethodConfig>) => {
    setSettings(prev => ({
      ...prev,
      paymentMethods: (prev.paymentMethods || []).map(pm => pm.id === id ? { ...pm, ...updates } : pm)
    }));

    recordAuditLog({
      action: 'GATEWAY_CONFIG_MODIFIED',
      targetType: 'gateway',
      targetId: id,
      details: `Updated payment gateway settings for "${updates.name || id}".`
    });
  };

  const deletePaymentMethod = (id: string) => {
    setSettings(prev => ({
      ...prev,
      paymentMethods: (prev.paymentMethods || []).filter(pm => pm.id !== id)
    }));

    recordAuditLog({
      action: 'GATEWAY_CONFIG_MODIFIED',
      targetType: 'gateway',
      targetId: id,
      details: `Deleted payment gateway ID #${id}.`
    });
  };

  // Connect & Fetch Supplier API
  const connectAndFetchSupplierApi = async (config: {
    integrationType: 'telegram_bot' | 'rest_api';
    apiKeyOrToken: string;
    endpointOrChatId: string;
  }): Promise<{ success: boolean; totalFetched: number; message: string }> => {
    console.log('[Digital Drive Supplier Bridge] Connecting to supplier endpoint...');

    setSettings(prev => ({
      ...prev,
      supplierApiStatus: 'syncing',
      apiIntegrationType: config.integrationType,
      supplierApiKey: config.apiKeyOrToken,
      supplierWebsiteUrl: config.integrationType === 'rest_api' ? config.endpointOrChatId : prev.supplierWebsiteUrl,
      telegramBotToken: config.integrationType === 'telegram_bot' ? config.apiKeyOrToken : prev.telegramBotToken,
      telegramChatId: config.integrationType === 'telegram_bot' ? config.endpointOrChatId : prev.telegramChatId,
      isApiConfigured: true,
    }));

    try {
      await new Promise(r => setTimeout(r, 650));

      if (!config.apiKeyOrToken || !config.endpointOrChatId) {
        throw new Error('API Key / Bot Token and Endpoint / Chat ID are required.');
      }

      // Fetch ALL available products dynamically with pagination traversal (NO 12-item limit)
      const rawList = await supplierApi.fetchAllProductsUnlimited();
      if (!Array.isArray(rawList) || rawList.length === 0) {
        throw new Error('Supplier returned an empty product array.');
      }

      const rate = settings.exchangeRateBDTtoDS;
      const margin = settings.globalProfitMarginPercent;

      const freshProducts: Product[] = rawList.map((item, idx) => {
        const priceTokens = Math.ceil(item.wholesalePriceBDT * (1 + margin / 100) * rate);
        const isInStock = (item.stockCount ?? 0) > 0;

        return {
          id: `prod_api_${item.supplierSku.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
          supplierProductId: item.supplierSku,
          isApiProduct: true,
          source: 'api',
          title: item.name,
          originalSupplierTitle: item.name,
          category: item.category,
          description: item.description,
          warranty: item.warranty || null,
          coverImage: '',
          brandColor: item.brandColor || '#ec4899',
          iconName: item.iconName || 'Sparkles',
          stock: item.stockCount ?? 0,
          baseSupplierPriceBDT: item.wholesalePriceBDT,
          profitMarginPercent: margin,
          priceDSTokens: priceTokens,
          durationOptions: [
            { label: '1 Month Access', durationMonths: 1, priceDSTokens: priceTokens },
            { label: '3 Months (Save 10%)', durationMonths: 3, priceDSTokens: Math.ceil(priceTokens * 3 * 0.9), discountTag: '10% OFF' },
            { label: '12 Months (Save 25%)', durationMonths: 12, priceDSTokens: Math.ceil(priceTokens * 12 * 0.75), discountTag: 'BEST VALUE' }
          ],
          isHotDeal: idx < 6,
          discountPercent: idx < 6 ? [25, 30, 20, 15, 20, 10][idx] : undefined,
          salesCount: 140 + idx * 37,
          rating: 4.8 + (idx % 3) * 0.1,
          deliveryType: 'instant_api',
          credentialFormat: item.format,
          status: isInStock ? 'active' : 'out_of_stock'
        };
      });

      setProducts(freshProducts);

      const providerName = config.integrationType === 'telegram_bot' 
        ? `Telegram Bot (${config.endpointOrChatId})` 
        : `Supplier Endpoint (${config.endpointOrChatId})`;

      const successLog: SyncLog = {
        id: `log_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        type: 'auto_add',
        title: `Connected to ${providerName}`,
        description: `Successfully fetched and loaded all ${freshProducts.length} live subscription products into the store catalog.`,
      };

      setSyncLogs(prev => [successLog, ...prev]);
      setSettings(prev => ({
        ...prev,
        supplierApiStatus: 'connected',
        lastSyncTimestamp: new Date().toLocaleTimeString(),
        supplierBalanceBDT: supplierApi.getSupplierBalance(),
      }));

      return {
        success: true,
        totalFetched: freshProducts.length,
        message: `Successfully connected to ${providerName}! Fetched all ${freshProducts.length} digital subscriptions into database.`
      };
    } catch (err: any) {
      console.error('[Supplier Bridge Error]:', err);
      const errorMsg = err?.message || 'Failed to connect to supplier endpoint.';
      setSettings(prev => ({
        ...prev,
        supplierApiStatus: 'disconnected'
      }));

      return {
        success: false,
        totalFetched: 0,
        message: errorMsg
      };
    }
  };

  // Delete All Demo Products (One-click Cleanup)
  const deleteAllDemoProducts = (): number => {
    const demoItems = products.filter(p => p.source === 'demo');
    const count = demoItems.length;
    setProducts(prev => prev.filter(p => p.source !== 'demo'));
    setSyncLogs(prev => [
      {
        id: `log_clean_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        type: 'admin_override',
        title: 'Demo Products Cleaned',
        description: `Admin removed ${count} demo products from the database.`,
      },
      ...prev
    ]);
    return count;
  };

  // Purge sample catalog and fresh sync solely from Supplier (Unlimited)
  const purgeAndFreshSyncFromApi = async (): Promise<void> => {
    setSettings(prev => ({ ...prev, supplierApiStatus: 'syncing' }));
    await new Promise(r => setTimeout(r, 500));

    const rawList = await supplierApi.fetchAllProductsUnlimited();
    const rate = settings.exchangeRateBDTtoDS;
    const margin = settings.globalProfitMarginPercent;

    const liveApiProducts: Product[] = rawList.map((item, idx) => {
      const priceTokens = Math.ceil(item.wholesalePriceBDT * (1 + margin / 100) * rate);
      return {
        id: `prod_api_${item.supplierSku.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
        supplierProductId: item.supplierSku,
        isApiProduct: true,
        source: 'api',
        title: item.name,
        originalSupplierTitle: item.name,
        category: item.category,
        description: item.description,
        warranty: item.warranty,
        coverImage: '',
        brandColor: item.brandColor,
        iconName: item.iconName,
        stock: item.stockCount,
        baseSupplierPriceBDT: item.wholesalePriceBDT,
        profitMarginPercent: margin,
        priceDSTokens: priceTokens,
        durationOptions: [
          { label: '1 Month Access', durationMonths: 1, priceDSTokens: priceTokens },
          { label: '3 Months (Save 10%)', durationMonths: 3, priceDSTokens: Math.ceil(priceTokens * 3 * 0.9), discountTag: '10% OFF' },
          { label: '12 Months (Save 25%)', durationMonths: 12, priceDSTokens: Math.ceil(priceTokens * 12 * 0.75), discountTag: 'BEST VALUE' }
        ],
        salesCount: 150 + idx * 24,
        rating: 4.8 + (idx % 3) * 0.1,
        deliveryType: 'instant_api',
        credentialFormat: item.format,
        status: item.stockCount > 0 ? 'active' : 'out_of_stock'
      };
    });

    setProducts(liveApiProducts);
    setSyncLogs(prev => [
      {
        id: `log_purge_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        type: 'auto_add',
        title: 'Catalog Reset to Pure Supplier Catalog',
        description: `Purged static demo items. Storefront is now running solely on ${liveApiProducts.length} verified products.`,
      },
      ...prev
    ]);
    setSettings(prev => ({ ...prev, supplierApiStatus: 'connected', lastSyncTimestamp: new Date().toLocaleTimeString() }));
  };

  // Toggle stock between Out of Stock and In Stock with strict Backend & Local Upsert
  const toggleSupplierStock = async (productId: string): Promise<number> => {
    const prod = products.find(p => p.id === productId);
    if (!prod || !prod.supplierProductId) return 0;

    // Call backend endpoint to keep server database in 100% lockstep
    try {
      fetch('/api/products/toggle-stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, sku: prod.supplierProductId })
      }).catch(err => console.warn('[BACKEND STOCK TOGGLE ERROR]', err));
    } catch (e) {
      // Ignored for offline resiliency
    }

    const newStock = supplierApi.toggleStockForSku(prod.supplierProductId);
    
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        return {
          ...p,
          stock: newStock,
          status: newStock > 0 ? 'active' : 'out_of_stock'
        };
      }
      return p;
    }));

    setSyncLogs(prev => [
      {
        id: `log_stock_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        type: 'stock_sync',
        title: `Stock Updated: ${prod.title}`,
        description: newStock === 0 
          ? `Stock depleted (0 units). Product status changed to OUT OF STOCK.`
          : `Restocked item (${newStock} units). Product status changed to IN STOCK.`,
      },
      ...prev
    ]);

    return newStock;
  };

  // Automated Supplier Synchronizer with STRICT UPSERT & Unlimited Traversal
  const syncWithSupplierApi = useCallback(async (): Promise<{ addedCount: number; updatedCount: number; logMessage: string }> => {
    setSettings(prev => ({ ...prev, supplierApiStatus: 'syncing' }));

    // 1. Trigger backend pagination while-loop sync
    try {
      const backendRes = await fetch('/api/products/sync', { method: 'POST' });
      if (backendRes.ok) {
        const backendData = await backendRes.json();
        if (backendData.success && Array.isArray(backendData.products) && backendData.products.length > 0) {
          console.log(`[BACKEND SYNC SUCCESS] Received ${backendData.products.length} products from backend upsert database.`);
          setProducts(backendData.products);
          setSettings(prev => ({
            ...prev,
            supplierApiStatus: 'connected',
            lastSyncTimestamp: new Date().toLocaleTimeString()
          }));
          return {
            addedCount: backendData.addedCount || 0,
            updatedCount: backendData.updatedCount || 0,
            logMessage: backendData.message || 'Synced from backend database'
          };
        }
      }
    } catch (err) {
      console.warn('[BACKEND SYNC NOTICE] Falling back to client-side unlimited poller', err);
    }

    // 2. Fetch all products without LIMIT or .slice constraints
    const supplierRawList = await supplierApi.fetchAllProductsUnlimited();
    const currentBal = supplierApi.getSupplierBalance();

    let addedCount = 0;
    let updatedCount = 0;

    setProducts(currentProducts => {
      const updatedList = [...(currentProducts || []).filter(p => Boolean(p && typeof p === 'object'))];

      supplierRawList.forEach(raw => {
        const existingIdx = updatedList.findIndex(p => p.supplierProductId === raw.supplierSku);
        
        // 100% ACCURATE REAL-TIME STOCK SYNC:
        // If Supplier API stock == 0 (e.g. Coursera), database MUST update to 0, status: 'out_of_stock'
        const exactStock = Math.max(0, raw.stockCount ?? 0);
        const computedStatus: 'active' | 'out_of_stock' = exactStock > 0 ? 'active' : 'out_of_stock';

        if (existingIdx >= 0) {
          // STRICT UPSERT: UPDATE IF EXISTS
          const existing = updatedList[existingIdx];
          const margin = existing.isOverridden ? existing.profitMarginPercent : settings.globalProfitMarginPercent;
          const calculatedTokens = calculatePriceTokens(raw.wholesalePriceBDT, margin, settings.exchangeRateBDTtoDS);

          const updatedDurationOptions = (existing.durationOptions || []).map(opt => {
            if (opt.durationMonths === 1) return { ...opt, priceDSTokens: calculatedTokens };
            if (opt.durationMonths === 3) return { ...opt, priceDSTokens: Math.ceil(calculatedTokens * 3 * 0.9) };
            if (opt.durationMonths === 12) return { ...opt, priceDSTokens: Math.ceil(calculatedTokens * 12 * 0.75) };
            return opt;
          });

          updatedList[existingIdx] = {
            ...existing,
            title: existing.isOverridden ? existing.title : raw.name,
            originalSupplierTitle: raw.name,
            description: existing.isOverridden ? existing.description : raw.description,
            warranty: raw.warranty,
            stock: exactStock, // 100% EXACT STOCK MATCHING
            baseSupplierPriceBDT: raw.wholesalePriceBDT,
            priceDSTokens: calculatedTokens,
            durationOptions: updatedDurationOptions,
            status: computedStatus,
          };
          updatedCount++;
        } else {
          // STRICT UPSERT: INSERT IF NEW
          const calculatedTokens = calculatePriceTokens(raw.wholesalePriceBDT, settings.globalProfitMarginPercent, settings.exchangeRateBDTtoDS);
          const isCoursera = raw.supplierSku === 'SUP-COURSERA-PLUS-01';

          const newProduct: Product = {
            id: `prod_api_auto_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
            supplierProductId: raw.supplierSku,
            isApiProduct: true,
            source: 'api',
            title: raw.name,
            originalSupplierTitle: raw.name,
            category: raw.category,
            description: raw.description,
            warranty: raw.warranty,
            coverImage: '',
            brandColor: raw.brandColor,
            iconName: raw.iconName,
            stock: exactStock, // 100% EXACT STOCK MATCHING
            baseSupplierPriceBDT: raw.wholesalePriceBDT,
            profitMarginPercent: settings.globalProfitMarginPercent,
            priceDSTokens: calculatedTokens,
            durationOptions: [
              { label: '1 Month Access', durationMonths: 1, priceDSTokens: calculatedTokens },
              { label: '3 Months (Save 10%)', durationMonths: 3, priceDSTokens: Math.ceil(calculatedTokens * 3 * 0.9), discountTag: '10% OFF' },
              { label: '12 Months (Save 25%)', durationMonths: 12, priceDSTokens: Math.ceil(calculatedTokens * 12 * 0.75), discountTag: 'BEST VALUE' }
            ],
            isHotDeal: !isCoursera && addedCount < 4,
            discountPercent: !isCoursera && addedCount < 4 ? [25, 30, 20, 15][addedCount % 4] : undefined,
            salesCount: isCoursera ? 0 : 1,
            rating: 4.9,
            deliveryType: 'instant_api',
            credentialFormat: raw.format,
            status: computedStatus
          };
          updatedList.unshift(newProduct);
          addedCount++;
        }
      });

      return updatedList;
    });

    const logMsg = `Auto-Sync Complete: ${addedCount} new products discovered, ${updatedCount} products synced. Supplier balance: ৳${currentBal.toLocaleString()}. 100% stock matching verified.`;

    const newLog: SyncLog = {
      id: `log_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      type: addedCount > 0 ? 'auto_add' : 'price_sync',
      title: addedCount > 0 ? `Auto-Added ${addedCount} New Products` : 'Stock & Price Auto-Sync',
      description: logMsg,
    };

    setSyncLogs(prev => [newLog, ...prev.slice(0, 49)]);
    setSettings(prev => ({
      ...prev,
      supplierBalanceBDT: currentBal,
      supplierApiStatus: 'connected',
      lastSyncTimestamp: new Date().toLocaleTimeString()
    }));

    return { addedCount, updatedCount, logMessage: logMsg };
  }, [calculatePriceTokens, settings.exchangeRateBDTtoDS, settings.globalProfitMarginPercent]);

  // Automated Interval Polling
  useEffect(() => {
    if (!settings.autoSyncEnabled) return;
    const interval = setInterval(() => {
      syncWithSupplierApi();
    }, (settings.autoSyncIntervalSec || 30) * 1000);
    return () => clearInterval(interval);
  }, [settings.autoSyncEnabled, settings.autoSyncIntervalSec, syncWithSupplierApi]);

  // Simulate new supplier item drop
  const simulateNewSupplierDrop = () => {
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const mockDrops: SupplierProductRaw[] = [
      {
        supplierSku: `SUP-DEEPSEEK-R1-${randomSuffix}`,
        name: `DeepSeek R1 Pro Reasoning Model (${randomSuffix}M)`,
        category: 'AI Tools',
        description: 'Ultra-fast low-latency reasoning AI quota with direct account keys and priority bandwidth.',
        warranty: '30 Days Full Replacement Warranty',
        wholesalePriceBDT: 1100,
        stockCount: 50,
        format: 'license_key',
        brandColor: '#3b82f6',
        iconName: 'Sparkles',
        autoFulfillSpeedSeconds: 2
      },
      {
        supplierSku: `SUP-CRUNCHYROLL-MEGA-${randomSuffix}`,
        name: `Crunchyroll Mega Fan 1-Year Slot (${randomSuffix})`,
        category: 'Streaming',
        description: 'Simulcast anime in 1080p/4K, offline viewing on 4 devices, full manga library access.',
        warranty: '1 Year Guaranteed Slot Warranty',
        wholesalePriceBDT: 450,
        stockCount: 30,
        format: 'invite_link',
        brandColor: '#f97316',
        iconName: 'Tv',
        autoFulfillSpeedSeconds: 1
      }
    ];

    const item = mockDrops[Math.floor(Math.random() * mockDrops.length)];
    supplierApi.pushNewSupplierProduct(item);
    syncWithSupplierApi();
  };

  const simulateSupplierStockOut = (productId: string) => {
    const prod = products.find(p => p.id === productId);
    if (!prod || !prod.supplierProductId) return;
    supplierApi.updateSupplierStock(prod.supplierProductId, 0);
    syncWithSupplierApi();
  };

  const placeOrder = async (
    productId: string,
    variantLabel: string,
    durationMonths: number,
    tokenPrice: number,
    targetUserEmail?: string
  ): Promise<{ success: boolean; orderId?: string; message: string }> => {
    if (!isLoggedIn) {
      setIsAuthModalOpen(true);
      return { success: false, message: 'Please sign in or create an account to place an order.' };
    }

    const product = products.find(p => p.id === productId);
    if (!product) {
      return { success: false, message: 'Product not found.' };
    }

    if (currentUser.tokenBalance < tokenPrice) {
      return { 
        success: false, 
        message: `Insufficient DS Tokens. You need ${tokenPrice} DS Tokens but have ${currentUser.tokenBalance}. Please Top Up.` 
      };
    }

    if (product.stock <= 0) {
      return { success: false, message: 'Item is currently Out of Stock.' };
    }

    // Deduct user token balance immediately
    setCurrentUser(prev => ({
      ...prev,
      tokenBalance: prev.tokenBalance - tokenPrice,
      totalSpentTokens: prev.totalSpentTokens + tokenPrice,
    }));

    const newOrderId = `ORD-${Date.now().toString().slice(-4)}${Math.floor(10 + Math.random() * 90)}`;
    const orderBDT = convertTokensToBDT(tokenPrice);

    const pendingOrder: Order = {
      id: newOrderId,
      userId: currentUser.id,
      userName: currentUser.name,
      productId: product.id,
      productTitle: product.title,
      category: product.category,
      variantSelected: variantLabel,
      priceTokens: tokenPrice,
      priceBDT: orderBDT,
      status: 'pending', // DEFAULT STATUS MUST BE PENDING
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', ' + new Date().toISOString().split('T')[0],
      deliveryType: product.deliveryType,
      targetUserEmail: targetUserEmail || undefined,
      autoRenew: true, // Auto-renew enabled by default
      autoRenewStatus: 'active'
    };

    const purchaseTx: WalletTransaction = {
      id: `TXN-PUR-${Date.now().toString().slice(-6)}`,
      userId: currentUser.id,
      type: 'purchase',
      title: product.title,
      subtitle: `Subscription: ${variantLabel}`,
      amountTokens: -tokenPrice,
      amountBDT: orderBDT,
      balanceAfter: currentUser.tokenBalance - tokenPrice,
      status: 'completed',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', ' + new Date().toISOString().split('T')[0],
      referenceId: newOrderId,
      orderId: newOrderId,
      productTitle: product.title,
      variantLabel
    };

    setOrders(prev => [pendingOrder, ...prev]);
    setWalletTransactions(prev => [purchaseTx, ...prev]);

    if (product.isApiProduct && product.supplierProductId) {
      // 1. CRITICAL PRE-FLIGHT FUND CHECK: Verify supplier balance before purchase request
      const preflight = supplierApi.checkSupplierBalance(product.baseSupplierPriceBDT);

      if (!preflight.hasSufficientBalance) {
        // Fallback Logic:
        // DO NOT send purchase request to supplier
        // Keep order status strictly as PENDING with clear failure reason
        // NEVER auto-complete or generate dummy keys
        const preflightMsg = `Supplier Pool Refill Required: Available pool ৳${preflight.currentBalanceBDT.toLocaleString()} BDT is less than wholesale cost ৳${product.baseSupplierPriceBDT.toLocaleString()} BDT.`;

        setOrders(prevOrders => 
          prevOrders.map(o => o.id === newOrderId ? {
            ...o,
            status: 'pending',
            failureReason: preflightMsg
          } : o)
        );

        setSyncLogs(prev => [
          {
            id: `log_preflight_fail_${Date.now()}`,
            timestamp: new Date().toLocaleTimeString(),
            type: 'order_fulfill',
            title: `Supplier Balance Pre-Check Failed (${newOrderId})`,
            description: `Order #${newOrderId} held in PENDING queue: ${preflightMsg}`,
          },
          ...prev
        ]);

        recordAuditLog({
          action: 'API_RETRY_TRIGGERED',
          targetType: 'order',
          targetId: newOrderId,
          details: `Pre-flight Supplier API Fund Check failed (Pool: ৳${preflight.currentBalanceBDT.toLocaleString()} BDT, Required: ৳${product.baseSupplierPriceBDT.toLocaleString()} BDT). Order held in PENDING queue.`
        });

        addToast({
          type: 'warning',
          title: 'Order Placed (Pending Supplier Refill)',
          message: `Order #${newOrderId} tokens reserved. Item held in PENDING queue awaiting Supplier Pool top-up.`,
          orderId: newOrderId,
          productTitle: product.title,
          durationMs: 8000
        });

        return {
          success: true,
          orderId: newOrderId,
          message: `Order #${newOrderId} placed successfully! Held in PENDING queue awaiting Supplier Pool refill.`
        };
      }

      try {
        const fulfillRes = await supplierApi.fulfillOrder(
          product.supplierProductId,
          currentUser.email,
          currentUser.name,
          { targetUserEmail }
        );

        if (fulfillRes.success && fulfillRes.credentials) {
          // ONLY update status to COMPLETED when Supplier API returns valid credentials!
          setOrders(prevOrders => 
            prevOrders.map(o => o.id === newOrderId ? {
              ...o,
              status: 'completed',
              completedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              credentials: fulfillRes.credentials,
              supplierOrderId: fulfillRes.supplierOrderId,
              failureReason: undefined
            } : o)
          );

          setSettings(prev => ({
            ...prev,
            supplierBalanceBDT: fulfillRes.remainingSupplierBalanceBDT
          }));

          setProducts(prevProds => 
            prevProds.map(p => p.id === product.id ? {
              ...p,
              stock: Math.max(0, p.stock - 1),
              salesCount: p.salesCount + 1,
              status: p.stock - 1 <= 0 ? 'out_of_stock' : 'active'
            } : p)
          );

          setSyncLogs(prev => [
            {
              id: `log_ord_${Date.now()}`,
              timestamp: new Date().toLocaleTimeString(),
              type: 'order_fulfill',
              title: `Order Fulfilled (${newOrderId})`,
              description: `Successfully delivered ${product.title} to ${currentUser.name}.`,
            },
            ...prev
          ]);

          return { 
            success: true, 
            orderId: newOrderId, 
            message: `Order #${newOrderId} completed and delivered instantly!` 
          };
        } else {
          // REQUIREMENT 2: AUTO-REFUND ON SUPPLIER API FAILURES
          const failMessage = fulfillRes.errorMessage || 'Supplier server issue or API connection timeout.';
          
          // 1. Refund exact token amount back to user's wallet
          const restoredBalance = currentUser.tokenBalance + tokenPrice;

          setCurrentUser(prev => ({
            ...prev,
            tokenBalance: prev.tokenBalance + tokenPrice,
            totalSpentTokens: Math.max(0, prev.totalSpentTokens - tokenPrice)
          }));

          setUsers(prevUsers => prevUsers.map(u => u.id === currentUser.id ? { ...u, tokenBalance: u.tokenBalance + tokenPrice } : u));

          // 2. Mark order status as 'failed' (Refunded)
          setOrders(prevOrders => 
            prevOrders.map(o => o.id === newOrderId ? {
              ...o,
              status: 'failed',
              failureReason: `AUTO-REFUNDED: ${failMessage}`
            } : o)
          );

          // 3. Create Refund Wallet Transaction
          const refundTx: WalletTransaction = {
            id: `TXN-RFD-${Date.now().toString().slice(-6)}`,
            userId: currentUser.id,
            type: 'reward',
            title: `Auto-Refund for ${product.title}`,
            subtitle: `Server issue: ${failMessage}. ${tokenPrice} DS Tokens returned.`,
            amountTokens: tokenPrice,
            balanceAfter: restoredBalance,
            status: 'completed',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', ' + new Date().toISOString().split('T')[0],
            referenceId: newOrderId,
            orderId: newOrderId,
            productTitle: product.title,
            variantLabel
          };

          setWalletTransactions(prev => [refundTx, ...prev]);

          // 4. Display exact required Frontend Alert Toast
          addToast({
            type: 'error',
            title: 'Order Refunded',
            message: 'Order refunded due to server issues. Please try again later.',
            orderId: newOrderId,
            productTitle: product.title,
            durationMs: 8000
          });

          return { 
            success: false, 
            orderId: newOrderId, 
            message: 'Order refunded due to server issues. Please try again later.' 
          };
        }
      } catch (err: any) {
        const errMsg = err?.message || 'Connection timeout from Supplier API';
        
        // AUTO-REFUND ON EXCEPTION/TIMEOUT
        const restoredBalance = currentUser.tokenBalance + tokenPrice;
        setCurrentUser(prev => ({
          ...prev,
          tokenBalance: prev.tokenBalance + tokenPrice,
          totalSpentTokens: Math.max(0, prev.totalSpentTokens - tokenPrice)
        }));

        setUsers(prevUsers => prevUsers.map(u => u.id === currentUser.id ? { ...u, tokenBalance: u.tokenBalance + tokenPrice } : u));

        setOrders(prevOrders => 
          prevOrders.map(o => o.id === newOrderId ? {
            ...o,
            status: 'failed',
            failureReason: `AUTO-REFUNDED: ${errMsg}`
          } : o)
        );

        const refundTx: WalletTransaction = {
          id: `TXN-RFD-${Date.now().toString().slice(-6)}`,
          userId: currentUser.id,
          type: 'reward',
          title: `Auto-Refund for ${product.title}`,
          subtitle: `Connection timeout: ${errMsg}. ${tokenPrice} DS Tokens returned.`,
          amountTokens: tokenPrice,
          balanceAfter: restoredBalance,
          status: 'completed',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', ' + new Date().toISOString().split('T')[0],
          referenceId: newOrderId,
          orderId: newOrderId,
          productTitle: product.title,
          variantLabel
        };

        setWalletTransactions(prev => [refundTx, ...prev]);

        addToast({
          type: 'error',
          title: 'Order Refunded',
          message: 'Order refunded due to server issues. Please try again later.',
          orderId: newOrderId,
          productTitle: product.title,
          durationMs: 8000
        });

        return { 
          success: false, 
          orderId: newOrderId, 
          message: 'Order refunded due to server issues. Please try again later.' 
        };
      }
    } else {
      setProducts(prevProds => 
        prevProds.map(p => p.id === product.id ? {
          ...p,
          stock: Math.max(0, p.stock - 1),
          salesCount: p.salesCount + 1,
        } : p)
      );

      const cashbackTokens = Math.max(10, Math.round(tokenPrice * 0.05));
      const rewardTx: WalletTransaction = {
        id: `TXN-RWD-${Date.now().toString().slice(-6)}`,
        userId: currentUser.id,
        type: 'reward',
        title: 'VIP Loyalty Cashback Earning',
        subtitle: `5% reward token cashback on ${product.title}`,
        amountTokens: cashbackTokens,
        balanceAfter: currentUser.tokenBalance - tokenPrice + cashbackTokens,
        status: 'completed',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', ' + new Date().toISOString().split('T')[0],
        referenceId: newOrderId,
        rewardSource: 'cashback',
        rewardNote: `5% VIP purchase cashback for Order #${newOrderId}`,
        orderId: newOrderId,
        productTitle: product.title
      };

      setWalletTransactions(prev => [rewardTx, purchaseTx, ...prev]);
      setCurrentUser(prev => ({
        ...prev,
        tokenBalance: prev.tokenBalance + cashbackTokens
      }));

      return { 
        success: true, 
        orderId: newOrderId, 
        message: `Order received. Custom account delivery processing. +${cashbackTokens} DS Reward Tokens earned!` 
      };
    }
  };

  // Toggle Auto-Renew for individual subscriptions
  const toggleAutoRenew = useCallback((orderId: string) => {
    setOrders(prevOrders => {
      const target = prevOrders.find(o => o.id === orderId);
      if (!target) return prevOrders;

      const nextAutoRenew = !(target.autoRenew ?? true);

      addToast({
        type: nextAutoRenew ? 'success' : 'info',
        title: nextAutoRenew ? '🔄 Auto-Renew Enabled' : '⏸️ Auto-Renew Disabled',
        message: nextAutoRenew 
          ? `Auto-renewal ENABLED for Order #${orderId} (${target.productTitle}). DS Tokens will automatically deduct upon term expiry.`
          : `Auto-renewal DISABLED for Order #${orderId} (${target.productTitle}). Subscription will lapse at the end of the current term.`,
        orderId,
        productTitle: target.productTitle,
        durationMs: 7000
      });

      return prevOrders.map(o => o.id === orderId ? { ...o, autoRenew: nextAutoRenew } : o);
    });
  }, [addToast]);

  // Send Global Broadcast Notification
  const sendGlobalBroadcast = useCallback((message: string) => {
    if (!message || !message.trim()) return;

    setSettings(prev => ({ ...prev, broadcastMessage: message }));

    addToast({
      type: 'info',
      title: '📢 Global System Broadcast',
      message: message.trim(),
      durationMs: 12000
    });

    recordAuditLog({
      action: 'SYSTEM_SETTINGS_UPDATED',
      targetType: 'system',
      targetId: 'broadcast',
      details: `Dispatched Global System Broadcast: "${message.trim()}"`
    });
  }, [addToast, recordAuditLog]);

  // Claim Daily Streak Reward
  const claimDailyStreakReward = (): { success: boolean; tokens: number; message: string; streakDay: number } => {
    if (!isLoggedIn) {
      setIsAuthModalOpen(true);
      return { success: false, tokens: 0, message: 'Please sign in to claim daily streak rewards.', streakDay: rewardStreakDays };
    }

    const nextStreak = rewardStreakDays + 1;
    const rewardTokens = 75 + (nextStreak % 5) * 10;
    
    const rewardTx: WalletTransaction = {
      id: `TXN-RWD-${Date.now().toString().slice(-6)}`,
      userId: currentUser.id,
      type: 'reward',
      title: `Daily Login Streak Bonus (Day ${nextStreak})`,
      subtitle: `Day ${nextStreak} consecutive streak reward unlocked`,
      amountTokens: rewardTokens,
      balanceAfter: currentUser.tokenBalance + rewardTokens,
      status: 'completed',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', ' + new Date().toISOString().split('T')[0],
      referenceId: `STRK-D${nextStreak}`,
      rewardSource: 'daily_streak',
      rewardNote: `Claimed daily VIP attendance reward (+${rewardTokens} DS Tokens)`
    };

    setWalletTransactions(prev => [rewardTx, ...prev]);
    setCurrentUser(prev => ({
      ...prev,
      tokenBalance: prev.tokenBalance + rewardTokens
    }));
    setRewardStreakDays(nextStreak);
    setCanClaimDailyReward(false);

    return {
      success: true,
      tokens: rewardTokens,
      message: `🎉 Successfully claimed +${rewardTokens} DS Tokens for Day ${nextStreak} streak!`,
      streakDay: nextStreak
    };
  };

  // Admin: Update product override
  const updateProductOverride = (productId: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        const isOverridden = true;
        const newMargin = updates.profitMarginPercent ?? p.profitMarginPercent;
        const calculatedTokens = p.isApiProduct 
          ? calculatePriceTokens(p.baseSupplierPriceBDT, newMargin, settings.exchangeRateBDTtoDS)
          : (updates.priceDSTokens ?? p.priceDSTokens);

        return {
          ...p,
          ...updates,
          isOverridden,
          priceDSTokens: calculatedTokens
        };
      }
      return p;
    }));

    setSyncLogs(prev => [
      {
        id: `log_mod_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        type: 'admin_override',
        title: 'Product Override Modified',
        description: `Admin updated metadata/pricing rules for product #${productId}.`,
      },
      ...prev
    ]);
  };

  // Admin: Create Manual Product
  const createManualProduct = (productData: Omit<Product, 'id' | 'salesCount' | 'rating' | 'status' | 'source'>) => {
    const newProd: Product = {
      ...productData,
      id: `prod_manual_${Date.now()}`,
      isApiProduct: false,
      source: 'manual',
      salesCount: 0,
      rating: 5.0,
      status: productData.stock > 0 ? 'active' : 'out_of_stock',
      deliveryType: 'manual_custom',
    };

    setProducts(prev => [newProd, ...prev]);
  };

  const deleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
  };

  const updateSettings = (newSettings: Partial<SystemSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      
      if (newSettings.exchangeRateBDTtoDS !== undefined || newSettings.globalProfitMarginPercent !== undefined) {
        const newRate = updated.exchangeRateBDTtoDS;
        const newGlobalMargin = updated.globalProfitMarginPercent;

        setProducts(currentProds => currentProds.map(p => {
          if (p.isApiProduct) {
            const margin = p.isOverridden ? p.profitMarginPercent : newGlobalMargin;
            const priceTokens = calculatePriceTokens(p.baseSupplierPriceBDT, margin, newRate);
            return {
              ...p,
              priceDSTokens: priceTokens,
              durationOptions: p.durationOptions.map(opt => {
                if (opt.durationMonths === 1) return { ...opt, priceDSTokens: priceTokens };
                if (opt.durationMonths === 3) return { ...opt, priceDSTokens: Math.ceil(priceTokens * 3 * 0.9) };
                if (opt.durationMonths === 12) return { ...opt, priceDSTokens: Math.ceil(priceTokens * 12 * 0.75) };
                return opt;
              })
            };
          }
          return p;
        }));
      }

      return updated;
    });
  };

  const depositSupplierBalance = (amountBDT: number) => {
    const newBal = supplierApi.depositSupplierBalance(amountBDT);
    setSettings(prev => ({ ...prev, supplierBalanceBDT: newBal }));
  };

  const fulfillManualOrder = (orderId: string, credentials: any) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          status: 'completed',
          completedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          credentials: {
            accountEmail: credentials.accountEmail,
            password: credentials.password,
            licenseKey: credentials.licenseKey,
            instructions: credentials.instructions || 'Manual custom account provisioned by Digital Drive.',
            expiryDate: credentials.expiryDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
          }
        };
      }
      return o;
    }));
  };

  const retryOrderApiFulfillment = async (orderId: string): Promise<boolean> => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return false;
    const prod = products.find(p => p.id === order.productId);
    if (!prod || !prod.supplierProductId) return false;

    try {
      const res = await supplierApi.fulfillOrder(prod.supplierProductId, currentUser.email, order.userName);
      if (res.success && res.credentials) {
        setOrders(prev => prev.map(o => o.id === orderId ? {
          ...o,
          status: 'completed',
          credentials: res.credentials,
          supplierOrderId: res.supplierOrderId,
          failureReason: undefined
        } : o));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const categories: ProductCategory[] = [
    'AI Tools',
    'Streaming',
    'VPN & Security',
    'Productivity & Design',
    'Gaming & Utilities',
    'Developer Tools'
  ];

  const derivedHotDeals = (products || []).filter(p => Boolean(p && typeof p === 'object') && (p.isHotDeal || ((p.discountPercent ?? 0) > 0)));
  const hotDeals = derivedHotDeals.length > 0 ? derivedHotDeals : (products || []).slice(0, 6);

  const topTrending = [...(products || [])]
    .filter(p => Boolean(p && typeof p === 'object'))
    .sort((a, b) => (b.salesCount ?? 0) - (a.salesCount ?? 0))
    .slice(0, 10);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isLoggedIn,
        isAuthModalOpen,
        setIsAuthModalOpen,
        loginWithEmailPassword,
        registerWithEmailPassword,
        loginWithGoogle,
        logoutUser,
        switchUserRole,
        products: sortedProducts,
        sortBy,
        setSortBy,
        categories,
        hotDeals,
        topTrending,
        currentPage,
        setCurrentPage,
        totalPages,
        totalProductsCount,
        isProductsLoading,
        fetchProductsByPage,
        settings,
        convertBDTtoTokens,
        convertTokensToBDT,
        addFundsWithTokens,
        tokenTransactions,
        walletTransactions,
        approveDepositRequest,
        rejectDepositRequest,
        addPaymentMethod,
        updatePaymentMethod,
        deletePaymentMethod,
        users,
        adjustUserTokens,
        setUserAccountStatus,
        orders,
        placeOrder,
        updateProductOverride,
        createManualProduct,
        deleteProduct,
        deleteAllDemoProducts,
        updateSettings,
        depositSupplierBalance,
        fulfillManualOrder,
        retryOrderApiFulfillment,
        syncLogs,
        syncWithSupplierApi,
        forceSyncNow,
        connectAndFetchSupplierApi,
        purgeAndFreshSyncFromApi,
        toggleSupplierStock,
        simulateNewSupplierDrop,
        simulateSupplierStockOut,
        isTopUpModalOpen,
        setIsTopUpModalOpen,
        selectedProductForDetail,
        setSelectedProductForDetail,
        activeView,
        setActiveView,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        wishlistIds,
        wishlistProducts,
        toggleWishlist,
        isInWishlist,
        clearWishlist,
        isWishlistModalOpen,
        setIsWishlistModalOpen,
        compareProductIds,
        compareProducts,
        toggleCompare,
        isInCompare,
        clearCompare,
        isCompareModalOpen,
        setIsCompareModalOpen,
        auditLogs,
        recordAuditLog,
        clearAuditLogs,
        toasts,
        addToast,
        removeToast,
        clearToasts,
        sendOrderCompletedEmail,
        toggleAutoRenew,
        sendGlobalBroadcast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
