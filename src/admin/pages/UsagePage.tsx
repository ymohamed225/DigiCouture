import React, { useState, useEffect, useCallback } from 'react';
import { DataTable } from '../components/ui/DataTable';
import { ErrorState } from '../components/ui/EmptyState';
import { adminApi } from '../services/adminApi';
import { RefreshCw, HardDrive, Users, Activity, Bell, ShieldCheck } from 'lucide-react';

export const UsagePage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [globalStats, setGlobalStats] = useState<any>({});
  const [byAtelier, setByAtelier] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminApi.getUsage({ limit: itemsPerPage, offset: (currentPage - 1) * itemsPerPage });
      setGlobalStats(res.global || {});
      setByAtelier(res.byAtelier || []);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des métriques d\'usage');
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const columns = [
    {
      key: 'name',
      header: 'Atelier',
      render: (item: any) => (
        <span style={{ color: '#F5F5F5', fontWeight: 600 }}>{item.name}</span>
      ),
    },
    {
      key: 'activeUsers',
      header: 'Utilisateurs',
      render: (item: any) => (
        <span style={{ color: '#8B8B94' }}>{item.activeUsers || 0} utilisateurs</span>
      ),
    },
    {
      key: 'storageUsedMb',
      header: 'Stockage',
      render: (item: any) => (
        <span style={{ color: '#8B8B94' }}>{item.storageUsedMb || 0} Mo</span>
      ),
    },
    {
      key: 'apiCallsCount',
      header: 'Requetes API',
      render: (item: any) => (
        <span style={{ color: '#8B8B94' }}>{(item.apiCallsCount || 0).toLocaleString('fr-FR')} req</span>
      ),
    },
    {
      key: 'notificationsSent',
      header: 'Notifications envoyees',
      render: (item: any) => (
        <span style={{ color: '#8B8B94' }}>{(item.notificationsSent || 0).toLocaleString('fr-FR')}</span>
      ),
    },
    {
      key: 'lastActivity',
      header: 'Derniere activite',
      render: (item: any) => (
        <span style={{ color: '#4a4a56', fontSize: 12 }}>
          {item.lastActivity ? new Date(item.lastActivity).toLocaleDateString('fr-FR') : 'Récente'}
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
            Usage Technique & Volumétrie
          </h1>
          <p style={{ color: '#8B8B94', fontSize: 13, marginTop: 4, margin: 0 }}>
            Supervision des ressources système consommées par la plateforme DigiCouture VIP.
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

      {/* Security notice banner */}
      <div style={{
        background: 'rgba(212,175,55,0.06)',
        border: '1px solid rgba(212,175,55,0.2)',
        borderRadius: 10,
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        marginBottom: 24,
      }}>
        <ShieldCheck size={20} color="#D4AF37" />
        <span style={{ color: '#D4AF37', fontSize: 13, fontWeight: 500 }}>
          <strong>Règle de confidentialité :</strong> Les données affichées ici sont exclusivement des compteurs techniques et des volumes agrégés. Le contenu métier des ateliers (clients, mensurations, modèles) reste totalement confidentiel et inaccessible.
        </span>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div style={{ background: '#121216', border: '1px solid #24242A', borderRadius: 12, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#3B82F6', marginBottom: 8 }}>
            <Users size={20} />
            <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: '#8B8B94' }}>
              Utilisateurs Plateforme
            </span>
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#F5F5F5' }}>
            {globalStats.totalUsers || 0}
          </div>
        </div>

        <div style={{ background: '#121216', border: '1px solid #24242A', borderRadius: 12, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#10B981', marginBottom: 8 }}>
            <HardDrive size={20} />
            <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: '#8B8B94' }}>
              Stockage Utilisé
            </span>
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#F5F5F5' }}>
            {globalStats.totalStorageMb || 0} Mo
          </div>
        </div>

        <div style={{ background: '#121216', border: '1px solid #24242A', borderRadius: 12, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#F59E0B', marginBottom: 8 }}>
            <Activity size={20} />
            <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: '#8B8B94' }}>
              Appels API
            </span>
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#F5F5F5' }}>
            {(globalStats.totalApiCalls || 0).toLocaleString('fr-FR')}
          </div>
        </div>

        <div style={{ background: '#121216', border: '1px solid #24242A', borderRadius: 12, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#EC4899', marginBottom: 8 }}>
            <Bell size={20} />
            <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: '#8B8B94' }}>
              Notifications Envoyées
            </span>
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#F5F5F5' }}>
            {(globalStats.totalNotifications || 0).toLocaleString('fr-FR')}
          </div>
        </div>
      </div>

      {/* Table */}
      {error ? (
        <ErrorState message={error} onRetry={loadData} />
      ) : (
        <DataTable
          columns={columns}
          data={byAtelier}
          loading={loading}
          totalItems={byAtelier.length}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
};
