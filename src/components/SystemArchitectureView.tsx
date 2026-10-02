import React, { useState } from 'react';
import { 
  Server, 
  Database, 
  Layers, 
  Workflow,
  Copy,
  Check
} from 'lucide-react';

export const SystemArchitectureView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'stack' | 'schema' | 'flow' | 'layout'>('stack');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const sqlSchemaCode = `-- ==========================================================
-- DIGITAL DRIVE (DS) - PRODUCTION POSTGRESQL DATABASE SCHEMA
-- ==========================================================

-- 1. Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(32) DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'moderator')),
    token_balance NUMERIC(14, 2) DEFAULT 0.00 NOT NULL CHECK (token_balance >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Products Master Catalog
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_sku VARCHAR(128) UNIQUE, -- Nullable for manual non-API products
    is_api_product BOOLEAN DEFAULT true NOT NULL,
    title VARCHAR(255) NOT NULL,
    original_supplier_title VARCHAR(255),
    category VARCHAR(64) NOT NULL,
    description TEXT,
    cover_image_url TEXT,
    brand_color VARCHAR(32) DEFAULT '#ec4899',
    icon_name VARCHAR(64) DEFAULT 'Sparkles',
    stock_count INT DEFAULT 0 NOT NULL,
    wholesale_price_bdt NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    profit_margin_percent NUMERIC(6, 2) DEFAULT 35.00 NOT NULL,
    price_ds_tokens NUMERIC(12, 2) NOT NULL,
    credential_format VARCHAR(64) DEFAULT 'email_password' CHECK (credential_format IN ('email_password', 'license_key', 'invite_link', 'session_cookie')),
    delivery_type VARCHAR(32) DEFAULT 'instant_api' CHECK (delivery_type IN ('instant_api', 'manual_custom')),
    is_hot_deal BOOLEAN DEFAULT false,
    discount_percent INT DEFAULT 0,
    show_discount_badge BOOLEAN DEFAULT true, -- Admin individual toggle for Save X% badge
    custom_discount_label VARCHAR(64), -- Custom badge label e.g. "Save 30%"
    sales_count INT DEFAULT 0,
    rating NUMERIC(3, 2) DEFAULT 5.00,
    is_overridden BOOLEAN DEFAULT false,
    status VARCHAR(32) DEFAULT 'active' CHECK (status IN ('active', 'out_of_stock', 'disabled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Product Duration Pricing Variants (1 Month, 3 Months, 12 Months)
CREATE TABLE product_duration_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    label VARCHAR(128) NOT NULL, -- e.g. "1 Month Access", "12 Months VIP"
    duration_months INT NOT NULL,
    price_ds_tokens NUMERIC(12, 2) NOT NULL,
    discount_tag VARCHAR(64)
);

-- 4. Orders Table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(64) UNIQUE NOT NULL, -- e.g. "ORD-9821"
    user_id UUID REFERENCES users(id) ON DELETE RESTRICT,
    product_id UUID REFERENCES products(id) ON DELETE RESTRICT,
    variant_label VARCHAR(128) NOT NULL,
    price_ds_tokens NUMERIC(12, 2) NOT NULL,
    price_bdt NUMERIC(10, 2) NOT NULL,
    status VARCHAR(32) DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed', 'refunded')),
    delivery_type VARCHAR(32) NOT NULL,
    supplier_order_id VARCHAR(128),
    supplier_deducted_bdt NUMERIC(10, 2),
    failure_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 5. Secure Credentials Vault (Encrypted At Rest)
CREATE TABLE order_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
    account_email VARCHAR(255),
    password_encrypted TEXT, -- AES-256-GCM cipher text
    license_key_encrypted TEXT,
    profile_pin VARCHAR(32),
    invite_link TEXT,
    session_cookie_encrypted TEXT,
    expiry_date DATE NOT NULL,
    instructions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. DS Token Wallet Transactions (Top-ups)
CREATE TABLE token_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE RESTRICT,
    amount_bdt NUMERIC(12, 2) NOT NULL,
    amount_tokens NUMERIC(12, 2) NOT NULL,
    exchange_rate NUMERIC(8, 4) NOT NULL, -- 1 BDT = X Tokens
    payment_gateway VARCHAR(64) NOT NULL, -- 'bKash', 'Nagad', 'Rocket', 'Card', 'Crypto'
    transaction_reference VARCHAR(128) NOT NULL,
    status VARCHAR(32) DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Global Settings Module (Dynamic Frontend, SEO, Social, Sliders & API Bridge)
CREATE TABLE global_settings (
    id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1), -- Single-row configuration singleton pattern
    website_name VARCHAR(255) DEFAULT 'Digital Drive (DS)' NOT NULL,
    website_tagline VARCHAR(255) DEFAULT 'Automated Digital Subscriptions' NOT NULL,
    seo_meta_description TEXT DEFAULT 'Instant automated digital subscriptions platform powered by wholesale supplier network and secure DS Token wallet.' NOT NULL,
    support_whatsapp VARCHAR(64) DEFAULT '+8801700112233' NOT NULL,
    support_telegram VARCHAR(255) DEFAULT 'https://t.me/digitaldrivesup' NOT NULL,
    support_email VARCHAR(255) DEFAULT 'support@digitaldrive.vip' NOT NULL,
    slider_auto_scroll_speed_sec INT DEFAULT 3 NOT NULL CHECK (slider_auto_scroll_speed_sec BETWEEN 1 AND 30),
    hot_deals_auto_scroll BOOLEAN DEFAULT true NOT NULL,
    top_trending_auto_scroll BOOLEAN DEFAULT true NOT NULL,
    exchange_rate_bdt_to_ds NUMERIC(8, 4) DEFAULT 1.0000 NOT NULL,
    global_profit_margin_percent NUMERIC(6, 2) DEFAULT 35.00 NOT NULL,
    supplier_balance_bdt NUMERIC(14, 2) DEFAULT 48500.00 NOT NULL,
    supplier_api_status VARCHAR(32) DEFAULT 'connected' CHECK (supplier_api_status IN ('connected', 'degraded', 'syncing', 'disconnected')),
    api_integration_type VARCHAR(32) DEFAULT 'telegram_bot' CHECK (api_integration_type IN ('telegram_bot', 'rest_api')),
    telegram_bot_token_encrypted TEXT,
    telegram_chat_id VARCHAR(128),
    supplier_endpoint VARCHAR(512),
    supplier_api_key_encrypted TEXT,
    custom_logo_url TEXT,
    custom_footer_logo_url TEXT,
    auto_sync_enabled BOOLEAN DEFAULT true NOT NULL,
    auto_sync_interval_sec INT DEFAULT 20 NOT NULL,
    last_sync_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Anti-Crash Live Sales Cache & 24h Daily Reset Table
CREATE TABLE live_sales_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    telegram_handle VARCHAR(128) NOT NULL, -- e.g. "@tanvir_ai", "@rahul_vip"
    action_type VARCHAR(32) NOT NULL CHECK (action_type IN ('Purchased', 'Topped Up')),
    product_name VARCHAR(255) NOT NULL,
    amount_ds_tokens NUMERIC(12, 2) NOT NULL,
    event_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    day_partition VARCHAR(10) NOT NULL, -- Format: YYYY-MM-DD
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for instant retrieval of today's partition
CREATE INDEX idx_live_sales_day ON live_sales_cache(day_partition, event_timestamp DESC);

-- Automated 24-Hour Reset Function / Cron:
-- Flushes yesterday's cache partition automatically at 00:00:00 UTC
-- DELETE FROM live_sales_cache WHERE day_partition < CURRENT_DATE::VARCHAR;

-- Seed initial configuration row
INSERT INTO global_settings (id, website_name, website_tagline)
VALUES (1, 'Digital Drive (DS)', 'Automated Digital Subscriptions')
ON CONFLICT (id) DO NOTHING;`;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 text-left space-y-6">
      
      {/* Title Header */}
      <div className="bg-white border border-pink-100 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-pink-50 border border-pink-200 flex items-center justify-center text-pink-600 shadow-sm">
            <Workflow className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-display">
              Digital Drive (DS) · Complete System Architecture Blueprint
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Production Architecture, Enterprise Database Schema, Sequence Workflow & Responsive Layout Contract
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-pink-100 pb-2">
        {[
          { id: 'stack', label: '1. Tech Stack', icon: Server },
          { id: 'schema', label: '2. Database Schema (SQL)', icon: Database },
          { id: 'flow', label: '3. API Sync & Order Sequence', icon: Workflow },
          { id: 'layout', label: '4. Responsive 2-Col / 6-Col Layout', icon: Layers },
        ].map(t => {
          const Icon = t.icon;
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                active
                  ? 'bg-pink-500 text-white shadow-md shadow-pink-500/20'
                  : 'bg-white text-slate-600 hover:text-pink-600 hover:bg-pink-50/50 border border-pink-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Tech Stack Recommendation */}
      {activeTab === 'stack' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Frontend */}
            <div className="bg-white border border-pink-100 rounded-3xl p-5 space-y-3 shadow-sm">
              <div className="flex items-center gap-2 text-pink-600 font-bold text-sm">
                <Layers className="w-4 h-4" />
                <span>Frontend Layer</span>
              </div>
              <ul className="text-xs text-slate-600 space-y-2 font-medium">
                <li><strong className="text-slate-900">React 19 / Vite:</strong> Ultra-responsive SPA with clean Pink & White aesthetics.</li>
                <li><strong className="text-slate-900">Tailwind CSS:</strong> Strict responsive layout rules (`grid-cols-2 lg:grid-cols-6`).</li>
                <li><strong className="text-slate-900">Lucide Icons:</strong> Consistent premium glyphs across all interactive modules.</li>
                <li><strong className="text-slate-900">Live Converter State:</strong> Instant calculation of BDT to DS Token wallet credits.</li>
              </ul>
            </div>

            {/* Backend & Workers */}
            <div className="bg-white border border-pink-100 rounded-3xl p-5 space-y-3 shadow-sm">
              <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                <Server className="w-4 h-4" />
                <span>Backend & API Bridge</span>
              </div>
              <ul className="text-xs text-slate-600 space-y-2 font-medium">
                <li><strong className="text-slate-900">Node.js / Express:</strong> High throughput REST & Telegram bot API synchronization.</li>
                <li><strong className="text-slate-900">Diagnostic Suite:</strong> Automated self-testing and health repair engine.</li>
                <li><strong className="text-slate-900">Polling & Webhooks:</strong> Background sync for live stock status and auto-add.</li>
                <li><strong className="text-slate-900">Encrypted Storage:</strong> Secure storage of license keys and user credentials.</li>
              </ul>
            </div>

            {/* Database & Gateways */}
            <div className="bg-white border border-pink-100 rounded-3xl p-5 space-y-3 shadow-sm">
              <div className="flex items-center gap-2 text-purple-600 font-bold text-sm">
                <Database className="w-4 h-4" />
                <span>Storage & Payment Layer</span>
              </div>
              <ul className="text-xs text-slate-600 space-y-2 font-medium">
                <li><strong className="text-slate-900">PostgreSQL / Cloud SQL:</strong> Relational schema for users, orders, and vault credentials.</li>
                <li><strong className="text-slate-900">bKash, Nagad, Rocket:</strong> 1-click mobile wallet top-up verification.</li>
                <li><strong className="text-slate-900">Supplier REST API:</strong> JSON fulfillment dispatching and wholesale balance tracking.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: SQL Schema */}
      {activeTab === 'schema' && (
        <div className="bg-white border border-pink-100 rounded-3xl p-5 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-700">
              PostgreSQL Schema Definition (DDL)
            </span>
            <button
              onClick={() => copyCode(sqlSchemaCode, 'sql')}
              className="px-3.5 py-1.5 bg-pink-50 hover:bg-pink-100 text-pink-700 rounded-xl text-xs flex items-center gap-1.5 font-mono font-bold transition-colors"
            >
              {copiedCode === 'sql' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode === 'sql' ? 'Copied' : 'Copy SQL'}</span>
            </button>
          </div>

          <pre className="bg-[#faf8f9] p-4 rounded-2xl border border-pink-100 text-xs font-mono text-slate-800 overflow-x-auto max-h-[480px]">
            <code>{sqlSchemaCode}</code>
          </pre>
        </div>
      )}

      {/* Tab 3: Flow */}
      {activeTab === 'flow' && (
        <div className="bg-white border border-pink-100 rounded-3xl p-6 space-y-4 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900">Automated Order & Sync Architecture Flow</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
            <div className="p-4 bg-pink-50/50 rounded-2xl border border-pink-100 space-y-1.5">
              <span className="w-6 h-6 rounded-lg bg-pink-500 text-white font-bold flex items-center justify-center font-mono text-xs">1</span>
              <h4 className="font-bold text-slate-900">Customer Checkout</h4>
              <p className="text-slate-600 text-[11px]">User selects variant. Balance is atomically deducted from DS Token wallet.</p>
            </div>

            <div className="p-4 bg-pink-50/50 rounded-2xl border border-pink-100 space-y-1.5">
              <span className="w-6 h-6 rounded-lg bg-pink-500 text-white font-bold flex items-center justify-center font-mono text-xs">2</span>
              <h4 className="font-bold text-slate-900">Supplier API Dispatch</h4>
              <p className="text-slate-600 text-[11px]">Backend calls Supplier REST/Telegram API endpoint with product SKU and customer email.</p>
            </div>

            <div className="p-4 bg-pink-50/50 rounded-2xl border border-pink-100 space-y-1.5">
              <span className="w-6 h-6 rounded-lg bg-pink-500 text-white font-bold flex items-center justify-center font-mono text-xs">3</span>
              <h4 className="font-bold text-slate-900">Supplier Pool Deduction</h4>
              <p className="text-slate-600 text-[11px]">Wholesale supplier balance is deducted; credentials (keys, email/pass) are generated.</p>
            </div>

            <div className="p-4 bg-pink-50/50 rounded-2xl border border-pink-100 space-y-1.5">
              <span className="w-6 h-6 rounded-lg bg-pink-500 text-white font-bold flex items-center justify-center font-mono text-xs">4</span>
              <h4 className="font-bold text-slate-900">Vault Delivery</h4>
              <p className="text-slate-600 text-[11px]">Credentials delivered instantly to user's Credential Vault for 1-click access.</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Layout Contract */}
      {activeTab === 'layout' && (
        <div className="bg-white border border-pink-100 rounded-3xl p-6 space-y-4 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900">Exact Layout Component Specification</h3>
          <div className="bg-[#faf8f9] p-4 rounded-2xl border border-pink-100 font-mono text-xs text-slate-800">
            <span className="text-pink-600 font-bold">// CRITICAL RESPONSIVE GRID CONTRACT</span><br />
            <code>{'<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-3.5 lg:gap-4">'}</code><br />
            <span className="text-slate-500 pl-4">{'{products.map(p => <ProductCard key={p.id} product={p} />)}'}</span><br />
            <code>{'</div>'}</code>
          </div>
        </div>
      )}
    </div>
  );
};
