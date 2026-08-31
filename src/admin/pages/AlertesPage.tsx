import React, { useState, useEffect, useCallback } from 'react';
import { adminApi, type AuditLogEntry } from '../services/adminApi';
import { KpiCard } from '../components/ui/KpiCard';
import { ErrorState } from '../components/ui/EmptyState';
import { 
  AlertTriangle, ShieldAlert, ShieldCheck, 
  RefreshCw, Search, Eye, Bell, Zap
} from 'lucide-react';

export const AlertesPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<AuditLogEntry[]>([]);
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'critical' | 'warning' | 'info' | 'resolved'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAlert, setSelectedAlert] = useState<AuditLogEntry | null>(null);
  const [resolvedIds, setResolvedIds] = useState<Set<string>>(new Set());

  const loadAlerts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [errorsRes, auditRes] = await Promise.all([
        adminApi.getErrors({ limit: 50 }).catch(() => ({ success: true, data: [] })),
        adminApi.getAuditLogs({ limit: 50 }).catch(() => ({ success: true, data: [] }))
      ]);

      const combined: AuditLogEntry[] = [
        ...(errorsRes.data || []),
        ...(auditRes.data || []).filter((a: any) => 
          a.action.includes('FAIL') || 
          a.action.includes('ERROR') || 
          a.action.includes('EXCEEDED') || 
          a.action.includes('SUSPEND') ||
          a.action.includes('WARNING')
        )
      ];

      // Tri par date récurrente décroissante
      combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setAlerts(combined);
    } catch (err: any) {
      setError(err.message || 'Impossible de charger la liste des alertes.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  const getSeverity = (action: string, id: string): 'critical' | 'warning' | 'info' | 'resolved' => {
    if (resolvedIds.has(id)) return 'resolved';
    if (action.includes('CRITICAL') || action.includes('ERROR') || action.includes('SUSPEND')) return 'critical';
    if (action.includes('FAIL') || action.includes('EXCEEDED') || action.includes('WARNING')) return 'warning';
    return 'info';
  };

  const handleMarkResolved = (id: string) => {
    setResolvedIds(prev => new Set(prev).add(id));
    if (selectedAlert?.id === id) {
      setSelectedAlert(null);
    }
  };

  // Filtrage réactif
  const filteredAlerts = alerts.filter(a => {
    const sev = getSeverity(a.action, a.id);
    if (filterSeverity !== 'all' && sev !== filterSeverity) return false;
    
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchAction = a.action.toLowerCase().includes(q);
      const matchDetails = (a.details || '').toLowerCase().includes(q);
      const matchAtelier = (a.atelierId || '').toLowerCase().includes(q);
      return matchAction || matchDetails || matchAtelier;
    }
    return true;
  });

  const criticalCount = alerts.filter(a => getSeverity(a.action, a.id) === 'critical').length;
  const warningCount = alerts.filter(a => getSeverity(a.action, a.id) === 'warning').length;
  const infoCount = alerts.filter(a => getSeverity(a.action, a.id) === 'info').length;
  const resolvedCount = resolvedIds.size;

  if (error) {
    return <ErrorState message={error} onRetry={loadAlerts} />;
  }

  return (
    <div style={{ padding: 24, background: '#0B0B0D', minHeight: '100vh', color: '#F5F5F5' }}>
      {/* Header Page */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldAlert size={20} color="#EF4444" />
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#F5F5F5', margin: 0 }}>
              Centre d'Alertes Platform & Sécurité
            </h1>
          </div>
          <p style={{ fontSize: 13, color: '#8B8B94', marginTop: 6, margin: 0 }}>
            Supervision centrale des erreurs système, incidents webhooks, dépassements de quotas et alertes de sécurité
          </p>
        </div>

        <button 
          onClick={loadAlerts}
          disabled={loading}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 16px', background: '#121216',
            border: '1px solid #24242A', borderRadius: 8,
            color: '#8B8B94', fontSize: 12, fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          Actualiser
        </button>
      </div>

      {/* 4 KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        <KpiCard 
          label="Total Alertes" 
          value={alerts.length} 
          icon={<Bell size={18} />} 
          accentColor="#D4AF37" 
        />
        <KpiCard 
          label="Critiques (Action Requise)" 
          value={criticalCount} 
          icon={<AlertTriangle size={18} />} 
          accentColor="#EF4444" 
        />
        <KpiCard 
          label="Avertissements Quotas/Paiements" 
          value={warningCount} 
          icon={<Zap size={18} />} 
          accentColor="#F59E0B" 
        />
        <KpiCard 
          label="Alertes Résolues" 
          value={resolvedCount} 
          icon={<ShieldCheck size={18} />} 
          accentColor="#10B981" 
        />
      </div>

      {/* Barre de Recherche et Filtres */}
      <div style={{ background: '#121216', border: '1px solid #24242A', borderRadius: 12, padding: 16, marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        {/* Filtres par Sévérité */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: `Toutes (${alerts.length})` },
            { id: 'critical', label: `🔴 Critiques (${criticalCount})` },
            { id: 'warning', label: `🟡 Avertissements (${warningCount})` },
            { id: 'info', label: `🔵 Info (${infoCount})` },
            { id: 'resolved', label: `🟢 Résolues (${resolvedCount})` }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterSeverity(f.id as any)}
              style={{
                padding: '6px 14px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 600,
                border: filterSeverity === f.id ? '1px solid #D4AF37' : '1px solid #24242A',
                background: filterSeverity === f.id ? 'rgba(212,175,55,0.12)' : '#0B0B0D',
                color: filterSeverity === f.id ? '#D4AF37' : '#8B8B94',
                cursor: 'pointer'
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Input de recherche */}
        <div style={{ position: 'relative', minWidth: 260 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#4a4a56' }} />
          <input 
            type="text"
            placeholder="Rechercher une alerte, un atelier..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
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

      {/* Tableau des Alertes */}
      <div style={{ background: '#121216', border: '1px solid #24242A', borderRadius: 12, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#8B8B94' }}>
            <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite', marginBottom: 8 }} />
            <div>Chargement des alertes en temps réel...</div>
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#8B8B94' }}>
            <ShieldCheck size={36} color="#10B981" style={{ marginBottom: 8 }} />
            <div style={{ fontSize: 14, fontWeight: 700, color: '#F5F5F5' }}>Aucune alerte détectée</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>Tous les systèmes et ateliers fonctionnent normalement.</div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #24242A', background: '#0B0B0D', color: '#8B8B94', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <th style={{ padding: '12px 16px' }}>Sévérité</th>
                <th style={{ padding: '12px 16px' }}>Type d'Alerte / Action</th>
                <th style={{ padding: '12px 16px' }}>Atelier / Source</th>
                <th style={{ padding: '12px 16px' }}>Détails</th>
                <th style={{ padding: '12px 16px' }}>Horodatage</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAlerts.map(alert => {
                const sev = getSeverity(alert.action, alert.id);
                return (
                  <tr key={alert.id} style={{ borderBottom: '1px solid #1E1E24', transition: 'background 0.15s' }}>
                    <td style={{ padding: '14px 16px' }}>
                      {sev === 'critical' && (
                        <span style={{ padding: '4px 10px', borderRadius: 12, fontSize: 11, fontWeight: 800, background: 'rgba(239,68,68,0.15)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)' }}>
                          🔴 CRITIQUE
                        </span>
                      )}
                      {sev === 'warning' && (
                        <span style={{ padding: '4px 10px', borderRadius: 12, fontSize: 11, fontWeight: 800, background: 'rgba(245,158,11,0.15)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.3)' }}>
                          🟡 AVERTISSEMENT
                        </span>
                      )}
                      {sev === 'info' && (
                        <span style={{ padding: '4px 10px', borderRadius: 12, fontSize: 11, fontWeight: 800, background: 'rgba(59,130,246,0.15)', color: '#3B82F6', border: '1px solid rgba(59,130,246,0.3)' }}>
                          🔵 INFO
                        </span>
                      )}
                      {sev === 'resolved' && (
                        <span style={{ padding: '4px 10px', borderRadius: 12, fontSize: 11, fontWeight: 800, background: 'rgba(16,185,129,0.15)', color: '#10B981', border: '1px solid rgba(16,185,129,0.3)' }}>
                          🟢 RÉSOLUE
                        </span>
                      )}
                    </td>

                    <td style={{ padding: '14px 16px', fontWeight: 700, color: '#F5F5F5' }}>
                      {alert.action}
                    </td>

                    <td style={{ padding: '14px 16px', color: '#D4AF37', fontWeight: 600 }}>
                      {alert.atelierId || 'Système Global'}
                    </td>

                    <td style={{ padding: '14px 16px', color: '#8B8B94', maxWidth: 280, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {alert.details || 'Aucun détail supplémentaire.'}
                    </td>

                    <td style={{ padding: '14px 16px', color: '#4a4a56', fontSize: 12 }}>
                      {new Date(alert.createdAt).toLocaleString('fr-FR')}
                    </td>

                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                        <button
                          onClick={() => setSelectedAlert(alert)}
                          style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: 6, color: '#D4AF37', padding: '5px 10px', fontSize: 11, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                        >
                          <Eye size={12} /> Inspecter
                        </button>
                        {sev !== 'resolved' && (
                          <button
                            onClick={() => handleMarkResolved(alert.id)}
                            style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 6, color: '#10B981', padding: '5px 10px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
                          >
                            ✓ Résoudre
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal d'Inspection Détaillée d'une Alerte */}
      {selectedAlert && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ width: '100%', maxWidth: 540, background: '#121216', border: '2px solid #D4AF37', borderRadius: 16, padding: 24, boxShadow: '0 20px 50px rgba(0,0,0,0.8)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #24242A', paddingBottom: 12, marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <ShieldAlert size={20} color="#D4AF37" />
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#F5F5F5' }}>Inspecter l'Alerte</h3>
              </div>
              <button onClick={() => setSelectedAlert(null)} style={{ background: 'none', border: 'none', color: '#8B8B94', fontSize: 16, cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13 }}>
              <div>
                <span style={{ color: '#8B8B94', fontSize: 11, textTransform: 'uppercase' }}>TYPE D'ACTION</span>
                <div style={{ fontWeight: 800, color: '#F5F5F5', marginTop: 2 }}>{selectedAlert.action}</div>
              </div>

              <div>
                <span style={{ color: '#8B8B94', fontSize: 11, textTransform: 'uppercase' }}>HORODATAGE</span>
                <div style={{ color: '#D4AF37', fontWeight: 700, marginTop: 2 }}>{new Date(selectedAlert.createdAt).toLocaleString('fr-FR')}</div>
              </div>

              <div>
                <span style={{ color: '#8B8B94', fontSize: 11, textTransform: 'uppercase' }}>ATELIER CONCERNÉ</span>
                <div style={{ color: '#F5F5F5', marginTop: 2 }}>{selectedAlert.atelierId || 'Système Plateforme Global'}</div>
              </div>

              <div>
                <span style={{ color: '#8B8B94', fontSize: 11, textTransform: 'uppercase' }}>DÉTAILS ET LOGS BRUTS</span>
                <div style={{ background: '#0B0B0D', border: '1px solid #24242A', borderRadius: 8, padding: 12, marginTop: 4, fontFamily: 'monospace', fontSize: 11, color: '#10B981', maxHeight: 180, overflowY: 'auto', whiteSpace: 'pre-wrap' }}>
                  {selectedAlert.details || 'Aucune donnée brute explicite.'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
              <button onClick={() => setSelectedAlert(null)} style={{ padding: '8px 16px', background: '#24242A', border: 'none', borderRadius: 8, color: '#8B8B94', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                Fermer
              </button>
              <button 
                onClick={() => handleMarkResolved(selectedAlert.id)}
                style={{ padding: '8px 16px', background: 'linear-gradient(135deg, #10B981, #059669)', border: 'none', borderRadius: 8, color: '#FFFFFF', fontSize: 12, fontWeight: 800, cursor: 'pointer' }}
              >
                ✓ Marquer comme Résolue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertesPage;
