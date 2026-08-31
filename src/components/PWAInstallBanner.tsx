import React from 'react';
import { Smartphone, Download } from 'lucide-react';

interface PWAInstallBannerProps {
  show: boolean;
  onInstall: () => void;
  onDismiss: () => void;
}

export const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({ show, onInstall, onDismiss }) => {
  if (!show) return null;

  return (
    <div style={styles.banner}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={styles.iconBox}>
          <Smartphone size={20} color="#D4AF37" />
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#F5F5F5' }}>
            📱 Installez DigiCouture VIP sur votre écran d'accueil
          </div>
          <div style={{ fontSize: 11, color: '#8B8B94', marginTop: 2 }}>
            Accédez directement à votre atelier, même hors connexion Internet.
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={onInstall} style={styles.installBtn}>
          <Download size={14} />
          Installer DigiCouture
        </button>
        <button onClick={onDismiss} style={styles.dismissBtn} title="Masquer pendant 7 jours">
          Plus tard
        </button>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  banner: {
    position: 'fixed',
    bottom: 20,
    right: 20,
    zIndex: 9000,
    background: '#121216',
    border: '1px solid #D4AF37',
    borderRadius: 16,
    padding: '14px 18px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 20,
    flexWrap: 'wrap',
    maxWidth: 520,
    animation: 'slideUp 0.3s ease-out',
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    background: '#0B0B0D',
    border: '1px solid #24242A',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  installBtn: {
    padding: '8px 14px',
    background: 'linear-gradient(135deg, #D4AF37, #a8862a)',
    border: 'none',
    borderRadius: 8,
    color: '#0B0B0D',
    fontSize: 12,
    fontWeight: 800,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  dismissBtn: {
    padding: '8px 12px',
    background: '#0B0B0D',
    border: '1px solid #24242A',
    borderRadius: 8,
    color: '#8B8B94',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
  },
};
