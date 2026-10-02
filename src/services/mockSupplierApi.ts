import { OrderCredential, Product } from '../types';

export interface SupplierProductRaw {
  supplierSku: string;
  name: string;
  category: 'AI Tools' | 'Streaming' | 'VPN & Security' | 'Productivity & Design' | 'Gaming & Utilities' | 'Developer Tools';
  description: string;
  warranty?: string | null; // Direct warranty from supplier
  wholesalePriceBDT: number;
  stockCount: number;
  format: 'email_password' | 'license_key' | 'invite_link' | 'session_cookie';
  deliveryMechanism?: 'premade_credentials' | 'personal_upgrade'; // a) Pre-made credentials vs b) Personal Upgrades
  requiresUserEmail?: boolean; // When true, system prompts: "Enter your email for the upgrade"
  upgradePromptLabel?: string; // e.g. "Enter your email for the upgrade"
  brandColor: string;
  iconName: string;
  autoFulfillSpeedSeconds: number;
}

export interface PaginatedSupplierResponse {
  products: SupplierProductRaw[];
  page: number;
  limit: number;
  totalProducts: number;
  totalPages: number;
  total_count?: number;
  total_pages?: number;
  next_page?: number | null;
  cursor?: string | null;
  hasMore: boolean;
  has_more?: boolean;
}

