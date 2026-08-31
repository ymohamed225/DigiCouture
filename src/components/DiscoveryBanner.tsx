import React, { useEffect, useState } from 'react';
import { Sparkles, AlertTriangle, AlertCircle, Lock, ArrowRight } from 'lucide-react';

interface SubscriptionData {
  plan: string;
  planName: string;
  status: string;
  isTrial: boolean;
  isPaid?: boolean;
  isExpiringSoon: boolean;
  isExpired: boolean;
  trialDaysRemaining: number;
  trialDaysElapsed: number;
  trialEndDate: string;
  discoveryPhase: 'welcome' | 'usage' | 'warning' | 'urgent' | 'expired';
  phaseMessage: string;
  quotas: {
    maxOrders: number;
    totalOrders: number;
    currentMonthOrders: number;
    isOrdersLimitReached: boolean;
  };
}

interface DiscoveryBannerProps {
  atelierId: string;
  atelierPlan?: string;
  onNavigateToSubscription: () => void;
}

export const DiscoveryBanner: React.FC<DiscoveryBannerProps> = ({ atelierId, atelierPlan, onNavigateToSubscription }) => {
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(`dc_dismiss_banner_${atelierId}`) === 'true');
  const [subData, setSubData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);

  const cleanPropPlan = (atelierPlan || '').toLowerCase();
  const isPropPaid = cleanPropPlan && cleanPropPlan !== 'gratuit' && cleanPropPlan !== 'free' && cleanPropPlan !== 'decouverte';

  if (dismissed || isPropPaid) {
    return null;
  }

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:5000/api/subscription?atelierId=${atelierId}`);
      const data = await res.json();
      if (data.success) {
        setSubData(data);
      }
    } catch (e) {
      console.warn('Impossible de charger le statut d\'abonnement réactif:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (atelierId) {
      fetchSubscription();
    }
  }, [atelierId]);

  if (loading || !subData) return null;

  // 0. Si l'atelier est sur un abonnement actif (Starter, Pro, Atelier, VIP), NE PAS AFFICHER LA BANNIÈRE DÉCOUVERTE !
  const normalizedPlan = (subData.plan || '').toLowerCase();
  const isPaidActivePlan = subData.isPaid || (normalizedPlan !== 'gratuit' && normalizedPlan !== 'free' && normalizedPlan !== 'decouverte');

  if (isPaidActivePlan) {
    return null; // Bannière 100% masquée dès que l'atelier passe sur une formule payante !
  }
  if (subData.isExpired || subData.status === 'EXPIRED') {
    return (
      <div style={styles.expiredBanner}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={styles.iconCircleRed}>
            <Lock size={20} color="#EF4444" />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: '#991B1B' }}>
              🔒 Votre période découverte est terminée
            </h4>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: '#7F1D1D' }}>
              Vos données sont conservées en toute sécurité. Choisissez une formule pour réactiver la création de commandes et clients.
            </p>
          </div>
        </div>
        <button onClick={onNavigateToSubscription} style={styles.ctaButtonRed}>
          Choisir mon abonnement
          <ArrowRight size={14} />
        </button>
      </div>
    );
  }

  // 2. Alerte Urgente J28-29 (Rouge Vif)
  if (subData.discoveryPhase === 'urgent') {
    return (
      <div style={styles.urgentBanner}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={styles.iconCircleRed}>
            <AlertCircle size={20} color="#DC2626" />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: '#991B1B' }}>
              🔴 Période découverte terminée dans {subData.trialDaysRemaining} jour(s) !
            </h4>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: '#B91C1C' }}>
              Passez dès maintenant au forfait PRO pour éviter toute interruption de vos commandes.
            </p>
          </div>
        </div>
        <button onClick={onNavigateToSubscription} style={styles.ctaButtonRed}>
          Choisir mon abonnement
          <ArrowRight size={14} />
        </button>
      </div>
    );
  }

  // 3. Avertissement J25-27 (Jaune / Orange)
  if (subData.discoveryPhase === 'warning' || subData.isExpiringSoon) {
    return (
      <div style={styles.warningBanner}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={styles.iconCircleYellow}>
            <AlertTriangle size={20} color="#D97706" />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: '#92400E' }}>
              🟡 Votre période découverte se termine bientôt ({subData.trialDaysRemaining} jours restants)
            </h4>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: '#B45309' }}>
              Profitez de la période découverte pour comparer nos formules tarifaires.
            </p>
          </div>
        </div>
        <button onClick={onNavigateToSubscription} style={styles.ctaButtonYellow}>
          Voir les formules
          <ArrowRight size={14} />
        </button>
      </div>
    );
  }

  // 4. Période de Découverte Initiale J1-7 (Bannière de Bienvenue avec Progression)
  if (subData.isTrial) {
    const progressPercent = Math.min(100, Math.round((subData.trialDaysElapsed / 30) * 100));

    return (
      <div style={styles.welcomeBanner}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
            <div style={styles.iconCircleGold}>
              <Sparkles size={20} color="#D4AF37" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h4 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: '#0F172A' }}>
                  🎉 Bienvenue dans DigiCouture VIP !
                </h4>
                <span style={styles.badgeTrial}>Période Découverte ({subData.trialDaysRemaining}j restants)</span>
              </div>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: '#475569' }}>
                {subData.phaseMessage} (Jour {subData.trialDaysElapsed} / 30)
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Barre de progression */}
            <div style={{ width: 140 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, fontWeight: 700, color: '#64748B', marginBottom: 3 }}>
                <span>Découverte</span>
                <span>{subData.trialDaysElapsed}/30j</span>
              </div>
              <div style={{ width: '100%', height: 6, backgroundColor: '#E2E8F0', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: `${progressPercent}%`, height: '100%', backgroundColor: '#D4AF37', borderRadius: 3 }} />
              </div>
            </div>

            <button onClick={onNavigateToSubscription} style={styles.ctaButtonGold}>
              Voir les offres
              <ArrowRight size={14} />
            </button>
            <button 
              onClick={() => {
                localStorage.setItem(`dc_dismiss_banner_${atelierId}`, 'true');
                setDismissed(true);
              }}
              style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: 16, fontWeight: 700, padding: '4px 8px' }}
              title="Fermer la bannière"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

const styles: Record<string, React.CSSProperties> = {
  expiredBanner: {
    backgroundColor: '#FEF2F2',
    border: '1px solid #FECACA',
    borderRadius: 14,
    padding: '14px 18px',
    marginBottom: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16
  },
  urgentBanner: {
    backgroundColor: '#FEF2F2',
    border: '1px solid #FCA5A5',
    borderRadius: 14,
    padding: '14px 18px',
    marginBottom: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16
  },
  warningBanner: {
    backgroundColor: '#FFFBEB',
    border: '1px solid #FDE68A',
    borderRadius: 14,
    padding: '14px 18px',
    marginBottom: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16
  },
  welcomeBanner: {
    backgroundColor: '#F8FAFC',
    border: '1px solid #E2E8F0',
    borderRadius: 14,
    padding: '14px 18px',
    marginBottom: 20
  },
  iconCircleRed: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEE2E2',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  iconCircleYellow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEF3C7',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  iconCircleGold: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEF3C7',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  ctaButtonRed: {
    backgroundColor: '#DC2626',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: 10,
    padding: '8px 14px',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 6
  },
  ctaButtonYellow: {
    backgroundColor: '#D97706',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: 10,
    padding: '8px 14px',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 6
  },
  ctaButtonGold: {
    backgroundColor: '#0F172A',
    color: '#D4AF37',
    border: '1px solid #D4AF37',
    borderRadius: 10,
    padding: '8px 14px',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 6
  },
  badgeTrial: {
    backgroundColor: '#FEF3C7',
    color: '#92400E',
    fontSize: 11,
    fontWeight: 800,
    padding: '2px 8px',
    borderRadius: 12
  }
};
