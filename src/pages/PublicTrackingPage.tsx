import React, { useEffect, useState } from 'react';
import { CheckCircle2, Clock, MapPin, Phone, ShieldCheck, Sparkles } from 'lucide-react';

interface OrderTrackingData {
  code: string;
  clientName: string;
  modelName: string;
  fabricName: string;
  fabricColor: string;
  status: string;
  createdAt: string;
  deliveryDate: string;
  modelImageUrl?: string;
  atelierName: string;
  atelierPhone: string;
  atelierWhatsapp: string;
  atelierAddress: string;
  qrCodeUrl: string;
  trackingUrl: string;
}

interface StageItem {
  key: string;
  label: string;
}

interface HistoryItem {
  status: string;
  date: string;
  time?: string;
  comment?: string;
}

interface PublicTrackingPageProps {
  code?: string;
  token?: string;
}

export const PublicTrackingPage: React.FC<PublicTrackingPageProps> = ({ code: propCode, token: propToken }) => {
  const parts = window.location.pathname.split('/').filter(Boolean);
  const code = propCode || parts[1] || '';
  const token = propToken || parts[2] || '';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{
    mode: 'ACTIVE_TRACKING' | 'READ_ONLY';
    isDelivered: boolean;
    order: OrderTrackingData;
    stages: StageItem[];
    history: HistoryItem[];
  } | null>(null);

  useEffect(() => {
    const fetchTracking = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/orders/public/tracking/${code}/${token}`);
        const result = await res.json();

        if (!res.ok || !result.success) {
          throw new Error(result.error || 'Impossible d\'afficher les informations de suivi.');
        }

        setData(result);
      } catch (err: any) {
        setError(err.message || 'Erreur de connexion au serveur.');
      } finally {
        setLoading(false);
      }
    };

    if (code && token) {
      fetchTracking();
    }
  }, [code, token]);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#0F172A',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#FFFFFF',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{ width: 48, height: 48, border: '3px solid #D4AF37', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '1.25rem', fontSize: '1rem', color: '#D4AF37', fontWeight: 700 }}>
          Chargement du suivi de votre commande...
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#FAF8F5',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        textAlign: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0F172A' }}>Suivi non disponible</h1>
        <p style={{ color: '#64748B', maxWidth: 400, margin: '0.5rem 0 1.5rem 0' }}>{error}</p>
        <div style={{ fontSize: '0.85rem', color: '#B8922E', fontWeight: 700, backgroundColor: '#FFFDF5', border: '1px solid #D4AF37', padding: '0.5rem 1rem', borderRadius: 12 }}>
          👑 DIGICOUTURE VIP
        </div>
      </div>
    );
  }

  const { isDelivered, order, stages, history } = data;

  // Ordre des étapes pour le barème de progression
  const stageKeys = stages.map(s => s.key);
  const currentStageIndex = stageKeys.indexOf(order.status) !== -1 ? stageKeys.indexOf(order.status) : 0;

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#FAF8F5',
      color: '#0F172A',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      paddingBottom: '3rem'
    }}>
      {/* 👑 HEADER IMPÉRIAL MOBILE-FIRST */}
      <header style={{
        backgroundColor: '#0F172A',
        color: '#FFFFFF',
        padding: '1.75rem 1.25rem 2.25rem 1.25rem',
        borderBottom: '3px solid #D4AF37',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
        textAlign: 'center'
      }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'rgba(212, 175, 55, 0.15)', border: '1px solid #D4AF37', padding: '0.35rem 0.9rem', borderRadius: 20, marginBottom: '0.75rem' }}>
          <Sparkles size={16} color="#D4AF37" />
          <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#D4AF37', letterSpacing: '1.2px', textTransform: 'uppercase' }}>
            {order.atelierName || 'DIGICOUTURE VIP'}
          </span>
        </div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 900, margin: 0, fontFamily: 'Georgia, serif', color: '#FFFFFF' }}>
          Suivi de Commande
        </h1>
        <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#D4AF37', marginTop: '0.3rem', letterSpacing: '0.5px' }}>
          {order.code}
        </div>
      </header>

      {/* CONTENU ENVELOPPE MOBILE-FIRST */}
      <main style={{ maxWidth: 540, margin: '-1.5rem auto 0 auto', padding: '0 1rem' }}>
        
        {/* BANNIÈRE DE STATUT SI LIVRÉE (SECTION 5 DU PROMPT) */}
        {isDelivered && (
          <div style={{
            backgroundColor: '#ECFDF5',
            border: '2px solid #10B981',
            borderRadius: '24px',
            padding: '1.5rem',
            marginBottom: '1.5rem',
            textAlign: 'center',
            boxShadow: '0 8px 25px rgba(16, 185, 129, 0.15)'
          }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', backgroundColor: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem auto' }}>
              <CheckCircle2 size={32} color="#FFFFFF" />
            </div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#065F46', margin: '0 0 0.4rem 0' }}>
              ✓ COMMANDE LIVRÉE
            </h2>
            <p style={{ fontSize: '0.95rem', color: '#047857', fontWeight: 700, margin: 0 }}>
              Votre commande <strong>{order.code}</strong> a été remise avec succès.
            </p>
            <p style={{ fontSize: '0.85rem', color: '#059669', marginTop: '0.75rem', fontWeight: 600 }}>
              Merci d'avoir choisi {order.atelierName}. ❤️
            </p>
          </div>
        )}

        {/* CARTE DE DÉTAILS DE LA TENUE SUR-MESURE */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          padding: '1.5rem',
          border: '1.5px solid #EAE5DF',
          boxShadow: '0 6px 20px rgba(0,0,0,0.04)',
          marginBottom: '1.5rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.72rem', fontWeight: 900, color: '#B8922E', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                CREATION SUR-MESURE
              </span>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0F172A', margin: '0.2rem 0 0.5rem 0', fontFamily: 'Georgia, serif' }}>
                {order.modelName || 'Ensemble Haute Couture'}
              </h2>
              <div style={{ fontSize: '0.88rem', color: '#64748B', fontWeight: 600 }}>
                🧶 Tissu : <strong style={{ color: '#0F172A' }}>{order.fabricName || 'Bazin Riche Luxe'}</strong> {order.fabricColor ? `(${order.fabricColor})` : ''}
              </div>
            </div>

            {order.modelImageUrl && (
              <img
                src={order.modelImageUrl}
                alt={order.modelName}
                style={{ width: 68, height: 68, borderRadius: 16, objectFit: 'cover', border: '1.5px solid #D4AF37' }}
              />
            )}
          </div>

          <div style={{ height: 1, backgroundColor: '#F1F5F9', margin: '1.25rem 0' }} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>DATE DE COMMANDE</div>
              <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0F172A', marginTop: 2 }}>{order.createdAt}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>LIVRAISON PRÉVUE</div>
              <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#B8922E', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Clock size={14} color="#B8922E" />
                {order.deliveryDate || 'À confirmer'}
              </div>
            </div>
          </div>
        </div>

        {/* PROGRESSION DE LA CONFECTION (SECTIONS 4 & 6 DU PROMPT) */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          padding: '1.5rem',
          border: '1.5px solid #EAE5DF',
          boxShadow: '0 6px 20px rgba(0,0,0,0.04)',
          marginBottom: '1.5rem'
        }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0F172A', margin: '0 0 1.25rem 0', fontFamily: 'Georgia, serif', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Progression de la Confection 🧵
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {stages.map((stage, idx) => {
              const isPassed = idx <= currentStageIndex;
              const isCurrent = idx === currentStageIndex && !isDelivered;

              return (
                <div key={stage.key} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    backgroundColor: isPassed ? (isCurrent ? '#D4AF37' : '#10B981') : '#F1F5F9',
                    color: isPassed ? '#FFFFFF' : '#94A3B8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: '0.85rem',
                    boxShadow: isCurrent ? '0 0 12px rgba(212, 175, 55, 0.4)' : 'none',
                    border: isCurrent ? '2px solid #FFFFFF' : 'none'
                  }}>
                    {isPassed ? (isCurrent ? '●' : '✓') : '○'}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: '0.95rem',
                      fontWeight: isCurrent ? 900 : isPassed ? 700 : 500,
                      color: isCurrent ? '#B8922E' : isPassed ? '#0F172A' : '#94A3B8'
                    }}>
                      {stage.label}
                    </div>
                  </div>

                  {isCurrent && (
                    <span style={{ fontSize: '0.72rem', fontWeight: 900, color: '#B8922E', backgroundColor: '#FFFDF5', border: '1px solid #D4AF37', padding: '2px 8px', borderRadius: 8 }}>
                      EN COURS
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* HISTORIQUE HORODATÉ OFFICIEL (SECTION 6 DU PROMPT) */}
        {history && history.length > 0 && (
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '24px',
            padding: '1.5rem',
            border: '1.5px solid #EAE5DF',
            boxShadow: '0 6px 20px rgba(0,0,0,0.04)',
            marginBottom: '1.5rem'
          }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0F172A', margin: '0 0 1rem 0', fontFamily: 'Georgia, serif' }}>
              Historique de votre commande
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {history.map((h, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.88rem', borderBottom: i < history.length - 1 ? '1px dashed #F1F5F9' : 'none', paddingBottom: 8 }}>
                  <div style={{ fontWeight: 700, color: '#0F172A' }}>
                    ✓ {stages.find(s => s.key === h.status)?.label || h.status}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>
                    {h.date} {h.time ? `(${h.time})` : ''}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* COORDONNÉES ET CONTACT MAISON */}
        <div style={{
          backgroundColor: '#0F172A',
          color: '#FFFFFF',
          borderRadius: '24px',
          padding: '1.5rem',
          border: '1.5px solid #D4AF37',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 900, color: '#D4AF37', letterSpacing: 1.2, textTransform: 'uppercase' }}>
            VOTRE MAISON DE COUTURE
          </div>
          <h4 style={{ fontSize: '1.2rem', fontWeight: 900, margin: '0.4rem 0 0.8rem 0', fontFamily: 'Georgia, serif' }}>
            {order.atelierName}
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.88rem', color: '#94A3B8' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <MapPin size={16} color="#D4AF37" />
              <span>{order.atelierAddress}</span>
            </div>
            {order.atelierWhatsapp && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <Phone size={16} color="#10B981" />
                <a
                  href={`https://wa.me/${order.atelierWhatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: '#10B981', textDecoration: 'none', fontWeight: 700 }}
                >
                  WhatsApp Atelier ({order.atelierWhatsapp})
                </a>
              </div>
            )}
          </div>

          <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: '0.75rem', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
            <ShieldCheck size={14} color="#D4AF37" />
            <span>Suivi officiel DigiCouture VIP • Sécurisé & Confidentiel</span>
          </div>
        </div>

      </main>
    </div>
  );
};
