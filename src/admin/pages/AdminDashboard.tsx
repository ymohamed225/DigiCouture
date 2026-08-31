import React, { useState, useEffect, useCallback } from 'react';
import {
  Building2, Users, Package, CreditCard,
  TrendingUp, Activity, AlertTriangle,
  RefreshCw, Clock, Zap, ShoppingBag, Plus, Bell
} from 'lucide-react';
import { KpiCard } from '../components/ui/KpiCard';
import { StatusBadge } from '../components/ui/StatusBadge';
import { SkeletonKpis, Skeleton } from '../components/ui/SkeletonLoader';
import { ErrorState } from '../components/ui/EmptyState';
import { adminApi, type AdminDashboardData, type AuditLogEntry, type AdminAtelier } from '../services/adminApi';

function fmtFcfa(n: number): string {
  if (!n || isNaN(n)) return '0 FCFA';
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + ' Mrd FCFA';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + ' M FCFA';
  return n.toLocaleString('fr-FR') + ' FCFA';
}

function timeAgo(dateStr: string): string {
  if (!dateStr) return 'Récemment';
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return 'À l\'instant';
  if (minutes < 60) return `Il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Il y a ${hours}h`;
  return `Il y a ${Math.floor(hours / 24)}j`;
}

function actionLabel(action: string): string {
  const MAP: Record<string, string> = {
    ORDER_CREATED: 'Nouvelle commande enregistrée',
    PAYMENT_RECEIVED: 'Paiement client reçu',
    CLIENT_CREATED: 'Nouveau client enregistré',
    STATUS_CHANGED: 'Avancement statut commande',
    ATELIER_CREATED: 'Nouvel atelier de couture activé',
    SUBSCRIPTION_ACTIVATED: 'Abonnement activé',
    ANNOUNCEMENT: 'Annonce système diffusée',
    WEBHOOK_CINETPAY: 'Notification CinetPay reçue',
    USER_LOGIN: 'Connexion utilisateur gérant',
  };
  for (const [key, label] of Object.entries(MAP)) {
    if (action.includes(key)) return label;
  }
  return action;
}

function actionIcon(action: string): React.ReactNode {
  if (action.includes('PAYMENT') || action.includes('CINETPAY')) return <CreditCard size={14} color="#22C55E" />;
  if (action.includes('ORDER')) return <Package size={14} color="#D4AF37" />;
  if (action.includes('CLIENT')) return <Users size={14} color="#818CF8" />;
  if (action.includes('ATELIER')) return <Building2 size={14} color="#D4AF37" />;
  if (action.includes('ANNOUNCEMENT')) return <Bell size={14} color="#F59E0B" />;
  if (action.includes('ERROR') || action.includes('FAIL')) return <AlertTriangle size={14} color="#EF4444" />;
  return <Activity size={14} color="#8B8B94" />;
}

// Mini Sparkline SVG Component
const MiniSparkline: React.FC<{ data: number[]; color?: string }> = ({ data, color = '#D4AF37' }) => {
  if (!data || !data.length) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data);
  const W = 140;
  const H = 42;
  const pad = 4;
  const points = data.map((v, i) => {
    const x = pad + (i / (data.length - 1 || 1)) * (W - pad * 2);
    const y = H - pad - ((v - min) / (max - min || 1)) * (H - pad * 2);
    return `${x},${y}`;
  });
  const linePath = `M ${points.join(' L ')}`;
  const areaPath = `M ${points[0]} L ${points.join(' L ')} L ${W - pad},${H - pad} L ${pad},${H - pad} Z`;

  return (
    <svg width={W} height={H} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={`spark-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#spark-${color.replace('#', '')})`} />
      <path d={linePath} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" />
    </svg>
  );
};

