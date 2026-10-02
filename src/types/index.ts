export interface DurationOption {
  label: string;
  durationMonths: number;
  priceDSTokens: number;
  discountTag?: string;
}

export type ProductCategory = 
  | 'AI Tools'
  | 'Streaming'
  | 'VPN & Security'
  | 'Productivity & Design'
  | 'Gaming & Utilities'
  | 'Developer Tools';

export type ProductSource = 'api' | 'manual' | 'demo';

export type DeliveryMechanism = 'premade_credentials' | 'personal_upgrade';

export interface Product {
  id: string;
  supplierProductId?: string;
  isApiProduct: boolean;
  source: ProductSource; // 'api' | 'manual' | 'demo'
  title: string;
  originalSupplierTitle?: string;
  category: ProductCategory;
  description: string;
  warranty?: string | null; // Direct from supplier. Hidden completely if null/empty
  coverImage: string;
  customCoverUrl?: string; // Admin local file upload override
  brandColor: string;
  iconName: string;
  stock: number;
  baseSupplierPriceBDT: number; // in Taka
  profitMarginPercent: number; // e.g., 35%
  priceDSTokens: number; // Calculated or manual
  durationOptions: DurationOption[];
  isHotDeal?: boolean;
  discountPercent?: number;
  showDiscountBadge?: boolean; // Admin individual product discount badge control
  customDiscountLabel?: string; // Optional custom badge text e.g. "Save 30%" or "SPECIAL DROP"
  salesCount: number;
  rating: number;
  deliveryType: 'instant_api' | 'manual_custom';
  deliveryMechanism?: DeliveryMechanism; // 'premade_credentials' (auto-delivered) | 'personal_upgrade' (requires user email)
  requiresUserEmail?: boolean; // When true, pops up modal asking for user's personal email/ID
  upgradePromptLabel?: string; // e.g., "Enter your email for the upgrade"
  upgradeInputPlaceholder?: string; // e.g., "user@gmail.com"
  credentialFormat: 'email_password' | 'license_key' | 'invite_link' | 'session_cookie';
  isOverridden?: boolean;
  status: 'active' | 'out_of_stock' | 'disabled';
}

export interface OrderCredential {
  accountEmail?: string;
  password?: string;
  licenseKey?: string;
  sessionCookie?: string;
  profilePin?: string;
  inviteLink?: string;
  expiryDate: string;
  instructions: string;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  productId: string;
  productTitle: string;
  category: ProductCategory;
  variantSelected: string;
  priceTokens: number;
  priceBDT: number;
  status: 'completed' | 'processing' | 'pending' | 'failed';
  createdAt: string;
  completedAt?: string;
  credentials?: OrderCredential;
  supplierOrderId?: string;
  deliveryType: 'instant_api' | 'manual_custom';
  deliveryMechanism?: DeliveryMechanism;
  targetUserEmail?: string; // Personal email provided by user for account upgrade orders
  failureReason?: string;
  autoRenew?: boolean; // Toggle for auto-deducting DS Tokens upon subscription term expiry
  autoRenewStatus?: 'active' | 'renewed' | 'failed_insufficient_tokens';
}

export interface PaymentMethodConfig {
  id: string;
  name: string; // e.g., 'bKash Personal', 'Nagad Personal', 'Binance USDT (TRC-20)', 'Bank Transfer'
  type: 'bkash' | 'nagad' | 'rocket' | 'binance' | 'bank' | 'other';
  accountType: string; // e.g., 'Personal (Send Money)', 'Merchant (Payment)', 'USDT (TRC-20 / BEP-20)', 'City Bank Savings'
  accountNumber: string; // e.g., '01712-345678' or 'TXyz1234567890...'
  logoUrl?: string; // Custom uploaded or preset logo
  brandColor: string;
  isActive: boolean;
  instructions: string; // Custom verification instruction message
  minAmountBDT: number;
}

export interface TokenTransaction {
  id: string;
  userId: string;
  amountBDT: number;
  amountTokens: number;
  exchangeRate: number; // 1 BDT = X Tokens
  paymentMethod: string;
  paymentMethodId?: string;
  senderNumber?: string;
  transactionNumber: string;
  status: 'completed' | 'pending' | 'failed';
  timestamp: string;
  screenshotVerified?: boolean;
}

export type TransactionType = 'deposit' | 'purchase' | 'reward';
export type RewardSource = 'cashback' | 'daily_streak' | 'referral' | 'promotional';

export interface WalletTransaction {
  id: string;
  userId: string;
  type: TransactionType;
  title: string;
  subtitle?: string;
  amountTokens: number; // positive for deposit & reward, negative for purchase
  amountBDT?: number;
  balanceAfter?: number;
  status: 'completed' | 'pending' | 'failed';
  timestamp: string;
  referenceId?: string; // TrxID, Order ID, or Voucher Code
  paymentMethod?: string;
  senderNumber?: string;
  rewardSource?: RewardSource;
  rewardNote?: string;
  orderId?: string;
  productTitle?: string;
  variantLabel?: string;
}

