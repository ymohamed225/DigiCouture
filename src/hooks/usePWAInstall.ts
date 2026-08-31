// ─────────────────────────────────────────────────────────────────────────────
// DIGICOUTURE VIP — Hook de Gestion de l'Installation PWA (usePWAInstall)
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react';

export interface UsePWAInstallReturn {
  isInstallable: boolean;
  isInstalled: boolean;
  isStandalone: boolean;
  showBanner: boolean;
  showGuideModal: boolean;
  promptInstall: () => Promise<void>;
  dismissBanner: () => void;
  closeGuideModal: () => void;
  getBrowserPlatform: () => 'ios' | 'android' | 'desktop_chrome' | 'other';
}

export function usePWAInstall(): UsePWAInstallReturn {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [showBanner, setShowBanner] = useState<boolean>(false);
  const [showGuideModal, setShowGuideModal] = useState<boolean>(false);

  useEffect(() => {
    // 1. Détecter si l'application s'exécute déjà en mode Standalone (déjà installée)
    const checkStandalone = () => {
      const isStandaloneMedia = window.matchMedia('(display-mode: standalone)').matches;
      const isNavStandalone = (navigator as any).standalone === true;
      const standalone = isStandaloneMedia || isNavStandalone;

      setIsStandalone(standalone);
      setIsInstalled(standalone);
    };

    checkStandalone();

    // 2. Intercepter l'événement beforeinstallprompt du navigateur
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);

      // Vérifier si la bannière a été rejetée récemment (pendant 7 jours)
      const dismissedUntil = localStorage.getItem('dc_pwa_banner_dismissed');
      if (!dismissedUntil || Date.now() > Number(dismissedUntil)) {
        setShowBanner(true);
      }
    };

    // 3. Écouter l'événement appinstalled
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsStandalone(true);
      setDeferredPrompt(null);
      setShowBanner(false);
      localStorage.setItem('dc_pwa_installed', 'true');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const getBrowserPlatform = (): 'ios' | 'android' | 'desktop_chrome' | 'other' => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(userAgent)) return 'ios';
    if (/android/.test(userAgent)) return 'android';
    if (/chrome|edg/.test(userAgent) && !/mobile/.test(userAgent)) return 'desktop_chrome';
    return 'other';
  };

  const promptInstall = useCallback(async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
        setIsStandalone(true);
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    } else {
      // Si le prompt natif n'est pas prêt ou non supporté (ex: iOS Safari), ouvrir le modal d'aide
      setShowGuideModal(true);
    }
  }, [deferredPrompt]);

  const dismissBanner = useCallback(() => {
    setShowBanner(false);
    // Masquer la bannière pendant 7 jours
    const nextWeek = Date.now() + 7 * 24 * 60 * 60 * 1000;
    localStorage.setItem('dc_pwa_banner_dismissed', String(nextWeek));
  }, []);

  const closeGuideModal = useCallback(() => {
    setShowGuideModal(false);
  }, []);

  return {
    isInstallable: !!deferredPrompt || (!isInstalled && !isStandalone),
    isInstalled,
    isStandalone,
    showBanner: showBanner && !isInstalled && !isStandalone,
    showGuideModal,
    promptInstall,
    dismissBanner,
    closeGuideModal,
    getBrowserPlatform,
  };
}
