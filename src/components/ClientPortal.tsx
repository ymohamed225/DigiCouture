import React from 'react';
import type { Order, AtelierProfile } from '../types';
import { productionSteps } from './ProductionTracker';
import { Scissors } from 'lucide-react';

interface ClientPortalProps {
  order: Order;
  atelier: AtelierProfile;
  onBack: () => void;
  onUpdateStatus?: (orderId: string, status: Order['status']) => void;
}

export const ClientPortal: React.FC<ClientPortalProps> = ({
  order,
  atelier,
  onBack,
  onUpdateStatus
}) => {

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg-secondary)',
      padding: '1.5rem 1rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '520px',
        backgroundColor: 'var(--bg-primary)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--border-color)',
        overflow: 'hidden',
        animation: 'fadeIn 0.3s ease-out'
      }}>
        {/* Header suivi */}
        <div style={{
          background: 'var(--bg-dark)',
          color: '#FFFFFF',
          padding: '1.5rem',
          textAlign: 'center',
          position: 'relative'
        }}>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--gold-primary)', fontWeight: 700 }}>
            {atelier.name} — PORTAIL SUIVI CLIENT
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: '0.25rem' }}>
            Commande #{order.code}
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#9CA3AF', marginTop: '2px' }}>
            Bienvenue {order.clientName} 👋
          </p>
        </div>

        {/* Aperçu Modèle */}
        <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {order.modelImageUrl && (
            <img src={order.modelImageUrl} alt={order.modelName} style={{ width: '70px', height: '70px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }} />
          )}
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
              {order.modelName}
            </h3>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Type : {order.garmentType} {order.fabricName && `• (${order.fabricName})`}
            </div>
            <div style={{ textAlign: 'center', marginTop: '1rem', color: '#D4AF37', fontSize: '0.8rem', fontWeight: 600 }}>
              Atelier : {atelier.name} • {atelier.whatsapp}
            </div>
          </div>
        </div>

        {/* Timeline verticale de progression */}
        <div style={{ padding: '1.5rem 1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Scissors size={24} color="var(--gold-primary)" />
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{atelier.name}</h2>
            </div>
            <button onClick={onBack} className="btn btn-secondary" style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}>
              ← Retour
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', position: 'relative', paddingLeft: '0.5rem' }}>
            {productionSteps.map((step, idx) => {
              const currentStepIdx = productionSteps.findIndex(s => s.status === order.status);
              const isPassed = idx <= currentStepIdx;
              const isCurrent = idx === currentStepIdx;

              return (
                <div 
                  key={step.status} 
                  onClick={() => {
                    if (onUpdateStatus) {
                      onUpdateStatus(order.id, step.status);
                    }
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '14px',
                    backgroundColor: isCurrent ? '#FFFDF5' : isPassed ? '#F0FDF4' : 'transparent',
                    border: isCurrent ? '2px solid #D4AF37' : isPassed ? '1px solid #86EFAC' : '1px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {/* Point visuel */}
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: isCurrent ? 'var(--gold-primary)' : isPassed ? '#059669' : 'var(--bg-tertiary)',
                    color: isCurrent || isPassed ? '#FFFFFF' : 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.95rem',
                    fontWeight: 800,
                    zIndex: 2,
                    boxShadow: isCurrent ? 'var(--gold-glow)' : 'none',
                    flexShrink: 0
                  }}>
                    {isPassed ? '✓' : idx + 1}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: isCurrent ? 900 : isPassed ? 700 : 600, fontSize: '0.98rem', color: isCurrent ? 'var(--gold-dark)' : 'var(--text-main)' }}>
                      {step.icon} {step.label}
                    </div>
                    {isCurrent && (
                      <div style={{ fontSize: '0.78rem', color: 'var(--gold-dark)', fontWeight: 700 }}>En cours dans l'atelier</div>
                    )}
                  </div>

                  {isCurrent && (
                    <span style={{ fontSize: '0.72rem', backgroundColor: '#D4AF37', color: '#FFFFFF', padding: '0.2rem 0.55rem', borderRadius: '6px', fontWeight: 800 }}>
                      ACTIF ⏳
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Détails financiers */}
        <div style={{ padding: '1.25rem', backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-main)' }}>
            Récapitulatif Financier
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Montant total :</span>
              <strong>{order.totalAmount.toLocaleString()} FCFA</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669' }}>
              <span>Acompte versé :</span>
              <strong>- {order.depositAmount.toLocaleString()} FCFA</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#DC2626', fontWeight: 700, fontSize: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem' }}>
              <span>Reste à payer :</span>
              <span>{order.remainingAmount.toLocaleString()} FCFA</span>
            </div>
          </div>
        </div>

        {/* Section Suivi Client & Notifications WhatsApp (Sections 11 & 16 du Prompt) */}
        <div style={{ padding: '1.25rem', backgroundColor: '#FFFDF5', borderTop: '1.5px solid #D4AF37' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <div style={{ fontSize: '0.88rem', fontWeight: 900, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span>💬 Journal WhatsApp & Suivi Permanent</span>
            </div>
            <button
              onClick={async () => {
                const trackingUrl = `${window.location.origin}/tracking/${order.code}/${order.tracking_token || 'tok-' + order.id}`;
                await navigator.clipboard.writeText(trackingUrl);
                alert(`Lien permanent copié dans le presse-papier :\n${trackingUrl}`);
              }}
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #D4AF37',
                color: '#B8922E',
                fontSize: '0.75rem',
                fontWeight: 800,
                padding: '4px 10px',
                borderRadius: 8,
                cursor: 'pointer'
              }}
            >
              📋 Copier Lien de Suivi
            </button>
          </div>

          <div style={{ fontSize: '0.78rem', color: '#64748B', marginBottom: '1rem' }}>
            Token permanent : <strong style={{ color: '#0F172A' }}>{order.tracking_token || `tok-${order.id}`}</strong>
          </div>

          {/* Boutons d'envoi WhatsApp de secours */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            <button
              onClick={async () => {
                try {
                  const res = await fetch(`/api/orders/${order.id}/notifications-resend`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ event: order.status })
                  });
                  const data = await res.json();
                  alert(data.message || 'Notification WhatsApp transmise !');
                } catch (e) {
                  alert('Erreur lors de l\'envoi manuel WhatsApp.');
                }
              }}
              style={{
                backgroundColor: '#10B981',
                color: '#FFFFFF',
                border: 'none',
                padding: '0.45rem 0.85rem',
                borderRadius: 10,
                fontSize: '0.78rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              📲 Envoyer WhatsApp Actuel ({order.status})
            </button>
          </div>
        </div>

        {/* Footer Contact WhatsApp Direct sans paiement en ligne CinetPay (Section 18 du Prompt) */}
        <div style={{ padding: '1.25rem', textAlign: 'center', backgroundColor: 'var(--bg-primary)' }}>
          <a
            href={`https://wa.me/${atelier.whatsapp.replace(/[^0-9]/g, '')}?text=Bonjour, je vous contacte au sujet de la commande ${order.code}`}
            target="_blank"
            rel="noreferrer"
            className="btn btn-whatsapp"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            💬 Discuter avec l'atelier sur WhatsApp
          </a>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
            Propulsé par <strong>DigiCouture VIP</strong> — Solution d'Excellence pour Maisons de Couture
          </div>
        </div>
      </div>
    </div>
  );
};
