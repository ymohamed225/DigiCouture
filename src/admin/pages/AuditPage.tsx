import React, { useState, useEffect, useCallback } from 'react';
import { DataTable } from '../components/ui/DataTable';
import { ErrorState } from '../components/ui/EmptyState';
import { adminApi, type AuditLogEntry } from '../services/adminApi';
import { RefreshCw, ShieldAlert, Terminal, Eye } from 'lucide-react';

export const AuditPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AuditLogEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'errors' | 'webhooks'>('errors');
  const [activeLog, setActiveLog] = useState<AuditLogEntry | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = activeTab === 'errors'
        ? await adminApi.getErrors({ limit: 50 })
        : await adminApi.getAuditLogs({ limit: 50 });

      if (res.success) {
        setData(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'Impossible de charger le journal d\'audit.');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    load();
  }, [load]);

  const columns = [
    {
      key: 'action',
      header: 'Événement / Action',
      render: (item: AuditLogEntry) => (
        <span style={{ fontWeight: 700, color: item.action.includes('FAIL') || item.action.includes('ERROR') ? '#EF4444' : '#F5F5F5' }}>
          {item.action}
        </span>
      ),
    },
    { key: 'atelierId', header: 'Atelier', render: (item: AuditLogEntry) => item.atelierId || '—' },
    { key: 'userId', header: 'Utilisateur', render: (item: AuditLogEntry) => item.userId || '—' },
    {
      key: 'createdAt',
      header: 'Date & Heure',
      render: (item: AuditLogEntry) => (
        <span style={{ fontVariantNumeric: 'tabular-nums' }}>
          {item.createdAt ? new Date(item.createdAt).toLocaleString('fr-FR') : '—'}
        </span>
      ),
    },
  ];

  const actions = (item: AuditLogEntry) => (
    <button
      onClick={() => setActiveLog(item)}
      style={styles.actionBtn}
      title="Voir le payload d'erreur"
    >
      <Eye size={13} />
    </button>
  );

  if (error) {
    return <ErrorState message={error} onRetry={load} />;
  }

  return (
    <div>
      <div style={styles.header}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#F5F5F5', margin: 0 }}>Journal d'Audit</h1>
          <p style={{ fontSize: 13, color: '#8B8B94', marginTop: 4 }}>
            Traçabilité des opérations critiques, webhooks et anomalies système
          </p>
        </div>
        <button onClick={load} style={styles.refreshBtn}>
          <RefreshCw size={14} />
          Rafraîchir
        </button>
      </div>

      {/* Tabs */}
      <div style={styles.tabBar}>
        <button
          onClick={() => { setActiveTab('errors'); setData([]); }}
          style={{
            ...styles.tabBtn,
            color: activeTab === 'errors' ? '#D4AF37' : '#8B8B94',
            borderBottomColor: activeTab === 'errors' ? '#D4AF37' : 'transparent',
            fontWeight: activeTab === 'errors' ? 700 : 500,
          }}
        >
          <ShieldAlert size={14} />
          Erreurs API
        </button>
        <button
          onClick={() => { setActiveTab('webhooks'); setData([]); }}
          style={{
            ...styles.tabBtn,
            color: activeTab === 'webhooks' ? '#D4AF37' : '#8B8B94',
            borderBottomColor: activeTab === 'webhooks' ? '#D4AF37' : 'transparent',
            fontWeight: activeTab === 'webhooks' ? 700 : 500,
          }}
        >
          <Terminal size={14} />
          Logs Webhooks
        </button>
      </div>

      <div style={{ marginTop: 20 }}>
        <DataTable
          columns={columns}
          data={data}
          loading={loading}
          totalItems={data.length}
          itemsPerPage={15}
          actions={actions}
        />
      </div>

      {/* Inspector Modal */}
      {activeLog && (
        <div style={styles.modalOverlay} onClick={() => setActiveLog(null)}>
          <div style={styles.modalCard} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Terminal size={18} color="#D4AF37" />
              <h3 style={{ margin: 0, color: '#F5F5F5' }}>Inspecteur d'Audit</h3>
            </div>

            <div style={styles.metaBox}>
              <div style={styles.metaRow}>
                <span>Action :</span>
                <strong>{activeLog.action}</strong>
              </div>
              <div style={styles.metaRow}>
                <span>Horodatage :</span>
                <strong>{new Date(activeLog.createdAt).toLocaleString('fr-FR')}</strong>
              </div>
            </div>

            <h4 style={{ margin: '16px 0 8px', color: '#F5F5F5', fontSize: 12, textTransform: 'uppercase' }}>
              Détails de l'événement
            </h4>
            <pre style={styles.codeBlock}>
              {activeLog.details || 'Aucun détail JSON fourni.'}
            </pre>

            <button onClick={() => setActiveLog(null)} style={styles.closeBtn}>
              Fermer
            </button>
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
    maxWidth: 500,
    width: '90%',
  },
  metaBox: {
    background: '#0B0B0D',
    border: '1px solid #24242A',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  metaRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 12,
    color: '#8B8B94',
    padding: '4px 0',
  },
  codeBlock: {
    background: '#0B0B0D',
    border: '1px solid #24242A',
    borderRadius: 8,
    padding: 12,
    color: '#E8C96A',
    fontFamily: 'monospace',
    fontSize: 12,
    overflowX: 'auto',
    margin: 0,
    maxHeight: 200,
    overflowY: 'auto',
    whiteSpace: 'pre-wrap',
  },
  closeBtn: {
    width: '100%',
    padding: '10px 0',
    background: '#1e1e26',
    border: '1px solid #2e2e38',
    borderRadius: 8,
    color: '#8B8B94',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: 20,
  },
};
