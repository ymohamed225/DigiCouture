import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, ChevronDown, Menu, User, Settings, LogOut, Shield, X, CheckCircle, AlertTriangle, Info, Download, Sun, Moon } from 'lucide-react';
import type { AdminPage } from './AdminSidebar';
import { NetworkStatusBadge } from '../../components/NetworkStatusBadge';

interface Notification {
  id: string;
  type: 'error' | 'success' | 'info' | 'warning';
  title: string;
  time: string;
}

interface AdminHeaderProps {
  currentPage: AdminPage;
  adminName?: string;
  onNavigate: (page: AdminPage) => void;
  onLogout: () => void;
  onMobileMenuOpen: () => void;
  onInstallClick?: () => void;
  notifications?: Notification[];
  sidebarWidth: number;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
}

const PAGE_LABELS: Partial<Record<AdminPage, string>> = {
  dashboard: 'Dashboard',
  ateliers: 'Ateliers',
  'ateliers-detail': 'Fiche Atelier',
  abonnements: 'Abonnements',
  plans: 'Plans tarifaires',
  'paiements-saas': 'Paiements SaaS',
  analytics: 'Analytics',
  revenus: 'Revenus',
  usage: 'Usage Technique',
  support: 'Support & Incidents',
  communication: 'Communication',
  integrations: 'Intégrations',
  securite: 'Sécurité',
  audit: "Journal d'audit",
  parametres: 'Paramètres',
  profil: 'Mon profil',
};

