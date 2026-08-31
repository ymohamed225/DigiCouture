import React, { useState } from 'react';
import { 
  Globe, 
  Database, 
  Save, 
  CheckCircle2, 
  RefreshCw,
  Bell,
  Sliders
} from 'lucide-react';

export const ParametresPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'general' | 'saas' | 'notifications' | 'backup'>('general');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form State
  const [platformName, setPlatformName] = useState('DigiCouture VIP');
  const [tagline, setTagline] = useState('Digital Luxury Tailoring');
  const [supportEmail, setSupportEmail] = useState('support@digicouture.app');
  const [helplineWhatsapp, setHelplineWhatsapp] = useState('+225 0707705067');
  const [defaultCurrency, setDefaultCurrency] = useState('XOF (FCFA)');
  const [trialDays, setTrialDays] = useState(14);
  const [gracePeriodDays, setGracePeriodDays] = useState(7);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [backupFrequency, setBackupFrequency] = useState('daily');
  const [backupRetentionDays, setBackupRetentionDays] = useState(30);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#F5F5F5', margin: 0 }}>
            Paramètres Généraux de la Plateforme
          </h1>
          <p style={{ fontSize: 13, color: '#8B8B94', marginTop: 4 }}>
            Configuration de l'identité, des règles d'abonnement SaaS, des notifications et des sauvegardes.
          </p>
        </div>

        <button onClick={handleSave} style={styles.primaryBtn}>
          <Save size={15} /> Enregistrer les modifications
        </button>
      </div>

      {savedSuccess && (
        <div style={styles.alertSuccess}>
          <CheckCircle2 size={16} color="#22C55E" />
          <span>Paramètres système enregistrés avec succès. Les modifications ont été appliquées.</span>
        </div>
      )}

      {/* Tabs Row */}
      <div style={styles.tabRow}>
        {[
          { id: 'general', label: 'Identité & Support', icon: <Globe size={14} /> },
          { id: 'saas', label: 'Règles SaaS & Essai', icon: <Sliders size={14} /> },
          { id: 'notifications', label: 'Notifications WhatsApp & Email', icon: <Bell size={14} /> },
          { id: 'backup', label: 'Sauvegardes & Base de Données', icon: <Database size={14} /> },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            style={{
              ...styles.tabBtn,
              ...(activeTab === t.id ? styles.tabBtnActive : {}),
            }}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* Form Content */}
      <form onSubmit={handleSave}>
        {/* Tab 1: Général */}
        {activeTab === 'general' && (
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Identité de la Marque &amp; Contact Support</h3>
            <p style={styles.cardSubtitle}>Informations publiques affichées sur les portails clients et emails système</p>

            <div style={styles.formGrid}>
              <div>
                <label style={styles.label}>Nom de la Plateforme SaaS</label>
                <input 
                  type="text" 
                  value={platformName}
                  onChange={e => setPlatformName(e.target.value)}
                  style={styles.input}
                />
              </div>

              <div>
                <label style={styles.label}>Slogan Officiel / Devise</label>
                <input 
                  type="text" 
                  value={tagline}
                  onChange={e => setTagline(e.target.value)}
                  style={styles.input}
                />
              </div>

              <div>
                <label style={styles.label}>Email Officiel Support Technique</label>
                <input 
                  type="email" 
                  value={supportEmail}
                  onChange={e => setSupportEmail(e.target.value)}
                  style={styles.input}
                />
              </div>

              <div>
                <label style={styles.label}>Numéro Helpline WhatsApp Assistance VIP</label>
                <input 
                  type="text" 
                  value={helplineWhatsapp}
                  onChange={e => setHelplineWhatsapp(e.target.value)}
                  style={styles.input}
                />
              </div>

              <div>
                <label style={styles.label}>Devise Principale de Facturation</label>
                <select 
                  value={defaultCurrency}
                  onChange={e => setDefaultCurrency(e.target.value)}
                  style={styles.select}
                >
                  <option value="XOF (FCFA)">Franc CFA (XOF / FCFA)</option>
                  <option value="EUR (€)">Euro (€)</option>
                  <option value="USD ($)">Dollar US ($)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: SaaS Rules */}
        {activeTab === 'saas' && (
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Règles d'Abonnement SaaS &amp; Mode Maintenance</h3>
            <p style={styles.cardSubtitle}>Gestion de la période d'essai gratuit et tolérance de renouvellement</p>

            <div style={styles.formGrid}>
              <div>
                <label style={styles.label}>Durée de la Période d'Essai Gratuit (Jours)</label>
                <input 
                  type="number" 
                  value={trialDays}
                  onChange={e => setTrialDays(Number(e.target.value))}
                  style={styles.input}
                />
                <span style={{ fontSize: 11, color: '#8B8B94', marginTop: 4, display: 'block' }}>
                  Accordée automatiquement à chaque nouvel atelier inscrit.
                </span>
              </div>

              <div>
                <label style={styles.label}>Période de Grâce en cas d'Échec de Paiement (Jours)</label>
                <input 
                  type="number" 
                  value={gracePeriodDays}
                  onChange={e => setGracePeriodDays(Number(e.target.value))}
                  style={styles.input}
                />
                <span style={{ fontSize: 11, color: '#8B8B94', marginTop: 4, display: 'block' }}>
                  Délai accordé avant suspension automatique du compte.
                </span>
              </div>
            </div>

            <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid #24242A' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ fontSize: 14, fontWeight: 700, color: '#F5F5F5', margin: 0 }}>
                    Mode Maintenance Général
                  </h4>
                  <p style={{ fontSize: 12, color: '#8B8B94', marginTop: 4, margin: 0 }}>
                    Affiche une page d'indisponibilité temporaire sur l'application Web &amp; Mobile pendant les mises à jour majeures.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setMaintenanceMode(!maintenanceMode)}
                  style={{
                    ...styles.toggleBtn,
                    backgroundColor: maintenanceMode ? '#EF4444' : '#24242A',
                  }}
                >
                  <div style={{
                    ...styles.toggleThumb,
                    transform: maintenanceMode ? 'translateX(18px)' : 'translateX(2px)',
                  }} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Notifications */}
        {activeTab === 'notifications' && (
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Paramètres des Notifications WhatsApp &amp; SMS</h3>
            <p style={styles.cardSubtitle}>Gestion des relances automatiques et des envois OTP</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16 }}>
              {[
                { title: 'Envoi d\'OTP de connexion par WhatsApp', desc: 'Code à 4 chiffres envoyé en < 2 secondes', enabled: true },
                { title: 'Notification de rappel de renouvellement (J-3)', desc: 'Rappelle à l\'atelier la date d\'échéance de son abonnement', enabled: true },
                { title: 'Alerte d\'activité suspecte ou tentative de connexion', desc: 'Avis de sécurité adressé aux super-administrateurs', enabled: true },
              ].map((item, idx) => (
                <div key={idx} style={styles.notifRow}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#F5F5F5' }}>{item.title}</div>
                    <div style={{ fontSize: 12, color: '#8B8B94', marginTop: 2 }}>{item.desc}</div>
                  </div>
                  <span style={styles.enabledBadge}>Actif 🟢</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Backup */}
        {activeTab === 'backup' && (
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Sauvegardes Automatiques &amp; Base de Données</h3>
            <p style={styles.cardSubtitle}>Politique de sécurité et restauration des données MySQL / MariaDB</p>

            <div style={styles.formGrid}>
              <div>
                <label style={styles.label}>Fréquence des Sauvegardes Automatiques</label>
                <select 
                  value={backupFrequency}
                  onChange={e => setBackupFrequency(e.target.value)}
                  style={styles.select}
                >
                  <option value="daily">Quotidien (Toutes les nuits à 02h00 GMT)</option>
                  <option value="hourly">Toutes les 6 heures</option>
                  <option value="weekly">Hebdomadaire</option>
                </select>
              </div>

              <div>
                <label style={styles.label}>Rétention des Sauvegardes (Jours)</label>
                <input 
                  type="number" 
                  value={backupRetentionDays}
                  onChange={e => setBackupRetentionDays(Number(e.target.value))}
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.backupBox}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#F5F5F5' }}>Dernière Sauvegarde Complète</div>
                <div style={{ fontSize: 11, color: '#8B8B94', marginTop: 2 }}>
                  24 Août 2026 à 02:00:00 GMT • Taille : 42.8 MB • Chiffrement AES-256 ✓
                </div>
              </div>

              <button 
                type="button"
                onClick={() => alert('Génération d\'un snapshot MySQL complet lancé immédiatement.')}
                style={styles.secondaryBtn}
              >
                <RefreshCw size={13} /> Sauvegarder Maintenant
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '24px 32px',
    backgroundColor: '#0B0B0D',
    minHeight: '100vh',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  primaryBtn: {
    background: '#D4AF37',
    color: '#0B0B0D',
    border: 'none',
    borderRadius: 8,
    padding: '8px 16px',
    fontSize: 12,
    fontWeight: 800,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  secondaryBtn: {
    background: '#121216',
    border: '1px solid #24242A',
    color: '#D4AF37',
    borderRadius: 8,
    padding: '8px 14px',
    fontSize: 12,
    fontWeight: 700,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  alertSuccess: {
    backgroundColor: '#22C55E15',
    border: '1px solid #22C55E40',
    color: '#22C55E',
    padding: '12px 16px',
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 600,
    marginBottom: 20,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  tabRow: {
    display: 'flex',
    gap: 8,
    marginBottom: 24,
    borderBottom: '1px solid #24242A',
    paddingBottom: 12,
  },
  tabBtn: {
    background: 'transparent',
    border: 'none',
    color: '#8B8B94',
    padding: '8px 14px',
    fontSize: 12,
    fontWeight: 600,
    borderRadius: 8,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  tabBtnActive: {
    background: '#121216',
    color: '#D4AF37',
    fontWeight: 700,
  },
  card: {
    backgroundColor: '#121216',
    border: '1px solid #24242A',
    borderRadius: 16,
    padding: 24,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 800,
    color: '#F5F5F5',
    margin: 0,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#8B8B94',
    marginTop: 4,
    marginBottom: 20,
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: 18,
  },
  label: {
    display: 'block',
    fontSize: 12,
    fontWeight: 700,
    color: '#F5F5F5',
    marginBottom: 6,
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    backgroundColor: '#0B0B0D',
    border: '1px solid #24242A',
    borderRadius: 8,
    color: '#F5F5F5',
    fontSize: 13,
    outline: 'none',
  },
  select: {
    width: '100%',
    padding: '10px 12px',
    backgroundColor: '#0B0B0D',
    border: '1px solid #24242A',
    borderRadius: 8,
    color: '#F5F5F5',
    fontSize: 13,
    outline: 'none',
  },
  toggleBtn: {
    width: 40,
    height: 22,
    borderRadius: 12,
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    transition: 'background-color 0.2s',
    flexShrink: 0,
  },
  toggleThumb: {
    width: 18,
    height: 18,
    borderRadius: '50%',
    backgroundColor: '#FFFFFF',
    transition: 'transform 0.2s',
  },
  notifRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 14px',
    backgroundColor: '#0B0B0D',
    border: '1px solid #24242A',
    borderRadius: 12,
  },
  enabledBadge: {
    fontSize: 11,
    fontWeight: 700,
    color: '#22C55E',
  },
  backupBox: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#0B0B0D',
    border: '1px solid #24242A',
    borderRadius: 12,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
};
