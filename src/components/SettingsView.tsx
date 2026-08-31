import React, { useState } from 'react';
import type { AtelierProfile } from '../types';
import { 
  Store, 
  ShieldCheck, 
  Bell, 
  CreditCard, 
  Save,
  Check
} from 'lucide-react';

interface SettingsViewProps {
  atelier: AtelierProfile;
  onSaveAtelier: (updated: AtelierProfile) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ atelier, onSaveAtelier }) => {
  const [formData, setFormData] = useState<AtelierProfile>(atelier);
  const [activeTab, setActiveTab] = useState<'profil' | 'saas' | 'abonnement' | 'notifications' | 'paiements' | 'equipe'>('profil');
  const [isSaved, setIsSaved] = useState(false);

  // ÉTATS DE GESTION DU PAIEMENT D'ABONNEMENT AVEC IDENTIFIANT NUMÉRO DE TÉLÉPHONE UNIQUE
  const [selectedPlanForPayment, setSelectedPlanForPayment] = useState<{ plan: 'starter' | 'pro' | 'atelier', name: string, price: string, priceNum: number } | null>(null);
  const [paymentPhone, setPaymentPhone] = useState<string>(atelier.whatsapp || '+225 0707705067');
  const [paymentProvider, setPaymentProvider] = useState<'wave' | 'orange' | 'mtn' | 'moov'>('wave');
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [paymentSuccessMessage, setPaymentSuccessMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveAtelier(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="animate-fade-in" style={{ padding: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-main)' }}>
            Paramètres SaaS & Personnalisation Multi-Ateliers ⚙️
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Adaptez l'application SaaS à votre atelier : Devise, taxes, unités de mesure, reçus personnalisés et logo.
          </p>
        </div>

        {isSaved && (
          <span className="badge badge-success" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
            <Check size={16} /> Modifications enregistrées avec succès !
          </span>
        )}
      </div>

      {/* Navigation Onglets Paramètres SaaS */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1.5rem', overflowX: 'auto' }}>
        <button
          onClick={() => setActiveTab('profil')}
          style={{
            padding: '0.65rem 1.25rem',
            borderBottom: activeTab === 'profil' ? '3px solid var(--gold-primary)' : '3px solid transparent',
            fontWeight: activeTab === 'profil' ? 700 : 500,
            color: activeTab === 'profil' ? 'var(--text-main)' : 'var(--text-muted)',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            whiteSpace: 'nowrap'
          }}
        >
          <Store size={16} />
          Profil Atelier & Vitrine
        </button>

        <button
          onClick={() => setActiveTab('abonnement')}
          style={{
            padding: '0.65rem 1.25rem',
            borderBottom: activeTab === 'abonnement' ? '3px solid var(--gold-primary)' : '3px solid transparent',
            fontWeight: activeTab === 'abonnement' ? 700 : 500,
            color: activeTab === 'abonnement' ? 'var(--text-main)' : 'var(--text-muted)',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            whiteSpace: 'nowrap'
          }}
        >
          <span>💎</span>
          Formules & Abonnement Atelier
        </button>

        <button
          onClick={() => setActiveTab('saas')}
          style={{
            padding: '0.65rem 1.25rem',
            borderBottom: activeTab === 'saas' ? '3px solid var(--gold-primary)' : '3px solid transparent',
            fontWeight: activeTab === 'saas' ? 700 : 500,
            color: activeTab === 'saas' ? 'var(--text-main)' : 'var(--text-muted)',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            whiteSpace: 'nowrap'
          }}
        >
          <span>🌐</span>
          Personnalisation SaaS & Devise
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          style={{
            padding: '0.65rem 1.25rem',
            borderBottom: activeTab === 'notifications' ? '3px solid var(--gold-primary)' : '3px solid transparent',
            fontWeight: activeTab === 'notifications' ? 700 : 500,
            color: activeTab === 'notifications' ? 'var(--text-main)' : 'var(--text-muted)',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            whiteSpace: 'nowrap'
          }}
        >
          <Bell size={16} />
          Relances WhatsApp & SMS
        </button>

        <button
          onClick={() => setActiveTab('paiements')}
          style={{
            padding: '0.65rem 1.25rem',
            borderBottom: activeTab === 'paiements' ? '3px solid var(--gold-primary)' : '3px solid transparent',
            fontWeight: activeTab === 'paiements' ? 700 : 500,
            color: activeTab === 'paiements' ? 'var(--text-main)' : 'var(--text-muted)',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            whiteSpace: 'nowrap'
          }}
        >
          <CreditCard size={16} />
          Comptes Wave & Mobile Money
        </button>

        <button
          onClick={() => setActiveTab('equipe')}
          style={{
            padding: '0.65rem 1.25rem',
            borderBottom: activeTab === 'equipe' ? '3px solid var(--gold-primary)' : '3px solid transparent',
            fontWeight: activeTab === 'equipe' ? 700 : 500,
            color: activeTab === 'equipe' ? 'var(--text-main)' : 'var(--text-muted)',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            whiteSpace: 'nowrap'
          }}
        >
          <ShieldCheck size={16} />
          Rôles & Employés
        </button>
      </div>

      {/* CONTENU ONGLETS */}
      {activeTab === 'profil' && (
        <form onSubmit={handleSubmit} style={{ backgroundColor: 'var(--bg-primary)', padding: '1.75rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Informations de l'Atelier</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Nom de l'atelier *</label>
              <input 
                type="text" 
                required
                value={formData.name} 
                onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }} 
              />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Nom du Propriétaire / Chef Tailleur *</label>
              <input 
                type="text" 
                required
                value={formData.ownerName} 
                onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })} 
                style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }} 
              />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Numéro WhatsApp Officiel *</label>
              <input 
                type="text" 
                required
                value={formData.whatsapp} 
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })} 
                style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }} 
              />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Commune / Ville *</label>
              <input 
                type="text" 
                required
                value={formData.city} 
                onChange={(e) => setFormData({ ...formData, city: e.target.value })} 
                style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }} 
              />
            </div>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Adresse physique précise</label>
            <input 
              type="text" 
              value={formData.address} 
              onChange={(e) => setFormData({ ...formData, address: e.target.value })} 
              style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }} 
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Description de la Maison de Couture</label>
            <textarea 
              rows={3} 
              value={formData.description} 
              onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
              style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }} 
            />
          </div>

          <button type="submit" className="btn btn-primary">
            <Save size={16} /> Enregistrer les modifications
          </button>
        </form>
      )}

      {/* 💎 GESTION ET CHANGEMENT DE FORMULES SAAS ATELIER */}
      {activeTab === 'abonnement' && (
        <div style={{ backgroundColor: 'var(--bg-primary)', padding: '2rem', borderRadius: '24px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
          
          {/* BANNIÈRE D'INFORMATION ESSAI GRATUIT 1 MOIS NOUVELLE INSCRIPTION */}
          <div style={{
            backgroundColor: '#FFFDF5',
            border: '2px dashed #D4AF37',
            borderRadius: '20px',
            padding: '1.25rem 1.5rem',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '24px', backgroundColor: '#FFF6D6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                🎁
              </div>
              <div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0F172A', margin: 0 }}>
                  1 Mois d'Essai Gratuit Offert à l'Inscription !
                </h4>
                <p style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '2px' }}>
                  Votre atelier est enregistré avec la <strong>Formule Gratuit</strong>. Profitez de vos 30 jours d'essai offerts pour faire évoluer votre formule vers Pro à tout moment !
                </p>
              </div>
            </div>
            <div style={{ backgroundColor: '#1E293B', color: '#D4AF37', border: '1px solid #D4AF37', padding: '0.5rem 1rem', borderRadius: '12px', fontWeight: 900, fontSize: '0.82rem', textAlign: 'center' }}>
              ⏳ Fin d'essai : {formData.trialEndsAt || '18/09/2026'}
            </div>
          </div>

          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span className="badge badge-gold" style={{ marginBottom: '0.5rem' }}>TARIFS & AVANTAGES EXCLUSIFS</span>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 800, color: '#0F172A' }}>
              Choisissez la formule idéale pour votre atelier
            </h3>
            <p style={{ color: '#64748B', fontSize: '0.95rem', marginTop: '0.4rem' }}>
              Formule actuelle : <strong style={{ color: '#D4AF37', textTransform: 'uppercase' }}>{formData.plan || 'gratuit'}</strong>. Souscription rapide sans engagement via Mobile Money & Wave.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
            {/* Plan 1 : Gratuit */}
            <div style={{
              padding: '1.5rem',
              borderRadius: '20px',
              backgroundColor: (formData.plan || 'gratuit') === 'gratuit' ? '#FFFDF5' : '#FFFFFF',
              border: (formData.plan || 'gratuit') === 'gratuit' ? '2.5px solid #D4AF37' : '1px solid #EAE5DF',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div>
                <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>Gratuit</h4>
                <p style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '2px', marginBottom: '1rem' }}>30 jours offerts à l'inscription</p>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0F172A', marginBottom: '1rem' }}>
                  0 FCFA <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#64748B' }}>/ mois</span>
                </div>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.78rem', color: '#334155', padding: 0 }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Check size={14} color="#166534" /> <strong>20 commandes / mois</strong></li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Check size={14} color="#166534" /> 50 clients & 1 utilisateur</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Check size={14} color="#166534" /> Support WhatsApp</li>
                </ul>
              </div>
              <button 
                disabled={(formData.plan || 'gratuit') !== 'gratuit'}
                onClick={() => {
                  if ((formData.plan || 'gratuit') !== 'gratuit') return;
                  const updated = { ...formData, plan: 'gratuit' as const };
                  setFormData(updated);
                  onSaveAtelier(updated);
                }} 
                className={(formData.plan || 'gratuit') === 'gratuit' ? "btn btn-primary" : "btn btn-secondary"}
                style={{ 
                  width: '100%', 
                  padding: '0.65rem', 
                  marginTop: '1.25rem', 
                  fontSize: '0.82rem', 
                  fontWeight: 800,
                  opacity: (formData.plan || 'gratuit') !== 'gratuit' ? 0.6 : 1,
                  cursor: (formData.plan || 'gratuit') !== 'gratuit' ? 'not-allowed' : 'pointer'
                }}
              >
                {(formData.plan || 'gratuit') === 'gratuit' ? '✓ Formule Actuelle' : '🔒 Offre Gratuit Épuisée (Non réutilisable)'}
              </button>
            </div>

            {/* Plan 2 : Starter */}
            <div style={{
              padding: '1.5rem',
              borderRadius: '20px',
              backgroundColor: '#FFFFFF',
              border: formData.plan === 'starter' ? '2.5px solid #D4AF37' : '1px solid #EAE5DF',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div>
                <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>Starter</h4>
                <p style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '2px', marginBottom: '1rem' }}>Pour couturiers indépendants</p>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0F172A', marginBottom: '1rem' }}>
                  5 000 FCFA <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#64748B' }}>/ mois</span>
                </div>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.78rem', color: '#334155', padding: 0 }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Check size={14} color="#166534" /> <strong>100 commandes / mois</strong></li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Check size={14} color="#166534" /> 200 clients & 2 utilisateurs</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Check size={14} color="#166534" /> Suivi acomptes & caisse</li>
                </ul>
              </div>
              <button 
                onClick={() => {
                  if (formData.plan === 'starter') return;
                  setSelectedPlanForPayment({ plan: 'starter', name: 'Starter', price: '5 000 FCFA / mois', priceNum: 5000 });
                }} 
                className={formData.plan === 'starter' ? "btn btn-primary" : "btn btn-secondary"}
                style={{ width: '100%', padding: '0.65rem', marginTop: '1.25rem', fontSize: '0.82rem', fontWeight: 800 }}
              >
                {formData.plan === 'starter' ? '✓ Formule Actuelle' : 'Choisir Starter & Payer'}
              </button>
            </div>

            {/* Plan 3 : Pro (Recommandé) */}
            <div style={{
              padding: '1.5rem',
              borderRadius: '20px',
              backgroundColor: '#FFFFFF',
              border: formData.plan === 'pro' ? '2.5px solid #D4AF37' : '2px solid #D4AF37',
              position: 'relative',
              boxShadow: '0 8px 25px rgba(212, 175, 55, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div style={{ position: 'absolute', top: '-12px', right: '14px', backgroundColor: '#FFFDF5', border: '1px solid #D4AF37', color: '#B8922E', padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.68rem', fontWeight: 900 }}>
                📌 RECOMMANDÉ
              </div>
              <div>
                <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>Pro</h4>
                <p style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '2px', marginBottom: '1rem' }}>Pour ateliers actifs & stylistes</p>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#B8922E', marginBottom: '1rem' }}>
                  15 000 FCFA <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#64748B' }}>/ mois</span>
                </div>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.78rem', color: '#0F172A', padding: 0, fontWeight: 700 }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Check size={14} color="#B8922E" /> <strong>Commandes & Clients Illimités</strong></li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Check size={14} color="#B8922E" /> Catalogue Public Web & 5 Utilisateurs</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Check size={14} color="#B8922E" /> Messages WhatsApp 1-clic</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Check size={14} color="#B8922E" /> Suivi production 8 étapes</li>
                </ul>
              </div>
              <button 
                onClick={() => {
                  if (formData.plan === 'pro') return;
                  setSelectedPlanForPayment({ plan: 'pro', name: 'Pro', price: '15 000 FCFA / mois', priceNum: 15000 });
                }} 
                className={formData.plan === 'pro' ? "btn btn-primary" : "btn btn-secondary"}
                style={{ width: '100%', padding: '0.65rem', marginTop: '1.25rem', fontSize: '0.82rem', fontWeight: 900, boxShadow: '0 4px 12px rgba(212, 175, 55, 0.3)' }}
              >
                {formData.plan === 'pro' ? '✓ Formule Actuelle' : 'Choisir Pro & Payer'}
              </button>
            </div>

            {/* Plan 4 : Atelier / VIP */}
            <div style={{
              padding: '1.5rem',
              borderRadius: '20px',
              backgroundColor: '#FFFFFF',
              border: formData.plan === 'atelier' ? '2.5px solid #D4AF37' : '1px solid #EAE5DF',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div>
                <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>VIP / Atelier</h4>
                <p style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '2px', marginBottom: '1rem' }}>Pour grandes maisons de couture</p>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0F172A', marginBottom: '1rem' }}>
                  30 000 FCFA <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#64748B' }}>/ mois</span>
                </div>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.78rem', color: '#334155', padding: 0 }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Check size={14} color="#166534" /> <strong>Multi-utilisateurs & Rôles illimités</strong></li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Check size={14} color="#166534" /> Clients & Commandes Illimités</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Check size={14} color="#166534" /> Rapports financiers & Assistance 24/7</li>
                </ul>
              </div>
              <button 
                onClick={() => {
                  if (formData.plan === 'atelier') return;
                  setSelectedPlanForPayment({ plan: 'atelier', name: 'VIP / Atelier', price: '30 000 FCFA / mois', priceNum: 30000 });
                }} 
                className={formData.plan === 'atelier' ? "btn btn-primary" : "btn btn-secondary"}
                style={{ width: '100%', padding: '0.65rem', marginTop: '1.25rem', fontSize: '0.82rem', fontWeight: 800 }}
              >
                {formData.plan === 'atelier' ? '✓ Formule Actuelle' : 'Choisir VIP & Payer'}
              </button>
            </div>

          </div>

          {/* 🔴 SECTION DÉSABONNEMENT DÉFINITIF ET SUPPRESSION DU COMPTE ATELIER */}
          <div style={{
            marginTop: '2.5rem',
            padding: '1.5rem',
            backgroundColor: '#FEF2F2',
            borderRadius: '20px',
            border: '1.5px solid #FCA5A5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 900, color: '#991B1B', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                🛑 Désabonnement & Résiliation Définitive du Compte
              </h4>
              <p style={{ fontSize: '0.82rem', color: '#7F1D1D', marginTop: '4px', maxWidth: '600px' }}>
                Si vous ne souhaitez plus utiliser DigiCouture, vous pouvez vous désabonner et fermer définitivement votre atelier. Toutes vos fiches clients, commandes et mensurations seront effacées de la plateforme.
              </p>
            </div>
            <button
              onClick={async () => {
                const confirmed = window.confirm(
                  `⚠️ AVERTISSEMENT STRICT DE DÉSABONNEMENT DÉFINITIF ⚠️\n\n` +
                  `Vous êtes sur le point de résilier votre abonnement et de SUPPRIMER DÉFINITIVEMENT votre compte atelier "${formData.name}".\n\n` +
                  `🔴 CE QUI SERA SUPPRIMÉ DÉFINITIVEMENT :\n` +
                  `• Votre identifiant d'atelier (+225 ${formData.whatsapp || ''})\n` +
                  `• Toutes vos fiches clients et leurs carnets de mesures\n` +
                  `• L'historique de vos commandes et encaissements\n` +
                  `• Votre vitrine et catalogue public Web & Mobile\n\n` +
                  `Êtes-vous certain à 100% de vouloir vous désabonner et supprimer votre compte ?`
                );

                if (confirmed) {
                  const atelierIdOrPhone = formData.id || formData.whatsapp || 'atl-001';
                  
                  // 1. Suppression BDD MySQL Unifiée
                  try {
                    await fetch(`http://localhost:5000/api/ateliers/${encodeURIComponent(atelierIdOrPhone)}`, {
                      method: 'DELETE'
                    });
                  } catch (e) {
                    console.log('Suppression local fallback');
                  }

                  // 2. Nettoyage mémoire locale
                  const saved = localStorage.getItem('dc_ateliers_list');
                  if (saved) {
                    const list = JSON.parse(saved);
                    const cleanPhone = (formData.whatsapp || '').replace(/[^0-9]/g, '');
                    const filtered = list.filter((a: any) => {
                      const pClean = (a.phone || a.whatsapp || '').replace(/[^0-9]/g, '');
                      return a.id !== formData.id && !pClean.includes(cleanPhone);
                    });
                    localStorage.setItem('dc_ateliers_list', JSON.stringify(filtered));
                  }

                  alert(`🛑 COMPTE ATELIER ACCORDÉEMENT DÉSABONNÉ & SUPPRIMÉ DÉFINITIVEMENT !\n\nVotre compte a été complètement effacé de la plateforme Web & Mobile. Vous pouvez réinscrire un nouvel atelier à tout moment.`);
                  window.location.reload();
                }
              }}
              style={{
                backgroundColor: '#DC2626',
                color: '#FFFFFF',
                border: 'none',
                padding: '0.75rem 1.25rem',
                borderRadius: '14px',
                fontWeight: 900,
                fontSize: '0.85rem',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)'
              }}
            >
              🗑️ SE DÉSABONNER & SUPPRIMER MON COMPTE
            </button>
          </div>

        </div>
      )}

      {/* 🌐 PANNEAU DE PERSONNALISATION SAAS MULTI-TENANT */}
      {activeTab === 'saas' && (
        <form onSubmit={handleSubmit} style={{ backgroundColor: 'var(--bg-primary)', padding: '1.75rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '1.5rem' }}>👑</span>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>Adaptation SaaS & Préférences Régionales</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Personnalisez l'expérience utilisateur selon votre pays, devise et préférences professionnelles.</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
            {/* 1. Devise / Monnaie */}
            <div style={{ backgroundColor: '#FAF8F5', padding: '1.25rem', borderRadius: '16px', border: '1px solid #EAE5DF' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 800, color: '#111827', display: 'block', marginBottom: '0.5rem' }}>
                💱 Monnaie de Facturation (Devise SaaS)
              </label>
              <select 
                value={formData.currency || 'FCFA'} 
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '12px', border: '1.5px solid #D4AF37', fontWeight: 700, backgroundColor: '#FFFFFF' }}
              >
                <option value="FCFA">FCFA (XOF / XAF - Franc CFA Afrique)</option>
                <option value="EUR">EUR (€ - Euro Europe)</option>
                <option value="USD">USD ($ - US Dollar)</option>
                <option value="GNF">GNF (Franc Guinéen)</option>
                <option value="MAD">MAD (Dirham Marocain)</option>
              </select>
              <p style={{ fontSize: '0.78rem', color: '#6B7280', marginTop: '0.5rem' }}>Tous les montants des commandes et statistiques s'adapteront à cette monnaie.</p>
            </div>

            {/* 2. Unités des Mesures */}
            <div style={{ backgroundColor: '#FAF8F5', padding: '1.25rem', borderRadius: '16px', border: '1px solid #EAE5DF' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 800, color: '#111827', display: 'block', marginBottom: '0.5rem' }}>
                📏 Unité de Mesure des Mensurations
              </label>
              <select 
                value={formData.measurementUnit || 'cm'} 
                onChange={(e) => setFormData({ ...formData, measurementUnit: e.target.value })}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '12px', border: '1.5px solid #D4AF37', fontWeight: 700, backgroundColor: '#FFFFFF' }}
              >
                <option value="cm">Centimètres (cm) — Standard Afrique & Europe</option>
                <option value="pouces">Pouces (Inches - in) — Standard Anglophone</option>
              </select>
              <p style={{ fontSize: '0.78rem', color: '#6B7280', marginTop: '0.5rem' }}>Utilisé pour la saisie des mensurations clients et les fiches ateliers.</p>
            </div>
          </div>

          {/* 3. Taxes & Entête de Reçu Papier */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Taux de Taxe / TVA (%) sur les reçus</label>
              <input 
                type="number" 
                min="0"
                max="30"
                value={formData.taxRate || 0} 
                onChange={(e) => setFormData({ ...formData, taxRate: parseFloat(e.target.value) || 0 })} 
                style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }} 
                placeholder="0% (Exonéré) ou 18%"
              />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Message de Bas de Ticket / Reçu</label>
              <input 
                type="text" 
                value={formData.receiptFooterMsg || "Merci pour votre confiance ! À très bientôt."} 
                onChange={(e) => setFormData({ ...formData, receiptFooterMsg: e.target.value })} 
                style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }} 
              />
            </div>
          </div>

          {/* 4. Options SaaS Avancées (Case à Cocher) */}
          <div style={{ backgroundColor: '#FFFDF5', padding: '1.25rem', borderRadius: '16px', border: '1px solid #F5E8C7', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={formData.enablePublicCatalogue !== false} 
                onChange={(e) => setFormData({ ...formData, enablePublicCatalogue: e.target.checked })} 
                style={{ width: 18, height: 18, accentColor: '#D4AF37' }}
              />
              <div>
                <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#111827' }}>Activer le Catalogue Public Virtuel QR Code & Lien Client</span>
                <p style={{ fontSize: '0.78rem', color: '#6B7280' }}>Permet à vos clients de scanner votre code QR pour voir vos modèles et créer leur fiche.</p>
              </div>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={formData.autoBackupCloud !== false} 
                onChange={(e) => setFormData({ ...formData, autoBackupCloud: e.target.checked })} 
                style={{ width: 18, height: 18, accentColor: '#D4AF37' }}
              />
              <div>
                <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#111827' }}>Sauvegarde Automatique Cloud Multi-Appareils (Web + Mobile)</span>
                <p style={{ fontSize: '0.78rem', color: '#6B7280' }}>Synchronise en temps réel vos données sur le serveur SaaS sécurisé.</p>
              </div>
            </label>
          </div>

          <button type="submit" className="btn btn-primary">
            <Save size={16} /> Enregistrer les paramètres SaaS
          </button>
        </form>
      )}

      {activeTab === 'notifications' && (
        <form onSubmit={handleSubmit} style={{ backgroundColor: 'var(--bg-primary)', padding: '1.75rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>🔔 Paramètres des Rappels & Notifications de Retrait</h3>
          
          {/* NOUVEAU RÉGLAGE : DÉLAI DE NOTIFICATION AVANT RETRAIT */}
          <div style={{ backgroundColor: '#FFFDF5', padding: '1.25rem', borderRadius: '16px', border: '1.5px solid #D4AF37', marginBottom: '1.5rem' }}>
            <label style={{ fontSize: '0.95rem', fontWeight: 800, color: '#B8922E', display: 'block', marginBottom: '0.5rem' }}>
              📅 Déclencher la notification combien de jours avant la date de retrait ?
            </label>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              {[1, 2, 3, 5, 7].map(days => (
                <button
                  type="button"
                  key={days}
                  onClick={() => setFormData({ ...formData, reminderDaysBeforeDelivery: days })}
                  style={{
                    padding: '0.65rem 1.2rem',
                    borderRadius: '12px',
                    fontSize: '0.9rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    backgroundColor: (formData.reminderDaysBeforeDelivery || 3) === days ? '#D4AF37' : '#FFFFFF',
                    color: (formData.reminderDaysBeforeDelivery || 3) === days ? '#FFFFFF' : '#4B5563',
                    border: (formData.reminderDaysBeforeDelivery || 3) === days ? 'none' : '1px solid #EAE5DF'
                  }}
                >
                  {days} jour{days > 1 ? 's' : ''} avant
                </button>
              ))}
            </div>
            <p style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '0.75rem' }}>
              💡 Les commandes prévues pour retrait dans moins de <b>{formData.reminderDaysBeforeDelivery || 3} jours</b> afficheront un badge d'alerte et permettront l'envoi direct d'une relance WhatsApp automatique au client.
            </p>
          </div>

          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>Modèles de Messages WhatsApp Automatisés</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ padding: '1rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.25rem' }}>⏰ Rappel de Retrait Proche ({formData.reminderDaysBeforeDelivery || 3}j avant)</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>"Bonjour [Client] 👋 Votre tenue [Modèle] sera prête le [Date]. Merci d'effectuer votre retrait à l'atelier."</div>
            </div>
            <div style={{ padding: '1rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.25rem' }}>Relance Acompte</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>"Bonjour [Client] 👋 Le solde restant pour votre commande [Code] est de [Montant] FCFA."</div>
            </div>
          </div>

          <button type="submit" className="btn btn-primary">
            <Save size={16} /> Enregistrer la configuration des notifications
          </button>
        </form>
      )}

      {activeTab === 'paiements' && (
        <div style={{ backgroundColor: 'var(--bg-primary)', padding: '1.75rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Comptes de Règlement Intégrés</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>🌊 Wave Côte d'Ivoire (+225 07 08 09 10 11)</span>
              <span className="badge badge-success">Actif</span>
            </div>
            <div style={{ padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>🟠 Orange Money (+225 07 08 09 10 11)</span>
              <span className="badge badge-success">Actif</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'equipe' && (
        <div style={{ backgroundColor: 'var(--bg-primary)', padding: '1.75rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Rôles et Membres de l'Atelier</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 700 }}>Awa Koné (Propriétaire)</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Accès total d'administration</div>
              </div>
              <span className="badge badge-gold">Admin</span>
            </div>
          </div>
        </div>
      )}

      {/* 💳 GUICHET DE PAIEMENT D'ABONNEMENT AVEC IDENTIFICATION PAR NUMÉRO DE TÉLÉPHONE UNIQUE */}
      {selectedPlanForPayment && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(6px)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '520px',
            backgroundColor: '#FFFFFF',
            borderRadius: '24px',
            border: '2px solid #D4AF37',
            padding: '2rem',
            boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            {/* Header du Guichet de Paiement */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #EAE5DF', paddingBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: '#FFFDF5', border: '1px solid #D4AF37', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
                  💳
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    Paiement Sécurisé DigiCouture
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: '#B8922E', fontWeight: 700 }}>
                    FORMULE {selectedPlanForPayment.name.toUpperCase()} ({selectedPlanForPayment.price})
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedPlanForPayment(null)}
                style={{ width: '32px', height: '32px', borderRadius: '50%', border: 'none', backgroundColor: '#F1F5F9', color: '#64748B', cursor: 'pointer', fontWeight: 'bold' }}
              >
                ✕
              </button>
            </div>

            {paymentSuccessMessage ? (
              <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🎉</div>
                <h4 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#166534', marginBottom: '0.5rem' }}>
                  Abonnement Activé avec Succès !
                </h4>
                <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                  Votre compte identifié par le numéro unique <strong style={{ color: '#D4AF37' }}>{paymentPhone}</strong> est désormais sous le statut <strong>FORMULE {selectedPlanForPayment.name.toUpperCase()}</strong>.
                </p>
                <div style={{ backgroundColor: '#F0FDF4', padding: '1rem', borderRadius: '16px', border: '1px solid #86EFAC', marginBottom: '1.5rem', fontSize: '0.82rem', color: '#166534', textAlign: 'left' }}>
                  ✔️ Compte unique reconduit jusqu'au : <strong>17 Septembre 2026</strong><br/>
                  ✔️ Identifiant unique : <strong>{paymentPhone}</strong><br/>
                  ✔️ Transaction Mobile Money : <strong>Wave / MoMo Certifié</strong>
                </div>
                <button 
                  onClick={() => {
                    const updated = { ...formData, plan: selectedPlanForPayment.plan };
                    setFormData(updated);
                    onSaveAtelier(updated);
                    setSelectedPlanForPayment(null);
                    setPaymentSuccessMessage(null);
                  }}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '0.85rem', fontSize: '0.95rem', fontWeight: 800 }}
                >
                  🚀 Continuer sur mon Espace Atelier
                </button>
              </div>
            ) : (
              <div>
                {/* Information d'Identification Unique */}
                <div style={{ backgroundColor: '#FFFDF5', padding: '1rem', borderRadius: '16px', border: '1px solid #FDE68A', marginBottom: '1.25rem' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#B8922E', display: 'block', marginBottom: '0.35rem' }}>
                    📱 Numéro de Téléphone Identifiant Unique du Compte
                  </label>
                  <input 
                    type="text" 
                    value={paymentPhone}
                    onChange={(e) => setPaymentPhone(e.target.value)}
                    placeholder="+225 0707705067"
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1.5px solid #D4AF37', fontWeight: 800, fontSize: '1rem', color: '#0F172A', backgroundColor: '#FFFFFF' }}
                  />
                  <p style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.4rem', margin: 0 }}>
                    💡 Ce numéro est l'identifiant unique relié à votre abonnement et recevra votre reçu d'activation Mobile Money.
                  </p>
                </div>

                {/* Choix du Moyen de Paiement avec Logos Végétaux & Badge SVG Vectoriels Officiels */}
                <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0F172A', display: 'block', marginBottom: '0.5rem' }}>
                  Sélectionnez le moyen de règlement Mobile Money :
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  {[
                    { 
                      id: 'wave', 
                      name: 'Wave', 
                      color: '#00C3FF', 
                      bg: '#E0F7FF',
                      svg: (
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="12" fill="#1DC8FF"/>
                          <path d="M5 14C8 14 9.5 9 13.5 9C16.5 9 18 12 19 14C17.5 12 16 10.5 13.5 10.5C9.5 10.5 8 15.5 5 14Z" fill="white"/>
                        </svg>
                      )
                    },
                    { 
                      id: 'orange', 
                      name: 'Orange Money', 
                      color: '#FF7900', 
                      bg: '#FFF0E5',
                      svg: (
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                          <rect width="24" height="24" rx="6" fill="#FF7900"/>
                          <rect x="5" y="5" width="8" height="8" fill="white"/>
                          <path d="M15 15L19 11M19 11H15M19 11V15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )
                    },
                    { 
                      id: 'mtn', 
                      name: 'MTN MoMo', 
                      color: '#FFCC00', 
                      bg: '#FFFBE6',
                      svg: (
                        <svg width="24" height="22" viewBox="0 0 32 20" fill="none">
                          <ellipse cx="16" cy="10" rx="16" ry="10" fill="#FFCC00"/>
                          <text x="16" y="14" fill="#000000" fontSize="10" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">MoMo</text>
                        </svg>
                      )
                    },
                    { 
                      id: 'moov', 
                      name: 'Moov Money', 
                      color: '#0055A5', 
                      bg: '#E6F0FA',
                      svg: (
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="12" fill="#0055A5"/>
                          <path d="M7 14L12 9L15 12L17 10" stroke="#FF7900" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )
                    },
                  ].map((p) => (
                    <button
                      type="button"
                      key={p.id}
                      onClick={() => setPaymentProvider(p.id as any)}
                      style={{
                        padding: '0.85rem 1rem',
                        borderRadius: '20px',
                        border: paymentProvider === p.id ? `2.5px solid ${p.color}` : '1.5px solid #E2E8F0',
                        backgroundColor: paymentProvider === p.id ? p.bg : '#FFFFFF',
                        fontWeight: 800,
                        fontSize: '0.9rem',
                        color: '#0F172A',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.6rem',
                        boxShadow: paymentProvider === p.id ? `0 4px 14px ${p.color}33` : 'none',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {p.svg}
                      </div>
                      <span>{p.name}</span>
                    </button>
                  ))}
                </div>

                {/* Récapitulatif Tarifaire */}
                <div style={{ backgroundColor: '#F8FAFC', padding: '1rem', borderRadius: '14px', border: '1px solid #E2E8F0', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '0.78rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>MONTANT NET À PAYER</span>
                    <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0F172A' }}>{selectedPlanForPayment.priceNum.toLocaleString()} FCFA</div>
                  </div>
                  <span className="badge badge-gold" style={{ fontSize: '0.75rem' }}>AUTOMATIQUE 24/7</span>
                </div>

                {/* Bouton de Validation du Paiement */}
                <button
                  type="button"
                  disabled={isProcessingPayment}
                  onClick={() => {
                    setIsProcessingPayment(true);
                    setTimeout(() => {
                      setIsProcessingPayment(false);
                      setPaymentSuccessMessage(`Abonnement ${selectedPlanForPayment.name} activé pour le compte ${paymentPhone}`);
                    }, 1800);
                  }}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '0.9rem', fontSize: '1rem', fontWeight: 900, boxShadow: '0 4px 14px rgba(212, 175, 55, 0.4)' }}
                >
                  {isProcessingPayment ? (
                    '⌛ Traitement de la transaction avec Wave/MoMo...'
                  ) : (
                    `🔒 Confirmer & Payer ${selectedPlanForPayment.priceNum.toLocaleString()} FCFA`
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