const PAGE_DESCRIPTIONS: Partial<Record<AdminPage, string>> = {
  dashboard: 'Vue globale de la plateforme SaaS DigiCouture VIP',
  ateliers: 'Gestion des clients SaaS et comptes ateliers',
  abonnements: 'Suivi des abonnements et licences SaaS',
  'paiements-saas': 'Facturation et abonnements réglés par les ateliers',
  analytics: 'Métriques avancées de croissance, d\'engagement des ateliers et de performance système',
  revenus: 'Analytiques financières (MRR, ARR, Churn)',
  usage: 'Consommation des ressources système',
  support: 'Gestion des tickets et assistance technique',
  communication: 'Diffusion des annonces et messages système',
  integrations: 'Gestion des clés API, passerelles WhatsApp & Mobile Money',
  securite: 'Politiques de sécurité, authentification forte et contrôle d\'accès',
  audit: 'Traçabilité complète des actions d\'administration',
  parametres: 'Configuration générale et paramètres système de la plateforme',
};

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  currentPage,
  adminName = 'Super Admin',
  onNavigate,
  onLogout,
  onMobileMenuOpen,
  onInstallClick,
  notifications = [],
  sidebarWidth,
  isDarkMode = false,
  onToggleDarkMode,
}) => {
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifPanel(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfileMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const unreadCount = notifications.length;

  const notifIcon = (type: Notification['type']) => {
    if (type === 'error') return <AlertTriangle size={14} color="#EF4444" />;
    if (type === 'success') return <CheckCircle size={14} color="#22C55E" />;
    if (type === 'warning') return <AlertTriangle size={14} color="#F59E0B" />;
    return <Info size={14} color="#818CF8" />;
  };

  return (
    <header className={isDarkMode ? 'admin-header-dark' : 'admin-header-light'} style={{
      position: 'fixed',
      top: 0,
      left: sidebarWidth,
      right: 0,
      height: 64,
      background: isDarkMode ? '#0d0d12' : '#FFFFFF',
      borderBottom: isDarkMode ? '1px solid #1e1e24' : '1px solid #E2E8F0',
      boxShadow: isDarkMode ? 'none' : '0 2px 10px rgba(0,0,0,0.03)',
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      padding: '0 24px',
      zIndex: 90,
      transition: 'left 0.25s ease, background 0.2s ease',
    }}>
      {/* Mobile Menu Toggle */}
      <button
        onClick={onMobileMenuOpen}
        style={{
          display: window.innerWidth < 768 ? 'flex' : 'none',
          background: 'none', border: 'none',
          color: isDarkMode ? '#8B8B94' : '#64748B', cursor: 'pointer', padding: 4,
          alignItems: 'center',
        }}
      >
        <Menu size={20} />
      </button>

      {/* Page Title */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: isDarkMode ? '#F5F5F5' : '#0F172A', lineHeight: 1 }}>
          {PAGE_LABELS[currentPage] || 'Administration'}
        </div>
        {PAGE_DESCRIPTIONS[currentPage] && (
          <div style={{ fontSize: 11, color: isDarkMode ? '#8B8B94' : '#64748B', marginTop: 3, lineHeight: 1 }}>
            {PAGE_DESCRIPTIONS[currentPage]}
          </div>
        )}
      </div>

      {/* Search */}
      <div style={{ position: 'relative', width: 260, flexShrink: 0, display: window.innerWidth < 600 ? 'none' : 'block' }}>
        <Search size={14} style={{
          position: 'absolute', left: 10, top: '50%',
          transform: 'translateY(-50%)', color: isDarkMode ? '#4a4a56' : '#94A3B8',
        }} />
        <input
          value={searchValue}
          onChange={e => setSearchValue(e.target.value)}
          placeholder="Rechercher ateliers, clients, CMD…"
          style={{
            width: '100%',
            background: isDarkMode ? '#121216' : '#F8FAFC',
            border: isDarkMode ? '1px solid #24242A' : '1px solid #E2E8F0',
            borderRadius: 8,
            padding: '7px 10px 7px 30px',
            color: isDarkMode ? '#F5F5F5' : '#0F172A',
            fontSize: 12,
            outline: 'none',
          }}
          onKeyDown={e => {
            if (e.key === 'Escape') setSearchValue('');
          }}
        />
        {searchValue && (
          <button
            onClick={() => setSearchValue('')}
            style={{
              position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', color: '#4a4a56', cursor: 'pointer', lineHeight: 0,
            }}
          >
            <X size={12} />
          </button>
        )}
      </div>

      {/* Network & PWA Status Badge */}
      <NetworkStatusBadge />

      {/* ☀️/🌙 Theme Toggle Button (Mode Sombre / Mode Clair) */}
      <button
        onClick={onToggleDarkMode}
        title={isDarkMode ? 'Passer en Mode Clair (Fond Blanc)' : 'Passer en Mode Sombre'}
        style={{
          height: 36,
          padding: '0 12px',
          borderRadius: 8,
          background: isDarkMode ? '#121216' : '#FFFDF5',
          border: isDarkMode ? '1px solid #24242A' : '1.5px solid #D4AF37',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          color: isDarkMode ? '#D4AF37' : '#B8922E',
          fontWeight: 800,
          fontSize: 12,
          cursor: 'pointer',
          boxShadow: isDarkMode ? 'none' : '0 2px 8px rgba(212, 175, 55, 0.2)',
          transition: 'all 0.2s ease'
        }}
      >
        {isDarkMode ? <Sun size={15} color="#D4AF37" /> : <Moon size={15} color="#B8922E" />}
        <span style={{ display: window.innerWidth < 640 ? 'none' : 'inline' }}>
          {isDarkMode ? 'Mode Clair' : 'Mode Sombre'}
        </span>
      </button>

      {/* Notifications */}
      <div ref={notifRef} style={{ position: 'relative' }}>
        <button
          onClick={() => { setShowNotifPanel(p => !p); setShowProfileMenu(false); }}
          style={{
            width: 36, height: 36, borderRadius: 8,
            background: '#121216', border: '1px solid #24242A',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#8B8B94', cursor: 'pointer', position: 'relative',
          }}
        >
          <Bell size={16} />
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute', top: -3, right: -3,
              background: '#EF4444',
              width: 16, height: 16, borderRadius: '50%',
              fontSize: 9, fontWeight: 800, color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '2px solid #0d0d12',
            }}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {showNotifPanel && (
          <div style={{
            position: 'absolute', top: 44, right: 0,
            width: 320, background: '#17171C',
            border: '1px solid #2e2e38', borderRadius: 12,
            boxShadow: '0 16px 40px rgba(0,0,0,0.4)',
            zIndex: 200, overflow: 'hidden',
          }}>
            <div style={{
              padding: '14px 16px', borderBottom: '1px solid #24242A',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#F5F5F5' }}>Notifications</span>
              <span style={{ fontSize: 11, color: '#8B8B94' }}>{unreadCount} non lues</span>
            </div>
            {notifications.length === 0 ? (
              <div style={{ padding: '32px 16px', textAlign: 'center', color: '#8B8B94', fontSize: 13 }}>
                Aucune notification
              </div>
            ) : (
              notifications.slice(0, 6).map(n => (
                <div key={n.id} style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid #1e1e24',
                  display: 'flex', gap: 10, alignItems: 'flex-start',
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}>
                  <div style={{ marginTop: 1, flexShrink: 0 }}>{notifIcon(n.type)}</div>
                  <div>
                    <div style={{ fontSize: 12, color: '#F5F5F5', fontWeight: 500 }}>{n.title}</div>
                    <div style={{ fontSize: 11, color: '#8B8B94', marginTop: 2 }}>{n.time}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Profile */}
      <div ref={profileRef} style={{ position: 'relative' }}>
        <button
          onClick={() => { setShowProfileMenu(p => !p); setShowNotifPanel(false); }}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: '#121216', border: '1px solid #24242A',
            borderRadius: 8, padding: '4px 10px 4px 4px',
            cursor: 'pointer',
          }}
        >
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            background: 'linear-gradient(135deg, #D4AF37, #a8862a)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, color: '#0B0B0D', fontWeight: 800, flexShrink: 0,
          }}>
            {adminName.charAt(0).toUpperCase()}
          </div>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#F5F5F5', display: window.innerWidth < 640 ? 'none' : 'block' }}>
            {adminName}
          </span>
          <ChevronDown size={12} color="#8B8B94" />
        </button>

        {showProfileMenu && (
          <div style={{
            position: 'absolute', top: 44, right: 0,
            width: 200, background: '#17171C',
            border: '1px solid #2e2e38', borderRadius: 10,
            boxShadow: '0 12px 32px rgba(0,0,0,0.4)',
            zIndex: 200, overflow: 'hidden',
          }}>
            {[
              { label: 'Mon profil', icon: <User size={13} />, page: 'profil' as AdminPage },
              { label: 'Paramètres', icon: <Settings size={13} />, page: 'parametres' as AdminPage },
              { label: 'Sécurité', icon: <Shield size={13} />, page: 'securite' as AdminPage },
            ].map(item => (
              <button
                key={item.label}
                onClick={() => { onNavigate(item.page); setShowProfileMenu(false); }}
                style={{
                  width: '100%', background: 'none', border: 'none',
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 14px', color: '#8B8B94',
                  fontSize: 13, cursor: 'pointer', textAlign: 'left',
                  borderBottom: '1px solid #1e1e24',
                }}
              >
                {item.icon}
                {item.label}
              </button>
            ))}

            <button
              onClick={() => {
                if (onInstallClick) onInstallClick();
                setShowProfileMenu(false);
              }}
              style={{
                width: '100%', background: 'none', border: 'none',
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px', color: '#D4AF37',
                fontSize: 13, fontWeight: 700, cursor: 'pointer', textAlign: 'left',
                borderBottom: '1px solid #1e1e24',
              }}
            >
              <Download size={13} />
              📱 Installer DigiCouture
            </button>
            <button
              onClick={() => { onLogout(); setShowProfileMenu(false); }}
              style={{
                width: '100%', background: 'none', border: 'none',
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px', color: '#EF4444',
                fontSize: 13, cursor: 'pointer', textAlign: 'left',
              }}
            >
              <LogOut size={13} />
              Déconnexion
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
