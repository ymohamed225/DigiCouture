import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Key, 
  UserCheck, 
  AlertTriangle
} from 'lucide-react';

interface SecurityPolicy {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  category: 'auth' | 'network' | 'data' | 'rbac';
}

export const SecuritePage: React.FC = () => {
  const [policies, setPolicies] = useState<SecurityPolicy[]>([
    {
      id: '2fa-enforce',
      title: 'Authentification à Deux Facteurs (2FA) Obligatoire',
      description: 'Exige un code OTP SMS/WhatsApp ou application Authenticator pour tous les comptes administrateurs.',
      enabled: true,
      category: 'auth',
    },
    {
      id: 'session-timeout',
      title: 'Déconnexion Automatique pour Inactivité (15 minutes)',
      description: 'Ferme la session d\'administration après 15 minutes sans interaction.',
      enabled: true,
      category: 'auth',
    },
    {
      id: 'geo-whitelisting',
      title: 'Restrictions Géographiques IP (Whitelist Afrique de l\'Ouest)',
      description: 'Autorise les connexions admin uniquement depuis la Côte d\'Ivoire, le Sénégal, le Mali et la France.',
      enabled: true,
      category: 'network',
    },
    {
      id: 'login-lockout',
      title: 'Verrouillage Automatique du Compte (5 tentatives échec)',
      description: 'Bloque temporairement l\'accès pendant 30 minutes après 5 échecs consécutifs.',
      enabled: true,
      category: 'auth',
    },
    {
      id: 'db-encryption',
      title: 'Chiffrement des Données au Repos (AES-256)',
      description: 'Chiffre les tables sensibles en base de données avec des clés de rotation automatique 90 jours.',
      enabled: true,
      category: 'data',
    },
    {
      id: 'tenant-isolation',
      title: 'Garantie Strict Multi-Tenant (Isolateur SQL)',
      description: 'Filtre automatiquement toutes les requêtes SQL par atelierId pour éviter toute fuite de données.',
      enabled: true,
      category: 'data',
    },
  ]);

  const togglePolicy = (id: string) => {
    setPolicies(prev => prev.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p));
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#F5F5F5', margin: 0 }}>
            Sécurité &amp; Contrôle d'Accès (RBAC)
          </h1>
          <p style={{ fontSize: 13, color: '#8B8B94', marginTop: 4 }}>
            Politiques de protection, chiffrement des données multi-tenant et rôles d'administration SaaS.
          </p>
        </div>

        <button 
          onClick={() => alert('Audit de sécurité immédiat déclenché sur tous les nœuds de la plateforme.')}
          style={styles.primaryBtn}
        >
          <ShieldCheck size={15} /> Lancer un Scan de Sécurité
        </button>
      </div>

      {/* KPI Cards Security */}
      <div style={styles.kpiGrid}>
        <div style={styles.kpiCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={styles.kpiLabel}>Statut Général Sécurité</span>
            <ShieldCheck size={20} color="#22C55E" />
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#22C55E', marginTop: 8 }}>OPTIMAL 🛡️</div>
          <span style={{ fontSize: 11, color: '#8B8B94', marginTop: 4 }}>0 vulnérabilité critique active</span>
        </div>

        <div style={styles.kpiCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={styles.kpiLabel}>Authentification 2FA</span>
            <Lock size={20} color="#D4AF37" />
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#F5F5F5', marginTop: 8 }}>100% Actif</div>
          <span style={{ fontSize: 11, color: '#22C55E', marginTop: 4 }}>12 / 12 admins protégés</span>
        </div>

        <div style={styles.kpiCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={styles.kpiLabel}>Niveau de Chiffrement</span>
            <Key size={20} color="#3B82F6" />
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#F5F5F5', marginTop: 8 }}>AES-256 GCM</div>
          <span style={{ fontSize: 11, color: '#3B82F6', marginTop: 4 }}>TLS 1.3 en transit</span>
        </div>

        <div style={styles.kpiCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={styles.kpiLabel}>Tentatives Bloquées (24h)</span>
            <AlertTriangle size={20} color="#EAB308" />
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#EAB308', marginTop: 8 }}>3 IP Bloquées</div>
          <span style={{ fontSize: 11, color: '#8B8B94', marginTop: 4 }}>Filtrage réseau automatique</span>
        </div>
      </div>

      {/* Main Layout: Security Policies + RBAC Roles */}
      <div style={styles.mainGrid}>
        {/* Left: Security Policies List */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>Politiques de Sécurité Actives</h3>
            <span style={{ fontSize: 11, color: '#D4AF37', fontWeight: 700 }}>6 Politiques Règlements</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16 }}>
            {policies.map(policy => (
              <div key={policy.id} style={styles.policyRow}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#F5F5F5' }}>{policy.title}</span>
                    {policy.enabled ? (
                      <span style={styles.enabledBadge}>Actif</span>
                    ) : (
                      <span style={styles.disabledBadge}>Inactif</span>
                    )}
                  </div>
                  <p style={{ fontSize: 12, color: '#8B8B94', marginTop: 4, lineHeight: 1.4 }}>
                    {policy.description}
                  </p>
                </div>

                {/* Toggle switch */}
                <button
                  onClick={() => togglePolicy(policy.id)}
                  style={{
                    ...styles.toggleBtn,
                    backgroundColor: policy.enabled ? '#D4AF37' : '#24242A',
                  }}
                >
                  <div style={{
                    ...styles.toggleThumb,
                    transform: policy.enabled ? 'translateX(18px)' : 'translateX(2px)',
                  }} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right: RBAC Roles Table */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>Matrice des Rôles &amp; Permissions (RBAC)</h3>
            <UserCheck size={18} color="#D4AF37" />
          </div>

          <p style={{ fontSize: 12, color: '#8B8B94', marginTop: 6, marginBottom: 16 }}>
            Contrôle strict des privilèges sur la console d'administration SaaS.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              {
                role: 'PLATFORM_OWNER',
                label: 'Fondateur / Super Owner',
                users: 2,
                color: '#D4AF37',
                access: 'Accès Total + Clés API + Facturation + Gestion Rôles',
              },
              {
                role: 'PLATFORM_ADMIN',
                label: 'Administrateur SaaS',
                users: 4,
                color: '#3B82F6',
                access: 'Gestion Ateliers + Abonnements + Support + Logs',
              },
              {
                role: 'PLATFORM_SUPPORT',
                label: 'Agent Support VIP',
                users: 3,
                color: '#22C55E',
                access: 'Tickets Support + Vue Métriques + Diagnostics (Lecture)',
              },
              {
                role: 'PLATFORM_FINANCE',
                label: 'Analyste Financier',
                users: 2,
                color: '#EAB308',
                access: 'Rapports Revenus + Factures + Export Bilan (Comptabilité)',
              },
              {
                role: 'PLATFORM_ANALYST',
                label: 'Auditeur Métriques',
                users: 1,
                color: '#A855F7',
                access: 'Statistiques & Analytics Anonymisés (Strict Lecture)',
              },
            ].map((r, idx) => (
              <div key={idx} style={styles.roleCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: r.color, backgroundColor: `${r.color}15`, padding: '2px 8px', borderRadius: 6, border: `1px solid ${r.color}30` }}>
                      {r.role}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#F5F5F5' }}>{r.label}</span>
                  </div>
                  <span style={{ fontSize: 12, color: '#8B8B94', fontWeight: 600 }}>{r.users} membres</span>
                </div>
                <div style={{ fontSize: 11, color: '#8B8B94', marginTop: 8 }}>
                  🔑 <strong style={{ color: '#F5F5F5' }}>Permissions :</strong> {r.access}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
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
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: 16,
    marginBottom: 24,
  },
  kpiCard: {
    backgroundColor: '#121216',
    border: '1px solid #24242A',
    borderRadius: 14,
    padding: 18,
  },
  kpiLabel: {
    fontSize: 11,
    fontWeight: 600,
    color: '#8B8B94',
    textTransform: 'uppercase',
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
    gap: 20,
  },
  card: {
    backgroundColor: '#121216',
    border: '1px solid #24242A',
    borderRadius: 16,
    padding: 24,
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 800,
    color: '#F5F5F5',
    margin: 0,
  },
  policyRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '12px 14px',
    backgroundColor: '#0B0B0D',
    border: '1px solid #24242A',
    borderRadius: 12,
    gap: 16,
  },
  enabledBadge: {
    fontSize: 10,
    fontWeight: 800,
    color: '#22C55E',
    backgroundColor: '#22C55E15',
    padding: '2px 6px',
    borderRadius: 6,
    border: '1px solid #22C55E30',
  },
  disabledBadge: {
    fontSize: 10,
    fontWeight: 800,
    color: '#8B8B94',
    backgroundColor: '#8B8B9415',
    padding: '2px 6px',
    borderRadius: 6,
    border: '1px solid #8B8B9430',
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
    marginTop: 2,
  },
  toggleThumb: {
    width: 18,
    height: 18,
    borderRadius: '50%',
    backgroundColor: '#FFFFFF',
    transition: 'transform 0.2s',
  },
  roleCard: {
    backgroundColor: '#0B0B0D',
    border: '1px solid #24242A',
    borderRadius: 12,
    padding: 14,
  },
};
