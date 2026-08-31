import React, { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../services/adminApi';
import { ErrorState } from '../components/ui/EmptyState';
import { RefreshCw, Edit3, Users, Package, HardDrive, Award } from 'lucide-react';

export const PlansPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [plans, setPlans] = useState<any[]>([]);

  // Edit Modal state
  const [editPlan, setEditPlan] = useState<any | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminApi.getPlans();
      if (res.success) {
        setPlans(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'Impossible de charger les plans tarifaires.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await adminApi.updatePlan(editPlan.id, {
        name: editPlan.name,
        priceMonthly: Number(editPlan.priceMonthly) || 0,
        priceYearly: Number(editPlan.priceYearly) || 0,
        maxUsers: Number(editPlan.maxUsers) || 1,
        maxClients: Number(editPlan.maxClients) || 50,
        maxOrders: Number(editPlan.maxOrders) || 100,
        storageLimitMb: Number(editPlan.storageLimitMb) || 500,
      });
      setEditPlan(null);
      load();
    } catch (err: any) {
      alert(err.message || 'Erreur de mise à jour du plan.');
    } finally {
      setActionLoading(false);
    }
  };

  if (error) {
    return <ErrorState message={error} onRetry={load} />;
  }

  return (
    <div>
      <div style={styles.header}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#F5F5F5', margin: 0 }}>Plans Tarifaires</h1>
          <p style={{ fontSize: 13, color: '#8B8B94', marginTop: 4 }}>
            Définition des formules d'abonnements, tarifs et quotas limites de DigiCouture VIP
          </p>
        </div>
        <button onClick={load} style={styles.refreshBtn}>
          <RefreshCw size={14} />
          Rafraîchir
        </button>
      </div>

      {loading ? (
        <div style={{ color: '#8B8B94', padding: '40px 0', textAlign: 'center' }}>
          Chargement des formules...
        </div>
      ) : (
        <div style={styles.grid}>
          {plans.map(plan => (
            <div key={plan.id} style={styles.planCard}>
              {/* Card Header */}
              <div style={styles.cardHeader}>
                <div style={styles.badgeCode}>{plan.code}</div>
                <button onClick={() => setEditPlan({ ...plan })} style={styles.editBtn}>
                  <Edit3 size={12} />
                  Modifier
                </button>
              </div>

              <h2 style={styles.planName}>{plan.name}</h2>

              {/* Price */}
              <div style={styles.priceRow}>
                <span style={styles.priceVal}>
                  {Number(plan.priceMonthly).toLocaleString('fr-FR')}
                </span>
                <span style={styles.pricePeriod}>FCFA / mois</span>
              </div>
              <div style={styles.yearlyPrice}>
                Annuel : {Number(plan.priceYearly).toLocaleString('fr-FR')} FCFA
              </div>

              {/* Quotas & Limits */}
              <div style={styles.limitsBox}>
                <div style={styles.limitRow}>
                  <Users size={14} color="#8B8B94" />
                  <span>Utilisateurs max : <strong>{plan.maxUsers}</strong></span>
                </div>
                <div style={styles.limitRow}>
                  <Users size={14} color="#8B8B94" />
                  <span>Clients max : <strong>{plan.maxClients}</strong></span>
                </div>
                <div style={styles.limitRow}>
                  <Package size={14} color="#8B8B94" />
                  <span>Commandes max : <strong>{plan.maxOrders}</strong></span>
                </div>
                <div style={styles.limitRow}>
                  <HardDrive size={14} color="#8B8B94" />
                  <span>Espace disque : <strong>{plan.storageLimitMb} Mo</strong></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Plan Modal */}
      {editPlan && (
        <div style={styles.modalOverlay} onClick={() => setEditPlan(null)}>
          <div style={styles.modalCard} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Award size={18} color="#D4AF37" />
              <h3 style={{ margin: 0, color: '#F5F5F5' }}>Configurer la formule {editPlan.code}</h3>
            </div>

            <form onSubmit={handleUpdateSubmit} style={styles.form}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Nom de la formule</label>
                <input
                  type="text"
                  value={editPlan.name}
                  onChange={e => setEditPlan({ ...editPlan, name: e.target.value })}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.row}>
                <div style={styles.col}>
                  <label style={styles.label}>Tarif mensuel (FCFA)</label>
                  <input
                    type="number"
                    value={editPlan.priceMonthly}
                    onChange={e => setEditPlan({ ...editPlan, priceMonthly: e.target.value })}
                    style={styles.input}
                    required
                  />
                </div>
                <div style={styles.col}>
                  <label style={styles.label}>Tarif annuel (FCFA)</label>
                  <input
                    type="number"
                    value={editPlan.priceYearly}
                    onChange={e => setEditPlan({ ...editPlan, priceYearly: e.target.value })}
                    style={styles.input}
                    required
                  />
                </div>
              </div>

              <div style={styles.row}>
                <div style={styles.col}>
                  <label style={styles.label}>Utilisateurs max</label>
                  <input
                    type="number"
                    value={editPlan.maxUsers}
                    onChange={e => setEditPlan({ ...editPlan, maxUsers: e.target.value })}
                    style={styles.input}
                    required
                  />
                </div>
                <div style={styles.col}>
                  <label style={styles.label}>Clients max</label>
                  <input
                    type="number"
                    value={editPlan.maxClients}
                    onChange={e => setEditPlan({ ...editPlan, maxClients: e.target.value })}
                    style={styles.input}
                    required
                  />
                </div>
              </div>

              <div style={styles.row}>
                <div style={styles.col}>
                  <label style={styles.label}>Commandes max</label>
                  <input
                    type="number"
                    value={editPlan.maxOrders}
                    onChange={e => setEditPlan({ ...editPlan, maxOrders: e.target.value })}
                    style={styles.input}
                    required
                  />
                </div>
                <div style={styles.col}>
                  <label style={styles.label}>Espace Disque (Mo)</label>
                  <input
                    type="number"
                    value={editPlan.storageLimitMb}
                    onChange={e => setEditPlan({ ...editPlan, storageLimitMb: e.target.value })}
                    style={styles.input}
                    required
                  />
                </div>
              </div>

              {/* Paramétrage des Habilitations & Fonctionnalités Métier */}
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #24242A' }}>
                <label style={{ ...styles.label, color: '#D4AF37', marginBottom: 10, display: 'block' }}>
                  ⚙️ Habilitations & Fonctionnalités Métier
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#F5F5F5', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={editPlan.hasProductionTracking !== false}
                      onChange={e => setEditPlan({ ...editPlan, hasProductionTracking: e.target.checked })}
                    />
                    <span>✂️ Suivi de Production</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#F5F5F5', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={editPlan.hasCatalogue !== false}
                      onChange={e => setEditPlan({ ...editPlan, hasCatalogue: e.target.checked })}
                    />
                    <span>👗 Accès Catalogue</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#F5F5F5', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={editPlan.hasReceipts !== false}
                      onChange={e => setEditPlan({ ...editPlan, hasReceipts: e.target.checked })}
                    />
                    <span>🧾 Génération Reçus</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#F5F5F5', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={Boolean(editPlan.hasWhatsapp)}
                      onChange={e => setEditPlan({ ...editPlan, hasWhatsapp: e.target.checked })}
                    />
                    <span>💬 Messages WhatsApp</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#F5F5F5', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={Boolean(editPlan.hasMultiUser)}
                      onChange={e => setEditPlan({ ...editPlan, hasMultiUser: e.target.checked })}
                    />
                    <span>👥 Multi-utilisateurs</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#F5F5F5', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={Boolean(editPlan.hasFinancialReports)}
                      onChange={e => setEditPlan({ ...editPlan, hasFinancialReports: e.target.checked })}
                    />
                    <span>📊 Rapports Financiers</span>
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 24 }}>
                <button type="button" onClick={() => setEditPlan(null)} style={styles.cancelBtn}>
                  Annuler
                </button>
                <button type="submit" disabled={actionLoading} style={styles.saveBtn}>
                  {actionLoading ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
              </div>
            </form>
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
    marginBottom: 28,
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
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: 20,
  },
  planCard: {
    background: '#121216',
    border: '1px solid #24242A',
    borderRadius: 14,
    padding: 24,
    display: 'flex',
    flexDirection: 'column',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgeCode: {
    background: 'rgba(212,175,55,0.08)',
    border: '1px solid rgba(212,175,55,0.2)',
    color: '#D4AF37',
    fontSize: 10,
    fontWeight: 700,
    padding: '3px 8px',
    borderRadius: 100,
  },
  editBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    background: 'none',
    border: 'none',
    color: '#8B8B94',
    fontSize: 11,
    cursor: 'pointer',
  },
  planName: {
    fontSize: 18,
    fontWeight: 800,
    color: '#F5F5F5',
    margin: '16px 0 8px',
  },
  priceRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 4,
  },
  priceVal: {
    fontSize: 26,
    fontWeight: 900,
    color: '#F5F5F5',
    fontVariantNumeric: 'tabular-nums',
  },
  pricePeriod: {
    fontSize: 12,
    color: '#8B8B94',
  },
  yearlyPrice: {
    fontSize: 11,
    color: '#4a4a56',
    marginTop: 2,
    marginBottom: 20,
  },
  limitsBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    borderTop: '1px solid #24242A',
    paddingTop: 16,
    marginTop: 'auto',
  },
  limitRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    fontSize: 12,
    color: '#8B8B94',
  },
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(3px)',
  },
  modalCard: {
    background: '#17171C',
    border: '1px solid #2e2e38',
    borderRadius: 16,
    padding: 24,
    maxWidth: 440,
    width: '90%',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  label: {
    fontSize: 10,
    fontWeight: 600,
    color: '#8B8B94',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  input: {
    background: '#0B0B0D',
    border: '1px solid #24242A',
    borderRadius: 8,
    padding: 10,
    color: '#F5F5F5',
    outline: 'none',
    fontSize: 13,
  },
  row: {
    display: 'flex',
    gap: 12,
  },
  col: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  cancelBtn: {
    padding: '9px 18px',
    background: '#1e1e26',
    border: '1px solid #2e2e38',
    borderRadius: 8,
    color: '#8B8B94',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  },
  saveBtn: {
    padding: '9px 18px',
    background: 'rgba(212,175,55,0.12)',
    border: '1px solid rgba(212,175,55,0.3)',
    borderRadius: 8,
    color: '#D4AF37',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  },
};
