import React, { useState } from 'react';
import type { Client, Measurements, Order } from '../types';
import { 
  Search, 
  Plus, 
  Phone, 
  MapPin, 
  MessageSquare, 
  DollarSign, 
  ShoppingBag,
  Grid,
  List,
  Eye
} from 'lucide-react';

interface DedicatedClientsViewProps {
  clients: Client[];
  measurements: Record<string, Measurements>;
  orders: Order[];
  onSaveClient: (client: Partial<Client>) => void;
  onSendWhatsapp: (phone: string, text: string) => void;
}

export const DedicatedClientsView: React.FC<DedicatedClientsViewProps> = ({
  clients,
  measurements,
  orders,
  onSaveClient,
  onSendWhatsapp
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [isClientLoading, setIsClientLoading] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<{ url: string; title: string } | null>(null);

  const handleOpenClientDetails = (clientId: string) => {
    setSelectedClientId(clientId);
    setIsClientLoading(true);
    setTimeout(() => {
      setIsClientLoading(false);
    }, 900);
  };

  // Formulaire d'ajout client
  const [fullNameInput, setFullNameInput] = useState('');
  const [whatsappInput, setWhatsappInput] = useState('');
  const [addressInput, setAddressInput] = useState('');

  const filteredClients = clients.filter(c => 
    c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.whatsapp.includes(searchTerm) ||
    (c.address && c.address.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const selectedClient = clients.find(c => c.id === selectedClientId);
  const selectedClientMeasurements = selectedClientId ? measurements[selectedClientId] : undefined;
  const selectedClientOrders = orders.filter(o => o.clientId === selectedClientId);
  const selectedClientTotalSpend = selectedClientOrders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);

  const handleCreateClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullNameInput || !whatsappInput) return;

    onSaveClient({
      fullName: fullNameInput,
      whatsapp: whatsappInput,
      address: addressInput
    });

    setFullNameInput('');
    setWhatsappInput('');
    setAddressInput('');
    setIsAddModalOpen(false);
  };

  // =========================================================================
  // PAGE DÉDIÉE : FICHE CLIENT SPÉCIFIQUE (QUAND ON CLIQUE SUR "VOIR FICHE")
  // =========================================================================
  if (selectedClientId && selectedClient) {
    return (
      <div className="animate-fade-in" style={{ padding: '1.25rem' }}>
        
        {/* BOUTON DE RETOUR À LA LISTE DES CLIENTS */}
        <button 
          onClick={() => setSelectedClientId(null)}
          className="btn btn-secondary"
          style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800 }}
        >
          ← Retour à l'Annuaire Clients
        </button>

        {isClientLoading ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4rem 2rem',
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            border: '1px solid var(--border-color)',
            gap: '1.25rem'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '40px',
              backgroundColor: '#FFFDF5',
              border: '2px solid var(--gold-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 30px rgba(212, 175, 55, 0.3)'
            }}>
              <span style={{ fontSize: '2.5rem' }}>✂️</span>
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: 900, color: '#D4AF37', letterSpacing: '2px', textTransform: 'uppercase' }}>
              ✦ CHARGEMENT DE LA FICHE CLIENT... ✦
            </div>
          </div>
        ) : (
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            padding: '1.75rem',
            boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
            border: '1.5px solid var(--gold-primary)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Header Fiche Client Haute Couture Pleine Page */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1.5px solid var(--gold-primary)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <div style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  backgroundImage: selectedClient.avatarUrl ? `url(${selectedClient.avatarUrl})` : 'none',
                  backgroundColor: 'var(--gold-light)',
                  backgroundSize: 'cover',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.4rem',
                  fontWeight: 800,
                  color: 'var(--gold-dark)',
                  border: '2px solid var(--gold-primary)',
                  boxShadow: 'var(--gold-glow)',
                  flexShrink: 0
                }}>
                  {!selectedClient.avatarUrl && selectedClient.fullName.charAt(0)}
                </div>

                <div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--gold-dark)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    👤 CLIENT • REGISTRE DE L'ATELIER
                  </span>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>
                    👤 {selectedClient.fullName}
                  </h3>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', gap: '1.25rem', marginTop: '4px', flexWrap: 'wrap' }}>
                    <span>📱 <strong>WhatsApp :</strong> {selectedClient.whatsapp}</span>
                    {selectedClient.address && <span>📍 <strong>Adresse :</strong> {selectedClient.address}</span>}
                    <span style={{ color: 'var(--gold-dark)', fontWeight: 800 }}>📋 <strong>Commandes :</strong> {selectedClientOrders.length}</span>
                    <span style={{ color: 'var(--gold-dark)', fontWeight: 800 }}>💰 <strong>Total :</strong> {selectedClientTotalSpend.toLocaleString()} FCFA</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setSelectedClientId(null)}
                className="btn btn-secondary"
                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
              >
                ← Retour
              </button>
            </div>

            {/* Section 1 : Carnet des Mensurations Relevées */}
            <div style={{ marginBottom: '1.25rem', backgroundColor: '#FAF8F5', padding: '1.1rem', borderRadius: '16px', border: '1px solid #EAE5DF' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--gold-dark)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                  📏 Relevé des Mensurations (cm)
                </h4>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Dernière mise à jour : {selectedClientMeasurements?.updatedAt || 'Récemment'}</span>
              </div>

              {selectedClientMeasurements ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.65rem', fontSize: '0.85rem' }}>
                  <div style={{ backgroundColor: '#FFFFFF', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Épaules :</span>
                    <strong>{selectedClientMeasurements.epaules || '-'} cm</strong>
                  </div>
                  <div style={{ backgroundColor: '#FFFFFF', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Poitrine :</span>
                    <strong>{selectedClientMeasurements.poitrine || '-'} cm</strong>
                  </div>
                  <div style={{ backgroundColor: '#FFFFFF', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Tour Bras :</span>
                    <strong>{selectedClientMeasurements.tourBras || '-'} cm</strong>
                  </div>
                  <div style={{ backgroundColor: '#FFFFFF', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Manche :</span>
                    <strong>{selectedClientMeasurements.longueurManche || '-'} cm</strong>
                  </div>
                  <div style={{ backgroundColor: '#FFFFFF', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Taille :</span>
                    <strong>{selectedClientMeasurements.tourTaille || '-'} cm</strong>
                  </div>
                  <div style={{ backgroundColor: '#FFFFFF', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Hanches :</span>
                    <strong>{selectedClientMeasurements.tourHanche || '-'} cm</strong>
                  </div>
                  <div style={{ backgroundColor: '#FFFFFF', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Longueur :</span>
                    <strong>{selectedClientMeasurements.longueurBas || '-'} cm</strong>
                  </div>
                  <div style={{ backgroundColor: '#FFFFFF', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Cuisse :</span>
                    <strong>{selectedClientMeasurements.cuisse || '-'} cm</strong>
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center', padding: '0.5rem' }}>
                  Aucune mensuration disponible pour l'instant dans le carnet.
                </div>
              )}
            </div>

            {/* Section 2 : Commandes & Photos */}
            <h4 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '0.85rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              👗 Commandes & Photos des Créations ({selectedClientOrders.length})
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '1.5rem' }}>
              {selectedClientOrders.length === 0 ? (
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '1rem', backgroundColor: '#FAF8F5', borderRadius: '12px', textAlign: 'center' }}>
                  Aucune commande enregistrée pour ce client.
                </div>
              ) : (
                selectedClientOrders.map(ord => (
                  <div 
                    key={ord.id}
                    style={{
                      padding: '1.1rem',
                      borderRadius: '16px',
                      border: '1px solid var(--border-color)',
                      backgroundColor: '#FFFFFF',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #EAE5DF', paddingBottom: '0.65rem' }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-main)' }}>
                          {ord.modelName} <span style={{ fontSize: '0.8rem', color: 'var(--gold-dark)', fontWeight: 700 }}>({ord.code})</span>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          Confection : <strong>{ord.garmentType}</strong> • Catégorie : {ord.modelCategory}
                        </div>
                      </div>
                      <span className="badge badge-gold" style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem', textTransform: 'capitalize' }}>
                        {ord.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div 
                        onClick={() => ord.modelImageUrl && !ord.modelImageUrl.includes('photo-1566174053879-31528523f8ae') ? setZoomedImage({
                          url: ord.modelImageUrl,
                          title: `Modèle : ${ord.modelName} (${ord.code})`
                        }) : null}
                        style={{ border: '1px solid #EAE5DF', borderRadius: '12px', padding: '0.5rem', backgroundColor: '#FAF8F5', cursor: 'pointer' }}
                      >
                        <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--gold-dark)', textTransform: 'uppercase', marginBottom: '0.4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>📸 Modèle</span>
                          {ord.modelImageUrl && !ord.modelImageUrl.includes('photo-1566174053879-31528523f8ae') && (
                            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>🔍 Zoom HD</span>
                          )}
                        </div>
                        {ord.modelImageUrl && !ord.modelImageUrl.includes('photo-1566174053879-31528523f8ae') ? (
                          <img 
                            src={ord.modelImageUrl} 
                            alt={ord.modelName} 
                            style={{ width: '100%', height: '150px', borderRadius: '10px', objectFit: 'cover', border: '1px solid #EAE5DF' }} 
                          />
                        ) : (
                          <div style={{
                            width: '100%', height: '150px', borderRadius: '10px',
                            background: 'linear-gradient(135deg, #1E293B, #0F172A)',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                            gap: 4, color: '#D4AF37'
                          }}>
                            <div style={{ fontSize: 28 }}>👗</div>
                            <span style={{ fontSize: 11, fontWeight: 800, color: '#F8FAFC' }}>{ord.modelName}</span>
                          </div>
                        )}
                      </div>

                      <div 
                        onClick={() => setZoomedImage({
                          url: '/fabric_bazin_sample_1786840151831.jpg',
                          title: `Échantillon Tissu : ${ord.fabricName || 'Bazin Riche Gagnagny'} (${ord.fabricColor || 'Bleu Roi'})`
                        })}
                        style={{ border: '1px solid #EAE5DF', borderRadius: '12px', padding: '0.5rem', backgroundColor: '#FAF8F5', cursor: 'pointer' }}
                      >
                        <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--gold-dark)', textTransform: 'uppercase', marginBottom: '0.4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>🧶 Tissu Bazin</span>
                          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>🔍 Zoom HD</span>
                        </div>
                        <img 
                          src="/fabric_bazin_sample_1786840151831.jpg" 
                          alt="Échantillon Tissu Bazin" 
                          style={{ width: '100%', height: '150px', borderRadius: '10px', objectFit: 'cover', border: '1px solid #EAE5DF' }} 
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', fontSize: '0.9rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div>🧶 <strong>Matière / Tissu :</strong> {ord.fabricName || 'Bazin Riche Gagnagny'} {ord.fabricColor && `(${ord.fabricColor})`}</div>
                        <div>📅 <strong>Date de Dépôt :</strong> {ord.createdAt}</div>
                        <div>📅 <strong>RDV Essayage / Livraison :</strong> <strong style={{ color: 'var(--gold-dark)' }}>{ord.deliveryDate}</strong></div>
                      </div>

                      <div style={{ backgroundColor: '#FAF8F5', padding: '1rem', borderRadius: '12px', border: '1px solid #EAE5DF', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <div>💰 <strong>Montant Total :</strong> {Number(ord.totalAmount || 0).toLocaleString()} FCFA</div>
                        <div style={{ color: '#059669', fontWeight: 600 }}>💳 <strong>Acompte Payé :</strong> - {Number(ord.depositAmount || 0).toLocaleString()} FCFA</div>
                        <div style={{ color: '#DC2626', fontWeight: 800, fontSize: '1.05rem', borderTop: '1px solid #EAE5DF', paddingTop: '0.5rem', marginTop: '0.2rem' }}>
                          ⚠️ <strong>Reste à Payer :</strong> {Number(ord.remainingAmount || 0).toLocaleString()} FCFA
                        </div>
                      </div>
                    </div>

                    {(ord.specialInstructions || ord.description) && (
                      <div style={{ fontSize: '0.85rem', color: '#5C544C', backgroundColor: 'var(--gold-light)', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px dashed var(--border-gold)', lineHeight: 1.5 }}>
                        📝 <strong>Observations / Instructions particulières :</strong> {ord.specialInstructions || ord.description}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Footer Page Actions Aérées */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '2px solid #EAE5DF', paddingTop: '1.5rem', marginTop: '1rem' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                💡 <em>Astuce : Cliquez sur n'importe quelle photo pour la voir en grand écran.</em>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button onClick={() => setSelectedClientId(null)} className="btn btn-secondary" style={{ padding: '0.75rem 1.5rem', fontWeight: 800 }}>
                  ← Retour à l'Annuaire
                </button>
                <button onClick={() => onSendWhatsapp(selectedClient.whatsapp, `Bonjour ${selectedClient.fullName} 👋`)} className="btn btn-whatsapp" style={{ padding: '0.75rem 1.5rem', fontWeight: 800 }}>
                  💬 Contacter sur WhatsApp
                </button>
              </div>
            </div>
          </div>
        )}

        {/* LIGHTBOX ZOOM PHOTO GRAND ÉCRAN */}
        {zoomedImage && (
          <div 
            onClick={() => setZoomedImage(null)}
            style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.92)',
              backdropFilter: 'blur(8px)',
              zIndex: 9999
            }}
          >
            {/* TITRE + FERMER — 48px en haut */}
            <div 
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'absolute',
                top: 0, left: 0, right: 0,
                height: '48px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0 20px',
                backgroundColor: 'rgba(0,0,0,0.5)',
                color: '#FFFFFF',
                zIndex: 1
              }}
            >
              <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>{zoomedImage.title}</span>
              <button 
                onClick={() => setZoomedImage(null)}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  color: '#FFFFFF',
                  borderRadius: '50%',
                  width: '32px', height: '32px',
                  border: '1px solid rgba(255,255,255,0.3)',
                  fontSize: '1rem', fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              >✕</button>
            </div>

            {/* IMAGE — remplit tout entre 48px et 36px */}
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'absolute',
                top: '48px', bottom: '36px',
                left: 0, right: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px'
              }}
            >
              <img 
                src={zoomedImage.url} 
                alt={zoomedImage.title}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  borderRadius: '10px',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
                  border: '2px solid rgba(212,175,55,0.4)'
                }}
              />
            </div>

            {/* LÉGENDE — 36px en bas */}
            <div 
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'absolute',
                bottom: 0, left: 0, right: 0,
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(0,0,0,0.5)',
                color: '#D4AF37',
                fontSize: '0.75rem',
                fontWeight: 600
              }}
            >
              🔍 Cliquez en dehors pour fermer
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // PAGE PRINCIPALE : ANNUAIRE & LISTE DES CLIENTS
  // =========================================================================
  return (
    <div className="animate-fade-in" style={{ padding: '1.25rem' }}>
      {/* Header Annuaire Clients */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Annuaire & Repertoire Clients 👥
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Gérez les fiches de contacts, les coordonnées et l'historique complet de votre clientèle.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {/* Toggle vue Grille / Liste */}
          <div style={{ display: 'flex', backgroundColor: 'var(--bg-primary)', padding: '0.2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <button 
              onClick={() => setViewMode('cards')}
              style={{ padding: '0.4rem 0.6rem', borderRadius: '4px', backgroundColor: viewMode === 'cards' ? 'var(--gold-light)' : 'transparent', color: viewMode === 'cards' ? 'var(--gold-dark)' : 'var(--text-muted)' }}
            >
              <Grid size={18} />
            </button>
            <button 
              onClick={() => setViewMode('table')}
              style={{ padding: '0.4rem 0.6rem', borderRadius: '4px', backgroundColor: viewMode === 'table' ? 'var(--gold-light)' : 'transparent', color: viewMode === 'table' ? 'var(--gold-dark)' : 'var(--text-muted)' }}
            >
              <List size={18} />
            </button>
          </div>

          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="btn btn-primary"
          >
            <Plus size={18} /> Nouveau Client
          </button>
        </div>
      </div>

      {/* Barre de Recherche */}
      <div style={{
        backgroundColor: 'var(--bg-primary)',
        padding: '1rem 1.25rem',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem'
      }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text"
            placeholder="Rechercher un client par nom, numéro WhatsApp ou quartier à Abidjan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.65rem 0.75rem 0.65rem 2.5rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              outline: 'none',
              fontSize: '0.85rem'
            }}
          />
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
          {filteredClients.length} client(s) trouvé(s)
        </div>
      </div>

      {/* VUE GRILLE DE CARTES CLIENTS */}
      {viewMode === 'cards' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {filteredClients.map((client) => {
            const clientOrders = orders.filter(o => o.clientId === client.id);
            const totalDepense = clientOrders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);

            return (
              <div 
                key={client.id}
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-color)',
                  padding: '1.5rem',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'var(--transition)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{
                      width: '54px',
                      height: '54px',
                      borderRadius: '50%',
                      backgroundImage: client.avatarUrl ? `url(${client.avatarUrl})` : 'none',
                      backgroundColor: 'var(--gold-light)',
                      backgroundSize: 'cover',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.3rem',
                      fontWeight: 700,
                      color: 'var(--gold-dark)',
                      border: '2px solid var(--gold-primary)'
                    }}>
                      {!client.avatarUrl && client.fullName.charAt(0)}
                    </div>

                    <div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>
                        {client.fullName}
                      </h3>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                        <Phone size={13} color="var(--gold-dark)" /> {client.whatsapp}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', marginBottom: '1rem' }}>
                    {client.address && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <MapPin size={14} color="var(--text-muted)" /> {client.address}
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <ShoppingBag size={14} color="var(--text-muted)" /> {clientOrders.length} commande(s) enregistrée(s)
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--gold-dark)', fontWeight: 700 }}>
                      <DollarSign size={14} /> Total dépenses : {totalDepense.toLocaleString('fr-FR')} FCFA
                    </div>
                  </div>
                </div>

                {/* Boutons d'actions de la carte */}
                <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                  <button
                    onClick={() => handleOpenClientDetails(client.id)}
                    className="btn btn-secondary"
                    style={{ flex: 1, fontSize: '0.85rem', padding: '0.5rem' }}
                  >
                    <Eye size={15} /> Voir Fiche
                  </button>
                  <button
                    onClick={() => onSendWhatsapp(client.whatsapp, `Bonjour ${client.fullName} 👋`)}
                    className="btn btn-whatsapp"
                    style={{ flex: 1, fontSize: '0.85rem', padding: '0.5rem' }}
                  >
                    <MessageSquare size={15} /> WhatsApp
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VUE TABLEAU LISTE CLIENTS */}
      {viewMode === 'table' && (
        <div style={{ backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '0.85rem 1.25rem' }}>Client</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>Contact WhatsApp</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>Adresse / Quartier</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>Commandes</th>
                <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map(client => (
                <tr key={client.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1rem 1.25rem', fontWeight: 700 }}>{client.fullName}</td>
                  <td style={{ padding: '1rem 1.25rem', color: 'var(--gold-dark)', fontWeight: 600 }}>{client.whatsapp}</td>
                  <td style={{ padding: '1rem 1.25rem', color: 'var(--text-muted)' }}>{client.address || '-'}</td>
                  <td style={{ padding: '1rem 1.25rem' }}>{orders.filter(o => o.clientId === client.id).length}</td>
                  <td style={{ padding: '1rem 1.25rem', textAlign: 'right', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <button onClick={() => handleOpenClientDetails(client.id)} className="btn btn-secondary" style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}>
                      <Eye size={14} /> Fiche
                    </button>
                    <button onClick={() => onSendWhatsapp(client.whatsapp, `Bonjour ${client.fullName} 👋`)} className="btn btn-whatsapp" style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}>
                      💬 WhatsApp
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Nouveau Client Centrée au Pixel Près */}
      {isAddModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(8px)',
          zIndex: 999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.25rem',
          animation: 'fadeIn 0.25 ease-out'
        }}>
          <form 
            onSubmit={handleCreateClientSubmit}
            style={{
              width: '100%',
              maxWidth: '480px',
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              padding: '2.25rem',
              boxShadow: '0 25px 60px rgba(0,0,0,0.25)',
              border: '1.5px solid #D4AF37',
              margin: 'auto'
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '26px', backgroundColor: '#FFFDF5', border: '1.5px solid #D4AF37', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', margin: '0 auto 0.75rem auto', boxShadow: '0 4px 12px rgba(212,175,55,0.2)' }}>
                👤
              </div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0F172A', marginBottom: '0.25rem' }}>
                Nouveau Client VIP
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#64748B' }}>
                Enregistrez la fiche client pour attribuer ses commandes et mesures.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem', marginBottom: '1.75rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 800, display: 'block', marginBottom: '0.35rem', color: '#334155' }}>Nom Complet du Client *</label>
                <input 
                  type="text"
                  required
                  placeholder="ex: Mme Aïcha Traoré"
                  value={fullNameInput}
                  onChange={(e) => setFullNameInput(e.target.value)}
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '14px', border: '1.5px solid #EAE5DF', fontSize: '0.95rem', fontWeight: 600, outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 800, display: 'block', marginBottom: '0.35rem', color: '#334155' }}>Numéro WhatsApp Officiel *</label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', backgroundColor: '#FAF8F5', padding: '5px', borderRadius: '14px', border: '1.5px solid #D4AF37' }}>
                  <div style={{ backgroundColor: '#FFFDF5', border: '1px solid #D4AF37', padding: '0.6rem 0.8rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, fontSize: '0.9rem', color: '#0F172A' }}>
                    <span>🇨🇮</span> +225
                  </div>
                  <input 
                    type="text"
                    required
                    placeholder="0707070700"
                    value={whatsappInput.replace('+225', '').trim()}
                    onChange={(e) => setWhatsappInput(e.target.value)}
                    style={{ flex: 1, padding: '0.6rem', border: 'none', background: 'transparent', fontSize: '1rem', fontWeight: 700, color: '#0F172A', outline: 'none' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 800, display: 'block', marginBottom: '0.35rem', color: '#334155' }}>Adresse / Quartier (ex: Cocody Angré)</label>
                <input 
                  type="text"
                  placeholder="ex: Cocody Angré 8ème Tranche"
                  value={addressInput}
                  onChange={(e) => setAddressInput(e.target.value)}
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '14px', border: '1.5px solid #EAE5DF', fontSize: '0.95rem', fontWeight: 600, outline: 'none' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.85rem' }}>
              <button type="button" onClick={() => setIsAddModalOpen(false)} className="btn btn-secondary" style={{ padding: '0.75rem 1.25rem', borderRadius: '12px', fontWeight: 700 }}>
                Annuler
              </button>
              <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', borderRadius: '12px', fontWeight: 900, boxShadow: '0 4px 14px rgba(212,175,55,0.3)' }}>
                ✓ Créer la fiche client
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
