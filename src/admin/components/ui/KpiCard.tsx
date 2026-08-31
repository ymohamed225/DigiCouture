import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KpiCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  change?: number; // % variation (positive = hausse, negative = baisse)
  changeLabel?: string;
  suffix?: string;
  loading?: boolean;
  accentColor?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  label,
  value,
  icon,
  change,
  changeLabel,
  suffix = '',
  loading = false,
  accentColor = '#D4AF37',
}) => {
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;
  const isNeutral = change !== undefined && change === 0;

  if (loading) {
    return (
      <div style={styles.card}>
        <div style={styles.skeletonIcon} />
        <div style={{ ...styles.skeletonLine, width: '60%', marginTop: 16 }} />
        <div style={{ ...styles.skeletonLine, width: '40%', height: 32, marginTop: 8 }} />
        <div style={{ ...styles.skeletonLine, width: '50%', marginTop: 12 }} />
      </div>
    );
  }

  return (
    <div style={styles.card} className="kpi-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={styles.label}>{label}</span>
        <div style={{ ...styles.iconBox, background: `${accentColor}18`, color: accentColor }}>
          {icon}
        </div>
      </div>
      <div style={styles.value}>
        {typeof value === 'number' ? value.toLocaleString('fr-FR') : value}
        {suffix && <span style={styles.suffix}>{suffix}</span>}
      </div>
      {change !== undefined && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 3,
            color: isPositive ? '#22C55E' : isNegative ? '#EF4444' : '#8B8B94',
            fontSize: 12, fontWeight: 600,
          }}>
            {isPositive && <TrendingUp size={13} />}
            {isNegative && <TrendingDown size={13} />}
            {isNeutral && <Minus size={13} />}
            {change > 0 ? '+' : ''}{change.toFixed(1)}%
          </div>
          {changeLabel && (
            <span style={{ fontSize: 11, color: '#8B8B94' }}>{changeLabel}</span>
          )}
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  card: {
    background: 'var(--admin-card-bg, #FFFFFF)',
    border: '1px solid var(--admin-card-border, #E2E8F0)',
    borderRadius: 14,
    padding: '20px 22px',
    boxShadow: 'var(--admin-card-shadow, 0 4px 20px rgba(0, 0, 0, 0.03))',
    transition: 'border-color 0.2s, box-shadow 0.2s, background 0.2s',
    cursor: 'default',
  },
  label: {
    fontSize: 11,
    fontWeight: 700,
    color: 'var(--admin-text-sub, #64748B)',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  value: {
    fontSize: 28,
    fontWeight: 800,
    color: 'var(--admin-text-main, #0F172A)',
    marginTop: 12,
    lineHeight: 1.1,
    fontVariantNumeric: 'tabular-nums',
  },
  suffix: {
    fontSize: 14,
    fontWeight: 500,
    color: 'var(--admin-text-sub, #64748B)',
    marginLeft: 4,
  },
  skeletonIcon: {
    width: 38, height: 38, borderRadius: 10,
    background: 'linear-gradient(90deg, #1e1e24 25%, #2a2a32 50%, #1e1e24 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.4s infinite',
    alignSelf: 'flex-end',
  },
  skeletonLine: {
    height: 14, borderRadius: 6,
    background: 'linear-gradient(90deg, #1e1e24 25%, #2a2a32 50%, #1e1e24 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.4s infinite',
  },
};
