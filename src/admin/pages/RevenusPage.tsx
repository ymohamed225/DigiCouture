import React, { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../services/adminApi';
import { ErrorState } from '../components/ui/EmptyState';
import { RefreshCw, TrendingUp, DollarSign, Globe, Award, Building2 } from 'lucide-react';

export const RevenusPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminApi.getRevenue();
      if (res.success) {
        setData(res);
      }
    } catch (err: any) {
      setError(err.message || 'Impossible de charger les statistiques de revenus.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div style={{ color: '#8B8B94', padding: '40px 0', textAlign: 'center' }}>
        Chargement des analyses financières...
      </div>
    );
  }

  if (error || !data) {
    return <ErrorState message={error || 'Une erreur est survenue.'} onRetry={load} />;
  }

  const { summary, ateliersRevenue, plansRevenue, countriesRevenue, monthlyTrend } = data;

  // Simple SVG Chart generator
  const maxTrend = Math.max(...(monthlyTrend || []).map((t: any) => Number(t.total) || 0), 1);
  const renderTrendChart = () => {
    if (!monthlyTrend || !monthlyTrend.length) return <p style={{ color: '#8B8B94' }}>Aucun historique disponible</p>;
    const height = 120;
    const width = 500;
    const padding = 20;

    const points = monthlyTrend.map((t: any, i: number) => {
      const divisor = Math.max(1, monthlyTrend.length - 1);
      const x = monthlyTrend.length === 1
        ? width / 2
        : padding + (i / divisor) * (width - padding * 2);
      const val = Number(t.total) || 0;
      const y = height - padding - (val / maxTrend) * (height - padding * 2);
      return `${isNaN(x) ? padding : x},${isNaN(y) ? height / 2 : y}`;
    });

    const pathD = monthlyTrend.length === 1
      ? `M ${padding},${points[0].split(',')[1]} L ${width - padding},${points[0].split(',')[1]}`
      : `M ${points[0]} L ${points.join(' L ')}`;

    return (
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto' }}>
        <path
          d={pathD}
          fill="none"
          stroke="#D4AF37"
          strokeWidth={3}
        />
        {points.map((pt: string, idx: number) => {
          const [x, y] = pt.split(',');
          return (
            <g key={idx}>
              <circle cx={x} cy={y} r={4} fill="#0d0d12" stroke="#D4AF37" strokeWidth={2} />
              <text x={x} y={Math.max(12, parseFloat(y) - 8)} fill="#8B8B94" fontSize={8} textAnchor="middle">
                {Number(monthlyTrend[idx]?.total || 0).toLocaleString('fr-FR')}
              </text>
              <text x={x} y={height - 2} fill="#4a4a56" fontSize={8} textAnchor="middle">
                {monthlyTrend[idx]?.month || ''}
              </text>
            </g>
          );
        })}
      </svg>
    );
  };

  return (
    <div>
      <div style={styles.header}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#F5F5F5', margin: 0 }}>Revenus SaaS</h1>
          <p style={{ fontSize: 13, color: '#8B8B94', marginTop: 4 }}>
            Rapports et analyses financières de DigiCouture VIP
          </p>
        </div>
        <button onClick={load} style={styles.refreshBtn}>
          <RefreshCw size={14} />
          Rafraîchir
        </button>
      </div>

      {/* KPI Cards */}
      <div style={styles.kpiGrid}>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.cardLabel}>Chiffre d'Affaires total</span>
            <DollarSign size={16} color="#D4AF37" />
          </div>
          <div style={styles.cardVal}>
            {Number(summary.totalRevenue).toLocaleString('fr-FR')} <span style={styles.currency}>FCFA</span>
          </div>
        </div>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.cardLabel}>MRR (Mensuel récurrent)</span>
            <TrendingUp size={16} color="#22C55E" />
          </div>
          <div style={styles.cardVal}>
            {Number(summary.mrr).toLocaleString('fr-FR')} <span style={styles.currency}>FCFA</span>
          </div>
        </div>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.cardLabel}>ARR (Annuel récurrent)</span>
            <TrendingUp size={16} color="#818CF8" />
          </div>
          <div style={styles.cardVal}>
            {Number(summary.arr).toLocaleString('fr-FR')} <span style={styles.currency}>FCFA</span>
          </div>
        </div>
      </div>

      {/* Monthly Trend Chart */}
      <div style={{ ...styles.card, marginBottom: 24 }}>
        <h3 style={styles.sectionTitle}>Tendance mensuelle des encaissements</h3>
        <div style={{ marginTop: 20 }}>{renderTrendChart()}</div>
      </div>

      <div style={styles.grid2}>
        {/* CA par pays */}
        <div style={styles.card}>
          <div style={styles.sectionHeader}>
            <Globe size={16} color="#818CF8" />
            <h3 style={{ margin: 0, fontSize: 13, color: '#F5F5F5' }}>CA par Pays</h3>
          </div>
          <div style={styles.list}>
            {countriesRevenue.map((cr: any) => (
              <div key={cr.country} style={styles.row}>
                <span style={{ color: '#8B8B94' }}>{cr.country || 'Côte d\'Ivoire'}</span>
                <span style={{ fontWeight: 600, color: '#F5F5F5' }}>
                  {Number(cr.total).toLocaleString('fr-FR')} FCFA
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* CA par plans */}
        <div style={styles.card}>
          <div style={styles.sectionHeader}>
            <Award size={16} color="#D4AF37" />
            <h3 style={{ margin: 0, fontSize: 13, color: '#F5F5F5' }}>CA par formules</h3>
          </div>
          <div style={styles.list}>
            {plansRevenue.map((pr: any) => (
              <div key={pr.planName} style={styles.row}>
                <span style={{ color: '#8B8B94' }}>{pr.planName}</span>
                <span style={{ fontWeight: 600, color: '#F5F5F5' }}>
                  {Number(pr.total).toLocaleString('fr-FR')} FCFA
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* CA par ateliers */}
        <div style={{ ...styles.card, gridColumn: 'span 2' }}>
          <div style={styles.sectionHeader}>
            <Building2 size={16} color="#F59E0B" />
            <h3 style={{ margin: 0, fontSize: 13, color: '#F5F5F5' }}>Top 10 Ateliers les plus performants</h3>
          </div>
          <div style={styles.list}>
            {ateliersRevenue.map((ar: any) => (
              <div key={ar.atelierName} style={styles.row}>
                <span style={{ color: '#F5F5F5', fontWeight: 600 }}>{ar.atelierName}</span>
                <span style={{ fontWeight: 700, color: '#D4AF37' }}>
                  {Number(ar.total).toLocaleString('fr-FR')} FCFA
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
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
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: 16,
    marginBottom: 24,
  },
  card: {
    background: '#121216',
    border: '1px solid #24242A',
    borderRadius: 14,
    padding: 20,
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardLabel: {
    fontSize: 11,
    color: '#8B8B94',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
  },
  cardVal: {
    fontSize: 24,
    fontWeight: 800,
    color: '#F5F5F5',
  },
  currency: {
    fontSize: 14,
    color: '#8B8B94',
  },
  sectionTitle: {
    margin: 0,
    fontSize: 12,
    color: '#8B8B94',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
  },
  grid2: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 20,
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    borderBottom: '1px solid #24242A',
    paddingBottom: 12,
    marginBottom: 14,
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 13,
  },
};
