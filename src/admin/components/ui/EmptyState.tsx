import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action }) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '64px 32px',
    textAlign: 'center',
    gap: 12,
  }}>
    <div style={{
      width: 56,
      height: 56,
      borderRadius: 16,
      background: 'rgba(212,175,55,0.08)',
      border: '1px solid rgba(212,175,55,0.15)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#D4AF37',
      fontSize: 24,
    }}>
      {icon || '📭'}
    </div>
    <div style={{ fontSize: 15, fontWeight: 700, color: '#F5F5F5', marginTop: 4 }}>{title}</div>
    {description && (
      <div style={{ fontSize: 13, color: '#8B8B94', maxWidth: 340, lineHeight: 1.6 }}>{description}</div>
    )}
    {action && (
      <button onClick={action.onClick} style={{
        marginTop: 12,
        padding: '8px 18px',
        background: 'rgba(212,175,55,0.12)',
        border: '1px solid rgba(212,175,55,0.3)',
        borderRadius: 8,
        color: '#D4AF37',
        fontSize: 13,
        fontWeight: 600,
        cursor: 'pointer',
      }}>
        {action.label}
      </button>
    )}
  </div>
);

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Erreur de chargement',
  message,
  onRetry,
}) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '64px 32px',
    textAlign: 'center',
    gap: 12,
  }}>
    <div style={{
      width: 56,
      height: 56,
      borderRadius: 16,
      background: 'rgba(239,68,68,0.08)',
      border: '1px solid rgba(239,68,68,0.2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#EF4444',
    }}>
      <AlertTriangle size={24} />
    </div>
    <div style={{ fontSize: 15, fontWeight: 700, color: '#F5F5F5', marginTop: 4 }}>{title}</div>
    <div style={{ fontSize: 13, color: '#8B8B94', maxWidth: 360, lineHeight: 1.6 }}>{message}</div>
    {onRetry && (
      <button onClick={onRetry} style={{
        marginTop: 12,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '8px 18px',
        background: 'rgba(239,68,68,0.1)',
        border: '1px solid rgba(239,68,68,0.25)',
        borderRadius: 8,
        color: '#EF4444',
        fontSize: 13,
        fontWeight: 600,
        cursor: 'pointer',
      }}>
        <RefreshCw size={13} />
        Réessayer
      </button>
    )}
  </div>
);
