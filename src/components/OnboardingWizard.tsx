import React, { useState } from 'react';
import type { AtelierProfile } from '../types';
import { ArrowRight, Scissors, ArrowLeft, CheckCircle } from 'lucide-react';

interface OnboardingWizardProps {
  onComplete: (atelierData: Partial<AtelierProfile>) => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onComplete }) => {
  const [step, setStep] = useState<number>(1);
  const [atelierName, setAtelierName] = useState<string>('');
  const [ownerName, setOwnerName] = useState<string>('');
  const [phoneRaw, setPhoneRaw] = useState<string>('');
  const [countryCode, setCountryCode] = useState<string>('+225');
  const [city, setCity] = useState<string>('Abidjan (Cocody)');
  const [regOtpInput, setRegOtpInput] = useState<string>('');

  const handleStep2Next = () => {
    const cleanReg = phoneRaw.replace(/[^0-9]/g, '');
    const last8 = cleanReg.slice(-8);

    if (!last8) {
      alert('Veuillez saisir votre numéro WhatsApp.');
      return;
    }

    // Vérification unicité locale localStorage ateliers
    const savedAteliersJson = localStorage.getItem('dc_ateliers_list');
    const ateliersList: any[] = savedAteliersJson ? JSON.parse(savedAteliersJson) : [];
    
    const existing = ateliersList.find(a => {
      const pClean = (a.phone || a.whatsapp || '').replace(/[^0-9]/g, '');
      return pClean.includes(last8) || (last8.length >= 6 && pClean.endsWith(last8));
    });

    if (existing) {
      alert(`⚠️ Numéro Déjà Enregistré !\n\nCe numéro est déjà associé à l'atelier "${existing.name || existing.ownerName}".\nChaque numéro possède un compte unique sur DigiCouture. Se connecter avec ce numéro.`);
      return;
    }

    setStep(3);
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg-secondary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem 1rem'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '520px',
        backgroundColor: '#FFFFFF',
        borderRadius: '24px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
        border: '1.5px solid #D4AF37',
        padding: '2.25rem',
        animation: 'fadeIn 0.3s ease-out'
      }}>
        {/* Header Progress */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '28px', background: 'var(--gold-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', margin: '0 auto 1rem auto', boxShadow: '0 6px 18px rgba(212, 175, 55, 0.3)' }}>
            <Scissors size={26} />
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#B8922E', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
            INSCRIPTION ATELIER (ÉTAPE {step}/3)
          </span>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '0.35rem', color: '#0F172A' }}>
            {step === 1 && '1. Votre Atelier & Propriétaire 🏪'}
            {step === 2 && '2. Contact & Localisation 📱'}
            {step === 3 && '3. Validation & Activation ✨'}
          </h2>
        </div>

        {/* ÉTAPE 1 : NOM ATELIER & PROPRIÉTAIRE */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem', color: '#334155' }}>
                Nom de votre Atelier de Couture *
              </label>
              <input 
                type="text"
                value={atelierName}
                onChange={(e) => setAtelierName(e.target.value)}
                placeholder="ex: Maison DigiCouture VIP"
                style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: '1.5px solid #EAE5DF', fontSize: '0.95rem', fontWeight: 600 }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem', color: '#334155' }}>
                Nom & Prénom du Propriétaire (Gérant) *
              </label>
              <input 
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="ex: Nom du Propriétaire"
                style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: '1.5px solid #EAE5DF', fontSize: '0.95rem', fontWeight: 600 }}
              />
            </div>
            <button onClick={() => setStep(2)} className="btn btn-primary" style={{ width: '100%', marginTop: '0.75rem', padding: '0.85rem', borderRadius: '14px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              SUIVANT (Étape 2) <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* ÉTAPE 2 : WHATSAPP AVEC BADGE INDICATIF + DRAPEAU & VILLE */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem', color: '#334155' }}>
                Numéro WhatsApp Officiel (Identifiant Unique) *
              </label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', backgroundColor: '#FAF8F5', padding: '5px', borderRadius: '14px', border: '1.5px solid #D4AF37' }}>
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  style={{
                    backgroundColor: '#FFFDF5',
                    border: '1px solid #D4AF37',
                    padding: '0.65rem 0.5rem',
                    borderRadius: '10px',
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    color: '#0F172A',
                    cursor: 'pointer',
                    outline: 'none'
                  }}
                >
                  <option value="+225">🇨🇮 +225</option>
                  <option value="+221">🇸🇳 +221</option>
                  <option value="+223">🇲🇱 +223</option>
                  <option value="+226">🇧🇫 +226</option>
                  <option value="+224">🇬🇳 +224</option>
                  <option value="+229">🇧🇯 +229</option>
                  <option value="+228">🇹🇬 +228</option>
                  <option value="+227">🇳🇪 +227</option>
                </select>
                <input 
                  type="text"
                  value={phoneRaw}
                  onChange={(e) => setPhoneRaw(e.target.value)}
                  placeholder="0707070700"
                  style={{ flex: 1, padding: '0.65rem', border: 'none', background: 'transparent', fontSize: '1rem', fontWeight: 700, color: '#0F172A', outline: 'none' }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem', color: '#334155' }}>
                Ville & Quartier de l'Atelier *
              </label>
              <input 
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="ex: Abidjan (Cocody Riviera 3)"
                style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: '1.5px solid #EAE5DF', fontSize: '0.95rem', fontWeight: 600 }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '0.5rem' }}>
              <button onClick={() => setStep(1)} style={{ flex: 1, padding: '0.85rem', borderRadius: '14px', border: 'none', backgroundColor: '#F1F5F9', color: '#64748B', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <ArrowLeft size={16} /> Retour
              </button>
              <button onClick={handleStep2Next} className="btn btn-primary" style={{ flex: 2, padding: '0.85rem', borderRadius: '14px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                SUIVANT (Étape 3) <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* ÉTAPE 3 : RÉSUMÉ & VALIDATION PAR CODE OTP WHATSAPP */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ padding: '1.25rem', backgroundColor: '#FFFDF5', borderRadius: '16px', border: '1.5px solid #D4AF37', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#B8922E', textTransform: 'uppercase', marginBottom: '4px' }}>
                📋 Résumé de votre Atelier :
              </div>
              <div style={{ fontSize: '0.95rem', color: '#0F172A' }}>🏪 <strong>Atelier :</strong> {atelierName}</div>
              <div style={{ fontSize: '0.95rem', color: '#0F172A' }}>👤 <strong>Gérant :</strong> {ownerName}</div>
              <div style={{ fontSize: '0.95rem', color: '#0F172A' }}>📱 <strong>Identifiant Unique :</strong> +225 {phoneRaw}</div>
              <div style={{ fontSize: '0.95rem', color: '#0F172A' }}>📍 <strong>Ville :</strong> {city}</div>
            </div>

            {/* Saisie du Code OTP reçu sur WhatsApp lors de la 1ère inscription */}
            <div style={{ backgroundColor: '#F0FDF4', padding: '1rem', borderRadius: '16px', border: '1px solid #86EFAC', textAlign: 'center' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#166534' }}>
                💬 Validation d'Inscription par WhatsApp
              </span>
              <p style={{ fontSize: '0.78rem', color: '#15803D', marginTop: '4px', margin: 0 }}>
                Un code secret à 4 chiffres est envoyé sur le WhatsApp <strong>+225 {phoneRaw}</strong>.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#B8922E', letterSpacing: '1px', textTransform: 'uppercase' }}>
                🔑 CODE OTP WHATSAPP (4 CHIFFRES) *
              </label>
              <input 
                type="text"
                maxLength={4}
                value={regOtpInput}
                onChange={(e) => setRegOtpInput(e.target.value)}
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

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setStep(2)} style={{ flex: 1, padding: '0.85rem', borderRadius: '14px', border: 'none', backgroundColor: '#F1F5F9', color: '#64748B', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <ArrowLeft size={16} /> Retour
              </button>
              <button 
                onClick={async () => {
                  const now = new Date();
                  const trialEnd = new Date();
                  trialEnd.setDate(now.getDate() + 30);

                  const fullPhone = `+225 ${phoneRaw}`;

                  // Déclenchement / Vérification de l'OTP WhatsApp
                  try {
                    const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');
                    const res = await fetch(`${API_BASE}/auth/send-otp`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ phone: fullPhone })
                    });
                    const data = await res.json();
                    if (data.whatsappMessage) {
                      const waUrl = `https://wa.me/+225${phoneRaw.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(data.whatsappMessage)}`;
                      window.open(waUrl, '_blank');
                    }
                  } catch (e) {
                    console.log('Mode OTP local');
                  }

                  const newAtelierObj = {
                    id: `atl-${Date.now()}`,
                    name: atelierName,
                    ownerName: ownerName,
                    whatsapp: fullPhone,
                    phone: fullPhone,
                    city: city,
                    address: `${city}, Abidjan`,
                    slug: atelierName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
                    plan: 'gratuit' as const,
                    registeredAt: now.toISOString().split('T')[0],
                    trialEndsAt: trialEnd.toISOString().split('T')[0]
                  };

                  // Enregistrement en base locale & MySQL
                  const saved = localStorage.getItem('dc_ateliers_list');
                  const list = saved ? JSON.parse(saved) : [];
                  list.unshift(newAtelierObj);
                  localStorage.setItem('dc_ateliers_list', JSON.stringify(list));

                  try {
                    const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');
                    await fetch(`${API_BASE}/ateliers`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(newAtelierObj)
                    });
                  } catch (e) {}

                  alert(`✅ INSCRIPTION WHATSAPP RÉUSSIE !\n\nBienvenue dans votre atelier "${atelierName}" !\nVous êtes directement connecté avec la Formule Gratuit.`);

                  onComplete(newAtelierObj);
                }} 
                style={{ flex: 2, padding: '0.85rem', borderRadius: '14px', border: 'none', backgroundColor: '#25D366', color: '#FFFFFF', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 6px 18px rgba(37, 211, 102, 0.25)' }}
              >
                <CheckCircle size={18} /> CONFIRMER L'OTP & S'INSCRIRE ✨
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