// Unlimited Master Catalog Database (Comprehensive 35+ Subscriptions Catalog)
export const initialSupplierMasterCatalog: SupplierProductRaw[] = [
  {
    supplierSku: 'SUP-ELEVENLABS-CREATOR',
    name: 'ElevenLabs Creator (Prime Voice AI & Voice Cloning)',
    category: 'AI Tools',
    description: '100,000 characters per month, Professional Voice Cloning, instant text-to-speech API access, and commercial license.',
    warranty: '30 Days Full Replacement Warranty',
    wholesalePriceBDT: 1950,
    stockCount: 35,
    format: 'email_password',
    brandColor: '#101010',
    iconName: 'Bot',
    autoFulfillSpeedSeconds: 2,
  },
  {
    supplierSku: 'SUP-N8N-CLOUD-PRO',
    name: 'n8n Cloud Automation Pro (Workflow Engine)',
    category: 'Developer Tools',
    description: '10,000 monthly workflow executions, 50 active workflows, AI Agent nodes, enterprise webhook triggers, and cloud backup.',
    warranty: '30 Days Instant Replacement Warranty',
    wholesalePriceBDT: 1750,
    stockCount: 20,
    format: 'license_key',
    brandColor: '#ea4b71',
    iconName: 'Code2',
    autoFulfillSpeedSeconds: 2,
  },
  {
    supplierSku: 'SUP-FRAMER-PRO-1YR',
    name: 'Framer Pro (Interactive Web & React Builder)',
    category: 'Productivity & Design',
    description: 'Unlimited published sites, custom domain hosting, CMS collections, 30-day version history, and real-time multiplayer editing.',
    warranty: '1 Year Official Team Member Warranty',
    wholesalePriceBDT: 1650,
    stockCount: 25,
    format: 'invite_link',
    brandColor: '#0055ff',
    iconName: 'Palette',
    autoFulfillSpeedSeconds: 2,
  },
  {
    supplierSku: 'SUP-GRANOLA-AI-PRO',
    name: 'Granola AI Meeting Notes Pro',
    category: 'Productivity & Design',
    description: 'AI-powered meeting transcription, customized summary templates, Slack/Notion sync, and automatic action item extraction.',
    warranty: '30 Days Replacement Warranty',
    wholesalePriceBDT: 1250,
    stockCount: 15,
    format: 'email_password',
    brandColor: '#f97316',
    iconName: 'Sparkles',
    autoFulfillSpeedSeconds: 1,
  },
  {
    supplierSku: 'SUP-COURSERA-PLUS-01',
    name: 'Coursera Plus (Specialization & Certificates)',
    category: 'Developer Tools',
    description: 'Unlimited access to 7,000+ world-class courses, hands-on projects, and job-ready certificate programs from top universities & companies.',
    warranty: '1 Year Official University Access',
    wholesalePriceBDT: 1500,
    stockCount: 0, // Out of Stock at supplier end
    format: 'invite_link',
    brandColor: '#0056D2',
    iconName: 'Layers',
    autoFulfillSpeedSeconds: 2,
  },
  {
    supplierSku: 'SUP-LOVABLE-DEV',
    name: 'Lovable.dev Full-Stack Builder Pro',
    category: 'Developer Tools',
    description: 'Full-stack AI app generation, Supabase & GitHub real-time synchronizer, custom components, and unlimited project exports.',
    warranty: '30 Days Full Replacement Warranty',
    wholesalePriceBDT: 1850,
    stockCount: 18,
    format: 'invite_link',
    brandColor: '#f43f5e',
    iconName: 'Code2',
    autoFulfillSpeedSeconds: 2,
  },
  {
    supplierSku: 'SUP-V0-DEV-PRO',
    name: 'v0.dev by Vercel Premium',
    category: 'Developer Tools',
    description: 'Generative UI development with React & Tailwind, custom design tokens, unlimited block generation, and Next.js copy/paste.',
    warranty: '30 Days Pro Account Replacement',
    wholesalePriceBDT: 1900,
    stockCount: 22,
    format: 'invite_link',
    brandColor: '#000000',
    iconName: 'Cpu',
    autoFulfillSpeedSeconds: 2,
  },
  {
    supplierSku: 'SUP-PERPLEXITY-PRO',
    name: 'Perplexity AI Pro (Claude 3.7 & Deep Research)',
    category: 'AI Tools',
    description: 'Unlimited Pro searches with Claude 3.7 Sonnet, GPT-4o, Deep Research analysis, and file uploads up to 500MB.',
    warranty: '30 Days Full Replacement Warranty',
    wholesalePriceBDT: 1700,
    stockCount: 40,
    format: 'email_password',
    brandColor: '#22b8cf',
    iconName: 'Sparkles',
    autoFulfillSpeedSeconds: 1,
  },
  {
    supplierSku: 'SUP-RUNWAY-GEN3',
    name: 'Runway Gen-3 Alpha Video Creator',
    category: 'AI Tools',
    description: 'High-fidelity cinematic text-to-video, image-to-video, Motion Brush 4K upscaler, and director mode camera controls.',
    warranty: null,
    wholesalePriceBDT: 2300,
    stockCount: 0, // Out of stock on supplier
    format: 'email_password',
    brandColor: '#6366f1',
    iconName: 'Film',
    autoFulfillSpeedSeconds: 3,
  },
  {
    supplierSku: 'SUP-GPT-PLUS-01',
    name: 'ChatGPT Plus (GPT-4o & Canvas)',
    category: 'AI Tools',
    description: '1 Month Private Dedicated OpenAI ChatGPT Plus account with GPT-4o, DALL·E 3, and Advanced Voice access.',
    warranty: '30 Days Full Replacement Warranty',
    wholesalePriceBDT: 1800,
    stockCount: 42,
    format: 'email_password',
    brandColor: '#10a37f',
    iconName: 'Bot',
    autoFulfillSpeedSeconds: 2,
  },
  {
    supplierSku: 'SUP-NFLX-4K-01',
    name: 'Netflix Premium Ultra HD 4K (Private Profile)',
    category: 'Streaming',
    description: '1 Month 4K HDR Private Profile with individual PIN lock. Works across TV, Mobile, PC & Console.',
    warranty: '30 Days Instant Replacement Warranty',
    wholesalePriceBDT: 320,
    stockCount: 88,
    format: 'email_password',
    brandColor: '#e50914',
    iconName: 'Tv',
    autoFulfillSpeedSeconds: 1,
  },
  {
    supplierSku: 'SUP-CLAUDE-PRO-01',
    name: 'Claude Pro (Anthropic Sonnet 3.7)',
    category: 'AI Tools',
    description: '5x more usage on Claude 3.7 Sonnet, Artifacts workbench, priority access during peak traffic.',
    warranty: '30 Days Pro Account Replacement',
    wholesalePriceBDT: 2100,
    stockCount: 24,
    format: 'email_password',
    brandColor: '#d97706',
    iconName: 'Cpu',
    autoFulfillSpeedSeconds: 3,
  },
  {
    supplierSku: 'SUP-MIDJOURNEY-STD',
    name: 'Midjourney AI Standard Plan',
    category: 'AI Tools',
    description: '15 Hours Fast GPU generation, unlimited Relax generation, Discord direct access & web app alpha.',
    warranty: null,
    wholesalePriceBDT: 2400,
    stockCount: 0,
    format: 'invite_link',
    brandColor: '#8b5cf6',
    iconName: 'Sparkles',
    autoFulfillSpeedSeconds: 3,
  },
  {
    supplierSku: 'SUP-CURSOR-PRO',
    name: 'Cursor AI Pro (Unlimited Fast Requests)',
    category: 'Developer Tools',
    description: '500 fast Claude 3.7 / GPT-4o requests, unlimited slow requests, composer multi-file editing.',
    warranty: '30 Days Full Replacement Warranty',
    wholesalePriceBDT: 1950,
    stockCount: 30,
    format: 'email_password',
    brandColor: '#000000',
    iconName: 'Code2',
    autoFulfillSpeedSeconds: 2,
  },
  {
    supplierSku: 'SUP-SPOTIFY-IND-01',
    name: 'Spotify Premium Individual (Ad-free)',
    category: 'Streaming',
    description: 'Lossless audio streaming, unlimited skips, offline download on 5 devices, personal email activation.',
    warranty: '6 Months Guaranteed Validity Warranty',
    wholesalePriceBDT: 190,
    stockCount: 150,
    format: 'invite_link',
    deliveryMechanism: 'personal_upgrade',
    requiresUserEmail: true,
    upgradePromptLabel: 'Enter your Spotify account email for the upgrade',
    brandColor: '#1db954',
    iconName: 'Music',
    autoFulfillSpeedSeconds: 1,
  },
  {
    supplierSku: 'SUP-NFLX-PERSONAL',
    name: 'Netflix Personal Account Upgrade (1 Month)',
    category: 'Streaming',
    description: 'Direct VIP activation on your personal existing Netflix email account. No password required.',
    warranty: '30 Days Instant Replacement Warranty',
    wholesalePriceBDT: 420,
    stockCount: 65,
    format: 'invite_link',
    deliveryMechanism: 'personal_upgrade',
    requiresUserEmail: true,
    upgradePromptLabel: 'Enter your email for the upgrade',
    brandColor: '#e50914',
    iconName: 'Tv',
    autoFulfillSpeedSeconds: 2,
  },
  {
    supplierSku: 'SUP-NORDVPN-1YR',
    name: 'NordVPN Complete Plan (1 Year)',
    category: 'VPN & Security',
    description: 'High-speed encrypted servers in 111 countries, Threat Protection Pro, Dark Web monitor & NordPass.',
    warranty: '1 Year Official License Warranty',
    wholesalePriceBDT: 950,
    stockCount: 34,
    format: 'license_key',
    deliveryMechanism: 'premade_credentials',
    requiresUserEmail: false,
    brandColor: '#4687ff',
    iconName: 'ShieldCheck',
    autoFulfillSpeedSeconds: 1,
  },
  {
    supplierSku: 'SUP-CANVA-PRO-1YR',
    name: 'Canva Pro Enterprise Team Member (1 Year)',
    category: 'Productivity & Design',
    description: '100M+ premium stock photos, Magic Studio AI tools, brand kits, background remover and cloud storage.',
    warranty: '1 Year Direct Team Slot Warranty',
    wholesalePriceBDT: 220,
    stockCount: 210,
    format: 'invite_link',
    deliveryMechanism: 'personal_upgrade',
    requiresUserEmail: true,
    upgradePromptLabel: 'Enter your Canva account email for team upgrade',
    brandColor: '#00c4cc',
    iconName: 'Palette',
    autoFulfillSpeedSeconds: 2,
  },
  {
    supplierSku: 'SUP-YOUTUBE-PREM',
    name: 'YouTube Premium & Music (Family Slot)',
    category: 'Streaming',
    description: 'Ad-free playback, background play, 1080p Enhanced Bitrate, and complete YouTube Music Premium.',
    warranty: null,
    wholesalePriceBDT: 160,
    stockCount: 75,
    format: 'invite_link',
    deliveryMechanism: 'personal_upgrade',
    requiresUserEmail: true,
    upgradePromptLabel: 'Enter your Google/YouTube email for the upgrade',
    brandColor: '#ff0000',
    iconName: 'PlayCircle',
    autoFulfillSpeedSeconds: 1,
  },
  {
    supplierSku: 'SUP-PRIME-VIDEO-01',
    name: 'Amazon Prime Video (4K HDR Private Slot)',
    category: 'Streaming',
    description: 'Full UHD library access, Prime Originals, personal profile lock, 1 Month guaranteed validity.',
    warranty: '30 Days Slot Replacement Guarantee',
    wholesalePriceBDT: 140,
    stockCount: 60,
    format: 'email_password',
    brandColor: '#00a8e1',
    iconName: 'Film',
    autoFulfillSpeedSeconds: 1,
  },
  {
    supplierSku: 'SUP-GITHUB-COPILOT',
    name: 'GitHub Copilot Individual (1 Year)',
    category: 'Developer Tools',
    description: 'Real-time AI code completions in VS Code / JetBrains, Copilot Chat, multi-language context engine.',
    warranty: '1 Year Activation Guarantee',
    wholesalePriceBDT: 2800,
    stockCount: 18,
    format: 'invite_link',
    brandColor: '#24292e',
    iconName: 'Code2',
    autoFulfillSpeedSeconds: 4,
  },
  {
    supplierSku: 'SUP-ADOBE-CC-ALL',
    name: 'Adobe Creative Cloud All Apps (1 Month)',
    category: 'Productivity & Design',
    description: 'Photoshop, Illustrator, Premiere Pro, After Effects, 100GB Cloud, 1000 generative AI credits.',
    warranty: '30 Days Guaranteed Cloud Warranty',
    wholesalePriceBDT: 1450,
    stockCount: 22,
    format: 'invite_link',
    brandColor: '#ff0000',
    iconName: 'Layers',
    autoFulfillSpeedSeconds: 2,
  },
  {
    supplierSku: 'SUP-SURFSHARK-1YR',
    name: 'Surfshark VPN Unlimited Devices (1 Year)',
    category: 'VPN & Security',
    description: 'Unlimited simultaneous connections, CleanWeb ad blocker, MultiHop servers and WireGuard protocol.',
    warranty: '1 Year License Key Warranty',
    wholesalePriceBDT: 720,
    stockCount: 45,
    format: 'license_key',
    brandColor: '#18c9b3',
    iconName: 'Lock',
    autoFulfillSpeedSeconds: 1,
  },
  {
    supplierSku: 'SUP-DISNEY-PLUS-4K',
    name: 'Disney+ Premium 4K UHD (Private Slot)',
    category: 'Streaming',
    description: 'Marvel, Star Wars, Pixar, and Disney originals in IMAX Enhanced 4K with Dolby Atmos audio.',
    warranty: '30 Days Replacement Warranty',
    wholesalePriceBDT: 280,
    stockCount: 40,
    format: 'email_password',
    brandColor: '#113ccf',
    iconName: 'Tv',
    autoFulfillSpeedSeconds: 1,
  },
  {
    supplierSku: 'SUP-CRUNCHYROLL-MEGA',
    name: 'Crunchyroll Mega Fan (1 Year)',
    category: 'Streaming',
    description: 'Simulcast anime series from Japan, 1080p stream on 4 devices at once, offline downloads & manga catalog.',
    warranty: '1 Year Guaranteed Validity',
    wholesalePriceBDT: 480,
    stockCount: 65,
    format: 'invite_link',
    brandColor: '#f47521',
    iconName: 'PlayCircle',
    autoFulfillSpeedSeconds: 1,
  },
  {
    supplierSku: 'SUP-EXPRESSVPN-1YR',
    name: 'ExpressVPN TrustedServer (1 Year Key)',
    category: 'VPN & Security',
    description: 'Ultra-fast Lightway protocol, servers in 105 countries, split tunneling, 8 simultaneous devices.',
    warranty: '1 Year Official Activation Guarantee',
    wholesalePriceBDT: 1200,
    stockCount: 0,
    format: 'license_key',
    brandColor: '#da3c47',
    iconName: 'ShieldCheck',
    autoFulfillSpeedSeconds: 1,
  },
  {
    supplierSku: 'SUP-FIGMA-PRO',
    name: 'Figma Professional Team Seat (1 Year)',
    category: 'Productivity & Design',
    description: 'Unlimited Figma files, version history, shared design system libraries, FigJam whiteboard collaboration.',
    warranty: '1 Year Seat Warranty',
    wholesalePriceBDT: 1600,
    stockCount: 15,
    format: 'invite_link',
    brandColor: '#a259ff',
    iconName: 'Palette',
    autoFulfillSpeedSeconds: 2,
  },
  {
    supplierSku: 'SUP-JETBRAINS-ALL',
    name: 'JetBrains All Products Pack (1 Year License)',
    category: 'Developer Tools',
    description: 'IntelliJ IDEA Ultimate, PyCharm, WebStorm, PhpStorm, GoLand, CLion, Rider, and ReSharper tools.',
    warranty: '1 Year Educational / Commercial License',
    wholesalePriceBDT: 2200,
    stockCount: 12,
    format: 'license_key',
    brandColor: '#000000',
    iconName: 'Code2',
    autoFulfillSpeedSeconds: 3,
  },
  {
    supplierSku: 'SUP-DISCORD-NITRO',
    name: 'Discord Nitro (3 Months Boost)',
    category: 'Gaming & Utilities',
    description: '500MB file uploads, custom emoji anywhere, HD streaming, 2 server boosts, animated avatar profile.',
    warranty: null,
    wholesalePriceBDT: 380,
    stockCount: 55,
    format: 'invite_link',
    brandColor: '#5865f2',
    iconName: 'Gamepad2',
    autoFulfillSpeedSeconds: 1,
  },
  {
    supplierSku: 'SUP-TRADINGVIEW-PRO',
    name: 'TradingView Pro+ Premium Account (1 Month)',
    category: 'Gaming & Utilities',
    description: '4 charts per tab, 10 indicators per chart, real-time volume profile, seconds interval bars.',
    warranty: '30 Days Full Replacement Warranty',
    wholesalePriceBDT: 850,
    stockCount: 0,
    format: 'email_password',
    brandColor: '#2962ff',
    iconName: 'Activity',
    autoFulfillSpeedSeconds: 2,
  },
  {
    supplierSku: 'SUP-GRAMMARLY-PREM',
    name: 'Grammarly Premium (1 Year Access)',
    category: 'Productivity & Design',
    description: 'Full sentence rewrites, tone suggestions, plagiarism detector, AI generative writing assistance.',
    warranty: '1 Year Shared Slot Guarantee',
    wholesalePriceBDT: 450,
    stockCount: 70,
    format: 'email_password',
    brandColor: '#15c39a',
    iconName: 'Sparkles',
    autoFulfillSpeedSeconds: 1,
  },
  {
    supplierSku: 'SUP-APPLE-MUSIC-1YR',
    name: 'Apple Music Family Slot (1 Year)',
    category: 'Streaming',
    description: 'Spatial Audio with Dolby Atmos, Lossless audio up to 24-bit/192kHz, 100M+ songs with zero ads.',
    warranty: '1 Year Family Member Guarantee',
    wholesalePriceBDT: 360,
    stockCount: 50,
    format: 'invite_link',
    brandColor: '#fa2d48',
    iconName: 'Music',
    autoFulfillSpeedSeconds: 1,
  },
  {
    supplierSku: 'SUP-CAPCUT-PRO',
    name: 'CapCut Pro Desktop & Mobile (1 Year)',
    category: 'Productivity & Design',
    description: 'AI video upscaler, automatic captions, camera tracking, premium effects, zero watermark export.',
    warranty: '1 Year License Warranty',
    wholesalePriceBDT: 550,
    stockCount: 60,
    format: 'email_password',
    brandColor: '#000000',
    iconName: 'Film',
    autoFulfillSpeedSeconds: 2,
  },
  {
    supplierSku: 'SUP-MICROSOFT-365',
    name: 'Microsoft 365 + 1TB OneDrive Cloud (1 Year)',
    category: 'Productivity & Design',
    description: 'Word, Excel, PowerPoint, Outlook, OneNote on 5 devices, plus 1TB secure cloud storage.',
    warranty: '1 Year Official Cloud Warranty',
    wholesalePriceBDT: 680,
    stockCount: 38,
    format: 'email_password',
    brandColor: '#d83b01',
    iconName: 'Layers',
    autoFulfillSpeedSeconds: 2,
  }
];

