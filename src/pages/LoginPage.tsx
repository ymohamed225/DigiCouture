import React, { useState } from 'react';
import { WEST_AFRICAN_COUNTRIES } from '../components/LandingPage';
import { Scissors, ArrowLeft, ShieldCheck } from 'lucide-react';

interface LoginPageProps {
  onBack: () => void;
  onLoginWithPhone: (phone: string, otp?: string) => void;
  isDarkMode?: boolean;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onBack,
  onLoginWithPhone,
  isDarkMode = false
}) => {
  const [phoneInput, setPhoneInput] = useState('');
  const [countryCode, setCountryCode] = useState('+225');
  const [otpStep, setOtpStep] = useState<'phone' | 'otp'>('phone');
  const [otpValue, setOtpValue] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    const clean = phoneInput.replace(/[^0-9]/g, '');
    if (!clean) {
      alert('Veuillez saisir votre numéro WhatsApp.');
      return;
    }

    setLoading(true);
    const fullPhone = `${countryCode}${clean}`;

    try {
      const res = await fetch('http://localhost:5000/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fullPhone, isLogin: true })
      });
      const data = await res.json();

      if (data.success) {
        setOtpStep('otp');
        setLoading(false);
        return;
      }

      if (data.notRegistered || !data.success) {
        alert(`❌ ACCÈS REFUSÉ !\n\nCe numéro ne possède aucun compte DigiCouture.\n\nVeuillez contacter l'administrateur de votre atelier.`);
        setLoading(false);
        return;
      }
    } catch (e) {
      console.log('Mode fallback connexion offline');
    }

    // Local fallback check
    const savedAteliersJson = localStorage.getItem('dc_ateliers_list');
    const ateliersList: any[] = savedAteliersJson ? JSON.parse(savedAteliersJson) : [];
    const last8 = clean.slice(-8);

    const existingLocally = ateliersList.find(a => {
      const pClean = (a.phone || a.whatsapp || '').replace(/[^0-9]/g, '');
      return pClean.includes(last8) || (last8.length >= 6 && pClean.endsWith(last8));
    });

    if (existingLocally) {
      setOtpStep('otp');
    } else {
      alert(`❌ ACCÈS REFUSÉ !\n\nCe numéro ne possède aucun compte DigiCouture.\n\nVeuillez contacter l'administrateur de votre atelier.`);
    }
    setLoading(false);
  };

  const handleVerifyOtp = () => {
    onLoginWithPhone(`${countryCode}${phoneInput}`, otpValue);
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      backgroundColor: isDarkMode ? '#0B0B0D' : '#1E2530',
      backgroundImage: 'radial-gradient(circle at 50% 20%, rgba(212, 175, 55, 0.15) 0%, transparent 65%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
      fontFamily: 'var(--font-sans)'
    }}>
      
      {/* HEADER LOGO & RETOUR */}
      <div style={{
        width: '100%',
        maxWidth: '480px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.25rem'
      }}>
        <button
          onClick={onBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: 'rgba(255, 255, 255, 0.12)',
            backdropFilter: 'blur(10px)',
            color: '#FFFFFF',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            padding: '0.6rem 1.25rem',
            borderRadius: '9999px',
            fontSize: '0.9rem',
            fontWeight: 800,
            cursor: 'pointer'
          }}
        >
          <ArrowLeft size={18} /> ← Retour à l'Accueil
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'linear-gradient(135deg, #D4AF37 0%, #B8922E 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF' }}>
            <Scissors size={18} />
          </div>
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 900, color: '#FFFFFF' }}>
            Digi<span style={{ color: '#D4AF37' }}>Couture</span>
          </span>
        </div>
      </div>

      {/* CARTE NORMALE PAGE DE CONNEXION (PARITÉ EXACTE DE L'IMAGE) */}
      <div style={{
        width: '100%',
        maxWidth: '480px',
        backgroundColor: '#FFFFFF',
        borderRadius: '32px',
        border: '2.5px solid #D4AF37',
        boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
        padding: '2.5rem 2rem 2rem 2rem',
        textAlign: 'center'
      }}>
        {/* Médaillon Couronne VIP */}
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '36px',
          background: 'radial-gradient(circle at 35% 35%, #FFF6D6 0%, #E6C675 45%, #9E7D2B 85%, #664F19 100%)',
          margin: '0 auto 1rem auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '34px',
          boxShadow: '0 8px 20px rgba(212, 175, 55, 0.35)'
        }}>
          👑
        </div>

        {/* Titres En-tête */}
        <div style={{ fontSize: '0.78rem', fontWeight: 900, color: '#B8922E', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
          DIGICOUTURE HYBRIDE 👑
        </div>
        
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.85rem', fontWeight: 900, color: '#0F172A', margin: '0 0 0.5rem 0' }}>
          Bienvenue dans votre Atelier
        </h1>

        <p style={{ fontSize: '0.88rem', color: '#64748B', lineHeight: 1.5, margin: '0 0 1.25rem 0' }}>
          Gestion sur-mesure de vos clients, mesures et modèles de couture.
        </p>

        {/* Badges de Fonctionnalités */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          <div style={{ backgroundColor: '#FFFDF5', border: '1px solid #EAE5DF', borderRadius: '20px', padding: '0.4rem 0.85rem', fontSize: '0.8rem', fontWeight: 800, color: '#B8922E' }}>
            ✂️ Ciseaux
          </div>
          <div style={{ backgroundColor: '#FFFDF5', border: '1px solid #EAE5DF', borderRadius: '20px', padding: '0.4rem 0.85rem', fontSize: '0.8rem', fontWeight: 800, color: '#B8922E' }}>
            🧵 Couture
          </div>
          <div style={{ backgroundColor: '#FFFDF5', border: '1px solid #EAE5DF', borderRadius: '20px', padding: '0.4rem 0.85rem', fontSize: '0.8rem', fontWeight: 800, color: '#B8922E' }}>
            👗 Modèles
          </div>
        </div>

        {otpStep === 'phone' ? (
          /* ÉTAPE 1 : SAISIE DU NUMÉRO DE TÉLÉPHONE */
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', fontWeight: 900 }}>
              <span style={{ color: '#B8922E', letterSpacing: '0.5px' }}>📱 NUMÉRO DE TÉLÉPHONE MOBILE</span>
              <span style={{ color: '#94A3B8' }}>WHATSAPP SÉCURISÉ</span>
            </div>

            {/* Champ de Saisie avec Sélecteur d'Indicatif Épuré (ex: 🇨🇮 +225) */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '18px',
              border: '2px solid #D4AF37',
              display: 'flex',
              alignItems: 'center',
              overflow: 'hidden',
              boxShadow: '0 4px 14px rgba(212, 175, 55, 0.15)',
              boxSizing: 'border-box'
            }}>
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                style={{
                  backgroundColor: '#FFFDF5',
                  padding: '0.75rem 0.85rem',
                  border: 'none',
                  borderRight: '1.5px solid #D4AF37',
                  fontWeight: 900,
                  fontSize: '0.95rem',
                  color: '#0F172A',
                  cursor: 'pointer',
                  outline: 'none',
                  flexShrink: 0
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
                  minWidth: 0,
                  backgroundColor: '#FFFFFF',
                  padding: '0.75rem 1rem',
                  border: 'none',
                  outline: 'none',
                  fontWeight: 800,
                  fontSize: '1.1rem',
                  color: '#0F172A',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Bouton Pilule Or (Reproduction Exacte de l'Image) */}
            <button 
              onClick={handleSendOtp}
              disabled={loading}
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
                marginTop: '0.5rem',
                boxShadow: '0 8px 24px rgba(212, 175, 55, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.6rem',
                opacity: loading ? 0.7 : 1
              }}
            >
              🔑 {loading ? 'Envoi du code OTP...' : 'Se Connecter à l\'Atelier'}
            </button>
          </div>
        ) : (
          /* ÉTAPE 2 : SAISIE DU CODE OTP À 4 CHIFFRES */
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ backgroundColor: '#F0FDF4', padding: '1rem', borderRadius: '16px', border: '1.5px solid #86EFAC', textAlign: 'center' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#166534' }}>
                💬 Code OTP envoyé sur {countryCode} {phoneInput} !
              </span>
              <div style={{ fontSize: '0.78rem', color: '#15803D', marginTop: '4px' }}>
                Vérifiez vos messages WhatsApp et saisissez le code à 4 chiffres.
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 900, color: '#B8922E', letterSpacing: '1px', textTransform: 'uppercase' }}>
                🔑 CODE OTP (4 CHIFFRES)
              </label>
              <input 
                type="text"
                maxLength={4}
                value={otpValue}
                onChange={(e) => setOtpValue(e.target.value)}
                placeholder="1234"
                style={{
                  width: '100%',
                  backgroundColor: '#FFFDF5',
                  borderRadius: '16px',
                  padding: '0.9rem',
                  border: '2.5px solid #D4AF37',
                  fontWeight: 900,
                  fontSize: '1.75rem',
                  letterSpacing: '8px',
                  textAlign: 'center',
                  color: '#0F172A',
                  outline: 'none'
                }}
              />
            </div>

            <button 
              onClick={handleVerifyOtp}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '1.1rem',
                borderRadius: '9999px',
                fontWeight: 900,
                fontSize: '1rem',
                letterSpacing: '1px',
                marginTop: '0.5rem',
                boxShadow: '0 8px 24px rgba(212, 175, 55, 0.4)'
              }}
            >
              ✓ VALIDER ET ENTRER DANS L'ATELIER 🔑
            </button>

            <button 
              onClick={() => setOtpStep('phone')} 
              style={{ border: 'none', background: 'none', color: '#64748B', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem', marginTop: '0.2rem' }}
            >
              ← Changer de numéro de téléphone
            </button>
          </div>
        )}

        {/* Pied de Carte */}
        <div style={{ marginTop: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F1F5F9', paddingTop: '1rem' }}>
          <span style={{ fontSize: '0.75rem', color: '#B8922E', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ShieldCheck size={14} /> Session Haute Sécurité
          </span>
          <button onClick={onBack} style={{ border: 'none', background: 'none', color: '#64748B', fontWeight: 800, cursor: 'pointer', fontSize: '0.85rem' }}>
            ← Retour
          </button>
        </div>
      </div>
    </div>
  );
};
