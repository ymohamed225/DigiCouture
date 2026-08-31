import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  Key, 
  RefreshCw, 
  Sliders, 
  Copy, 
  Check, 
  X
} from 'lucide-react';

interface Integration {
  id: string;
  category: 'messaging' | 'payments' | 'storage' | 'webhooks';
  name: string;
  provider: string;
  description: string;
  status: 'connected' | 'paused' | 'not_configured';
  icon: string;
  lastSync?: string;
  webhookUrl?: string;
  apiKeyMasked?: string;
}

export const IntegrationsPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'messaging' | 'payments' | 'storage' | 'webhooks'>('all');
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [testStatus, setTestStatus] = useState<Record<string, 'idle' | 'testing' | 'success' | 'failed'>>({});

  const [integrations] = useState<Integration[]>([
    {
      id: 'wa-baileys',
      category: 'messaging',
      name: 'WhatsApp Business API Gateway',
      provider: 'Baileys Multi-Device Node.js',
      description: 'Envoi automatique des OTPs, confirmations de commande et notifications de livraison aux clients.',
      status: 'connected',
      icon: '💬',
      lastSync: 'Il y a 2 minutes',
      apiKeyMasked: 'wh_live_9f8a...34b1',
    },
    {
      id: 'pay-wave',
      category: 'payments',
      name: 'Wave Mobile Money',
      provider: 'Wave CI API v1',
      description: 'Guichet de paiement direct QR Code et Lien Wave pour les abonnements SaaS des ateliers.',
      status: 'connected',
      icon: '🌊',
      lastSync: 'Il y a 10 minutes',
      apiKeyMasked: 'wave_pk_live_87a...90f2',
    },
    {
      id: 'pay-om',
      category: 'payments',
      name: 'Orange Money Webpay',
      provider: 'Orange Developer CI API',
      description: 'Paiements Mobile Money Orange Côte d\'Ivoire, Sénégal et Mali.',
      status: 'connected',
      icon: '🍊',
      lastSync: 'Il y a 1 heure',
      apiKeyMasked: 'om_sec_live_45a...12c9',
    },
    {
      id: 'pay-mtn',
      category: 'payments',
      name: 'MTN Mobile Money (MoMo)',
      provider: 'MTN MoMo API v2',
      description: 'Paiements Mobile Money MTN pour la souscription des ateliers de couture.',
      status: 'connected',
      icon: '💛',
      lastSync: 'Il y a 3 heures',
      apiKeyMasked: 'momo_api_key_77c...99a1',
    },
    {
      id: 'storage-cloudinary',
      category: 'storage',
      name: 'Cloudinary Media CDN',
      provider: 'Cloudinary VIP Assets',
      description: 'Hébergement, compression automatique et optimisation des photos de modèles et tissus.',
      status: 'connected',
      icon: '☁️',
      lastSync: 'En continu',
      apiKeyMasked: 'cld_882910...9001',
    },
    {
      id: 'webhook-events',
      category: 'webhooks',
      name: 'Webhook d\'Événements SaaS',
      provider: 'Endpoint Externe / Webhook Dispatcher',
      description: 'Notifications temps réel pour les événements système (inscription, abonnement, incident).',
      status: 'connected',
      icon: '🔗',
      lastSync: 'Il y a 5 minutes',
      webhookUrl: 'https://api.digicouture.app/v1/webhooks/saas-events',
    },
    {
      id: 'msg-infobip',
      category: 'messaging',
      name: 'Infobip / Orange SMS',
      provider: 'Infobip Gateway',
      description: 'Canal SMS de secours lorsque le client n\'a pas WhatsApp actif.',
      status: 'paused',
      icon: '📱',
      lastSync: 'Inactif',
      apiKeyMasked: 'sms_infobip_key_sec_4410',
    },
  ]);

  const handleTestConnection = (id: string) => {
    setTestStatus(prev => ({ ...prev, [id]: 'testing' }));
    setTimeout(() => {
      setTestStatus(prev => ({ ...prev, [id]: 'success' }));
      setTimeout(() => {
        setTestStatus(prev => ({ ...prev, [id]: 'idle' }));
      }, 3500);
    }, 1200);
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const filteredIntegrations = activeCategory === 'all'
    ? integrations
    : integrations.filter(i => i.category === activeCategory);

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#F5F5F5', margin: 0 }}>
            Intégrations &amp; Passerelles
          </h1>
          <p style={{ fontSize: 13, color: '#8B8B94', marginTop: 4 }}>
            Connecteurs API, passerelles WhatsApp, Mobile Money et hébergement multimédia de DigiCouture VIP.
          </p>
        </div>

        <button 
          onClick={() => alert('Génération d\'une nouvelle clé API globale initiée.')}
          style={styles.primaryBtn}
        >
          <Key size={15} /> + Nouvelle Clé API
        </button>
      </div>

      {/* Categories Filter Tabs */}
      <div style={styles.tabRow}>
        {[
          { id: 'all', label: 'Toutes les intégrations', count: integrations.length },
          { id: 'messaging', label: 'WhatsApp & Messaging', count: integrations.filter(i => i.category === 'messaging').length },
          { id: 'payments', label: 'Mobile Money & Paiements', count: integrations.filter(i => i.category === 'payments').length },
          { id: 'storage', label: 'Stockage Cloud & CDN', count: integrations.filter(i => i.category === 'storage').length },
          { id: 'webhooks', label: 'Webhooks & APIs', count: integrations.filter(i => i.category === 'webhooks').length },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveCategory(tab.id as any)}
            style={{
              ...styles.tabBtn,
              ...(activeCategory === tab.id ? styles.tabBtnActive : {}),
            }}
          >
            {tab.label}
            <span style={{
              ...styles.tabCount,
              ...(activeCategory === tab.id ? styles.tabCountActive : {}),
            }}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Grid Integrations Cards */}
      <div style={styles.grid}>
        {filteredIntegrations.map(item => {
          const tState = testStatus[item.id] || 'idle';
          return (
            <div key={item.id} style={styles.card}>
              <div style={styles.cardTop}>
                <div style={styles.iconBox}>{item.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h3 style={styles.cardTitle}>{item.name}</h3>
                    <span style={{
                      ...styles.statusBadge,
                      ...(item.status === 'connected' ? styles.statusConnected : item.status === 'paused' ? styles.statusPaused : styles.statusNotConfigured)
                    }}>
                      {item.status === 'connected' && <CheckCircle2 size={12} />}
                      {item.status === 'paused' && <AlertCircle size={12} />}
                      {item.status === 'connected' ? 'Connecté 🟢' : item.status === 'paused' ? 'En Pause 🟡' : 'Inactif ⚪'}
                    </span>
                  </div>
                  <div style={styles.providerLabel}>{item.provider}</div>
                </div>
              </div>

              <p style={styles.description}>{item.description}</p>

              {item.apiKeyMasked && (
                <div style={styles.keyBox}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Key size={13} color="#8B8B94" />
                    <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#D4AF37' }}>{item.apiKeyMasked}</span>
                  </div>
                  <button 
                    onClick={() => handleCopyKey(item.apiKeyMasked!)} 
                    style={styles.iconBtn}
                    title="Copier la clé"
                  >
                    {copiedKey === item.apiKeyMasked ? <Check size={13} color="#22C55E" /> : <Copy size={13} color="#8B8B94" />}
                  </button>
                </div>
              )}

              {item.webhookUrl && (
                <div style={styles.keyBox}>
                  <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#3B82F6', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.webhookUrl}
                  </span>
                  <button 
                    onClick={() => handleCopyKey(item.webhookUrl!)} 
                    style={styles.iconBtn}
                  >
                    {copiedKey === item.webhookUrl ? <Check size={13} color="#22C55E" /> : <Copy size={13} color="#8B8B94" />}
                  </button>
                </div>
              )}

              <div style={styles.cardFooter}>
                <span style={styles.syncTime}>Dernier sync : {item.lastSync || 'Jamais'}</span>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button 
                    onClick={() => handleTestConnection(item.id)} 
                    disabled={tState === 'testing'}
                    style={styles.secondaryBtn}
                  >
                    {tState === 'testing' ? (
                      <RefreshCw size={12} className="spin" />
                    ) : tState === 'success' ? (
                      <span style={{ color: '#22C55E' }}>OK ✓</span>
                    ) : (
                      'Tester Ping'
                    )}
                  </button>

                  <button 
                    onClick={() => setSelectedIntegration(item)} 
                    style={styles.configureBtn}
                  >
                    <Sliders size={13} /> Gérer
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Configuration / Clés */}
      {selectedIntegration && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 24 }}>{selectedIntegration.icon}</span>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: '#F5F5F5', margin: 0 }}>
                    {selectedIntegration.name}
                  </h3>
                  <span style={{ fontSize: 12, color: '#8B8B94' }}>{selectedIntegration.provider}</span>
                </div>
              </div>
              <button onClick={() => setSelectedIntegration(null)} style={styles.closeBtn}>
                <X size={18} color="#8B8B94" />
              </button>
            </div>

            <div style={{ margin: '20px 0' }}>
              <label style={styles.label}>Clé d'API Principale (Production)</label>
              <input 
                type="text" 
                readOnly 
                value={selectedIntegration.apiKeyMasked || 'https://api.digicouture.app/webhook'} 
                style={styles.input}
              />
              <p style={{ fontSize: 11, color: '#8B8B94', marginTop: 4 }}>
                🔒 Ne partagez jamais vos clés secrètes de production.
              </p>

              <div style={{ marginTop: 16 }}>
                <label style={styles.label}>Statut du service</label>
                <select 
                  defaultValue={selectedIntegration.status}
                  style={styles.select}
                >
                  <option value="connected">Actif / En ligne (Production)</option>
                  <option value="paused">En pause (Maintenance)</option>
                  <option value="not_configured">Désactivé</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
              <button onClick={() => setSelectedIntegration(null)} style={styles.secondaryBtn}>
                Annuler
              </button>
              <button 
                onClick={() => {
                  alert(`Paramètres de ${selectedIntegration.name} enregistrés avec succès.`);
                  setSelectedIntegration(null);
                }} 
                style={styles.primaryBtn}
              >
                Enregistrer la configuration
              </button>
            </div>
          </div>
        </div>
      )}
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
    color: '#F5F5F5',
    borderRadius: 8,
    padding: '6px 12px',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
  },
  configureBtn: {
    background: '#24242A',
    color: '#D4AF37',
    border: '1px solid #D4AF3740',
    borderRadius: 8,
    padding: '6px 12px',
    fontSize: 12,
    fontWeight: 700,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  tabRow: {
    display: 'flex',
    gap: 8,
    marginBottom: 24,
    borderBottom: '1px solid #24242A',
    paddingBottom: 12,
    overflowX: 'auto',
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
  tabCount: {
    backgroundColor: '#24242A',
    color: '#8B8B94',
    fontSize: 10,
    fontWeight: 800,
    borderRadius: 10,
    padding: '2px 6px',
  },
  tabCountActive: {
    backgroundColor: '#D4AF3720',
    color: '#D4AF37',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
    gap: 20,
  },
  card: {
    background: '#121216',
    border: '1px solid #24242A',
    borderRadius: 16,
    padding: 20,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  cardTop: {
    display: 'flex',
    gap: 12,
    marginBottom: 12,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#0B0B0D',
    border: '1px solid #24242A',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 22,
    flexShrink: 0,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 800,
    color: '#F5F5F5',
    margin: 0,
  },
  providerLabel: {
    fontSize: 11,
    color: '#8B8B94',
    marginTop: 2,
  },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 10,
    fontWeight: 800,
    padding: '2px 8px',
    borderRadius: 12,
  },
  statusConnected: {
    backgroundColor: '#22C55E15',
    color: '#22C55E',
    border: '1px solid #22C55E30',
  },
  statusPaused: {
    backgroundColor: '#EAB30815',
    color: '#EAB308',
    border: '1px solid #EAB30830',
  },
  statusNotConfigured: {
    backgroundColor: '#8B8B9415',
    color: '#8B8B94',
    border: '1px solid #8B8B9430',
  },
  description: {
    fontSize: 12,
    color: '#8B8B94',
    lineHeight: 1.5,
    marginBottom: 14,
  },
  keyBox: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0B0B0D',
    border: '1px solid #24242A',
    borderRadius: 8,
    padding: '8px 12px',
    marginBottom: 14,
  },
  iconBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: 2,
    display: 'flex',
    alignItems: 'center',
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTop: '1px solid #24242A',
  },
  syncTime: {
    fontSize: 11,
    color: '#64748B',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.75)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalCard: {
    backgroundColor: '#121216',
    border: '1px solid #24242A',
    borderRadius: 16,
    width: '100%',
    maxWidth: 520,
    padding: 24,
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  closeBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
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
    color: '#D4AF37',
    fontSize: 13,
    fontFamily: 'monospace',
  },
  select: {
    width: '100%',
    padding: '10px 12px',
    backgroundColor: '#0B0B0D',
    border: '1px solid #24242A',
    borderRadius: 8,
    color: '#F5F5F5',
    fontSize: 13,
  },
};