class MockSupplierApiService {
  private supplierCatalog: SupplierProductRaw[] = [...initialSupplierMasterCatalog];
  private currentSupplierBalanceBDT = 48500; // Starting wholesale pool balance in Taka

  public getSupplierBalance(): number {
    return this.currentSupplierBalanceBDT;
  }

  public depositSupplierBalance(amountBDT: number): number {
    this.currentSupplierBalanceBDT += amountBDT;
    return this.currentSupplierBalanceBDT;
  }

  // Pre-flight Fund Check API Endpoint (GET /balance)
  public checkSupplierBalance(requiredPriceBDT?: number): {
    hasSufficientBalance: boolean;
    currentBalanceBDT: number;
    requiredBDT: number;
  } {
    const reqPrice = requiredPriceBDT || 0;
    return {
      hasSufficientBalance: this.currentSupplierBalanceBDT >= reqPrice,
      currentBalanceBDT: this.currentSupplierBalanceBDT,
      requiredBDT: reqPrice
    };
  }

  // UNLIMITED RAW CATALOG: Returns ALL items in database without hard-coded limits
  public getRawCatalog(): SupplierProductRaw[] {
    return [...this.supplierCatalog];
  }

  // DYNAMIC PAGINATION ENDPOINT: Allows client to paginate through unlimited products
  public getPaginatedCatalog(page: number = 1, limit: number = 10): PaginatedSupplierResponse {
    const totalProducts = this.supplierCatalog.length;
    const totalPages = Math.ceil(totalProducts / limit) || 1;
    const safePage = Math.max(1, Math.min(page, totalPages));
    const startIndex = (safePage - 1) * limit;
    const products = this.supplierCatalog.slice(startIndex, startIndex + limit);

    return {
      products,
      page: safePage,
      limit,
      totalProducts,
      totalPages,
      hasMore: safePage < totalPages,
    };
  }

