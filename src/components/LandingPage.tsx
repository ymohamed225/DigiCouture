import React, { useState } from 'react';
import { 
  Scissors, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Ruler, 
  CreditCard, 
  MessageSquare, 
  Store, 
  Smartphone, 
  ChevronDown, 
  Check,
  HelpCircle
} from 'lucide-react';

interface LandingPageProps {
  onStartFree: () => void;
  onExploreDemo: () => void;
  onNavigateToLogin?: () => void;
  onLoginWithPhone?: (phone: string, otp?: string) => void;
  isDarkMode?: boolean;
}

export const WEST_AFRICAN_COUNTRIES = [
  { code: '+225', name: 'Côte d’Ivoire', flag: '🇨🇮' },
  { code: '+221', name: 'Sénégal', flag: '🇸🇳' },
  { code: '+223', name: 'Mali', flag: '🇲🇱' },
  { code: '+226', name: 'Burkina Faso', flag: '🇧🇫' },
  { code: '+224', name: 'Guinée', flag: '🇬🇳' },
  { code: '+229', name: 'Bénin', flag: '🇧🇯' },
  { code: '+228', name: 'Togo', flag: '🇹🇬' },
  { code: '+227', name: 'Niger', flag: '🇳🇪' }
];

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartFree,
  onExploreDemo,
  onNavigateToLogin,
  onLoginWithPhone,
  isDarkMode = false
}) => {
  const [faqOpenIndex, setFaqOpenIndex] = useState<number | null>(0);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');
  const [countryCode, setCountryCode] = useState('+225');
  const [otpStep, setOtpStep] = useState<'phone' | 'otp'>('phone');
  const [otpValue, setOtpValue] = useState('');

  const toggleFaq = (index: number) => {
    setFaqOpenIndex(faqOpenIndex === index ? null : index);
  };

  return (
    <div style={{ backgroundColor: isDarkMode ? '#0F172A' : '#FAF8F5', color: isDarkMode ? '#F8FAFC' : '#1E1B19', fontFamily: 'var(--font-sans)', overflowX: 'hidden', minHeight: '100vh', transition: 'all 0.3s ease' }}>
      
      {/* 1. TOP HEADER / NAVBAR (CoutureSO Style) */}
      <header style={{
        position: 'sticky',
        top: 0,
        backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.95)' : 'rgba(250, 248, 245, 0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: isDarkMode ? '1px solid #1E293B' : '1px solid #EAE5DF',
        zIndex: 100,
        padding: '1.1rem 1.5rem'
      }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={onExploreDemo}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #D4AF37 0%, #B8922E 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: '0 4px 14px rgba(212, 175, 55, 0.3)'
            }}>
              <Scissors size={22} />
            </div>
            <div>
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 800, color: '#151210', letterSpacing: '-0.02em' }}>
                Digi<span style={{ color: '#B8922E' }}>Couture</span>
              </span>
              <span style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.15em', color: '#8C827A', textTransform: 'uppercase' }}>
                BY DIGIPRO
              </span>
            </div>
          </div>

          {/* Navigation Links Desktop */}
          <nav style={{ display: 'flex', gap: '2rem', alignItems: 'center', fontSize: '0.9rem', fontWeight: 600, color: '#5C544C' }}>
            <a href="#fonctionnalites" style={{ color: 'inherit', textDecoration: 'none' }}>Fonctionnalités</a>
            <a href="#mannequin" style={{ color: 'inherit', textDecoration: 'none' }}>Mensurations</a>
            <a href="#whatsapp" style={{ color: 'inherit', textDecoration: 'none' }}>WhatsApp</a>
            <a href="#tarifs" style={{ color: 'inherit', textDecoration: 'none' }}>Tarifs</a>
            <a href="#faq" style={{ color: 'inherit', textDecoration: 'none' }}>FAQ</a>
          </nav>

          {/* Action CTAs exacts de l'image + Connexion Atelier */}
          <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>

            <button 
              onClick={onExploreDemo} 
              className="btn"
              style={{
                backgroundColor: 'transparent',
                color: '#151210',
                fontSize: '0.9rem',
                fontWeight: 700,
                border: '1.5px solid #EAE5DF',
                padding: '0.65rem 1.25rem',
                borderRadius: '9999px'
              }}
            >
              Mode Démo
            </button>

            <button 
              onClick={onStartFree} 
              className="btn btn-primary"
              style={{
                padding: '0.65rem 1.4rem',
                fontSize: '0.9rem',
                borderRadius: '9999px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              Créer mon atelier <ArrowRight size={16} />
            </button>

            <button 
              onClick={() => {
                if (onNavigateToLogin) onNavigateToLogin();
              }} 
              className="btn"
              style={{
                backgroundColor: '#FFFDF5',
                color: '#B8922E',
                fontSize: '0.9rem',
                fontWeight: 800,
                border: '1.5px solid #D4AF37',
                padding: '0.65rem 1.25rem',
                borderRadius: '9999px',
                boxShadow: '0 4px 12px rgba(212, 175, 55, 0.2)'
              }}
            >
              🔑 Connexion Atelier
            </button>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION (CoutureSO Styled Hero) */}
      <section style={{
        position: 'relative',
        padding: '5rem 1.5rem 6rem 1.5rem',
        textAlign: 'center',
        background: 'radial-gradient(80% 60% at 50% 0%, rgba(212, 175, 55, 0.12), transparent 70%), linear-gradient(180deg, #FFFBF6 0%, #FAF8F5 100%)'
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          
          {/* Eyebrow Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 1rem',
            borderRadius: '9999px',
            backgroundColor: 'rgba(212, 175, 55, 0.12)',
            color: '#B8922E',
            fontSize: '0.75rem',
            fontWeight: 800,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            marginBottom: '1.5rem',
            border: '1px solid rgba(212, 175, 55, 0.25)'
          }}>
            <Sparkles size={14} color="#B8922E" />
            Logiciel N°1 de Gestion d'Atelier de Couture · Afrique & Côte d'Ivoire
          </div>

          {/* Main Title */}
          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '3.6rem',
            fontWeight: 700,
            color: '#151210',
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            marginBottom: '1.5rem'
          }}>
            Tout votre atelier de couture, <br />
            <span style={{ fontStyle: 'italic', color: '#B8922E' }}>dans une seule application</span>.
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize: '1.2rem',
            color: '#5C544C',
            lineHeight: 1.65,
            maxWidth: '750px',
            margin: '0 auto 2.5rem auto'
          }}>
            Clients, mensurations visuelles, commandes, acomptes, suivi de production, rappels WhatsApp et boutique en ligne. Passez du carnet papier à un atelier ultra organisé et rentable.
          </p>

          {/* CTAs principaux */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
            <button 
              onClick={onStartFree} 
              className="btn btn-primary"
              style={{
                padding: '1rem 2.25rem',
                fontSize: '1.05rem',
                borderRadius: '14px',
                fontWeight: 700
              }}
            >
              Créer mon atelier gratuitement <ArrowRight size={18} />
            </button>

            <button 
              onClick={onExploreDemo} 
              className="btn btn-dark"
              style={{
                padding: '1rem 2rem',
                fontSize: '1.05rem',
                borderRadius: '14px'
              }}
            >
              Explorer l'application Démo
            </button>
          </div>

          {/* Section Téléchargements Mobile (App Store & Google Play) */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem', marginBottom: '3rem' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              {/* App Store Button */}
              <a
                href="#download-ios"
                onClick={(e) => { e.preventDefault(); alert("DigiCouture pour iOS est bientôt disponible sur l'App Store ! En attendant, profitez de la version web mobile sans installation."); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  backgroundColor: '#1E1B19',
                  color: '#FFFFFF',
                  padding: '0.7rem 1.5rem',
                  borderRadius: '16px',
                  textDecoration: 'none',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
                  transition: 'transform 0.2s, background-color 0.2s',
                  border: '1px solid #332E2B'
                }}
              >
                {/* Logo Apple */}
                <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.71c.64-.78 1.08-1.85.96-2.91-.93.04-2.06.62-2.73 1.4-.59.69-1.11 1.79-.97 2.86 1.04.08 2.1-.56 2.74-1.35z"/>
                </svg>
                <div style={{ textAlign: 'left', lineHeight: 1.15 }}>
                  <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.8, fontWeight: 700 }}>
                    Télécharger sur
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-sans)', marginTop: '2px' }}>
                    App Store
                  </div>
                </div>
              </a>

              {/* Google Play Button */}
              <a
                href="#download-android"
                onClick={(e) => { e.preventDefault(); alert("DigiCouture pour Android est disponible en version Web PWA ! Vous pouvez l'ajouter à votre écran d'accueil immédiatement."); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  backgroundColor: '#1E1B19',
                  color: '#FFFFFF',
                  padding: '0.7rem 1.5rem',
                  borderRadius: '16px',
                  textDecoration: 'none',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
                  transition: 'transform 0.2s, background-color 0.2s',
                  border: '1px solid #332E2B'
                }}
              >
                {/* Logo Google Play */}
                <svg width="24" height="24" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M3.609 1.814L13.792 12 3.61 22.185A2.3 2.3 0 0 1 3 20.556V3.444c0-.623.226-1.196.609-1.63z" />
                  <path fill="#FBBC04" d="M17.155 8.637l-3.363 3.363 3.363 3.363 3.792-2.155c.677-.385 1.053-.984 1.053-1.608 0-.624-.376-1.223-1.053-1.608l-3.792-2.355z" />
                  <path fill="#4285F4" d="M3.609 1.814L13.792 12l3.363-3.363L6.082.359C5.352-.075 4.417.065 3.609 1.814z" />
                  <path fill="#34A853" d="M3.61 22.185l10.182-10.185 3.363 3.363-11.073 8.278c-.808 1.749-1.743 1.889-2.472 1.455z" />
                </svg>
                <div style={{ textAlign: 'left', lineHeight: 1.15 }}>
                  <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.8, fontWeight: 700 }}>
                    Disponible sur
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-sans)', marginTop: '2px' }}>
                    Google Play
                  </div>
                </div>
              </a>
            </div>

            {/* Liens de bas de téléchargement */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.95rem', fontWeight: 700, color: '#151210' }}>
              <a href="#fonctionnalites" style={{ color: '#151210', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
                Voir toutes les fonctionnalités <ArrowRight size={16} />
              </a>
              <span style={{ color: '#D4AF37' }}>•</span>
              <a href="#faq" style={{ color: '#151210', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
                Conseils métier <ArrowRight size={16} />
              </a>
            </div>
          </div>

          {/* Key Value Points Badges */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '2rem',
            flexWrap: 'wrap',
            fontSize: '0.85rem',
            color: '#70665D',
            fontWeight: 600
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CheckCircle2 size={16} color="#059669" /> Sans carte bancaire
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CheckCircle2 size={16} color="#059669" /> Adapté au Mobile & WhatsApp
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CheckCircle2 size={16} color="#059669" /> Paiements Wave & Orange Money
            </span>
          </div>

        </div>

        {/* 3. HERO MOCKUP INTERFACE DISPLAY */}
        {/* 3. HERO MOCKUP INTERFACE DISPLAY (WEB + MOBILE EXPO - ALIGNEMENT HAUTEUR PARFAIT) */}
        <div style={{
          maxWidth: '1240px',
          margin: '4rem auto 0 auto',
          display: 'flex',
          alignItems: 'stretch',
          justifyContent: 'center',
          gap: '1.75rem',
          height: '560px',
          position: 'relative'
        }}>
          {/* Version Web Browser */}
          <div style={{
            flex: 1,
            height: '100%',
            borderRadius: '24px',
            border: '1px solid rgba(212, 175, 55, 0.4)',
            boxShadow: '0 30px 70px -15px rgba(212, 175, 55, 0.25)',
            backgroundColor: '#151210',
            padding: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxSizing: 'border-box'
          }}>
            <img 
              src="/digicouture_hero_app_1786838668525.jpg" 
              alt="DigiCouture Web Showcase" 
              style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '16px' }}
            />
          </div>

          {/* Version Mobile Smartphone */}
          <div style={{
            width: '280px',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxSizing: 'border-box'
          }}>
            <img 
              src="/digicouture_mobile_hero.png" 
              alt="DigiCouture Mobile Showcase" 
              style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 20px 30px rgba(0, 0, 0, 0.15))' }}
            />
          </div>
        </div>
      </section>

      {/* 4. STATS SECTION (Chiffres Clés Atelier - Luxueux Or & Onyx) */}
      <section style={{
        backgroundColor: '#0F172A',
        backgroundImage: 'linear-gradient(135deg, #0B0B0D 0%, #151210 50%, #1E1B18 100%)',
        color: '#FFFFFF',
        padding: '5rem 1.5rem',
        borderTop: '1px solid rgba(212, 175, 55, 0.35)',
        borderBottom: '1px solid rgba(212, 175, 55, 0.35)',
        boxShadow: 'inset 0 0 60px rgba(0,0,0,0.6)'
      }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem' }}>
          
          {/* Stat 1 */}
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(212, 175, 55, 0.25)',
            borderRadius: '24px',
            padding: '2rem 1.5rem',
            textAlign: 'center',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{
              display: 'inline-flex',
              padding: '6px 14px',
              borderRadius: '9999px',
              backgroundColor: 'rgba(212, 175, 55, 0.15)',
              color: '#D4AF37',
              fontSize: '0.72rem',
              fontWeight: 800,
              marginBottom: '1rem',
              border: '1px solid rgba(212, 175, 55, 0.3)'
            }}>
              📍 ABIDJAN & CÔTE D'IVOIRE
            </div>
            <div style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '3.6rem',
              fontWeight: 900,
              background: 'linear-gradient(135deg, #FEF08A 0%, #D4AF37 60%, #B8922E 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              lineHeight: 1.1
            }}>
              +850
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#F1F5F9', marginTop: '0.6rem' }}>
              Ateliers & Stylistes à Abidjan
            </div>
          </div>

          {/* Stat 2 */}
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(212, 175, 55, 0.25)',
            borderRadius: '24px',
            padding: '2rem 1.5rem',
            textAlign: 'center',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{
              display: 'inline-flex',
              padding: '6px 14px',
              borderRadius: '9999px',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              color: '#34D399',
              fontSize: '0.72rem',
              fontWeight: 800,
              marginBottom: '1rem',
              border: '1px solid rgba(52, 211, 153, 0.3)'
            }}>
              ⚡ ZÉRO ERREUR DE MESURE
            </div>
            <div style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '3.6rem',
              fontWeight: 900,
              background: 'linear-gradient(135deg, #FEF08A 0%, #D4AF37 60%, #B8922E 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              lineHeight: 1.1
            }}>
              0 %
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#F1F5F9', marginTop: '0.6rem' }}>
              D'oubli de mensuration ou retard
            </div>
          </div>

          {/* Stat 3 */}
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(212, 175, 55, 0.25)',
            borderRadius: '24px',
            padding: '2rem 1.5rem',
            textAlign: 'center',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{
              display: 'inline-flex',
              padding: '6px 14px',
              borderRadius: '9999px',
              backgroundColor: 'rgba(59, 130, 246, 0.15)',
              color: '#60A5FA',
              fontSize: '0.72rem',
              fontWeight: 800,
              marginBottom: '1rem',
              border: '1px solid rgba(96, 165, 250, 0.3)'
            }}>
              ⏱️ SAISIE ULTRA-RAPIDE
            </div>
            <div style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '3.6rem',
              fontWeight: 900,
              background: 'linear-gradient(135deg, #FEF08A 0%, #D4AF37 60%, #B8922E 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              lineHeight: 1.1
            }}>
              &lt; 2 min
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#F1F5F9', marginTop: '0.6rem' }}>
              Pour enregistrer une commande
            </div>
          </div>

          {/* Stat 4 */}
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(212, 175, 55, 0.25)',
            borderRadius: '24px',
            padding: '2rem 1.5rem',
            textAlign: 'center',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{
              display: 'inline-flex',
              padding: '6px 14px',
              borderRadius: '9999px',
              backgroundColor: 'rgba(168, 85, 247, 0.15)',
              color: '#C084FC',
              fontSize: '0.72rem',
              fontWeight: 800,
              marginBottom: '1rem',
              border: '1px solid rgba(192, 132, 252, 0.3)'
            }}>
              🛡️ WAVE & MOBILE MONEY
            </div>
            <div style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '3.6rem',
              fontWeight: 900,
              background: 'linear-gradient(135deg, #FEF08A 0%, #D4AF37 60%, #B8922E 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              lineHeight: 1.1
            }}>
              100 %
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#F1F5F9', marginTop: '0.6rem' }}>
              Paiements & Acomptes sécurisés
            </div>
          </div>

        </div>
      </section>

      {/* 5. VRAI PROBLÈME VS SOLUTION DIGICOUTURE HAUTE COUTURE */}
      <section style={{ padding: '6.5rem 1.5rem', maxWidth: '1240px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '4.5rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 1.1rem',
            borderRadius: '9999px',
            backgroundColor: 'rgba(212, 175, 55, 0.12)',
            color: '#B8922E',
            fontSize: '0.75rem',
            fontWeight: 800,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            marginBottom: '1.25rem',
            border: '1px solid rgba(212, 175, 55, 0.3)'
          }}>
            <Sparkles size={14} color="#B8922E" />
            COMPARAISON MÉTIER · ANCIEN VS DIGICOUTURE
          </div>

          <h2 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '3rem',
            fontWeight: 700,
            color: '#151210',
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
            margin: 0
          }}>
            Pourquoi remplacer votre carnet papier ?
          </h2>
          <p style={{ fontSize: '1.15rem', color: '#5C544C', marginTop: '0.75rem', maxWidth: '700px', margin: '0.75rem auto 0 auto', lineHeight: 1.6 }}>
            Passez d'un carnet physique vulnérable aux erreurs à une Maison de Couture Digitale ultra-performante et rentable.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2.5rem', alignItems: 'stretch' }}>
          
          {/* CARTE 1 : L'Ancien Carnet Papier */}
          <div style={{
            backgroundColor: '#FFF5F5',
            borderRadius: '28px',
            padding: '2.5rem',
            border: '1.5px solid #FECDD3',
            boxShadow: '0 10px 30px rgba(225, 29, 72, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1.5px dashed #FECDD3' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: '#FFE4E6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', border: '1px solid #FDA4AF' }}>
                    📖
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#991B1B', margin: 0 }}>
                      L'Ancien Carnet Papier
                    </h3>
                    <span style={{ fontSize: '0.78rem', color: '#BE123C', fontWeight: 600 }}>Méthode traditionnelle manuelle</span>
                  </div>
                </div>
                <span style={{ backgroundColor: '#FFE4E6', color: '#BE123C', fontWeight: 900, fontSize: '0.72rem', padding: '4px 10px', borderRadius: 8, border: '1px solid #FDA4AF' }}>
                  ❌ VULNÉRABLE
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', margin: '1.5rem 0' }}>
                {[
                  { icon: '📐', title: 'Notes de mesures illisibles', desc: 'Carnet perdu, chiffres effacés ou confusion entre clients.' },
                  { icon: '⏰', title: 'Retards de livraison & stress', desc: 'Gestion sans alertes, risque d’oubli des dates importantes.' },
                  { icon: '💸', title: 'Acomptes & restes oubliés', desc: 'Difficulté à suivre les montants perçus et les soldes dus.' },
                  { icon: '💬', title: 'Relances chaotiques', desc: 'Conversations WhatsApp dispersées sans récapitulatif clair.' },
                  { icon: '📊', title: 'Chiffre d’affaires inconnu', desc: 'Pas de vision globale sur la rentabilité réelle de l’atelier.' }
                ].map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '0.9rem', alignItems: 'flex-start' }}>
                    <div style={{ fontSize: '1.15rem', marginTop: 2 }}>{item.icon}</div>
                    <div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#991B1B' }}>{item.title}</div>
                      <div style={{ fontSize: '0.82rem', color: '#9F1239', marginTop: '2px', lineHeight: 1.4 }}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', padding: '1rem', borderRadius: '16px', backgroundColor: '#FFE4E6', border: '1px solid #FDA4AF', fontSize: '0.82rem', color: '#991B1B', fontWeight: 700, textAlign: 'center' }}>
              ⚠️ Risque élevé de retards clients & pertes d'acomptes
            </div>
          </div>

          {/* CARTE 2 : DigiCouture VIP (Sublimée Or & Émeraude) */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '28px',
            padding: '2.5rem',
            border: '2px solid #D4AF37',
            boxShadow: '0 20px 40px rgba(212, 175, 55, 0.18)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Badge de Recommandation */}
            <div style={{
              position: 'absolute',
              top: 0,
              right: 0,
              backgroundColor: '#D4AF37',
              color: '#FFFFFF',
              fontSize: '0.7rem',
              fontWeight: 900,
              padding: '6px 16px',
              borderBottomLeftRadius: '16px',
              letterSpacing: '1px',
              textTransform: 'uppercase'
            }}>
              👑 MAISON DE COUTURE
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1.5px solid #FEF08A' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: '#FFFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', border: '1.5px solid #D4AF37' }}>
                    👑
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                      Avec DigiCouture VIP
                    </h3>
                    <span style={{ fontSize: '0.78rem', color: '#B8922E', fontWeight: 700 }}>Solution Digitale 100% Réelle & Dynamique</span>
                  </div>
                </div>
                <span style={{ backgroundColor: '#ECFDF5', color: '#166534', fontWeight: 900, fontSize: '0.72rem', padding: '4px 10px', borderRadius: 8, border: '1px solid #A7F3D0' }}>
                  ✓ 100% SÉCURISÉ
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', margin: '1.5rem 0' }}>
                {[
                  { icon: '✨', title: 'Carnet de mensurations visuelles (Silhouette)', desc: 'Mannequin 2D/3D interactif et historique des mesures sauvegardé.' },
                  { icon: '🔔', title: 'Alertes intelligentes & Suivi 8 Étapes', desc: 'Gestion fluide du workflow (Coupe ➔ Couture 🧵 ➔ Essayage 💃 ➔ Prête).' },
                  { icon: '💰', title: 'Suivi strict des acomptes (Wave & Orange)', desc: 'Gestion de caisse exacte avec reçu PDF/PNG généré en 1-clic.' },
                  { icon: '📱', title: 'Relances WhatsApp & Suivi Client Direct', desc: 'Envoi instantané de messages préremplis et lien de suivi sans compte.' },
                  { icon: '📈', title: 'Tableau de bord financier en temps réel', desc: 'Vision précise sur le chiffre d’affaires et le reste à encaisser.' }
                ].map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '0.9rem', alignItems: 'flex-start' }}>
                    <div style={{ fontSize: '1.15rem', marginTop: 2 }}>{item.icon}</div>
                    <div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A' }}>{item.title}</div>
                      <div style={{ fontSize: '0.82rem', color: '#475569', marginTop: '2px', lineHeight: 1.4 }}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', padding: '1rem', borderRadius: '16px', backgroundColor: '#FFFDF5', border: '1.5px solid #D4AF37', fontSize: '0.85rem', color: '#B8922E', fontWeight: 800, textAlign: 'center', boxShadow: '0 4px 12px rgba(212,175,55,0.1)' }}>
              🏆 Sérénité totale, 0 oubli & rentabilité maximale
            </div>
          </div>

        </div>
      </section>

      {/* 6. LES MODULES ET FONCTIONNALITÉS (Grid Luxueux Détaillé) */}
      <section id="fonctionnalites" style={{ padding: '6.5rem 1.5rem', backgroundColor: '#FAFAF9', borderTop: '1px solid #EAE5DF' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4.5rem' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.4rem 1.1rem',
              borderRadius: '9999px',
              backgroundColor: 'rgba(212, 175, 55, 0.12)',
              color: '#B8922E',
              fontSize: '0.75rem',
              fontWeight: 800,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              marginBottom: '1.25rem',
              border: '1px solid rgba(212, 175, 55, 0.3)'
            }}>
              <Sparkles size={14} color="#B8922E" />
              FONCTIONNALITÉS MÉTIER EXCLUSIVES
            </div>

            <h2 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '3rem',
              fontWeight: 700,
              color: '#151210',
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
              margin: 0
            }}>
              Tout ce dont votre atelier a besoin au quotidien
            </h2>
            <p style={{ fontSize: '1.15rem', color: '#5C544C', marginTop: '0.75rem', maxWidth: '720px', margin: '0.75rem auto 0 auto', lineHeight: 1.6 }}>
              Des outils modernes spécialement conçus pour la Couture Sur-Mesure, le Bazin Riche, le Wax et la Haute Couture Africaine.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem' }}>
            
            {/* Feature 1 : Mensurations */}
            <div style={{
              padding: '2.25rem',
              borderRadius: '24px',
              backgroundColor: '#FFFFFF',
              border: '1.5px solid #E2E8F0',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.03)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', backgroundColor: '#D4AF37' }} />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                  <div style={{ width: '52px', height: '52px', borderRadius: '16px', backgroundColor: '#FFFDF5', border: '1.5px solid #FEF08A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D4AF37', boxShadow: '0 4px 12px rgba(212,175,55,0.15)' }}>
                    <Ruler size={26} color="#B8922E" />
                  </div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '4px 10px', borderRadius: '8px', backgroundColor: '#FFFDF5', color: '#B8922E', border: '1px solid #FEF08A' }}>
                    📐 SILHOUETTE 2D/3D
                  </span>
                </div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.65rem', color: '#0F172A' }}>
                  Mensurations Visuelles (Silhouette)
                </h3>
                <p style={{ color: '#475569', fontSize: '0.93rem', lineHeight: 1.6, margin: 0 }}>
                  Prise de mesures interactive sur mannequin visuel 2D/3D (Épaules, Poitrine, Hanches, Cuisse, Tour de taille) pour Femme, Homme et Enfant avec historique sauvegardé.
                </p>
              </div>
              <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #F1F5F9', fontSize: '0.8rem', color: '#64748B', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={15} color="#B8922E" />
                Historique des mesures réutilisable en 1-clic
              </div>
            </div>

            {/* Feature 2 : WhatsApp */}
            <div style={{
              padding: '2.25rem',
              borderRadius: '24px',
              backgroundColor: '#FFFFFF',
              border: '1.5px solid #E2E8F0',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.03)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', backgroundColor: '#10B981' }} />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                  <div style={{ width: '52px', height: '52px', borderRadius: '16px', backgroundColor: '#ECFDF5', border: '1.5px solid #A7F3D0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669', boxShadow: '0 4px 12px rgba(16,185,129,0.15)' }}>
                    <MessageSquare size={26} color="#059669" />
                  </div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '4px 10px', borderRadius: '8px', backgroundColor: '#ECFDF5', color: '#047857', border: '1px solid #A7F3D0' }}>
                    📲 WHATSAPP INSTANTANÉ
                  </span>
                </div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.65rem', color: '#0F172A' }}>
                  Relances WhatsApp 1-Clic
                </h3>
                <p style={{ color: '#475569', fontSize: '0.93rem', lineHeight: 1.6, margin: 0 }}>
                  Envoyez des messages préremplis ultra-professionnels pour confirmer une prise de commande, réclamer un acompte, fixer un essayage ou avertir d'une tenue prête.
                </p>
              </div>
              <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #F1F5F9', fontSize: '0.8rem', color: '#64748B', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={15} color="#059669" />
                Messages pré-rédigés & reçus PDF automatiques
              </div>
            </div>

            {/* Feature 3 : Catalogue Vitrine */}
            <div style={{
              padding: '2.25rem',
              borderRadius: '24px',
              backgroundColor: '#FFFFFF',
              border: '1.5px solid #E2E8F0',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.03)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', backgroundColor: '#2563EB' }} />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                  <div style={{ width: '52px', height: '52px', borderRadius: '16px', backgroundColor: '#EFF6FF', border: '1.5px solid #BFDBFE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB', boxShadow: '0 4px 12px rgba(37,99,235,0.15)' }}>
                    <Store size={26} color="#2563EB" />
                  </div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '4px 10px', borderRadius: '8px', backgroundColor: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE' }}>
                    🌐 VITRINE EN LIGNE
                  </span>
                </div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.65rem', color: '#0F172A' }}>
                  Catalogue Public & Vitrine Web
                </h3>
                <p style={{ color: '#475569', fontSize: '0.93rem', lineHeight: 1.6, margin: 0 }}>
                  Votre propre page vitrine professionnelle en ligne pour exposer vos créations d'exception (Bazin Riche, Wax, Robes de Mariée) et recevoir des commandes directes.
                </p>
              </div>
              <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #F1F5F9', fontSize: '0.8rem', color: '#64748B', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={15} color="#2563EB" />
                Lien web personnalisé pour vos réseaux sociaux
              </div>
            </div>

            {/* Feature 4 : Suivi Production 8 Étapes */}
            <div style={{
              padding: '2.25rem',
              borderRadius: '24px',
              backgroundColor: '#FFFFFF',
              border: '1.5px solid #E2E8F0',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.03)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', backgroundColor: '#D97706' }} />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                  <div style={{ width: '52px', height: '52px', borderRadius: '16px', backgroundColor: '#FEF3C7', border: '1.5px solid #FDE68A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D97706', boxShadow: '0 4px 12px rgba(217,119,6,0.15)' }}>
                    <Scissors size={26} color="#D97706" />
                  </div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '4px 10px', borderRadius: '8px', backgroundColor: '#FEF3C7', color: '#B45309', border: '1px solid #FDE68A' }}>
                    🧵 WORKFLOW ATELIER
                  </span>
                </div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.65rem', color: '#0F172A' }}>
                  Suivi de Production en 8 Étapes
                </h3>
                <p style={{ color: '#475569', fontSize: '0.93rem', lineHeight: 1.6, margin: 0 }}>
                  Suivez en temps réel chaque jalon d'atelier (Découpe Tissu ➔ Assemblage 🧵 ➔ Essayages 💃 ➔ Prête à Livrer) avec notifications d'urgence automatiques.
                </p>
              </div>
              <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #F1F5F9', fontSize: '0.8rem', color: '#64748B', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={15} color="#D97706" />
                Alertes de retard & livraisons prioritaires
              </div>
            </div>

            {/* Feature 5 : Caisse & Mobile Money */}
            <div style={{
              padding: '2.25rem',
              borderRadius: '24px',
              backgroundColor: '#FFFFFF',
              border: '1.5px solid #E2E8F0',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.03)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', backgroundColor: '#9333EA' }} />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                  <div style={{ width: '52px', height: '52px', borderRadius: '16px', backgroundColor: '#F3E8FF', border: '1.5px solid #E9D5FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9333EA', boxShadow: '0 4px 12px rgba(147,51,234,0.15)' }}>
                    <CreditCard size={26} color="#9333EA" />
                  </div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '4px 10px', borderRadius: '8px', backgroundColor: '#F3E8FF', color: '#7E22CE', border: '1px solid #E9D5FF' }}>
                    💳 CAISSE & MOBILE MONEY
                  </span>
                </div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.65rem', color: '#0F172A' }}>
                  Gestion de Caisse & Mobile Money
                </h3>
                <p style={{ color: '#475569', fontSize: '0.93rem', lineHeight: 1.6, margin: 0 }}>
                  Suivez vos paiements et acomptes en temps réel par Wave, Orange Money, MTN Mobile Money et Espèces. Calculez exactement le reste à encaisser global.
                </p>
              </div>
              <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #F1F5F9', fontSize: '0.8rem', color: '#64748B', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={15} color="#9333EA" />
                Rapprochement automatique & bilan d'atelier
              </div>
            </div>

            {/* Feature 6 : Lien de Suivi Direct */}
            <div style={{
              padding: '2.25rem',
              borderRadius: '24px',
              backgroundColor: '#FFFFFF',
              border: '1.5px solid #E2E8F0',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.03)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', backgroundColor: '#4F46E5' }} />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                  <div style={{ width: '52px', height: '52px', borderRadius: '16px', backgroundColor: '#EEF2FF', border: '1.5px solid #C7D2FE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4F46E5', boxShadow: '0 4px 12px rgba(79,70,229,0.15)' }}>
                    <Smartphone size={26} color="#4F46E5" />
                  </div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '4px 10px', borderRadius: '8px', backgroundColor: '#EEF2FF', color: '#3730A3', border: '1px solid #C7D2FE' }}>
                    📱 SUIVI CLIENT SANS COMPTE
                  </span>
                </div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.65rem', color: '#0F172A' }}>
                  Lien de Suivi Direct pour le Client
                </h3>
                <p style={{ color: '#475569', fontSize: '0.93rem', lineHeight: 1.6, margin: 0 }}>
                  Chaque client suit la confection de sa tenue en direct sur son téléphone via un lien sécurisé, sans avoir besoin de créer de compte ni de télécharger d'application.
                </p>
              </div>
              <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #F1F5F9', fontSize: '0.8rem', color: '#64748B', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={15} color="#4F46E5" />
                Transparence & réduction des appels répétitifs
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 7. TARIFS & ABONNEMENTS COMPLÈTEMENT CONFORMES À L'IMAGE CLIENT */}
      <section id="tarifs" style={{ padding: '6rem 1.5rem', backgroundColor: '#FAF8F5' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.8rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.5px' }}>
              Des offres adaptées à la taille de votre atelier
            </h2>
            <p style={{ color: '#64748B', fontSize: '1.1rem', marginTop: '0.6rem', fontWeight: 500 }}>
              Choisissez la formule qui correspond à votre rythme de commandes.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', alignItems: 'stretch' }}>
            
            {/* Plan 1 : Gratuit */}
            <div style={{
              padding: '2.25rem 1.75rem',
              borderRadius: '24px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #EAE5DF',
              boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 800, color: '#0F172A' }}>Gratuit</h3>
                <p style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '4px', marginBottom: '1.5rem' }}>Pour tester l'application</p>
                
                <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#0F172A', marginBottom: '1.5rem' }}>
                  0 FCFA <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#64748B' }}>/ mois</span>
                </div>

                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.88rem', color: '#334155', margin: '1.5rem 0' }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={16} color="#166534" /> <strong>20 commandes / 30j d'essai</strong></li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={16} color="#166534" /> Carnet de mesures de base</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={16} color="#166534" /> Support WhatsApp</li>
                </ul>
              </div>

              <button onClick={onStartFree} className="btn btn-secondary" style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', fontSize: '0.9rem', fontWeight: 800 }}>
                Tester Gratuitement
              </button>
            </div>

            {/* Plan 2 : Starter */}
            <div style={{
              padding: '2.25rem 1.75rem',
              borderRadius: '24px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #EAE5DF',
              boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 800, color: '#0F172A' }}>Starter</h3>
                <p style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '4px', marginBottom: '1.5rem' }}>Pour les couturiers indépendants</p>

                <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#0F172A', marginBottom: '1.5rem' }}>
                  2 000 FCFA <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#64748B' }}>/ mois</span>
                </div>

                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.88rem', color: '#334155', margin: '1.5rem 0' }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={16} color="#166534" /> <strong>Gestion complète des clients</strong></li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={16} color="#166534" /> Mensurations visuelles silhouette</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={16} color="#166534" /> Suivi des acomptes & caisse</li>
                </ul>
              </div>

              <button onClick={onStartFree} className="btn btn-secondary" style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', fontSize: '0.9rem', fontWeight: 800 }}>
                Choisir Starter
              </button>
            </div>

            {/* Plan 3 : Pro (Recommandé avec contour d'or) */}
            <div style={{
              padding: '2.25rem 1.75rem',
              borderRadius: '24px',
              backgroundColor: '#FFFFFF',
              border: '2.5px solid #D4AF37',
              boxShadow: '0 15px 40px rgba(212, 175, 55, 0.25)',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              {/* Badge Pilule Recommandé */}
              <div style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#FFFDF5', border: '1.5px solid #D4AF37', color: '#B8922E', padding: '0.3rem 0.9rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 900, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px' }}>
                📌 RECOMMANDÉ
              </div>

              <div>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 800, color: '#0F172A' }}>Pro</h3>
                <p style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '4px', marginBottom: '1.5rem' }}>Pour les ateliers actifs & stylistes</p>

                <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#D4AF37', marginBottom: '1.5rem' }}>
                  5 000 FCFA <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#64748B' }}>/ mois</span>
                </div>

                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.88rem', color: '#0F172A', margin: '1.5rem 0', fontWeight: 700 }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={16} color="#B8922E" /> <strong>Commandes illimitées</strong></li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={16} color="#B8922E" /> Site web Catalogue Public</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={16} color="#B8922E" /> Messages WhatsApp 1-clic</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={16} color="#B8922E" /> Suivi de production 8 étapes</li>
                </ul>
              </div>

              <button onClick={onStartFree} className="btn btn-primary" style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', fontSize: '0.9rem', fontWeight: 900, boxShadow: '0 6px 18px rgba(212, 175, 55, 0.35)' }}>
                Choisir Pro
              </button>
            </div>

            {/* Plan 4 : Atelier */}
            <div style={{
              padding: '2.25rem 1.75rem',
              borderRadius: '24px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #EAE5DF',
              boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 800, color: '#0F172A' }}>Atelier</h3>
                <p style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '4px', marginBottom: '1.5rem' }}>Pour les maisons de couture & équipes</p>

                <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#0F172A', marginBottom: '1.5rem' }}>
                  10 000 FCFA <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#64748B' }}>/ mois</span>
                </div>

                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.88rem', color: '#334155', margin: '1.5rem 0' }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={16} color="#166534" /> <strong>Multi-utilisateurs & Rôles</strong></li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={16} color="#166534" /> Rapports financiers avancés</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={16} color="#166534" /> Gestion d'équipe & des employés</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={16} color="#166534" /> Assistance prioritaire 24/7</li>
                </ul>
              </div>

              <button onClick={onStartFree} className="btn btn-secondary" style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', fontSize: '0.9rem', fontWeight: 800 }}>
                Choisir Atelier
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* 8. FAQ ACCORDEON (Foire Aux Questions Luxueuse) */}
      <section id="faq" style={{ padding: '6.5rem 1.5rem', backgroundColor: '#FAFAF9', borderTop: '1px solid #EAE5DF' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4.5rem' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.4rem 1.1rem',
              borderRadius: '9999px',
              backgroundColor: 'rgba(212, 175, 55, 0.12)',
              color: '#B8922E',
              fontSize: '0.75rem',
              fontWeight: 800,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              marginBottom: '1.25rem',
              border: '1px solid rgba(212, 175, 55, 0.3)'
            }}>
              <HelpCircle size={14} color="#B8922E" />
              TOUT CE QUE VOUS DEVEZ SAVOIR
            </div>

            <h2 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '3rem',
              fontWeight: 700,
              color: '#151210',
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
              margin: 0
            }}>
              Foire Aux Questions
            </h2>
            <p style={{ fontSize: '1.15rem', color: '#5C544C', marginTop: '0.75rem', maxWidth: '650px', margin: '0.75rem auto 0 auto', lineHeight: 1.6 }}>
              Retrouvez toutes les réponses aux questions fréquemment posées par les Couturiers, Stylistes et Maisons de Couture.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {[
              {
                badge: '📱 SIMPLICITÉ D\'UTILISATION',
                q: "Est-ce difficile à utiliser si je ne suis pas fort en informatique ?",
                a: "Absolument pas ! DigiCouture a été conçu sur une règle d'or : toute personne sachant envoyer un message vocal ou texte sur WhatsApp maîtrise DigiCouture dès la première minute. L'interface est intuitive et 100% visuelle."
              },
              {
                badge: '💬 RELANCES WHATSAPP',
                q: "Comment fonctionne l'intégration WhatsApp ?",
                a: "En un clic sur l'application, un message pré-rédigé professionnel (avec le nom du client, le statut de la tenue et le récapitulatif financier) s'ouvre directement dans votre application WhatsApp prêt à être envoyé."
              },
              {
                badge: '📲 COMPATIBILITÉ MOBILES & PC',
                q: "Puis-je l'utiliser sur mon téléphone portable ?",
                a: "Oui ! DigiCouture fonctionne parfaitement sur tous les smartphones (Android et iPhone) ainsi que sur ordinateur, tablette ou portable, en atelier ou en déplacement."
              },
              {
                badge: '🌐 EXPÉRIENCE CLIENT',
                q: "Mes clients doivent-ils télécharger l'application ?",
                a: "Non ! Vos clients reçoivent un simple lien web sécurisé par SMS ou WhatsApp leur permettant de consulter en direct l'avancement de leur tenue sans avoir besoin d'installer d'application ni de créer de compte."
              },
              {
                badge: '💳 PAIEMENTS & ABONNEMENTS',
                q: "Quels sont les moyens de paiement acceptés pour s'abonner ?",
                a: "Nous acceptons tous les moyens de paiement locaux et internationaux : Wave, Orange Money, MTN Mobile Money, Moov Money et cartes bancaires (Visa / Mastercard)."
              },
              {
                badge: '🔒 SÉCURITÉ & CONFIDENTIALITÉ',
                q: "Mes données de mensurations et de clients sont-elles en sécurité ?",
                a: "100% Sécurisées. Vos données d'atelier sont chiffrées, sauvegardées automatiquement chaque jour et restent votre propriété exclusive. Aucun concurrent n'a accès à vos mensurations ni à vos clients."
              }
            ].map((faq, index) => {
              const isOpen = faqOpenIndex === index;
              return (
                <div 
                  key={index}
                  onClick={() => toggleFaq(index)}
                  style={{
                    borderRadius: '20px',
                    border: isOpen ? '2px solid #D4AF37' : '1.5px solid #E2E8F0',
                    padding: '1.5rem 1.75rem',
                    backgroundColor: isOpen ? '#FFFDF5' : '#FFFFFF',
                    cursor: 'pointer',
                    boxShadow: isOpen ? '0 12px 25px rgba(212,175,55,0.12)' : '0 4px 12px rgba(0,0,0,0.02)',
                    transition: 'all 0.25s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <span style={{ fontSize: '0.68rem', fontWeight: 800, color: isOpen ? '#B8922E' : '#64748B', letterSpacing: '0.5px' }}>
                        {faq.badge}
                      </span>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: isOpen ? '#0F172A' : '#1E293B', margin: 0 }}>
                        {faq.q}
                      </h3>
                    </div>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      backgroundColor: isOpen ? '#D4AF37' : '#F1F5F9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      transition: 'all 0.25s ease'
                    }}>
                      <ChevronDown size={20} color={isOpen ? '#FFFFFF' : '#64748B'} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.25s' }} />
                    </div>
                  </div>

                  {isOpen && (
                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px dashed rgba(212, 175, 55, 0.3)' }}>
                      <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.65, margin: 0 }}>
                        {faq.a}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Callout Assistance WhatsApp Directe */}
          <div style={{
            marginTop: '3.5rem',
            padding: '2rem',
            borderRadius: '24px',
            backgroundColor: '#0F172A',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.5rem',
            flexWrap: 'wrap',
            boxShadow: '0 15px 35px rgba(15, 23, 42, 0.15)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '16px', backgroundColor: 'rgba(16, 185, 129, 0.2)', border: '1.5px solid #10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MessageSquare size={26} color="#10B981" />
              </div>
              <div>
                <h4 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#FFFFFF' }}>
                  Vous avez une question spécifique ?
                </h4>
                <p style={{ fontSize: '0.88rem', color: '#94A3B8', marginTop: '3px', margin: 0 }}>
                  Notre équipe d'assistance WhatsApp à Abidjan vous répond en moins de 5 minutes.
                </p>
              </div>
            </div>

            <a 
              href="https://wa.me/2250700000000?text=Bonjour,%20j'ai%20une%20question%20sur%20DigiCouture" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{
                backgroundColor: '#10B981',
                color: '#FFFFFF',
                padding: '0.75rem 1.5rem',
                borderRadius: '14px',
                fontWeight: 800,
                fontSize: '0.9rem',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
              }}
            >
              💬 Discuter sur WhatsApp
            </a>
          </div>

        </div>
      </section>

      {/* 9. FOOTER DE CONVERSION ET COPYRIGHT */}
      <footer style={{ backgroundColor: '#151210', color: '#FFFFFF', padding: '4rem 1.5rem 2rem 1.5rem', textTransform: 'none' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', textAlign: 'center' }}>
          
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', fontWeight: 700, marginBottom: '1rem' }}>
            Prêt à faire passer votre atelier au niveau supérieur ?
          </h2>
          <p style={{ color: '#A39990', fontSize: '1.05rem', marginBottom: '2rem' }}>
            Rejoignez des centaines de couturiers et stylistes à Abidjan.
          </p>

          <button 
            onClick={onStartFree} 
            className="btn btn-primary"
            style={{ padding: '1rem 2.5rem', fontSize: '1.05rem', borderRadius: '14px', margin: '0 auto 4rem auto' }}
          >
            Créer mon atelier gratuitement <ArrowRight size={18} />
          </button>

          <div style={{ borderTop: '1px solid #2B2520', paddingTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', fontSize: '0.85rem', color: '#8C827A' }}>
            <div>
              © 2026 <strong>DigiCouture</strong> by <strong>DigiPro</strong>. Tous droits réservés. Abidjan, Côte d'Ivoire 🇨🇮
            </div>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <a href="#top" style={{ color: 'inherit', textDecoration: 'none' }}>Retour en haut ↑</a>
            </div>
          </div>
        </div>
      </footer>

      {/* 👑 MODAL POP-UP DE CONNEXION ATELIER HAUTE COUTURE (IDENTIQUE COMPATIBLE MOBILE) */}
      {isLoginModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(10px)',
          zIndex: 200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div className="animate-fade-in" style={{
            width: '100%',
            maxWidth: '460px',
            backgroundColor: '#FFFFFF',
            borderRadius: '28px',
            padding: '2rem',
            boxShadow: '0 30px 70px rgba(0,0,0,0.4)',
            border: '2px solid #D4AF37',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center'
          }}>
            {/* Header & Logo Couronne Royale */}
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '32px',
              backgroundColor: '#FFFDF5',
              border: '2px solid #D4AF37',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              boxShadow: '0 6px 16px rgba(212, 175, 55, 0.3)',
              marginBottom: '1rem'
            }}>
              👑
            </div>

            <div style={{ fontSize: '0.78rem', fontWeight: 900, color: '#D4AF37', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
              DIGICOUTURE HYBRIDE 👑
            </div>

            <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0F172A', marginBottom: '0.35rem' }}>
              Bienvenue dans votre Atelier
            </h3>

            <p style={{ fontSize: '0.85rem', color: '#64748B', lineHeight: '1.4', marginBottom: '1.25rem' }}>
              Gestion sur-mesure de vos clients, mesures et modèles de couture.
            </p>

            {/* Badges d'icones de couture */}
            <div style={{ display: 'flex', gap: '0.65rem', marginBottom: '1.5rem' }}>
              <span style={{ backgroundColor: '#FFFDF5', padding: '0.35rem 0.75rem', borderRadius: '10px', border: '1px solid #D4AF37', fontSize: '0.78rem', fontWeight: 800, color: '#B8922E' }}>✂️ Ciseaux</span>
              <span style={{ backgroundColor: '#FFFDF5', padding: '0.35rem 0.75rem', borderRadius: '10px', border: '1px solid #D4AF37', fontSize: '0.78rem', fontWeight: 800, color: '#B8922E' }}>🧵 Couture</span>
              <span style={{ backgroundColor: '#FFFDF5', padding: '0.35rem 0.75rem', borderRadius: '10px', border: '1px solid #D4AF37', fontSize: '0.78rem', fontWeight: 800, color: '#B8922E' }}>👗 Modèles</span>
            </div>

            {/* ÉTAPE 1 : SAISIE DU NUMÉRO MOBILE & ENVOI OTP WHATSAPP */}
            {otpStep === 'phone' ? (
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', padding: '0 0.2rem' }}>
                  <span style={{ color: '#B8922E', letterSpacing: '1px' }}>📱 NUMÉRO DE TÉLÉPHONE MOBILE</span>
                  <span style={{ color: '#94A3B8' }}>WHATSAPP SÉCURISÉ</span>
                </div>

                <div style={{
                  backgroundColor: '#FAF8F5',
                  borderRadius: '16px',
                  padding: '6px',
                  border: '2px solid #D4AF37',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                }}>
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    style={{
                      backgroundColor: '#FFFDF5',
                      padding: '0.65rem 0.6rem',
                      borderRadius: '12px',
                      border: '1.5px solid #D4AF37',
                      fontWeight: 900,
                      fontSize: '0.9rem',
                      color: '#0F172A',
                      cursor: 'pointer',
                      outline: 'none'
                    }}
                  >
                    {WEST_AFRICAN_COUNTRIES.map(c => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.code}
                      </option>
                    ))}
                  </select>

                  <input 
                    type="tel"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    placeholder="0707070700"
                    style={{
                      flex: 1,
                      backgroundColor: '#FFFFFF',
                      borderRadius: '12px',
                      padding: '0.65rem 0.85rem',
                      border: '1px solid #EAE5DF',
                      fontWeight: 800,
                      fontSize: '1.1rem',
                      color: '#0F172A',
                      outline: 'none'
                    }}
                  />
                </div>

                <button 
                  onClick={async () => {
                    const clean = phoneInput.replace(/[^0-9]/g, '');
                    const last8 = clean.slice(-8);

                    if (!clean) {
                      alert('Veuillez saisir votre numéro WhatsApp.');
                      return;
                    }

                    // 1. Vérification locale de l'inscription préalable
                    const savedAteliersJson = localStorage.getItem('dc_ateliers_list');
                    const ateliersList: any[] = savedAteliersJson ? JSON.parse(savedAteliersJson) : [];
                    
                    const existingLocally = ateliersList.find(a => {
                      const pClean = (a.phone || a.whatsapp || '').replace(/[^0-9]/g, '');
                      return pClean.includes(last8) || (last8.length >= 6 && pClean.endsWith(last8));
                    });

                    // 2. Appel Backend avec le paramètre isLogin: true
                    try {
                      const res = await fetch('http://localhost:5000/api/auth/send-otp', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ phone: `${countryCode}${phoneInput}`, isLogin: true })
                      });
                      const data = await res.json();

                      if (data.success) {
                        setOtpStep('otp');
                        return;
                      }

                      if (data.notRegistered || !data.success) {
                        alert(`❌ ACCÈS REFUSÉ !\n\nCe numéro ne possède aucun compte DigiCouture.\n\nVeuillez contacter l'administrateur de votre atelier.`);
                        setIsLoginModalOpen(false);
                        return;
                      }
                    } catch (e) {
                      console.log('Vérification API offline', e);
                    }

                    if (existingLocally) {
                      setOtpStep('otp');
                    } else {
                      alert(`❌ ACCÈS REFUSÉ !\n\nCe numéro ne possède aucun compte DigiCouture.\n\nVeuillez contacter l'administrateur de votre atelier.`);
                      setIsLoginModalOpen(false);
                    }
                  }}
                  className="btn"
                  style={{
                    width: '100%',
                    padding: '1.1rem 1.6rem',
                    background: 'linear-gradient(135deg, #E6C675 0%, #D4AF37 45%, #B8922E 100%)',
                    color: '#FFFFFF',
                    border: '1px solid rgba(255, 255, 255, 0.4)',
                    borderRadius: '9999px',
                    fontWeight: 900,
                    fontSize: '1.05rem',
                    letterSpacing: '0.5px',
                    marginTop: '0.75rem',
                    boxShadow: '0 8px 24px rgba(212, 175, 55, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.6rem'
                  }}
                >
                  🔑 Se Connecter à l'Atelier
                </button>
              </div>
            ) : (
              /* ÉTAPE 2 : SAISIE DU CODE OTP À 4 CHIFFRES */
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div style={{ backgroundColor: '#F0FDF4', padding: '0.85rem', borderRadius: '14px', border: '1px solid #86EFAC', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#166534' }}>
                    💬 Code OTP de sécurité envoyé sur +225 {phoneInput} !
                  </span>
                  <div style={{ fontSize: '0.75rem', color: '#15803D', marginTop: '2px' }}>
                    Vérifiez vos messages WhatsApp et saisissez les 4 chiffres.
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#B8922E', letterSpacing: '1px', textTransform: 'uppercase' }}>
                    🔑 CODE OTP (4 CHIFFRES)
                  </label>
                  <input 
                    type="text"
                    maxLength={4}
                    value={otpValue}
                    onChange={(e) => setOtpValue(e.target.value)}
                    placeholder="ex: 8392"
                    style={{
                      width: '100%',
                      backgroundColor: '#FFFDF5',
                      borderRadius: '14px',
                      padding: '0.85rem',
                      border: '2px solid #D4AF37',
                      fontWeight: 900,
                      fontSize: '1.6rem',
                      letterSpacing: '8px',
                      textAlign: 'center',
                      color: '#0F172A',
                      outline: 'none'
                    }}
                  />
                </div>

                <button 
                  onClick={() => {
                    setIsLoginModalOpen(false);
                    setOtpStep('phone');
                    if (onLoginWithPhone) {
                      onLoginWithPhone(phoneInput, otpValue);
                    } else {
                      onExploreDemo();
                    }
                  }}
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    padding: '1rem',
                    borderRadius: '16px',
                    fontWeight: 900,
                    fontSize: '1rem',
                    letterSpacing: '1px',
                    marginTop: '0.5rem',
                    boxShadow: '0 6px 20px rgba(212, 175, 55, 0.4)'
                  }}
                >
                  ✓ VALIDER ET ENTRER DANS L'ATELIER 🔑
                </button>

                <button 
                  onClick={() => setOtpStep('phone')} 
                  style={{ border: 'none', background: 'none', color: '#64748B', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem', marginTop: '0.2rem' }}
                >
                  ← Changer de numéro de téléphone
                </button>
              </div>
            )}

            {/* Pied de Modal */}
            <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <span style={{ fontSize: '0.75rem', color: '#B8922E', fontWeight: 800 }}>🔒 Session Haute Sécurité</span>
              <button onClick={() => setIsLoginModalOpen(false)} style={{ border: 'none', background: 'none', color: '#64748B', fontWeight: 800, cursor: 'pointer', fontSize: '0.85rem' }}>✕ Fermer</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
