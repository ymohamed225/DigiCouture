import React, { useState, useEffect, useCallback } from 'react';
import { DataTable } from '../components/ui/DataTable';
import { StatusBadge } from '../components/ui/StatusBadge';
import { ErrorState } from '../components/ui/EmptyState';
import { adminApi, type SupportTicket } from '../services/adminApi';
import { RefreshCw, HelpCircle, AlertCircle, CheckCircle, Clock, Key } from 'lucide-react';

export const SupportPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const itemsPerPage = 10;

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminApi.getSupportTickets({
        limit: itemsPerPage,
        offset: (currentPage - 1) * itemsPerPage,
        status: selectedStatus || undefined,
      });
      setTickets(res.data || []);
      setTotal(res.total || 0);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des tickets de support');
    } finally {
      setLoading(false);
    }
  }, [currentPage, selectedStatus]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      setUpdatingId(id);
      await adminApi.updateTicket(id, newStatus);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la mise à jour du ticket');
    } finally {
      setUpdatingId(null);
    }
  };

  const openCount = tickets.filter((t) => t.status === 'open').length;
  const pendingCount = tickets.filter((t) => t.status === 'pending').length;
  const resolvedCount = tickets.filter((t) => t.status === 'resolved').length;
  const highPriorityCount = tickets.filter((t) => t.priority === 'high' || t.priority === 'critical').length;

  const getPriorityBadge = (priority: string) => {
    const map: Record<string, { bg: string; color: string; label: string }> = {
      critical: { bg: 'rgba(239,68,68,0.15)', color: '#EF4444', label: 'CRITIQUE' },
      high: { bg: 'rgba(245,158,11,0.15)', color: '#F59E0B', label: 'HAUTE' },
      medium: { bg: 'rgba(59,130,246,0.15)', color: '#3B82F6', label: 'MOYENNE' },
      low: { bg: 'rgba(139,139,148,0.15)', color: '#8B8B94', label: 'BASSE' },
    };
    const style = map[priority] || map.low;
    return (
      <span
        style={{
          background: style.bg,
          color: style.color,
          padding: '2px 8px',
          borderRadius: 12,
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: 0.5,
        }}
      >
        {style.label}
      </span>
    );
  };

  const columns = [
    {
      key: 'id',
      header: 'ID',
      render: (item: SupportTicket) => (
        <span style={{ color: '#D4AF37', fontFamily: 'monospace', fontWeight: 600, fontSize: 12 }}>
          {item.id.slice(0, 8)}
        </span>
      ),
    },
    {
      key: 'atelierName',
      header: 'Atelier',
      render: (item: SupportTicket) => (
        <span style={{ color: '#F5F5F5', fontWeight: 600 }}>
          {item.atelierName || item.atelierId}
        </span>
      ),
    },
    {
      key: 'subject',
      header: 'Sujet',
      render: (item: SupportTicket) => (
        <span style={{ color: '#F5F5F5', fontWeight: 500 }}>{item.subject}</span>
      ),
    },
    {
      key: 'priority',
      header: 'Priorité',
      render: (item: SupportTicket) => getPriorityBadge(item.priority),
    },
    {
      key: 'status',
      header: 'Statut',
      render: (item: SupportTicket) => <StatusBadge status={item.status} />,
    },
    {
      key: 'createdAt',
      header: 'Date',
      render: (item: SupportTicket) => (
        <span style={{ color: '#8B8B94', fontSize: 12 }}>
          {new Date(item.createdAt).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: SupportTicket) => (
        <div style={{ display: 'flex', gap: 6 }}>
          {item.status !== 'resolved' && (
            <button
              disabled={updatingId === item.id}
              onClick={() => handleUpdateStatus(item.id, 'resolved')}
              style={{
                background: 'rgba(16,185,129,0.1)',
                border: '1px solid rgba(16,185,129,0.3)',
                color: '#10B981',
                padding: '4px 10px',
                borderRadius: 6,
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Résoudre
            </button>
          )}
          {item.status !== 'closed' && (
            <button
              disabled={updatingId === item.id}
              onClick={() => handleUpdateStatus(item.id, 'closed')}
              style={{
                background: 'rgba(139,139,148,0.1)',
                border: '1px solid rgba(139,139,148,0.3)',
                color: '#8B8B94',
                padding: '4px 10px',
                borderRadius: 6,
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Fermer
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px', background: '#0B0B0D', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ color: '#F5F5F5', fontSize: 24, fontWeight: 800, margin: 0 }}>
            Support & Incidents
          </h1>
          <p style={{ color: '#8B8B94', fontSize: 13, marginTop: 4, margin: 0 }}>
            Gestion des demandes d'assistance technique et tickets des ateliers clients.
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

      {/* Support Mode Notice */}
      <div style={{
        background: '#121216',
        border: '1px solid #24242A',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Key size={20} color="#D4AF37" />
          <div>
            <div style={{ color: '#F5F5F5', fontSize: 14, fontWeight: 700 }}>
              Mode Assistance à Distance (Impersonation Support)
            </div>
            <div style={{ color: '#8B8B94', fontSize: 12, marginTop: 2 }}>
              Nécessite la permission explicite de l'atelier. Toutes les actions seront enregistrées dans l'Audit Log.
            </div>
          </div>
        </div>
        <button
          onClick={() => alert('Le Mode Support nécessite une demande de session auprès de l\'atelier client. Une fois validé, une bannière dorée de sécurité s\'affichera.')}
          style={{
            background: 'rgba(212,175,55,0.1)',
            border: '1px solid #D4AF37',
            color: '#D4AF37',
            padding: '8px 14px',
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Demander Accès Support
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div style={{ background: '#121216', border: '1px solid #24242A', borderRadius: 12, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#3B82F6', marginBottom: 8 }}>
            <HelpCircle size={20} />
            <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: '#8B8B94' }}>
              Tickets Ouverts
            </span>
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#3B82F6' }}>
            {openCount}
          </div>
        </div>

        <div style={{ background: '#121216', border: '1px solid #24242A', borderRadius: 12, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#F59E0B', marginBottom: 8 }}>
            <Clock size={20} />
            <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: '#8B8B94' }}>
              En Attente
            </span>
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#F59E0B' }}>
            {pendingCount}
          </div>
        </div>

        <div style={{ background: '#121216', border: '1px solid #24242A', borderRadius: 12, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#10B981', marginBottom: 8 }}>
            <CheckCircle size={20} />
            <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: '#8B8B94' }}>
              Résolus
            </span>
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#10B981' }}>
            {resolvedCount}
          </div>
        </div>

        <div style={{ background: '#121216', border: '1px solid #24242A', borderRadius: 12, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#EF4444', marginBottom: 8 }}>
            <AlertCircle size={20} />
            <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: '#8B8B94' }}>
              Priorité Haute / Critique
            </span>
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#EF4444' }}>
            {highPriorityCount}
          </div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {['', 'open', 'pending', 'resolved', 'closed'].map((status) => (
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
            {status === '' ? 'Tous les tickets' : status}
          </button>
        ))}
      </div>

      {/* Table */}
      {error ? (
        <ErrorState message={error} onRetry={loadData} />
      ) : (
        <DataTable
          columns={columns}
          data={tickets}
          loading={loading}
          totalItems={total}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
};