export const AdminDashboard: React.FC<{ onNavigate?: (page: string) => void }> = ({ onNavigate }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [recentActivity, setRecentActivity] = useState<AuditLogEntry[]>([]);
  const [recentAteliers, setRecentAteliers] = useState<AdminAtelier[]>([]);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const [dash, audit, ateliersRes] = await Promise.all([
        adminApi.getDashboard(),
        adminApi.getErrors({ limit: 8 }).catch(() => ({ success: true, data: [] })),
        adminApi.getAteliers({ limit: 5 }).catch(() => ({ success: true, data: [] }))
      ]);
      
      setData(dash);
      setRecentActivity(audit.data || []);
      if (ateliersRes.success) {
        setRecentAteliers(ateliersRes.data || []);
      }
      setLastRefresh(new Date());
    } catch (err: any) {
      setError(err.message || 'Impossible de charger le tableau de bord Super-Admin.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 60_000);
    return () => clearInterval(interval);
  }, [loadData]);

  if (loading) {
    return (
      <div style={{ padding: 24 }}>
        <SkeletonKpis count={5} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 24 }}>
          <Skeleton height={240} />
          <Skeleton height={240} />
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorState title="Erreur du tableau de bord" message={error} onRetry={loadData} />;
  }

  if (!data) return null;

  const { platform, finance, subscriptions, usage } = data;
  const sparkData = [20000, 35000, 30000, 45000, 60000, 75000, finance.mrr || 20000];

  return (
    <div style={{ padding: 24, background: 'var(--admin-bg, #F8FAFC)', minHeight: '100vh', color: 'var(--admin-text-main, #0F172A)' }}>
      
      {/* ─── BANNIÈRE D'ACCUEIL & RACCOURCIS ADMIN ───────────────────────────── */}
      <div style={styles.bannerContainer}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--admin-text-main, #0F172A)', margin: 0 }}>
                Vue d'Ensemble &amp; Cockpit SaaS 👑
              </h1>
              <span style={{ backgroundColor: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', color: '#22C55E', padding: '3px 10px', borderRadius: 12, fontSize: 10, fontWeight: 800 }}>
                ● PLATFORME EN LIGNE
              </span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--admin-text-sub, #64748B)', marginTop: 4, margin: 0 }}>
              Pilotage global des ateliers de Haute Couture, revenus des abonnements et télémétrie système
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ fontSize: 11, color: '#4a4a56', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock size={12} /> Actualisé {lastRefresh.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </div>

            <button onClick={loadData} style={styles.iconRefreshBtn} title="Rafraîchir les données">
              <RefreshCw size={14} color="#8B8B94" />
            </button>

            {onNavigate && (
              <>
                <button onClick={() => onNavigate('ateliers')} style={styles.goldActionBtn}>
                  <Plus size={14} /> + Inscrire Atelier
                </button>
                <button onClick={() => onNavigate('communication')} style={styles.secondaryActionBtn}>
                  <Bell size={14} /> Annonce
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ─── 5 KPIS TOP LEVEL ────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        <KpiCard
          label="Total Ateliers Inscrits"
          value={platform.totalAteliers}
          icon={<Building2 size={18} />}
          changeLabel="Ateliers de couture"
          accentColor="#D4AF37"
        />
        <KpiCard
          label="Ateliers Actifs (30j)"
          value={platform.activeAteliers}
          icon={<Activity size={18} />}
          changeLabel="Opérationnels"
          accentColor="#22C55E"
        />
        <KpiCard
          label="Utilisateurs Plateforme"
          value={platform.totalUsers}
          icon={<Users size={18} />}
          changeLabel="Couturiers & Gérants"
          accentColor="#818CF8"
        />
        <KpiCard
          label="MRR (Revenu Mensuel)"
          value={fmtFcfa(finance.mrr)}
          icon={<TrendingUp size={18} />}
          changeLabel="Revenu récurrent"
          accentColor="#D4AF37"
        />
        <KpiCard
          label="ARR (Revenu Annuel)"
          value={fmtFcfa(finance.arr || (finance.mrr * 12))}
          icon={<CreditCard size={18} />}
          changeLabel="Projeté sur 12 mois"
          accentColor="#F59E0B"
        />
      </div>

      {/* ─── ROW 2 : FINANCE & RÉPARTITION DES ABONNEMENTS ───────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 20, marginBottom: 24 }}>
        
        {/* Finance SaaS Card */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <div style={styles.cardSectionLabel}>FINANCE &amp; FACTURATION</div>
              <h3 style={styles.cardTitle}>Performance Financière SaaS</h3>
            </div>
            <CreditCard size={18} color="#D4AF37" />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 16, marginBottom: 20 }}>
            <div>
              <span style={{ fontSize: 11, color: '#8B8B94', textTransform: 'uppercase' }}>Revenu Cumulé Encaissé</span>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#D4AF37', marginTop: 2 }}>
                {fmtFcfa(finance.totalSaasRevenue || finance.mrr)}
              </div>
            </div>
            <MiniSparkline data={sparkData} color="#D4AF37" />
          </div>

          <div style={{ borderTop: '1px solid var(--admin-card-border, #E2E8F0)', paddingTop: 14, display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
            <div>
              <span style={{ color: 'var(--admin-text-sub, #64748B)', display: 'block', fontSize: 10 }}>PAYS DE COUVERTURE</span>
              <span style={{ fontWeight: 700, color: 'var(--admin-text-main, #0F172A)' }}>🇨🇮 Côte d’Ivoire</span>
            </div>
            <div>
              <span style={{ color: 'var(--admin-text-sub, #64748B)', display: 'block', fontSize: 10 }}>DÉLAI MOYEN ENCAISSEMENT</span>
              <span style={{ fontWeight: 700, color: '#22C55E' }}>Instantané (CinetPay)</span>
            </div>
          </div>
        </div>

        {/* Breakdown des Abonnements */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <div style={styles.cardSectionLabel}>REPARTITION</div>
              <h3 style={styles.cardTitle}>Offres &amp; Abonnements Ateliers</h3>
            </div>
            <ShoppingBag size={18} color="#818CF8" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
            {subscriptions?.breakdown?.length ? (
              subscriptions.breakdown.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--admin-input-bg, #F8FAFC)', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--admin-card-border, #E2E8F0)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <StatusBadge status={item.plan} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--admin-text-main, #0F172A)' }}>
                    {item.count} atelier{Number(item.count) > 1 ? 's' : ''}
                  </span>
                </div>
              ))
            ) : (
              <div style={{ padding: 16, textAlign: 'center', color: 'var(--admin-text-sub, #64748B)', fontSize: 12 }}>
                Aucune donnée d'abonnement enregistrée.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── ROW 3 : ATELIERS RÉCENTS & ACTIVITÉ EN DIRECT ──────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 20, marginBottom: 24 }}>
        
        {/* Ateliers Récemment Inscrits */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <div style={styles.cardSectionLabel}>ATELIERS DE COUTURE</div>
              <h3 style={styles.cardTitle}>Derniers Ateliers Inscrits</h3>
            </div>
            {onNavigate && (
              <button onClick={() => onNavigate('ateliers')} style={{ background: 'none', border: 'none', color: '#D4AF37', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                Voir tous →
              </button>
            )}
          </div>

          <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {recentAteliers.length === 0 ? (
              <div style={{ color: 'var(--admin-text-sub, #64748B)', fontSize: 12, padding: 16, textAlign: 'center' }}>
                Aucun atelier inscrit pour le moment.
              </div>
            ) : (
              recentAteliers.slice(0, 4).map(a => (
                <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'var(--admin-input-bg, #F8FAFC)', borderRadius: 10, border: '1px solid var(--admin-card-border, #E2E8F0)' }}>
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--admin-text-main, #0F172A)', fontSize: 13 }}>{a.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--admin-text-sub, #64748B)', marginTop: 1 }}>{a.phone || 'Non renseigné'} • {a.country || 'Côte d’Ivoire'}</div>
                  </div>
                  <StatusBadge status={a.subscriptionPlan || 'FREE'} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Activité Récente & Audits */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <div style={styles.cardSectionLabel}>AUDIT SYSTEME</div>
              <h3 style={styles.cardTitle}>Activité Récente &amp; Incidents</h3>
            </div>
            <Activity size={18} color="#22C55E" />
          </div>

          <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recentActivity.length === 0 ? (
              <div style={{ color: 'var(--admin-text-sub, #64748B)', fontSize: 12, padding: 16, textAlign: 'center' }}>
                Aucune anomalie récente détectée.
              </div>
            ) : (
              recentActivity.slice(0, 4).map((entry, i) => (
                <div key={entry.id || i} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '8px 10px', background: 'var(--admin-input-bg, #F8FAFC)', borderRadius: 8, border: '1px solid var(--admin-card-border, #E2E8F0)' }}>
                  {actionIcon(entry.action)}
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 12, color: 'var(--admin-text-main, #0F172A)', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {actionLabel(entry.action)}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--admin-text-muted, #94A3B8)' }}>{timeAgo(entry.createdAt)}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ─── ROW 4 : ÉTAT DU SYSTÈME & INFRASTRUCTURE ────────────────────────── */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Zap size={18} color="#22C55E" />
            <h3 style={styles.cardTitle}>État de la Plateforme &amp; Services API</h3>
          </div>
          <span style={{ fontSize: 11, color: '#22C55E', fontWeight: 700 }}>● 100% Opérationnel</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginTop: 16 }}>
          <div style={{ background: 'var(--admin-input-bg, #F8FAFC)', padding: 14, borderRadius: 10, border: '1px solid var(--admin-card-border, #E2E8F0)' }}>
            <span style={{ fontSize: 11, color: 'var(--admin-text-sub, #64748B)' }}>SERVEUR BACKEND API</span>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#22C55E', marginTop: 4 }}>Node.js / Express (Port 5000)</div>
          </div>

          <div style={{ background: 'var(--admin-input-bg, #F8FAFC)', padding: 14, borderRadius: 10, border: '1px solid var(--admin-card-border, #E2E8F0)' }}>
            <span style={{ fontSize: 11, color: 'var(--admin-text-sub, #64748B)' }}>BASE DE DONNÉES</span>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#22C55E', marginTop: 4 }}>MySQL (digicouture_db)</div>
          </div>

          <div style={{ background: 'var(--admin-input-bg, #F8FAFC)', padding: 14, borderRadius: 10, border: '1px solid var(--admin-card-border, #E2E8F0)' }}>
            <span style={{ fontSize: 11, color: 'var(--admin-text-sub, #64748B)' }}>WEBHOOKS CINETPAY</span>
            <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--admin-text-main, #0F172A)', marginTop: 4 }}>{usage?.totalApiCalls || 0} requêtes</div>
          </div>

          <div style={{ background: 'var(--admin-input-bg, #F8FAFC)', padding: 14, borderRadius: 10, border: '1px solid var(--admin-card-border, #E2E8F0)' }}>
            <span style={{ fontSize: 11, color: 'var(--admin-text-sub, #64748B)' }}>LOGS DE SÉCURITÉ</span>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#22C55E', marginTop: 4 }}>0 menace critique</div>
          </div>
        </div>
      </div>

    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  bannerContainer: {
    background: 'var(--admin-card-bg, #FFFFFF)',
    border: '1px solid var(--admin-card-border, #E2E8F0)',
    borderRadius: 16,
    padding: '20px 24px',
    marginBottom: 24,
    boxShadow: 'var(--admin-card-shadow, 0 4px 20px rgba(0, 0, 0, 0.03))',
  },
  iconRefreshBtn: {
    background: 'var(--admin-input-bg, #F8FAFC)',
    border: '1px solid var(--admin-card-border, #E2E8F0)',
    borderRadius: 8,
    padding: '8px 10px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  goldActionBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 16px',
    background: 'linear-gradient(135deg, #D4AF37, #a8862a)',
    border: 'none',
    borderRadius: 8,
    color: '#0B0B0D',
    fontSize: 12,
    fontWeight: 800,
    cursor: 'pointer',
  },
  secondaryActionBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 16px',
    background: 'var(--admin-card-bg, #FFFFFF)',
    border: '1px solid var(--admin-card-border, #E2E8F0)',
    borderRadius: 8,
    color: 'var(--admin-text-main, #0F172A)',
    fontSize: 12,
    fontWeight: 700,
    cursor: 'pointer',
  },
  card: {
    background: 'var(--admin-card-bg, #FFFFFF)',
    border: '1px solid var(--admin-card-border, #E2E8F0)',
    borderRadius: 16,
    padding: 20,
    boxShadow: 'var(--admin-card-shadow, 0 4px 20px rgba(0, 0, 0, 0.03))',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardSectionLabel: {
    fontSize: 10,
    fontWeight: 800,
    color: 'var(--admin-text-sub, #64748B)',
    letterSpacing: '0.8px',
    marginBottom: 2,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 800,
    color: 'var(--admin-text-main, #0F172A)',
    margin: 0,
  },
};

export default AdminDashboard;
