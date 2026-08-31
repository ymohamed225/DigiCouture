import React from 'react';
import { Download, X, Smartphone, Monitor, Share, MoreVertical, ShieldCheck } from 'lucide-react';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInstall: () => void;
  platform: 'ios' | 'android' | 'desktop_chrome' | 'other';
  isInstallable: boolean;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({
  isOpen,
  onClose,
  onInstall,
  platform,
  isInstallable,
}) => {
  if (!isOpen) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modalCard}>
        {/* Header */}
        <div style={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={styles.logoBox}>
              <Download size={20} color="#D4AF37" />
            </div>
            <div>
              <h2 style={styles.title}>Installer DigiCouture VIP</h2>
              <span style={styles.subtitle}>Application pour Ordinateur &amp; Smartphone</span>
            </div>
          </div>
          <button onClick={onClose} style={styles.closeBtn}>
            <X size={18} color="#8B8B94" />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ margin: '20px 0' }}>
          <p style={styles.description}>
            Profitez d'un accès ultra-rapide en 1 clic depuis votre écran d'accueil, sans ouvrir votre navigateur et avec le mode hors-ligne activé.
          </p>

          {/* Direct Install Button if Prompt Ready */}
          {isInstallable ? (
            <button onClick={onInstall} style={styles.primaryInstallBtn}>
              <Download size={18} />
              ⬇️ Lancer l'installation de DigiCouture
            </button>
          ) : null}

          {/* Platform Specific Instructions */}
          <div style={styles.guideBox}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#D4AF37', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              {platform === 'ios' ? <Smartphone size={16} /> : <Monitor size={16} />}
              Instructions d'installation pour votre appareil :
            </div>

            {platform === 'ios' && (
              <div style={styles.stepList}>
                <div style={styles.stepItem}>
                  <span style={styles.stepNum}>1</span>
                  <span>Appuyez sur le bouton <strong>Partager <Share size={14} style={{ display: 'inline' }} /></strong> dans Safari (en bas de votre écran).</span>
                </div>
                <div style={styles.stepItem}>
                  <span style={styles.stepNum}>2</span>
                  <span>Défilez vers le bas et choisissez <strong>« Sur l'écran d'accueil »</strong>.</span>
                </div>
                <div style={styles.stepItem}>
                  <span style={styles.stepNum}>3</span>
                  <span>Validez en cliquant sur <strong>« Ajouter »</strong> en haut à droite.</span>
                </div>
              </div>
            )}

            {platform === 'android' && (
              <div style={styles.stepList}>
                <div style={styles.stepItem}>
                  <span style={styles.stepNum}>1</span>
                  <span>Ouvrez le menu du navigateur Chrome <strong><MoreVertical size={14} style={{ display: 'inline' }} /></strong> (en haut à droite).</span>
                </div>
                <div style={styles.stepItem}>
                  <span style={styles.stepNum}>2</span>
                  <span>Sélectionnez <strong>« Installer l'application »</strong> ou <strong>« Ajouter à l'écran d'accueil »</strong>.</span>
                </div>
                <div style={styles.stepItem}>
                  <span style={styles.stepNum}>3</span>
                  <span>Confirmez en appuyant sur <strong>« Installer »</strong>.</span>
                </div>
              </div>
            )}

            {(platform === 'desktop_chrome' || platform === 'other') && (
              <div style={styles.stepList}>
                <div style={styles.stepItem}>
                  <span style={styles.stepNum}>1</span>
                  <span>Cliquez sur l'icône d'installation <strong>⬇️</strong> située à droite dans la barre d'adresse de votre navigateur.</span>
                </div>
                <div style={styles.stepItem}>
                  <span style={styles.stepNum}>2</span>
                  <span>Ou ouvrez le menu <strong>⋮</strong> puis cliquez sur <strong>« Installer DigiCouture VIP »</strong>.</span>
                </div>
                <div style={styles.stepItem}>
                  <span style={styles.stepNum}>3</span>
                  <span>L'application sera ajoutée à votre Bureau et votre Menu Démarrer.</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Guarantee */}
        <div style={styles.footerNote}>
          <ShieldCheck size={16} color="#22C55E" />
          <span>L'installation PWA est 100% sécurisée, sans téléchargement d'exécutable lourd ni virus.</span>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: 20,
  },
  modalCard: {
    background: '#121216',
    border: '1px solid #24242A',
    borderRadius: 20,
    padding: 24,
    maxWidth: 480,
    width: '100%',
    boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    background: '#0B0B0D',
    border: '1px solid #24242A',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 800,
    color: '#F5F5F5',
    margin: 0,
  },
  subtitle: {
    fontSize: 12,
    color: '#8B8B94',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 6,
  },
  description: {
    fontSize: 13,
    color: '#8B8B94',
    lineHeight: 1.5,
    margin: '0 0 16px',
  },
  primaryInstallBtn: {
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(135deg, #D4AF37, #a8862a)',
    border: 'none',
    borderRadius: 10,
    color: '#0B0B0D',
    fontSize: 14,
    fontWeight: 800,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  guideBox: {
    background: '#0B0B0D',
    border: '1px solid #24242A',
    borderRadius: 12,
    padding: 16,
  },
  stepList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  stepItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    fontSize: 12,
    color: '#F5F5F5',
    lineHeight: 1.4,
  },
  stepNum: {
    width: 20,
    height: 20,
    borderRadius: '50%',
    background: '#D4AF37',
    color: '#0B0B0D',
    fontSize: 11,
    fontWeight: 800,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  footerNote: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 11,
    color: '#8B8B94',
    paddingTop: 12,
    borderTop: '1px solid #1E1E24',
  },
};
