import React from 'react';

type StatusType =
  | 'active' | 'inactive' | 'suspended' | 'pending' | 'expired'
  | 'completed' | 'failed' | 'processing' | 'refunded'
  | 'FREE' | 'STARTER' | 'PRO' | 'VIP' | 'ENTERPRISE'
  | string;

interface StatusBadgeProps {
  status: StatusType;
  size?: 'sm' | 'md';
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string; dot: string }> = {
  // Atelier/User status
  active:     { label: 'Actif',       bg: 'rgba(34,197,94,0.12)',  color: '#22C55E', dot: '#22C55E' },
  inactive:   { label: 'Inactif',     bg: 'rgba(139,139,148,0.12)', color: '#8B8B94', dot: '#8B8B94' },
  suspended:  { label: 'Suspendu',    bg: 'rgba(239,68,68,0.12)',  color: '#EF4444', dot: '#EF4444' },
  pending:    { label: 'En attente',  bg: 'rgba(245,158,11,0.12)', color: '#F59E0B', dot: '#F59E0B' },
  expired:    { label: 'Expiré',      bg: 'rgba(239,68,68,0.08)',  color: '#EF4444', dot: '#EF4444' },
  // Payment status
  completed:  { label: 'Complété',    bg: 'rgba(34,197,94,0.12)',  color: '#22C55E', dot: '#22C55E' },
  PAID:       { label: 'Payé (Wave)', bg: 'rgba(34,197,94,0.14)',  color: '#10B981', dot: '#10B981' },
  paid:       { label: 'Payé (Wave)', bg: 'rgba(34,197,94,0.14)',  color: '#10B981', dot: '#10B981' },
  failed:     { label: 'Échoué',      bg: 'rgba(239,68,68,0.12)',  color: '#EF4444', dot: '#EF4444' },
  processing: { label: 'En cours',    bg: 'rgba(99,102,241,0.12)', color: '#818CF8', dot: '#818CF8' },
  refunded:   { label: 'Remboursé',   bg: 'rgba(245,158,11,0.12)', color: '#F59E0B', dot: '#F59E0B' },
  // Subscription plans
  FREE:       { label: 'Gratuit',     bg: 'rgba(139,139,148,0.12)', color: '#8B8B94', dot: '#8B8B94' },
  STARTER:    { label: 'Starter',     bg: 'rgba(99,102,241,0.12)', color: '#818CF8', dot: '#818CF8' },
  PRO:        { label: 'Pro',         bg: 'rgba(212,175,55,0.12)', color: '#D4AF37', dot: '#D4AF37' },
  ATELIER:    { label: 'Atelier',     bg: 'rgba(16,185,129,0.14)', color: '#10B981', dot: '#10B981' },
  VIP:        { label: 'VIP',         bg: 'rgba(212,175,55,0.18)', color: '#E8C96A', dot: '#E8C96A' },
  ENTERPRISE: { label: 'Enterprise',  bg: 'rgba(34,197,94,0.12)',  color: '#22C55E', dot: '#22C55E' },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG[status?.toLowerCase()] || {
    label: status,
    bg: 'rgba(139,139,148,0.12)',
    color: '#8B8B94',
    dot: '#8B8B94',
  };

  const isSmall = size === 'sm';

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: isSmall ? 4 : 5,
      background: cfg.bg,
      color: cfg.color,
      borderRadius: 100,
      padding: isSmall ? '2px 8px' : '4px 10px',
      fontSize: isSmall ? 10 : 11,
      fontWeight: 600,
      letterSpacing: '0.3px',
      whiteSpace: 'nowrap',
    }}>
      <span style={{
        width: isSmall ? 5 : 6,
        height: isSmall ? 5 : 6,
        borderRadius: '50%',
        background: cfg.dot,
        flexShrink: 0,
      }} />
      {cfg.label}
    </span>
  );
};
