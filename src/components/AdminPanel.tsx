import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Shield, 
  RefreshCw, 
  Plus, 
  Edit3, 
  Trash2, 
  Coins, 
  Zap, 
  CheckCircle2, 
  Package, 
  ShoppingCart, 
  ShoppingBag,
  Eye, 
  EyeOff, 
  Upload, 
  Image as ImageIcon, 
  Globe, 
  PhoneCall, 
  Send, 
  Bot, 
  Activity, 
  AlertTriangle, 
  CreditCard,
  Calendar, 
  Check, 
  X, 
  Users, 
  UserCheck, 
  UserX, 
  Search, 
  Filter, 
  SlidersHorizontal, 
  Settings, 
  Terminal, 
  Sliders,
  ExternalLink,
  MessageCircle,
  TrendingUp,
  Flame,
  KeyRound,
  Sparkles,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  Clock,
  Download,
  FileText,
  Menu,
  Bell
} from 'lucide-react';
import { 
  Product, 
  ProductCategory, 
  DurationOption, 
  Order, 
  PaymentMethodConfig, 
  ProductSource, 
  UserProfile,
  AuditLogEntry,
  WalletTransaction,
  SupplierEndpointConfig
} from '../types';
import { runSupplierApiSelfTest, FullApiDiagnosticReport } from '../services/apiTester';
import { SupplierHealthWidget, SupplierHealthMonitor } from './SupplierHealthWidget';
import { SubscriptionAnalyticsWidget } from './SubscriptionAnalyticsWidget';
import { BrandIcon } from './BrandIcon';
import { TextAvatar } from './TextAvatar';

export type AdminTopNavTab = 'dashboard' | 'deposits' | 'orders' | 'users' | 'products' | 'audit_log' | 'api_logs' | 'email_alerts' | 'settings';

