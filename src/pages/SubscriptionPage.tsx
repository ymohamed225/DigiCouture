import React, { useEffect, useState } from 'react';
import { Check, Lock, ShieldCheck, RefreshCw, AlertTriangle } from 'lucide-react';

interface Plan {
  code: string;
  name: string;
  priceMonthly: number;
  priceMonthlyFormatted: string;
  maxUsers: number;
  maxClients: number;
  maxOrders: number;
  quotaText: string;
  storageLimitMb: number;
  isRecommended?: boolean;
}

interface SubscriptionData {
  plan: string;
  planName: string;
  status: string;
  isTrial: boolean;
  isExpiringSoon: boolean;
  isExpired: boolean;
  isSuspended: boolean;
  trialStartDate: string;
  trialEndDate: string;
  trialDaysRemaining: number;
  trialDaysElapsed: number;
  subscriptionEndDate: string | null;
  quotas: {
    maxUsers: number;
    currentUsers: number;
    maxClients: number;
    currentClients: number;
    maxOrders: number;
    currentMonthOrders: number;
    totalOrders: number;
  };
}

interface SubscriptionPageProps {
  atelierId: string;
  onBack?: () => void;
}

export const SubscriptionPage: React.FC<SubscriptionPageProps> = ({ atelierId, onBack }) => {
  const [subData, setSubData] = useState<SubscriptionData | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

  const loadData = async () => {
    try {
      setLoading(true);
      const [subRes, plansRes] = await Promise.all([
        fetch(`${API_BASE}/subscription?atelierId=${atelierId}`),
        fetch(`${API_BASE}/subscription/plans`)
      ]);

      const subJson = await subRes.json();
      const plansJson = await plansRes.json();

      if (subJson.success) setSubData(subJson);
      if (plansJson.success) setPlans(plansJson.data);
    } catch (e) {
      console.error('Erreur chargement page abonnement:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [atelierId]);

  const handleCheckout = async (plan: Plan) => {
    if (plan.code === 'FREE') {
      alert('L\'offre Découverte (Gratuit) est automatiquement attribuée sans aucun paiement.');
      return;
    }

    try {
      setIsProcessing(true);
      const res = await fetch(`${API_BASE}/payments/wave/create-checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          atelierId,
          plan_code: plan.code
        })
      });
      const data = await res.json();

      if (data.success && (data.waveLaunchUrl || data.paymentUrl)) {
        const url = data.waveLaunchUrl || data.paymentUrl;
        // Ouverture directe du portail Wave Checkout
        window.open(url, '_blank');
        alert(`🌊 Redirection vers Wave Checkout pour la formule ${plan.name} (${plan.priceMonthly.toLocaleString('fr-FR')} FCFA).\n\nAprès votre validation par Wave Money, votre abonnement sera immédiatement activé !`);
      } else {
        alert(data.message || data.error || 'Erreur lors de l\'initialisation du paiement Wave.');
      }
    } catch (e: any) {
      alert(`Erreur réseau lors de la connexion Wave: ${e.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748B' }}>
        <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: 12, fontWeight: 600 }}>Chargement de vos informations d'abonnement...</p>
      </div>
    );
  }

  const progressPercent = subData ? Math.min(100, Math.round((subData.trialDaysElapsed / 30) * 100)) : 0;

  return (
    <div className="animate-fade-in" style={{ padding: '1.25rem', width: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem', boxSizing: 'border-box' }}>
      {/* Header avec retour */}
      {onBack && (
        <button onClick={onBack} style={styles.backBtn}>
          ← Retour au tableau de bord
        </button>
      )}

      {/* Carte Mon Abonnement Actuel */}
      {subData && (
        <div style={styles.statusCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={styles.currentBadge}>STATUT ACTUEL</span>
                <span style={{
                  padding: '4px 10px',
                  borderRadius: 12,
                  fontSize: 12,
                  fontWeight: 800,
                  backgroundColor: subData.isExpired ? '#FEE2E2' : subData.isExpiringSoon ? '#FEF3C7' : '#DCFCE7',
                  color: subData.isExpired ? '#991B1B' : subData.isExpiringSoon ? '#92400E' : '#166534'
                }}>
                  {subData.isExpired ? '🔒 EXPIRED (Expiré)' : subData.isTrial ? '✨ TRIAL (Période Découverte)' : '✅ ACTIVE (Abonné)'}
                </span>
              </div>

              <h2 style={{ fontSize: 24, fontWeight: 900, color: '#0F172A', marginTop: 8, marginBottom: 4 }}>
                {subData.planName} ({subData.plan})
              </h2>

              <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>
                {subData.isTrial ? (
                  `Période découverte de 30 jours (du ${new Date(subData.trialStartDate).toLocaleDateString('fr-FR')} au ${new Date(subData.trialEndDate).toLocaleDateString('fr-FR')})`
                ) : (
                  `Abonnement actif jusqu'au ${subData.subscriptionEndDate ? new Date(subData.subscriptionEndDate).toLocaleDateString('fr-FR') : 'Indéterminé'}`
                )}
              </p>
            </div>

            {/* Compteur et barre */}
            {subData.isTrial && (
              <div style={{ minWidth: 220 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 800, color: '#0F172A', marginBottom: 6 }}>
                  <span>Temps restant</span>
                  <span style={{ color: '#D4AF37' }}>{subData.trialDaysRemaining} jours</span>
                </div>
                <div style={styles.progressBarBg}>
                  <div style={{ ...styles.progressBarFill, width: `${progressPercent}%` }} />
                </div>
                <p style={{ fontSize: 11, color: '#94A3B8', marginTop: 4, textAlign: 'right' }}>
                  Jour {subData.trialDaysElapsed} sur 30
                </p>
              </div>
            )}
          </div>

          {/* Alertes visuelles de fin */}
          {subData.isExpired && (
            <div style={styles.expiredBox}>
              <Lock size={18} color="#991B1B" />
              <span>
                <strong>Accès restreint :</strong> Votre période de découverte est arrivée à terme. Vos clients, commandes et mensurations sont conservés. Choisissez un forfait ci-dessous pour débloquer la création.
              </span>
            </div>
          )}

          {subData.isExpiringSoon && !subData.isExpired && (
            <div style={styles.warningBox}>
              <AlertTriangle size={18} color="#92400E" />
              <span>
                <strong>Avertissement :</strong> Il vous reste moins de 5 jours avant l'expiration de votre formule. Effectuez votre réabonnement pour éviter toute interruption.
              </span>
            </div>
          )}
        </div>
      )}

      {/* Titre des offres conforme à la maquette */}
      <div style={{ textAlign: 'center', marginTop: 32, marginBottom: 24 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, backgroundColor: '#EFF6FF', border: '1.5px solid #3B82F6', borderRadius: 20, padding: '6px 16px', color: '#1D4ED8', fontWeight: 800, fontSize: 13, marginBottom: 12 }}>
          🌊 PAIEMENT UNIVERSEL EXCLUSIF WAVE MOBILE MONEY
        </div>
        <h2 style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 32, fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.5px' }}>
          Des offres adaptées à la taille de votre atelier
        </h2>
        <p style={{ fontSize: 15, color: '#64748B', marginTop: 8, fontWeight: 500 }}>
          Abonnez-vous ou réabonnez-vous en 1 clic via <strong>Wave Direct</strong>. Votre compte est débloqué automatiquement en 2 secondes !
        </p>
      </div>

      {/* Grille des 4 Formules Principales (Gratuit, Starter, Pro, Atelier) + Business */}
      <div style={styles.gridContainer}>
        {plans.map((p) => {
          const isRecommended = p.code === 'PRO';
          const isCurrent = subData?.plan === p.code;

          let subtitle = "Pour tester l'application";
          let featuresList = [
            "20 commandes / 30j d'essai",
            "Carnet de mesures de base",
            "Support WhatsApp"
          ];
          let btnText = "Offre Gratuit (Inclus)";

          if (p.code === 'STARTER') {
            subtitle = "Pour les couturiers indépendants";
            featuresList = [
              "Gestion complète des clients",
              "Mensurations visuelles silhouette",
              "Suivi des acomptes & caisse (30 comm/mois)"
            ];
            btnText = "🌊 Payer 2 000 FCFA avec Wave";
          } else if (p.code === 'PRO') {
            subtitle = "Pour les ateliers actifs & stylistes";
            featuresList = [
              "Commandes illimitées",
              "Site web Catalogue Public",
              "Messages WhatsApp 1-clic",
              "Suivi de production 8 étapes"
            ];
            btnText = "🌊 Payer 5 000 FCFA avec Wave";
          } else if (p.code === 'ATELIER') {
            subtitle = "Pour les maisons de couture & équipes";
            featuresList = [
              "Multi-utilisateurs & Rôles",
              "Rapports financiers avancés",
              "Gestion d'équipe & des employés",
              "Assistance prioritaire 24/7"
            ];
            btnText = "🌊 Payer 10 000 FCFA avec Wave";
          }

          return (
            <div key={p.code} style={{
              ...styles.planCard,
              borderColor: isRecommended ? '#D4AF37' : '#EAE5DF',
              borderWidth: isRecommended ? 2.5 : 1,
              boxShadow: isRecommended ? '0 15px 35px rgba(212, 175, 55, 0.22)' : '0 4px 15px rgba(0,0,0,0.03)'
            }}>
              {/* Badge Pilule Recommandé */}
              {isRecommended && (
                <div style={styles.recommendedRibbon}>
                  📌 RECOMMANDÉ
                </div>
              )}

              <div style={{ padding: '28px 22px', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 24, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    {p.name === 'Offre Découverte' ? 'Gratuit' : p.name === 'Atelier Essentiel' ? 'Starter' : p.name === 'Couture Premium' ? 'Pro' : p.name === 'Haute Couture' ? 'Atelier' : p.name}
                  </h3>
                  <p style={{ fontSize: 13, color: '#64748B', marginTop: 4, marginBottom: 20 }}>
                    {subtitle}
                  </p>

                  {/* Prix */}
                  <div style={{ marginBottom: 24 }}>
                    <span style={{
                      fontSize: 32,
                      fontWeight: 900,
                      color: isRecommended ? '#D4AF37' : '#0F172A'
                    }}>
                      {p.priceMonthly > 0 ? `${p.priceMonthly.toLocaleString('fr-FR')} FCFA` : (p.code === 'FREE' ? '0 FCFA' : 'Sur Devis')}
                    </span>
                    {p.priceMonthly >= 0 && p.code !== 'BUSINESS' && (
                      <span style={{ fontSize: 13, fontWeight: 500, color: '#64748B' }}> / mois</span>
                    )}
                  </div>

                  {/* Liste des Fonctionnalités */}
                  <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {featuresList.map((feat, idx) => (
                      <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: isRecommended ? '#0F172A' : '#334155', fontWeight: isRecommended ? 700 : 500 }}>
                        <Check size={16} color={isRecommended ? '#B8922E' : '#166534'} style={{ marginTop: 2, flexShrink: 0 }} />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Bouton Pilule conforme à la photo */}
                <button
                  disabled={isCurrent || isProcessing}
                  onClick={() => handleCheckout(p)}
                  style={{
                    width: '100%',
                    padding: '13px 16px',
                    borderRadius: 14,
                    fontSize: 14,
                    fontWeight: 800,
                    border: 'none',
                    cursor: isCurrent ? 'default' : 'pointer',
                    backgroundColor: isCurrent ? '#E2E8F0' : isRecommended ? '#D4AF37' : '#0F172A',
                    color: isCurrent ? '#64748B' : '#FFFFFF',
                    boxShadow: isRecommended ? '0 6px 18px rgba(212, 175, 55, 0.35)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {isCurrent ? '✓ Formule Actuelle' : btnText}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Security note */}
      <div style={{ textAlign: 'center', marginTop: 32, fontSize: 12, color: '#94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
        <ShieldCheck size={16} color="#10B981" />
        <span>Garantie de conservation des données • Vos clients et commandes ne sont jamais supprimés lors de l'expiration.</span>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  backBtn: {
    backgroundColor: '#F1F5F9',
    color: '#0F172A',
    border: 'none',
    borderRadius: 10,
    padding: '8px 14px',
    fontSize: 12,
    fontWeight: 700,
    cursor: 'pointer',
    marginBottom: 16
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: 18,
    padding: 24,
    boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
  },
  currentBadge: {
    fontSize: 10,
    fontWeight: 900,
    color: '#D4AF37',
    letterSpacing: 1
  },
  progressBarBg: {
    width: '100%',
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden'
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#D4AF37',
    borderRadius: 4
  },
  expiredBox: {
    marginTop: 16,
    backgroundColor: '#FEF2F2',
    border: '1px solid #FECACA',
    borderRadius: 12,
    padding: 12,
    fontSize: 12,
    color: '#991B1B',
    display: 'flex',
    alignItems: 'center',
    gap: 10
  },
  warningBox: {
    marginTop: 16,
    backgroundColor: '#FFFBEB',
    border: '1px solid #FDE68A',
    borderRadius: 12,
    padding: 12,
    fontSize: 12,
    color: '#92400E',
    display: 'flex',
    alignItems: 'center',
    gap: 10
  },
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 16,
    alignItems: 'stretch'
  },
  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
  },
  recommendedRibbon: {
    backgroundColor: '#D4AF37',
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 900,
    textAlign: 'center',
    padding: '4px 0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 8
  },
  checkoutBtn: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 12,
    fontSize: 13,
    fontWeight: 800,
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6
  }
};
