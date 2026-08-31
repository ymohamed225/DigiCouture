import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, Download } from 'lucide-react';
import { syncEngine, type NetworkSyncStatus } from '../offline/syncEngine';

export const NetworkStatusBadge: React.FC = () => {
  const [status, setStatus] = useState<NetworkSyncStatus>(syncEngine.getStatus());
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = syncEngine.subscribe((newStatus, pending) => {
      setStatus(newStatus);
      setPendingCount(pending);
    });

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      unsubscribe();
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          setIsInstalled(true);
        }
        setDeferredPrompt(null);
      });
    }
  };

  const getBadgeContent = () => {
    if (status === 'OFFLINE') {
      return {
        label: pendingCount > 0 ? `🔴 Hors connexion (${pendingCount} en attente)` : '🔴 Hors connexion',
        bg: 'rgba(239,68,68,0.15)',
        color: '#EF4444',
        border: '1px solid rgba(239,68,68,0.3)',
        icon: <WifiOff size={12} color="#EF4444" />,
      };
    }
    if (status === 'SYNCING') {
      return {
        label: '🟠 Synchronisation...',
        bg: 'rgba(245,158,11,0.15)',
        color: '#F59E0B',
        border: '1px solid rgba(245,158,11,0.3)',
        icon: <RefreshCw size={12} className="spin" color="#F59E0B" />,
      };
    }
    if (status === 'SYNC_ERROR') {
      return {
        label: `⚠️ Erreur Synchro (${pendingCount})`,
        bg: 'rgba(245,158,11,0.15)',
        color: '#F59E0B',
        border: '1px solid rgba(245,158,11,0.3)',
        icon: <WifiOff size={12} color="#F59E0B" />,
      };
    }
    if (pendingCount > 0) {
      return {
        label: `🔄 ${pendingCount} à synchroniser`,
        bg: 'rgba(59,130,246,0.15)',
        color: '#3B82F6',
        border: '1px solid rgba(59,130,246,0.3)',
        icon: <RefreshCw size={12} color="#3B82F6" />,
      };
    }
    return {
      label: '🟢 En ligne',
      bg: 'rgba(34,197,94,0.15)',
      color: '#22C55E',
      border: '1px solid rgba(34,197,94,0.3)',
      icon: <Wifi size={12} color="#22C55E" />,
    };
  };

  const badge = getBadgeContent();

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      {/* Badge statut réseau */}
      <div
        onClick={() => syncEngine.triggerSync()}
        title="Cliquer pour forcer la synchronisation"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          backgroundColor: badge.bg,
          color: badge.color,
          border: badge.border,
          borderRadius: 20,
          padding: '4px 10px',
          fontSize: 11,
          fontWeight: 700,
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        {badge.icon}
        <span>{badge.label}</span>
      </div>

      {/* Bouton Installer PWA */}
      {deferredPrompt && !isInstalled && (
        <button
          onClick={handleInstallClick}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            backgroundColor: 'linear-gradient(135deg, #D4AF37, #a8862a)',
            background: '#D4AF37',
            color: '#0B0B0D',
            border: 'none',
            borderRadius: 20,
            padding: '4px 12px',
            fontSize: 11,
            fontWeight: 800,
            cursor: 'pointer',
          }}
        >
          <Download size={12} />
          Installer App
        </button>
      )}
    </div>
  );
};
