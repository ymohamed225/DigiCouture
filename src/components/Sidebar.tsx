import React, { useState } from 'react';
import { 
  Scissors, 
  Sparkles,
  Crown,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  atelierName: string;
  onToggleDemoMode: () => void;
  onLogout?: () => void;
  isDemoMode?: boolean;
  currentPlan?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  atelierName,
  onToggleDemoMode,
  onLogout,
  isDemoMode = false,
  currentPlan = 'pro',
  isCollapsed: externalCollapsed,
  onToggleCollapse: externalToggleCollapse,
  isDarkMode = false
}) => {
  const [internalCollapsed, setInternalCollapsed] = useState(false);

  const isCollapsed = externalCollapsed !== undefined ? externalCollapsed : internalCollapsed;
  const toggleCollapse = externalToggleCollapse || (() => setInternalCollapsed(!internalCollapsed));

  const menuItems = [
    { id: 'dashboard', label: 'Tableau de bord', emoji: '🏠' },
    { id: 'clients', label: 'Clients VIP', emoji: '👥' },
    { id: 'measurements', label: 'Mensurations', emoji: '📏' },
    { id: 'orders', label: 'Commandes', emoji: '📋' },
    { id: 'calendar', label: 'Calendrier & RDV', emoji: '📅' },
    { id: 'notifications', label: 'Notifications', emoji: '🔔' },
    { id: 'messages', label: 'Messages WhatsApp', emoji: '💬' },
    { id: 'production', label: 'Suivi Production', emoji: '✂️' },
    { id: 'payments', label: 'Paiements & Caisse', emoji: '💳' },
    { id: 'catalogue', label: 'Catalogue', emoji: '👗' },
    { id: 'subscription', label: 'Mon Abonnement', emoji: '💎' },
    { id: 'atelier', label: 'Mon Atelier', emoji: '🏛️' },
    { id: 'reports', label: 'Rapports Financiers', emoji: '📊' },
    { id: 'settings', label: 'Paramètres', emoji: '⚙️' },
  ];

  return (
    <aside style={{
      width: isCollapsed ? '82px' : '275px',
      transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.3s ease',
      backgroundColor: isDarkMode ? '#0F172A' : '#FFFFFF',
      borderRight: isDarkMode ? '1.5px solid #1E293B' : '1.5px solid #EAE5DF',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      position: 'sticky',
      top: 0,
      zIndex: 20,
      boxShadow: isDarkMode ? '4px 0 25px rgba(0,0,0,0.4)' : '4px 0 25px rgba(0,0,0,0.05)',
      color: isDarkMode ? '#F8FAFC' : '#0F172A'
    }}>
      {/* 👑 Brand Header VIP Lumineux Blanc & Or / Sombre */}
      <div style={{
        padding: isCollapsed ? '1.5rem 0.75rem' : '1.75rem 1.25rem',
        borderBottom: isDarkMode ? '1.5px solid #1E293B' : '1.5px solid #EAE5DF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: isCollapsed ? 'center' : 'space-between',
        background: isDarkMode ? 'linear-gradient(180deg, #1E1B4B 0%, #0F172A 100%)' : 'linear-gradient(180deg, #FFFDF5 0%, #FFFFFF 100%)',
        position: 'relative'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #D4AF37 0%, #B8922E 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            boxShadow: '0 4px 16px rgba(212, 175, 55, 0.3)',
            border: '1px solid #FDE68A',
            flexShrink: 0
          }}>
            <Scissors size={20} />
          </div>
          
          {!isCollapsed && (
            <div style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
              <h1 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.02em', lineHeight: 1.1, fontFamily: 'var(--font-serif)', margin: 0 }}>
                Digi<span style={{ color: '#D4AF37' }}>Couture</span>
              </h1>
              <p style={{ fontSize: '0.68rem', color: '#B8922E', marginTop: '3px', fontWeight: 900, letterSpacing: '1.2px', textTransform: 'uppercase', margin: 0 }}>
                ✦ HAUTE COUTURE VIP ✦
              </p>
            </div>
          )}
        </div>

        {/* Bouton Toggle Fermer / Ouvrir Sidebar */}
        <button
          onClick={toggleCollapse}
          title={isCollapsed ? 'Ouvrir le menu' : 'Fermer le menu'}
          style={{
            backgroundColor: '#FFFDF5',
            color: '#B8922E',
            border: '1.5px solid #D4AF37',
            borderRadius: '10px',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(212,175,55,0.2)',
            position: isCollapsed ? 'absolute' : 'relative',
            right: isCollapsed ? '-16px' : '0',
            top: isCollapsed ? '50%' : '0',
            transform: isCollapsed ? 'translateY(-50%)' : 'none',
            zIndex: 30
          }}
        >
          {isCollapsed ? <ChevronRight size={18} color="#B8922E" /> : <ChevronLeft size={18} color="#B8922E" />}
        </button>
      </div>

      {/* 💎 Atelier Card Info Blanc & Or (Visible si déplié) */}
      {!isCollapsed ? (
        <div 
          onClick={() => onSelectTab('settings')}
          style={{
            margin: '1.15rem 1.15rem 0.5rem 1.15rem',
            padding: '0.85rem 1rem',
            background: 'linear-gradient(135deg, #FFFDF5 0%, #FAF8F5 100%)',
            borderRadius: '18px',
            border: '1.5px solid #D4AF37',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(212, 175, 55, 0.12)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '0.68rem', color: '#B8922E', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Crown size={12} color="#B8922E" /> {isDemoMode ? 'COMPTE DÉMO' : 'ATELIER ACTIF'}
            </div>
            <span style={{ fontSize: '0.65rem', fontWeight: 900, backgroundColor: '#FFFDF5', color: '#B8922E', border: '1px solid #D4AF37', padding: '0.15rem 0.5rem', borderRadius: '6px', textTransform: 'uppercase' }}>
              💎 {currentPlan.toUpperCase()}
            </span>
          </div>
          <div style={{ fontSize: '0.92rem', fontWeight: 900, color: '#0F172A', marginTop: '0.3rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {atelierName}
          </div>
        </div>
      ) : (
        <div 
          onClick={() => onSelectTab('settings')}
          title={`Atelier: ${atelierName} (${currentPlan.toUpperCase()})`}
          style={{
            margin: '0.85rem auto 0.5rem auto',
            width: '42px',
            height: '42px',
            borderRadius: '14px',
            backgroundColor: '#FFFDF5',
            border: '1.5px solid #D4AF37',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <Crown size={20} color="#B8922E" />
        </div>
      )}

      {/* 📜 Navigation Links avec icônes colorées */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: isCollapsed ? '0.75rem 0.5rem' : '0.75rem 0.9rem' }}>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.35rem', padding: 0, margin: 0 }}>
          {menuItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onSelectTab(item.id)}
                  title={isCollapsed ? item.label : undefined}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: isCollapsed ? 'center' : 'space-between',
                    padding: isCollapsed ? '0.65rem 0' : '0.65rem 0.85rem',
                    borderRadius: '14px',
                    fontSize: '0.9rem',
                    fontWeight: isActive ? 900 : 700,
                    color: isActive ? '#FFFFFF' : (isDarkMode ? '#CBD5E1' : '#475569'),
                    background: isActive 
                      ? 'linear-gradient(135deg, #D4AF37 0%, #B8922E 100%)' 
                      : 'transparent',
                    border: 'none',
                    boxShadow: isActive ? '0 4px 14px rgba(212, 175, 55, 0.3)' : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <span style={{ fontSize: '1.25rem', lineHeight: 1, flexShrink: 0 }}>
                      {item.emoji}
                    </span>
                    {!isCollapsed && <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>}
                  </div>
                  {!isCollapsed && isActive && <ChevronRight size={16} color="#FFFFFF" />}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* 🚀 Footer Options Raccourcis Blanc & Doré + Mode Sombre */}
      <div style={{
        padding: isCollapsed ? '0.85rem 0.5rem' : '1.15rem',
        borderTop: '1.5px solid #EAE5DF',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.6rem',
        backgroundColor: '#FFFDF5'
      }}>
        <button
          onClick={() => onSelectTab('landing')}
          title={isCollapsed ? 'Vitrine / Landing Page' : undefined}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '0.65rem',
            borderRadius: '12px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #EAE5DF',
            fontSize: '0.82rem',
            color: '#0F172A',
            fontWeight: 800,
            cursor: 'pointer'
          }}
        >
          <Sparkles size={16} color="#B8922E" />
          {!isCollapsed && <span>Vitrine / Landing Page</span>}
        </button>

        {isDemoMode ? (
          <button
            onClick={onToggleDemoMode}
            title={isCollapsed ? 'Mode Démo / Switch' : undefined}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.65rem',
              borderRadius: '12px',
              border: '1.5px dashed #D4AF37',
              backgroundColor: '#FFFDF5',
              fontSize: '0.82rem',
              color: '#B8922E',
              fontWeight: 900,
              cursor: 'pointer'
            }}
          >
            <Sparkles size={16} />
            {!isCollapsed && <span>Mode Démo / Switch</span>}
          </button>
        ) : (
          <button
            onClick={onLogout}
            title={isCollapsed ? 'Déconnexion' : undefined}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.6rem',
              padding: '0.65rem',
              borderRadius: '14px',
              border: '1.5px solid #FF4D4D',
              backgroundColor: '#FFF5F5',
              fontSize: '0.85rem',
              color: '#FF2E2E',
              fontWeight: 900,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(255, 77, 77, 0.15)'
            }}
          >
            <img 
              src="/logout_icon.png" 
              alt="Déconnexion" 
              style={{ width: '22px', height: '22px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} 
            />
            {!isCollapsed && <span>Déconnexion</span>}
          </button>
        )}
      </div>
    </aside>
  );
};

