import React, { useState } from 'react';
import type { AtelierProfile, CatalogueItem } from '../types';
import { 
  Store, 
  MapPin, 
  Phone, 
  Clock, 
  Users, 
  QrCode,
  MessageSquare,
  Scissors
} from 'lucide-react';

interface AtelierShowcaseViewProps {
  atelier: AtelierProfile;
  catalogue: CatalogueItem[];
  onSendWhatsapp: (phone: string, text: string) => void;
  onNavigateToSettings: () => void;
}

export const AtelierShowcaseView: React.FC<AtelierShowcaseViewProps> = ({
  atelier,
  catalogue,
  onSendWhatsapp,
  onNavigateToSettings
}) => {
  const [showQrModal, setShowQrModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const atelierSlug = atelier.slug || atelier.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const publicUrl = `https://digicouture.app/atelier/${atelierSlug}`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(publicUrl)}&color=D4AF37`;

  const copyLinkToClipboard = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Équipe maîtres tailleurs de l'Atelier
  const teamMembers = atelier.ownerName ? [
    { name: atelier.ownerName, role: "Maître Styliste & Fondateur(rice)", status: "À l'Atelier", exp: "Gérant(e)" }
  ] : [];

  return (
    <div className="animate-fade-in" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      
      {/* 1. HERO BANNIÈRE DE LA MAISON DE COUTURE */}
      <div style={{
        position: 'relative',
        borderRadius: '28px',
        overflow: 'hidden',
        boxShadow: '0 12px 35px rgba(0,0,0,0.12)',
        border: '1.5px solid #EAE5DF',
        backgroundColor: '#0F172A'
      }}>
        {/* Image de couverture */}
        <div style={{
          height: '220px',
          backgroundImage: `linear-gradient(to bottom, rgba(15, 23, 42, 0.4), rgba(15, 23, 42, 0.9)), url(${atelier.coverUrl || 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1200&auto=format&fit=crop&q=80'})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }} />

        {/* Info atelier superposition */}
        <div style={{
          padding: '1.5rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          flexWrap: 'wrap',
          gap: '1.5rem',
          marginTop: '-60px'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1.5rem', flexWrap: 'wrap' }}>
            {/* Logo de l'Atelier */}
            <div style={{
              width: '100px',
              height: '100px',
              borderRadius: '24px',
              border: '4px solid #FFFFFF',
              backgroundColor: '#FFFFFF',
              boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {atelier.logoUrl ? (
                <img src={atelier.logoUrl} alt={atelier.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ background: 'var(--gold-gradient)', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF' }}>
                  <Scissors size={42} />
                </div>
              )}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#FFFFFF', margin: 0, fontFamily: 'var(--font-serif)' }}>
                  {atelier.name}
                </h1>
                <span className="badge badge-gold" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  💎 MAISON HAUTE COUTURE CERTIFIÉE
                </span>
              </div>
              <p style={{ color: '#94A3B8', fontSize: '0.95rem', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={16} color="#D4AF37" /> {atelier.address || 'Abidjan, Cocody Riviera 3'}, {atelier.city || 'Abidjan'}
              </p>
            </div>
          </div>

          {/* Boutons d'Action Rapide */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setShowQrModal(true)}
              style={{
                backgroundColor: '#FFFFFF',
                color: '#0F172A',
                border: 'none',
                padding: '0.75rem 1.25rem',
                borderRadius: '14px',
                fontSize: '0.88rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
            >
              <QrCode size={18} color="#D4AF37" /> QR Code Vitrine Client
            </button>

            <button
              onClick={onNavigateToSettings}
              style={{
                backgroundColor: '#D4AF37',
                color: '#FFFFFF',
                border: 'none',
                padding: '0.75rem 1.25rem',
                borderRadius: '14px',
                fontSize: '0.88rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 14px rgba(212, 175, 55, 0.4)'
              }}
            >
              Modifier la Fiche Atelier
            </button>
          </div>
        </div>
      </div>

      {/* 2. GRILLE D'INFORMATIONS DE LA MAISON DE COUTURE */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        
        {/* CARTE 1 : À Propos & Spécialités */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', padding: '1.75rem', border: '1px solid #EAE5DF', boxShadow: '0 4px 16px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '12px', backgroundColor: '#FFFDF5', border: '1px solid #D4AF37', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Store size={20} color="#B8922E" />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Présentation de la Maison
              </h3>
            </div>

            <p style={{ color: '#475569', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              {atelier.description || "Maison de Haute Couture spécialisée dans la confection sur mesure de tenues VIP, Boubous en Bazin Riche Brodé, Costumes de Cérémonie et Robes de Mariage Traditionnelles."}
            </p>

            <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.6rem' }}>
              ✦ Nos Spécialités Couture :
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {(atelier.specialties && atelier.specialties.length > 0 ? atelier.specialties : ['Bazin Riche VIP', 'Costumes Hommes', 'Robes de Mariée', 'Broderie Or', 'Sur Mesure']).map((spec, i) => (
                <span key={i} style={{ backgroundColor: '#FFFDF5', color: '#B8922E', border: '1px solid #FDE68A', padding: '0.4rem 0.85rem', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 700 }}>
                  ✨ {spec}
                </span>
              ))}
            </div>
          </div>

          <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '1rem', marginTop: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Propriétaire :</span>
            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0F172A' }}>{atelier.ownerName || 'Gérant(e)'}</span>
          </div>
        </div>

        {/* CARTE 2 : Horaires, Contact & WhatsApp Direct */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', padding: '1.75rem', border: '1px solid #EAE5DF', boxShadow: '0 4px 16px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '12px', backgroundColor: '#F0FDF4', border: '1px solid #25D366', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={20} color="#166534" />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Horaires & Contact Direct
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.25rem' }}>
              <div style={{ backgroundColor: '#F8FAFC', padding: '0.85rem 1rem', borderRadius: '14px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Clock size={18} color="#64748B" />
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>HORAIRES D'OUVERTURE</span>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0F172A' }}>{atelier.openingHours || 'Lun - Sam : 08h00 - 19h30'}</div>
                </div>
              </div>

              <div style={{ backgroundColor: '#F0FDF4', padding: '0.85rem 1rem', borderRadius: '14px', border: '1px solid #86EFAC', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Phone size={18} color="#166534" />
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#166534', fontWeight: 700, textTransform: 'uppercase' }}>LIGNE DIRECTE ATELIER</span>
                  <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#166534' }}>{atelier.whatsapp || '+225 07 07 70 50 67'}</div>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => onSendWhatsapp(atelier.whatsapp || '+2250707705067', `Bonjour ${atelier.name} 👋 Je vous contacte via votre vitrine d'atelier DigiCouture.`)}
            className="btn btn-whatsapp"
            style={{ width: '100%', padding: '0.85rem', fontWeight: 800, fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            <MessageSquare size={18} /> Discuter avec l'Atelier sur WhatsApp
          </button>
        </div>

        {/* CARTE 3 : Équipe des Maîtres Tailleurs & Apprentis */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', padding: '1.75rem', border: '1px solid #EAE5DF', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '12px', backgroundColor: '#F0FDF4', border: '1px solid #86EFAC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={20} color="#166534" />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Équipe de la Maison ({teamMembers.length})
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {teamMembers.map((member, idx) => (
              <div key={idx} style={{ padding: '0.75rem 1rem', borderRadius: '14px', backgroundColor: '#FAF8F5', border: '1px solid #EAE5DF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0F172A' }}>{member.name}</div>
                  <div style={{ fontSize: '0.78rem', color: '#B8922E', fontWeight: 600 }}>{member.role} • {member.exp}</div>
                </div>
                <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>{member.status}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 3. GALERIE VITRINE EXCLUSIVES DE L'ATELIER (DISTINCTION DU CATALOGUE PUBLIC) */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '28px', padding: '2rem', border: '1px solid #EAE5DF', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 900, color: '#D4AF37', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
              ✦ GALERIE DES CRÉATIONS EXCLUSIVES DE L'ATELIER ✦
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Le Savoir-Faire de la Maison {atelier.name}
            </h3>
          </div>
          <span className="badge badge-gold" style={{ fontSize: '0.8rem' }}>
            {catalogue.length} Créations Exposées
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
          {catalogue.map((item) => (
            <div key={item.id} style={{ borderRadius: '20px', overflow: 'hidden', border: '1px solid #EAE5DF', backgroundColor: '#FAF8F5' }}>
              <div style={{ height: '220px', width: '100%', position: 'relative', overflow: 'hidden' }}>
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(135deg, #1E293B, #0F172A)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#D4AF37',
                    padding: '1rem',
                    textAlign: 'center'
                  }}>
                    <span style={{ fontSize: '3rem', marginBottom: '0.4rem' }}>👗</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 900, color: '#FFFFFF' }}>{item.title}</span>
                  </div>
                )}
              </div>
              <div style={{ padding: '1rem' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#B8922E', backgroundColor: '#FFFDF5', border: '1px solid #FDE68A', padding: '0.2rem 0.6rem', borderRadius: '6px', textTransform: 'uppercase' }}>
                  {item.category}
                </span>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', marginTop: '0.5rem', marginBottom: '0.2rem' }}>{item.title}</h4>
                <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#D4AF37' }}>{item.estimatedPrice}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL POP-UP ACCÈS QR CODE ET LIEN CLIENT */}
      {showQrModal && (
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
            maxWidth: '440px',
            backgroundColor: '#FFFFFF',
            borderRadius: '24px',
            border: '2px solid #D4AF37',
            padding: '2rem',
            textAlign: 'center',
            boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A', marginBottom: '0.5rem' }}>
              📱 QR Code Vitrine Client Officiel
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '1.25rem' }}>
              Présentez ce QR Code dans votre atelier pour permettre à vos clients d'accéder à la vitrine officielle de <strong>{atelier.name}</strong>.
            </p>

            <div style={{ display: 'inline-block', padding: '1rem', borderRadius: '20px', backgroundColor: '#FFFDF5', border: '2px solid #D4AF37', marginBottom: '1.25rem' }}>
              <img src={qrImageUrl} alt="QR Code Atelier" style={{ width: '200px', height: '200px', borderRadius: '12px' }} />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={copyLinkToClipboard}
                className="btn btn-secondary"
                style={{ flex: 1, padding: '0.75rem', fontSize: '0.85rem', fontWeight: 800 }}
              >
                {copiedLink ? '✓ Lien Copié !' : 'Copier le Lien'}
              </button>
              <button
                onClick={() => setShowQrModal(false)}
                className="btn btn-primary"
                style={{ flex: 1, padding: '0.75rem', fontSize: '0.85rem', fontWeight: 800 }}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