export interface SupplierEndpointConfig {
  id: string;
  name: string;
  baseUrl: string;
  apiKey: string;
  secretKey?: string;
  integrationType: 'rest_api' | 'telegram_bot' | 'graphql';
  isPrimary?: boolean;
  status: 'active' | 'inactive';
}

export interface SystemSettings {
  websiteName: string; // Dynamic website title updated across header, footer, page titles
  websiteTagline: string;
  seoMetaDescription: string; // Dynamically synced with <meta name="description">
  supportWhatsApp: string; // Social Media & Verification
  supportTelegram: string; // Social Media & Support Channel
  supportEmail: string;
  sliderAutoScrollSpeedSec: number; // Configurable speed for Hot Deals and Top 10 sliders
  hotDealsAutoScroll: boolean;
  topTrendingAutoScroll: boolean;
  topTrendingAutoScrollSpeedSec?: number;
  exchangeRateBDTtoDS: number; // Default: 1 BDT = 1 DS Token (editable by admin)
  globalProfitMarginPercent: number; // Default: 35%
  supplierBalanceBDT: number; // In Taka from Supplier API
  supplierApiStatus: 'connected' | 'degraded' | 'syncing' | 'disconnected';
  apiIntegrationType: 'telegram_bot' | 'rest_api';
  supplierApiKey: string;
  supplierSecretKey?: string;
  supplierWebsiteUrl: string;
  supplierApiUrl?: string;
  supplierEndpoints?: SupplierEndpointConfig[];
  telegramBotToken: string;
  telegramChatId: string;
  isApiConfigured: boolean;
  customLogoUrl?: string; // Admin uploaded main website logo
  customFooterLogoUrl?: string; // Optional distinct footer logo
  paymentMethods: PaymentMethodConfig[]; // Configurable manual payment gateways
  autoSyncEnabled: boolean;
  autoSyncIntervalSec: number;
  apiCacheTtlSec?: number; // Time-to-live for product data caching to prevent excessive supplier API calls
  lastSyncTimestamp: string;
  
  // Email Notification Settings
  emailAlertsEnabled?: boolean;
  emailAlertOrderCompleted?: boolean;
  emailAlertExpirationWarning?: boolean;
  emailAlertExpirationDaysBefore?: number;
  emailSenderName?: string;
  emailReplyTo?: string;

  // Requirement 4: Global Marketing Announcement Pop-up Config
  popupEnabled?: boolean;
  popupBannerUrl?: string;
  popupTitle?: string;
  popupDescription?: string;
  popupBtnText?: string;
  popupBtnUrl?: string;
  broadcastMessage?: string;
}

export type ProductSortOption = 'featured' | 'price_low_high' | 'price_high_low' | 'popularity' | 'discount';

export type GlobalSettings = SystemSettings;

export interface SyncLog {
  id: string;
  timestamp: string;
  type: 'auto_add' | 'price_sync' | 'stock_sync' | 'order_fulfill' | 'admin_override';
  title: string;
  description: string;
  metadata?: Record<string, any>;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  adminId: string;
  adminName: string;
  adminEmail: string;
  action: 
    | 'MANUAL_ORDER_FULFILLMENT' 
    | 'ORDER_STATUS_UPDATE' 
    | 'API_RETRY_TRIGGERED' 
    | 'USER_BALANCE_ADJUSTED' 
    | 'USER_STATUS_CHANGED' 
    | 'GATEWAY_CONFIG_MODIFIED' 
    | 'PRODUCT_SETTINGS_MODIFIED' 
    | 'SYSTEM_SETTINGS_UPDATED';
  targetType: 'order' | 'user' | 'product' | 'gateway' | 'system';
  targetId: string;
  details: string;
  previousState?: string;
  newState?: string;
}

export interface ToastNotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'order_completed' | 'order_pending' | 'success' | 'info' | 'warning' | 'error';
  timestamp: string;
  orderId?: string;
  productTitle?: string;
  actionLabel?: string;
  durationMs?: number;
}

export interface AutoTopupConfig {
  enabled: boolean;
  thresholdTokens: number;
  topupAmountTokens: number;
  paymentMethodId: string;
  paymentMethodName: string;
  senderNumberOrAccount: string;
  lastAutoTopupAt?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar: string;
  role: 'customer' | 'admin';
  status?: 'active' | 'suspended' | 'banned';
  tokenBalance: number;
  totalSpentTokens: number;
  joinedDate: string;
  autoTopup?: AutoTopupConfig;
}

export interface LiveSalesEvent {
  id: string;
  telegramName: string;
  customerName?: string;
  productName: string;
  action: 'Purchased' | 'Topped Up';
  amountDSTokens: number;
  timestamp: string;
  timeAgo: string;
  avatarSeed?: string;
}

export interface LiveSalesApiResponse {
  success: boolean;
  count: number;
  events: LiveSalesEvent[];
  cachedAt: string;
  isCached: boolean;
  supplierPollIntervalSec: number;
  dayIdentifier: string;
  next24hResetEta: string;
}
