import React, { useState } from 'react';
import type { Order } from '../types';
import { DiscoveryBanner } from './DiscoveryBanner';
import { 
  PlusCircle,
  Sparkles,
  Scissors,
  Crown,
  TrendingUp,
  Clock,
  Wallet,
  ArrowUpRight,
  CreditCard,
  Search,
  Eye,
  ShoppingBag
} from 'lucide-react';

interface DashboardProps {
  orders: Order[];
  onNavigateTab: (tab: string) => void;
  onOpenOrderDetails: (orderId: string) => void;
  atelierName?: string;
  userName?: string;
  atelierId?: string;
  atelierPlan?: string;
}

export const Dashboard: React.FC<DashboardProps> = ({
  orders,
  onNavigateTab,
  onOpenOrderDetails,
  atelierName = "Maison DigiCouture VIP",
  userName = "Maître Styliste",
  atelierId = "atl-default",
  atelierPlan = "pro"
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'toutes' | 'encours' | 'pretes' | 'livrees'>('toutes');

  const ongoingOrdersCount = orders.filter(o => o.status !== 'livree').length;
  const urgentOrdersCount = orders.filter(o => o.urgency === 'urgente' || o.urgency === 'tres_urgente').length;
  const totalAmountToCollect = orders.reduce((sum, o) => sum + Number(o.remainingAmount || 0), 0);
  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);

  return (
    <div className="animate-fade-in" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      
      {/* 🎁 BANNIÈRE D'INFORMATION DE DÉCOUVERTE DYNAMIQUE ET SÉCURISÉE */}
      <DiscoveryBanner
        atelierId={atelierId}
        atelierPlan={atelierPlan}
        onNavigateToSubscription={() => onNavigateTab('subscription')}
      />

      {/* 👑 HERO BANNIÈRE IMPÉRIALE NOIR & OR HAUTE COUTURE */}
      <div style={{
        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0B0B0D 100%)',
        borderRadius: '32px',
        padding: '2.5rem',
        border: '2px solid #D4AF37',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4), 0 0 30px rgba(212, 175, 55, 0.2)',
        color: '#FFFFFF',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Halo Lumineux Doré Impérial */}
        <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '350px', height: '350px', borderRadius: '175px', background: 'radial-gradient(circle, rgba(212,175,55,0.25) 0%, rgba(212,175,55,0) 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-100px', left: '-100px', width: '300px', height: '300px', borderRadius: '150px', background: 'radial-gradient(circle, rgba(212,175,55,0.15) 0%, rgba(212,175,55,0) 70%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.75rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', background: 'rgba(212, 175, 55, 0.12)', border: '1.5px solid #D4AF37', padding: '0.4rem 1rem', borderRadius: '9999px', marginBottom: '0.85rem', boxShadow: '0 4px 14px rgba(212,175,55,0.2)' }}>
              <Crown size={15} color="#D4AF37" />
              <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#D4AF37', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                {atelierName} • HAUTE COUTURE VIP
              </span>
            </div>
            <h1 style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: '2.5rem', fontWeight: 900, color: '#FFFFFF', margin: 0, letterSpacing: '-0.02em', lineHeight: 1.15 }}>
              Bonjour {userName} <span style={{ fontSize: '2rem' }}>✨</span>
            </h1>
            <p style={{ fontSize: '1rem', color: '#94A3B8', marginTop: '0.5rem', margin: 0, fontWeight: 600 }}>
              Pilotage exclusif de votre Maison de Couture & Suivi d'excellence de vos clients VIP.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              onClick={() => onNavigateTab('subscription')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.55rem',
                padding: '0.85rem 1.4rem',
                borderRadius: '16px',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                color: '#D4AF37',
                border: '1.5px solid #D4AF37',
                fontWeight: 800,
                fontSize: '0.9rem',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.3)',
                transition: 'all 0.2s ease'
              }}
            >
              <CreditCard size={18} color="#D4AF37" /> Mon Abonnement
            </button>

            <button
              onClick={() => onNavigateTab('new_order')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                padding: '0.95rem 1.85rem',
                borderRadius: '18px',
                background: 'linear-gradient(135deg, #D4AF37 0%, #B88E1E 100%)',
                color: '#FFFFFF',
                border: 'none',
                fontWeight: 900,
                fontSize: '1rem',
                cursor: 'pointer',
                boxShadow: '0 10px 30px rgba(212, 175, 55, 0.45)',
                transition: 'all 0.2s ease'
              }}
            >
              <PlusCircle size={22} color="#FFFFFF" /> + Nouvelle Commande VIP
            </button>
          </div>
        </div>

        {/* Séparateur Doré Élégant */}
        <div style={{ position: 'relative', margin: '2.25rem 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '100%', height: '1.5px', background: 'linear-gradient(90deg, rgba(212,175,55,0.1) 0%, rgba(212,175,55,0.8) 50%, rgba(212,175,55,0.1) 100%)' }} />
          <div style={{ position: 'absolute', backgroundColor: '#0F172A', border: '1.5px solid #D4AF37', color: '#D4AF37', padding: '3px 12px', borderRadius: '12px', fontSize: '10px', fontWeight: 900, letterSpacing: '2px' }}>
            👑 DIGICOUTURE
          </div>
        </div>

        {/* 4 KPIS NOIR & OR EXCLUSIFS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', position: 'relative', zIndex: 2 }}>
          
          {/* Card 1 : Commandes en Atelier */}
          <div style={{
            backgroundColor: '#1E293B',
            padding: '1.35rem',
            borderRadius: '22px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 6px 20px rgba(0,0,0,0.25)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                  COMMANDES EN ATELIER
                </span>
                <div style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Scissors size={18} color="#D4AF37" />
                </div>
              </div>
              <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#FFFFFF', lineHeight: 1 }}>
                {ongoingOrdersCount}
              </div>
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: '#4ADE80', fontWeight: 800, marginTop: '1rem', backgroundColor: 'rgba(74, 222, 128, 0.12)', border: '1px solid rgba(74, 222, 128, 0.25)', padding: '4px 10px', borderRadius: 8, width: 'fit-content' }}>
              <span>🧵 Confections actives</span>
            </div>
          </div>

          {/* Card 2 : Commandes Urgentes */}
          <div style={{
            backgroundColor: '#1E293B',
            padding: '1.35rem',
            borderRadius: '22px',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            boxShadow: '0 6px 20px rgba(245,158,11,0.15)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#F59E0B', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                  COMMANDES URGENTES
                </span>
                <div style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Clock size={18} color="#F59E0B" />
                </div>
              </div>
              <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#F59E0B', lineHeight: 1 }}>
                {urgentOrdersCount}
              </div>
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: '#F59E0B', fontWeight: 800, marginTop: '1rem', backgroundColor: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.25)', padding: '4px 10px', borderRadius: 8, width: 'fit-content' }}>
              <span>⏰ Livraisons prioritaires</span>
            </div>
          </div>

          {/* Card 3 : Reste à Encaisser */}
          <div style={{
            backgroundColor: '#1E293B',
            padding: '1.35rem',
            borderRadius: '22px',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            boxShadow: '0 6px 20px rgba(16,185,129,0.15)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#10B981', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                  RESTE À ENCAISSER
                </span>
                <div style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Wallet size={18} color="#10B981" />
                </div>
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#34D399', lineHeight: 1 }}>
                {totalAmountToCollect.toLocaleString('fr-FR')} FCFA
              </div>
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: '#34D399', fontWeight: 800, marginTop: '1rem', backgroundColor: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.25)', padding: '4px 10px', borderRadius: 8, width: 'fit-content' }}>
              <span>💰 Acomptes & soldes</span>
            </div>
          </div>

          {/* Card 4 : Chiffre d'Affaires */}
          <div style={{
            backgroundColor: 'rgba(212, 175, 55, 0.08)',
            padding: '1.35rem',
            borderRadius: '22px',
            border: '2px solid #D4AF37',
            boxShadow: '0 8px 25px rgba(212,175,55,0.25)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 900, color: '#D4AF37', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                  CHIFFRE D'AFFAIRES
                </span>
                <div style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(212,175,55,0.25)', border: '1px solid #D4AF37', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <TrendingUp size={18} color="#D4AF37" />
                </div>
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#D4AF37', lineHeight: 1 }}>
                {totalRevenue.toLocaleString('fr-FR')} FCFA
              </div>
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: '#D4AF37', fontWeight: 800, marginTop: '1rem', backgroundColor: 'rgba(212,175,55,0.15)', border: '1px solid #D4AF37', padding: '4px 10px', borderRadius: 8, width: 'fit-content' }}>
              <span>💎 Volume d'affaires global</span>
            </div>
          </div>

        </div>
      </div>

      {/* 🧵 AVANCEMENT DU TRAVAIL D'ATELIER */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '28px',
        padding: '2rem',
        border: '1.5px solid #EAE5DF',
        boxShadow: '0 8px 30px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#FFFDF5', border: '1px solid #D4AF37', padding: '0.25rem 0.75rem', borderRadius: '12px', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 900, color: '#B8922E', letterSpacing: '1px', textTransform: 'uppercase' }}>
                WORKFLOW & SUIVI PRODUCTION
              </span>
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0F172A', margin: 0, fontFamily: 'Georgia, "Times New Roman", serif' }}>
              Avancement du Travail d'Atelier 🧵
            </h2>
          </div>

          <button
            onClick={() => onNavigateTab('production')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: '#FFFDF5',
              border: '1.5px solid #D4AF37',
              color: '#B8922E',
              fontWeight: 800,
              padding: '0.55rem 1.1rem',
              borderRadius: '14px',
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Suivi des 8 Étapes →
          </button>
        </div>

        {/* Pipeline Lumineux des 4 Phares de Confection */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.25rem',
          position: 'relative'
        }}>

          {/* Étape 1 : Coupe & Tissu */}
          <div
            onClick={() => onNavigateTab('production')}
            style={{
              backgroundColor: '#FFFDF5',
              borderRadius: '22px',
              padding: '1.4rem 1.25rem',
              border: '1.5px solid #D4AF37',
              boxShadow: '0 4px 15px rgba(212, 175, 55, 0.12)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '20px',
              backgroundColor: '#FFFFFF',
              border: '2px solid #D4AF37',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.6rem',
              boxShadow: '0 4px 12px rgba(212, 175, 55, 0.2)',
              marginBottom: '0.75rem'
            }}>
              ✂️
            </div>

            <div style={{ fontSize: '2.1rem', fontWeight: 900, color: '#0F172A', lineHeight: 1 }}>
              {orders.filter(o => o.status === 'decoupe' || o.status === 'commande_recue' || o.status === 'mesures_prises').length}
            </div>

            <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0F172A', marginTop: '0.4rem' }}>
              Coupe / Tissu
            </div>

            <div style={{ fontSize: '0.72rem', color: '#B8922E', fontWeight: 800, marginTop: '0.4rem', backgroundColor: '#FFF7DC', padding: '3px 10px', borderRadius: '8px', border: '1px solid rgba(212,175,55,0.3)' }}>
              ✂️ En découpe
            </div>
          </div>

          {/* Étape 2 : En Assemblage */}
          <div
            onClick={() => onNavigateTab('production')}
            style={{
              backgroundColor: '#F8FAFC',
              borderRadius: '22px',
              padding: '1.4rem 1.25rem',
              border: '1.5px solid #3B82F6',
              boxShadow: '0 4px 15px rgba(59, 130, 246, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '20px',
              backgroundColor: '#EFF6FF',
              border: '2px solid #3B82F6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.6rem',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.18)',
              marginBottom: '0.75rem'
            }}>
              🧵
            </div>

            <div style={{ fontSize: '2.1rem', fontWeight: 900, color: '#1D4ED8', lineHeight: 1 }}>
              {orders.filter(o => o.status === 'couture' || o.status === 'finitions').length}
            </div>

            <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0F172A', marginTop: '0.4rem' }}>
              En Assemblage
            </div>

            <div style={{ fontSize: '0.72rem', color: '#1D4ED8', fontWeight: 800, marginTop: '0.4rem', backgroundColor: '#EFF6FF', padding: '3px 10px', borderRadius: '8px', border: '1px solid #BFDBFE' }}>
              🧵 En couture
            </div>
          </div>

          {/* Étape 3 : Essayages */}
          <div
            onClick={() => onNavigateTab('production')}
            style={{
              backgroundColor: '#FFFDF5',
              borderRadius: '22px',
              padding: '1.4rem 1.25rem',
              border: '1.5px solid #F59E0B',
              boxShadow: '0 4px 15px rgba(245, 158, 11, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '20px',
              backgroundColor: '#FFFBEB',
              border: '2px solid #F59E0B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.6rem',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.18)',
              marginBottom: '0.75rem'
            }}>
              💃
            </div>

            <div style={{ fontSize: '2.1rem', fontWeight: 900, color: '#D97706', lineHeight: 1 }}>
              {orders.filter(o => o.status === 'essayage').length}
            </div>

            <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0F172A', marginTop: '0.4rem' }}>
              Essayages
            </div>

            <div style={{ fontSize: '0.72rem', color: '#B45309', fontWeight: 800, marginTop: '0.4rem', backgroundColor: '#FFFBEB', padding: '3px 10px', borderRadius: '8px', border: '1px solid #FDE68A' }}>
              💃 RDV Client
            </div>
          </div>

          {/* Étape 4 : Prêtes / Finies */}
          <div
            onClick={() => onNavigateTab('production')}
            style={{
              backgroundColor: '#F0FDF4',
              borderRadius: '22px',
              padding: '1.4rem 1.25rem',
              border: '1.5px solid #10B981',
              boxShadow: '0 4px 15px rgba(16, 185, 129, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '20px',
              backgroundColor: '#FFFFFF',
              border: '2px solid #10B981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.6rem',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.18)',
              marginBottom: '0.75rem'
            }}>
              👑
            </div>

            <div style={{ fontSize: '2.1rem', fontWeight: 900, color: '#059669', lineHeight: 1 }}>
              {orders.filter(o => o.status === 'prete').length}
            </div>

            <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0F172A', marginTop: '0.4rem' }}>
              Prêtes / Finies
            </div>

            <div style={{ fontSize: '0.72rem', color: '#047857', fontWeight: 800, marginTop: '0.4rem', backgroundColor: '#DCFCE7', padding: '3px 10px', borderRadius: '8px', border: '1px solid #A7F3D0' }}>
              👑 Prêt à livrer
            </div>
          </div>

        </div>
      </div>

      {/* 🚀 ACTIONS RAPIDES DE LUXE DE L'ATELIER (AU-DESSUS DE LA LISTE DES COMMANDES) */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Sparkles size={20} color="#B8922E" />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A', margin: 0, fontFamily: 'Georgia, "Times New Roman", serif' }}>
            Actions Rapides de la Maison
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
          {[
            { title: 'Nouvelle Commande', desc: 'Saisie rapide en 3 étapes', icon: '📝', action: () => onNavigateTab('new_order'), accent: '#D4AF37' },
            { title: 'Clients & Mesures', desc: 'Fiches VIP & Silhouette', icon: '👤', action: () => onNavigateTab('clients'), accent: '#3B82F6' },
            { title: 'Suivi Production', desc: 'Gestion des 8 étapes', icon: '✂️', action: () => onNavigateTab('production'), accent: '#10B981' },
            { title: 'Centre Notifications', desc: 'WhatsApp, SMS & Rappels', icon: '🔔', action: () => onNavigateTab('notifications'), accent: '#8B5CF6' },
            { title: 'Caisse & Encaissements', desc: 'Wave, Orange & Espèces', icon: '💳', action: () => onNavigateTab('payments'), accent: '#F59E0B' },
            { title: 'Mon Abonnement', desc: 'Formules & Quotas', icon: '💎', action: () => onNavigateTab('subscription'), accent: '#EC4899' }
          ].map((act, idx) => (
            <div
              key={idx}
              onClick={act.action}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '24px',
                padding: '1.35rem',
                border: '1.5px solid #EAE5DF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.1rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '16px', backgroundColor: '#FFFDF5', border: "1.5px solid " + act.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                  {act.icon}
                </div>
                <div>
                  <div style={{ fontWeight: 900, fontSize: '0.95rem', color: '#0F172A' }}>{act.title}</div>
                  <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '2px' }}>{act.desc}</div>
                </div>
              </div>
              <ArrowUpRight size={18} color="#94A3B8" />
            </div>
          ))}
        </div>
      </div>

      {/* 📋 REGISTRE & LISTE DES COMMANDES DE L'ATELIER (EN DESSOUS DES ACTIONS RAPIDES) */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', padding: '1.75rem', border: '1.5px solid #EAE5DF', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 900, color: '#D4AF37', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
              ✦ SUIVI ET REGISTRE DES CONFECTIONS ✦
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'Georgia, "Times New Roman", serif' }}>
              <ShoppingBag size={22} color="#B8922E" /> Liste des Commandes d'Atelier
            </h2>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              onClick={() => onNavigateTab('new_order')}
              className="btn btn-primary"
              style={{ padding: '0.6rem 1.1rem', fontSize: '0.85rem', borderRadius: '12px', fontWeight: 900 }}
            >
              + Nouvelle Commande VIP
            </button>
          </div>
        </div>

        {/* Barre de Recherche et Filtres par Statut */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          <div style={{ flex: 1, minWidth: '260px', position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={18} color="#94A3B8" style={{ position: 'absolute', left: '14px' }} />
            <input 
              type="text"
              placeholder="Rechercher par client, code N° ou modèle..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.7rem 1rem 0.7rem 2.6rem',
                borderRadius: '12px',
                border: '1.5px solid #EAE5DF',
                fontSize: '0.88rem',
                fontWeight: 600,
                color: '#0F172A',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.4rem', backgroundColor: '#FAF8F5', padding: '4px', borderRadius: '14px', border: '1px solid #EAE5DF', flexWrap: 'wrap' }}>
            {[
              { id: 'toutes', label: 'Toutes (' + orders.length + ')' },
              { id: 'encours', label: 'En Cours (' + orders.filter(o => o.status !== 'livree').length + ')' },
              { id: 'pretes', label: 'Prêtes (' + orders.filter(o => o.status === 'prete').length + ')' },
              { id: 'livrees', label: 'Livrées (' + orders.filter(o => o.status === 'livree').length + ')' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id as any)}
                style={{
                  padding: '0.45rem 0.9rem',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: filterStatus === tab.id ? '#FFFDF5' : 'transparent',
                  color: filterStatus === tab.id ? '#B8922E' : '#64748B',
                  fontWeight: filterStatus === tab.id ? 900 : 700,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  boxShadow: filterStatus === tab.id ? '0 2px 8px rgba(212,175,55,0.2)' : 'none'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tableau / Grille des Commandes */}
        {orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem 1rem', backgroundColor: '#FFFDF5', borderRadius: '18px', border: '1.5px dashed #D4AF37' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>👗</div>
            <div style={{ fontWeight: 900, fontSize: '1.1rem', color: '#0F172A' }}>Aucune Commande Enregistrée</div>
            <p style={{ color: '#64748B', fontSize: '0.88rem', marginTop: '0.25rem' }}>
              Cliquez sur le bouton ci-dessus pour ajouter votre première commande sur-mesure.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#FAF8F5', borderBottom: '1.5px solid #EAE5DF', color: '#475569', fontWeight: 800 }}>
                  <th style={{ padding: '0.85rem 1rem', borderRadius: '10px 0 0 10px' }}>N° TICKET</th>
                  <th style={{ padding: '0.85rem 1rem' }}>CLIENT VIP</th>
                  <th style={{ padding: '0.85rem 1rem' }}>MODÈLE & TISSU</th>
                  <th style={{ padding: '0.85rem 1rem' }}>STATUT CONFECTION</th>
                  <th style={{ padding: '0.85rem 1rem' }}>LIVRAISON</th>
                  <th style={{ padding: '0.85rem 1rem' }}>FINANCE (FCFA)</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'right', borderRadius: '0 10px 10px 0' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {orders
                  .filter(o => {
                    const matchText = (o.code || o.orderNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                      (o.clientName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                      (o.modelName || '').toLowerCase().includes(searchTerm.toLowerCase());
                    if (!matchText) return false;
                    if (filterStatus === 'encours') return o.status !== 'livree';
                    if (filterStatus === 'pretes') return o.status === 'prete';
                    if (filterStatus === 'livrees') return o.status === 'livree';
                    return true;
                  })
                  .slice(0, 10)
                  .map((ord) => {
                    const isUrgent = ord.urgency === 'urgente' || ord.urgency === 'tres_urgente';
                    const remaining = Number(ord.remainingAmount || 0);

                    return (
                      <tr key={ord.id} style={{ borderBottom: '1px solid #F1F5F9', transition: 'background-color 0.15s ease' }}>
                        <td style={{ padding: '0.85rem 1rem', fontWeight: 900, color: '#D4AF37' }}>
                          {ord.code || ord.orderNumber || ord.id.slice(0, 8)}
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div style={{ fontWeight: 800, color: '#0F172A' }}>{ord.clientName}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{ord.clientWhatsapp || '—'}</div>
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div style={{ fontWeight: 700, color: '#1E293B' }}>{ord.modelName}</div>
                          <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{ord.fabricName || 'Tissu fourni'}</div>
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          {ord.status === 'livree' ? (
                            <span style={{ backgroundColor: '#FFFDF5', color: '#B8922E', border: '1px solid #D4AF37', padding: '0.25rem 0.65rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 900 }}>🎉 Livrée</span>
                          ) : ord.status === 'prete' ? (
                            <span style={{ backgroundColor: '#F0FDF4', color: '#166534', border: '1px solid #86EFAC', padding: '0.25rem 0.65rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 900 }}>🟢 Prête</span>
                          ) : (
                            <span style={{ backgroundColor: '#FFFDF5', color: '#B8922E', border: '1px solid #F5E8C7', padding: '0.25rem 0.65rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 900 }}>🟡 En Confection</span>
                          )}
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div style={{ fontWeight: 700, color: isUrgent ? '#DC2626' : '#475569' }}>
                            {ord.deliveryDate || '—'}
                          </div>
                          {isUrgent && (
                            <span style={{ backgroundColor: '#FEF2F2', color: '#DC2626', fontSize: '0.68rem', fontWeight: 900, padding: '1px 6px', borderRadius: '6px' }}>⚡ URGENT</span>
                          )}
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div style={{ fontWeight: 900, color: '#0F172A' }}>{Number(ord.totalAmount || 0).toLocaleString()} F</div>
                          {remaining > 0 ? (
                            <div style={{ fontSize: '0.75rem', color: '#DC2626', fontWeight: 800 }}>Reste : {remaining.toLocaleString()} F</div>
                          ) : (
                            <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 800 }}>✓ Soldé</div>
                          )}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                          <button
                            onClick={() => onOpenOrderDetails(ord.id)}
                            style={{
                              backgroundColor: '#FFFDF5',
                              border: '1.5px solid #D4AF37',
                              color: '#B8922E',
                              borderRadius: '10px',
                              padding: '0.4rem 0.85rem',
                              fontWeight: 900,
                              fontSize: '0.78rem',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <Eye size={14} /> Fiche / Reçu
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
