import React, { useState } from 'react';
import type { Client, Measurements } from '../types';
import { BodyMeasurementDiagram } from './BodyMeasurementDiagram';
import { Search, Save, Check } from 'lucide-react';

interface StandaloneMeasurementsProps {
  clients: Client[];
  measurements: Record<string, Measurements>;
  onSaveMeasurements: (clientId: string, data: Partial<Measurements>) => void;
}

export const StandaloneMeasurements: React.FC<StandaloneMeasurementsProps> = ({
  clients,
  measurements,
  onSaveMeasurements
}) => {
  const [selectedClientId, setSelectedClientId] = useState<string>(clients[0]?.id || '');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Mannequin interactive state
  const [selectedBodyField, setSelectedBodyField] = useState<string | null>('poitrine');
  const [selectedBodyLabel, setSelectedBodyLabel] = useState<string>('Tour de Poitrine');
  const [fieldValueInput, setFieldValueInput] = useState<string>('');
  const [measureCategory, setMeasureCategory] = useState<'femme' | 'homme' | 'enfant'>('femme');
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  const selectedClient = clients.find(c => c.id === selectedClientId);
  const activeMeasurements = selectedClientId ? measurements[selectedClientId] : undefined;

  const filteredClients = clients.filter(c => 
    c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.whatsapp.includes(searchTerm)
  );

  const handleSelectFieldFromDiagram = (fieldName: string, label: string) => {
    setSelectedBodyField(fieldName);
    setSelectedBodyLabel(label);
    if (activeMeasurements) {
      const currentVal = (activeMeasurements as any)[fieldName];
      setFieldValueInput(currentVal ? String(currentVal) : '');
    } else {
      setFieldValueInput('');
    }
  };

  const handleSaveFieldValue = () => {
    if (!selectedClientId || !selectedBodyField) return;
    const num = parseFloat(fieldValueInput);
    if (isNaN(num)) return;

    onSaveMeasurements(selectedClientId, {
      category: measureCategory,
      [selectedBodyField]: num
    });

    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 2500);
  };

  return (
    <div className="animate-fade-in" style={{ padding: '1.25rem' }}>
      {/* Header Studio Mensurations */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Studio Mensurations Visuelles 📏
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Mannequin interactif 2D/3D pour relever et modifier les mesures précises en cm.
          </p>
        </div>

        {isSavedNotice && (
          <span className="badge badge-success" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
            <Check size={16} /> Mesure enregistrée avec succès !
          </span>
        )}
      </div>

      {/* Main Grid: Client Picker (Left) + Interactive Studio (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 320px) 1fr', gap: '1.5rem' }}>
        
        {/* Left Column: Select Client */}
        <div style={{
          backgroundColor: 'var(--bg-primary)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          padding: '1.25rem',
          height: 'fit-content'
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-main)' }}>
            Sélectionner un Client
          </h3>

          <div style={{ position: 'relative', marginBottom: '1rem' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text"
              placeholder="Chercher client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.55rem 0.75rem 0.55rem 2.2rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                fontSize: '0.85rem'
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '520px', overflowY: 'auto' }}>
            {filteredClients.map((client) => {
              const isSelected = client.id === selectedClientId;
              const hasMeas = Boolean(measurements[client.id]);

              return (
                <div
                  key={client.id}
                  onClick={() => setSelectedClientId(client.id)}
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: isSelected ? 'var(--gold-light)' : 'var(--bg-secondary)',
                    border: isSelected ? '1px solid var(--border-gold)' : '1px solid var(--border-color)',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'var(--transition)'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                      {client.fullName}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {client.whatsapp}
                    </div>
                  </div>

                  {hasMeas ? (
                    <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>Mesuré</span>
                  ) : (
                    <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>À mesurer</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Studio Silhouette Diagram */}
        {selectedClient ? (
          <div style={{
            backgroundColor: 'var(--bg-primary)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--gold-dark)', fontWeight: 700 }}>
                  CARNET DIGITAL DE MESURES
                </span>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  {selectedClient.fullName}
                </h3>
              </div>

              {/* Selector Genre Silhouette */}
              <div style={{ display: 'flex', gap: '0.4rem', backgroundColor: 'var(--bg-tertiary)', padding: '0.25rem', borderRadius: 'var(--radius-full)' }}>
                {(['femme', 'homme', 'enfant'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setMeasureCategory(cat)}
                    style={{
                      padding: '0.4rem 0.9rem',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      backgroundColor: measureCategory === cat ? 'var(--gold-primary)' : 'transparent',
                      color: measureCategory === cat ? '#FFFFFF' : 'var(--text-muted)',
                      textTransform: 'capitalize'
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 320px) 1fr', gap: '1.5rem' }}>
              {/* Mannequin SVG Diagram */}
              <BodyMeasurementDiagram 
                measurements={activeMeasurements || {}}
                onSelectField={handleSelectFieldFromDiagram}
                selectedField={selectedBodyField}
              />

              {/* Saisie Directe & Grille Synthétique des Mesures */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Formulaire d'édition jalon sélectionné */}
                {selectedBodyField ? (
                  <div style={{
                    padding: '1.25rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--gold-light)',
                    border: '1.5px solid var(--border-gold)'
                  }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--gold-dark)', marginBottom: '0.5rem' }}>
                      Saisie / Modification : {selectedBodyLabel}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input 
                        type="number"
                        placeholder="Valeur en cm (ex: 92)"
                        value={fieldValueInput}
                        onChange={(e) => setFieldValueInput(e.target.value)}
                        style={{
                          flex: 1,
                          padding: '0.65rem 0.85rem',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-color)',
                          fontSize: '1rem',
                          fontWeight: 700,
                          outline: 'none'
                        }}
                      />
                      <button 
                        onClick={handleSaveFieldValue}
                        className="btn btn-primary"
                        style={{ padding: '0.65rem 1.25rem' }}
                      >
                        <Save size={16} /> Valider cm
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                    👈 Cliquez sur un point rouge ou doré de la silhouette pour modifier sa mesure.
                  </div>
                )}

                {/* Grille synthétique toutes mesures en cm */}
                <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                  <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '0.75rem 1rem', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Mesures Enregistrées (cm)</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>Dernière maj : {activeMeasurements?.updatedAt || 'Aujourd\'hui'}</span>
                  </div>

                  <div style={{ padding: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', fontSize: '0.9rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '4px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Tour de Cou :</span>
                      <strong>{activeMeasurements?.tourCou ? `${activeMeasurements.tourCou} cm` : '-'}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '4px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Épaules :</span>
                      <strong>{activeMeasurements?.epaules ? `${activeMeasurements.epaules} cm` : '-'}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '4px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Poitrine :</span>
                      <strong>{activeMeasurements?.poitrine ? `${activeMeasurements.poitrine} cm` : '-'}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '4px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Sous-Poitrine :</span>
                      <strong>{activeMeasurements?.sousPoitrine ? `${activeMeasurements.sousPoitrine} cm` : '-'}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '4px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Tour de Bras :</span>
                      <strong>{activeMeasurements?.tourBras ? `${activeMeasurements.tourBras} cm` : '-'}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '4px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Longueur Manche :</span>
                      <strong>{activeMeasurements?.longueurManche ? `${activeMeasurements.longueurManche} cm` : '-'}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '4px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Tour de Taille :</span>
                      <strong>{activeMeasurements?.tourTaille ? `${activeMeasurements.tourTaille} cm` : '-'}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '4px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Tour de Hanches :</span>
                      <strong>{activeMeasurements?.tourHanche ? `${activeMeasurements.tourHanche} cm` : '-'}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '4px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Longueur Bas :</span>
                      <strong>{activeMeasurements?.longueurBas ? `${activeMeasurements.longueurBas} cm` : '-'}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '4px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Cuisse :</span>
                      <strong>{activeMeasurements?.cuisse ? `${activeMeasurements.cuisse} cm` : '-'}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '4px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Grand Boubou :</span>
                      <strong>{activeMeasurements?.longueurGrandBoubou ? `${activeMeasurements.longueurGrandBoubou} cm` : '-'}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '4px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Envergure Boubou :</span>
                      <strong>{activeMeasurements?.largeurEnvergureBoubou ? `${activeMeasurements.largeurEnvergureBoubou} cm` : '-'}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            Sélectionnez un client à gauche pour commencer sa prise de mesure sur le mannequin.
          </div>
        )}
      </div>
    </div>
  );
};
