import React, { useState } from 'react';
import type { Client, Measurements } from '../types';
import { BodyMeasurementDiagram } from './BodyMeasurementDiagram';
import { Search } from 'lucide-react';

interface ClientsManagerProps {
  clients: Client[];
  measurements: Record<string, Measurements>;
  onSaveMeasurements: (clientId: string, data: Partial<Measurements>) => void;
}

export const ClientsManager: React.FC<ClientsManagerProps> = ({
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
  };

  return (
    <div className="animate-fade-in" style={{ padding: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-main)' }}>Clients & Mensurations 👥</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Gérez vos clients et leur mannequin de mesures 2D/3D</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '1.5rem' }}>
        {/* Liste Clients à gauche */}
        <div style={{ backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', padding: '1.25rem' }}>
          <div style={{ position: 'relative', marginBottom: '1rem' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text"
              placeholder="Chercher client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '0.55rem 0.75rem 0.55rem 2.2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '500px', overflowY: 'auto' }}>
            {filteredClients.map((client) => {
              const isSelected = client.id === selectedClientId;
              return (
                <div
                  key={client.id}
                  onClick={() => setSelectedClientId(client.id)}
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: isSelected ? 'var(--gold-light)' : 'var(--bg-secondary)',
                    border: isSelected ? '1px solid var(--border-gold)' : '1px solid var(--border-color)',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>{client.fullName}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{client.whatsapp}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Studio Fiche Client & Mannequin à droite */}
        {selectedClient ? (
          <div style={{ backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', padding: '1.5rem' }}>
            {/* Header Fiche */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{selectedClient.fullName}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>WhatsApp : {selectedClient.whatsapp}</p>
              </div>

              {/* Category selector */}
              <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: 'var(--bg-tertiary)', padding: '0.25rem', borderRadius: 'var(--radius-full)' }}>
                {(['femme', 'homme', 'enfant'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setMeasureCategory(cat)}
                    style={{
                      padding: '0.4rem 0.85rem',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      backgroundColor: measureCategory === cat ? 'var(--gold-primary)' : 'transparent',
                      color: measureCategory === cat ? '#FFFFFF' : 'var(--text-muted)'
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Content Tab Studio */}
            <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1.5rem' }}>
              {/* Mannequin Diagram */}
              <BodyMeasurementDiagram 
                measurements={activeMeasurements || {}}
                onSelectField={handleSelectFieldFromDiagram}
                selectedField={selectedBodyField}
              />

              {/* Controls & Values */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {selectedBodyField ? (
                  <div style={{ padding: '1.25rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--gold-light)', border: '1px solid var(--border-gold)' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--gold-dark)', marginBottom: '0.5rem' }}>
                      Modifier : {selectedBodyLabel}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input 
                        type="number"
                        placeholder="cm"
                        value={fieldValueInput}
                        onChange={(e) => setFieldValueInput(e.target.value)}
                        style={{ flex: 1, padding: '0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontSize: '1rem', fontWeight: 700 }}
                      />
                      <button onClick={handleSaveFieldValue} className="btn btn-primary" style={{ padding: '0.6rem 1.25rem' }}>
                        Enregistrer
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    Cliquez sur un point du mannequin pour éditer la mesure.
                  </div>
                )}

                {/* Synthèse des Mesures */}
                <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem' }}>Mesures de {selectedClient.fullName} (cm)</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.85rem' }}>
                    <div>Épaules : <strong>{activeMeasurements?.epaules || '-'} cm</strong></div>
                    <div>Poitrine : <strong>{activeMeasurements?.poitrine || '-'} cm</strong></div>
                    <div>Tour Bras : <strong>{activeMeasurements?.tourBras || '-'} cm</strong></div>
                    <div>Longueur Manche : <strong>{activeMeasurements?.longueurManche || '-'} cm</strong></div>
                    <div>Tour Taille : <strong>{activeMeasurements?.tourTaille || '-'} cm</strong></div>
                    <div>Tour Hanches : <strong>{activeMeasurements?.tourHanche || '-'} cm</strong></div>
                    <div>Longueur Bas : <strong>{activeMeasurements?.longueurBas || '-'} cm</strong></div>
                    <div>Cuisse : <strong>{activeMeasurements?.cuisse || '-'} cm</strong></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