  // UNLIMITED PAGINATION TRAVERSAL HELPER: Fetches all pages until no items remain
  public async fetchAllProductsUnlimited(): Promise<SupplierProductRaw[]> {
    let allProducts: SupplierProductRaw[] = [];
    let currentPage = 1;
    const pageSize = 10;
    let hasMore = true;

    while (hasMore) {
      const pageData = this.getPaginatedCatalog(currentPage, pageSize);
      const items = pageData?.products || [];
      if (items.length === 0) break;

      allProducts = allProducts.concat(items);
      hasMore = Boolean(pageData.hasMore ?? pageData.has_more ?? (currentPage < pageData.totalPages));
      currentPage += 1;

      // Yield slightly to prevent blocking UI
      await new Promise(r => setTimeout(r, 15));
    }

    // REQUIRED SYSTEM LOG
    console.log("Total products fetched:", allProducts.length);
    return allProducts;
  }

  // Simulate wholesale supplier introducing a new product
  public pushNewSupplierProduct(product: SupplierProductRaw): void {
    this.supplierCatalog.unshift(product);
  }

  // Simulate stock depletion or update at supplier end
  public updateSupplierStock(sku: string, newStock: number): void {
    const item = this.supplierCatalog.find(p => p.supplierSku === sku);
    if (item) {
      item.stockCount = Math.max(0, newStock);
    }
  }

