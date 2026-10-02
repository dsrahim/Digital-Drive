import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { StoreView } from './components/StoreView';
import { UserDashboard } from './components/UserDashboard';
import { AdminPanel } from './components/AdminPanel';
import { SystemArchitectureView } from './components/SystemArchitectureView';
import { ProductDetailModal } from './components/ProductDetailModal';
import { TopUpModal } from './components/TopUpModal';
import { AuthModal } from './components/AuthModal';
import { WishlistModal } from './components/WishlistModal';
import { FloatingSupportFab } from './components/FloatingSupportFab';
import { LiveSalesNotification } from './components/LiveSalesNotification';
import { ToastNotification } from './components/ToastNotification';
import { GlobalAnnouncementModal } from './components/GlobalAnnouncementModal';
import { Footer } from './components/Footer';
import { ErrorBoundary } from './components/ErrorBoundary';

const AppContent: React.FC = () => {
  const { activeView, settings } = useApp();

  // Dynamic Document Title and SEO synchronization from Admin Panel Global Settings
  React.useEffect(() => {
    const siteName = settings?.websiteName || 'Digital Drive (DS)';
    const siteTagline = settings?.websiteTagline || 'Automated Digital Subscriptions';
    
    let viewTitle = '';
    if (activeView === 'store') viewTitle = `${siteName} - ${siteTagline}`;
    else if (activeView === 'dashboard') viewTitle = `Vault & Wallet | ${siteName}`;
    else if (activeView === 'admin') viewTitle = `Command Center | ${siteName}`;
    else if (activeView === 'architecture') viewTitle = `Architecture & API Specs | ${siteName}`;
    else viewTitle = `${siteName} - ${siteTagline}`;

    document.title = viewTitle;

    if (settings?.seoMetaDescription) {
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', settings.seoMetaDescription);
      }
      const ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) {
        ogDesc.setAttribute('content', settings.seoMetaDescription);
      }
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) {
        ogTitle.setAttribute('content', viewTitle);
      }
    }
  }, [settings?.websiteName, settings?.websiteTagline, settings?.seoMetaDescription, activeView]);

  return (
    <div className="min-h-screen flex flex-col bg-[#faf7f8] text-slate-900 selection:bg-pink-500/20 selection:text-pink-600 relative">
      <Navbar />

      <main className="flex-1">
        <ErrorBoundary fallbackTitle="View Error Shield" fallbackMessage="An error occurred while rendering the current view. The application remains stable.">
          {activeView === 'store' && <StoreView />}
          {activeView === 'dashboard' && <UserDashboard />}
          {activeView === 'admin' && <AdminPanel />}
          {activeView === 'architecture' && <SystemArchitectureView />}
        </ErrorBoundary>
      </main>

      {/* Overlays & Modals protected by ErrorBoundary */}
      <ErrorBoundary fallbackTitle="Modal Guard Active" fallbackMessage="Unable to display the selected modal.">
        <ProductDetailModal />
        <TopUpModal />
        <AuthModal />
        <WishlistModal />
      </ErrorBoundary>
      
      <LiveSalesNotification />
      <ToastNotification />
      <GlobalAnnouncementModal />
      <FloatingSupportFab />
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary fallbackTitle="Digital Drive Application Shield" fallbackMessage="A critical error occurred. Please reload to restore session.">
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ErrorBoundary>
  );
}
