import React, { useState } from 'react';
import {
  LayoutDashboard, Building2, CreditCard, BarChart3,
  Bell, Settings, Shield, Plug, ChevronDown, ChevronRight,
  Package, Globe, ShoppingBag, TrendingUp, Lock, LogOut, HelpCircle,
  ChevronLeft,
} from 'lucide-react';

export type AdminPage =
  | 'dashboard'
  | 'ateliers' | 'ateliers-detail'
  | 'abonnements' | 'plans'
  | 'paiements-saas'
  | 'analytics'
  | 'revenus'
  | 'usage'
  | 'support'
  | 'communication'
  | 'alertes'
  | 'integrations'
  | 'securite'
  | 'audit'
  | 'parametres'
  | 'profil';

interface NavGroup {
  title: string;
  items: NavItem[];
}

interface NavItem {
  id: AdminPage;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: 'Plateforme',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
      { id: 'ateliers', label: 'Ateliers', icon: <Building2 size={16} /> },
      { id: 'abonnements', label: 'Abonnements', icon: <ShoppingBag size={16} /> },
      { id: 'paiements-saas', label: 'Paiements SaaS', icon: <CreditCard size={16} /> },
      { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={16} /> },
    ],
  },
  {
    title: 'Croissance',
    items: [
      { id: 'revenus', label: 'Revenus', icon: <TrendingUp size={16} /> },
      { id: 'plans', label: 'Plans tarifaires', icon: <Package size={16} /> },
      { id: 'usage', label: 'Usage', icon: <Globe size={16} /> },
    ],
  },
  {
    title: 'Support & Alertes',
    items: [
      { id: 'alertes', label: 'Alertes Platform', icon: <Bell size={16} /> },
      { id: 'support', label: 'Support', icon: <HelpCircle size={16} /> },
      { id: 'communication', label: 'Communication', icon: <Bell size={16} /> },
    ],
  },
  {
    title: 'Système',
    items: [
      { id: 'integrations', label: 'Intégrations', icon: <Plug size={16} /> },
      { id: 'securite', label: 'Sécurité', icon: <Lock size={16} /> },
      { id: 'audit', label: 'Audit', icon: <Shield size={16} /> },
      { id: 'parametres', label: 'Paramètres', icon: <Settings size={16} /> },
    ],
  },
];

