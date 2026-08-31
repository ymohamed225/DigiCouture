import React, { useState, useEffect, useCallback } from 'react';
import { DataTable } from '../components/ui/DataTable';
import { StatusBadge } from '../components/ui/StatusBadge';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { ErrorState } from '../components/ui/EmptyState';
import { KpiCard } from '../components/ui/KpiCard';
import { adminApi, type AdminAtelier } from '../services/adminApi';
import { 
  Eye, ShieldAlert, ShieldCheck, Award, RefreshCw, 
  Building2, Users, Search, Plus, Phone, MapPin, Sparkles
} from 'lucide-react';

interface AteliersPageProps {
  onSelectAtelier: (id: string) => void;
}

export const AteliersPage: React.FC<AteliersPageProps> = ({ onSelectAtelier }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ateliers, setAteliers] = useState<AdminAtelier[]>([]);
  const [, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'free' | 'suspended'>('all');
  const [filterPlan, setFilterPlan] = useState<string>('all');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [newAtelier, setNewAtelier] = useState({
    name: '',
    phone: '',
    email: '',
    city: 'Abidjan, Côte d’Ivoire',
    planCode: 'PRO',
  });

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: 'suspend' | 'activate';
    atelierId: string;
    atelierName: string;
  }>({
    isOpen: false,
    type: 'suspend',
    atelierId: '',
    atelierName: '',
  });

  const [subModal, setSubModal] = useState<{
    isOpen: boolean;
    atelierId: string;
    atelierName: string;
    currentPlan: string;
  }>({
    isOpen: false,
    atelierId: '',
    atelierName: '',
    currentPlan: '',
  });

  const [actionLoading, setActionLoading] = useState(false);
  const [selectedPlanCode, setSelectedPlanCode] = useState('PRO');

  const loadAteliers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminApi.getAteliers({
        limit: 100, // Fetch broader set for local filtering
        offset: 0,
      });
      if (res.success) {
        setAteliers(res.data);
        setTotal(res.total);
      }
    } catch (err: any) {
      setError(err.message || 'Impossible de charger la liste des ateliers.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAteliers();
  }, [loadAteliers]);

  // Actions Handlers
  const handleCreateAtelier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAtelier.name || !newAtelier.phone) {
      alert('Veuillez renseigner au moins le nom et le numéro de téléphone.');
      return;
    }
    setCreateLoading(true);
    try {
      const res = await adminApi.createAtelier(newAtelier);
      if (res.success) {
        setIsCreateModalOpen(false);
        setNewAtelier({ name: '', phone: '', email: '', city: 'Abidjan, Côte d’Ivoire', planCode: 'PRO' });
        loadAteliers();
        alert(res.message);
      }
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la création de l\'atelier.');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleSuspendActivate = async () => {
    setActionLoading(true);
    try {
      const { type, atelierId } = confirmDialog;
      if (type === 'suspend') {
        await adminApi.suspendAtelier(atelierId);
      } else {
        await adminApi.activateAtelier(atelierId);
      }
      setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      loadAteliers();
    } catch (err: any) {
      alert(err.message || 'Une erreur est survenue.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleChangeSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await adminApi.changeAtelierSubscription(subModal.atelierId, selectedPlanCode);
      setSubModal(prev => ({ ...prev, isOpen: false }));
      loadAteliers();
    } catch (err: any) {
      alert(err.message || 'Une erreur est survenue.');
    } finally {
      setActionLoading(false);
    }
  };

  // Dynamic Filtering Logic
  const filteredAteliers = ateliers.filter(a => {
    const isSuspended = a.subscriptionStatus === 'canceled' || a.status === 'suspended';
    const isFree = a.subscriptionPlan === 'FREE' || !a.subscriptionPlan;
    const isActive = !isSuspended;

    if (filterStatus === 'active' && !isActive) return false;
    if (filterStatus === 'free' && (!isFree || isSuspended)) return false;
    if (filterStatus === 'suspended' && !isSuspended) return false;

    if (filterPlan !== 'all' && a.subscriptionPlan !== filterPlan) return false;

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchName = (a.name || '').toLowerCase().includes(q);
      const matchPhone = (a.phone || '').toLowerCase().includes(q);
      const matchId = (a.id || '').toLowerCase().includes(q);
      const matchCountry = (a.country || a.city || '').toLowerCase().includes(q);
      return matchName || matchPhone || matchId || matchCountry;
    }
    return true;
  });

  // KPIs
  const totalCount = ateliers.length;
  const activeCount = ateliers.filter(a => a.subscriptionStatus === 'active' && a.subscriptionPlan !== 'FREE').length;
  const freeTrialCount = ateliers.filter(a => a.subscriptionPlan === 'FREE' || !a.subscriptionPlan).length;
  const suspendedCount = ateliers.filter(a => a.subscriptionStatus === 'canceled' || a.status === 'suspended').length;

  const paginatedData = filteredAteliers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const columns = [
    {
      key: 'name',
      header: 'Atelier de Couture',
      render: (item: AdminAtelier) => (
        <div>
          <div style={{ fontWeight: 700, color: '#F5F5F5', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Building2 size={14} color="#D4AF37" />
            {item.name}
          </div>
          <div style={{ fontSize: 11, color: '#8B8B94', marginTop: 2 }}>ID: {item.id}</div>
        </div>
      ),
    },
    {
      key: 'phone',
      header: 'Contact WhatsApp',
      render: (item: AdminAtelier) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#F5F5F5' }}>
          <Phone size={12} color="#22C55E" />
          <span>{item.phone || 'Non renseigné'}</span>
        </div>
      )
    },
    {
      key: 'country',
      header: 'Localisation',
      render: (item: AdminAtelier) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#8B8B94' }}>
          <MapPin size={12} color="#818CF8" />
          <span>{item.country || item.city || 'Côte d’Ivoire'}</span>
        </div>
      )
    },
    {
      key: 'subscriptionPlan',
      header: 'Formule & Quotas',
      render: (item: AdminAtelier) => (
        <StatusBadge status={item.subscriptionPlan || 'FREE'} />
      ),
    },
    {
      key: 'subscriptionStatus',
      header: 'État d\'accès',
      render: (item: AdminAtelier) => {
        const isSuspended = item.subscriptionStatus === 'canceled' || item.status === 'suspended';
        return <StatusBadge status={isSuspended ? 'suspended' : 'active'} />;
      },
    },
    {
      key: 'totalOrders',
      header: 'Commandes',
      render: (item: any) => (
        <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 700, color: '#F5F5F5' }}>
          {item.totalOrders || 0}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Inscrit le',
      render: (item: AdminAtelier) => (
        <span style={{ color: '#8B8B94', fontSize: 12 }}>
          {item.createdAt ? new Date(item.createdAt).toLocaleDateString('fr-FR') : '—'}
        </span>
      ),
    },
  ];

  const actions = (item: any) => {
    const isSuspended = item.subscriptionStatus === 'canceled' || item.status === 'suspended';
    return (
      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
        <button
          onClick={() => onSelectAtelier(item.id)}
          title="Consulter la fiche 360°"
          style={styles.actionBtn}
        >
          <Eye size={13} />
        </button>
        <button
          onClick={() => {
            setSelectedPlanCode(item.subscriptionPlan || 'PRO');
            setSubModal({
              isOpen: true,
              atelierId: item.id,
              atelierName: item.name,
              currentPlan: item.subscriptionPlan || 'FREE',
            });
          }}
          title="Modifier l'abonnement / plan"
          style={styles.actionBtn}
        >
          <Award size={13} color="#D4AF37" />
        </button>
        {!isSuspended ? (
          <button
            onClick={() => setConfirmDialog({
              isOpen: true,
              type: 'suspend',
              atelierId: item.id,
              atelierName: item.name,
            })}
            title="Suspendre l'atelier"
            style={{ ...styles.actionBtn, borderColor: 'rgba(239,68,68,0.25)', color: '#EF4444' }}
          >
            <ShieldAlert size={13} />
          </button>
        ) : (
          <button
            onClick={() => setConfirmDialog({
              isOpen: true,
              type: 'activate',
              atelierId: item.id,
              atelierName: item.name,
            })}
            title="Réactiver l'accès atelier"
            style={{ ...styles.actionBtn, borderColor: 'rgba(34,197,94,0.25)', color: '#22C55E' }}
          >
            <ShieldCheck size={13} />
          </button>
        )}
      </div>
    );
  };

  if (error) {
    return <ErrorState message={error} onRetry={loadAteliers} />;
  }

  return (
    <div style={{ padding: 24, background: '#0B0B0D', minHeight: '100vh', color: '#F5F5F5' }}>
      {/* Header Page */}
      <div style={styles.header}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Building2 size={20} color="#D4AF37" />
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#F5F5F5', margin: 0 }}>
              Ateliers de Couture Inscrits
            </h1>
          </div>
          <p style={{ fontSize: 13, color: '#8B8B94', marginTop: 6, margin: 0 }}>
            Supervision globale des ateliers clients, gestion des abonnements, activations et quotas métier
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={loadAteliers} style={styles.refreshBtn}>
            <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            Rafraîchir
          </button>

          <button 
            onClick={() => setIsCreateModalOpen(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 16px', background: 'linear-gradient(135deg, #D4AF37, #a8862a)',
              border: 'none', borderRadius: 8, color: '#0B0B0D',
              fontSize: 12, fontWeight: 800, cursor: 'pointer'
            }}
          >
            <Plus size={16} />
            Inscrire un Atelier
          </button>
        </div>
      </div>

      {/* 4 KPI Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        <KpiCard 
          label="Total Ateliers" 
          value={totalCount} 
          icon={<Building2 size={18} />} 
          accentColor="#D4AF37" 
        />
        <KpiCard 
          label="Ateliers Payants (Pro/Atelier)" 
          value={activeCount} 
          icon={<Sparkles size={18} />} 
          accentColor="#22C55E" 
        />
        <KpiCard 
          label="Offres Gratuit / Découverte" 
          value={freeTrialCount} 
          icon={<Users size={18} />} 
          accentColor="#818CF8" 
        />
        <KpiCard 
          label="Ateliers Suspendus" 
          value={suspendedCount} 
          icon={<ShieldAlert size={18} />} 
          accentColor="#EF4444" 
        />
      </div>

      {/* Barre de Recherche et Filtres */}
      <div style={{ background: '#121216', border: '1px solid #24242A', borderRadius: 12, padding: 16, marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        {/* Statuts filter pills */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: `Tous (${totalCount})` },
            { id: 'active', label: `🟢 Actifs Payants (${activeCount})` },
            { id: 'free', label: `⏳ Offre Découverte (${freeTrialCount})` },
            { id: 'suspended', label: `🔴 Suspendus (${suspendedCount})` }
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
            <option value="all">Tous les Plans</option>
            <option value="FREE">Formule GRATUIT</option>
            <option value="STARTER">Formule STARTER</option>
            <option value="PRO">Formule PRO</option>
            <option value="ATELIER">Formule ATELIER</option>
          </select>

          <div style={{ position: 'relative', minWidth: 220 }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#4a4a56' }} />
            <input 
              type="text"
              placeholder="Nom, Téléphone, Ville..."
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
        totalItems={filteredAteliers.length}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        actions={actions}
      />

      {/* Modal : Inscrire un Nouvel Atelier */}
      {isCreateModalOpen && (
        <div style={styles.modalOverlay} onClick={() => setIsCreateModalOpen(false)}>
          <div style={{ ...styles.modalCard, maxWidth: 460 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #24242A', paddingBottom: 12, marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Building2 size={18} color="#D4AF37" />
                <h3 style={{ margin: 0, color: '#F5F5F5', fontSize: 16, fontWeight: 800 }}>Inscrire un Nouvel Atelier</h3>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} style={{ background: 'none', border: 'none', color: '#8B8B94', fontSize: 16, cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleCreateAtelier}>
              <div style={{ marginBottom: 14 }}>
                <label style={styles.label}>Nom de l'Atelier de Couture *</label>
                <input 
                  type="text" 
                  required
                  placeholder="ex: Atelier Couture Élégance"
                  value={newAtelier.name}
                  onChange={e => setNewAtelier({ ...newAtelier, name: e.target.value })}
                  style={styles.input}
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={styles.label}>Numéro Téléphone / WhatsApp *</label>
                <input 
                  type="text" 
                  required
                  placeholder="ex: +225 0700112233"
                  value={newAtelier.phone}
                  onChange={e => setNewAtelier({ ...newAtelier, phone: e.target.value })}
                  style={styles.input}
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={styles.label}>Email du Gérant (Optionnel)</label>
                <input 
                  type="email" 
                  placeholder="ex: gerant@couture.ci"
                  value={newAtelier.email}
                  onChange={e => setNewAtelier({ ...newAtelier, email: e.target.value })}
                  style={styles.input}
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={styles.label}>Ville / Pays</label>
                <input 
                  type="text" 
                  placeholder="ex: Abidjan, Côte d’Ivoire"
                  value={newAtelier.city}
                  onChange={e => setNewAtelier({ ...newAtelier, city: e.target.value })}
                  style={styles.input}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={styles.label}>Formule d'Abonnement de Départ</label>
                <select
                  value={newAtelier.planCode}
                  onChange={e => setNewAtelier({ ...newAtelier, planCode: e.target.value })}
                  style={styles.select}
                >
                  <option value="FREE">FREE (Découverte - 20 commandes)</option>
                  <option value="STARTER">STARTER (2 000 FCFA/mois)</option>
                  <option value="PRO">PRO (5 000 FCFA/mois) [Recommandé]</option>
                  <option value="ATELIER">ATELIER (10 000 FCFA/mois)</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  style={styles.cancelBtn}
                >
                  Annuler
                </button>
                <button type="submit" disabled={createLoading} style={styles.saveBtn}>
                  {createLoading ? 'Inscription...' : '✓ Activer l\'Atelier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Suspension/Activation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={handleSuspendActivate}
        title={confirmDialog.type === 'suspend' ? 'Suspendre l\'atelier ?' : 'Activer l\'atelier ?'}
        description={
          confirmDialog.type === 'suspend'
            ? `Êtes-vous sûr de vouloir suspendre l'atelier "${confirmDialog.atelierName}" ? Les collaborateurs et clients ne pourront plus accéder à leurs espaces.`
            : `Voulez-vous réactiver l'accès pour l'atelier "${confirmDialog.atelierName}" ? Son accès et ses abonnements associés seront rétablis.`
        }
        confirmLabel={confirmDialog.type === 'suspend' ? 'Suspendre' : 'Activer'}
        confirmVariant={confirmDialog.type === 'suspend' ? 'danger' : 'primary'}
        loading={actionLoading}
      />

      {/* Change Subscription Modal */}
      {subModal.isOpen && (
        <div style={styles.modalOverlay} onClick={() => setSubModal(prev => ({ ...prev, isOpen: false }))}>
          <div style={styles.modalCard} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 8px', color: '#F5F5F5' }}>Changer d'abonnement</h3>
            <p style={{ margin: '0 0 20px', color: '#8B8B94', fontSize: 13 }}>
              Atelier : <strong>{subModal.atelierName}</strong> (Plan actuel: {subModal.currentPlan})
            </p>

            <form onSubmit={handleChangeSubscription}>
              <div style={{ marginBottom: 20 }}>
                <label style={styles.label}>Nouveau Plan tarifaire</label>
                <select
                  value={selectedPlanCode}
                  onChange={e => setSelectedPlanCode(e.target.value)}
                  style={styles.select}
                >
                  <option value="FREE">FREE (Gratuit)</option>
                  <option value="STARTER">STARTER (2 000 FCFA/mois)</option>
                  <option value="PRO">PRO (5 000 FCFA/mois)</option>
                  <option value="ATELIER">ATELIER (10 000 FCFA/mois)</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setSubModal(prev => ({ ...prev, isOpen: false }))}
                  style={styles.cancelBtn}
                >
                  Annuler
                </button>
                <button type="submit" disabled={actionLoading} style={styles.saveBtn}>
                  {actionLoading ? 'Mise à jour...' : 'Sauvegarder'}
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
  actionBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    background: 'none',
    border: '1px solid #24242A',
    color: '#8B8B94',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
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
    maxWidth: 420,
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
  input: {
    width: '100%',
    background: '#0B0B0D',
    border: '1px solid #24242A',
    borderRadius: 8,
    padding: '10px 12px',
    color: '#F5F5F5',
    fontSize: 13,
    outline: 'none',
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

export default AteliersPage;
