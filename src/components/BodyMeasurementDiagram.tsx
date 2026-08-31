import React from 'react';
import type { Measurements } from '../types';

interface BodyMeasurementDiagramProps {
  category?: 'femme' | 'homme' | 'enfant';
  measurements: Partial<Measurements>;
  onSelectField: (fieldName: string, label: string) => void;
  selectedField?: string | null;
}

export const BodyMeasurementDiagram: React.FC<BodyMeasurementDiagramProps> = ({
  measurements,
  onSelectField,
  selectedField
}) => {
  const isFieldSelected = (fieldName: string) => selectedField === fieldName;

  const getFieldColor = (fieldName: string) => {
    if (selectedField === fieldName) return '#D4AF37'; // Doré sélectionné
    const val = (measurements as any)[fieldName];
    if (val && val > 0) return '#059669'; // Vert mesuré
    return '#DC2626'; // Rouge à mesurer
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '1rem',
      backgroundColor: '#FAF8F5',
      borderRadius: '20px',
      border: '1px solid #EAE5DF'
    }}>
      <div style={{ position: 'relative', width: '200px', height: '340px' }}>
        <svg viewBox="0 0 200 340" style={{ width: '100%', height: '100%' }}>
          {/* SILHOUETTE ANATOMIQUE ANTHROPOMÉTRIQUE HAUTE COUTURE */}
          <g fill="none" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {/* Tête & Cou */}
            <circle cx="100" cy="35" r="16" fill="#F8FAFC" />
            <path d="M94 51 L94 62 L106 62 L106 51 Z" fill="#F8FAFC" />

            {/* Buste & Tronc */}
            <path d="M60 70 L94 62 L106 62 L140 70 L154 110 L146 115 L134 95 L130 135 L140 160 L144 185 L124 185 L100 170 L76 185 L56 185 L60 160 L70 135 L66 95 L54 115 L46 110 Z" fill="#F1F5F9" />

            {/* Bras & Avant-Bras */}
            <path d="M54 115 L36 162 L44 165 L60 120" fill="#F8FAFC" />
            <path d="M146 115 L164 162 L156 165 L140 120" fill="#F8FAFC" />

            {/* Jambes & Cuisses */}
            <path d="M76 185 L74 245 L76 310 L94 310 L92 245 L98 185 Z" fill="#F8FAFC" />
            <path d="M124 185 L126 245 L124 310 L106 310 L108 245 L102 185 Z" fill="#F8FAFC" />
          </g>

          {/* LIGNES DE REPERES POINTILLÉES */}
          <g stroke="#94A3B8" strokeWidth="1" strokeDasharray="3 3">
            <line x1="45" y1="70" x2="155" y2="70" />
            <line x1="55" y1="98" x2="145" y2="98" />
            <line x1="65" y1="130" x2="135" y2="130" />
            <line x1="55" y1="155" x2="145" y2="155" />
          </g>

          {/* HOTSPOTS INTERACTIFS (POINTS ROUGES / VERT / DORÉS) */}

          {/* 1. Tour de Cou */}
          <circle cx="100" cy="58" r={isFieldSelected('tourCou') ? "7" : "5"} fill={getFieldColor('tourCou')} stroke="#FFFFFF" strokeWidth="1.5" style={{ cursor: 'pointer' }} onClick={() => onSelectField('tourCou', 'Tour de Cou / Encolure')} />

          {/* 2. Épaules */}
          <circle cx="60" cy="70" r={isFieldSelected('epaules') ? "7" : "5"} fill={getFieldColor('epaules')} stroke="#FFFFFF" strokeWidth="1.5" style={{ cursor: 'pointer' }} onClick={() => onSelectField('epaules', 'Épaules')} />
          <circle cx="140" cy="70" r={isFieldSelected('epaules') ? "7" : "5"} fill={getFieldColor('epaules')} stroke="#FFFFFF" strokeWidth="1.5" style={{ cursor: 'pointer' }} onClick={() => onSelectField('epaules', 'Épaules')} />

          {/* 3. Poitrine */}
          <circle cx="100" cy="98" r={isFieldSelected('poitrine') ? "7" : "5"} fill={getFieldColor('poitrine')} stroke="#FFFFFF" strokeWidth="1.5" style={{ cursor: 'pointer' }} onClick={() => onSelectField('poitrine', 'Tour de Poitrine')} />

          {/* 4. Sous-Poitrine */}
          <circle cx="100" cy="112" r={isFieldSelected('sousPoitrine') ? "7" : "5"} fill={getFieldColor('sousPoitrine')} stroke="#FFFFFF" strokeWidth="1.5" style={{ cursor: 'pointer' }} onClick={() => onSelectField('sousPoitrine', 'Tour Sous-Poitrine')} />

          {/* 5. Tour de Bras */}
          <circle cx="50" cy="100" r={isFieldSelected('tourBras') ? "7" : "5"} fill={getFieldColor('tourBras')} stroke="#FFFFFF" strokeWidth="1.5" style={{ cursor: 'pointer' }} onClick={() => onSelectField('tourBras', 'Tour de Bras')} />
          <circle cx="150" cy="100" r={isFieldSelected('tourBras') ? "7" : "5"} fill={getFieldColor('tourBras')} stroke="#FFFFFF" strokeWidth="1.5" style={{ cursor: 'pointer' }} onClick={() => onSelectField('tourBras', 'Tour de Bras')} />

          {/* 6. Poignet & Manche */}
          <circle cx="38" cy="162" r={isFieldSelected('tourPoignet') ? "7" : "5"} fill={getFieldColor('tourPoignet')} stroke="#FFFFFF" strokeWidth="1.5" style={{ cursor: 'pointer' }} onClick={() => onSelectField('tourPoignet', 'Tour de Poignet')} />
          <circle cx="162" cy="162" r={isFieldSelected('longueurManche') ? "7" : "5"} fill={getFieldColor('longueurManche')} stroke="#FFFFFF" strokeWidth="1.5" style={{ cursor: 'pointer' }} onClick={() => onSelectField('longueurManche', 'Longueur Manche')} />

          {/* 7. Tour de Taille */}
          <circle cx="100" cy="130" r={isFieldSelected('tourTaille') ? "7" : "5"} fill={getFieldColor('tourTaille')} stroke="#FFFFFF" strokeWidth="1.5" style={{ cursor: 'pointer' }} onClick={() => onSelectField('tourTaille', 'Tour de Taille')} />

          {/* 8. Tour de Hanches */}
          <circle cx="100" cy="155" r={isFieldSelected('tourHanche') ? "7" : "5"} fill={getFieldColor('tourHanche')} stroke="#FFFFFF" strokeWidth="1.5" style={{ cursor: 'pointer' }} onClick={() => onSelectField('tourHanche', 'Tour de Hanches')} />

          {/* 9. Cuisse */}
          <circle cx="84" cy="210" r={isFieldSelected('cuisse') ? "7" : "5"} fill={getFieldColor('cuisse')} stroke="#FFFFFF" strokeWidth="1.5" style={{ cursor: 'pointer' }} onClick={() => onSelectField('cuisse', 'Tour de Cuisse')} />

          {/* 10. Tour de Genou */}
          <circle cx="84" cy="255" r={isFieldSelected('tourGenou') ? "7" : "5"} fill={getFieldColor('tourGenou')} stroke="#FFFFFF" strokeWidth="1.5" style={{ cursor: 'pointer' }} onClick={() => onSelectField('tourGenou', 'Tour de Genou')} />

          {/* 11. Tour de Cheville & Longueur Bas */}
          <circle cx="84" cy="305" r={isFieldSelected('tourCheville') ? "7" : "5"} fill={getFieldColor('tourCheville')} stroke="#FFFFFF" strokeWidth="1.5" style={{ cursor: 'pointer' }} onClick={() => onSelectField('tourCheville', 'Tour de Cheville')} />
          <circle cx="116" cy="305" r={isFieldSelected('longueurBas') ? "7" : "5"} fill={getFieldColor('longueurBas')} stroke="#FFFFFF" strokeWidth="1.5" style={{ cursor: 'pointer' }} onClick={() => onSelectField('longueurBas', 'Longueur Bas / Pantalon')} />
        </svg>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.75rem', fontWeight: 600 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#059669' }}></span> Mesuré
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#DC2626' }}></span> À mesurer
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#D4AF37' }}></span> Sélectionné
        </div>
      </div>
    </div>
  );
};