interface AdminSidebarProps {
  currentPage: AdminPage;
  onNavigate: (page: AdminPage) => void;
  onLogout: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onMobileClose: () => void;
  adminName?: string;
  isDarkMode?: boolean;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentPage,
  onNavigate,
  onLogout,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onMobileClose,
  adminName = 'Super Admin',
  isDarkMode = false,
}) => {
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (title: string) => {
    setCollapsedGroups(prev => ({ ...prev, [title]: !prev[title] }));
  };

  const handleNav = (page: AdminPage) => {
    onNavigate(page);
    onMobileClose();
  };

  const sidebarWidth = isCollapsed ? 68 : 240;

  const sidebarStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    width: sidebarWidth,
    background: isDarkMode ? '#0B0B0D' : '#0F172A',
    borderRight: isDarkMode ? '1px solid #1e1e24' : '1px solid #1E293B',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 100,
    transition: 'width 0.25s ease, transform 0.25s ease, background 0.2s ease',
    overflowX: 'hidden',
    overflowY: 'auto',
  };

  // Mobile overlay
  const overlay = isMobileOpen ? (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
        zIndex: 99, backdropFilter: 'blur(2px)',
      }}
      onClick={onMobileClose}
    />
  ) : null;

  return (
    <>
      {overlay}
      <aside
        style={{
          ...sidebarStyle,
          transform: isMobileOpen
            ? 'translateX(0)'
            : window.innerWidth < 768 ? 'translateX(-100%)' : 'translateX(0)',
          width: isMobileOpen ? 240 : sidebarWidth,
        }}
      >
        {/* ── Logo & Title ─────────────────────────── */}
        <div style={{
          padding: '20px 16px 16px',
          borderBottom: '1px solid #1e1e24',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          flexShrink: 0,
          minHeight: 68,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #D4AF37, #a8862a)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, flexShrink: 0,
          }}>
            ✂️
          </div>
          {(!isCollapsed || isMobileOpen) && (
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#D4AF37', letterSpacing: 0.5, whiteSpace: 'nowrap' }}>
                DigiCouture
              </div>
              <div style={{ fontSize: 10, color: '#8B8B94', fontWeight: 500, letterSpacing: 0.5, marginTop: 1 }}>
                ADMINISTRATION
              </div>
            </div>
          )}
          {/* Collapse toggle (desktop only) */}
          {window.innerWidth >= 768 && (
            <button
              onClick={onToggleCollapse}
              style={{
                marginLeft: 'auto',
                background: 'none', border: 'none',
                color: '#8B8B94', cursor: 'pointer',
                padding: 4, lineHeight: 0, flexShrink: 0,
              }}
            >
              {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          )}
        </div>

        {/* ── Nav Groups ───────────────────────────── */}
        <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
          {NAV_GROUPS.map(group => {
            const isGroupCollapsed = collapsedGroups[group.title];
            return (
              <div key={group.title} style={{ marginBottom: 4 }}>
                {/* Group Title */}
                {(!isCollapsed || isMobileOpen) && (
                  <button
                    onClick={() => toggleGroup(group.title)}
                    style={{
                      width: '100%', background: 'none', border: 'none',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '6px 8px',
                      color: '#4a4a56', fontSize: 10, fontWeight: 700,
                      textTransform: 'uppercase', letterSpacing: '0.9px',
                      cursor: 'pointer', marginBottom: 2,
                    }}
                  >
                    {group.title}
                    {isGroupCollapsed
                      ? <ChevronRight size={12} />
                      : <ChevronDown size={12} />
                    }
                  </button>
                )}

                {/* Nav Items */}
                {!isGroupCollapsed && group.items.map(item => {
                  const isActive = currentPage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNav(item.id)}
                      title={isCollapsed ? item.label : undefined}
                      style={{
                        width: '100%', border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center',
                        gap: 10, padding: '8px 10px',
                        borderRadius: 8, marginBottom: 1,
                        background: isActive ? 'rgba(212,175,55,0.1)' : 'transparent',
                        color: isActive ? '#D4AF37' : '#8B8B94',
                        fontWeight: isActive ? 600 : 400,
                        fontSize: 13,
                        transition: 'all 0.15s',
                        textAlign: 'left',
                        position: 'relative',
                        justifyContent: isCollapsed && !isMobileOpen ? 'center' : 'flex-start',
                        borderLeft: isActive ? '2px solid #D4AF37' : '2px solid transparent',
                      }}
                    >
                      <span style={{
                        color: isActive ? '#D4AF37' : '#4a4a56',
                        flexShrink: 0,
                        transition: 'color 0.15s',
                      }}>
                        {item.icon}
                      </span>
                      {(!isCollapsed || isMobileOpen) && (
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.label}
                        </span>
                      )}
                      {(!isCollapsed || isMobileOpen) && item.badge && item.badge > 0 && (
                        <span style={{
                          marginLeft: 'auto',
                          background: '#EF4444',
                          color: '#fff',
                          fontSize: 10, fontWeight: 700,
                          padding: '1px 6px', borderRadius: 100,
                          flexShrink: 0,
                        }}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* ── Footer ───────────────────────────────── */}
        <div style={{
          borderTop: '1px solid #1e1e24',
          padding: '12px 8px',
          flexShrink: 0,
        }}>
          {/* Help */}
          {(!isCollapsed || isMobileOpen) && (
            <button style={{
              width: '100%', border: 'none', background: 'none',
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 10px', borderRadius: 8, marginBottom: 2,
              color: '#4a4a56', fontSize: 13, cursor: 'pointer',
            }}>
              <HelpCircle size={16} />
              Centre d'aide
            </button>
          )}

          {/* Profile */}
          <button
            onClick={() => handleNav('profil')}
            style={{
              width: '100%', border: 'none', background: 'none',
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 10px', borderRadius: 8, marginBottom: 2,
              color: currentPage === 'profil' ? '#D4AF37' : '#8B8B94',
              fontSize: 13, cursor: 'pointer',
              justifyContent: isCollapsed && !isMobileOpen ? 'center' : 'flex-start',
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
            {(!isCollapsed || isMobileOpen) && (
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {adminName}
              </span>
            )}
          </button>

          {/* Logout */}
          <button
            onClick={onLogout}
            style={{
              width: '100%', border: 'none', background: 'none',
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 10px', borderRadius: 8,
              color: '#4a4a56', fontSize: 13, cursor: 'pointer',
              justifyContent: isCollapsed && !isMobileOpen ? 'center' : 'flex-start',
            }}
          >
            <LogOut size={16} />
            {(!isCollapsed || isMobileOpen) && 'Déconnexion'}
          </button>
        </div>
      </aside>
    </>
  );
};
