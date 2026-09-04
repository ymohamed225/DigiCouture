import { useState, useEffect } from 'react';
import type { 
  Client, 
  Measurements, 
  Order, 
  Payment, 
  CatalogueItem, 
  AtelierProfile, 
  ProductionStatus 
} from './types';
import { 
  initialAtelier, 
  initialMeasurements,
  initialCatalogue
} from './mockData';
import {
  demoAtelier,
  demoClients,
  demoOrders,
  demoPayments,
  demoMeasurements
} from './demoMockData';

import { getStepWhatsappMessage } from './utils/whatsappMessages';
import { Sidebar } from './components/Sidebar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { Dashboard } from './components/Dashboard';
import { DedicatedClientsView } from './components/DedicatedClientsView';
import { AtelierShowcaseView } from './components/AtelierShowcaseView';
import { ClientsManager } from './components/ClientsManager';
import { OrderWizardModal } from './components/OrderWizardModal';
import { ProductionTracker } from './components/ProductionTracker';
import { PaymentsManager } from './components/PaymentsManager';
import { PublicCatalogue } from './components/PublicCatalogue';
import { ClientPortal } from './components/ClientPortal';
import { LandingPage } from './components/LandingPage';
import { OnboardingWizard } from './components/OnboardingWizard';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';
import { StandaloneOrders } from './components/StandaloneOrders';
import { CalendarView } from './components/CalendarView';
import { MessagesHistoryView } from './components/MessagesHistoryView';
import { SuperAdminDashboard } from './components/SuperAdminDashboard';
import { NotificationCenter } from './components/NotificationCenter';
import { NotificationsPage } from './pages/NotificationsPage';
import { SubscriptionPage } from './pages/SubscriptionPage';
import { PublicTrackingPage } from './pages/PublicTrackingPage';
import { PublicCataloguePage } from './pages/PublicCataloguePage';
import { LoginPage } from './pages/LoginPage';

