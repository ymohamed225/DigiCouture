import React, { useState, useEffect } from 'react';
import { AdminSidebar, type AdminPage } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';

interface AdminLayoutProps {
  currentPage: AdminPage;
  onNavigate: (page: AdminPage) => void;
  onLogout: () => void;
  onInstallClick?: () => void;
  adminName?: string;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentPage,
  onNavigate,
  onLogout,
  onInstallClick,
  adminName = 'Super Admin',
  children,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setIsMobileOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sidebar width for content offset
  const sidebarWidth = isMobile ? 0 : (isCollapsed ? 68 : 240);

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('dc_admin_darkmode') === 'true';
  });

  const handleToggleDarkMode = () => {
    setIsDarkMode(prev => {
      const next = !prev;
      localStorage.setItem('dc_admin_darkmode', next ? 'true' : 'false');
      return next;
    });
  };

  // Mock notifications from audit/error state — in production, fetched from API
  const notifications = [
    { id: '1', type: 'error' as const,   title: 'Paiement CinetPay échoué',     time: 'Il y a 2 min' },
    { id: '2', type: 'success' as const, title: 'Nouvel atelier enregistré',     time: 'Il y a 10 min' },
    { id: '3', type: 'info' as const,    title: 'Abonnement PRO activé',         time: 'Il y a 25 min' },
  ];

  return (
    <div className={isDarkMode ? 'admin-dark-mode' : 'admin-light-mode'} style={{
      minHeight: '100vh',
      background: 'var(--admin-bg, #F8FAFC)',
      color: 'var(--admin-text-main, #0F172A)',
      transition: 'background 0.2s ease, color 0.2s ease'
    }}>
      {/* Inject global admin theme styles */}
      <style>{`
        :root {
          --admin-bg: #F8FAFC;
          --admin-card-bg: #FFFFFF;
          --admin-card-border: #E2E8F0;
          --admin-card-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
          --admin-header-row-bg: #F1F5F9;
          --admin-input-bg: #FFFFFF;
          --admin-text-main: #0F172A;
          --admin-text-sub: #64748B;
          --admin-text-muted: #94A3B8;
          --admin-hover-bg: #F1F5F9;
        }

        .admin-dark-mode {
          --admin-bg: #0B0B0D;
          --admin-card-bg: #121216;
          --admin-card-border: #24242A;
          --admin-card-shadow: none;
          --admin-header-row-bg: #0d0d12;
          --admin-input-bg: #0B0B0D;
          --admin-text-main: #F5F5F5;
          --admin-text-sub: #8B8B94;
          --admin-text-muted: #4a4a56;
          --admin-hover-bg: rgba(212, 175, 55, 0.04);
        }

        @keyframes adminShimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .kpi-card:hover {
          border-color: rgba(212,175,55,0.4) !important;
          box-shadow: 0 4px 20px rgba(212,175,55,0.12);
        }
        .admin-table-row:hover {
          background: var(--admin-hover-bg) !important;
        }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${isDarkMode ? '#2e2e38' : '#CBD5E1'}; border-radius: 4px; }
        * { box-sizing: border-box; }
        button { font-family: inherit; }
        input, textarea, select {
          font-family: inherit;
          color-scheme: ${isDarkMode ? 'dark' : 'light'};
        }
      `}</style>

      {/* Sidebar */}
      <AdminSidebar
        currentPage={currentPage}
        onNavigate={onNavigate}
        onLogout={onLogout}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(p => !p)}
        isMobileOpen={isMobileOpen}
        onMobileClose={() => setIsMobileOpen(false)}
        adminName={adminName}
        isDarkMode={isDarkMode}
      />

      {/* Header */}
      <AdminHeader
        currentPage={currentPage}
        adminName={adminName}
        onNavigate={onNavigate}
        onLogout={onLogout}
        onMobileMenuOpen={() => setIsMobileOpen(true)}
        onInstallClick={onInstallClick}
        notifications={notifications}
        sidebarWidth={sidebarWidth}
        isDarkMode={isDarkMode}
        onToggleDarkMode={handleToggleDarkMode}
      />

      {/* Main content */}
      <main style={{
        marginLeft: sidebarWidth,
        paddingTop: 64,
        minHeight: '100vh',
        background: isDarkMode ? '#0B0B0D' : '#F8FAFC',
        color: isDarkMode ? '#F5F5F5' : '#0F172A',
        transition: 'margin-left 0.25s ease, background 0.2s ease',
      }}>
        <div style={{
          width: '100%',
          padding: '24px 24px 48px',
          boxSizing: 'border-box'
        }}>
          {children}
        </div>
      </main>
    </div>
  );
};
