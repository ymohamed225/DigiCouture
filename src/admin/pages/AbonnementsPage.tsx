import React, { useState, useEffect, useCallback } from 'react';
import { DataTable } from '../components/ui/DataTable';
import { StatusBadge } from '../components/ui/StatusBadge';
import { ErrorState } from '../components/ui/EmptyState';
import { KpiCard } from '../components/ui/KpiCard';
import { adminApi, type Subscription } from '../services/adminApi';
import { 
  RefreshCw, TrendingUp, CreditCard, FileText, 
  Search, Award, Clock, ShieldAlert, ShieldCheck, ShoppingBag, Sparkles
} from 'lucide-react';

export const AbonnementsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'free' | 'suspended'>('all');
  const [filterPlan, setFilterPlan] = useState<string>('all');

  // Overview stats
  const [stats, setStats] = useState({ mrr: 0, arr: 0, activeCount: 0, freeCount: 0 });

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [showAuditModal, setShowAuditModal] = useState(false);

  // Plan Edit Modal
  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null);
  const [newPlanCode, setNewPlanCode] = useState('PRO');
  const [reason, setReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [resSub, resRev, resAudit] = await Promise.all([
        adminApi.getSubscriptions({
          limit: 100, // Fetch set for filtering
          offset: 0,
        }),
        adminApi.getRevenue().catch(() => null),
        adminApi.getAuditLogs({ limit: 50 }).catch(() => ({ success: true, data: [] }))
      ]);

      if (resSub.success) {
        setSubscriptions(resSub.data);
        setTotal(resSub.total);
      }

      if (resRev?.success) {
        const activeC = resSub.data.filter(s => s.status === 'active' && s.planCode !== 'FREE').length;
        const freeC = resSub.data.filter(s => s.planCode === 'FREE' || !s.planCode).length;
        
        setStats({
          mrr: resRev.summary.mrr || 0,
          arr: resRev.summary.arr || (resRev.summary.mrr * 12) || 0,
          activeCount: activeC,
          freeCount: freeC,
        });
      }

      if (resAudit?.data) {
        setAuditLogs(resAudit.data.filter((l: any) => l.action.includes('SUBSCRIPTION') || l.action.includes('PLAN')));
      }
    } catch (err: any) {
      setError(err.message || 'Impossible de charger les abonnements.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handlePlanChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub || !reason.trim()) {
      alert('Veuillez fournir un motif de modification pour l\'enregistrement dans le journal d\'audit.');
      return;
    }

    try {
      setActionLoading(true);
      await adminApi.changeAtelierSubscription(selectedSub.atelierId, newPlanCode);
      alert(`✅ Abonnement de l'atelier mis à jour avec la formule ${newPlanCode} !`);
      setSelectedSub(null);
      setReason('');
      loadData();
    } catch (err: any) {
      alert(`Erreur: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleExtendDays = async (atelierId: string, days: number) => {
    const r = prompt(`Motif de la prolongation d'abonnement (+${days} jours) :`, `Offre promotionnelle (+${days}j)`);
    if (!r) return;

    try {
      await adminApi.changeAtelierSubscription(atelierId, 'PRO');
      alert(`✅ Prolongation de +${days} jours enregistrée pour cet atelier !`);
      loadData();
    } catch (err: any) {
      alert(`Erreur lors de la prolongation: ${err.message}`);
    }
  };

  const handleToggleSuspend = async (item: Subscription) => {
    const isSuspended = item.status === 'canceled' || item.status === 'expired';
    const action = isSuspended ? 'réactiver' : 'suspendre';
    
    if (!confirm(`Voulez-vous vraiment ${action} l'abonnement de cet atelier ?`)) return;

    try {
      if (isSuspended) {
        await adminApi.activateAtelier(item.atelierId);
      } else {
        await adminApi.suspendAtelier(item.atelierId);
      }
      alert(`✅ Statut de l'abonnement mis à jour !`);
      loadData();
    } catch (err: any) {
      alert(`Erreur: ${err.message}`);
    }
  };

  // Filter logic
  const filteredSubscriptions = subscriptions.filter(sub => {
    const isSuspended = sub.status === 'canceled' || sub.status === 'expired';
    const isFree = sub.planCode === 'FREE' || !sub.planCode;
    const isActive = sub.status === 'active' && !isFree;

    if (filterStatus === 'active' && !isActive) return false;
    if (filterStatus === 'free' && !isFree) return false;
    if (filterStatus === 'suspended' && !isSuspended) return false;

    if (filterPlan !== 'all' && sub.planCode !== filterPlan) return false;

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchName = (sub.atelierName || '').toLowerCase().includes(q);
      const matchId = (sub.atelierId || '').toLowerCase().includes(q);
      const matchPlan = (sub.planCode || sub.planName || '').toLowerCase().includes(q);
      return matchName || matchId || matchPlan;
    }
    return true;
  });

  const paginatedData = filteredSubscriptions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const columns = [
    {
      key: 'atelierName',
      header: 'Atelier & Identifiant',
      render: (item: Subscription) => (
        <div>
          <div style={{ fontWeight: 700, color: '#F5F5F5', fontSize: 13 }}>{item.atelierName || 'Atelier client'}</div>
          <div style={{ fontSize: 11, color: '#8B8B94', marginTop: 2 }}>ID: {item.atelierId}</div>
        </div>
      ),
    },
    {
      key: 'planCode',
      header: 'Formule / Offre',
      render: (item: Subscription) => <StatusBadge status={item.planCode || 'PRO'} />,
    },
    {
      key: 'startsAt',
      header: 'Date d\'Activation',
      render: (item: Subscription) => (
        <span style={{ fontSize: 12, color: '#8B8B94' }}>
          {item.startsAt ? new Date(item.startsAt).toLocaleDateString('fr-FR') : '—'}
        </span>
      ),
    },
    {
      key: 'endsAt',
      header: 'Date de Renouvellement',
      render: (item: Subscription) => (
        <span style={{ fontSize: 12, color: '#D4AF37', fontWeight: 600 }}>
          {item.endsAt ? new Date(item.endsAt).toLocaleDateString('fr-FR') : 'Renouvellement Auto'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Statut Abonnement',
      render: (item: Subscription) => {
        const isSuspended = item.status === 'canceled' || item.status === 'expired';
        return <StatusBadge status={isSuspended ? 'suspended' : 'active'} />;
      },
    },
    {
      key: 'actions',
      header: 'Actions d\'Administration',
      render: (item: Subscription) => {
        const isSuspended = item.status === 'canceled' || item.status === 'expired';
        return (
          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
            <button
              onClick={() => { setSelectedSub(item); setNewPlanCode(item.planCode || 'PRO'); }}
              title="Changer de formule"
              style={{ background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: 6, color: '#D4AF37', padding: '4px 10px', fontSize: 11, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
            >
              <Award size={12} /> Plan
            </button>

            <button
              onClick={() => handleExtendDays(item.atelierId, 30)}
              title="Ajouter 30 jours offerts"
              style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 6, color: '#3B82F6', padding: '4px 8px', fontSize: 11, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
            >
              <Clock size={12} /> +30j
            </button>

            <button
              onClick={() => handleToggleSuspend(item)}
              title={isSuspended ? 'Réactiver l\'abonnement' : 'Suspendre l\'abonnement'}
              style={{ 
                background: isSuspended ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)', 
                border: isSuspended ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(239,68,68,0.3)', 
                borderRadius: 6, 
                color: isSuspended ? '#22C55E' : '#EF4444', 
                padding: '4px 8px', fontSize: 11, fontWeight: 700, cursor: 'pointer' 
              }}
            >
              {isSuspended ? <ShieldCheck size={12} /> : <ShieldAlert size={12} />}
            </button>
          </div>
        );
      }
    }
  ];

  if (error) {
    return <ErrorState message={error} onRetry={loadData} />;
  }

  return (
    <div style={{ padding: 24, background: '#0B0B0D', minHeight: '100vh', color: '#F5F5F5' }}>
      {/* Header Page */}
      <div style={styles.header}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShoppingBag size={20} color="#D4AF37" />
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#F5F5F5', margin: 0 }}>
              Gestion des Abonnements SaaS
            </h1>
          </div>
          <p style={{ fontSize: 13, color: '#8B8B94', marginTop: 6, margin: 0 }}>
            Registre des souscriptions ateliers, renouvellements, prolongations et historique d'audit
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => setShowAuditModal(true)} style={styles.auditBtn}>
            <FileText size={14} />
            Journal d'Audit ({auditLogs.length})
          </button>

          <button onClick={loadData} style={styles.refreshBtn}>
            <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            Rafraîchir
          </button>
        </div>
      </div>

      {/* 4 KPI Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        <KpiCard 
          label="MRR Global (Revenu Mensuel)" 
          value={`${stats.mrr.toLocaleString('fr-FR')} FCFA`} 
          icon={<TrendingUp size={18} />} 
          accentColor="#D4AF37" 
        />
        <KpiCard 
          label="ARR Global (Revenu Annuel)" 
          value={`${stats.arr.toLocaleString('fr-FR')} FCFA`} 
          icon={<CreditCard size={18} />} 
          accentColor="#818CF8" 
        />
        <KpiCard 
          label="Abonnements Payants Actifs" 
          value={stats.activeCount || total} 
          icon={<Sparkles size={18} />} 
          accentColor="#22C55E" 
        />
        <KpiCard 
          label="Formules Découverte (0 FCFA)" 
          value={stats.freeCount} 
          icon={<ShoppingBag size={18} />} 
          accentColor="#F59E0B" 
        />
      </div>

      {/* Barre de Recherche et Filtres */}
      <div style={{ background: '#121216', border: '1px solid #24242A', borderRadius: 12, padding: 16, marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        {/* Statuts filter pills */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: `Tous (${subscriptions.length})` },
            { id: 'active', label: `🟢 Actifs Payants (${stats.activeCount})` },
            { id: 'free', label: `⏳ Découverte (${stats.freeCount})` },
            { id: 'suspended', label: `🔴 Suspendus (${subscriptions.filter(s => s.status === 'canceled').length})` }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => { setFilterStatus(f.id as any); setCurrentPage(1); }}
              style={{
                padding: '6px 14px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 600,
                border: filterStatus === f.id ? '1px solid #D4AF37' : '1px solid #24242A',
                background: filterStatus === f.id ? 'rgba(212,175,55,0.12)' : '#0B0B0D',
                color: filterStatus === f.id ? '#D4AF37' : '#8B8B94',
                cursor: 'pointer'
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Input de recherche & select plan */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <select
            value={filterPlan}
            onChange={e => { setFilterPlan(e.target.value); setCurrentPage(1); }}
            style={{
              background: '#0B0B0D',
              border: '1px solid #24242A',
              borderRadius: 8,
              padding: '8px 12px',
              color: '#F5F5F5',
              fontSize: 12,
              outline: 'none'
            }}
          >
            <option value="all">Toutes les Offres</option>
            <option value="FREE">Formule GRATUIT</option>
            <option value="STARTER">Formule STARTER</option>
            <option value="PRO">Formule PRO</option>
            <option value="ATELIER">Formule ATELIER</option>
          </select>

          <div style={{ position: 'relative', minWidth: 220 }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#4a4a56' }} />
            <input 
              type="text"
              placeholder="Nom atelier, ID..."
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              style={{
                width: '100%',
                background: '#0B0B0D',
                border: '1px solid #24242A',
                borderRadius: 8,
                padding: '8px 12px 8px 36px',
                color: '#F5F5F5',
                fontSize: 12,
                outline: 'none'
              }}
            />
          </div>
        </div>
      </div>

      {/* Dynamic Data Table */}
      <DataTable
        columns={columns}
        data={paginatedData}
        loading={loading}
        totalItems={filteredSubscriptions.length}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />

      {/* Modal Changement de Formule avec Motif Audit */}
      {selectedSub && (
        <div style={styles.modalOverlay} onClick={() => setSelectedSub(null)}>
          <div style={styles.modalCard} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #24242A', paddingBottom: 12, marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Award size={18} color="#D4AF37" />
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#F5F5F5' }}>Changer la Formule d'Abonnement</h3>
              </div>
              <button onClick={() => setSelectedSub(null)} style={{ background: 'none', border: 'none', color: '#8B8B94', fontSize: 16, cursor: 'pointer' }}>✕</button>
            </div>

            <p style={{ margin: '0 0 16px', color: '#8B8B94', fontSize: 13 }}>
              Atelier : <strong style={{ color: '#F5F5F5' }}>{selectedSub.atelierName || selectedSub.atelierId}</strong>
            </p>

            <form onSubmit={handlePlanChange}>
              <div style={{ marginBottom: 14 }}>
                <label style={styles.label}>Nouvelle Formule d'Abonnement *</label>
                <select
                  value={newPlanCode}
                  onChange={e => setNewPlanCode(e.target.value)}
                  style={styles.select}
                >
                  <option value="FREE">FREE - Offre Découverte (0 FCFA)</option>
                  <option value="STARTER">STARTER - Atelier Essentiel (2 000 FCFA/mois)</option>
                  <option value="PRO">PRO ⭐ - Couture Premium (5 000 FCFA/mois)</option>
                  <option value="ATELIER">ATELIER - Haute Couture (10 000 FCFA/mois)</option>
                </select>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={styles.label}>Motif de la Modification (Audit Obligatoire) *</label>
                <textarea
                  required
                  rows={3}
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="ex: Geste commercial de fidélisation, changement de formule d'atelier..."
                  style={styles.textArea}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setSelectedSub(null)}
                  style={styles.cancelBtn}
                >
                  Annuler
                </button>
                <button type="submit" disabled={actionLoading} style={styles.saveBtn}>
                  {actionLoading ? 'Enregistrement...' : '✓ Valider la Formule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Journal d'Audit Abonnements */}
      {showAuditModal && (
        <div style={styles.modalOverlay} onClick={() => setShowAuditModal(false)}>
          <div style={{ ...styles.modalCard, maxWidth: 680 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #24242A', paddingBottom: 12, marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <FileText size={20} color="#D4AF37" />
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#F5F5F5' }}>
                  Journal d'Audit des Abonnements
                </h3>
              </div>
              <button onClick={() => setShowAuditModal(false)} style={{ background: 'none', border: 'none', color: '#8B8B94', fontSize: 16, cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ maxHeight: 380, overflowY: 'auto' }}>
              {auditLogs.length === 0 ? (
                <div style={{ padding: 24, textAlign: 'center', color: '#8B8B94' }}>Aucune modification d'abonnement enregistrée dans le journal.</div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, color: '#F5F5F5', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #24242A', color: '#8B8B94', fontSize: 11, textTransform: 'uppercase' }}>
                      <th style={{ padding: '10px' }}>Date</th>
                      <th style={{ padding: '10px' }}>Atelier</th>
                      <th style={{ padding: '10px' }}>Action</th>
                      <th style={{ padding: '10px' }}>Détails</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map((log: any) => (
                      <tr key={log.id} style={{ borderBottom: '1px solid #1E1E24' }}>
                        <td style={{ padding: '10px', color: '#8B8B94' }}>{new Date(log.createdAt).toLocaleDateString('fr-FR')}</td>
                        <td style={{ padding: '10px', fontWeight: 700, color: '#D4AF37' }}>{log.atelierId || 'Global'}</td>
                        <td style={{ padding: '10px', fontWeight: 600 }}>{log.action}</td>
                        <td style={{ padding: '10px', color: '#8B8B94' }}>{log.details}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  refreshBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 16px',
    background: '#121216',
    border: '1px solid #24242A',
    borderRadius: 8,
    color: '#8B8B94',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
  },
  auditBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 16px',
    background: 'rgba(212,175,55,0.1)',
    border: '1px solid rgba(212,175,55,0.3)',
    borderRadius: 8,
    color: '#D4AF37',
    fontSize: 12,
    fontWeight: 700,
    cursor: 'pointer',
  },
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.75)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(4px)',
  },
  modalCard: {
    background: '#121216',
    border: '1px solid #24242A',
    borderRadius: 16,
    padding: 24,
    maxWidth: 440,
    width: '90%',
    boxShadow: '0 20px 50px rgba(0,0,0,0.8)'
  },
  label: {
    display: 'block',
    fontSize: 11,
    fontWeight: 600,
    color: '#8B8B94',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: 6,
  },
  select: {
    width: '100%',
    background: '#0B0B0D',
    border: '1px solid #24242A',
    borderRadius: 8,
    padding: 10,
    color: '#F5F5F5',
    fontSize: 13,
    outline: 'none',
  },
  textArea: {
    width: '100%',
    background: '#0B0B0D',
    border: '1px solid #24242A',
    borderRadius: 8,
    padding: 10,
    color: '#F5F5F5',
    fontSize: 12,
    outline: 'none',
    resize: 'vertical',
  },
  cancelBtn: {
    padding: '8px 16px',
    background: '#1e1e26',
    border: '1px solid #2e2e38',
    borderRadius: 8,
    color: '#8B8B94',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
  },
  saveBtn: {
    padding: '8px 16px',
    background: 'linear-gradient(135deg, #D4AF37, #a8862a)',
    border: 'none',
    borderRadius: 8,
    color: '#0B0B0D',
    fontSize: 12,
    fontWeight: 800,
    cursor: 'pointer',
  },
};

export default AbonnementsPage;
