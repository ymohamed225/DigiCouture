import React, { useState, useEffect, useCallback } from 'react';
import { DataTable } from '../components/ui/DataTable';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { ErrorState } from '../components/ui/EmptyState';
import { adminApi } from '../services/adminApi';
import { Key, ShieldAlert, ShieldCheck, RefreshCw } from 'lucide-react';

export const UsersPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Confirm states
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: 'suspend' | 'reactivate' | 'reset-password';
    userId: string;
    userName: string;
  }>({
    isOpen: false,
    type: 'suspend',
    userId: '',
    userName: '',
  });

  const [actionLoading, setActionLoading] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminApi.getUsers({
        limit: itemsPerPage,
        offset: (currentPage - 1) * itemsPerPage,
      });
      if (res.success) {
        setData(res.data);
        setTotal(res.total);
      }
    } catch (err: any) {
      setError(err.message || 'Impossible de charger les utilisateurs.');
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    load();
  }, [load]);

  const handleAction = async () => {
    setActionLoading(true);
    try {
      const { type, userId } = confirmDialog;
      if (type === 'suspend') {
        await adminApi.suspendUser(userId);
      } else if (type === 'reactivate') {
        await adminApi.reactivateUser(userId);
      } else {
        const res = await adminApi.resetUserPassword(userId);
        alert(res.message || 'Mot de passe réinitialisé.');
      }
      setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      load();
    } catch (err: any) {
      alert(err.message || 'Une erreur est survenue.');
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    {
      key: 'fullName',
      header: 'Utilisateur',
      render: (item: any) => (
        <div>
          <div style={{ fontWeight: 700, color: '#F5F5F5' }}>{item.fullName}</div>
          <div style={{ fontSize: 11, color: '#8B8B94', marginTop: 2 }}>ID: {item.id}</div>
        </div>
      ),
    },
    { key: 'atelierName', header: 'Atelier' },
    {
      key: 'roleName',
      header: 'Rôle',
      render: (item: any) => (
        <span style={{ fontWeight: 600, color: '#D4AF37' }}>
          {item.roleName || item.roleId || 'TAILOR'}
        </span>
      ),
    },
    { key: 'phone', header: 'Téléphone' },
    { key: 'email', header: 'Email', render: (item: any) => item.email || '—' },
    {
      key: 'createdAt',
      header: 'Créé le',
      render: (item: any) => (
        <span>{item.createdAt ? new Date(item.createdAt).toLocaleDateString('fr-FR') : '—'}</span>
      ),
    },
  ];

  const actions = (item: any) => {
    // Si u.passwordHash commence par SUSPENDED_, il est suspendu
    const isSuspended = item.passwordHash?.startsWith('SUSPENDED_') || false;

    return (
      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
        <button
          onClick={() => setConfirmDialog({
            isOpen: true,
            type: 'reset-password',
            userId: item.id,
            userName: item.fullName,
          })}
          title="Réinitialiser le mot de passe"
          style={styles.actionBtn}
        >
          <Key size={13} />
        </button>
        {isSuspended ? (
          <button
            onClick={() => setConfirmDialog({
              isOpen: true,
              type: 'reactivate',
              userId: item.id,
              userName: item.fullName,
            })}
            title="Activer le compte"
            style={{ ...styles.actionBtn, borderColor: 'rgba(34,197,94,0.2)', color: '#22C55E' }}
          >
            <ShieldCheck size={13} />
          </button>
        ) : (
          <button
            onClick={() => setConfirmDialog({
              isOpen: true,
              type: 'suspend',
              userId: item.id,
              userName: item.fullName,
            })}
            title="Suspendre le compte"
            style={{ ...styles.actionBtn, borderColor: 'rgba(239,68,68,0.2)', color: '#EF4444' }}
          >
            <ShieldAlert size={13} />
          </button>
        )}
      </div>
    );
  };

  if (error) {
    return <ErrorState message={error} onRetry={load} />;
  }

  return (
    <div>
      <div style={styles.header}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#F5F5F5', margin: 0 }}>Utilisateurs</h1>
          <p style={{ fontSize: 13, color: '#8B8B94', marginTop: 4 }}>
            Gestion de tous les collaborateurs et administrateurs enregistrés
          </p>
        </div>
        <button onClick={load} style={styles.refreshBtn}>
          <RefreshCw size={14} />
          Rafraîchir
        </button>
      </div>

      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        totalItems={total}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        actions={actions}
      />

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={handleAction}
        title={
          confirmDialog.type === 'suspend'
            ? 'Suspendre l\'utilisateur ?'
            : confirmDialog.type === 'reactivate'
            ? 'Activer l\'utilisateur ?'
            : 'Réinitialiser le mot de passe ?'
        }
        description={
          confirmDialog.type === 'suspend'
            ? `Êtes-vous sûr de vouloir suspendre l'utilisateur "${confirmDialog.userName}" ? Il ne pourra plus s'authentifier.`
            : confirmDialog.type === 'reactivate'
            ? `Voulez-vous réactiver le compte de "${confirmDialog.userName}" ?`
            : `Voulez-vous réinitialiser le mot de passe de "${confirmDialog.userName}" ? Un mot de passe par défaut lui sera assigné.`
        }
        confirmLabel={
          confirmDialog.type === 'suspend'
            ? 'Suspendre'
            : confirmDialog.type === 'reactivate'
            ? 'Activer'
            : 'Réinitialiser'
        }
        confirmVariant={confirmDialog.type === 'suspend' ? 'danger' : 'primary'}
        loading={actionLoading}
      />
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
};