  // Quick helper to toggle in-stock / out-of-stock for testing real-time sync
  public toggleStockForSku(sku: string): number {
    const item = this.supplierCatalog.find(p => p.supplierSku === sku);
    if (item) {
      item.stockCount = item.stockCount > 0 ? 0 : 50;
      return item.stockCount;
    }
    return 0;
  }

  // Simulate wholesale price fluctuation
  public updateSupplierPrice(sku: string, newPriceBDT: number): void {
    const item = this.supplierCatalog.find(p => p.supplierSku === sku);
    if (item) {
      item.wholesalePriceBDT = newPriceBDT;
    }
  }

  // Automated instant Order Fulfillment via API
  public async fulfillOrder(
    sku: string, 
    customerEmail: string,
    customerName: string,
    options?: { targetUserEmail?: string }
  ): Promise<{
    success: boolean;
    supplierOrderId: string;
    deductedBDT: number;
    remainingSupplierBalanceBDT: number;
    credentials?: OrderCredential;
    errorMessage?: string;
  }> {
    const item = this.supplierCatalog.find(p => p.supplierSku === sku);
    if (!item) {
      return {
        success: false,
        supplierOrderId: '',
        deductedBDT: 0,
        remainingSupplierBalanceBDT: this.currentSupplierBalanceBDT,
        errorMessage: 'Product SKU not found on Supplier endpoint.',
      };
    }

    if (item.stockCount <= 0) {
      return {
        success: false,
        supplierOrderId: '',
        deductedBDT: 0,
        remainingSupplierBalanceBDT: this.currentSupplierBalanceBDT,
        errorMessage: 'Item is currently Out of Stock.',
      };
    }

    if (this.currentSupplierBalanceBDT < item.wholesalePriceBDT) {
      return {
        success: false,
        supplierOrderId: '',
        deductedBDT: 0,
        remainingSupplierBalanceBDT: this.currentSupplierBalanceBDT,
        errorMessage: 'Insufficient Reseller Account Balance. Admin refill required.',
      };
    }

    // Deduct stock & supplier balance
    item.stockCount -= 1;
    this.currentSupplierBalanceBDT -= item.wholesalePriceBDT;

    // Simulate realistic API network latency
    const delay = (item.autoFulfillSpeedSeconds || 1) * 700;
    await new Promise(res => setTimeout(res, delay));

    const randomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    const expiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Generate dynamic authentic credentials based on format
    let credentials: OrderCredential;

    if (item.deliveryMechanism === 'personal_upgrade' || options?.targetUserEmail) {
      const upgradeEmail = options?.targetUserEmail || customerEmail;
      credentials = {
        accountEmail: upgradeEmail,
        inviteLink: `https://digitaldrive.vip/accept-team-invite?token=ds_inv_${randomId}_${Date.now()}`,
        expiryDate,
        instructions: `1. Direct automated personal upgrade activated for: ${upgradeEmail}.\n2. Click your unique VIP Invitation Link.\n3. Open your application to confirm active VIP/Premium status.`
      };
    } else if (item.format === 'email_password') {
      const sanitizedName = customerName.toLowerCase().replace(/[^a-z0-9]/g, '');
      credentials = {
        accountEmail: `ds_${sanitizedName || 'user'}_${randomId.toLowerCase()}@digitaldrive.vip`,
        password: `DS#Pass${Math.floor(1000 + Math.random() * 9000)}!`,
        profilePin: `${Math.floor(1000 + Math.random() * 9000)}`,
        expiryDate,
        instructions: `1. Log in at official app/site using provided email & password.\n2. Select Profile [Slot ${Math.floor(1 + Math.random() * 4)}] and enter PIN.\n3. Do not alter password or family sharing settings.`
      };
    } else if (item.format === 'license_key') {
      const seg1 = Math.random().toString(36).substring(2, 6).toUpperCase();
      const seg2 = Math.random().toString(36).substring(2, 6).toUpperCase();
      const seg3 = Math.random().toString(36).substring(2, 6).toUpperCase();
      const seg4 = Math.random().toString(36).substring(2, 6).toUpperCase();
      credentials = {
        licenseKey: `DS-${seg1}-${seg2}-${seg3}-${seg4}`,
        expiryDate,
        instructions: `1. Download the official client app.\n2. Open Settings -> Subscription / Activation.\n3. Paste your DS License Key and click Activate.`
      };
    } else if (item.format === 'invite_link') {
      credentials = {
        inviteLink: `https://digitaldrive.vip/accept-team-invite?token=ds_inv_${randomId}_${Date.now()}`,
        expiryDate,
        instructions: `1. Click your unique VIP Invitation Link.\n2. Sign in with your personal existing account (${customerEmail}).\n3. Accept the premium team/family invitation to upgrade immediately.`
      };
    } else {
      credentials = {
        sessionCookie: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ds_${randomId}_session_token_valid`,
        expiryDate,
        instructions: 'Import cookie with DS Chrome Extension to access premium session.'
      };
    }

    return {
      success: true,
      supplierOrderId: `SUP-ORD-${Date.now().toString().slice(-6)}-${randomId}`,
      deductedBDT: item.wholesalePriceBDT,
      remainingSupplierBalanceBDT: this.currentSupplierBalanceBDT,
      credentials
    };
  }
}

export const supplierApi = new MockSupplierApiService();
