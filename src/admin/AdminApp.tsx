import React, { useState } from 'react';
import { AdminLayout } from './components/AdminLayout';
import { AdminDashboard } from './pages/AdminDashboard';
import { AteliersPage } from './pages/AteliersPage';
import { AtelierDetailPage } from './pages/AtelierDetailPage';
import { AbonnementsPage } from './pages/AbonnementsPage';
import { PlansPage } from './pages/PlansPage';
import { PaiementsSaasPage } from './pages/PaiementsSaasPage';
import { RevenusPage } from './pages/RevenusPage';
import { UsagePage } from './pages/UsagePage';
import { SupportPage } from './pages/SupportPage';
import { CommunicationPage } from './pages/CommunicationPage';
import { AlertesPage } from './pages/AlertesPage';
import { AuditPage } from './pages/AuditPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { IntegrationsPage } from './pages/IntegrationsPage';
import { SecuritePage } from './pages/SecuritePage';
import { ParametresPage } from './pages/ParametresPage';
import { type AdminPage } from './components/AdminSidebar';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { PWAInstallBanner } from '../components/PWAInstallBanner';
import { PWAInstallModal } from '../components/PWAInstallModal';
import { Lock, Sparkles } from 'lucide-react';

export function AdminApp() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('vite_admin_auth') === 'true';
  });
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  // Routing local simple pour éviter de casser la navigation globale par currentTab
  const [currentPage, setCurrentPage] = useState<AdminPage>('dashboard');
  const [selectedAtelierId, setSelectedAtelierId] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);

    // Simulation de l'authentification avec le mot de passe d'origine pour compatibilité ascendante
    setTimeout(() => {
      if (password === 'admin123') {
        sessionStorage.setItem('vite_admin_auth', 'true');
        sessionStorage.setItem('dc_admin_token', 'superadmin-token-secret');
        setIsAuthenticated(true);
      } else {
        setError(true);
      }
      setLoading(false);
    }, 600);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('vite_admin_auth');
    sessionStorage.removeItem('dc_admin_token');
    setIsAuthenticated(false);
    setCurrentPage('dashboard');
  };

  // Rendu de la page courante selon le routage SaaS Platform
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <AdminDashboard onNavigate={(page) => setCurrentPage(page as any)} />;
      case 'ateliers':
        return (
          <AteliersPage
            onSelectAtelier={(id) => {
              setSelectedAtelierId(id);
              setCurrentPage('ateliers-detail');
            }}
          />
        );
      case 'ateliers-detail':
        return selectedAtelierId ? (
          <AtelierDetailPage
            atelierId={selectedAtelierId}
            onBack={() => setCurrentPage('ateliers')}
          />
        ) : null;
      case 'abonnements':
        return <AbonnementsPage />;
      case 'plans':
        return <PlansPage />;
      case 'paiements-saas':
        return <PaiementsSaasPage />;
      case 'revenus':
        return <RevenusPage />;
      case 'usage':
        return <UsagePage />;
      case 'support':
        return <SupportPage />;
      case 'communication':
        return <CommunicationPage />;
      case 'alertes':
        return <AlertesPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'audit':
        return <AuditPage />;
      case 'integrations':
        return <IntegrationsPage />;
      case 'securite':
        return <SecuritePage />;
      case 'parametres':
        return <ParametresPage />;
      // Pages système — squelette en attente d'implémentation
      case 'profil':
      default:
        return (
          <div style={{ padding: 32 }}>
            <div style={{
              background: '#121216', border: '1px solid #24242A',
              borderRadius: 12, padding: 32, maxWidth: 480,
            }}>
              <div style={{ fontSize: 32, marginBottom: 16 }}>🚧</div>
              <h2 style={{ color: '#F5F5F5', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
                Module en construction
              </h2>
              <p style={{ color: '#8B8B94', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
                Le module <strong style={{ color: '#D4AF37' }}>{currentPage}</strong> sera disponible dans la
                prochaine version du Platform Admin.
              </p>
            </div>
          </div>
        );
    }
  };

  // Écran d'authentification premium Haute Couture
  if (!isAuthenticated) {
    return (
      <div style={loginStyles.container}>
        <div style={loginStyles.card}>
          <div style={loginStyles.logoBox}>
            <Sparkles size={24} color="#D4AF37" />
          </div>
          <h2 style={loginStyles.title}>DigiCouture VIP</h2>
          <p style={loginStyles.subtitle}>Console d'administration plateforme SaaS</p>

          <form onSubmit={handleLogin} style={loginStyles.form}>
            <div style={loginStyles.inputGroup}>
              <label style={loginStyles.label}>Code d'accès administrateur</label>
              <div style={loginStyles.inputWrapper}>
                <Lock size={16} style={loginStyles.inputIcon} />
                <input
                  type="password"
                  placeholder="Saisissez votre code d'accès"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={loginStyles.input}
                  required
                />
              </div>
            </div>

            {error && (
              <div style={loginStyles.errorMsg}>
                ⚠️ Code d'accès incorrect. Veuillez réessayer.
              </div>
            )}

            <button type="submit" disabled={loading} style={loginStyles.button}>
              {loading ? 'Connexion en cours...' : 'Se connecter au back-office'}
            </button>
          </form>

          <div style={loginStyles.footer}>
            Accès restreint aux seuls administrateurs autorisés.
          </div>
        </div>
      </div>
    );
  }

  const {
    isInstallable,
    showBanner,
    showGuideModal,
    promptInstall,
    dismissBanner,
    closeGuideModal,
    getBrowserPlatform,
  } = usePWAInstall();

  return (
    <>
      <AdminLayout
        currentPage={currentPage}
        onNavigate={(page) => {
          if (page === 'ateliers-detail') return;
          setCurrentPage(page);
        }}
        onLogout={handleLogout}
        adminName="Super Admin"
        onInstallClick={promptInstall}
      >
        {renderPage()}
      </AdminLayout>

      <PWAInstallBanner
        show={showBanner}
        onInstall={promptInstall}
        onDismiss={dismissBanner}
      />

      <PWAInstallModal
        isOpen={showGuideModal}
        onClose={closeGuideModal}
        onInstall={promptInstall}
        platform={getBrowserPlatform()}
        isInstallable={isInstallable}
      />
    </>
  );
}

const loginStyles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0B0B0D',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    padding: 16,
  },
  card: {
    background: '#121216',
    border: '1px solid #24242A',
    borderRadius: 16,
    padding: '40px 32px',
    maxWidth: 400,
    width: '100%',
    textAlign: 'center',
    boxShadow: '0 24px 64px rgba(0, 0, 0, 0.6)',
  },
  logoBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    background: 'rgba(212, 175, 55, 0.08)',
    border: '1px solid rgba(212, 175, 55, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
  },
  title: {
    fontSize: 22,
    fontWeight: 800,
    color: '#D4AF37',
    letterSpacing: '0.5px',
    margin: 0,
  },
  subtitle: {
    fontSize: 13,
    color: '#8B8B94',
    marginTop: 6,
    marginBottom: 32,
  },
  form: {
    textAlign: 'left',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    display: 'block',
    fontSize: 11,
    fontWeight: 600,
    color: '#8B8B94',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: 8,
  },
  inputWrapper: {
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    left: 12,
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#4a4a56',
  },
  input: {
    width: '100%',
    background: '#0B0B0D',
    border: '1px solid #24242A',
    borderRadius: 8,
    padding: '10px 12px 10px 38px',
    color: '#F5F5F5',
    fontSize: 13,
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  errorMsg: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: 600,
    marginBottom: 16,
  },
  button: {
    width: '100%',
    background: 'linear-gradient(135deg, #D4AF37, #a8862a)',
    border: 'none',
    borderRadius: 8,
    color: '#0B0B0D',
    padding: '12px',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  },
  footer: {
    fontSize: 11,
    color: '#4a4a56',
    marginTop: 28,
  },
};
