import React, { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../services/adminApi';
import { StatusBadge } from '../components/ui/StatusBadge';
import { KpiCard } from '../components/ui/KpiCard';
import { SkeletonKpis, Skeleton } from '../components/ui/SkeletonLoader';
import { ErrorState } from '../components/ui/EmptyState';
import {
  Building2, Users, Package, CreditCard, ArrowLeft,
  Info, Phone, Shield, Award
} from 'lucide-react';

interface AtelierDetailPageProps {
  atelierId: string;
  onBack: () => void;
}

type TabType = 'general' | 'info' | 'subscription' | 'security';

export const AtelierDetailPage: React.FC<AtelierDetailPageProps> = ({ atelierId, onBack }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [data, setData] = useState<any>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminApi.getAtelierOverview(atelierId);
      if (res.success) {
        setData(res);
      }
    } catch (err: any) {
      setError(err.message || 'Impossible de charger les détails de l\'atelier.');
    } finally {
      setLoading(false);
    }
  }, [atelierId]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div>
        <button onClick={onBack} style={styles.backBtn}><ArrowLeft size={14} /> Retour</button>
        <Skeleton width="40%" height={24} style={{ marginTop: 16 }} />
        <SkeletonKpis count={4} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div>
        <button onClick={onBack} style={styles.backBtn}><ArrowLeft size={14} /> Retour</button>
        <ErrorState message={error || 'Atelier introuvable.'} onRetry={load} />
      </div>
    );
  }

  const { atelier, stats, subscription } = data;

  const tabItems: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'general', label: 'Vue générale', icon: <Info size={14} /> },
    { id: 'info', label: 'Informations', icon: <Building2 size={14} /> },
    { id: 'subscription', label: 'Abonnement', icon: <Award size={14} /> },
    { id: 'security', label: 'Sécurité & Accès', icon: <Shield size={14} /> },
  ];

  return (
    <div>
      {/* Back Button */}
      <button onClick={onBack} style={styles.backBtn}>
        <ArrowLeft size={14} />
        Retour à la liste
      </button>

      {/* Header Profile */}
      <div style={styles.header}>
        <div style={styles.logoWrapper}>
          {atelier.logoUrl ? (
            <img src={atelier.logoUrl} alt={atelier.name} style={styles.logo} />
          ) : (
            <Building2 size={24} color="#D4AF37" />
          )}
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#F5F5F5', margin: 0 }}>
              {atelier.name}
            </h1>
            <StatusBadge status={subscription?.status === 'active' ? 'active' : 'suspended'} />
          </div>
          <p style={{ fontSize: 13, color: '#8B8B94', marginTop: 4 }}>
            Géré par <strong>{atelier.ownerName}</strong> • Slug : {atelier.slug}
          </p>
        </div>
      </div>

      {/* Tabs Menu */}
      <div style={styles.tabBar}>
        {tabItems.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              ...styles.tabBtn,
              color: activeTab === tab.id ? '#D4AF37' : '#8B8B94',
              borderBottomColor: activeTab === tab.id ? '#D4AF37' : 'transparent',
              fontWeight: activeTab === tab.id ? 700 : 500,
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ marginTop: 24 }}>
        {activeTab === 'general' && (
          <div>
            {/* KPIs */}
            <div style={styles.kpiGrid}>
              <KpiCard
                label="Clients VIP"
                value={stats.totalClients || 0}
                icon={<Users size={16} />}
                accentColor="#818CF8"
              />
              <KpiCard
                label="Commandes"
                value={stats.totalOrders || 0}
                icon={<Package size={16} />}
                accentColor="#F59E0B"
              />
              <KpiCard
                label="Chiffre d'Affaires"
                value={(stats.totalRevenue || 0).toLocaleString('fr-FR')}
                suffix=" FCFA"
                icon={<CreditCard size={16} />}
                accentColor="#22C55E"
              />
              <KpiCard
                label="Collaborateurs"
                value={stats.totalUsers || 0}
                icon={<Users size={16} />}
                accentColor="#D4AF37"
              />
            </div>

            {/* Platform Quick Info */}
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Vue 360° Atelier</h3>
              <div style={styles.infoList}>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Pays / Devise</span>
                  <span style={styles.infoVal}>{atelier.country || 'Côte d\'Ivoire'} / {atelier.currency || 'FCFA'}</span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Unité de mesure</span>
                  <span style={styles.infoVal}>{atelier.measurementUnit || 'cm'}</span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Date d'enregistrement</span>
                  <span style={styles.infoVal}>
                    {atelier.createdAt ? new Date(atelier.createdAt).toLocaleDateString('fr-FR') : '—'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'info' && (
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Fiche Informations Atelier</h3>
            <div style={styles.infoList}>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Nom commercial</span>
                <span style={styles.infoVal}>{atelier.name}</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Propriétaire légal</span>
                <span style={styles.infoVal}>{atelier.ownerName}</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Téléphone principal / WhatsApp</span>
                <span style={styles.infoVal}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <Phone size={12} color="#22C55E" />
                    {atelier.phone || atelier.whatsapp}
                  </span>
                </span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Email</span>
                <span style={styles.infoVal}>{atelier.email || 'Non renseigné'}</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Ville / Adresse physique</span>
                <span style={styles.infoVal}>{atelier.city} {atelier.address ? `, ${atelier.address}` : ''}</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'subscription' && (
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Détails de l'Abonnement</h3>
            <div style={styles.infoList}>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Formule Active</span>
                <span style={styles.infoVal}>
                  <StatusBadge status={subscription?.plan || 'PRO'} />
                </span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Statut de l'Abonnement</span>
                <span style={styles.infoVal}>
                  <StatusBadge status={subscription?.status === 'active' ? 'active' : 'suspended'} />
                </span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Échéance de facturation</span>
                <span style={styles.infoVal}>
                  {subscription?.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toLocaleDateString('fr-FR') : 'Indéterminée'}
                </span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Sécurité & journalisation</h3>
            <p style={{ fontSize: 13, color: '#8B8B94', marginBottom: 20 }}>
              Audit des accès de l'atelier :
            </p>
            <div style={styles.infoList}>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Authentification</span>
                <span style={styles.infoVal}>Jeton d'accès JWT Actif</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Propriétaire de l'instance</span>
                <span style={styles.infoVal}>{atelier.ownerName}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  backBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    background: '#121216',
    border: '1px solid #24242A',
    borderRadius: 8,
    color: '#8B8B94',
    padding: '8px 16px',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    marginBottom: 20,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    marginBottom: 28,
  },
  logoWrapper: {
    width: 60,
    height: 60,
    borderRadius: 14,
    background: 'rgba(212,175,55,0.08)',
    border: '1px solid rgba(212,175,55,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: 14,
  },
  tabBar: {
    display: 'flex',
    borderBottom: '1px solid #24242A',
    gap: 20,
  },
  tabBtn: {
    background: 'none',
    border: 'none',
    borderBottom: '2px solid transparent',
    padding: '10px 4px 12px',
    fontSize: 13,
    color: '#8B8B94',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    transition: 'all 0.2s',
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: 16,
    marginBottom: 24,
  },
  card: {
    background: '#121216',
    border: '1px solid #24242A',
    borderRadius: 14,
    padding: '24px 28px',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: '#F5F5F5',
    margin: '0 0 18px',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
  },
  infoList: {
    display: 'flex',
    flexDirection: 'column',
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '14px 0',
    borderBottom: '1px solid #1c1c24',
  },
  infoLabel: {
    fontSize: 13,
    color: '#8B8B94',
  },
  infoVal: {
    fontSize: 13,
    color: '#F5F5F5',
    fontWeight: 600,
  },
};
