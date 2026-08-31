import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  confirmVariant?: 'danger' | 'warning' | 'primary';
  loading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirmer',
  confirmVariant = 'danger',
  loading = false,
}) => {
  if (!isOpen) return null;

  const variantColors = {
    danger:  { bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.3)',  color: '#EF4444' },
    warning: { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)', color: '#F59E0B' },
    primary: { bg: 'rgba(212,175,55,0.12)', border: 'rgba(212,175,55,0.3)', color: '#D4AF37' },
  };
  const vc = variantColors[confirmVariant];

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.75)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999,
      backdropFilter: 'blur(4px)',
    }} onClick={onClose}>
      <div style={{
        background: '#17171C',
        border: '1px solid #2e2e38',
        borderRadius: 16,
        padding: '28px 28px 24px',
        maxWidth: 420,
        width: '90%',
        boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
      }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: vc.bg, border: `1px solid ${vc.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: vc.color, flexShrink: 0,
            }}>
              <AlertTriangle size={20} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#F5F5F5' }}>{title}</div>
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: '#8B8B94',
            cursor: 'pointer', padding: 4, lineHeight: 0,
          }}>
            <X size={18} />
          </button>
        </div>

        <p style={{ fontSize: 13, color: '#8B8B94', lineHeight: 1.65, marginBottom: 24 }}>
          {description}
        </p>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onClose} disabled={loading} style={{
            padding: '9px 18px',
            background: '#1e1e26', border: '1px solid #2e2e38',
            borderRadius: 8, color: '#8B8B94',
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}>
            Annuler
          </button>
          <button onClick={onConfirm} disabled={loading} style={{
            padding: '9px 18px',
            background: vc.bg, border: `1px solid ${vc.border}`,
            borderRadius: 8, color: vc.color,
            fontSize: 13, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
          }}>
            {loading ? 'En cours…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
