import React, { useState, useEffect, useCallback } from 'react';
import { DataTable } from '../components/ui/DataTable';
import { StatusBadge } from '../components/ui/StatusBadge';
import { ErrorState } from '../components/ui/EmptyState';
import { adminApi, type SaasPayment } from '../services/adminApi';
import { RefreshCw, CreditCard, CheckCircle2, XCircle } from 'lucide-react';

export const PaiementsSaasPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<SaasPayment[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const itemsPerPage = 10;

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminApi.getSaasPayments({
        limit: itemsPerPage,
        offset: (currentPage - 1) * itemsPerPage,
        status: selectedStatus || undefined,
      });
      setData(res.data || []);
      setTotal(res.total || 0);
    } catch (err: any) {
      setError(err.message || 'Erreur de chargement des paiements SaaS');
    } finally {
      setLoading(false);
    }
  }, [currentPage, selectedStatus]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Compute stats
  const totalAmount = data
    .filter((p) => (p.status || '').toLowerCase() === 'paid' || (p.status || '').toLowerCase() === 'completed')
    .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  const completedCount = data.filter((p) => (p.status || '').toLowerCase() === 'paid' || (p.status || '').toLowerCase() === 'completed').length;
  const failedCount = data.filter((p) => (p.status || '').toLowerCase() === 'failed').length;

  const columns = [
    {
      key: 'reference',
      header: 'Référence',
      render: (item: SaasPayment) => (
        <span style={{ color: '#D4AF37', fontFamily: 'monospace', fontWeight: 600 }}>
          {item.reference || item.id}
        </span>
      ),
    },
    {
      key: 'atelierName',
      header: 'Atelier',
      render: (item: SaasPayment) => (
        <span style={{ color: '#F5F5F5', fontWeight: 600 }}>
          {item.atelierName || item.atelierId}
        </span>
      ),
    },
    {
      key: 'amount',
      header: 'Montant',
      render: (item: SaasPayment) => (
        <span style={{ color: '#10B981', fontWeight: 700 }}>
          {Number(item.amount).toLocaleString('fr-FR')} {item.currency || 'FCFA'}
        </span>
      ),
    },
    {
      key: 'method',
      header: 'Méthode',
      render: (item: SaasPayment) => (
        <span style={{ color: '#8B8B94', textTransform: 'uppercase', fontSize: 12 }}>
          {item.method}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Statut',
      render: (item: SaasPayment) => <StatusBadge status={item.status} />,
    },
    {
      key: 'createdAt',
      header: 'Date',
      render: (item: SaasPayment) => (
        <span style={{ color: '#8B8B94', fontSize: 12 }}>
          {new Date(item.createdAt).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px', background: '#0B0B0D', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ color: '#F5F5F5', fontSize: 24, fontWeight: 800, margin: 0 }}>
            Paiements SaaS
          </h1>
          <p style={{ color: '#8B8B94', fontSize: 13, marginTop: 4, margin: 0 }}>
            Historique des factures et abonnements réglés par les ateliers à DigiCouture VIP.
          </p>
        </div>
        <button
          onClick={loadData}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: '#121216',
            border: '1px solid #24242A',
            color: '#D4AF37',
            padding: '8px 16px',
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          <RefreshCw size={14} /> Actualiser
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div style={{ background: '#121216', border: '1px solid #24242A', borderRadius: 12, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#D4AF37', marginBottom: 8 }}>
            <CreditCard size={20} />
            <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: '#8B8B94' }}>
              Encaissé (Vue courante)
            </span>
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#F5F5F5' }}>
            {totalAmount.toLocaleString('fr-FR')} FCFA
          </div>
        </div>

        <div style={{ background: '#121216', border: '1px solid #24242A', borderRadius: 12, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#10B981', marginBottom: 8 }}>
            <CheckCircle2 size={20} />
            <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: '#8B8B94' }}>
              Paiements Réussis
            </span>
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#10B981' }}>
            {completedCount}
          </div>
        </div>

        <div style={{ background: '#121216', border: '1px solid #24242A', borderRadius: 12, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#EF4444', marginBottom: 8 }}>
            <XCircle size={20} />
            <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: '#8B8B94' }}>
              Échecs de paiement
            </span>
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#EF4444' }}>
            {failedCount}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {['', 'completed', 'pending', 'failed', 'refunded'].map((status) => (
          <button
            key={status}
            onClick={() => {
              setSelectedStatus(status);
              setCurrentPage(1);
            }}
            style={{
              padding: '6px 14px',
              borderRadius: 20,
              border: selectedStatus === status ? '1px solid #D4AF37' : '1px solid #24242A',
              background: selectedStatus === status ? 'rgba(212,175,55,0.1)' : '#121216',
              color: selectedStatus === status ? '#D4AF37' : '#8B8B94',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              textTransform: 'capitalize',
            }}
          >
            {status === '' ? 'Tous les paiements' : status}
          </button>
        ))}
      </div>

      {/* Table */}
      {error ? (
        <ErrorState message={error} onRetry={loadData} />
      ) : (
        <DataTable
          columns={columns}
          data={data}
          loading={loading}
          totalItems={total}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          exportEnabled
          title="Historique des Encaissements SaaS"
        />
      )}
    </div>
  );
};