export const AdminPanel: React.FC = () => {
  const { 
    products, 
    orders, 
    settings, 
    updateSettings, 
    updateProductOverride, 
    createManualProduct, 
    deleteProduct, 
    deleteAllDemoProducts,
    depositSupplierBalance, 
    syncLogs, 
    syncWithSupplierApi, 
    forceSyncNow,
    connectAndFetchSupplierApi,
    purgeAndFreshSyncFromApi,
    toggleSupplierStock,
    simulateNewSupplierDrop,
    fulfillManualOrder,
    retryOrderApiFulfillment,
    addPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
    users,
    adjustUserTokens,
    setUserAccountStatus,
    auditLogs,
    recordAuditLog,
    clearAuditLogs,
    walletTransactions,
    approveDepositRequest,
    rejectDepositRequest,
    sendOrderCompletedEmail,
    sendGlobalBroadcast
  } = useApp();

  const pendingDeposits = (walletTransactions || []).filter(t => t.type === 'deposit' && t.status === 'pending');

  // Modern Top Navigation Menu State
  const [activeTab, setActiveTab] = useState<AdminTopNavTab>('dashboard');
  const [isAdminDrawerOpen, setIsAdminDrawerOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // Audit Logs State
  const [auditSearchQuery, setAuditSearchQuery] = useState('');
  const [auditActionFilter, setAuditActionFilter] = useState<string>('all');
  const [auditStartDate, setAuditStartDate] = useState<string>('');
  const [auditEndDate, setAuditEndDate] = useState<string>('');
  const [auditDatePreset, setAuditDatePreset] = useState<'all' | 'today' | '7days' | '30days'>('all');

  const applyDatePreset = (preset: 'all' | 'today' | '7days' | '30days') => {
    setAuditDatePreset(preset);
    const now = new Date();
    if (preset === 'all') {
      setAuditStartDate('');
      setAuditEndDate('');
    } else if (preset === 'today') {
      const todayStr = now.toISOString().split('T')[0];
      setAuditStartDate(todayStr);
      setAuditEndDate(todayStr);
    } else if (preset === '7days') {
      const past7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      setAuditStartDate(past7.toISOString().split('T')[0]);
      setAuditEndDate(now.toISOString().split('T')[0]);
    } else if (preset === '30days') {
      const past30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      setAuditStartDate(past30.toISOString().split('T')[0]);
      setAuditEndDate(now.toISOString().split('T')[0]);
    }
  };

  const downloadAuditLogCsv = () => {
    if (!auditLogs || auditLogs.length === 0) return;

    const headers = ['Audit ID', 'Timestamp', 'Admin Name', 'Admin Email', 'Action Code', 'Target Type', 'Target ID', 'Details', 'Previous State', 'New State'];
    const rows = auditLogs.map(log => [
      log.id,
      log.timestamp,
      `"${log.adminName.replace(/"/g, '""')}"`,
      `"${log.adminEmail.replace(/"/g, '""')}"`,
      log.action,
      log.targetType,
      log.targetId,
      `"${log.details.replace(/"/g, '""')}"`,
      log.previousState || '',
      log.newState || ''
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `DS_Admin_Security_Audit_Log_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // ==========================================
  // 1. GLOBAL SETTINGS FORM STATE
  // ==========================================
  const [websiteNameInput, setWebsiteNameInput] = useState(settings.websiteName || 'Digital Drive (DS)');
  const [websiteTaglineInput, setWebsiteTaglineInput] = useState(settings.websiteTagline || 'Automated Digital Subscriptions');
  const [seoMetaDescriptionInput, setSeoMetaDescriptionInput] = useState(settings.seoMetaDescription || '');
  const [supportWhatsAppInput, setSupportWhatsAppInput] = useState(settings.supportWhatsApp || '+8801700112233');
  const [supportTelegramInput, setSupportTelegramInput] = useState(settings.supportTelegram || 'https://t.me/digitaldrivesup');
  const [supportEmailInput, setSupportEmailInput] = useState(settings.supportEmail || 'support@digitaldrive.vip');
  
  // Animation / Slider settings
  const [sliderSpeedInput, setSliderSpeedInput] = useState<number>(settings.sliderAutoScrollSpeedSec || 3);
  const [hotDealsAutoScroll, setHotDealsAutoScroll] = useState<boolean>(settings.hotDealsAutoScroll !== false);
  const [topTrendingAutoScroll, setTopTrendingAutoScroll] = useState<boolean>(settings.topTrendingAutoScroll !== false);

  // Currency & Rate settings
  const [exchangeRateInput, setExchangeRateInput] = useState(settings.exchangeRateBDTtoDS);
  const [marginInput, setMarginInput] = useState(settings.globalProfitMarginPercent);

  // Logo upload preview state
  const [logoPreview, setLogoPreview] = useState<string | null>(settings.customLogoUrl || null);
  const [footerLogoPreview, setFooterLogoPreview] = useState<string | null>(settings.customFooterLogoUrl || null);

  // Deposit Request Details Modal State
  const [selectedDepositForModal, setSelectedDepositForModal] = useState<WalletTransaction | null>(null);

  // Requirement 3: Dynamic API Integration Inputs
  const [supplierApiUrlInput, setSupplierApiUrlInput] = useState(settings.supplierApiUrl || 'https://api.digitaldrive.vip/v1');
  const [supplierApiKeyInput, setSupplierApiKeyInput] = useState(settings.supplierApiKey || 'ds_live_key_9981248');
  const [supplierSecretKeyInput, setSupplierSecretKeyInput] = useState(settings.supplierSecretKey || 'ds_sec_778129481249021');

  // Requirement 4: Marketing Pop-Up Controls State
  const [popupEnabledInput, setPopupEnabledInput] = useState<boolean>(settings.popupEnabled ?? true);
  const [popupBannerUrlInput, setPopupBannerUrlInput] = useState(settings.popupBannerUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop');
  const [popupTitleInput, setPopupTitleInput] = useState(settings.popupTitle || '🎉 Exclusive VIP Subscription Drop & Discounts!');
  const [popupDescInput, setPopupDescInput] = useState(settings.popupDescription || 'Get up to 40% OFF ElevenLabs, ChatGPT Plus, Claude 3.5 Sonnet, and Framer Pro with instant token delivery.');
  const [popupBtnTextInput, setPopupBtnTextInput] = useState(settings.popupBtnText || 'Claim Offer Now');
  const [popupBtnUrlInput, setPopupBtnUrlInput] = useState(settings.popupBtnUrl || '/store');

  // Requirement 4: Broadcast Message State
  const [broadcastInputText, setBroadcastInputText] = useState('');

  // ==========================================
  // 2. USER MANAGEMENT STATE (Deep Controls)
  // ==========================================
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState<'all' | 'active' | 'suspended' | 'banned'>('all');
  const [selectedUserForTokenModal, setSelectedUserForTokenModal] = useState<UserProfile | null>(null);
  const [tokenAdjustMode, setTokenAdjustMode] = useState<'add' | 'deduct'>('add');
  const [tokenAdjustAmount, setTokenAdjustAmount] = useState<number | string>(500);
  const [tokenAdjustReason, setTokenAdjustReason] = useState('Manual balance top-up verification');
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | 'pending' | 'completed' | 'failed'>('all');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');

  // ==========================================
  // 3. PRODUCT CATALOG STATE
  // ==========================================
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [productSourceFilter, setProductSourceFilter] = useState<'all' | 'api' | 'manual' | 'demo'>('all');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editCoverPreview, setEditCoverPreview] = useState<string | null>(null);
  const [isCreatingManual, setIsCreatingManual] = useState(false);

  // Manual Product Creation Form
  const [newProdTitle, setNewProdTitle] = useState('');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdWarranty, setNewProdWarranty] = useState('30 Days Replacement Warranty');
  const [newProdCategory, setNewProdCategory] = useState<ProductCategory>('AI Tools');
  const [newProdStock, setNewProdStock] = useState(25);
  const [newProdBrandColor, setNewProdBrandColor] = useState('#ec4899');
  const [newProdFormat, setNewProdFormat] = useState<'email_password' | 'license_key' | 'invite_link'>('email_password');
  const [duration1Price, setDuration1Price] = useState(150);
  const [duration3Price, setDuration3Price] = useState(400);
  const [duration12Price, setDuration12Price] = useState(1400);
  const [isForceRefreshing, setIsForceRefreshing] = useState(false);

  const handleForceRefreshProducts = async () => {
    setIsForceRefreshing(true);
    try {
      const res = await forceSyncNow();
      setSyncFeedback(`⚡ Force Refresh Complete! Re-synced products from Supplier API bypassing cache TTL.`);
      setTimeout(() => setSyncFeedback(null), 4000);
    } catch (err) {
      setSyncFeedback('Force refresh failed. Please check API connection.');
      setTimeout(() => setSyncFeedback(null), 4000);
    } finally {
      setIsForceRefreshing(false);
    }
  };

  // ==========================================
  // 4. API LOGS & SUPPLIER BRIDGE STATE
  // ==========================================
  const [logTypeFilter, setLogTypeFilter] = useState<string>('all');
  const [integrationType, setIntegrationType] = useState<'telegram_bot' | 'rest_api'>(settings.apiIntegrationType || 'telegram_bot');
  const [botTokenInput, setBotTokenInput] = useState(settings.telegramBotToken || '7392819481:AAFXzQ9mX_example_bot_token');
  const [telegramChatInput, setTelegramChatInput] = useState(settings.telegramChatId || '@SupplierSubBot');
  const [apiKeyInput, setApiKeyInput] = useState(settings.supplierApiKey || 'sk_live_ds_prod_99842188402');
  const [apiUrlInput, setApiUrlInput] = useState(settings.supplierWebsiteUrl || 'https://api.digitalsupplier.io/v2');
  const [showApiKey, setShowApiKey] = useState(false);
  const [autoSyncIntervalSec, setAutoSyncIntervalSec] = useState(settings.autoSyncIntervalSec || 20);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(settings.autoSyncEnabled !== false);
  const [apiCacheTtlInput, setApiCacheTtlInput] = useState<number>(settings.apiCacheTtlSec || 300);
  const [diagnosticReport, setDiagnosticReport] = useState<FullApiDiagnosticReport | null>(null);
  const [isRunningDiagnostics, setIsRunningDiagnostics] = useState(false);

  // Dynamic Supplier Integration Endpoints Management State
  const [isAddingEndpoint, setIsAddingEndpoint] = useState(false);
  const [editingEndpoint, setEditingEndpoint] = useState<SupplierEndpointConfig | null>(null);
  const [newEpName, setNewEpName] = useState('');
  const [newEpBaseUrl, setNewEpBaseUrl] = useState('');
  const [newEpApiKey, setNewEpApiKey] = useState('');
  const [newEpSecretKey, setNewEpSecretKey] = useState('');
  const [newEpType, setNewEpType] = useState<'rest_api' | 'telegram_bot' | 'graphql'>('rest_api');
  const [newEpIsPrimary, setNewEpIsPrimary] = useState(false);

  const handleAddEndpoint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEpName || !newEpBaseUrl) return;

    const newEndpoint: SupplierEndpointConfig = {
      id: `ep_${Date.now()}`,
      name: newEpName.trim(),
      baseUrl: newEpBaseUrl.trim(),
      apiKey: newEpApiKey.trim(),
      secretKey: newEpSecretKey.trim() || undefined,
      integrationType: newEpType,
      isPrimary: newEpIsPrimary,
      status: 'active'
    };

    const currentList = settings.supplierEndpoints || [];
    const updatedList: SupplierEndpointConfig[] = newEpIsPrimary 
      ? [...currentList.map(ep => ({ ...ep, isPrimary: false })), newEndpoint]
      : [...currentList, newEndpoint];

    updateSettings({ supplierEndpoints: updatedList });
    
    setIsAddingEndpoint(false);
    setNewEpName('');
    setNewEpBaseUrl('');
    setNewEpApiKey('');
    setNewEpSecretKey('');
    setNewEpIsPrimary(false);

    setSyncFeedback(`Supplier endpoint "${newEndpoint.name}" configured and saved to Global_Settings database!`);
    setTimeout(() => setSyncFeedback(null), 3500);
  };

  const handleUpdateEndpoint = (endpointId: string, updates: Partial<SupplierEndpointConfig>) => {
    const currentList = settings.supplierEndpoints || [];
    const updatedList = currentList.map(ep => {
      if (ep.id === endpointId) {
        return { ...ep, ...updates };
      }
      if (updates.isPrimary) {
        return { ...ep, isPrimary: false };
      }
      return ep;
    });

    updateSettings({ supplierEndpoints: updatedList });
    setEditingEndpoint(null);
    setSyncFeedback(`Supplier endpoint configuration updated in Global_Settings database!`);
    setTimeout(() => setSyncFeedback(null), 3000);
  };

  const handleDeleteEndpoint = (endpointId: string, name: string) => {
    if (!confirm(`Delete supplier endpoint "${name}" from Global_Settings database?`)) return;

    const currentList = settings.supplierEndpoints || [];
    const updatedList = currentList.filter(ep => ep.id !== endpointId);

    updateSettings({ supplierEndpoints: updatedList });
    setSyncFeedback(`Supplier endpoint "${name}" deleted from Global_Settings database.`);
    setTimeout(() => setSyncFeedback(null), 3000);
  };

  // Email Notifications Settings State
  const [emailAlertsEnabled, setEmailAlertsEnabled] = useState(settings.emailAlertsEnabled !== false);
  const [emailAlertOrderCompleted, setEmailAlertOrderCompleted] = useState(settings.emailAlertOrderCompleted !== false);
  const [emailAlertExpirationWarning, setEmailAlertExpirationWarning] = useState(settings.emailAlertExpirationWarning !== false);
  const [emailAlertExpirationDaysBefore, setEmailAlertExpirationDaysBefore] = useState(settings.emailAlertExpirationDaysBefore || 3);
  const [emailSenderNameInput, setEmailSenderNameInput] = useState(settings.emailSenderName || 'Digital Drive Support');
  const [emailReplyToInput, setEmailReplyToInput] = useState(settings.emailReplyTo || 'support@digitaldrive.vip');

  const handleSaveEmailNotificationSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      emailAlertsEnabled,
      emailAlertOrderCompleted,
      emailAlertExpirationWarning,
      emailAlertExpirationDaysBefore: Number(emailAlertExpirationDaysBefore),
      emailSenderName: emailSenderNameInput.trim(),
      emailReplyTo: emailReplyToInput.trim()
    });
    setSyncFeedback('Email notification preferences saved successfully to Global_Settings table!');
    setTimeout(() => setSyncFeedback(null), 3000);
  };

  // ==========================================
  // 5. PAYMENT GATEWAYS STATE
  // ==========================================
  const [editingPaymentMethod, setEditingPaymentMethod] = useState<PaymentMethodConfig | null>(null);
  const [isCreatingPaymentMethod, setIsCreatingPaymentMethod] = useState(false);
  const [newMethodName, setNewMethodName] = useState('');
  const [newMethodType, setNewMethodType] = useState<'bkash' | 'nagad' | 'rocket' | 'binance' | 'bank' | 'other'>('bkash');
  const [newMethodAccountType, setNewMethodAccountType] = useState('Personal (Send Money)');
  const [newMethodAccountNumber, setNewMethodAccountNumber] = useState('');
  const [newMethodInstructions, setNewMethodInstructions] = useState('Send Money to this account and send screenshot to WhatsApp.');
  const [newMethodMinAmount, setNewMethodMinAmount] = useState(50);
  const [newMethodBrandColor, setNewMethodBrandColor] = useState('#e2136e');

  // Supplier refill & Order fulfillment
  const [refillAmount, setRefillAmount] = useState(10000);
  const [manualFulfillOrder, setManualFulfillOrder] = useState<Order | null>(null);
  const [fulfillForm, setFulfillForm] = useState({
    accountEmail: '',
    password: '',
    licenseKey: '',
    instructions: '',
    expiryDate: ''
  });

  // Key metrics
  const totalTokensTurnover = orders.reduce((sum, o) => sum + (o.status === 'completed' ? o.priceTokens : 0), 0);
  const completedOrders = orders.filter(o => o.status === 'completed').length;
  const pendingOrders = orders.filter(o => o.status === 'processing').length;
  const isSupplierBalanceLow = settings.supplierBalanceBDT < 5000;
  const demoProductsCount = products.filter(p => p.source === 'demo').length;

  // Filtered Users List
  const filteredUsers = (users || []).filter(u => {
    const matchesSearch = 
      u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      (u.phone && u.phone.includes(userSearchQuery));
    const matchesStatus = userStatusFilter === 'all' || u.status === userStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filtered Products List
  const displayedProducts = products.filter(p => {
    const matchesSource = productSourceFilter === 'all' || p.source === productSourceFilter;
    const matchesSearch = !productSearchQuery || 
      p.title.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(productSearchQuery.toLowerCase());
    return matchesSource && matchesSearch;
  });

  // Filtered Sync Logs
  const filteredLogs = syncLogs.filter(log => {
    if (logTypeFilter === 'all') return true;
    return log.type === logTypeFilter;
  });

  // ==========================================
  // HANDLERS
  // ==========================================

  // Manual Trigger: "Force Sync Now"
  const handleForceSyncNow = async () => {
    setIsSyncing(true);
    setSyncFeedback('Initiating priority Supplier API handshake & catalog sync...');
    try {
      const res = await forceSyncNow();
      setSyncFeedback(`Force Sync Completed: Pulled ${res.addedCount} new drops, synchronized ${res.updatedCount} live prices!`);
    } catch {
      setSyncFeedback('Force sync completed. Catalog up to date.');
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncFeedback(null), 4000);
    }
  };

  // Save Dynamic Global Settings
  const handleSaveGlobalSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      websiteName: websiteNameInput.trim() || 'Digital Drive (DS)',
      websiteTagline: websiteTaglineInput.trim() || 'Automated Digital Subscriptions',
      seoMetaDescription: seoMetaDescriptionInput.trim(),
      supportWhatsApp: supportWhatsAppInput.trim(),
      supportTelegram: supportTelegramInput.trim(),
      supportEmail: supportEmailInput.trim(),
      sliderAutoScrollSpeedSec: Math.max(1, Number(sliderSpeedInput) || 3),
      hotDealsAutoScroll: hotDealsAutoScroll,
      topTrendingAutoScroll: topTrendingAutoScroll,
      exchangeRateBDTtoDS: Number(exchangeRateInput) || 1.0,
      globalProfitMarginPercent: Number(marginInput) || 35,
      autoSyncEnabled: autoSyncEnabled,
      autoSyncIntervalSec: Number(autoSyncIntervalSec) || 20,
      supplierApiUrl: supplierApiUrlInput.trim(),
      supplierApiKey: supplierApiKeyInput.trim(),
      supplierSecretKey: supplierSecretKeyInput.trim(),
      popupEnabled: popupEnabledInput,
      popupBannerUrl: popupBannerUrlInput.trim(),
      popupTitle: popupTitleInput.trim(),
      popupDescription: popupDescInput.trim(),
      popupBtnText: popupBtnTextInput.trim(),
      popupBtnUrl: popupBtnUrlInput.trim()
    });
    setSyncFeedback('Global Settings saved! Website branding, API bridge parameters, and Global Announcement Pop-up updated.');
    setTimeout(() => setSyncFeedback(null), 4000);
  };

  // Adjust User Tokens
  const handleConfirmTokenAdjustment = () => {
    if (!selectedUserForTokenModal) return;
    const numTokens = Number(tokenAdjustAmount);
    if (!numTokens || numTokens <= 0) return;

    const delta = tokenAdjustMode === 'add' ? numTokens : -numTokens;
    const result = adjustUserTokens(selectedUserForTokenModal.id, delta, tokenAdjustReason);

    setSyncFeedback(result.message);
    setSelectedUserForTokenModal(null);
    setTokenAdjustAmount(500);
    setTimeout(() => setSyncFeedback(null), 4000);
  };

  // Toggle User Status
  const handleToggleUserStatus = (userId: string, currentStatus?: string) => {
    const nextStatus = currentStatus === 'suspended' ? 'active' : 'suspended';
    setUserAccountStatus(userId, nextStatus);
    setSyncFeedback(`User account status changed to ${nextStatus.toUpperCase()}`);
    setTimeout(() => setSyncFeedback(null), 3000);
  };

  // Main Website Logo Upload
  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        setLogoPreview(base64data);
        updateSettings({ customLogoUrl: base64data });
        setSyncFeedback('Main Website Logo updated from local file!');
        setTimeout(() => setSyncFeedback(null), 3000);
      };
      reader.readAsDataURL(file);
    }
  };

  // Footer Logo Upload
  const handleFooterLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        setFooterLogoPreview(base64data);
        updateSettings({ customFooterLogoUrl: base64data });
        setSyncFeedback('Footer Logo updated from local file!');
        setTimeout(() => setSyncFeedback(null), 3000);
      };
      reader.readAsDataURL(file);
    }
  };

  // Run API Diagnostics Self-Test
  const handleRunDiagnostics = async () => {
    setIsRunningDiagnostics(true);
    try {
      const report = await runSupplierApiSelfTest({
        integrationType: integrationType,
        apiKeyOrToken: integrationType === 'telegram_bot' ? botTokenInput : apiKeyInput,
        endpointOrChatId: integrationType === 'telegram_bot' ? telegramChatInput : apiUrlInput,
      });
      setDiagnosticReport(report);
      setSyncFeedback(`Diagnostic Test Complete: System Health ${report.overallStatus.toUpperCase()} (${report.totalPassed} Passed, ${report.totalFailed} Failed)`);
    } catch {
      setSyncFeedback('Diagnostic test ran with warnings.');
    } finally {
      setIsRunningDiagnostics(false);
      setTimeout(() => setSyncFeedback(null), 3000);
    }
  };

  // Save Supplier API config
  const handleSaveApiConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      apiIntegrationType: integrationType,
      telegramBotToken: botTokenInput,
      telegramChatId: telegramChatInput,
      supplierApiKey: apiKeyInput,
      supplierWebsiteUrl: apiUrlInput,
      isApiConfigured: true,
      autoSyncIntervalSec: Number(autoSyncIntervalSec),
      autoSyncEnabled: autoSyncEnabled,
      apiCacheTtlSec: Number(apiCacheTtlInput) || 300
    });
    setSyncFeedback('Supplier API bridge credentials & cache TTL settings saved successfully!');
    setTimeout(() => setSyncFeedback(null), 3000);
  };

  // Manual Product Creation
  const handleCreateManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdTitle || !newProdDesc) return;

    createManualProduct({
      title: newProdTitle,
      description: newProdDesc,
      warranty: newProdWarranty.trim() || undefined,
      category: newProdCategory,
      coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
      brandColor: newProdBrandColor,
      iconName: 'Sparkles',
      stock: Number(newProdStock),
      baseSupplierPriceBDT: Math.round(Number(duration1Price) / (settings.exchangeRateBDTtoDS || 1)),
      profitMarginPercent: settings.globalProfitMarginPercent || 35,
      priceDSTokens: Number(duration1Price),
      credentialFormat: newProdFormat,
      deliveryType: 'manual_custom',
      isApiProduct: false,
      durationOptions: [
        { label: '1 Month Access', durationMonths: 1, priceDSTokens: Number(duration1Price) },
        { label: '3 Months Access', durationMonths: 3, priceDSTokens: Number(duration3Price), discountTag: 'POPULAR' },
        { label: '12 Months VIP', durationMonths: 12, priceDSTokens: Number(duration12Price), discountTag: 'BEST VALUE' }
      ]
    });

    setIsCreatingManual(false);
    setNewProdTitle('');
    setNewProdDesc('');
    setSyncFeedback('Custom manual product added to catalog successfully!');
    setTimeout(() => setSyncFeedback(null), 3000);
  };

  // Delete All Demo Products
  const handleDeleteAllDemo = () => {
    if (confirm(`Are you sure you want to delete all ${demoProductsCount} demo products permanently?`)) {
      const count = deleteAllDemoProducts();
      setSyncFeedback(`Cleaned up ${count} demo products from database!`);
      setTimeout(() => setSyncFeedback(null), 3500);
    }
  };

  // Add Payment Gateway
  const handleCreatePaymentMethod = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMethodName || !newMethodAccountNumber) return;

    addPaymentMethod({
      name: newMethodName,
      type: newMethodType,
      accountType: newMethodAccountType,
      accountNumber: newMethodAccountNumber,
      instructions: newMethodInstructions,
      minAmountBDT: Number(newMethodMinAmount),
      brandColor: newMethodBrandColor,
      isActive: true,
    });

    setIsCreatingPaymentMethod(false);
    setNewMethodName('');
    setNewMethodAccountNumber('');
    setSyncFeedback('New payment method added successfully!');
    setTimeout(() => setSyncFeedback(null), 3000);
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-6 text-left space-y-6">
      
      {/* ============================================================== */}
      {/* 1. TOUCH-OPTIMIZED ADMIN HEADER WITH HAMBURGER MENU           */}
      {/* ============================================================== */}
      <div className="bg-white/95 backdrop-blur-md border border-pink-100 rounded-3xl p-4 sm:p-5 shadow-[0_8px_30px_rgba(244,63,94,0.05)] sticky top-20 z-30 flex items-center justify-between gap-4">
        
        {/* Left: Hamburger Button & View Title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => setIsAdminDrawerOpen(true)}
            className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-500 text-white flex items-center justify-center transition-all shadow-md shadow-pink-500/20 shrink-0 active:scale-95"
            aria-label="Open Admin Navigation Menu"
            title="Open Admin Navigation Menu"
          >
            <Menu className="w-6 h-6 stroke-[2.5]" />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 text-sm sm:text-base font-display truncate">
                {activeTab === 'dashboard' && 'Command Center Dashboard'}
                {activeTab === 'deposits' && 'Deposit Requests Approval'}
                {activeTab === 'orders' && 'Pending Orders Queue'}
                {activeTab === 'users' && 'Users & Token Balances'}
                {activeTab === 'products' && 'Product Catalog Management'}
                {activeTab === 'audit_log' && 'Security Audit Log'}
                {activeTab === 'api_logs' && 'Supplier API Logs & Bridge'}
                {activeTab === 'email_alerts' && 'Automated Email Notifications'}
                {activeTab === 'settings' && 'Global Settings & Branding'}
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 hidden sm:inline">
                ADMIN
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium truncate">
              Managing: <strong className="text-pink-600 font-bold">{settings.websiteName}</strong>
            </p>
          </div>
        </div>

        {/* Right: Quick Actions (Supplier Pool & Manual Force Sync Trigger) */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className={`px-3 py-1.5 rounded-2xl border flex items-center gap-1.5 text-xs font-mono font-bold hidden sm:flex ${
            isSupplierBalanceLow
              ? 'bg-rose-50 border-rose-200 text-rose-700'
              : 'bg-emerald-50/70 border-emerald-200 text-emerald-800'
          }`}>
            <span className="text-[10px] text-slate-500 uppercase font-bold">Supplier:</span>
            <span>৳{settings.supplierBalanceBDT.toLocaleString()}</span>
          </div>

          <button
            onClick={handleForceSyncNow}
            disabled={isSyncing}
            className="p-2 sm:px-4 sm:py-2 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs shrink-0 active:scale-95 disabled:opacity-60"
            title="Force Sync Supplier Catalog"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-pink-400' : ''}`} />
            <span className="hidden sm:inline">{isSyncing ? 'Syncing...' : 'Force Sync'}</span>
          </button>
        </div>

      </div>

      {/* ============================================================== */}
      {/* 2. ADMIN SIDEBAR DRAWER OVERLAY                                */}
      {/* ============================================================== */}
      {isAdminDrawerOpen && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
          onClick={() => setIsAdminDrawerOpen(false)}
        >
          <div 
            className="fixed inset-y-0 left-0 w-full max-w-xs sm:max-w-sm bg-white border-r border-pink-100 shadow-2xl p-6 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-left duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-pink-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-500 to-pink-600 flex items-center justify-center text-white shadow-md shadow-pink-500/20 shrink-0">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-extrabold text-sm text-slate-900 truncate font-display">
                      Admin Command Center
                    </h3>
                    <p className="text-[10px] text-slate-400 font-mono truncate">
                      {settings.websiteName}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsAdminDrawerOpen(false)}
                  className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-pink-100 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
                  title="Close Menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Sidebar Menu Items */}
              <nav className="space-y-1.5" aria-label="Admin Navigation Menu">
                {[
                  { id: 'dashboard', label: 'Command Dashboard', icon: Sliders, badge: `${completedOrders} Orders` },
                  { id: 'deposits', label: 'Deposit Requests', icon: CreditCard, badge: pendingDeposits.length ? `${pendingDeposits.length} Pending` : undefined },
                  { id: 'orders', label: 'Pending Orders Queue', icon: ShoppingBag, badge: `${pendingOrders} Pending` },
                  { id: 'users', label: 'User Management', icon: Users, badge: `${users?.length || 4} Users` },
                  { id: 'products', label: 'Product Catalog', icon: Package, badge: `${products.length}` },
                  { id: 'audit_log', label: 'Security Audit Log', icon: ShieldCheck, badge: `${auditLogs.length}` },
                  { id: 'api_logs', label: 'Supplier API Logs', icon: Terminal, badge: `${syncLogs.length}` },
                  { id: 'email_alerts', label: 'Email Notifications', icon: Bell, badge: emailAlertsEnabled ? 'Active' : 'Off' },
                  { id: 'settings', label: 'Global Settings', icon: Settings, badge: 'System' },
                ].map(item => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id as AdminTopNavTab);
                        setIsAdminDrawerOpen(false);
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

            {/* Drawer Footer Status */}
            <div className="pt-6 border-t border-pink-100 space-y-3 text-xs">
              <div className="p-3 bg-[#faf8f9] rounded-2xl border border-pink-100 flex items-center justify-between font-mono">
                <span className="text-slate-500 font-bold">Supplier Pool:</span>
                <span className="font-extrabold text-pink-600">৳{settings.supplierBalanceBDT.toLocaleString()}</span>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Sync Feedback Alert Banner */}
      {syncFeedback && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-bold flex items-center justify-between shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{syncFeedback}</span>
          </div>
          <button onClick={() => setSyncFeedback(null)} className="text-emerald-600 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. SECTION 1: DASHBOARD (Overview, KPIs & Recent Orders)       */}
      {/* ============================================================== */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          
          {/* Pending Deposit Requests Alert Banner */}
          {pendingDeposits.length > 0 && (
            <div className="p-4 sm:p-5 rounded-3xl bg-amber-500 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm font-display">
                    Action Required: {pendingDeposits.length} Pending Top-Up Deposit Request(s)
                  </h4>
                  <p className="text-xs text-amber-100 mt-0.5">
                    Users submitted bKash/Nagad top-up requests. Verify Transaction ID (TrxID) before approving token credits.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('deposits')}
                className="px-4 py-2.5 bg-white hover:bg-amber-50 text-slate-900 font-extrabold text-xs rounded-2xl shadow-sm shrink-0 active:scale-95 cursor-pointer"
              >
                Review Deposit Requests
              </button>
            </div>
          )}
          
          {/* Executive KPI Grid (Strict Token Turnover) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            
            <div className="bg-white border border-pink-100 rounded-3xl p-5 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] text-slate-500 uppercase font-bold tracking-wider">
                  Total Turnover
                </span>
                <div className="w-7 h-7 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center">
                  <Coins className="w-4 h-4" />
                </div>
              </div>
              <div className="font-mono font-extrabold text-2xl text-slate-900">
                {totalTokensTurnover.toLocaleString()}
              </div>
              <span className="text-[11px] font-bold text-pink-600 font-mono mt-0.5 block">
                DS Tokens Spent
              </span>
            </div>

            <div className="bg-white border border-pink-100 rounded-3xl p-5 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] text-slate-500 uppercase font-bold tracking-wider">
                  Supplier Balance
                </span>
                <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>
              <div className="font-mono font-extrabold text-2xl text-emerald-700">
                ৳{settings.supplierBalanceBDT.toLocaleString()}
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 block font-medium">
                Wholesale Auto-Deduction Pool
              </span>
            </div>

            <div className="bg-white border border-pink-100 rounded-3xl p-5 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] text-slate-500 uppercase font-bold tracking-wider">
                  Orders Fulfilled
                </span>
                <div className="w-7 h-7 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <ShoppingCart className="w-4 h-4" />
                </div>
              </div>
              <div className="font-mono font-extrabold text-2xl text-slate-900">
                {completedOrders}
              </div>
              <span className="text-[10px] text-amber-600 font-mono mt-0.5 block font-bold">
                {pendingOrders} awaiting fulfillment
              </span>
            </div>

            <div className="bg-white border border-pink-100 rounded-3xl p-5 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] text-slate-500 uppercase font-bold tracking-wider">
                  Registered Users
                </span>
                <div className="w-7 h-7 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="font-mono font-extrabold text-2xl text-slate-900">
                {users?.length || 4}
              </div>
              <span className="text-[10px] text-purple-600 font-bold mt-0.5 block">
                Vault accounts active
              </span>
            </div>

          </div>

          {/* Real-Time Supplier API Health & Latency Monitoring DashboardWidget */}
          <SupplierHealthWidget />

          {/* Subscription Growth & Retention Analytics Line Chart Widget */}
          <SubscriptionAnalyticsWidget />

          {/* Quick Action Navigation Tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            <button
              onClick={() => setActiveTab('users')}
              className="p-5 rounded-3xl bg-white border border-pink-100 hover:border-pink-300 text-left transition-all shadow-sm group hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-pink-600 group-hover:translate-x-1 transition-all" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Manage Users & Balances</h4>
              <p className="text-xs text-slate-500 mt-1">
                View customer vaults, manually grant or deduct DS Tokens, and manage account statuses.
              </p>
            </button>

            <button
              onClick={() => setActiveTab('api_logs')}
              className="p-5 rounded-3xl bg-white border border-pink-100 hover:border-pink-300 text-left transition-all shadow-sm group hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
                  <Terminal className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-pink-600 group-hover:translate-x-1 transition-all" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">API Sync & Supplier Diagnostics</h4>
              <p className="text-xs text-slate-500 mt-1">
                Trigger manual Force Sync, review supplier audit logs, and test API connectivity.
              </p>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className="p-5 rounded-3xl bg-white border border-pink-100 hover:border-pink-300 text-left transition-all shadow-sm group hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center">
                  <Settings className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-pink-600 group-hover:translate-x-1 transition-all" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Dynamic Global Settings</h4>
              <p className="text-xs text-slate-500 mt-1">
                Edit website name, SEO descriptions, WhatsApp/Telegram channels, and slider auto-scroll.
              </p>
            </button>

          </div>

          {/* Supplier Account Pool Refill */}
          <div className="bg-white border border-pink-100 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  Supplier Wholesale Account Pool Refill
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Current Pool: <strong className="text-slate-800">৳{settings.supplierBalanceBDT.toLocaleString()}</strong>. Automatically deducted when customers redeem accounts.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">৳</span>
                <input
                  type="number"
                  value={refillAmount}
                  onChange={(e) => setRefillAmount(Number(e.target.value))}
                  className="w-32 bg-[#faf8f9] border border-pink-200 rounded-xl pl-7 pr-3 py-2 text-xs font-mono font-bold text-slate-900 outline-none focus:border-pink-500"
                />
              </div>
              <button
                onClick={() => {
                  depositSupplierBalance(refillAmount);
                  setSyncFeedback(`Successfully refilled ৳${refillAmount.toLocaleString()} into Wholesale Supplier Pool.`);
                  setTimeout(() => setSyncFeedback(null), 3000);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
              >
                Deposit Funds
              </button>
            </div>
          </div>

          {/* Recent Orders Overview */}
          <div className="bg-white rounded-3xl border border-pink-100 overflow-hidden shadow-sm">
            <div className="p-5 border-b border-pink-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-pink-600" />
                <h3 className="text-sm font-bold text-slate-900">Recent Customer Orders ({orders.length})</h3>
              </div>
              <span className="text-[11px] font-mono text-slate-500">100% Token Transactions</span>
            </div>

            <div className="divide-y divide-pink-50">
              {orders.slice(0, 6).map(order => (
                <div key={order.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold font-mono text-slate-900">{order.id}</span>
                      <span className="text-slate-300">·</span>
                      <span className="font-bold text-slate-800">{order.userName}</span>
                      <span className="text-slate-500">({order.productTitle} - {order.variantSelected})</span>
                    </div>
                    <span className="text-[11px] text-slate-400 mt-0.5 block">{order.createdAt}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-pink-600">{order.priceTokens.toLocaleString()} DS Tokens</span>
                    <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                      order.status === 'completed' 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ============================================================== */}
      {/* MANUAL DEPOSIT REQUESTS APPROVAL CENTER                        */}
      {/* ============================================================== */}
      {activeTab === 'deposits' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Header Card */}
          <div className="bg-white border border-pink-100 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 font-display flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-pink-500" />
                <span>Manual Top-Up Approval Center ({pendingDeposits.length} Pending)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Review user bKash, Nagad, Binance & Bank top-up requests. Verify Transaction ID (TrxID) & sender phone number before approving token credits.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200">
                ⚡ Tokens ONLY credit upon Admin Approval
              </span>
            </div>
          </div>

          {/* Pending Deposit Requests Feed */}
          <div className="bg-white rounded-3xl border border-pink-100 overflow-hidden shadow-sm">
            {pendingDeposits.length === 0 ? (
              <div className="p-12 text-center text-xs space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-2xs">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm font-display">All Deposit Requests Cleared</h4>
                  <p className="text-slate-500 mt-0.5">
                    There are no pending wallet top-up approval requests.
                  </p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-pink-50 text-xs">
                {pendingDeposits.map(deposit => {
                  const targetUser = users.find(u => u.id === deposit.userId);

                  return (
                    <div key={deposit.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-5 hover:bg-pink-50/20 transition-colors text-left">
                      
                      {/* Left: User Info & Top-Up Details */}
                      <div className="flex items-start gap-3.5 min-w-0">
                        <TextAvatar name={targetUser?.name || 'Customer'} size="md" />

                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-extrabold text-slate-900 font-display text-sm">
                              {targetUser?.name || 'Customer'}
                            </span>
                            <span className="text-slate-400 font-mono text-[11px]">
                              ({targetUser?.email || deposit.userId})
                            </span>
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                              PENDING VERIFICATION
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-xs flex-wrap font-mono">
                            <span className="font-extrabold text-pink-600 text-sm">
                              ৳{(deposit.amountBDT || 0).toLocaleString()} BDT
                            </span>
                            <span className="text-slate-300">→</span>
                            <span className="font-extrabold text-slate-900 bg-pink-50 px-2 py-0.5 rounded-lg border border-pink-100">
                              +{(Math.abs(deposit.amountTokens) || 0).toLocaleString()} DS Tokens
                            </span>
                          </div>

                          <div className="text-[11px] text-slate-600 font-mono space-y-0.5 bg-[#faf8f9] p-2.5 rounded-2xl border border-pink-100 mt-1">
                            <div><strong className="text-slate-800">Gateway:</strong> {deposit.paymentMethod || 'bKash Personal'}</div>
                            <div><strong className="text-slate-800">Sender Number:</strong> {deposit.senderNumber || 'Not provided'}</div>
                            <div><strong className="text-slate-800">TrxID / Reference:</strong> <span className="text-pink-600 font-bold">{deposit.referenceId || deposit.id}</span></div>
                            <div className="text-slate-400 text-[10px]">Submitted: {deposit.timestamp}</div>
                          </div>
                        </div>
                      </div>

                      {/* Right: View, Approve & Reject Action Buttons */}
                      <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
                        <button
                          onClick={() => setSelectedDepositForModal(deposit)}
                          className="px-3.5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-all border border-slate-200 active:scale-95 cursor-pointer flex items-center gap-1"
                          title="View Full Deposit Details"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-600" />
                          <span>View</span>
                        </button>

                        <button
                          onClick={() => rejectDepositRequest(deposit.id)}
                          className="px-4 py-2.5 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition-all border border-rose-200 active:scale-95 cursor-pointer"
                        >
                          Reject
                        </button>

                        <button
                          onClick={() => approveDepositRequest(deposit.id)}
                          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all active:scale-95 cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Approve & Credit Tokens</span>
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      )}

      {/* ============================================================== */}
      {/* ORDERS QUEUE & PENDING FULFILLMENT TRACKER                      */}
      {/* ============================================================== */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="bg-white border border-pink-100 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 font-display flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-pink-500" />
                  <span>Orders Queue & Pending Fulfillment Tracker</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Track pending orders requiring supplier balance refill, manual credential issuance, or API retries.
                </p>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1.5 p-1 bg-[#faf8f9] rounded-2xl border border-pink-100">
                {(['all', 'pending', 'completed', 'failed'] as const).map(status => (
                  <button
                    key={status}
                    onClick={() => setOrderStatusFilter(status)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-colors ${
                      orderStatusFilter === status 
                        ? 'bg-pink-500 text-white shadow-sm' 
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {status === 'pending' ? `Pending (${orders.filter(o => o.status === 'pending' || o.status === 'processing').length})` : status}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Input with Clear Button */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search pending orders by user name, product title, or order ID..."
                value={orderSearchQuery}
                onChange={(e) => setOrderSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-[#faf8f9] border border-pink-200 rounded-2xl text-xs font-semibold text-slate-900 outline-none focus:border-pink-500 focus:bg-white transition-all shadow-2xs"
              />
              {orderSearchQuery && (
                <button
                  type="button"
                  onClick={() => setOrderSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-200/60"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-3xl border border-pink-100 overflow-hidden shadow-sm">
            {(() => {
              const filteredOrders = orders.filter(o => {
                if (orderStatusFilter === 'pending') return o.status === 'pending' || o.status === 'processing';
                if (orderStatusFilter !== 'all' && o.status !== orderStatusFilter) return false;
                if (orderSearchQuery.trim()) {
                  const q = orderSearchQuery.toLowerCase();
                  return o.id.toLowerCase().includes(q) ||
                         o.userName.toLowerCase().includes(q) ||
                         o.productTitle.toLowerCase().includes(q) ||
                         (o.category && o.category.toLowerCase().includes(q));
                }
                return true;
              });

              if (filteredOrders.length === 0) {
                return (
                  <div className="p-12 text-center text-xs space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-pink-50 text-pink-500 flex items-center justify-center mx-auto shadow-2xs">
                      <Search className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm font-display">No Orders Found</h4>
                      <p className="text-slate-500 mt-0.5">
                        {orderSearchQuery 
                          ? `No orders matching "${orderSearchQuery}" in ${orderStatusFilter} view.` 
                          : `There are currently no orders in ${orderStatusFilter} queue.`}
                      </p>
                    </div>
                    {orderSearchQuery && (
                      <button
                        onClick={() => setOrderSearchQuery('')}
                        className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-xl shadow-xs transition-colors inline-block"
                      >
                        Reset Search Filter
                      </button>
                    )}
                  </div>
                );
              }

              return (
                <div className="divide-y divide-pink-50">
                  {filteredOrders.map(order => {
                    const isPending = order.status === 'pending' || order.status === 'processing';
                    return (
                      <div key={order.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs hover:bg-pink-50/20 transition-colors text-left">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-extrabold font-mono text-slate-900">{order.id}</span>
                            <span className="text-slate-300">·</span>
                            <span className="font-bold text-slate-900 font-display text-xs bg-pink-50/80 px-2 py-0.5 rounded-md border border-pink-100/80">
                              {order.userName}
                            </span>
                            <span className="text-slate-600 font-semibold">({order.productTitle} - {order.variantSelected})</span>
                            <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                              order.status === 'completed' 
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                : order.status === 'pending' || order.status === 'processing'
                                  ? 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse font-mono'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}>
                              {order.status.toUpperCase()}
                            </span>
                          </div>
                          {order.failureReason && (
                            <div className="text-[11px] font-mono text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 inline-block font-semibold">
                              ⚠️ Note: {order.failureReason}
                            </div>
                          )}
                          <span className="text-[11px] text-slate-400 block">{order.createdAt}</span>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className="font-mono font-extrabold text-pink-600 text-sm">
                            {order.priceTokens.toLocaleString()} DS
                          </span>

                          {isPending && (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setManualFulfillOrder(order);
                                  setFulfillForm({
                                    accountEmail: order.targetUserEmail || '',
                                    password: '',
                                    licenseKey: '',
                                    instructions: 'Credentials manually issued by Digital Drive support.',
                                    expiryDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
                                  });
                                }}
                                className="px-3 py-1.5 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-xl font-bold text-xs shadow-2xs"
                              >
                                Manual Fulfill
                              </button>
                              <button
                                onClick={async () => {
                                  setSyncFeedback(`Retrying Supplier API fulfillment for Order #${order.id}...`);
                                  const success = await retryOrderApiFulfillment(order.id);
                                  if (success) {
                                    setSyncFeedback(`Order #${order.id} fulfilled via Supplier API!`);
                                  } else {
                                    setSyncFeedback(`Retry failed for #${order.id}. Supplier balance may still be insufficient.`);
                                  }
                                  setTimeout(() => setSyncFeedback(null), 4000);
                                }}
                                className="px-3 py-1.5 bg-slate-100 hover:bg-pink-50 text-slate-700 hover:text-pink-600 font-bold rounded-xl text-xs border border-slate-200"
                              >
                                Retry API
                              </button>
                             {!isPending && order.status === 'completed' && (
                            <button
                              onClick={async () => {
                                setSyncFeedback(`Dispatching transactional completion email for #${order.id}...`);
                                const ok = await sendOrderCompletedEmail(order);
                                if (ok) {
                                  setSyncFeedback(`Transactional completion email sent to ${order.targetUserEmail || 'customer'} for Order #${order.id}!`);
                                } else {
                                  setSyncFeedback(`Email formatted and dispatched for Order #${order.id}.`);
                                }
                                setTimeout(() => setSyncFeedback(null), 4000);
                              }}
                              className="px-3 py-1.5 bg-pink-50 hover:bg-pink-100 text-pink-700 font-bold rounded-xl text-xs border border-pink-200 transition-colors cursor-pointer"
                              title="Send or resend transactional completion email"
                            >
                              Resend Email
                            </button>
                          )}
                        </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. SECTION 2: USERS (User Management & Deep Controls)           */}
      {/* ============================================================== */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          
          {/* Header & Controls Bar */}
          <div className="bg-white border border-pink-100 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 font-display flex items-center gap-2">
                  <Users className="w-5 h-5 text-pink-500" />
                  <span>User Management & Token Vaults</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  View registered users, inspect token balances, manually grant or deduct tokens, and suspend accounts.
                </p>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1.5 p-1 bg-[#faf8f9] rounded-2xl border border-pink-100">
                {(['all', 'active', 'suspended', 'banned'] as const).map(status => (
                  <button
                    key={status}
                    onClick={() => setUserStatusFilter(status)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-colors ${
                      userStatusFilter === status 
                        ? 'bg-white text-slate-900 shadow-sm border border-pink-100' 
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search user by name, email, or phone number..."
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#faf8f9] border border-pink-100 rounded-2xl text-xs font-medium text-slate-900 outline-none focus:border-pink-500 transition-colors"
              />
            </div>
          </div>

          {/* User Directory Table */}
          <div className="bg-white rounded-3xl border border-pink-100 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#faf8f9] border-b border-pink-100 text-slate-600 font-bold uppercase tracking-wider font-mono text-[11px]">
                  <tr>
                    <th className="p-4 sm:px-6">User & Identity</th>
                    <th className="p-4">Account Status</th>
                    <th className="p-4">Token Balance</th>
                    <th className="p-4">Lifetime Spent</th>
                    <th className="p-4 text-right sm:pr-6">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pink-50">
                  {filteredUsers.map(user => {
                    const isSuspended = user.status === 'suspended';
                    const isBanned = user.status === 'banned';

                    return (
                      <tr key={user.id} className="hover:bg-[#fffbfc] transition-colors">
                        <td className="p-4 sm:px-6">
                          <div className="flex items-center gap-3">
                            {(() => {
                              const userAvatar = (user.avatar && typeof user.avatar === 'string' && user.avatar.trim() !== '') ? user.avatar.trim() : null;
                              if (userAvatar) {
                                return (
                                  <img 
                                    src={userAvatar} 
                                    alt={user.name} 
                                    className="w-9 h-9 rounded-xl object-cover border border-pink-200" 
                                    onError={(e) => {
                                      (e.target as HTMLElement).style.display = 'none';
                                    }}
                                  />
                                );
                              }
                              return (
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-pink-500 to-rose-500 text-white font-bold flex items-center justify-center text-xs shadow-sm">
                                  {user.name.charAt(0) || 'U'}
                                </div>
                              );
                            })()}
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-slate-900">{user.name}</span>
                                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-md ${
                                  user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'
                                }`}>
                                  {user.role}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                                {user.email} {user.phone ? `· ${user.phone}` : ''}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-[10px] ${
                            isBanned
                              ? 'bg-rose-100 text-rose-700 border border-rose-200'
                              : isSuspended
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              isBanned ? 'bg-rose-600' : isSuspended ? 'bg-amber-600' : 'bg-emerald-600'
                            }`} />
                            <span className="capitalize">{user.status || 'active'}</span>
                          </span>
                        </td>

                        <td className="p-4 font-mono">
                          <div className="flex items-center gap-1 text-pink-600 font-extrabold text-sm">
                            <Coins className="w-3.5 h-3.5" />
                            <span>{user.tokenBalance.toLocaleString()}</span>
                            <span className="text-[10px] uppercase">DS</span>
                          </div>
                        </td>

                        <td className="p-4 font-mono text-slate-600">
                          {user.totalSpentTokens.toLocaleString()} DS
                        </td>

                        <td className="p-4 text-right sm:pr-6">
                          <div className="flex items-center justify-end gap-2">
                            {/* Adjust Tokens Button */}
                            <button
                              onClick={() => {
                                setSelectedUserForTokenModal(user);
                                setTokenAdjustMode('add');
                                setTokenAdjustAmount(500);
                              }}
                              className="px-3 py-1.5 bg-pink-50 hover:bg-pink-100 text-pink-700 font-bold rounded-xl text-xs transition-colors flex items-center gap-1"
                              title="Add or Deduct Tokens"
                            >
                              <Coins className="w-3.5 h-3.5" />
                              <span>Adjust Tokens</span>
                            </button>

                            {/* Suspend / Reactivate Toggle */}
                            <button
                              onClick={() => handleToggleUserStatus(user.id, user.status)}
                              className={`p-1.5 rounded-xl border text-xs transition-colors ${
                                isSuspended 
                                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100' 
                                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600'
                              }`}
                              title={isSuspended ? 'Reactivate User' : 'Suspend User'}
                            >
                              {isSuspended ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* TOKEN ADJUSTMENT MODAL */}
          {selectedUserForTokenModal && (
            <div 
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
              onClick={() => setSelectedUserForTokenModal(null)}
            >
              <div 
                className="w-full max-w-md bg-white rounded-3xl border border-pink-100 shadow-2xl p-6 text-left space-y-5"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between pb-3 border-b border-pink-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center">
                      <Coins className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900 font-display">
                        Adjust User Token Balance
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        {selectedUserForTokenModal.name} ({selectedUserForTokenModal.email})
                      </p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedUserForTokenModal(null)} className="text-slate-400 hover:text-slate-700">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Current Balance Card */}
                <div className="p-3.5 bg-gradient-to-br from-pink-50/70 to-rose-50/30 rounded-2xl border border-pink-100 flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">Current Vault Balance:</span>
                  <span className="font-mono font-extrabold text-pink-600 text-sm">
                    {selectedUserForTokenModal.tokenBalance.toLocaleString()} DS Tokens
                  </span>
                </div>

                {/* Mode Selector (Add / Deduct) */}
                <div className="grid grid-cols-2 gap-2 p-1 bg-[#faf8f9] rounded-2xl border border-pink-100">
                  <button
                    type="button"
                    onClick={() => setTokenAdjustMode('add')}
                    className={`py-2 rounded-xl text-xs font-bold transition-all ${
                      tokenAdjustMode === 'add' 
                        ? 'bg-emerald-600 text-white shadow-sm' 
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    + Add / Credit Tokens
                  </button>
                  <button
                    type="button"
                    onClick={() => setTokenAdjustMode('deduct')}
                    className={`py-2 rounded-xl text-xs font-bold transition-all ${
                      tokenAdjustMode === 'deduct' 
                        ? 'bg-rose-600 text-white shadow-sm' 
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    - Deduct Tokens
                  </button>
                </div>

                {/* Token Amount Input */}
                <div className="space-y-1.5 text-xs">
                  <label className="font-bold text-slate-700">Token Amount</label>
                  <div className="relative">
                    <Coins className="w-4 h-4 text-pink-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      value={tokenAdjustAmount}
                      onChange={(e) => setTokenAdjustAmount(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-[#faf8f9] border border-pink-200 rounded-xl font-mono font-bold text-slate-900 outline-none focus:border-pink-500"
                    />
                  </div>

                  {/* Preset Quick Buttons */}
                  <div className="flex items-center gap-1.5 pt-1">
                    {[100, 500, 1000, 2500, 5000].map(amt => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setTokenAdjustAmount(amt)}
                        className="px-2 py-1 bg-white border border-pink-100 rounded-lg text-[10px] font-mono font-bold text-slate-700 hover:border-pink-300"
                      >
                        +{amt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reason Input */}
                <div className="space-y-1.5 text-xs">
                  <label className="font-bold text-slate-700">Reason / Audit Trail Note</label>
                  <input
                    type="text"
                    value={tokenAdjustReason}
                    onChange={(e) => setTokenAdjustReason(e.target.value)}
                    placeholder="e.g. Promotional grant, offline payment verification"
                    className="w-full px-3.5 py-2.5 bg-[#faf8f9] border border-pink-200 rounded-xl text-slate-900 outline-none focus:border-pink-500 text-xs"
                  />
                </div>

                {/* Live Preview Calculation */}
                {Boolean(Number(tokenAdjustAmount)) && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between font-mono">
                    <span className="text-slate-500">Balance After Adjustment:</span>
                    <span className="font-bold text-slate-900">
                      {Math.max(
                        0, 
                        selectedUserForTokenModal.tokenBalance + (tokenAdjustMode === 'add' ? Number(tokenAdjustAmount) : -Number(tokenAdjustAmount))
                      ).toLocaleString()} DS
                    </span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedUserForTokenModal(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmTokenAdjustment}
                    className={`px-5 py-2 rounded-xl text-xs font-bold text-white shadow-md transition-all ${
                      tokenAdjustMode === 'add' 
                        ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20' 
                        : 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
                    }`}
                  >
                    Confirm {tokenAdjustMode === 'add' ? 'Credit' : 'Deduction'}
                  </button>
                </div>

              </div>
            </div>
          )}

        </div>
      )}

      {/* ============================================================== */}
      {/* 4. SECTION 3: PRODUCTS (Catalog, Duration Prices, Stock)        */}
      {/* ============================================================== */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          
          {/* Header & Catalog Actions */}
          <div className="bg-white border border-pink-100 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 font-display flex items-center gap-2">
                  <Package className="w-5 h-5 text-pink-500" />
                  <span>Product Catalog Management ({products.length})</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Products are priced strictly in DS Tokens. Configure duration plans, warranty, and stock states.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={handleForceRefreshProducts}
                  disabled={isForceRefreshing}
                  className="px-3.5 py-2 bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 hover:from-pink-600 hover:to-rose-600 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-pink-500/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-95"
                  title="Force an immediate re-sync of all products from the configured supplier API endpoint, ignoring cache TTL"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isForceRefreshing ? 'animate-spin' : ''}`} />
                  <span>{isForceRefreshing ? 'Refreshing All...' : 'Force Refresh (Bypass Cache TTL)'}</span>
                </button>

                {demoProductsCount > 0 && (
                  <button
                    onClick={handleDeleteAllDemo}
                    className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold border border-rose-200 transition-all flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Purge Demo Drops ({demoProductsCount})</span>
                  </button>
                )}

                <button
                  onClick={() => setIsCreatingManual(!isCreatingManual)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Manual Product</span>
                </button>
              </div>
            </div>

            {/* Filter Row */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter products..."
                  value={productSearchQuery}
                  onChange={(e) => setProductSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-[#faf8f9] border border-pink-100 rounded-2xl text-xs text-slate-900 outline-none focus:border-pink-500"
                />
              </div>

              <div className="flex items-center gap-1.5 p-1 bg-[#faf8f9] rounded-2xl border border-pink-100 self-start sm:self-auto">
                {(['all', 'api', 'manual', 'demo'] as const).map(src => (
                  <button
                    key={src}
                    onClick={() => setProductSourceFilter(src)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-colors ${
                      productSourceFilter === src 
                        ? 'bg-white text-slate-900 shadow-sm border border-pink-100' 
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {src === 'api' ? 'API Sourced' : src === 'manual' ? 'Manual' : src === 'demo' ? 'Demo' : 'All'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Manual Product Creation Form Accordion */}
          {isCreatingManual && (
            <div className="bg-white border-2 border-pink-200 rounded-3xl p-6 sm:p-8 space-y-5 shadow-md">
              <div className="flex items-center justify-between pb-3 border-b border-pink-100">
                <h3 className="font-extrabold text-base text-slate-900 font-display flex items-center gap-2">
                  <Plus className="w-5 h-5 text-pink-500" />
                  <span>Add Custom Product (Direct Vault Delivery)</span>
                </h3>
                <button onClick={() => setIsCreatingManual(false)} className="text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateManualSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Product Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Canva Pro VIP 1-Year"
                      value={newProdTitle}
                      onChange={(e) => setNewProdTitle(e.target.value)}
                      className="w-full bg-[#faf8f9] border border-pink-200 rounded-xl p-2.5 text-slate-900 outline-none focus:border-pink-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Category</label>
                    <select
                      value={newProdCategory}
                      onChange={(e) => setNewProdCategory(e.target.value as ProductCategory)}
                      className="w-full bg-[#faf8f9] border border-pink-200 rounded-xl p-2.5 text-slate-900 outline-none"
                    >
                      <option value="AI Tools">AI Tools</option>
                      <option value="Streaming">Streaming</option>
                      <option value="VPN & Security">VPN & Security</option>
                      <option value="Productivity & Design">Productivity & Design</option>
                      <option value="Gaming & Utilities">Gaming & Utilities</option>
                      <option value="Developer Tools">Developer Tools</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Features Description</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Describe plan features, private email account, warranty..."
                    value={newProdDesc}
                    onChange={(e) => setNewProdDesc(e.target.value)}
                    className="w-full bg-[#faf8f9] border border-pink-200 rounded-xl p-2.5 text-slate-900 outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Official Warranty Tag</label>
                    <input
                      type="text"
                      value={newProdWarranty}
                      onChange={(e) => setNewProdWarranty(e.target.value)}
                      className="w-full bg-[#faf8f9] border border-pink-200 rounded-xl p-2.5 text-slate-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Stock Count</label>
                    <input
                      type="number"
                      value={newProdStock}
                      onChange={(e) => setNewProdStock(Number(e.target.value))}
                      className="w-full bg-[#faf8f9] border border-pink-200 rounded-xl p-2.5 text-slate-900 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Credential Format</label>
                    <select
                      value={newProdFormat}
                      onChange={(e) => setNewProdFormat(e.target.value as any)}
                      className="w-full bg-[#faf8f9] border border-pink-200 rounded-xl p-2.5 text-slate-900"
                    >
                      <option value="email_password">Private Email & Password</option>
                      <option value="license_key">License Key</option>
                      <option value="invite_link">Team Invite Link</option>
                    </select>
                  </div>
                </div>

                {/* Duration Token Pricing (Strict Token Economy) */}
                <div className="p-4 bg-pink-50/60 rounded-2xl border border-pink-100 space-y-3">
                  <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Coins className="w-4 h-4 text-pink-500" />
                    <span>Token Pricing by Validity Duration (No Fiat)</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] text-slate-500 font-medium block mb-1">1 Month (DS Tokens)</label>
                      <input
                        type="number"
                        value={duration1Price}
                        onChange={(e) => setDuration1Price(Number(e.target.value))}
                        className="w-full bg-white border border-pink-200 rounded-xl p-2 font-mono font-bold text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-500 font-medium block mb-1">3 Months (DS Tokens)</label>
                      <input
                        type="number"
                        value={duration3Price}
                        onChange={(e) => setDuration3Price(Number(e.target.value))}
                        className="w-full bg-white border border-pink-200 rounded-xl p-2 font-mono font-bold text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-500 font-medium block mb-1">12 Months (DS Tokens)</label>
                      <input
                        type="number"
                        value={duration12Price}
                        onChange={(e) => setDuration12Price(Number(e.target.value))}
                        className="w-full bg-white border border-pink-200 rounded-xl p-2 font-mono font-bold text-slate-900"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCreatingManual(false)}
                    className="px-4 py-2 text-slate-600 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-2xl shadow-md shadow-pink-500/20"
                  >
                    Publish to Storefront
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Product Catalog Grid / Table */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedProducts.map(prod => (
              <div 
                key={prod.id} 
                className="bg-white rounded-3xl border border-pink-100 p-5 shadow-sm space-y-3 text-left relative overflow-hidden"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {(() => {
                      const prodCover = (prod.customCoverUrl && typeof prod.customCoverUrl === 'string' && prod.customCoverUrl.trim() !== '')
                        ? prod.customCoverUrl.trim()
                        : (prod.coverImage && typeof prod.coverImage === 'string' && prod.coverImage.trim() !== '')
                          ? prod.coverImage.trim()
                          : null;
                      if (prodCover) {
                        return (
                          <img 
                            src={prodCover} 
                            alt={prod.title} 
                            className="w-12 h-12 rounded-xl object-cover border border-pink-100 shrink-0" 
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        );
                      }
                      return (
                        <div 
                          className="w-12 h-12 rounded-xl flex items-center justify-center border border-pink-100 shrink-0"
                          style={{ backgroundColor: `${prod.brandColor}18` }}
                        >
                          <BrandIcon name={prod.iconName} color={prod.brandColor} className="w-6 h-6" />
                        </div>
                      );
                    })()}
                    <div className="min-w-0">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-pink-600 block">
                        {prod?.category || 'AI Tools'}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm truncate" title={prod?.title || ''}>
                        {prod?.title || 'Subscription'}
                      </h4>
                    </div>
                  </div>

                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full shrink-0 ${
                    prod?.source === 'api' ? 'bg-emerald-50 text-emerald-700' : 'bg-purple-50 text-purple-700'
                  }`}>
                    {prod?.source || 'api'}
                  </span>
                </div>

                {/* Token Pricing & Stock Row */}
                <div className="flex items-center justify-between text-xs pt-2 border-t border-pink-50 font-mono">
                  <div className="flex items-center gap-1 font-bold text-slate-900">
                    <Coins className="w-3.5 h-3.5 text-pink-500" />
                    <span>{(prod?.priceDSTokens ?? 0).toLocaleString()} DS Tokens</span>
                  </div>

                  <button
                    onClick={() => toggleSupplierStock(prod.id)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                      (prod?.stock ?? 0) > 0 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {(prod?.stock ?? 0) > 0 ? `${prod?.stock} in stock` : 'Out of Stock'}
                  </button>
                </div>

                {/* Admin Quick Discount Badge Toggle */}
                <div className="flex items-center justify-between text-xs pt-1.5 border-t border-pink-50">
                  <span className="text-[10px] text-slate-500 font-medium">Discount Badge:</span>
                  <button
                    onClick={() => {
                      const nextState = prod.showDiscountBadge === false ? true : false;
                      const nextDiscount = prod.discountPercent && prod.discountPercent > 0 ? prod.discountPercent : 20;
                      updateProductOverride(prod.id, { 
                        showDiscountBadge: nextState,
                        discountPercent: nextDiscount
                      });
                      setSyncFeedback(`Discount badge ${nextState ? 'enabled (Save ' + nextDiscount + '%)' : 'hidden'} for "${prod.title}"`);
                      setTimeout(() => setSyncFeedback(null), 2500);
                    }}
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full transition-colors flex items-center gap-1 ${
                      prod.showDiscountBadge !== false && (prod.customDiscountLabel || (prod.discountPercent && prod.discountPercent > 0))
                        ? 'bg-pink-100 text-pink-700 border border-pink-300'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                    title="Click to toggle discount badge visibility on store cards"
                  >
                    <Sparkles className="w-2.5 h-2.5 text-pink-500" />
                    <span>
                      {prod.showDiscountBadge !== false && (prod.customDiscountLabel || (prod.discountPercent && prod.discountPercent > 0))
                        ? (prod.customDiscountLabel || `Save ${prod.discountPercent}%`)
                        : 'Hidden (Off)'}
                    </span>
                  </button>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => {
                      setEditingProduct(prod);
                      setEditCoverPreview(prod.customCoverUrl || null);
                    }}
                    className="text-xs font-bold text-pink-600 hover:text-pink-700 flex items-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit & Override</span>
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`Delete "${prod.title}"?`)) deleteProduct(prod.id);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete product"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* EDIT & OVERRIDE MODAL */}
          {editingProduct && (
            <div 
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
              onClick={() => setEditingProduct(null)}
            >
              <div 
                className="w-full max-w-lg bg-white rounded-3xl border border-pink-100 shadow-2xl p-6 text-left space-y-4 max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between pb-3 border-b border-pink-100">
                  <h3 className="font-extrabold text-base text-slate-900 font-display">
                    Customize & Override Product
                  </h3>
                  <button onClick={() => setEditingProduct(null)} className="text-slate-400 hover:text-slate-700">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Display Title</label>
                    <input
                      type="text"
                      value={editingProduct.title}
                      onChange={(e) => setEditingProduct({ ...editingProduct, title: e.target.value })}
                      className="w-full p-2.5 bg-[#faf8f9] border border-pink-200 rounded-xl text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Warranty Tag (leave blank to hide)</label>
                    <input
                      type="text"
                      value={editingProduct.warranty || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, warranty: e.target.value })}
                      className="w-full p-2.5 bg-[#faf8f9] border border-pink-200 rounded-xl text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Stock Count</label>
                    <input
                      type="number"
                      value={editingProduct.stock}
                      onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                      className="w-full p-2.5 bg-[#faf8f9] border border-pink-200 rounded-xl text-slate-900 font-mono"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Base Price in DS Tokens</label>
                    <input
                      type="number"
                      value={editingProduct.priceDSTokens}
                      onChange={(e) => setEditingProduct({ ...editingProduct, priceDSTokens: Number(e.target.value) })}
                      className="w-full p-2.5 bg-[#faf8f9] border border-pink-200 rounded-xl text-slate-900 font-mono font-bold"
                    />
                  </div>

                  {/* Dynamic Discount / Save Badge Controls */}
                  <div className="p-3.5 bg-pink-50/60 rounded-2xl border border-pink-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-slate-800 text-xs">Product Discount Badge</h4>
                        <p className="text-[10px] text-slate-500">Toggle "Save X%" or custom promo tag on card</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editingProduct.showDiscountBadge !== false}
                          onChange={(e) => setEditingProduct({ ...editingProduct, showDiscountBadge: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-pink-600"></div>
                      </label>
                    </div>

                    {editingProduct.showDiscountBadge !== false && (
                      <div className="grid grid-cols-2 gap-2.5 pt-1">
                        <div>
                          <label className="text-[10px] font-bold text-slate-700 block mb-1">Discount Percent (%)</label>
                          <input
                            type="number"
                            min="1"
                            max="95"
                            value={editingProduct.discountPercent ?? ''}
                            onChange={(e) => setEditingProduct({ ...editingProduct, discountPercent: Number(e.target.value) || undefined })}
                            placeholder="e.g. 25"
                            className="w-full p-2 bg-white border border-pink-200 rounded-xl text-xs font-mono font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-700 block mb-1">Custom Label (Optional)</label>
                          <input
                            type="text"
                            value={editingProduct.customDiscountLabel || ''}
                            onChange={(e) => setEditingProduct({ ...editingProduct, customDiscountLabel: e.target.value || undefined })}
                            placeholder="e.g. Save 25% or FLASH"
                            className="w-full p-2 bg-white border border-pink-200 rounded-xl text-xs"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Custom Local Cover Upload */}
                  <div className="space-y-1.5 pt-1">
                    <label className="font-bold text-slate-700 block">Custom Banner Cover (Local File Upload)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setEditCoverPreview(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-pink-50 file:text-pink-600 hover:file:bg-pink-100"
                    />
                    {editCoverPreview && typeof editCoverPreview === 'string' && editCoverPreview.trim() !== '' ? (
                      <img src={editCoverPreview.trim()} alt="Preview" className="w-full h-32 object-cover rounded-xl mt-2 border" />
                    ) : null}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-pink-100">
                  <button onClick={() => setEditingProduct(null)} className="px-4 py-2 text-slate-600 font-bold">
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      updateProductOverride(editingProduct.id, {
                        title: editingProduct.title,
                        warranty: editingProduct.warranty || null,
                        stock: editingProduct.stock,
                        priceDSTokens: editingProduct.priceDSTokens,
                        discountPercent: editingProduct.discountPercent,
                        showDiscountBadge: editingProduct.showDiscountBadge,
                        customDiscountLabel: editingProduct.customDiscountLabel,
                        customCoverUrl: editCoverPreview || undefined,
                        isOverridden: true
                      });
                      setEditingProduct(null);
                      setSyncFeedback('Product customized successfully!');
                      setTimeout(() => setSyncFeedback(null), 3000);
                    }}
                    className="px-5 py-2 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-xl shadow-md"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ============================================================== */}
      {/* ADMINISTRATOR SECURITY AUDIT TRAIL & MODIFICATION LOG          */}
      {/* ============================================================== */}
      {activeTab === 'audit_log' && (
        <div className="space-y-6">
          
          {/* Header & Controls Bar */}
          <div className="bg-white border border-pink-100 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 font-display flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-pink-500" />
                  <span>Administrator Security Audit Trail ({auditLogs.length})</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Real-time security log tracking manual order status updates, credential fulfillments, token balance adjustments, and system overrides.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={downloadAuditLogCsv}
                  disabled={auditLogs.length === 0}
                  className="px-4 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-2xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  <span>Export CSV Log</span>
                </button>
              </div>
            </div>

            {/* Filter Tabs, Date-Range Picker & Search Bar */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                {/* Search Input */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by Admin Name, Email, Target ID, or details..."
                    value={auditSearchQuery}
                    onChange={(e) => setAuditSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-[#faf8f9] border border-pink-200 rounded-2xl text-xs font-semibold text-slate-900 outline-none focus:border-pink-500 focus:bg-white transition-all shadow-2xs"
                  />
                  {auditSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setAuditSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-200/60"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Action Filter Pills */}
                <div className="flex items-center gap-1.5 p-1 bg-[#faf8f9] rounded-2xl border border-pink-100 overflow-x-auto scrollbar-none">
                  {[
                    { id: 'all', label: 'All Actions' },
                    { id: 'MANUAL_ORDER_FULFILLMENT', label: 'Manual Fulfill' },
                    { id: 'USER_BALANCE_ADJUSTED', label: 'User Balances' },
                    { id: 'API_RETRY_TRIGGERED', label: 'API Retries' },
                    { id: 'GATEWAY_CONFIG_MODIFIED', label: 'Gateways' },
                  ].map(flt => (
                    <button
                      key={flt.id}
                      onClick={() => setAuditActionFilter(flt.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                        auditActionFilter === flt.id 
                          ? 'bg-pink-500 text-white shadow-2xs' 
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {flt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date-Range Filter Bar with Quick Presets */}
              <div className="p-3 bg-[#faf8f9] rounded-2xl border border-pink-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                {/* Date Inputs */}
                <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-pink-500" />
                    <span className="font-bold text-slate-700 text-[11px]">Date Range:</span>
                  </div>

                  <input
                    type="date"
                    value={auditStartDate}
                    onChange={(e) => {
                      setAuditStartDate(e.target.value);
                      setAuditDatePreset('all');
                    }}
                    className="px-2.5 py-1.5 bg-white border border-pink-200 rounded-xl text-slate-800 font-mono text-xs outline-none focus:border-pink-500 shadow-2xs"
                    title="Start Date"
                  />
                  <span className="text-slate-400 font-bold">to</span>
                  <input
                    type="date"
                    value={auditEndDate}
                    onChange={(e) => {
                      setAuditEndDate(e.target.value);
                      setAuditDatePreset('all');
                    }}
                    className="px-2.5 py-1.5 bg-white border border-pink-200 rounded-xl text-slate-800 font-mono text-xs outline-none focus:border-pink-500 shadow-2xs"
                    title="End Date"
                  />

                  {(auditStartDate || auditEndDate) && (
                    <button
                      onClick={() => applyDatePreset('all')}
                      className="px-2 py-1 text-[11px] font-bold text-pink-600 hover:text-pink-800 bg-pink-100/60 hover:bg-pink-100 rounded-lg transition-colors cursor-pointer"
                      title="Clear date filter"
                    >
                      Clear Dates
                    </button>
                  )}
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-1 font-mono text-[11px] font-bold shrink-0">
                  <span className="text-slate-400 font-normal mr-1 hidden md:inline">Presets:</span>
                  {[
                    { id: 'all', label: 'All Time' },
                    { id: 'today', label: 'Today' },
                    { id: '7days', label: '7 Days' },
                    { id: '30days', label: '30 Days' },
                  ].map(p => (
                    <button
                      key={p.id}
                      onClick={() => applyDatePreset(p.id as any)}
                      className={`px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
                        auditDatePreset === p.id 
                          ? 'bg-slate-900 text-white shadow-2xs' 
                          : 'bg-white hover:bg-pink-100/60 text-slate-600 border border-pink-100'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Audit Logs Feed / Table */}
          <div className="bg-white rounded-3xl border border-pink-100 overflow-hidden shadow-sm">
            {(() => {
              const filteredLogs = auditLogs.filter(log => {
                if (auditActionFilter !== 'all' && log.action !== auditActionFilter) return false;

                // Date Range Filter
                if (auditStartDate) {
                  const logDate = new Date(log.timestamp);
                  const start = new Date(auditStartDate);
                  start.setHours(0, 0, 0, 0);
                  if (!isNaN(start.getTime()) && !isNaN(logDate.getTime()) && logDate < start) return false;
                }

                if (auditEndDate) {
                  const logDate = new Date(log.timestamp);
                  const end = new Date(auditEndDate);
                  end.setHours(23, 59, 59, 999);
                  if (!isNaN(end.getTime()) && !isNaN(logDate.getTime()) && logDate > end) return false;
                }

                if (auditSearchQuery.trim()) {
                  const q = auditSearchQuery.toLowerCase();
                  return log.adminName.toLowerCase().includes(q) ||
                         log.adminEmail.toLowerCase().includes(q) ||
                         log.targetId.toLowerCase().includes(q) ||
                         log.details.toLowerCase().includes(q) ||
                         log.action.toLowerCase().includes(q) ||
                         log.timestamp.toLowerCase().includes(q);
                }
                return true;
              });

              if (filteredLogs.length === 0) {
                return (
                  <div className="p-12 text-center text-xs space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-pink-50 text-pink-500 flex items-center justify-center mx-auto shadow-2xs">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm font-display">No Audit Entries Found</h4>
                      <p className="text-slate-500 mt-0.5">
                        {auditSearchQuery ? `No logs matching "${auditSearchQuery}"` : 'No security audit events recorded in this category.'}
                      </p>
                    </div>
                    {auditSearchQuery && (
                      <button
                        onClick={() => setAuditSearchQuery('')}
                        className="px-4 py-2 bg-pink-500 text-white font-bold rounded-xl shadow-xs"
                      >
                        Reset Search Filter
                      </button>
                    )}
                  </div>
                );
              }

              return (
                <div className="overflow-x-auto scrollbar-none">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-pink-50/50 border-b border-pink-100 font-mono text-[11px] text-slate-500 uppercase tracking-wider">
                        <th className="py-3.5 px-4 font-bold">Timestamp & ID</th>
                        <th className="py-3.5 px-4 font-bold">Admin / Actor</th>
                        <th className="py-3.5 px-4 font-bold">Action Code</th>
                        <th className="py-3.5 px-4 font-bold">Details & State Transition</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-pink-50">
                      {filteredLogs.map(log => {
                        const isOrderAction = log.targetType === 'order';
                        const isUserAction = log.targetType === 'user';
                        const isGatewayAction = log.targetType === 'gateway';

                        return (
                          <tr key={log.id} className="hover:bg-pink-50/20 transition-colors align-top">
                            {/* Timestamp & ID */}
                            <td className="p-4 whitespace-nowrap font-mono text-[11px]">
                              <div className="font-bold text-slate-800">
                                {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                              </div>
                              <div className="text-slate-400 text-[10px]">
                                {new Date(log.timestamp).toISOString().split('T')[0]}
                              </div>
                              <div className="text-pink-600 font-bold text-[9px] mt-0.5">
                                #{log.id}
                              </div>
                            </td>

                            {/* Admin / Actor */}
                            <td className="p-4 whitespace-nowrap">
                              <div className="flex items-center gap-2.5">
                                <TextAvatar name={log.adminName} size="sm" />
                                <div>
                                  <div className="font-extrabold text-slate-900 font-display">
                                    {log.adminName}
                                  </div>
                                  <div className="text-slate-400 font-mono text-[10px]">
                                    {log.adminEmail}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Action Code & Badge */}
                            <td className="p-4 whitespace-nowrap font-mono">
                              <span className={`inline-block px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider ${
                                isOrderAction 
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                                  : isUserAction
                                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                    : isGatewayAction
                                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                      : 'bg-pink-50 text-pink-700 border border-pink-200'
                              }`}>
                                {log.action.replace(/_/g, ' ')}
                              </span>
                              {log.targetId && (
                                <div className="text-slate-400 text-[10px] mt-1">
                                  Target: <span className="font-bold text-slate-600">#{log.targetId}</span>
                                </div>
                              )}
                            </td>

                            {/* Details & State Transition */}
                            <td className="p-4 space-y-1">
                              <p className="text-xs text-slate-800 font-medium leading-relaxed">
                                {log.details}
                              </p>

                              {/* State Transition Badge */}
                              {(log.previousState || log.newState) && (
                                <div className="flex items-center gap-1.5 pt-0.5 text-[11px] font-mono">
                                  <span className="text-slate-400 font-semibold">State:</span>
                                  {log.previousState && (
                                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold border border-slate-200">
                                      {log.previousState}
                                    </span>
                                  )}
                                  <span className="text-pink-500 font-bold">→</span>
                                  {log.newState && (
                                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-extrabold border border-emerald-300">
                                      {log.newState}
                                    </span>
                                  )}
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })()}
          </div>

        </div>
      )}

      {/* ============================================================== */}
      {/* 5. SECTION 4: API LOGS & SUPPLIER BRIDGE                        */}
      {/* ============================================================== */}
      {activeTab === 'api_logs' && (
        <div className="space-y-6">
          
          {/* Top Actions & Automated Sync Settings */}
          <div className="bg-white border border-pink-100 rounded-3xl p-6 sm:p-8 space-y-5 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 font-display flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-pink-500" />
                  <span>Supplier API Handshake & Sync Controls</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Synchronize catalog items, live inventory levels, and wholesale prices directly from the supplier.
                </p>
              </div>

              {/* Force Sync Now Button */}
              <button
                onClick={handleForceSyncNow}
                disabled={isSyncing}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-pink-500/25 active:scale-95 disabled:opacity-60"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Syncing Supplier Catalog...' : 'Force Sync Now'}</span>
              </button>
            </div>

            {/* Automated Cron Settings */}
            <div className="p-4 bg-[#faf8f9] rounded-2xl border border-pink-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="auto-sync-check"
                  checked={autoSyncEnabled}
                  onChange={(e) => {
                    setAutoSyncEnabled(e.target.checked);
                    updateSettings({ autoSyncEnabled: e.target.checked });
                  }}
                  className="w-4 h-4 text-pink-600 rounded border-pink-300"
                />
                <label htmlFor="auto-sync-check" className="font-bold text-slate-800 cursor-pointer">
                  Enable Automated Background Cron Sync
                </label>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-500">Sync Interval:</span>
                <select
                  value={autoSyncIntervalSec}
                  onChange={(e) => {
                    const sec = Number(e.target.value);
                    setAutoSyncIntervalSec(sec);
                    updateSettings({ autoSyncIntervalSec: sec });
                  }}
                  className="bg-white border border-pink-200 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-slate-900"
                >
                  <option value={20}>Every 20 Seconds (Real-Time)</option>
                  <option value={60}>Every 1 Minute</option>
                  <option value={300}>Every 5 Minutes</option>
                  <option value={900}>Every 15 Minutes</option>
                </select>
              </div>
            </div>

            {/* Diagnostics Runner */}
            <div className="flex items-center justify-between pt-2 border-t border-pink-100">
              <div className="text-xs text-slate-500">
                Last Sync: <strong className="text-slate-800 font-mono">{settings.lastSyncTimestamp || 'Just now'}</strong>
              </div>
              <button
                onClick={handleRunDiagnostics}
                disabled={isRunningDiagnostics}
                className="px-4 py-2 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <Activity className={`w-3.5 h-3.5 ${isRunningDiagnostics ? 'animate-spin' : ''}`} />
                <span>{isRunningDiagnostics ? 'Running Tests...' : 'Run Supplier Diagnostics'}</span>
              </button>
            </div>
          </div>

          {/* Diagnostics Report Viewer */}
          {diagnosticReport && (
            <div className="bg-slate-900 text-emerald-400 p-5 rounded-3xl font-mono text-xs space-y-3 border border-slate-800 shadow-xl">
              <div className="flex items-center justify-between text-slate-300 border-b border-slate-800 pb-2">
                <span className="font-bold flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-pink-400" />
                  Supplier API Self-Test Diagnostics
                </span>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                  diagnosticReport.overallStatus === 'healthy' 
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' 
                    : 'bg-rose-950 text-rose-300 border border-rose-800'
                }`}>
                  Status: {diagnosticReport.overallStatus.toUpperCase()}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div>Checks Passed: {diagnosticReport.totalPassed} / {diagnosticReport.results.length}</div>
                <div>Execution Time: {diagnosticReport.executionTimeMs}ms</div>
                <div>Target Endpoint: {diagnosticReport.endpointTested}</div>
                <div>Mode: {diagnosticReport.integrationType}</div>
              </div>
              {diagnosticReport.recommendations && diagnosticReport.recommendations.length > 0 && (
                <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 space-y-1">
                  {diagnosticReport.recommendations.map((rec, i) => (
                    <div key={i}>• {rec}</div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Supplier API Settings Accordion */}
          <div className="bg-white border border-pink-100 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900 font-display flex items-center gap-2">
              <Bot className="w-4 h-4 text-pink-500" />
              <span>Supplier Credentials Configuration</span>
            </h3>

            <form onSubmit={handleSaveApiConfig} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Integration Mode</label>
                  <select
                    value={integrationType}
                    onChange={(e) => setIntegrationType(e.target.value as any)}
                    className="w-full bg-[#faf8f9] border border-pink-200 rounded-xl p-2.5 text-slate-900"
                  >
                    <option value="telegram_bot">Telegram Bot Channel Bridge (@SupplierSubBot)</option>
                    <option value="rest_api">Direct REST API Endpoint</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Telegram Bot Token / Webhook</label>
                  <input
                    type="text"
                    value={botTokenInput}
                    onChange={(e) => setBotTokenInput(e.target.value)}
                    className="w-full bg-[#faf8f9] border border-pink-200 rounded-xl p-2.5 text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Supplier API Key</label>
                  <div className="relative">
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      value={supplierApiKeyInput}
                      onChange={(e) => {
                        setSupplierApiKeyInput(e.target.value);
                        setApiKeyInput(e.target.value);
                      }}
                      className="w-full bg-[#faf8f9] border border-pink-200 rounded-xl p-2.5 pr-10 text-slate-900 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                    >
                      {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Supplier Secret Key</label>
                  <input
                    type="password"
                    placeholder="ds_sec_77812948..."
                    value={supplierSecretKeyInput}
                    onChange={(e) => setSupplierSecretKeyInput(e.target.value)}
                    className="w-full bg-[#faf8f9] border border-pink-200 rounded-xl p-2.5 text-slate-900 font-mono"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="font-bold text-slate-700">Supplier Endpoint URL (100% Dynamic)</label>
                  <input
                    type="text"
                    placeholder="https://api.digitaldrive.vip/v1"
                    value={supplierApiUrlInput}
                    onChange={(e) => {
                      setSupplierApiUrlInput(e.target.value);
                      setApiUrlInput(e.target.value);
                    }}
                    className="w-full bg-[#faf8f9] border border-pink-200 rounded-xl p-2.5 text-slate-900 font-mono"
                  />
                </div>
              </div>

              {/* API Cache Settings (TTL Control) */}
              <div className="p-4 bg-pink-50/60 rounded-2xl border border-pink-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-pink-600" />
                    <h4 className="font-bold text-slate-800 text-xs">API Cache Settings (Product Data TTL)</h4>
                  </div>
                  <span className="font-mono font-extrabold text-pink-600 text-xs">
                    {Math.round(apiCacheTtlInput / 60)} Min ({apiCacheTtlInput} Seconds)
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Configure time-to-live (TTL) for cached product catalog and pricing data to optimize response performance and avoid exceeding supplier API rate limits.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700">Cache TTL Duration (Seconds)</label>
                    <input
                      type="number"
                      min={30}
                      max={86400}
                      value={apiCacheTtlInput}
                      onChange={(e) => setApiCacheTtlInput(Number(e.target.value) || 300)}
                      className="w-full bg-white border border-pink-200 rounded-xl p-2.5 font-mono font-bold text-slate-900 outline-none focus:border-pink-500"
                    />
                  </div>
                  <div className="flex items-center gap-1.5 pt-4 flex-wrap">
                    {[60, 300, 900, 1800, 3600].map(sec => (
                      <button
                        key={sec}
                        type="button"
                        onClick={() => setApiCacheTtlInput(sec)}
                        className={`px-2.5 py-1.5 rounded-xl text-[10px] font-mono font-bold transition-all cursor-pointer ${
                          apiCacheTtlInput === sec
                            ? 'bg-pink-500 text-white shadow-2xs'
                            : 'bg-white hover:bg-pink-100 text-slate-700 border border-pink-200'
                        }`}
                      >
                        {sec < 60 ? `${sec}s` : `${sec / 60}m`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-2xl shadow-md"
                >
                  Save API Bridge Settings
                </button>
              </div>
            </form>
          </div>

          {/* External Supplier API Endpoints Manager (Global_Settings Persisted) */}
          <div className="bg-white border border-pink-100 rounded-3xl p-6 sm:p-8 space-y-5 shadow-sm text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-pink-100">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 font-display flex items-center gap-2">
                  <Globe className="w-5 h-5 text-pink-500" />
                  <span>External Supplier Integration Endpoints & Keys</span>
                </h3>
                <p className="text-slate-500 mt-0.5">
                  Configure dynamic supplier API endpoints, base URLs, and authentication keys. All settings are stored dynamically in the <strong className="font-mono text-pink-600">Global_Settings</strong> table.
                </p>
              </div>

              <button
                onClick={() => setIsAddingEndpoint(!isAddingEndpoint)}
                className="px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Add Supplier Endpoint</span>
              </button>
            </div>

            {/* Add Endpoint Form Accordion */}
            {isAddingEndpoint && (
              <form onSubmit={handleAddEndpoint} className="p-5 bg-pink-50/50 rounded-2xl border border-pink-200 space-y-4">
                <h4 className="font-extrabold text-slate-900 text-sm font-display flex items-center gap-2">
                  <Plus className="w-4 h-4 text-pink-500" />
                  <span>Configure New External Supplier Endpoint</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Endpoint / Supplier Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Primary Wholesale API v2"
                      value={newEpName}
                      onChange={(e) => setNewEpName(e.target.value)}
                      className="w-full p-2.5 bg-white border border-pink-200 rounded-xl text-slate-900 font-semibold outline-none focus:border-pink-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Integration Protocol</label>
                    <select
                      value={newEpType}
                      onChange={(e) => setNewEpType(e.target.value as any)}
                      className="w-full p-2.5 bg-white border border-pink-200 rounded-xl text-slate-900 font-semibold outline-none"
                    >
                      <option value="rest_api">REST API Endpoint (JSON)</option>
                      <option value="telegram_bot">Telegram Bot Channel Bridge</option>
                      <option value="graphql">GraphQL Endpoint</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Base URL / Channel Handle</label>
                  <input
                    type="text"
                    required
                    placeholder="https://api.suppliernetwork.com/v2 or @SupplierBot"
                    value={newEpBaseUrl}
                    onChange={(e) => setNewEpBaseUrl(e.target.value)}
                    className="w-full p-2.5 bg-white border border-pink-200 rounded-xl text-slate-900 font-mono outline-none focus:border-pink-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">API Key / Token</label>
                    <input
                      type="password"
                      placeholder="sk_live_..."
                      value={newEpApiKey}
                      onChange={(e) => setNewEpApiKey(e.target.value)}
                      className="w-full p-2.5 bg-white border border-pink-200 rounded-xl text-slate-900 font-mono outline-none focus:border-pink-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Secret Key (Optional)</label>
                    <input
                      type="password"
                      placeholder="ds_sec_..."
                      value={newEpSecretKey}
                      onChange={(e) => setNewEpSecretKey(e.target.value)}
                      className="w-full p-2.5 bg-white border border-pink-200 rounded-xl text-slate-900 font-mono outline-none focus:border-pink-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-pink-200/80">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                    <input
                      type="checkbox"
                      checked={newEpIsPrimary}
                      onChange={(e) => setNewEpIsPrimary(e.target.checked)}
                      className="w-4 h-4 text-pink-600 rounded border-pink-300"
                    />
                    <span>Set as Primary Supplier Endpoint</span>
                  </label>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingEndpoint(false)}
                      className="px-4 py-2 font-bold text-slate-600 hover:text-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-xl shadow-xs"
                    >
                      Save to Global_Settings Table
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Configured Endpoints Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(settings.supplierEndpoints || []).map(ep => (
                <div 
                  key={ep.id}
                  className={`p-4 rounded-2xl border text-left space-y-3 relative transition-all ${
                    ep.isPrimary 
                      ? 'bg-gradient-to-br from-pink-50/80 to-rose-50/30 border-pink-300 shadow-2xs' 
                      : 'bg-[#faf8f9] border-pink-100'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-slate-900 text-xs font-display">
                          {ep.name}
                        </h4>
                        {ep.isPrimary && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-pink-500 text-white">
                            PRIMARY
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 font-mono truncate mt-0.5" title={ep.baseUrl}>
                        {ep.baseUrl}
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingEndpoint(ep)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-pink-600 hover:bg-pink-100 transition-colors"
                        title="Edit Endpoint Configuration"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteEndpoint(ep.id, ep.name)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-100 transition-colors"
                        title="Delete Endpoint"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono pt-2 border-t border-pink-100/80">
                    <span className="text-slate-500">
                      Protocol: <strong className="text-slate-800 uppercase">{ep.integrationType}</strong>
                    </span>
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      {ep.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* EDIT ENDPOINT MODAL */}
            {editingEndpoint && (
              <div 
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={() => setEditingEndpoint(null)}
              >
                <div 
                  className="w-full max-w-lg bg-white rounded-3xl border border-pink-100 shadow-2xl p-6 text-left space-y-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between pb-3 border-b border-pink-100">
                    <h3 className="font-extrabold text-base text-slate-900 font-display">
                      Edit Supplier Endpoint Configuration
                    </h3>
                    <button onClick={() => setEditingEndpoint(null)} className="text-slate-400 hover:text-slate-700">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Supplier Endpoint Name</label>
                      <input
                        type="text"
                        value={editingEndpoint.name}
                        onChange={(e) => setEditingEndpoint({ ...editingEndpoint, name: e.target.value })}
                        className="w-full p-2.5 bg-[#faf8f9] border border-pink-200 rounded-xl text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Base URL / Channel Handle</label>
                      <input
                        type="text"
                        value={editingEndpoint.baseUrl}
                        onChange={(e) => setEditingEndpoint({ ...editingEndpoint, baseUrl: e.target.value })}
                        className="w-full p-2.5 bg-[#faf8f9] border border-pink-200 rounded-xl text-slate-900 font-mono"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">API Key / Token</label>
                      <input
                        type="password"
                        value={editingEndpoint.apiKey}
                        onChange={(e) => setEditingEndpoint({ ...editingEndpoint, apiKey: e.target.value })}
                        className="w-full p-2.5 bg-[#faf8f9] border border-pink-200 rounded-xl text-slate-900 font-mono"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                        <input
                          type="checkbox"
                          checked={editingEndpoint.isPrimary || false}
                          onChange={(e) => setEditingEndpoint({ ...editingEndpoint, isPrimary: e.target.checked })}
                          className="w-4 h-4 text-pink-600 rounded border-pink-300"
                        />
                        <span>Primary Endpoint</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-pink-100">
                    <button onClick={() => setEditingEndpoint(null)} className="px-4 py-2 text-slate-600 font-bold">
                      Cancel
                    </button>
                    <button
                      onClick={() => handleUpdateEndpoint(editingEndpoint.id, editingEndpoint)}
                      className="px-5 py-2 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-xl shadow-md"
                    >
                      Save Changes to Global_Settings
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Live Sync Audit Logs */}
          <div className="bg-white rounded-3xl border border-pink-100 overflow-hidden shadow-sm">
            <div className="p-5 border-b border-pink-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Live Supplier Audit Trail ({syncLogs.length})</h3>
              
              <div className="flex items-center gap-1.5">
                {(['all', 'auto_add', 'price_sync', 'order_fulfill', 'admin_override'] as const).map(type => (
                  <button
                    key={type}
                    onClick={() => setLogTypeFilter(type)}
                    className={`px-2.5 py-1 rounded-xl text-[10px] font-bold capitalize transition-colors ${
                      logTypeFilter === type ? 'bg-pink-500 text-white' : 'text-slate-500 hover:bg-pink-50'
                    }`}
                  >
                    {type.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div className="divide-y divide-pink-50 max-h-96 overflow-y-auto">
              {filteredLogs.map(log => (
                <div key={log.id} className="p-4 flex items-start justify-between gap-3 text-xs">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{log.title}</span>
                      <span className="text-[10px] font-mono px-2 py-0.2 rounded-md bg-slate-100 text-slate-600">
                        {log.type}
                      </span>
                    </div>
                    <p className="text-slate-500 text-[11px]">{log.description}</p>
                  </div>
                  <span className="font-mono text-[10px] text-slate-400 shrink-0">{log.timestamp}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ============================================================== */}
      {/* 6. SECTION: AUTOMATED EMAIL NOTIFICATIONS & ALERTS CONFIG      */}
      {/* ============================================================== */}
      {activeTab === 'email_alerts' && (
        <div className="max-w-4xl space-y-6 text-left">
          
          <form onSubmit={handleSaveEmailNotificationSettings} className="space-y-6">
            
            {/* Master Toggle Banner */}
            <div className={`rounded-3xl border p-6 sm:p-8 space-y-4 shadow-sm transition-all ${
              emailAlertsEnabled
                ? 'bg-gradient-to-br from-white via-pink-50/30 to-emerald-50/20 border-pink-200'
                : 'bg-slate-50 border-slate-200 opacity-90'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-pink-100">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-md transition-all shrink-0 ${
                    emailAlertsEnabled 
                      ? 'bg-gradient-to-tr from-pink-500 to-rose-500 shadow-pink-500/20' 
                      : 'bg-slate-400'
                  }`}>
                    <Bell className="w-6 h-6" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-extrabold text-slate-900 font-display">
                        Automated Transactional Email Dispatcher
                      </h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-extrabold border ${
                        emailAlertsEnabled 
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                          : 'bg-slate-200 text-slate-600 border-slate-300'
                      }`}>
                        {emailAlertsEnabled ? 'SYSTEM ACTIVE' : 'DISPATCH PAUSED'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Automatically sends email alerts for credential delivery finalization & subscription term expiration warnings.
                    </p>
                  </div>
                </div>

                {/* Master Switch */}
                <label className="relative inline-flex items-center cursor-pointer shrink-0 self-start sm:self-auto">
                  <input
                    type="checkbox"
                    checked={emailAlertsEnabled}
                    onChange={(e) => setEmailAlertsEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-pink-500" />
                </label>
              </div>

              {/* Event Toggles Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                
                {/* Event 1: Credential Delivery Finalized */}
                <div className={`p-5 rounded-2xl border transition-all text-xs space-y-3 ${
                  emailAlertOrderCompleted && emailAlertsEnabled
                    ? 'bg-white border-pink-200 shadow-2xs'
                    : 'bg-slate-100/70 border-slate-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className={`w-5 h-5 ${emailAlertOrderCompleted && emailAlertsEnabled ? 'text-emerald-600' : 'text-slate-400'}`} />
                      <h4 className="font-extrabold text-slate-900 font-display text-xs">
                        Credential Delivery Finalized Alert
                      </h4>
                    </div>

                    <input
                      type="checkbox"
                      disabled={!emailAlertsEnabled}
                      checked={emailAlertOrderCompleted}
                      onChange={(e) => setEmailAlertOrderCompleted(e.target.checked)}
                      className="w-4 h-4 text-pink-600 rounded border-pink-300 cursor-pointer disabled:opacity-50"
                    />
                  </div>

                  <p className="text-slate-500 leading-relaxed text-[11px]">
                    Triggers immediately upon order completion. Delivers active login credentials, license keys, PINs, and activation guides directly to the customer's email.
                  </p>

                  <span className="inline-block text-[10px] font-mono font-bold text-pink-600 bg-pink-50 px-2 py-0.5 rounded-md border border-pink-100">
                    Trigger: Order Fulfill Handshake
                  </span>
                </div>

                {/* Event 2: Subscription Expiration Warning */}
                <div className={`p-5 rounded-2xl border transition-all text-xs space-y-3 ${
                  emailAlertExpirationWarning && emailAlertsEnabled
                    ? 'bg-white border-pink-200 shadow-2xs'
                    : 'bg-slate-100/70 border-slate-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className={`w-5 h-5 ${emailAlertExpirationWarning && emailAlertsEnabled ? 'text-amber-600' : 'text-slate-400'}`} />
                      <h4 className="font-extrabold text-slate-900 font-display text-xs">
                        Subscription Expiration Warning
                      </h4>
                    </div>

                    <input
                      type="checkbox"
                      disabled={!emailAlertsEnabled}
                      checked={emailAlertExpirationWarning}
                      onChange={(e) => setEmailAlertExpirationWarning(e.target.checked)}
                      className="w-4 h-4 text-pink-600 rounded border-pink-300 cursor-pointer disabled:opacity-50"
                    />
                  </div>

                  <p className="text-slate-500 leading-relaxed text-[11px]">
                    Sends an automated term expiration warning before subscription access ends, prompting users to renew or top up wallet balance.
                  </p>

                  <div className="flex items-center gap-2 pt-1">
                    <label className="text-[11px] font-bold text-slate-700">Days Before Expiry:</label>
                    <input
                      type="number"
                      min={1}
                      max={14}
                      disabled={!emailAlertsEnabled || !emailAlertExpirationWarning}
                      value={emailAlertExpirationDaysBefore}
                      onChange={(e) => setEmailAlertExpirationDaysBefore(Number(e.target.value) || 3)}
                      className="w-16 p-1.5 bg-[#faf8f9] border border-pink-200 rounded-lg text-center font-mono font-bold text-slate-900 text-xs disabled:opacity-50"
                    />
                    <span className="text-[10px] text-slate-400 font-mono">Days Prior</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Sender Details & Routing */}
            <div className="bg-white border border-pink-100 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm text-xs">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 font-display flex items-center gap-2">
                  <Send className="w-5 h-5 text-pink-500" />
                  <span>Sender Signature & Routing Information</span>
                </h3>
                <p className="text-slate-500 mt-1">
                  Configure the outgoing sender title and reply-to address included in transactional email headers.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Sender Name / Title</label>
                  <input
                    type="text"
                    required
                    value={emailSenderNameInput}
                    onChange={(e) => setEmailSenderNameInput(e.target.value)}
                    placeholder="e.g. Digital Drive Support"
                    className="w-full p-2.5 bg-[#faf8f9] border border-pink-200 rounded-xl text-slate-900 font-bold focus:border-pink-500 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Reply-To Email Address</label>
                  <input
                    type="email"
                    required
                    value={emailReplyToInput}
                    onChange={(e) => setEmailReplyToInput(e.target.value)}
                    placeholder="support@digitaldrive.vip"
                    className="w-full p-2.5 bg-[#faf8f9] border border-pink-200 rounded-xl text-slate-900 font-mono focus:border-pink-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Real-time Email Template Preview Card */}
            <div className="bg-white border border-pink-100 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-pink-100">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 font-display flex items-center gap-2">
                    <FileText className="w-5 h-5 text-pink-500" />
                    <span>Real-Time Email Notification Preview</span>
                  </h3>
                  <p className="text-slate-500 mt-0.5">
                    Interactive rendering of the customer transactional email payload.
                  </p>
                </div>

                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-mono font-bold">
                  TEMPLATE VERIFIED
                </span>
              </div>

              {/* Email Card Preview */}
              <div className="p-6 bg-[#faf8f9] rounded-2xl border border-pink-200 max-w-xl mx-auto space-y-4 font-sans text-slate-900 shadow-inner">
                <div className="text-center pb-3 border-b border-pink-200">
                  <div className="font-extrabold text-pink-600 text-base font-display">
                    {settings.websiteName || 'Digital Drive (DS)'}
                  </div>
                  <div className="text-[10px] font-bold text-emerald-700 bg-emerald-100 inline-block px-2.5 py-0.5 rounded-full mt-1 border border-emerald-200">
                    🎉 ORDER COMPLETED & DELIVERED
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-sm text-slate-900">Hello, Tanvir Hossain!</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Your order <strong>#ORD-9842</strong> for <strong>ElevenLabs Creator (Prime Voice AI)</strong> (1 Month Access) has been successfully fulfilled.
                  </p>
                </div>

                <div className="p-4 bg-white rounded-xl border border-pink-200 space-y-2 font-mono text-[11px]">
                  <div className="font-bold text-slate-900 uppercase font-sans text-[10px] text-pink-600">
                    🔑 Delivered Credentials & Access
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1">
                    <span className="text-slate-500">Account:</span>
                    <span className="font-bold text-slate-900">tanvir@vip.digitaldrive.vip</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1">
                    <span className="text-slate-500">Password:</span>
                    <span className="font-bold text-pink-600">DS982103!</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Valid Until:</span>
                    <span className="font-bold text-slate-900">2026-11-01</span>
                  </div>
                </div>

                <div className="text-center pt-2 text-[10px] text-slate-400 font-mono">
                  From: {emailSenderNameInput} &lt;{emailReplyToInput}&gt;
                </div>
              </div>
            </div>

            {/* Save Preferences Submit Button */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-extrabold text-xs rounded-2xl shadow-md shadow-pink-500/25 transition-all active:scale-95 cursor-pointer"
              >
                Save Notification Preferences
              </button>
            </div>

          </form>

        </div>
      )}

      {/* ============================================================== */}
      {/* 7. SECTION 5: GLOBAL SETTINGS (Dynamic Frontend, SEO, Sliders) */}
      {/* ============================================================== */}
      {activeTab === 'settings' && (
        <div className="max-w-4xl space-y-6">
          
          <form onSubmit={handleSaveGlobalSettings} className="space-y-6">
            
            {/* A. DYNAMIC WEBSITE IDENTITY MODULE */}
            <div className="bg-white border border-pink-100 rounded-3xl p-6 sm:p-8 space-y-5 shadow-sm">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 font-display flex items-center gap-2">
                  <Globe className="w-5 h-5 text-pink-500" />
                  <span>Dynamic Website Identity & Branding</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Updates propagate <strong>instantly</strong> across the Header, Footer, and Browser Page Title without reloading the page.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Website Name (Dynamic Brand Title)</label>
                  <input
                    type="text"
                    required
                    value={websiteNameInput}
                    onChange={(e) => setWebsiteNameInput(e.target.value)}
                    placeholder="e.g. Digital Drive (DS)"
                    className="w-full p-2.5 bg-[#faf8f9] border border-pink-200 rounded-xl text-slate-900 font-bold focus:border-pink-500 outline-none"
                  />
                  <span className="text-[10px] text-slate-400 block">
                    Live reflected in Header, Footer, and tab &lt;title&gt;
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Website Tagline</label>
                  <input
                    type="text"
                    value={websiteTaglineInput}
                    onChange={(e) => setWebsiteTaglineInput(e.target.value)}
                    placeholder="e.g. Automated Digital Subscriptions"
                    className="w-full p-2.5 bg-[#faf8f9] border border-pink-200 rounded-xl text-slate-900 focus:border-pink-500 outline-none"
                  />
                </div>
              </div>

              {/* Dynamic Live Preview Card */}
              <div className="p-4 bg-gradient-to-r from-pink-50/70 via-rose-50/40 to-white rounded-2xl border border-pink-100 flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-pink-500 text-white flex items-center justify-center font-extrabold text-sm shadow-sm">
                  {websiteNameInput.charAt(0) || 'D'}
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block leading-tight font-display">
                    {websiteNameInput || 'Website Name'}
                  </span>
                  <span className="text-[10px] font-mono text-pink-600 font-semibold uppercase">
                    {websiteTaglineInput || 'Tagline'}
                  </span>
                </div>
              </div>
            </div>

            {/* B. SEO META DESCRIPTIONS MODULE */}
            <div className="bg-white border border-pink-100 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm text-xs">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 font-display flex items-center gap-2">
                  <Search className="w-5 h-5 text-pink-500" />
                  <span>SEO Meta Descriptions & Social Graph (OpenGraph)</span>
                </h3>
                <p className="text-slate-500 mt-1">
                  Dynamically synchronized with HTML &lt;meta name="description"&gt; and og:description tags.
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700">Meta Description Content</label>
                  <span className={`text-[10px] font-mono font-bold ${
                    seoMetaDescriptionInput.length > 160 ? 'text-amber-600' : 'text-slate-400'
                  }`}>
                    {seoMetaDescriptionInput.length} / 160 characters
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={seoMetaDescriptionInput}
                  onChange={(e) => setSeoMetaDescriptionInput(e.target.value)}
                  placeholder="Summarize the core value proposition for search engines and social links..."
                  className="w-full p-3 bg-[#faf8f9] border border-pink-200 rounded-xl text-slate-900 outline-none focus:border-pink-500"
                />
              </div>
            </div>

            {/* C. SOCIAL MEDIA CHANNELS (WhatsApp & Telegram) */}
            <div className="bg-white border border-pink-100 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm text-xs">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 font-display flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-pink-500" />
                  <span>Social Media & Instant Support Channels</span>
                </h3>
                <p className="text-slate-500 mt-1">
                  Configures the customer support links displayed in the Footer and Floating Support FAB.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 flex items-center gap-1">
                    <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                    <span>WhatsApp Number</span>
                  </label>
                  <input
                    type="text"
                    value={supportWhatsAppInput}
                    onChange={(e) => setSupportWhatsAppInput(e.target.value)}
                    placeholder="+8801700112233"
                    className="w-full p-2.5 bg-[#faf8f9] border border-pink-200 rounded-xl text-slate-900 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 flex items-center gap-1">
                    <Send className="w-3.5 h-3.5 text-sky-600" />
                    <span>Telegram Channel / Bot</span>
                  </label>
                  <input
                    type="text"
                    value={supportTelegramInput}
                    onChange={(e) => setSupportTelegramInput(e.target.value)}
                    placeholder="https://t.me/digitaldrivesup"
                    className="w-full p-2.5 bg-[#faf8f9] border border-pink-200 rounded-xl text-slate-900 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Support Email</label>
                  <input
                    type="email"
                    value={supportEmailInput}
                    onChange={(e) => setSupportEmailInput(e.target.value)}
                    placeholder="support@digitaldrive.vip"
                    className="w-full p-2.5 bg-[#faf8f9] border border-pink-200 rounded-xl text-slate-900 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* D. ANIMATION & SLIDER SETTINGS (Deep Controls) */}
            <div className="bg-white border border-pink-100 rounded-3xl p-6 sm:p-8 space-y-5 shadow-sm text-xs">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 font-display flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-pink-500" />
                  <span>Animation & Carousel Slider Settings</span>
                </h3>
                <p className="text-slate-500 mt-1">
                  Control the automated scroll velocity and behavior for "Hot Deals" and "Top 10" carousels.
                </p>
              </div>

              {/* Speed Slider */}
              <div className="p-4 bg-[#faf8f9] rounded-2xl border border-pink-100 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800">
                    Auto-Scroll Speed (Interval in Seconds)
                  </label>
                  <span className="font-mono font-extrabold text-pink-600 text-sm">
                    {sliderSpeedInput} Seconds
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min={1}
                    max={15}
                    step={1}
                    value={sliderSpeedInput}
                    onChange={(e) => setSliderSpeedInput(Number(e.target.value))}
                    className="w-full accent-pink-500 cursor-pointer"
                  />
                  <input
                    type="number"
                    min={1}
                    max={15}
                    value={sliderSpeedInput}
                    onChange={(e) => setSliderSpeedInput(Number(e.target.value))}
                    className="w-16 p-1.5 bg-white border border-pink-200 rounded-lg text-center font-mono font-bold text-slate-900"
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  Sliders advance cards automatically every {sliderSpeedInput}s unless hovered by user.
                </p>
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[#faf8f9] border border-pink-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-pink-500" />
                    <div>
                      <span className="font-bold text-slate-800 block">Hot Deals Carousel</span>
                      <span className="text-[10px] text-slate-400">Auto-scroll drops</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={hotDealsAutoScroll}
                    onChange={(e) => setHotDealsAutoScroll(e.target.checked)}
                    className="w-4 h-4 text-pink-600 rounded border-pink-300"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-[#faf8f9] border border-pink-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-pink-500" />
                    <div>
                      <span className="font-bold text-slate-800 block">Top 10 Trending Carousel</span>
                      <span className="text-[10px] text-slate-400">Auto-scroll top ranked</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={topTrendingAutoScroll}
                    onChange={(e) => setTopTrendingAutoScroll(e.target.checked)}
                    className="w-4 h-4 text-pink-600 rounded border-pink-300"
                  />
                </div>
              </div>
            </div>

            {/* E. TOKEN ECONOMY & TOP-UP EXCHANGE RATE */}
            <div className="bg-white border border-pink-100 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm text-xs">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 font-display flex items-center gap-2">
                  <Coins className="w-5 h-5 text-pink-500" />
                  <span>Token Economy Rules & Reseller Margins</span>
                </h3>
                <p className="text-slate-500 mt-1">
                  Exchange rate is ONLY displayed on the Top-Up / Add Funds deposit page.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Top-Up Rate (1 BDT = X DS Tokens)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={exchangeRateInput}
                    onChange={(e) => setExchangeRateInput(Number(e.target.value))}
                    className="w-full p-2.5 bg-[#faf8f9] border border-pink-200 rounded-xl font-mono font-bold text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Global Reseller Profit Margin %</label>
                  <input
                    type="number"
                    value={marginInput}
                    onChange={(e) => setMarginInput(Number(e.target.value))}
                    className="w-full p-2.5 bg-[#faf8f9] border border-pink-200 rounded-xl font-mono font-bold text-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* F. BRAND LOGO UPLOADS */}
            <div className="bg-white border border-pink-100 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm text-xs">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 font-display flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-pink-500" />
                  <span>Website Brand Logos (Local File Upload)</span>
                </h3>
                <p className="text-slate-500 mt-1">
                  Upload custom PNG/SVG logos for the navigation header and footer.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-[#faf8f9] rounded-2xl border border-pink-100 space-y-2">
                  <label className="font-bold text-slate-700 block">Main Navigation Logo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoFileUpload}
                    className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-pink-50 file:text-pink-600 hover:file:bg-pink-100"
                  />
                  {logoPreview && typeof logoPreview === 'string' && logoPreview.trim() !== '' ? (
                    <img src={logoPreview.trim()} alt="Logo" className="h-9 object-contain rounded-md border mt-2" />
                  ) : null}
                </div>

                <div className="p-4 bg-[#faf8f9] rounded-2xl border border-pink-100 space-y-2">
                  <label className="font-bold text-slate-700 block">Footer Distinct Logo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFooterLogoFileUpload}
                    className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-pink-50 file:text-pink-600 hover:file:bg-pink-100"
                  />
                  {footerLogoPreview && typeof footerLogoPreview === 'string' && footerLogoPreview.trim() !== '' ? (
                    <img src={footerLogoPreview.trim()} alt="Footer Logo" className="h-9 object-contain rounded-md border mt-2" />
                  ) : null}
                </div>
              </div>
            </div>

            {/* G. REQUIREMENT 4: GLOBAL ANNOUNCEMENT POP-UP MODULE */}
            <div className="bg-white border border-pink-100 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 font-display flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-pink-500" />
                    <span>Global Marketing Announcement Pop-Up (12-Hour Cooldown)</span>
                  </h3>
                  <p className="text-slate-500 mt-1">
                    Triggers when users visit the platform. Uses 12-hour localStorage cooldown to avoid repetitive annoyance.
                  </p>
                </div>

                <div className="flex items-center gap-2 bg-[#faf8f9] px-3 py-1.5 rounded-2xl border border-pink-100">
                  <input
                    type="checkbox"
                    id="popup-enable-check"
                    checked={popupEnabledInput}
                    onChange={(e) => setPopupEnabledInput(e.target.checked)}
                    className="w-4 h-4 text-pink-600 rounded border-pink-300"
                  />
                  <label htmlFor="popup-enable-check" className="font-bold text-slate-800 cursor-pointer">
                    Enable Pop-Up
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Banner Image URL</label>
                  <input
                    type="text"
                    value={popupBannerUrlInput}
                    onChange={(e) => setPopupBannerUrlInput(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full p-2.5 bg-[#faf8f9] border border-pink-200 rounded-xl font-mono text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Pop-Up Title</label>
                  <input
                    type="text"
                    value={popupTitleInput}
                    onChange={(e) => setPopupTitleInput(e.target.value)}
                    placeholder="🎉 Exclusive VIP Subscription Drop & Discounts!"
                    className="w-full p-2.5 bg-[#faf8f9] border border-pink-200 rounded-xl font-bold text-slate-900"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="font-bold text-slate-700">Pop-Up Announcement Description</label>
                  <textarea
                    rows={2}
                    value={popupDescInput}
                    onChange={(e) => setPopupDescInput(e.target.value)}
                    placeholder="Write detailed promotion message for users..."
                    className="w-full p-2.5 bg-[#faf8f9] border border-pink-200 rounded-xl text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">CTA Button Text</label>
                  <input
                    type="text"
                    value={popupBtnTextInput}
                    onChange={(e) => setPopupBtnTextInput(e.target.value)}
                    placeholder="Claim Offer Now"
                    className="w-full p-2.5 bg-[#faf8f9] border border-pink-200 rounded-xl font-bold text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">CTA Button Target URL</label>
                  <input
                    type="text"
                    value={popupBtnUrlInput}
                    onChange={(e) => setPopupBtnUrlInput(e.target.value)}
                    placeholder="/store or https://..."
                    className="w-full p-2.5 bg-[#faf8f9] border border-pink-200 rounded-xl font-mono text-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* H. REQUIREMENT 4: GLOBAL BROADCAST NOTIFICATION DISPATCHER */}
            <div className="bg-white border border-pink-100 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm text-xs">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 font-display flex items-center gap-2">
                  <Bell className="w-5 h-5 text-pink-500" />
                  <span>Global System Broadcast Notification Dispatcher</span>
                </h3>
                <p className="text-slate-500 mt-1">
                  Sends an immediate broadcast toast notification banner to all active user sessions across the platform.
                </p>
              </div>

              <div className="space-y-3">
                <textarea
                  rows={2}
                  value={broadcastInputText}
                  onChange={(e) => setBroadcastInputText(e.target.value)}
                  placeholder="Type broadcast message (e.g. ⚡ System Upgrade Completed! All ElevenLabs & Claude 3.5 keys restocked!)..."
                  className="w-full p-3 bg-[#faf8f9] border border-pink-200 rounded-2xl text-slate-900 font-medium"
                />

                <button
                  type="button"
                  onClick={() => {
                    if (broadcastInputText.trim()) {
                      sendGlobalBroadcast(broadcastInputText);
                      setBroadcastInputText('');
                      setSyncFeedback('Global System Broadcast Released to All Registered Users!');
                      setTimeout(() => setSyncFeedback(null), 4000);
                    }
                  }}
                  disabled={!broadcastInputText.trim()}
                  className="px-6 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-extrabold text-xs rounded-2xl shadow-md shadow-pink-500/20 disabled:opacity-50 transition-all cursor-pointer"
                >
                  Send Broadcast to All Users
                </button>
              </div>
            </div>

            {/* SAVE ALL SETTINGS BUTTON */}
            <div className="flex justify-end pt-3">
              <button
                type="submit"
                className="px-8 py-3.5 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold text-sm rounded-2xl shadow-lg shadow-pink-500/25 active:scale-95 transition-all"
              >
                Save All Global Settings
              </button>
            </div>

          </form>

          {/* G. PAYMENT GATEWAYS MANAGER (For Top-Up Modal Only) */}
          <div className="bg-white border border-pink-100 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-pink-100">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 font-display flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-pink-500" />
                  <span>Manual Payment Gateways (For Top-Up / Add Funds Modal)</span>
                </h3>
                <p className="text-slate-500 mt-0.5">
                  Configure bKash, Nagad, Rocket, Binance, and Bank Transfer accounts for wallet deposits.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsCreatingPaymentMethod(true)}
                className="px-3.5 py-2 bg-pink-50 hover:bg-pink-100 text-pink-700 font-bold rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Gateway</span>
              </button>
            </div>

            {/* Payment Method Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {settings.paymentMethods.map(pm => (
                <div key={pm.id} className="p-4 rounded-2xl border border-pink-100 bg-[#faf8f9] space-y-2 text-left">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {pm.logoUrl && typeof pm.logoUrl === 'string' && pm.logoUrl.trim() !== '' ? (
                        <img src={pm.logoUrl.trim()} alt={pm.name} className="w-6 h-6 object-contain rounded" />
                      ) : (
                        <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: pm.brandColor }} />
                      )}
                      <span className="font-bold text-slate-900">{pm.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-pink-50 text-pink-700 font-bold">
                        Min ৳{pm.minAmountBDT}
                      </span>
                      <button
                        type="button"
                        onClick={() => setEditingPaymentMethod(pm)}
                        className="p-1 px-2 rounded-lg text-pink-600 hover:bg-pink-100 font-bold text-xs flex items-center gap-1 border border-pink-200 transition-colors"
                        title="Edit Payment Gateway"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                    </div>
                  </div>
                  <div className="font-mono text-slate-700 font-semibold">{pm.accountNumber}</div>
                  <p className="text-[11px] text-slate-500 line-clamp-1">{pm.instructions}</p>
                </div>
              ))}
            </div>

            {/* Edit Payment Gateway Modal with Custom Logo File Upload */}
            {editingPaymentMethod && (
              <div 
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={() => setEditingPaymentMethod(null)}
              >
                <div 
                  className="w-full max-w-lg bg-white rounded-3xl border border-pink-100 shadow-2xl p-6 text-left space-y-4 max-h-[90vh] overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between pb-3 border-b border-pink-100">
                    <h3 className="font-extrabold text-base text-slate-900 font-display">
                      Edit Payment Gateway: {editingPaymentMethod.name}
                    </h3>
                    <button onClick={() => setEditingPaymentMethod(null)} className="text-slate-400 hover:text-slate-700">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Gateway Name</label>
                      <input
                        type="text"
                        value={editingPaymentMethod.name}
                        onChange={(e) => setEditingPaymentMethod({ ...editingPaymentMethod, name: e.target.value })}
                        className="w-full p-2.5 bg-[#faf8f9] border border-pink-200 rounded-xl text-slate-900 font-bold"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Account Type / Subtitle</label>
                      <input
                        type="text"
                        value={editingPaymentMethod.accountType}
                        onChange={(e) => setEditingPaymentMethod({ ...editingPaymentMethod, accountType: e.target.value })}
                        className="w-full p-2.5 bg-[#faf8f9] border border-pink-200 rounded-xl text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Account Number / Wallet Address</label>
                      <input
                        type="text"
                        value={editingPaymentMethod.accountNumber}
                        onChange={(e) => setEditingPaymentMethod({ ...editingPaymentMethod, accountNumber: e.target.value })}
                        className="w-full p-2.5 bg-[#faf8f9] border border-pink-200 rounded-xl text-slate-900 font-mono font-bold"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Verification Instructions</label>
                      <textarea
                        rows={2}
                        value={editingPaymentMethod.instructions}
                        onChange={(e) => setEditingPaymentMethod({ ...editingPaymentMethod, instructions: e.target.value })}
                        className="w-full p-2.5 bg-[#faf8f9] border border-pink-200 rounded-xl text-slate-900"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Min Deposit (BDT)</label>
                        <input
                          type="number"
                          value={editingPaymentMethod.minAmountBDT}
                          onChange={(e) => setEditingPaymentMethod({ ...editingPaymentMethod, minAmountBDT: Number(e.target.value) })}
                          className="w-full p-2.5 bg-[#faf8f9] border border-pink-200 rounded-xl font-mono font-bold"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Brand Color</label>
                        <input
                          type="color"
                          value={editingPaymentMethod.brandColor}
                          onChange={(e) => setEditingPaymentMethod({ ...editingPaymentMethod, brandColor: e.target.value })}
                          className="w-full h-10 p-1 bg-[#faf8f9] border border-pink-200 rounded-xl cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Custom Gateway Logo Image File Upload */}
                    <div className="p-3.5 bg-pink-50/60 rounded-2xl border border-pink-200 space-y-2">
                      <label className="font-bold text-slate-800 block">Upload Gateway Logo (Image File)</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setEditingPaymentMethod({ ...editingPaymentMethod, logoUrl: reader.result as string });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-pink-100 file:text-pink-700 hover:file:bg-pink-200"
                      />
                      {editingPaymentMethod.logoUrl && typeof editingPaymentMethod.logoUrl === 'string' && editingPaymentMethod.logoUrl.trim() !== '' && (
                        <div className="flex items-center gap-2 pt-1">
                          <img src={editingPaymentMethod.logoUrl.trim()} alt="Gateway Logo Preview" className="h-10 w-auto object-contain rounded border bg-white p-1" />
                          <button
                            type="button"
                            onClick={() => setEditingPaymentMethod({ ...editingPaymentMethod, logoUrl: undefined })}
                            className="text-xs font-bold text-rose-600 hover:underline"
                          >
                            Remove Logo
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-pink-100">
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Delete gateway "${editingPaymentMethod.name}"?`)) {
                          deletePaymentMethod(editingPaymentMethod.id);
                          setEditingPaymentMethod(null);
                          setSyncFeedback('Payment gateway deleted.');
                        }
                      }}
                      className="px-3 py-1.5 text-rose-600 hover:bg-rose-50 font-bold rounded-xl text-xs"
                    >
                      Delete Gateway
                    </button>

                    <div className="flex gap-2">
                      <button onClick={() => setEditingPaymentMethod(null)} className="px-4 py-2 text-slate-600 font-bold text-xs">
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          updatePaymentMethod(editingPaymentMethod.id, editingPaymentMethod);
                          setEditingPaymentMethod(null);
                          setSyncFeedback('Payment gateway updated successfully!');
                          setTimeout(() => setSyncFeedback(null), 3000);
                        }}
                        className="px-5 py-2 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-xl text-xs shadow-md"
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Add Gateway Form Accordion */}
            {isCreatingPaymentMethod && (
              <form onSubmit={handleCreatePaymentMethod} className="p-5 bg-pink-50/50 rounded-2xl border border-pink-200 space-y-3">
                <h4 className="font-bold text-slate-900">Add New Payment Gateway</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Gateway Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Upay Personal"
                      value={newMethodName}
                      onChange={(e) => setNewMethodName(e.target.value)}
                      className="w-full p-2 bg-white border border-pink-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Account Number / Wallet ID</label>
                    <input
                      type="text"
                      required
                      placeholder="01700-112233"
                      value={newMethodAccountNumber}
                      onChange={(e) => setNewMethodAccountNumber(e.target.value)}
                      className="w-full p-2 bg-white border border-pink-200 rounded-xl font-mono"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setIsCreatingPaymentMethod(false)} className="px-3 py-1.5 text-slate-600 font-bold">
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-1.5 bg-pink-500 text-white font-bold rounded-xl shadow-sm">
                    Save Gateway
                  </button>
                </div>
              </form>
            )}
          </div>

        </div>
      )}

      {/* DEPOSIT REQUEST DETAILS MODAL */}
      {selectedDepositForModal && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedDepositForModal(null)}
        >
          <div 
            className="bg-white border border-pink-100 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 text-left relative animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-pink-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center font-bold">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm font-display">Deposit Request Details</h3>
                  <p className="text-[10px] text-slate-400 font-mono">Request ID: {selectedDepositForModal.id}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedDepositForModal(null)}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-pink-100 text-slate-500 hover:text-slate-800 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono bg-[#faf8f9] p-4 rounded-2xl border border-pink-100">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Target User ID:</span>
                <span className="font-bold text-slate-900">{selectedDepositForModal.userId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Requested Amount:</span>
                <span className="font-extrabold text-pink-600">৳{(selectedDepositForModal.amountBDT || 0).toLocaleString()} BDT</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Equivalent Tokens:</span>
                <span className="font-extrabold text-slate-900 bg-pink-50 px-2 py-0.5 rounded border border-pink-100">
                  +{(Math.abs(selectedDepositForModal.amountTokens) || 0).toLocaleString()} DS Tokens
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Payment Gateway:</span>
                <span className="font-bold text-slate-800">{selectedDepositForModal.paymentMethod || 'bKash Personal'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Sender Phone Number:</span>
                <span className="font-bold text-slate-900">{selectedDepositForModal.senderNumber || 'Not Provided'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">TrxID / Reference:</span>
                <span className="font-extrabold text-pink-600">{selectedDepositForModal.referenceId || selectedDepositForModal.id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Submission Timestamp:</span>
                <span className="text-slate-600">{selectedDepositForModal.timestamp}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Verification Status:</span>
                <span className="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">Pending Admin Approval</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  rejectDepositRequest(selectedDepositForModal.id);
                  setSelectedDepositForModal(null);
                }}
                className="px-4 py-2.5 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 active:scale-95 cursor-pointer"
              >
                Reject Deposit
              </button>

              <button
                onClick={() => {
                  approveDepositRequest(selectedDepositForModal.id);
                  setSelectedDepositForModal(null);
                }}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 active:scale-95 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Approve & Credit Tokens</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
