import React from 'react';
import { ShieldAlert } from 'lucide-react';

export const PaiementsPage: React.FC = () => {
  return (
    <div style={{ padding: 32 }}>
      <div style={{ background: '#121216', border: '1px solid #24242A', borderRadius: 12, padding: 32, maxWidth: 540 }}>
        <ShieldAlert size={32} color="#D4AF37" style={{ marginBottom: 16 }} />
        <h2 style={{ color: '#F5F5F5', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
          Accès restreint — Espace Atelier Privé
        </h2>
        <p style={{ color: '#8B8B94', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
          Pour consulter la facturation des abonnements payés par les ateliers à DigiCouture VIP, veuillez vous rendre sur la page <strong>Paiements SaaS</strong>.
        </p>
      </div>
    </div>
  );
};