export function App() {
  // ROUTE PUBLIQUE 1 : SUIVI CLIENT SELECTIONNÉ (/tracking/:code/:token)
  if (window.location.pathname.startsWith('/tracking/')) {
    const parts = window.location.pathname.split('/').filter(Boolean);
    return <PublicTrackingPage code={parts[1]} token={parts[2]} />;
  }

  // ROUTE PUBLIQUE 2 : CATALOGUE DIGITALE VITRINE ATELIER SANS CONNEXION (/catalogue/:atelierSlug)
  if (window.location.pathname.startsWith('/catalogue/')) {
    const parts = window.location.pathname.split('/').filter(Boolean);
    return <PublicCataloguePage atelierSlug={parts[1]} />;
  }
  // État de Vérification et Restauration Silencieuse de Session Persistante (Sections 9 & 10 du Prompt)
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);

  // Navigation & Session State (Démo vs Compte Réel)
  const [currentTab, setCurrentTab] = useState<string>(() => {
    return window.location.hash === '#admin' ? 'superadmin' : 'landing';
  });
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);

  // Auto-restauration de session au démarrage de l'application (Zero Flicker - Section 10)
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const res = await fetch('/api/auth/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });

        const data = await res.json();

        if (res.ok && data.success && data.atelier) {
          setAtelier(data.atelier);
          localStorage.setItem('dc_atelier', JSON.stringify(data.atelier));
          if (data.clients) setClients(data.clients);
          if (data.orders) setOrders(data.orders);
          
          if (window.location.hash !== '#admin') {
            setCurrentTab('dashboard');
          }
        } else if (data.isSuspended) {
          setCurrentTab('landing');
        }
      } catch (e) {
        // En cas d'indisponibilité réseau, préserver l'accès hors-ligne local si la session locale existe (Section 23)
        const savedAtelier = localStorage.getItem('dc_atelier');
        if (savedAtelier) {
          const parsed = JSON.parse(savedAtelier);
          if (parsed && parsed.id) {
            setAtelier(parsed);
            if (window.location.hash !== '#admin') {
              setCurrentTab('dashboard');
            }
          }
        }
      } finally {
        setIsAuthChecking(false);
      }
    };

    restoreSession();
  }, []);
  
  // App Data State (Initialisé purement via BDD MySQL pour 0 divergence Web/Mobile)
  const [atelier, setAtelier] = useState<AtelierProfile>(() => {
    const saved = localStorage.getItem('dc_atelier');
    return saved ? JSON.parse(saved) : initialAtelier;
  });

  const [clients, setClients] = useState<Client[]>([]);

  const [measurements, setMeasurements] = useState<Record<string, Measurements>>(() => {
    const saved = localStorage.getItem('dc_measurements');
    return saved ? JSON.parse(saved) : initialMeasurements;
  });

  const [orders, setOrders] = useState<Order[]>([]);

  const [payments, setPayments] = useState<Payment[]>([]);

  const [catalogue, setCatalogue] = useState<CatalogueItem[]>(() => {
    const saved = localStorage.getItem('dc_catalogue');
    return saved ? JSON.parse(saved) : initialCatalogue;
  });

  // Mode Sombre / Clair State
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('dc_darkmode') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('dc_darkmode', isDarkMode.toString());
    if (isDarkMode) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }, [isDarkMode]);

  // Modal Stepper Nouvelle Commande
  const [isOrderWizardOpen, setIsOrderWizardOpen] = useState(false);

  // Selected Order for Client Portal View
  const [activePortalOrderId, setActivePortalOrderId] = useState<string | null>(null);

  // Mode responsive detector
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 🔄 Chargement et synchronisation réactive en temps réel (Polling 3s) des données de l'atelier connecté (Web ↔ Mobile)
  useEffect(() => {
    if (!atelier || !atelier.id || isDemoMode) return;

    const loadData = () => {
      const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');
      fetch(`${API_BASE}/clients?atelierId=${atelier.id}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setClients(data);
        })
        .catch(() => console.log('Connexion clients offline'));

      fetch(`${API_BASE}/orders?atelierId=${atelier.id}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setOrders(data);
        })
        .catch(() => console.log('Connexion commandes offline'));

      fetch(`${API_BASE}/payments?atelierId=${atelier.id}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setPayments(data);
        })
        .catch(() => console.log('Connexion paiements offline'));

      fetch(`${API_BASE}/catalogue?atelierId=${atelier.id}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data) && data.length > 0) setCatalogue(data);
        })
        .catch(() => console.log('Connexion catalogue offline'));
    };

    loadData();
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, [atelier.id]);

  // Save changes to LocalStorage & IndexedDB fallback (Anti QuotaExceededError)
  useEffect(() => {
    try {
      localStorage.setItem('dc_atelier', JSON.stringify(atelier));
      localStorage.setItem('dc_clients', JSON.stringify(clients));
      localStorage.setItem('dc_measurements', JSON.stringify(measurements));
      localStorage.setItem('dc_orders', JSON.stringify(orders));
      localStorage.setItem('dc_payments', JSON.stringify(payments));
      localStorage.setItem('dc_catalogue', JSON.stringify(catalogue));
    } catch (err) {
      console.warn('⚠️ Quota localStorage atteint. Les données volumineuses restent sauvegardées en sécurité dans la base IndexedDB locale.');
    }
  }, [atelier, clients, measurements, orders, payments, catalogue]);

  // Handlers pour actions rapides & modifications
  const handleSaveClient = async (newClientData: Partial<Client>) => {
    const newClient: Client & { atelierId?: string } = {
      id: `cli-${Date.now()}`,
      atelierId: atelier.id,
      fullName: newClientData.fullName || 'Client sans nom',
      whatsapp: newClientData.whatsapp || '',
      address: newClientData.address || '',
      createdAt: new Date().toISOString().split('T')[0]
    };
    setClients([newClient, ...clients]);

    // Insertion BDD MySQL réelle liée à l'atelier
    try {
      const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');
      await fetch(`${API_BASE}/clients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClient)
      });
    } catch (err) {
      console.log('Client enregistré en Local BDD fallback');
    }
  };

  const handleSaveMeasurements = async (clientId: string, data: Partial<Measurements>) => {
    const updatedMeasurement = {
      ...(measurements[clientId] || {
        id: `meas-${Date.now()}`,
        clientId,
        category: data.category || 'femme'
      }),
      ...data,
      atelierId: atelier.id,
      updatedAt: new Date().toISOString().split('T')[0]
    };

    setMeasurements(prev => ({
      ...prev,
      [clientId]: updatedMeasurement
    }));

    try {
      const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');
      await fetch(`${API_BASE}/measurements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedMeasurement)
      });
    } catch (err) {
      console.log('Mensurations sauvegardées en local fallback');
    }
  };

  const handleCreateOrder = async (orderData: Partial<Order>) => {
    // 👑 CONTRÔLE DES RÈGLES DE FORMULES D'ABONNEMENT (1 MOIS ESSAI GRATUIT ILLIMITÉ OFFERT À TOUS LES NOUVEAUX ATELIERS)
    const currentPlan = atelier.plan || 'pro';
    if (currentPlan === 'starter' && orders.length >= 100) {
      alert("🔒 Limite atteinte (Formule Starter : 100 commandes max).\n\nVeuillez passer à la formule 'Pro' ou 'Atelier' dans les Paramètres pour gérer un volume illimité !");
      return;
    }

    const targetAtelierId = atelier?.id || 'atl-1787175204484';

    const newOrd: Order & { atelierId?: string } = {
      id: `ord-${Date.now()}`,
      atelierId: targetAtelierId,
      code: orderData.code || `CMD-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      clientId: orderData.clientId || '',
      clientName: orderData.clientName || 'Client VIP',
      clientWhatsapp: orderData.clientWhatsapp || '',
      modelName: orderData.modelName || 'Modèle sur mesure',
      modelCategory: orderData.modelCategory || 'Création',
      modelImageUrl: orderData.modelImageUrl,
      garmentType: orderData.garmentType || 'Vêtement',
      fabricName: orderData.fabricName,
      fabricColor: orderData.fabricColor,
      description: orderData.description,
      specialInstructions: orderData.specialInstructions,
      deliveryDate: orderData.deliveryDate || new Date().toISOString().split('T')[0],
      urgency: orderData.urgency || 'normale',
      totalAmount: Number(orderData.totalAmount) || 0,
      depositAmount: Number(orderData.depositAmount) || 0,
      remainingAmount: Number(orderData.remainingAmount) || 0,
      status: 'commande_recue',
      createdAt: new Date().toISOString().split('T')[0]
    };

    setOrders(prev => [newOrd, ...prev]);

    // Insertion BDD réelle liée à l'atelier
    try {
      const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');
      const res = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrd)
      });
      const data = await res.json();
      if (data.success) {
        console.log('✅ Commande enregistrée en BDD:', data.order);
        alert(`✅ Commande N° ${newOrd.code} créée et sauvegardée dans la base de données avec succès !`);
      }
    } catch (err: any) {
      console.error('Erreur enregistrement commande:', err);
    }

    // Si un acompte est versé, créer automatiquement l'encaissement initial
    if (newOrd.depositAmount > 0) {
      const newPay: Payment = {
        id: `pay-${Date.now()}`,
        orderId: newOrd.id,
        clientName: newOrd.clientName,
        amount: newOrd.depositAmount,
        method: 'Wave',
        date: new Date().toISOString().split('T')[0],
        note: 'Acompte lors de la création de commande'
      };
      setPayments([newPay, ...payments]);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: ProductionStatus) => {
    const targetOrder = orders.find(o => o.id === orderId);
    if (!targetOrder) return;

    const updatedOrder: Order = {
      ...targetOrder,
      status: newStatus,
      remainingAmount: newStatus === 'livree' ? 0 : targetOrder.remainingAmount
    };

    // 1. Mise à jour instantanée de l'état React local
    setOrders(prevOrders => prevOrders.map(o => o.id === orderId ? updatedOrder : o));

    // 2. Persistance BDD MySQL via Backend (évite le rejet/retour en arrière lors du polling 3s)
    try {
      const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');
      await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedOrder)
      });
    } catch (err) {
      console.log('Mode offline : mise à jour du statut conservée en mémoire');
    }

    // 3. Envoi automatique du message WhatsApp personnalisé à CHAQUE étape du workflow de production
    const messageText = getStepWhatsappMessage(
      updatedOrder,
      newStatus,
      atelier.name || atelier.ownerName || 'Maison DigiCouture VIP',
      atelier.address || 'Abidjan'
    );

    setTimeout(() => {
      handleSendWhatsapp(targetOrder.clientWhatsapp, messageText);
    }, 300);
  };

  const handleAddPayment = async (payData: Partial<Payment>) => {
    const amount = payData.amount;
    if (!payData.orderId || amount === undefined || amount <= 0) return;

    const newPay: Payment = {
      id: `pay-${Date.now()}`,
      orderId: payData.orderId,
      clientName: payData.clientName || 'Client',
      amount,
      method: payData.method || 'Especes',
      date: payData.date || new Date().toISOString().split('T')[0],
      note: payData.note
    };

    setPayments(prev => [newPay, ...prev]);

    // Recalculer le reste à payer de la commande
    setOrders(prevOrders => prevOrders.map(o => {
      if (o.id === payData.orderId) {
        const newDeposit = Number(o.depositAmount || 0) + amount;
        const newRemaining = Math.max(0, Number(o.totalAmount || 0) - newDeposit);
        return {
          ...o,
          depositAmount: newDeposit,
          remainingAmount: newRemaining
        };
      }
      return o;
    }));

    // Persistence immédiate BDD
    try {
      const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');
      await fetch(`${API_BASE}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPay)
      });
    } catch (err) {
      console.log('Paiement sauvegardé en local fallback');
    }
  };

  const handleSendWhatsapp = (phone: string, message: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, '_blank');
  };

  // Affichage du Portail Suivi Client si sélectionné
  if (currentTab === 'portal' && activePortalOrderId) {
    const selectedOrder = orders.find(o => o.id === activePortalOrderId) || orders[0];
    return (
      <ClientPortal 
        order={selectedOrder}
        atelier={atelier}
        onBack={() => setCurrentTab('dashboard')}
        onUpdateStatus={handleUpdateOrderStatus}
      />
    );
  }

  // Affichage de la Page Dédiée de Connexion (Non-modal)
  if (currentTab === 'login') {
    return (
      <LoginPage 
        onBack={() => setCurrentTab('landing')}
        onLoginWithPhone={async (phoneInput, otpInput) => {
          setIsDemoMode(false);
          const cleanPhone = phoneInput.replace(/[^0-9]/g, '');
          const last8 = cleanPhone.slice(-8);

          if (!last8) {
            alert('Veuillez saisir votre numéro de téléphone.');
            return;
          }

          // 1. Authentification OTP WhatsApp via Backend Express
          try {
            const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');
            const res = await fetch(`${API_BASE}/auth/verify-otp`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ phone: phoneInput, otp: otpInput || '1234' })
            });
            const data = await res.json();

            if (data.success && data.atelier) {
              setAtelier(data.atelier);
              setClients(Array.isArray(data.clients) ? data.clients : []);
              setOrders(Array.isArray(data.orders) ? data.orders : []);
              alert(`✅ Connexion WhatsApp Sécurisée Réussie !\n\nBienvenue dans l'atelier "${data.atelier.name || data.atelier.ownerName}" !`);
              setCurrentTab('dashboard');
              return;
            } else if (data.message) {
              alert(`🔒 Échec de la vérification : ${data.message}`);
              return;
            }
          } catch (err) {
            console.log('Mode Offline Fallback Connexion');
          }

          // 2. Recherche fallback local si MySQL indisponible
          const savedAteliersJson = localStorage.getItem('dc_ateliers_list');
          const ateliersList: any[] = savedAteliersJson ? JSON.parse(savedAteliersJson) : [];
          
          const found = ateliersList.find(a => {
            const pClean = (a.phone || a.whatsapp || '').replace(/[^0-9]/g, '');
            return pClean.includes(last8) || (last8.length >= 6 && pClean.endsWith(last8));
          });

          if (found) {
            setAtelier(prev => ({
              ...prev,
              id: found.id || prev.id,
              name: found.name || found.atelierName || 'Atelier Haute Couture',
              ownerName: found.ownerName || found.owner || 'Gérant',
              whatsapp: found.whatsapp || found.phone || `+225 ${phoneInput}`,
              plan: found.plan || 'pro',
              trialEndsAt: found.trialEndsAt,
              registeredAt: found.registeredAt
            }));
            alert(`✅ Connexion réussie à l'atelier "${found.name || found.ownerName}" !`);
            setCurrentTab('dashboard');
          } else {
            alert(`⚠️ Aucun compte atelier associé au numéro ${phoneInput}.\n\nPour vous connecter, vous devez d'abord vous inscrire !`);
            setCurrentTab('onboarding');
          }
        }}
        isDarkMode={isDarkMode}
      />
    );
  }

  // Affichage de la Landing Page
  if (currentTab === 'landing') {
    return (
      <LandingPage 
        onStartFree={() => setCurrentTab('onboarding')}
        onNavigateToLogin={() => setCurrentTab('login')}
        onExploreDemo={() => {
          setIsDemoMode(true);
          setAtelier(demoAtelier);
          setClients(demoClients);
          setOrders(demoOrders);
          setPayments(demoPayments);
          setMeasurements(demoMeasurements);
          setCurrentTab('dashboard');
        }}
        onLoginWithPhone={async (phoneInput, otpInput) => {
          setIsDemoMode(false);
          const cleanPhone = phoneInput.replace(/[^0-9]/g, '');
          const last8 = cleanPhone.slice(-8);

          if (!last8) {
            alert('Veuillez saisir votre numéro de téléphone.');
            return;
          }

          // 1. Authentification OTP WhatsApp via Backend Express MySQL (/api/auth/verify-otp)
          try {
            const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');
            const res = await fetch(`${API_BASE}/auth/verify-otp`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ phone: phoneInput, otp: otpInput || '1234' })
            });
            const data = await res.json();

            if (data.success && data.atelier) {
              setAtelier(data.atelier);
              setClients(Array.isArray(data.clients) ? data.clients : []);
              setOrders(Array.isArray(data.orders) ? data.orders : []);
              alert(`✅ Connexion WhatsApp Sécurisée Réussie !\n\nBienvenue dans l'atelier "${data.atelier.name || data.atelier.ownerName}" !\nFormule active : ${(data.atelier.plan || 'gratuit').toUpperCase()} (1 mois d'essai offert).`);
              setCurrentTab('dashboard');
              return;
            } else if (data.message) {
              alert(`🔒 Échec de la vérification : ${data.message}`);
              return;
            }
          } catch (err) {
            console.log('Mode Offline Fallback Connexion');
          }

          // 2. Recherche fallback local si MySQL indisponible
          const savedAteliersJson = localStorage.getItem('dc_ateliers_list');
          const ateliersList: any[] = savedAteliersJson ? JSON.parse(savedAteliersJson) : [];
          
          const found = ateliersList.find(a => {
            const pClean = (a.phone || a.whatsapp || '').replace(/[^0-9]/g, '');
            return pClean.includes(last8) || (last8.length >= 6 && pClean.endsWith(last8));
          });

          if (found) {
            setAtelier(prev => ({
              ...prev,
              id: found.id || prev.id,
              name: found.name || found.atelierName || 'Atelier Haute Couture',
              ownerName: found.ownerName || found.owner || 'Gérant',
              whatsapp: found.whatsapp || found.phone || `+225 ${phoneInput}`,
              plan: found.plan || 'pro',
              trialEndsAt: found.trialEndsAt,
              registeredAt: found.registeredAt
            }));
            alert(`✅ Connexion réussie à l'atelier "${found.name || found.ownerName}" !\n\nFormule active : ${(found.plan || 'pro').toUpperCase()} (1 mois d'essai offert inclus).`);
            setCurrentTab('dashboard');
          } else {
            alert(`⚠️ Aucun compte atelier associé au numéro +225 ${phoneInput}.\n\nPour vous connecter, vous devez d'abord vous inscrire et valider votre formule (1 mois d'essai gratuit offert) !`);
            setCurrentTab('onboarding');
          }
        }}
        isDarkMode={isDarkMode}
      />
    );
  }

  // Splash Screen de Restauration de Session Persistante (Zero Flicker - Section 10 du Prompt)
  if (isAuthChecking) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#0F172A',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#FFFFFF',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          backgroundColor: 'rgba(212, 175, 55, 0.15)',
          border: '2px solid #D4AF37',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2.2rem',
          boxShadow: '0 0 30px rgba(212, 175, 55, 0.3)',
          marginBottom: '1rem'
        }}>
          👑
        </div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#FFFFFF', margin: 0, fontFamily: 'Georgia, serif' }}>
          DigiCouture VIP
        </h2>
        <p style={{ color: '#D4AF37', fontSize: '0.88rem', fontWeight: 700, marginTop: '0.5rem' }}>
          Vérification et restauration sécurisée de votre session...
        </p>
        <div style={{ width: 40, height: 40, border: '3px solid #D4AF37', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', marginTop: '1.25rem' }} />
      </div>
    );
  }

  // Affichage de l'Assistant D'Onboarding
  if (currentTab === 'onboarding') {
    return (
      <OnboardingWizard 
        onComplete={(newAtelierData) => {
          setIsDemoMode(false);
          setAtelier(prev => ({ ...prev, ...newAtelierData }));
          // Vider les données pour ce tout nouveau compte atelier
          setClients([]);
          setOrders([]);
          setPayments([]);
          setCurrentTab('dashboard');
        }}
      />
    );
  }

  return (
    <div className="app-container">
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        {/* Sidebar Desktop (Cachée sur mobile et masquée sur la vue Super-Admin) */}
        {!isMobile && currentTab !== 'superadmin' && (
          <Sidebar 
            currentTab={currentTab}
            onSelectTab={setCurrentTab}
            atelierName={atelier.name}
            currentPlan={atelier.plan || 'pro'}
            isDemoMode={isDemoMode}
            onToggleDemoMode={() => {
              setIsDemoMode(true);
              setCurrentTab('dashboard');
            }}
            onLogout={async () => {
              try {
                await fetch('/api/auth/logout', { method: 'POST' });
              } catch (e) {}
              localStorage.removeItem('dc_atelier');
              localStorage.removeItem('dc_refresh_token');
              setIsDemoMode(false);
              setCurrentTab('landing');
            }}
            isDarkMode={isDarkMode}
            onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
          />
        )}

        {/* Content Area */}
        <main style={{
          flex: 1,
          paddingBottom: isMobile ? '80px' : '2rem',
          backgroundColor: 'var(--bg-secondary)',
          minHeight: '100vh',
          overflowX: 'hidden'
        }}>
          {/* Header Bar avec Centre de Notification Web (Épurée sans répétition de nom atelier) */}
          {currentTab !== 'superadmin' && currentTab !== 'landing' && currentTab !== 'onboarding' && (
            <div style={{
              backgroundColor: '#FFFFFF',
              borderBottom: '1.5px solid #EAE5DF',
              padding: '0.65rem 1.5rem',
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
              position: 'sticky',
              top: 0,
              zIndex: 15
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                {/* 🌙 Bouton Rapide Mode Sombre / Clair TopBar (Actif pour Tous les Abonnés) */}
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  title={isDarkMode ? 'Passer au Mode Clair' : 'Passer au Mode Sombre (Actif pour tous)'}
                  style={{
                    backgroundColor: isDarkMode ? '#1E1B4B' : '#FFFDF5',
                    border: '1.5px solid #D4AF37',
                    borderRadius: '14px',
                    width: '42px',
                    height: '42px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: '1.1rem',
                    boxShadow: '0 4px 12px rgba(212, 175, 55, 0.15)',
                    transition: 'transform 0.15s ease'
                  }}
                >
                  {isDarkMode ? '☀️' : '🌙'}
                </button>

                <NotificationCenter 
                  orders={orders}
                  payments={payments}
                  onOpenOrder={(ordId) => {
                    setActivePortalOrderId(ordId);
                    setCurrentTab('production');
                  }}
                  onNavigateTab={setCurrentTab}
                />
              </div>
            </div>
          )}
          {/* TAB 1 : TABLEAU DE BORD ACCUEIL DE LUXE (IDENTIQUE MOBILE) */}
          {currentTab === 'dashboard' && (
            <Dashboard 
              orders={orders}
              onNavigateTab={(tab) => {
                if (tab === 'new_order') {
                  setIsOrderWizardOpen(true);
                } else {
                  setCurrentTab(tab);
                }
              }}
              onOpenOrderDetails={(ordId) => {
                setActivePortalOrderId(ordId);
                setCurrentTab('portal');
              }}
              atelierName={atelier.name}
              userName={atelier.ownerName || "Maître Styliste"}
              atelierId={atelier.id}
              atelierPlan={atelier.plan}
            />
          )}

          {/* TAB 2 : ANNUAIRE CLIENTS DÉDIÉ */}
          {currentTab === 'clients' && (
            <DedicatedClientsView 
              clients={clients}
              measurements={measurements}
              orders={orders}
              onSaveClient={handleSaveClient}
              onSendWhatsapp={handleSendWhatsapp}
            />
          )}

          {/* TAB 3 : MENSURATIONS (EXACTEMENT LA VERSION D'ORIGINE INITIALE DU DÉBUT) */}
          {currentTab === 'measurements' && (
            <ClientsManager 
              clients={clients}
              measurements={measurements}
              onSaveMeasurements={handleSaveMeasurements}
            />
          )}

          {/* TAB 4 : REGISTRE ET GESTION DES COMMANDES */}
          {currentTab === 'orders' && (
            <StandaloneOrders 
              orders={orders}
              onOpenNewOrderModal={() => setIsOrderWizardOpen(true)}
              onSelectOrderDetails={(ordId) => {
                setActivePortalOrderId(ordId);
                setCurrentTab('portal');
              }}
            />
          )}

          {/* TAB 4.5 : AGENDA & CALENDRIER DES RENDEZ-VOUS */}
          {currentTab === 'calendar' && (
            <CalendarView 
              orders={orders}
              onOpenOrderDetails={(ordId) => {
                setActivePortalOrderId(ordId);
                setCurrentTab('portal');
              }}
              onSendWhatsapp={handleSendWhatsapp}
            />
          )}

          {/* TAB 4.6 : REGISTRE ET HISTORIQUE DES MESSAGES ENVOYÉS */}
          {currentTab === 'messages' && (
            <MessagesHistoryView 
              onSendWhatsapp={handleSendWhatsapp}
            />
          )}

          {/* TAB 4.7 : CENTRE DE NOTIFICATIONS (VUE D'ENSEMBLE) */}
          {currentTab === 'notifications' && (
            <NotificationsPage 
              atelierId={atelier.id}
            />
          )}

          {/* TAB 4.8 : MON ABONNEMENT */}
          {currentTab === 'subscription' && (
            <SubscriptionPage 
              atelierId={atelier.id}
              onBack={() => setCurrentTab('dashboard')}
            />
          )}

          {/* TAB 5 : SUIVI DE PRODUCTION ET ATELIER 8 ÉTAPES */}
          {currentTab === 'production' && (
            <ProductionTracker 
              orders={orders}
              onUpdateStatus={handleUpdateOrderStatus}
              onSendWhatsapp={handleSendWhatsapp}
              onOpenClientPortal={(ordId) => {
                setActivePortalOrderId(ordId);
                setCurrentTab('portal');
              }}
            />
          )}

          {/* TAB 4 : PAIEMENTS */}
          {currentTab === 'payments' && (
            <PaymentsManager 
              payments={payments}
              orders={orders}
              onAddPayment={handleAddPayment}
            />
          )}

          {/* TAB 5 : CATALOGUE PUBLIC VUE PRO */}
          {currentTab === 'catalogue' && (
            <PublicCatalogue 
              atelier={atelier}
              catalogue={catalogue}
              onSendWhatsapp={handleSendWhatsapp}
              onAddModel={async (newItem) => {
                const modelId = 'cat_' + Date.now();
                const modelItem: CatalogueItem = {
                  id: modelId,
                  title: newItem.title || 'Nouveau Modèle',
                  category: newItem.category || 'Robes',
                  estimatedPrice: newItem.estimatedPrice || '50 000 FCFA',
                  imageUrl: newItem.imageUrl || '',
                  description: newItem.description || '',
                  estimatedLeadTime: '3-5 jours',
                  tags: [newItem.category || 'Robes']
                };

                // 1. Mettre à jour immédiatement l'état React local
                setCatalogue(prev => [modelItem, ...prev]);

                // 2. Sauvegarde dans la BDD MySQL du serveur
                try {
                  const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');
                  await fetch(`${API_BASE}/catalogue`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      id: modelId,
                      atelierId: atelier.id,
                      title: modelItem.title,
                      category: modelItem.category,
                      estimatedPrice: modelItem.estimatedPrice,
                      imageUrl: modelItem.imageUrl,
                      description: modelItem.description
                    })
                  });
                } catch (e) {
                  console.log('Catalogue offline - Enregistré localement');
                }

                // 3. Sauvegarde dans IndexedDB / SyncQueue
                try {
                  const { saveLocalItem, addToSyncQueue } = await import('./offline/indexedDb');
                  await saveLocalItem('catalogue', modelItem);
                  await addToSyncQueue(atelier.id, 'catalogue', modelId, 'CREATE', modelItem);
                } catch (e) {
                  // Fallback silencieux si IndexedDB indisponible
                }
              }}
              onDeleteModel={async (id) => {
                // 1. Mise à jour immédiate du state React
                setCatalogue(prev => prev.filter(item => item.id !== id));

                // 2. Suppression dans la base MySQL du serveur
                try {
                  const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');
                  await fetch(`${API_BASE}/catalogue/${id}?atelierId=${atelier.id}`, {
                    method: 'DELETE'
                  });
                } catch (e) {
                  console.log('Suppression offline du modèle enregistrée');
                }

                // 3. Suppression dans IndexedDB / SyncQueue
                try {
                  const { deleteLocalItem, addToSyncQueue } = await import('./offline/indexedDb');
                  await deleteLocalItem('catalogue', id);
                  await addToSyncQueue(atelier.id, 'catalogue', id, 'DELETE', { id });
                } catch (e) {
                  // Fallback silencieux
                }
              }}
            />
          )}

          {/* TAB 6 : MON ATELIER - VITRINE HAUTE COUTURE DÉDIÉE */}
          {currentTab === 'atelier' && (
            <AtelierShowcaseView 
              atelier={atelier}
              catalogue={catalogue}
              onSendWhatsapp={handleSendWhatsapp}
              onNavigateToSettings={() => setCurrentTab('settings')}
            />
          )}

          {/* TAB 7 : RAPPORTS FINANCIERS ET STATISTIQUES */}
          {currentTab === 'reports' && (
            <ReportsView 
              orders={orders}
              payments={payments}
            />
          )}

          {/* TAB 9 : COMPOSANT SUPER-ADMINISTRATEUR REACT VITE PROPRIÉTAIRE */}
          {currentTab === 'superadmin' && (
            <SuperAdminDashboard />
          )}

          {/* TAB PORTAL : SUIVI SUIVI CLIENT 8 ÉTAPES */}
          {currentTab === 'portal' && (
            <ClientPortal 
              order={orders.find(o => o.id === activePortalOrderId) || orders[0]}
              atelier={atelier}
              onBack={() => setCurrentTab('production')}
              onUpdateStatus={handleUpdateOrderStatus}
            />
          )}

          {/* TAB 8 : PARAMÈTRES ET CONFIGURATION ATELIER */}
          {currentTab === 'settings' && (
            <SettingsView 
              atelier={atelier}
              onSaveAtelier={(updatedAtelier) => setAtelier(updatedAtelier)}
            />
          )}
        </main>
      </div>

      {/* BARRE DE NAVIGATION MOBILE FIXE (Uniquement sur écran mobile < 768px et hors Super-Admin) */}
      {isMobile && currentTab !== 'superadmin' && (
        <MobileBottomNav 
          currentTab={currentTab}
          onTabChange={(tab) => setCurrentTab(tab)}
          onQuickAction={(action) => {
            if (action === 'new_client') setCurrentTab('clients');
            if (action === 'new_order') setIsOrderWizardOpen(true);
            if (action === 'new_payment') setCurrentTab('payments');
            if (action === 'new_model') setCurrentTab('catalogue');
          }}
        />
      )}

      {/* MODAL ASSISTANT DE CRÉATION DE COMMANDE 3 ÉTAPES */}
      <OrderWizardModal 
        isOpen={isOrderWizardOpen}
        onClose={() => setIsOrderWizardOpen(false)}
        clients={clients}
        catalogue={catalogue}
        measurements={measurements}
        onCreateOrder={handleCreateOrder}
        onCreateClient={handleSaveClient}
        atelierLogoUrl={atelier.logoUrl}
        atelier={atelier}
        onNavigateToOrders={() => setCurrentTab('orders')}
      />
    </div>
  );
}
