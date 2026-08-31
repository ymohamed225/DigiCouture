import React, { useState } from 'react';
import { 
  Home, 
  ClipboardList, 
  Plus, 
  ShoppingBag, 
  Store,
  UserPlus,
  FilePlus,
  CreditCard,
  Shirt,
  X
} from 'lucide-react';

interface MobileBottomNavProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  onQuickAction: (action: 'new_client' | 'new_order' | 'new_payment' | 'new_model') => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  onTabChange,
  onQuickAction
}) => {
  const [isQuickMenuOpen, setIsQuickMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Accueil', icon: Home },
    { id: 'orders', label: 'Commandes', icon: ClipboardList },
    { id: 'add_fab', label: 'Ajouter', icon: Plus, isFab: true },
    { id: 'catalogue', label: 'Catalogue', icon: ShoppingBag },
    { id: 'clients', label: 'Clients', icon: Store }
  ];

  const handleFabClick = () => {
    setIsQuickMenuOpen(!isQuickMenuOpen);
  };

  return (
    <>
      {/* MODAL MENU ACTIONS RAPIDES AU CLIC SUR + (GRANDES CARTES TACTILES) */}
      {isQuickMenuOpen && (
        <div 
          onClick={() => setIsQuickMenuOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(17,24,39,0.7)',
            backdropFilter: 'blur(6px)',
            zIndex: 140,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            padding: '1.25rem',
            paddingBottom: '5.5rem',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              padding: '1.5rem',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
              border: '1px solid var(--border-gold)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                ⚡ Action rapide atelier
              </h3>
              <button 
                onClick={() => setIsQuickMenuOpen(false)}
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <X size={18} color="var(--text-muted)" />
              </button>
            </div>

            {/* GRILLE 4 GRANDES CARTES FACILEMENT CLIQUABLES À UNE MAIN */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              
              {/* Card 1 : Nouveau Client */}
              <div 
                onClick={() => {
                  setIsQuickMenuOpen(false);
                  onQuickAction('new_client');
                }}
                style={{
                  backgroundColor: '#FAF8F5',
                  borderRadius: '16px',
                  padding: '1.25rem 1rem',
                  border: '1px solid #EAE5DF',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer'
                }}
              >
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--gold-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <UserPlus size={24} color="var(--gold-dark)" />
                </div>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>👤 Nouveau client</span>
              </div>

              {/* Card 2 : Nouvelle Commande */}
              <div 
                onClick={() => {
                  setIsQuickMenuOpen(false);
                  onQuickAction('new_order');
                }}
                style={{
                  backgroundColor: '#FAF8F5',
                  borderRadius: '16px',
                  padding: '1.25rem 1rem',
                  border: '1px solid #EAE5DF',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer'
                }}
              >
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--gold-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FilePlus size={24} color="var(--gold-dark)" />
                </div>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>📋 Nouvelle commande</span>
              </div>

              {/* Card 3 : Nouveau Paiement */}
              <div 
                onClick={() => {
                  setIsQuickMenuOpen(false);
                  onQuickAction('new_payment');
                }}
                style={{
                  backgroundColor: '#FAF8F5',
                  borderRadius: '16px',
                  padding: '1.25rem 1rem',
                  border: '1px solid #EAE5DF',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer'
                }}
              >
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--gold-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CreditCard size={24} color="var(--gold-dark)" />
                </div>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>💰 Nouveau paiement</span>
              </div>

              {/* Card 4 : Ajouter un Modèle */}
              <div 
                onClick={() => {
                  setIsQuickMenuOpen(false);
                  onQuickAction('new_model');
                }}
                style={{
                  backgroundColor: '#FAF8F5',
                  borderRadius: '16px',
                  padding: '1.25rem 1rem',
                  border: '1px solid #EAE5DF',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer'
                }}
              >
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--gold-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Shirt size={24} color="var(--gold-dark)" />
                </div>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>👗 Ajouter un modèle</span>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* STICKY BOTTOM NAVBAR PARFAITEMENT ADAPTÉE AUX SMARTPHONES ANDROID & IOS */}
      <div 
        className="mobile-only"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(12px)',
          borderTop: '1px solid var(--border-color)',
          padding: '0.5rem 0.75rem calc(0.5rem + env(safe-area-inset-bottom, 0px)) 0.75rem',
          zIndex: 130,
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.06)'
        }}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          if (item.isFab) {
            return (
              <div key={item.id} style={{ position: 'relative', top: '-18px' }}>
                <button
                  onClick={handleFabClick}
                  style={{
                    width: '58px',
                    height: '58px',
                    borderRadius: '50%',
                    backgroundColor: '#D4AF37',
                    backgroundImage: 'linear-gradient(135deg, #D4AF37 0%, #B8922E 100%)',
                    border: '4px solid #FFFFFF',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 20px rgba(212, 175, 55, 0.4)',
                    cursor: 'pointer',
                    transform: isQuickMenuOpen ? 'rotate(45deg)' : 'none',
                    transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
                  }}
                  aria-label="Actions rapides"
                >
                  <Icon size={26} strokeWidth={2.5} />
                </button>
              </div>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '3px',
                backgroundColor: 'transparent',
                border: 'none',
                color: isActive ? '#B8922E' : 'var(--text-muted)',
                fontSize: '0.72rem',
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
                padding: '0.35rem 0.65rem'
              }}
            >
              <Icon size={22} color={isActive ? '#B8922E' : 'var(--text-muted)'} strokeWidth={isActive ? 2.5 : 1.8} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </>
  );
};
