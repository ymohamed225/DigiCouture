import React, { useState } from 'react';
import type { Order, Client, CatalogueItem, Measurements, AtelierProfile } from '../types';
import { 
  Search, 
  Camera, 
  Check, 
  ArrowLeft,
  Printer,
  Scissors
} from 'lucide-react';

interface OrderWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: Client[];
  catalogue: CatalogueItem[];
  measurements: Record<string, Measurements>;
  onCreateOrder: (order: Partial<Order>) => void;
  onCreateClient: (client: Partial<Client>) => void;
  atelierLogoUrl?: string;
  atelier?: AtelierProfile;
  onNavigateToOrders?: () => void;
}

export const OrderWizardModal: React.FC<OrderWizardModalProps> = ({
  isOpen,
  onClose,
  clients,
  catalogue,
  measurements = {},
  onCreateOrder,
  onCreateClient,
  atelierLogoUrl,
  atelier,
  onNavigateToOrders
}) => {
  // Assistant en 3 Étapes Ultra-Simples (Workflow Identique Mobile)
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Étape 1 : Client & Photo Tissu
  const [selectedClientId, setSelectedClientId] = useState('');
  const [clientSearch, setClientSearch] = useState('');
  const [showQuickNewClient, setShowQuickNewClient] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [fabricPhoto, setFabricPhoto] = useState<string | null>(null);

  // Étape 2 : Modèle, Mesures & Dates
  const [garmentType, setGarmentType] = useState('Robe de Soirée Bazin');
  const [modelImage, setModelImage] = useState<string | null>(null);
  const [depositDate, _setDepositDate] = useState(() => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });
  const [deliveryDate, setDeliveryDate] = useState('2026-08-25');
  const [isUrgent, setIsUrgent] = useState(false);

  // Étape 3 : Tarification & Paiement Mobile Money / Espèces (Champs vides par défaut)
  const [totalAmountStr, setTotalAmountStr] = useState('');
  const [depositAmountStr, setDepositAmountStr] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Especes' | 'Wave' | 'Orange Money' | 'MTN Mobile Money' | 'Autre'>('Orange Money');

  // Modal de Sélection du Catalogue
  const [isCataloguePickerOpen, setIsCataloguePickerOpen] = useState(false);

  // Ticket Papier de Caisse Post-Création
  const [createdOrderTicket, setCreatedOrderTicket] = useState<Order | null>(null);

  if (!isOpen) return null;

  const filteredClients = clients.filter(c => 
    c.fullName.toLowerCase().includes(clientSearch.toLowerCase()) ||
    c.whatsapp.includes(clientSearch)
  );

  const selectedClientObj = clients.find(c => c.id === selectedClientId) || clients[0];

  // Calculs réactifs avec valeurs par défaut réalistes si non remplis
  const totalNum = parseFloat(totalAmountStr.replace(/[^0-9]/g, '')) || 75000;
  const depositNum = parseFloat(depositAmountStr.replace(/[^0-9]/g, '')) || 30000;
  const remainingNum = Math.max(0, totalNum - depositNum);

  const handleQuickClientCreate = () => {
    if (!newClientName || !newClientPhone) return;
    const newId = `cli-${Date.now()}`;
    onCreateClient({
      fullName: newClientName,
      whatsapp: newClientPhone
    });
    setSelectedClientId(newId);
    setShowQuickNewClient(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'fabric' | 'model') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'fabric') setFabricPhoto(reader.result as string);
        else setModelImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitOrder = () => {
    const ord: Partial<Order> = {
      code: `CMD-2026-${Math.floor(100 + Math.random() * 900)}`,
      clientId: selectedClientId || clients[0]?.id || 'cli-1',
      clientName: selectedClientObj?.fullName || 'Client VIP',
      clientWhatsapp: selectedClientObj?.whatsapp || '+225 0708091011',
      modelName: garmentType,
      garmentType: 'Sur-mesure',
      fabricName: 'Bazin Riche',
      deliveryDate: deliveryDate,
      urgency: isUrgent ? 'tres_urgente' : 'normale',
      totalAmount: totalNum,
      depositAmount: depositNum,
      remainingAmount: remainingNum,
      status: 'commande_recue',
      modelImageUrl: modelImage || fabricPhoto || '',
      createdAt: depositDate
    };

    onCreateOrder(ord);
    setCreatedOrderTicket(ord as Order);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.85)',
      backdropFilter: 'blur(10px)',
      zIndex: 160,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0.75rem'
    }}>
      {/* Fenêtre Modal Assistant Workflow Grand Format Plein Écran */}
      <div className="animate-fade-in" style={{
        width: '100%',
        maxWidth: '1080px',
        backgroundColor: '#FFFFFF',
        borderRadius: '24px',
        padding: '2.25rem',
        boxShadow: '0 30px 70px rgba(0,0,0,0.4)',
        height: '94vh',
        maxHeight: '95vh',
        overflowY: 'auto',
        border: '2px solid #D4AF37'
      }}>
        
        {!createdOrderTicket ? (
          <>
            {/* Header Stepper 3 Étapes ●━━━━○━━━━○ */}
            <div style={{ marginBottom: '1.25rem', borderBottom: '1px solid #EAE5DF', paddingBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {step > 1 && (
                    <button onClick={() => setStep((step - 1) as any)} style={{ border: 'none', background: '#FAF8F5', borderRadius: '10px', padding: '0.4rem', cursor: 'pointer' }}>
                      <ArrowLeft size={18} color="#1A1A1A" />
                    </button>
                  )}
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1A1A1A', margin: 0 }}>
                    # Nouvelle commande
                  </h3>
                </div>

                <button onClick={onClose} style={{ border: 'none', background: '#FAF8F5', padding: '0.4rem 0.8rem', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 800, color: '#6B7280', cursor: 'pointer' }}>
                  ✕ Annuler
                </button>
              </div>

              {/* Progress Bar & Indicators */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <span style={{ fontSize: '1rem', color: '#D4AF37' }}>●</span>
                <div style={{ height: '3px', flex: 1, backgroundColor: step >= 2 ? '#D4AF37' : '#EAE5DF', borderRadius: '2px' }} />
                <span style={{ fontSize: '1rem', color: step >= 2 ? '#D4AF37' : '#D1D5DB' }}>●</span>
                <div style={{ height: '3px', flex: 1, backgroundColor: step >= 3 ? '#D4AF37' : '#EAE5DF', borderRadius: '2px' }} />
                <span style={{ fontSize: '1rem', color: step >= 3 ? '#D4AF37' : '#D1D5DB' }}>●</span>
              </div>

              <div style={{ textAlign: 'center', fontSize: '0.8rem', fontWeight: 800, color: '#B8922E', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Étape {step} sur 3
              </div>
            </div>

            {/* ================= ÉTAPE 1 SUR 3 : CLIENT & PHOTO DU TISSU / BAZIN ================= */}
            {step === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#1A1A1A', marginBottom: '0.5rem' }}>
                    👤 Pour qui est cette commande ?
                  </h4>

                  {!showQuickNewClient ? (
                    <>
                      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                          <Search size={16} color="#9CA3AF" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                          <input 
                            type="text"
                            placeholder="Rechercher par nom ou téléphone..."
                            value={clientSearch}
                            onChange={(e) => setClientSearch(e.target.value)}
                            style={{ width: '100%', padding: '0.65rem 0.75rem 0.65rem 2.2rem', borderRadius: '12px', border: '1px solid #EAE5DF', fontSize: '0.88rem' }}
                          />
                        </div>

                        <button onClick={() => setShowQuickNewClient(true)} className="btn btn-primary" style={{ padding: '0.65rem 1rem', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                          + Nouveau Client
                        </button>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto' }}>
                        {filteredClients.map(c => {
                          const isSel = c.id === selectedClientId;
                          return (
                            <div 
                              key={c.id}
                              onClick={() => setSelectedClientId(c.id)}
                              style={{
                                padding: '0.85rem 1rem',
                                borderRadius: '14px',
                                backgroundColor: isSel ? '#FFFDF5' : '#FAF8F5',
                                border: isSel ? '2px solid #D4AF37' : '1px solid #EAE5DF',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                cursor: 'pointer'
                              }}
                            >
                              <div>
                                <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#111827' }}>👤 {c.fullName}</div>
                                <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>📱 {c.whatsapp}</div>
                              </div>
                              {isSel && <Check size={18} color="#B8922E" />}
                            </div>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    /* Création Client Rapide */
                    <div style={{ backgroundColor: '#FFFDF5', padding: '1rem', borderRadius: '16px', border: '1px solid #D4AF37', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#B8922E' }}>+ Créer un Nouveau Client</div>
                      <input type="text" placeholder="Nom complet client *" value={newClientName} onChange={(e) => setNewClientName(e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: '10px', border: '1px solid #EAE5DF' }} />
                      <input type="text" placeholder="Numéro WhatsApp *" value={newClientPhone} onChange={(e) => setNewClientPhone(e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: '10px', border: '1px solid #EAE5DF' }} />
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => setShowQuickNewClient(false)} className="btn btn-secondary" style={{ flex: 1, padding: '0.5rem' }}>Annuler</button>
                        <button onClick={handleQuickClientCreate} className="btn btn-primary" style={{ flex: 1, padding: '0.5rem' }}>Créer & Sélectionner</button>
                      </div>
                    </div>
                  )}
                </div>

                {/* 🧵 2. PHOTO DU TISSU / BAZIN */}
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#1A1A1A', marginBottom: '0.5rem' }}>
                    🧵 Photo du tissu ou du Bazin
                  </h4>

                  <label style={{
                    backgroundColor: fabricPhoto ? '#FFFDF5' : '#FFFFFF',
                    borderRadius: '16px',
                    padding: '1.25rem',
                    border: fabricPhoto ? '2px solid #D4AF37' : '2px dashed #EAE5DF',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer'
                  }}>
                    {fabricPhoto ? (
                      <div style={{ textAlign: 'center', width: '100%' }}>
                        <img src={fabricPhoto} alt="Tissu" style={{ width: '100%', height: '140px', borderRadius: '12px', objectFit: 'cover', marginBottom: '0.5rem' }} />
                        <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#B8922E' }}>📸 Modifier la photo du tissu</span>
                      </div>
                    ) : (
                      <>
                        <Camera size={32} color="#D4AF37" />
                        <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#111827' }}>Prendre en photo ou Charger l'image du tissu</span>
                        <span style={{ fontSize: '0.78rem', color: '#9CA3AF' }}>PNG, JPG ou photo appareil photo</span>
                      </>
                    )}
                    <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'fabric')} style={{ display: 'none' }} />
                  </label>
                </div>

                <button 
                  disabled={!selectedClientId}
                  onClick={() => setStep(2)}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem', opacity: selectedClientId ? 1 : 0.5, fontSize: '0.95rem' }}
                >
                  Continuer → (Modèle & Mesures)
                </button>
              </div>
            )}

            {/* ================= ÉTAPE 2 SUR 3 : MODÈLE, MESURES & DATES ================= */}
            {step === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#1A1A1A', marginBottom: '0.4rem' }}>
                    👗 Choix du modèle de vêtement
                  </h4>

                  {/* 2 Boutons de sélection de modèle identiques au mobile */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <label style={{
                      backgroundColor: '#FAF8F5',
                      borderRadius: '16px',
                      padding: '1rem 0.75rem',
                      border: '1px solid #EAE5DF',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      cursor: 'pointer'
                    }}>
                      <Camera size={20} color="#B8922E" />
                      <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#111827' }}>📸 Charger photo modèle</span>
                      <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'model')} style={{ display: 'none' }} />
                    </label>

                    <button
                      type="button"
                      onClick={() => setIsCataloguePickerOpen(true)}
                      style={{
                        backgroundColor: '#FFFDF5',
                        borderRadius: '16px',
                        padding: '1rem 0.75rem',
                        border: '1.5px solid #D4AF37',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        cursor: 'pointer'
                      }}
                    >
                      <span style={{ fontSize: '1.2rem' }}>📚</span>
                      <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#B8922E' }}>Choisir dans Catalogue</span>
                    </button>
                  </div>

                  {/* Sélecteur Rapide par Code Modèle Catalogue */}
                  {catalogue && catalogue.length > 0 && (
                    <div style={{ marginBottom: '0.65rem' }}>
                      <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#B8922E', display: 'block', marginBottom: '0.25rem', textTransform: 'uppercase' }}>
                        🏷️ Sélectionner par Code Modèle Catalogue :
                      </label>
                      <select
                        value={catalogue.find(c => garmentType.includes(c.code || '') || c.title === garmentType)?.code || ''}
                        onChange={(e) => {
                          const found = catalogue.find(c => (c.code || `MOD-${c.id.slice(-3)}`) === e.target.value);
                          if (found) {
                            const codeStr = found.code || `MOD-${found.id.slice(-3)}`;
                            setGarmentType(`${found.title} (${codeStr})`);
                            if (found.imageUrl) setModelImage(found.imageUrl);
                            const priceNum = Number(found.estimatedPrice.replace(/[^0-9]/g, ''));
                            if (priceNum > 0) {
                              setTotalAmountStr(priceNum.toString());
                            }
                          }
                        }}
                        style={{
                          width: '100%',
                          padding: '0.6rem',
                          borderRadius: '12px',
                          border: '1.5px solid #D4AF37',
                          backgroundColor: '#FFFDF5',
                          fontSize: '0.85rem',
                          fontWeight: 800,
                          color: '#0F172A',
                          outline: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="">-- Sélectionner un Code Modèle (ex: MOD-001) --</option>
                        {catalogue.map(c => (
                          <option key={c.id} value={c.code || `MOD-${c.id.slice(-3)}`}>
                            🏷️ {c.code || `MOD-${c.id.slice(-3)}`} — {c.title} ({c.estimatedPrice})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Champ nom du modèle */}
                  <input 
                    type="text" 
                    value={garmentType} 
                    onChange={(e) => setGarmentType(e.target.value)} 
                    placeholder="ex: Grand Boubou Bazin Brodé (MOD-001)"
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '12px', border: '1.5px solid #D4AF37', fontWeight: 700 }}
                  />

                  {/* Aperçu de la photo de modèle si chargée */}
                  {modelImage && (
                    <div style={{ marginTop: '0.5rem', position: 'relative', borderRadius: '12px', overflow: 'hidden', border: '1px solid #D4AF37' }}>
                      <img src={modelImage} alt="Modèle choisi" style={{ width: '100%', height: '140px', objectFit: 'cover' }} />
                      <button 
                        onClick={() => setModelImage(null)}
                        style={{ position: 'absolute', top: '8px', right: '8px', backgroundColor: '#DC2626', color: '#FFFFFF', border: 'none', borderRadius: '8px', padding: '0.2rem 0.6rem', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}
                      >
                        Supprimer ✕
                      </button>
                    </div>
                  )}
                </div>

                {/* 📏 TABLEAU DES MESURES DYNAMIQUES DU CLIENT */}
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#1A1A1A', marginBottom: '0.4rem' }}>
                    📏 Mesures de {selectedClientObj ? selectedClientObj.fullName : 'Client'} (cm)
                  </h4>

                  {(() => {
                    const clientM = selectedClientId ? measurements[selectedClientId] : undefined;
                    
                    const list = [
                      { label: 'Épaules', val: clientM?.epaules ? `${clientM.epaules} cm` : '-' },
                      { label: 'Poitrine', val: clientM?.poitrine ? `${clientM.poitrine} cm` : '-' },
                      { label: 'Tour de Bras', val: clientM?.tourBras ? `${clientM.tourBras} cm` : '-' },
                      { label: 'Longueur Manche', val: clientM?.longueurManche ? `${clientM.longueurManche} cm` : '-' },
                      { label: 'Tour de Taille', val: clientM?.tourTaille ? `${clientM.tourTaille} cm` : '-' },
                      { label: 'Tour de Hanches', val: clientM?.tourHanche ? `${clientM.tourHanche} cm` : '-' },
                      { label: 'Longueur Bas', val: clientM?.longueurBas || clientM?.longueurJupe ? `${clientM.longueurBas || clientM.longueurJupe} cm` : '-' },
                      { label: 'Cuisse', val: clientM?.cuisse ? `${clientM.cuisse} cm` : '-' }
                    ];

                    return (
                      <div style={{ backgroundColor: '#FFFFFF', padding: '1rem', borderRadius: '16px', border: '1.5px solid #D4AF37' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.85rem' }}>
                          {list.map((m, idx) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.45rem 0.65rem', backgroundColor: idx % 2 === 0 ? '#FFFDF5' : '#FFFFFF', borderRadius: '8px', border: '1px solid #F1ECE6' }}>
                              <span style={{ color: '#4B5563', fontWeight: 600 }}>{m.label} :</span>
                              <span style={{ fontWeight: 800, color: m.val !== '-' ? '#B8922E' : '#94A3B8' }}>{m.val}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* 📅 DATES DE DÉPÔT & LIVRAISON */}
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#1A1A1A', marginBottom: '0.4rem' }}>
                    📅 Date de livraison souhaitée
                  </h4>

                  <div style={{ backgroundColor: '#FAF8F5', padding: '0.85rem', borderRadius: '12px', border: '1px solid #EAE5DF', marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', color: '#6B7280' }}>Date du dépôt (Auto) :</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#111827' }}>📅 {depositDate} (Aujourd'hui)</span>
                  </div>

                  <input 
                    type="date" 
                    value={deliveryDate} 
                    onChange={(e) => setDeliveryDate(e.target.value)} 
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '12px', border: '1px solid #EAE5DF', fontWeight: 700, fontSize: '0.95rem' }} 
                  />
                </div>

                {/* Commande Urgente */}
                <div 
                  onClick={() => setIsUrgent(!isUrgent)}
                  style={{
                    backgroundColor: isUrgent ? '#FEF2F2' : '#FAF8F5',
                    border: isUrgent ? '1.5px solid #FCA5A5' : '1px solid #EAE5DF',
                    borderRadius: '12px',
                    padding: '0.75rem 1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <span style={{ fontWeight: 800, color: isUrgent ? '#DC2626' : '#111827', fontSize: '0.9rem' }}>⚠️ Commande urgente</span>
                  {isUrgent && <span className="badge badge-danger">URGENT 🔴</span>}
                </div>

                {/* Navigation */}
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button onClick={() => setStep(1)} className="btn btn-secondary" style={{ flex: 1, padding: '0.85rem' }}>← Retour</button>
                  <button onClick={() => setStep(3)} className="btn btn-primary" style={{ flex: 2, padding: '0.85rem' }}>Continuer → (Paiement)</button>
                </div>
              </div>
            )}

            {/* ================= ÉTAPE 3 SUR 3 : PRIX & PAIEMENT REACTIF ================= */}
            {step === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                <div>
                  <label style={{ fontSize: '0.9rem', fontWeight: 800, color: '#111827', display: 'block', marginBottom: '0.35rem' }}>
                    💰 Combien coûte la commande ? (FCFA)
                  </label>
                  <input 
                    type="text" 
                    value={totalAmountStr} 
                    onChange={(e) => setTotalAmountStr(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="Saisir le prix total de la création (ex: 75000)"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1.5px solid #D4AF37', fontWeight: 800, fontSize: '1.1rem', outline: 'none' }} 
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.9rem', fontWeight: 800, color: '#111827', display: 'block', marginBottom: '0.35rem' }}>
                    💳 Combien le client a-t-il payé ? / Acompte (FCFA)
                  </label>
                  <input 
                    type="text" 
                    value={depositAmountStr} 
                    onChange={(e) => setDepositAmountStr(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="Saisir le montant de l'acompte (ex: 30000)"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1.5px solid #D4AF37', fontWeight: 800, fontSize: '1.1rem', outline: 'none' }} 
                  />
                </div>

                {/* CALCUL AUTOMATIQUE ULTRA-RÉACTIF IDENTIQUE MOBILE */}
                {(() => {
                  const total = parseFloat(totalAmountStr.replace(/[^0-9]/g, '')) || 0;
                  const deposit = parseFloat(depositAmountStr.replace(/[^0-9]/g, '')) || 0;
                  const remaining = total - deposit;
                  const isPaidFull = remaining <= 0 && total > 0;
                  const isPartial = deposit > 0 && remaining > 0;

                  return (
                    <div style={{
                      backgroundColor: isPaidFull ? '#F0FDF4' : isPartial ? '#FFFDF5' : '#FEF2F2',
                      padding: '1.25rem 1.5rem',
                      borderRadius: '20px',
                      border: '2px solid ' + (isPaidFull ? '#22C55E' : isPartial ? '#D4AF37' : '#EF4444'),
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      boxShadow: '0 8px 24px ' + (isPaidFull ? 'rgba(34,197,94,0.15)' : isPartial ? 'rgba(212,175,55,0.15)' : 'rgba(239,68,68,0.15)'),
                      marginTop: '0.5rem',
                      marginBottom: '0.5rem'
                    }}>
                      <div>
                        <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Reste à payer :
                        </div>
                        <div style={{ fontSize: '1.65rem', fontWeight: 900, color: isPaidFull ? '#166534' : isPartial ? '#B8922E' : '#DC2626', marginTop: '2px' }}>
                          {remaining <= 0 ? '0 FCFA' : `${remaining.toLocaleString()} FCFA`}
                        </div>
                      </div>

                      {/* Badge Dynamique Réactif */}
                      <span style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '12px',
                        color: '#FFFFFF',
                        fontWeight: 900,
                        fontSize: '0.82rem',
                        letterSpacing: '0.5px',
                        backgroundColor: isPaidFull ? '#22C55E' : isPartial ? '#D4AF37' : '#EF4444',
                        boxShadow: '0 4px 12px ' + (isPaidFull ? 'rgba(34,197,94,0.3)' : isPartial ? 'rgba(212,175,55,0.3)' : 'rgba(239,68,68,0.3)')
                      }}>
                        {isPaidFull ? '✓ PAYÉ TOTAL' : isPartial ? '⏳ ACOMPTE REÇU' : '🔴 NON PAYÉ'}
                      </span>
                    </div>
                  );
                })()}

                {/* MOYEN DE PAIEMENT AVEC LOGOS OFFICIELS RÉELS */}
                <div>
                  <label style={{ fontSize: '0.88rem', fontWeight: 800, color: '#111827', display: 'block', marginBottom: '0.5rem' }}>
                    💳 Moyen de paiement :
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                    {[
                      { key: 'Wave', name: 'Wave', imgUrl: '/src/assets/logo_wave.png' },
                      { key: 'Orange Money', name: 'Orange Money', imgUrl: '/src/assets/logo_orange.png' },
                      { key: 'MTN Mobile Money', name: 'MTN MoMo', imgUrl: '/src/assets/logo_mtn.jpg' },
                      { key: 'Especes', name: 'Espèces (Cash)', icon: '💵' }
                    ].map(m => (
                      <div
                        key={m.key}
                        onClick={() => setPaymentMethod(m.key as any)}
                        style={{
                          padding: '0.65rem 0.75rem',
                          borderRadius: '14px',
                          backgroundColor: paymentMethod === m.key ? '#FFFDF5' : '#FFFFFF',
                          border: paymentMethod === m.key ? '2px solid #D4AF37' : '1px solid #EAE5DF',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          cursor: 'pointer',
                          boxShadow: paymentMethod === m.key ? '0 4px 12px rgba(212,175,55,0.2)' : '0 2px 4px rgba(0,0,0,0.02)'
                        }}
                      >
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '10px',
                          backgroundColor: '#F3F4F6',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden',
                          border: '1px solid #E2E8F0'
                        }}>
                          {m.imgUrl ? (
                            <img src={m.imgUrl} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <span style={{ fontSize: '1.2rem' }}>{m.icon}</span>
                          )}
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '0.88rem', color: paymentMethod === m.key ? '#B8922E' : '#111827' }}>{m.name}</div>
                          <div style={{ fontSize: '0.72rem', color: paymentMethod === m.key ? '#B8922E' : '#9CA3AF' }}>
                            {paymentMethod === m.key ? '✓ Sélectionné' : 'Choisir'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Navigation */}
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button onClick={() => setStep(2)} className="btn btn-secondary" style={{ flex: 1, padding: '0.85rem' }}>← Retour</button>
                  <button onClick={handleSubmitOrder} className="btn btn-primary" style={{ flex: 2, padding: '0.85rem', fontSize: '1rem', fontWeight: 800 }}>✓ CRÉER LA COMMANDE</button>
                </div>
              </div>
            )}
          </>
        ) : (
          /* 🧾 REÇU ROULEAU PAPIER THERMIQUE LUXE — REPRODUCTION EXACTE À 100% DE L'IMAGE TRANSMISE */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', alignItems: 'center' }}>
            
            {/* Conteneur Rouleau de Ticket Papier Thermique */}
            <div className="printable-receipt-roll" style={{
              width: '100%',
              maxWidth: '380px',
              backgroundColor: '#F7F3E9',
              backgroundImage: 'linear-gradient(180deg, #FBF8F1 0%, #F3EEE3 100%)',
              padding: '2.5rem 1.75rem 1.5rem 1.75rem',
              boxShadow: '0 25px 50px rgba(0,0,0,0.35)',
              position: 'relative',
              borderRadius: '6px 6px 0 0',
              fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
              color: '#1A1815'
            }}>
              
              {/* 🏆 MÉDAILLE LOGO CISEAUX D'OR 3D (EXACTEMENT COMME SUR L'IMAGE) */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <div style={{
                  width: '110px',
                  height: '110px',
                  borderRadius: '55px',
                  background: 'radial-gradient(circle at 35% 35%, #FFF6D6 0%, #E6C675 45%, #9E7D2B 85%, #664F19 100%)',
                  padding: '4px',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.25), inset 0 2px 4px rgba(255,255,255,0.8)'
                }}>
                  <div style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50px',
                    backgroundColor: '#FDFBF5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 'inset 0 3px 6px rgba(0,0,0,0.2)'
                  }}>
                    {atelierLogoUrl || atelier?.logoUrl ? (
                      <img src={atelierLogoUrl || atelier?.logoUrl} alt="Logo Atelier" style={{ width: '90%', height: '90%', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      <Scissors size={52} color="#A37E2C" style={{ transform: 'rotate(-25deg)', filter: 'drop-shadow(0px 2px 3px rgba(0,0,0,0.3))' }} />
                    )}
                  </div>
                </div>
              </div>

              {/* EN-TÊTE D'ATELIER (EXACTEMENT LE TEXTE & TITRES DU ROULEAU) */}
              <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '1.05rem', fontWeight: 900, textTransform: 'uppercase', color: '#1A1815', letterSpacing: '0.2px', lineHeight: 1.25 }}>
                  {atelier?.name ? `${atelier.name} - HAUTE COUTURE & SUR-MESURE` : 'MAISON DIGICOUTURE VIP - HAUTE COUTURE & SUR-MESURE'}
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 500, color: '#3A3630', marginTop: '4px' }}>
                  {atelier?.address || atelier?.city || 'Cocody Riviera 3, Abidjan'} - {atelier?.whatsapp || '+225 0707705067'}
                </div>

                {/* PILULE / BADGE REÇU N° (NOIR ARRONDI A BORDURES) */}
                <div style={{
                  backgroundColor: '#2E2721',
                  color: '#FAF6ED',
                  fontWeight: 900,
                  padding: '0.55rem 1.25rem',
                  borderRadius: '16px',
                  display: 'inline-block',
                  marginTop: '0.85rem',
                  fontSize: '0.95rem',
                  letterSpacing: '0.5px'
                }}>
                  TICKET REÇU N° {createdOrderTicket.code}
                </div>
              </div>

              {/* LISTE CONDENSÉE DES DÉTAILS DE LA COMMANDE */}
              <div style={{ fontSize: '1.1rem', lineHeight: 1.5, textAlign: 'left', marginBottom: '1.25rem', color: '#1A1815' }}>
                <div><span style={{ fontWeight: 800 }}>Client:</span> {createdOrderTicket.clientName}</div>
                <div><span style={{ fontWeight: 800 }}>Modèle:</span> {createdOrderTicket.modelName}</div>
                <div><span style={{ fontWeight: 800 }}>Tissu:</span> {createdOrderTicket.fabricName || 'Bazin Riche'}</div>
                <div><span style={{ fontWeight: 800 }}>Livraison:</span> {createdOrderTicket.deliveryDate}</div>
              </div>

              {/* SÉPARATEUR POINTILLÉ THERMIQUE */}
              <div style={{ borderTop: '1.5px dashed #A89F8F', margin: '1rem 0' }} />

              {/* SECTION FINANCIÈRE TARIFS & RESTE À PAYER */}
              <div style={{ textAlign: 'left', marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#1A1815', letterSpacing: '-0.2px', marginBottom: '0.2rem' }}>
                  Prix Total: {createdOrderTicket.totalAmount.toLocaleString()} FCFA
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: 600, color: '#2B2620', marginBottom: '0.3rem' }}>
                  Acompte payé ({paymentMethod}): {createdOrderTicket.depositAmount.toLocaleString()} FCFA
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#8B0000', letterSpacing: '-0.2px' }}>
                  Reste à payer: {createdOrderTicket.remainingAmount.toLocaleString()} FCFA
                </div>
              </div>

              {/* SÉPARATEUR POINTILLÉ THERMIQUE */}
              <div style={{ borderTop: '1.5px dashed #A89F8F', margin: '1rem 0' }} />

              {/* GRAND CODE QR NOIR DENSE D'IDENTIFICATION & SUIVI */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '1.25rem 0' }}>
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=https://digicouture.app/suivi/${createdOrderTicket.code}`}
                  alt="QR Code Ticket"
                  style={{ width: '140px', height: '140px', border: '3px solid #1A1815', padding: '4px', backgroundColor: '#FFFFFF' }}
                />
              </div>

              {/* LIEN & PHRASE DE FIN */}
              <div style={{ textAlign: 'center', fontSize: '0.85rem', fontWeight: 600, color: '#3A3630', lineHeight: 1.4 }}>
                <div>https://digicouture.app/suivi/{createdOrderTicket.code}</div>
                <div style={{ marginTop: '2px' }}>Merci de conserver ce reçu digital !</div>
              </div>

              {/* DENTELURES ZIG-ZAG PAPIER THERMIQUE EN BAS */}
              <div style={{
                position: 'absolute',
                bottom: '-12px',
                left: 0,
                right: 0,
                height: '12px',
                backgroundImage: 'radial-gradient(circle, transparent, transparent 50%, #F3EEE3 50%, #F3EEE3 100%)',
                backgroundSize: '16px 16px'
              }} />
            </div>

            {/* 🚀 BOUTONS D'ACTIONS SOUS LE ROULEAU TICKET (WHATSAPP, VOIR / IMPRIMER, PNG, PDF) */}
            <div style={{ width: '100%', maxWidth: '380px', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <button
                onClick={() => {
                  const phone = (createdOrderTicket.clientWhatsapp || '').replace(/[^0-9]/g, '');
                  const text = encodeURIComponent(`🧾 *TICKET REÇU DE CAISSE - ${atelier?.name || 'MAISON DIGICOUTURE VIP'}*\n\n` +
                    `📍 *Atelier :* ${atelier?.name || 'Maison DigiCouture VIP'}\n` +
                    `📞 *Contact :* ${atelier?.whatsapp || '+225 0707705067'}\n` +
                    `🔖 *N° Ticket :* ${createdOrderTicket.code}\n` +
                    `-----------------------------------\n` +
                    `Client: ${createdOrderTicket.clientName}\n` +
                    `Modèle: ${createdOrderTicket.modelName}\n` +
                    `Tissu: ${createdOrderTicket.fabricName || 'Bazin Riche'}\n` +
                    `Livraison: ${createdOrderTicket.deliveryDate}\n` +
                    `-----------------------------------\n` +
                    `Prix Total: ${createdOrderTicket.totalAmount.toLocaleString()} FCFA\n` +
                    `Acompte payé (${paymentMethod}): ${createdOrderTicket.depositAmount.toLocaleString()} FCFA\n` +
                    `*Reste à payer: ${createdOrderTicket.remainingAmount.toLocaleString()} FCFA*\n\n` +
                    `https://digicouture.app/suivi/${createdOrderTicket.code}\n` +
                    `Merci de conserver ce reçu digital ! ✨`);
                  window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
                }}
                style={{
                  backgroundColor: '#0F172A',
                  color: '#FFFFFF',
                  border: '1.5px solid #334155',
                  borderRadius: '14px',
                  padding: '0.85rem',
                  fontWeight: 900,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 14px rgba(15, 23, 42, 0.25)'
                }}
              >
                💬 Envoyer le Reçu par WhatsApp
              </button>

              <button
                onClick={() => {
                  const printWin = window.open('', '_blank');
                  if (printWin) {
                    printWin.document.write(`
                      <!DOCTYPE html>
                      <html>
                        <head>
                          <title>Ticket Reçu ${createdOrderTicket.code}</title>
                          <style>
                            @page { size: A4 portrait; margin: 0; }
                            * { box-sizing: border-box; margin: 0; padding: 0; }
                            html, body {
                              font-family: 'Inter', system-ui, -apple-system, sans-serif;
                              background-color: #F7F3E9;
                              margin: 0;
                              padding: 0;
                              height: 100vh;
                              max-height: 100vh;
                              overflow: hidden !important;
                              display: flex;
                              justify-content: center;
                              align-items: center;
                              color: #1A1815;
                              -webkit-print-color-adjust: exact;
                            }
                            @media print {
                              @page { size: A4 portrait; margin: 0; }
                              html, body { height: 100vh; max-height: 100vh; overflow: hidden !important; background: #FFFFFF; }
                              .ticket { 
                                page-break-inside: avoid !important; 
                                break-inside: avoid !important; 
                                page-break-before: avoid !important; 
                                page-break-after: avoid !important; 
                                max-height: 98vh !important; 
                                margin: auto !important; 
                              }
                            }
                            .ticket {
                              width: 360px;
                              max-height: 96vh;
                              page-break-inside: avoid;
                              break-inside: avoid;
                              background: linear-gradient(180deg, #FBF8F1 0%, #F3EEE3 100%);
                              border: 2px solid #D4AF37;
                              padding: 20px 18px;
                              border-radius: 12px;
                              box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                              position: relative;
                            }
                            .medallion {
                              width: 90px;
                              height: 90px;
                              border-radius: 45px;
                              background: radial-gradient(circle at 35% 35%, #FFF6D6 0%, #E6C675 45%, #9E7D2B 85%, #664F19 100%);
                              padding: 3px;
                              margin: 0 auto 15px auto;
                            }
                            .medallion-inner {
                              width: 100%;
                              height: 100%;
                              border-radius: 50%;
                              background-color: #FDFBF5;
                              display: flex;
                              align-items: center;
                              justify-content: center;
                              font-size: 42px;
                            }
                            .header { text-align: center; margin-bottom: 15px; }
                            .header-title { font-size: 15px; font-weight: 900; text-transform: uppercase; margin: 0; }
                            .header-subtitle { font-size: 12px; color: #3A3630; margin-top: 4px; }
                            .badge {
                              background-color: #2E2721;
                              color: #FAF6ED;
                              font-weight: 900;
                              padding: 8px 16px;
                              border-radius: 14px;
                              display: inline-block;
                              margin-top: 10px;
                              font-size: 13px;
                            }
                            .details { font-size: 15px; line-height: 1.6; margin-bottom: 15px; }
                            .dashed { border-top: 1.5px dashed #A89F8F; margin: 12px 0; }
                            .finance { font-size: 15px; }
                            .total { font-size: 20px; font-weight: 900; margin-bottom: 4px; }
                            .reste { font-size: 18px; font-weight: 900; color: #8B0000; margin-top: 4px; }
                            .qr-container { text-align: center; margin: 15px 0; }
                            .qr-img { border: 2.5px solid #1A1815; padding: 3px; background: #FFF; width: 120px; height: 120px; }
                            .footer-link { font-size: 11px; text-align: center; color: #3A3630; margin-top: 4px; }
                          </style>
                        </head>
                        <body>
                          <div class="ticket">
                            <div class="medallion">
                              <div class="medallion-inner">✂️</div>
                            </div>
                            <div class="header">
                              <div class="header-title">${atelier?.name ? `${atelier.name} - HAUTE COUTURE & SUR-MESURE` : 'MAISON DIGICOUTURE VIP - HAUTE COUTURE & SUR-MESURE'}</div>
                              <div class="header-subtitle">${atelier?.address || atelier?.city || 'Cocody Riviera 3, Abidjan'} - ${atelier?.whatsapp || '+225 0707705067'}</div>
                              <div class="badge">TICKET REÇU N° ${createdOrderTicket.code}</div>
                            </div>
                            <div class="details">
                              <div><strong>Client:</strong> ${createdOrderTicket.clientName}</div>
                              <div><strong>Modèle:</strong> ${createdOrderTicket.modelName}</div>
                              <div><strong>Tissu:</strong> ${createdOrderTicket.fabricName || 'Bazin Riche'}</div>
                              <div><strong>Livraison:</strong> ${createdOrderTicket.deliveryDate}</div>
                            </div>
                            <div class="dashed"></div>
                            <div class="finance">
                              <div class="total">Prix Total: ${createdOrderTicket.totalAmount.toLocaleString()} FCFA</div>
                              <div>Acompte payé (${paymentMethod}): ${createdOrderTicket.depositAmount.toLocaleString()} FCFA</div>
                              <div class="reste">Reste à payer: ${createdOrderTicket.remainingAmount.toLocaleString()} FCFA</div>
                            </div>
                            <div class="dashed"></div>
                            <div class="qr-container">
                              <img src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=https://digicouture.app/suivi/${createdOrderTicket.code}" class="qr-img"/>
                              <div class="footer-link">https://digicouture.app/suivi/${createdOrderTicket.code}</div>
                              <div class="footer-link">Merci de conserver ce reçu digital !</div>
                            </div>
                          </div>
                          <script>
                            window.onload = function() {
                              window.print();
                            };
                          </script>
                        </body>
                      </html>
                    `);
                    printWin.document.close();
                  }
                }}
                style={{
                  backgroundColor: '#FFFDF5',
                  color: '#B8922E',
                  border: '1.5px solid #D4AF37',
                  borderRadius: '14px',
                  padding: '0.75rem',
                  fontWeight: 900,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                👁️ <Printer size={18} /> Voir & Imprimer le Reçu HD
              </button>

              <div style={{ display: 'flex', gap: '0.65rem' }}>
                <button 
                  onClick={() => {
                    const canvas = document.createElement('canvas');
                    canvas.width = 650;
                    canvas.height = 1050;
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                      // Fond Rouleau Nacre
                      ctx.fillStyle = '#F7F3E9';
                      ctx.fillRect(0, 0, 650, 1050);

                      // Médaille Dorée Ciseaux 3D (Extérieur & Intérieur)
                      const centerX = 325;
                      const centerY = 110;
                      
                      // Anneau Extérieur Or
                      ctx.beginPath();
                      ctx.arc(centerX, centerY, 55, 0, Math.PI * 2);
                      ctx.fillStyle = '#E6C675';
                      ctx.fill();
                      ctx.lineWidth = 4;
                      ctx.strokeStyle = '#9E7D2B';
                      ctx.stroke();

                      // Cœur Blanc Crème
                      ctx.beginPath();
                      ctx.arc(centerX, centerY, 47, 0, Math.PI * 2);
                      ctx.fillStyle = '#FDFBF5';
                      ctx.fill();

                      // Émojis / Icône Ciseaux d'Or Centrés
                      ctx.font = '50px sans-serif';
                      ctx.textAlign = 'center';
                      ctx.textBaseline = 'middle';
                      ctx.fillText('✂️', centerX, centerY);

                      // Textes En-tête Atelier
                      ctx.textBaseline = 'alphabetic';
                      ctx.font = 'bold 22px sans-serif';
                      ctx.fillStyle = '#1A1815';
                      ctx.fillText((atelier?.name ? `${atelier.name} - HAUTE COUTURE & SUR-MESURE` : 'MAISON DIGICOUTURE VIP - HAUTE COUTURE & SUR-MESURE').toUpperCase(), 325, 205);
                      
                      ctx.font = '16px sans-serif';
                      ctx.fillStyle = '#3A3630';
                      ctx.fillText(`${atelier?.address || atelier?.city || 'Cocody Riviera 3, Abidjan'} - ${atelier?.whatsapp || '+225 0707705067'}`, 325, 235);

                      // Badge Pilule Noir Arrondi TICKET REÇU N°
                      ctx.fillStyle = '#2E2721';
                      ctx.beginPath();
                      ctx.roundRect(145, 260, 360, 44, 22);
                      ctx.fill();

                      ctx.font = 'bold 18px sans-serif';
                      ctx.fillStyle = '#FAF6ED';
                      ctx.fillText(`TICKET REÇU N° ${createdOrderTicket.code}`, 325, 288);

                      // Métadonnées Client & Modèle
                      ctx.textAlign = 'left';
                      ctx.fillStyle = '#1A1815';
                      ctx.font = 'bold 20px sans-serif';
                      ctx.fillText(`Client: ${createdOrderTicket.clientName}`, 60, 355);
                      ctx.fillText(`Modèle: ${createdOrderTicket.modelName}`, 60, 395);
                      ctx.fillText(`Tissu: ${createdOrderTicket.fabricName || 'Bazin Riche'}`, 60, 435);
                      ctx.fillText(`Livraison: ${createdOrderTicket.deliveryDate}`, 60, 475);

                      // Ligne Pointillée 1
                      ctx.strokeStyle = '#A89F8F';
                      ctx.setLineDash([8, 6]);
                      ctx.beginPath();
                      ctx.moveTo(60, 510);
                      ctx.lineTo(590, 510);
                      ctx.stroke();

                      // Tarifs & Bilan Financier
                      ctx.font = 'bold 28px sans-serif';
                      ctx.fillStyle = '#1A1815';
                      ctx.fillText(`Prix Total: ${createdOrderTicket.totalAmount.toLocaleString()} FCFA`, 60, 560);

                      ctx.font = 'bold 20px sans-serif';
                      ctx.fillStyle = '#2B2620';
                      ctx.fillText(`Acompte payé (${paymentMethod}): ${createdOrderTicket.depositAmount.toLocaleString()} FCFA`, 60, 605);

                      ctx.font = 'bold 26px sans-serif';
                      ctx.fillStyle = '#8B0000';
                      ctx.fillText(`Reste à payer: ${createdOrderTicket.remainingAmount.toLocaleString()} FCFA`, 60, 655);

                      // Ligne Pointillée 2
                      ctx.beginPath();
                      ctx.moveTo(60, 690);
                      ctx.lineTo(590, 690);
                      ctx.stroke();

                      // Chargement & Dessin du QR Code sur Canvas
                      const qrImg = new Image();
                      qrImg.crossOrigin = 'anonymous';
                      qrImg.onload = () => {
                        ctx.drawImage(qrImg, 225, 715, 200, 200);
                        
                        ctx.textAlign = 'center';
                        ctx.font = '16px sans-serif';
                        ctx.fillStyle = '#3A3630';
                        ctx.fillText(`https://digicouture.app/suivi/${createdOrderTicket.code}`, 325, 945);
                        ctx.fillText(`Merci de conserver ce reçu digital !`, 325, 975);

                        const link = document.createElement('a');
                        link.download = `Recu-${createdOrderTicket.code}.png`;
                        link.href = canvas.toDataURL('image/png');
                        link.click();
                      };
                      qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://digicouture.app/suivi/${createdOrderTicket.code}`;
                    }
                  }}
                  style={{ flex: 1, backgroundColor: '#FAF8F5', border: '1.5px solid #EAE5DF', color: '#1A1A1A', borderRadius: '12px', padding: '0.75rem', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer' }}
                >
                  🖼️ Télécharger (Image)
                </button>

                <button 
                  onClick={() => {
                    const printWin = window.open('', '_blank');
                    if (printWin) {
                      printWin.document.write(`
                        <html>
                          <head>
                            <title>Reçu ${createdOrderTicket.code}</title>
                            <style>
                              body { font-family: 'Inter', system-ui, sans-serif; background-color: #F7F3E9; padding: 40px; text-align: center; }
                              .ticket { background: #FBF8F1; border: 2px solid #D4AF37; border-radius: 12px; padding: 30px; max-width: 440px; margin: auto; text-align: left; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
                              .medallion { width: 90px; height: 90px; border-radius: 45px; background: #FFF6D6; border: 3px solid #E6C675; margin: 0 auto 15px auto; display: flex; align-items: center; justify-content: center; font-size: 40px; }
                              .header { text-align: center; }
                              .badge { background: #2E2721; color: #FAF6ED; padding: 8px 16px; border-radius: 12px; font-weight: 900; display: inline-block; margin-top: 10px; }
                              .dashed { border-top: 1.5px dashed #A89F8F; margin: 15px 0; }
                              .total { font-size: 22px; font-weight: 900; }
                              .reste { font-size: 20px; font-weight: 900; color: #8B0000; }
                              .qr { text-align: center; margin-top: 15px; }
                            </style>
                          </head>
                          <body>
                            <div class="ticket">
                              <div class="medallion">✂️</div>
                              <div class="header">
                                <h3 style="margin: 0; text-transform: uppercase;">${atelier?.name || 'MAISON DIGICOUTURE VIP'} - HAUTE COUTURE & SUR-MESURE</h3>
                                <p style="font-size: 13px; color: #3A3630; margin-top: 4px;">${atelier?.address || atelier?.city || 'Cocody Riviera 3, Abidjan'} - ${atelier?.whatsapp || '+225 0707705067'}</p>
                                <div class="badge">TICKET REÇU N° ${createdOrderTicket.code}</div>
                              </div>
                              <div style="margin-top: 20px; font-size: 16px; line-height: 1.6;">
                                <div><strong>Client:</strong> ${createdOrderTicket.clientName}</div>
                                <div><strong>Modèle:</strong> ${createdOrderTicket.modelName}</div>
                                <div><strong>Tissu:</strong> ${createdOrderTicket.fabricName || 'Bazin Riche'}</div>
                                <div><strong>Livraison:</strong> ${createdOrderTicket.deliveryDate}</div>
                              </div>
                              <div class="dashed"></div>
                              <div>
                                <div class="total">Prix Total: ${createdOrderTicket.totalAmount.toLocaleString()} FCFA</div>
                                <div style="margin-top: 4px;">Acompte payé (${paymentMethod}): ${createdOrderTicket.depositAmount.toLocaleString()} FCFA</div>
                                <div class="reste" style="margin-top: 6px;">Reste à payer: ${createdOrderTicket.remainingAmount.toLocaleString()} FCFA</div>
                              </div>
                              <div class="dashed"></div>
                              <div class="qr">
                                <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://digicouture.app/suivi/${createdOrderTicket.code}" width="130" height="130" style="border: 2px solid #1A1815;"/>
                                <p style="font-size: 12px; margin-top: 6px;">https://digicouture.app/suivi/${createdOrderTicket.code}<br/>Merci de conserver ce reçu digital !</p>
                              </div>
                            </div>
                          </body>
                        </html>
                      `);
                      printWin.document.close();
                      printWin.print();
                    }
                  }}
                  style={{ flex: 1, backgroundColor: '#0F172A', border: '1.5px solid #334155', color: '#FFFFFF', borderRadius: '12px', padding: '0.75rem', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer' }}
                >
                  📄 Télécharger (PDF)
                </button>
              </div>

              <button 
                onClick={() => {
                  setCreatedOrderTicket(null);
                  setStep(1);
                  onClose();
                  if (onNavigateToOrders) {
                    onNavigateToOrders();
                  }
                }}
                className="btn btn-primary"
                style={{ padding: '0.85rem', borderRadius: '14px', fontWeight: 900, marginTop: '0.4rem', fontSize: '1rem', width: '100%' }}
              >
                ✓ Quitter & Voir mes Commandes
              </button>
            </div>

          </div>
        )}

      </div>

      {/* 👗 MODAL SELECTION DU MODÈLE DEPUIS LE CATALOGUE (EXACTEMENT COMME SUR MOBILE) */}
      {isCataloguePickerOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(6px)',
          zIndex: 180,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div className="animate-fade-in" style={{
            width: '100%',
            maxWidth: '560px',
            backgroundColor: '#FFFFFF',
            borderRadius: '24px',
            padding: '1.5rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            maxHeight: '85vh',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #EAE5DF', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.4rem' }}>👗</span>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#111827', margin: 0 }}>Choisir un Modèle dans mon Catalogue</h3>
              </div>
              <button onClick={() => setIsCataloguePickerOpen(false)} style={{ border: 'none', background: '#FAF8F5', borderRadius: '10px', padding: '0.3rem 0.6rem', fontSize: '0.9rem', fontWeight: 800, cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ overflowY: 'auto', flex: 1, paddingRight: '0.2rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                {catalogue.map(item => {
                  const codeStr = item.code || `MOD-${item.id.slice(-3)}`;
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        setGarmentType(`${item.title} (${codeStr})`);
                        if (item.imageUrl) setModelImage(item.imageUrl);
                        const priceNum = Number(item.estimatedPrice.replace(/[^0-9]/g, ''));
                        if (priceNum > 0) {
                          setTotalAmountStr(priceNum.toString());
                        }
                        setIsCataloguePickerOpen(false);
                      }}
                      style={{
                        backgroundColor: '#FAF8F5',
                        borderRadius: '16px',
                        border: '1.5px solid #EAE5DF',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        transition: 'transform 0.2s ease',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                        position: 'relative'
                      }}
                    >
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.title} style={{ width: '100%', height: '120px', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '120px', background: 'linear-gradient(135deg, #1E293B, #0F172A)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D4AF37', fontSize: '2rem' }}>
                          👗
                        </div>
                      )}
                      <div style={{ position: 'absolute', top: '8px', left: '8px', backgroundColor: '#D4AF37', color: '#0F172A', fontSize: '0.7rem', fontWeight: 900, padding: '0.2rem 0.5rem', borderRadius: '6px' }}>
                        🏷️ {codeStr}
                      </div>
                      <div style={{ padding: '0.75rem' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#111827', marginBottom: '0.2rem' }}>{item.title}</div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#B8922E' }}>{item.estimatedPrice}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
