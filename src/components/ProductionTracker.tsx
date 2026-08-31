import React, { useState } from 'react';
import type { Order } from '../types';
import { 
  ArrowLeft,
  Sparkles,
  Scissors,
  Search,
  Eye,
  Check
} from 'lucide-react';

export const productionSteps: { status: Order['status']; label: string; icon: string; desc: string }[] = [
  { status: 'commande_recue', label: 'Commande Recue', icon: '📦', desc: 'Fiche client créée & acompte validé' },
  { status: 'mesures_prises', label: 'Mesures & Patron', icon: '📏', desc: '22 points de mensuration enregistrés' },
  { status: 'decoupe', label: 'Découpe Tissu', icon: '✂️', desc: 'Cisaillage du Bazin / Pagne en cours' },
  { status: 'couture', label: 'Couture & Assemblage', icon: '🧵', desc: 'Montage sur machine à coudre' },
  { status: 'finitions', label: 'Finitions & Broderie', icon: '🪡', desc: 'Broderie au fil d\'Or & boutons' },
  { status: 'essayage', label: 'Essayage Client', icon: '👗', desc: 'Séance d\'essayage en cabine atelier' },
  { status: 'prete', label: 'Tenue Prête !', icon: '✅', desc: 'Repassée, cintrée & sous housse' },
  { status: 'livree', label: 'Livrée au Client', icon: '🎉', desc: 'Retirée et solde intégral réglé' }
];

interface ProductionTrackerProps {
  orders: Order[];
  onUpdateStatus: (orderId: string, status: Order['status']) => void;
  onSendWhatsapp: (phone: string, message: string) => void;
  onOpenClientPortal?: (orderId: string) => void;
}

export const ProductionTracker: React.FC<ProductionTrackerProps> = ({
  orders,
  onUpdateStatus,
  onSendWhatsapp
}) => {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStep, setFilterStep] = useState<string>('tous');
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [showDeliveryReceiptModal, setShowDeliveryReceiptModal] = useState(false);

  const selectedOrder = orders.find(o => o.id === selectedOrderId);

  const getStepIndex = (status: Order['status']) => {
    return productionSteps.findIndex(s => s.status === status);
  };

  const filteredOrders = orders.filter(o => {
    const matchSearch = o.clientName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        o.modelName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        (o.orderNumber || o.code || '').toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchSearch) return false;
    if (filterStep !== 'tous' && o.status !== filterStep) return false;
    return true;
  });

  return (
    <div className="animate-fade-in" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* VUE DÉTAILLÉE FICHE COMMANDE (SELECTIONNÉE) */}
      {selectedOrder ? (
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', padding: '2rem', border: '2px solid #D4AF37', boxShadow: '0 20px 50px rgba(0,0,0,0.06)' }}>
          
          <button 
            onClick={() => setSelectedOrderId(null)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', border: '1px solid #EAE5DF', backgroundColor: '#FFFDF5', borderRadius: '12px', padding: '0.6rem 1.25rem', color: '#B8922E', fontWeight: 800, marginBottom: '1.5rem', cursor: 'pointer' }}
          >
            <ArrowLeft size={18} /> ← Retour au tableau de suivi de production
          </button>

          {/* Grille Principale 2 Colonnes Détail Commande */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '2rem' }}>
            
            {/* Colonne Gauche : Modèle, Client & Infos Financières */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* Photo du Modèle Haute Définition */}
              <div 
                onClick={() => selectedOrder.modelImageUrl && !selectedOrder.modelImageUrl.includes('photo-1566174053879-31528523f8ae') ? setZoomedImage(selectedOrder.modelImageUrl) : null}
                style={{ borderRadius: '20px', overflow: 'hidden', height: '340px', position: 'relative', border: '2px solid #D4AF37', cursor: 'pointer', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', backgroundColor: '#0F172A' }}
              >
                {selectedOrder.modelImageUrl && !selectedOrder.modelImageUrl.includes('photo-1566174053879-31528523f8ae') ? (
                  <img 
                    src={selectedOrder.modelImageUrl} 
                    alt={selectedOrder.modelName}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{
                    width: '100%', height: '100%',
                    background: 'linear-gradient(135deg, #1E293B, #0F172A)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    gap: 12, color: '#D4AF37'
                  }}>
                    <div style={{ fontSize: 48 }}>👗</div>
                    <span style={{ fontSize: 16, fontWeight: 900, color: '#F8FAFC', letterSpacing: 0.5 }}>{selectedOrder.modelName}</span>
                    <span style={{ fontSize: 13, color: '#94A3B8' }}>{selectedOrder.garmentType || 'Création Sur-Mesure VIP'}</span>
                  </div>
                )}
                <div style={{ position: 'absolute', top: '16px', right: '16px', backgroundColor: '#1E293B', color: '#D4AF37', border: '1.5px solid #D4AF37', padding: '0.4rem 0.85rem', borderRadius: '12px', fontWeight: 900, fontSize: '0.85rem' }}>
                  {selectedOrder.code}
                </div>
                {selectedOrder.modelImageUrl && !selectedOrder.modelImageUrl.includes('photo-1566174053879-31528523f8ae') && (
                  <div style={{ position: 'absolute', bottom: '14px', left: '14px', backgroundColor: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(6px)', color: '#FFFFFF', padding: '0.4rem 0.85rem', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 800 }}>
                    🔍 Cliquez pour agrandir en HD
                  </div>
                )}
              </div>

              {/* Fiche Synthèse Client */}
              <div style={{ backgroundColor: '#FFFDF5', borderRadius: '20px', padding: '1.5rem', border: '1.5px solid #D4AF37' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 900, color: '#B8922E', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                  👤 CLIENT & CONFECTION SUR-MESURE
                </div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0F172A', margin: 0 }}>
                  {selectedOrder.modelName}
                </h3>
                <p style={{ fontSize: '0.95rem', color: '#64748B', fontWeight: 700, marginTop: '0.25rem', marginBottom: '1.25rem' }}>
                  Client : <strong style={{ color: '#0F172A' }}>{selectedOrder.clientName}</strong> ({selectedOrder.clientWhatsapp})
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.88rem', borderTop: '1px solid #EAE5DF', paddingTop: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>🧵 Tissu / Matière :</span>
                    <strong style={{ color: '#0F172A' }}>{selectedOrder.fabricName || 'Bazin Riche Luxe'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>🚀 Date de Livraison :</span>
                    <strong style={{ color: '#B8922E' }}>{selectedOrder.deliveryDate}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>💰 Prix Total :</span>
                    <strong style={{ color: '#0F172A' }}>{selectedOrder.totalAmount.toLocaleString()} FCFA</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#166534' }}>💳 Acompte Payé :</span>
                    <strong style={{ color: '#166534' }}>{selectedOrder.depositAmount.toLocaleString()} FCFA</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed #DC2626', paddingTop: '0.5rem', marginTop: '0.2rem' }}>
                    <span style={{ color: '#DC2626', fontWeight: 900 }}>⚠️ Reste à Payer :</span>
                    <strong style={{ color: '#DC2626', fontSize: '1.1rem', fontWeight: 900 }}>{selectedOrder.remainingAmount.toLocaleString()} FCFA</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginTop: '1.25rem' }}>
                  <button 
                    onClick={() => {
                      const msg = `Bonjour ${selectedOrder.clientName} 👋 Votre tenue "*${selectedOrder.modelName}*" (${selectedOrder.code}) est actuellement à l'étape : *${productionSteps.find(s => s.status === selectedOrder.status)?.label}*.`;
                      onSendWhatsapp(selectedOrder.clientWhatsapp, msg);
                    }}
                    className="btn btn-whatsapp"
                    style={{ width: '100%', padding: '0.85rem', fontSize: '0.9rem', fontWeight: 800 }}
                  >
                    💬 Notifier le Client sur WhatsApp
                  </button>

                  <button 
                    onClick={() => setShowDeliveryReceiptModal(true)}
                    style={{
                      width: '100%',
                      padding: '0.85rem',
                      fontSize: '0.9rem',
                      fontWeight: 800,
                      backgroundColor: '#1E293B',
                      color: '#FFFFFF',
                      border: '1.5px solid #D4AF37',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      boxShadow: '0 4px 12px rgba(15, 23, 42, 0.2)'
                    }}
                  >
                    🧾 Générer Reçu de Livraison Officiel
                  </button>
                </div>
              </div>

            </div>

            {/* Colonne Droite : Le Kanban Interactif des 8 Étapes d'Atelier */}
            <div style={{ backgroundColor: '#FAF8F5', borderRadius: '24px', padding: '1.75rem', border: '1px solid #EAE5DF', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 900, color: '#D4AF37', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                  ✂️ WORKFLOW ATELIER HAUTE COUTURE
                </div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0F172A', margin: 0 }}>
                  Suivi de Confection en 8 Étapes
                </h3>
              </div>

              {/* Bouton Action Directe "Passer à l'Étape Suivante" */}
              <button 
                onClick={() => {
                  const currentIdx = getStepIndex(selectedOrder.status);
                  if (currentIdx < productionSteps.length - 1) {
                    onUpdateStatus(selectedOrder.id, productionSteps[currentIdx + 1].status);
                  }
                }}
                className="btn btn-primary"
                style={{ width: '100%', padding: '1rem', fontSize: '1rem', fontWeight: 900, borderRadius: '16px', boxShadow: '0 6px 18px rgba(212, 175, 55, 0.35)' }}
              >
                <Sparkles size={18} /> Passer à l'étape suivante (→ {productionSteps[Math.min(productionSteps.length - 1, getStepIndex(selectedOrder.status) + 1)].label})
              </button>

              {/* Liste Verticale des 8 Étapes Interactives */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {productionSteps.map((st, idx) => {
                  const currentIdx = getStepIndex(selectedOrder.status);
                  const isPassed = idx <= currentIdx;
                  const isCurrent = idx === currentIdx;

                  return (
                    <div 
                      key={st.status}
                      onClick={() => onUpdateStatus(selectedOrder.id, st.status)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.9rem 1.1rem',
                        borderRadius: '16px',
                        backgroundColor: isCurrent ? '#FFFDF5' : isPassed ? '#FFFFFF' : 'transparent',
                        border: isCurrent ? '2.5px solid #D4AF37' : isPassed ? '1.5px solid #EAE5DF' : '1px dashed #CBD5E1',
                        boxShadow: isCurrent ? '0 4px 14px rgba(212, 175, 55, 0.25)' : 'none',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: isCurrent ? '#FFF7E6' : isPassed ? '#F0FDF4' : '#F1F5F9', border: isCurrent ? '1px solid #D4AF37' : isPassed ? '1px solid #86EFAC' : '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
                          {st.icon}
                        </div>
                        <div>
                          <div style={{ fontWeight: isCurrent ? 900 : isPassed ? 800 : 600, fontSize: '0.95rem', color: isCurrent ? '#B8922E' : isPassed ? '#0F172A' : '#64748B' }}>
                            Étape {idx + 1} : {st.label}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 500 }}>
                            {st.desc}
                          </div>
                        </div>
                      </div>

                      <div>
                        {isCurrent ? (
                          <span style={{ backgroundColor: '#D4AF37', color: '#FFFFFF', padding: '0.3rem 0.7rem', borderRadius: '8px', fontSize: '0.72rem', fontWeight: 900, letterSpacing: '0.5px' }}>
                            EN COURS ⏳
                          </span>
                        ) : isPassed ? (
                          <div style={{ width: '26px', height: '26px', borderRadius: '13px', backgroundColor: '#166534', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Check size={16} />
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: '#CBD5E1', fontWeight: 700 }}>À venir</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>

          </div>

        </div>
      ) : (
        /* TABLEAU DE BORD DE PRODUCTION (LISTE & CARTES ATELIER DE LUXE) */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Header Suivi Production */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 900, color: '#D4AF37', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                ✦ SUIVI CONTINU DE CONFECTION ATELIER ✦
              </div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Scissors size={28} color="#B8922E" /> Suivi de Production & Confections
              </h2>
            </div>

            {/* Statistiques Avancement */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <div style={{ backgroundColor: '#FFFDF5', border: '1.5px solid #D4AF37', borderRadius: '16px', padding: '0.5rem 1rem', textAlign: 'center' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#B8922E' }}>{orders.filter(o => o.status !== 'livree').length}</div>
                <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700 }}>En atelier</div>
              </div>
              <div style={{ backgroundColor: '#F0FDF4', border: '1.5px solid #25D366', borderRadius: '16px', padding: '0.5rem 1rem', textAlign: 'center' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#166534' }}>{orders.filter(o => o.status === 'prete').length}</div>
                <div style={{ fontSize: '0.7rem', color: '#15803D', fontWeight: 700 }}>Tenues Prêtes</div>
              </div>
            </div>
          </div>

          {/* BARRE DE RECHERCHE ET ETAPES PIPELINE DE PRODUCTION */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', padding: '1.25rem', border: '1px solid #EAE5DF', boxShadow: '0 4px 16px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {/* Recherche */}
              <div style={{ flex: 1, minWidth: '280px', position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Search size={18} color="#94A3B8" style={{ position: 'absolute', left: '14px' }} />
                <input 
                  type="text"
                  placeholder="Rechercher par code commande, client ou modèle..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem 0.75rem 2.6rem',
                    borderRadius: '14px',
                    border: '1px solid #EAE5DF',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    color: '#0F172A',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Filtres par Étape */}
              <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.2rem' }}>
                <button
                  onClick={() => setFilterStep('tous')}
                  style={{
                    padding: '0.6rem 1rem',
                    borderRadius: '12px',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    border: filterStep === 'tous' ? '1.5px solid #D4AF37' : '1px solid #EAE5DF',
                    backgroundColor: filterStep === 'tous' ? '#FFFDF5' : '#FFFFFF',
                    color: filterStep === 'tous' ? '#B8922E' : '#64748B'
                  }}
                >
                  Tous ({orders.length})
                </button>
                {productionSteps.map(st => {
                  const count = orders.filter(o => o.status === st.status).length;
                  return (
                    <button
                      key={st.status}
                      onClick={() => setFilterStep(st.status)}
                      style={{
                        padding: '0.6rem 1rem',
                        borderRadius: '12px',
                        fontSize: '0.82rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        border: filterStep === st.status ? '1.5px solid #D4AF37' : '1px solid #EAE5DF',
                        backgroundColor: filterStep === st.status ? '#FFFDF5' : '#FFFFFF',
                        color: filterStep === st.status ? '#B8922E' : '#64748B'
                      }}
                    >
                      {st.icon} {st.label} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* GRILLE DES COMMANDES EN COURS DE PRODUCTION (VISUELS 340px & BOUTONS DIRECTS ÉTAPES) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.5rem' }}>
            {filteredOrders.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', backgroundColor: '#FFFFFF', borderRadius: '24px', padding: '3rem', textAlign: 'center', border: '1px solid #EAE5DF' }}>
                <span style={{ fontSize: '3rem' }}>✂️</span>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', marginTop: '0.75rem' }}>Aucune confection ne correspond à vos critères</h3>
                <p style={{ color: '#64748B', fontSize: '0.9rem' }}>Modifiez votre filtre d'étape ou votre recherche.</p>
              </div>
            ) : (
              filteredOrders.map(order => {
                const currentIdx = getStepIndex(order.status);
                const currentStepObj = productionSteps[currentIdx];
                const progressPct = Math.round(((currentIdx + 1) / productionSteps.length) * 100);

                return (
                  <div
                    key={order.id}
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '24px',
                      border: '1.5px solid #EAE5DF',
                      boxShadow: '0 6px 20px rgba(0,0,0,0.04)',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {/* Header Image du Modèle Confectionné (240px) */}
                    <div style={{ height: '240px', position: 'relative', overflow: 'hidden', backgroundColor: '#0F172A' }}>
                      {order.modelImageUrl && !order.modelImageUrl.includes('photo-1566174053879-31528523f8ae') ? (
                        <img 
                          src={order.modelImageUrl} 
                          alt={order.modelName}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <div style={{
                          width: '100%', height: '100%',
                          background: 'linear-gradient(135deg, #1E293B, #0F172A)',
                          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                          gap: 8, color: '#D4AF37'
                        }}>
                          <div style={{ fontSize: 36 }}>👗</div>
                          <span style={{ fontSize: 13, fontWeight: 800, color: '#F8FAFC', letterSpacing: 0.5 }}>{order.modelName}</span>
                          <span style={{ fontSize: 11, color: '#94A3B8' }}>{order.garmentType || 'Création Sur-Mesure'}</span>
                        </div>
                      )}

                      <div style={{ position: 'absolute', top: '12px', left: '12px', backgroundColor: '#1E293B', color: '#D4AF37', border: '1px solid #D4AF37', padding: '0.35rem 0.75rem', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 900 }}>
                        {order.code}
                      </div>

                      <div style={{ position: 'absolute', top: '12px', right: '12px', backgroundColor: order.urgency === 'tres_urgente' ? '#FEF2F2' : '#FFFDF5', color: order.urgency === 'tres_urgente' ? '#DC2626' : '#B8922E', border: order.urgency === 'tres_urgente' ? '1px solid #FCA5A5' : '1px solid #D4AF37', padding: '0.35rem 0.75rem', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 900 }}>
                        {order.urgency === 'tres_urgente' ? '🔴 URGENT' : '🟢 NORMAL'}
                      </div>

                      <div style={{ position: 'absolute', bottom: '12px', left: '12px', backgroundColor: 'rgba(15, 23, 42, 0.88)', backdropFilter: 'blur(6px)', padding: '0.4rem 0.8rem', borderRadius: '10px', color: '#FFFFFF', fontSize: '0.8rem', fontWeight: 800 }}>
                        👤 {order.clientName}
                      </div>
                    </div>

                    {/* Contenu Carte Confection */}
                    <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
                      
                      <div>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0F172A', margin: 0 }}>
                          👗 {order.modelName}
                        </h3>
                        <div style={{ fontSize: '0.82rem', color: '#64748B', marginTop: '2px', fontWeight: '600' }}>
                          📅 Livraison : <strong>{order.deliveryDate}</strong> • Reste : <strong style={{ color: '#DC2626' }}>{order.remainingAmount.toLocaleString()} FCFA</strong>
                        </div>
                      </div>

                      {/* Barre d'Avancement de Production */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 800, marginBottom: '0.4rem' }}>
                          <span style={{ color: '#B8922E' }}>Étape {currentIdx + 1}/8 : {currentStepObj.icon} {currentStepObj.label}</span>
                          <span style={{ color: '#0F172A' }}>{progressPct}%</span>
                        </div>
                        <div style={{ height: '8px', backgroundColor: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: `${progressPct}%`, height: '100%', backgroundColor: '#D4AF37', borderRadius: '4px', transition: 'width 0.3s ease' }} />
                        </div>
                      </div>

                      {/* Boutons d'Action Avancement Étape */}
                      <div style={{ display: 'flex', gap: '0.65rem', marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid #F1F5F9' }}>
                        <button
                          onClick={() => setSelectedOrderId(order.id)}
                          className="btn btn-secondary"
                          style={{ flex: 1, padding: '0.65rem', fontSize: '0.82rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                        >
                          <Eye size={15} /> Voir Fiche Workflow
                        </button>
                        
                        <button
                          onClick={() => {
                            if (currentIdx < productionSteps.length - 1) {
                              onUpdateStatus(order.id, productionSteps[currentIdx + 1].status);
                            }
                          }}
                          className="btn btn-primary"
                          style={{ flex: 1, padding: '0.65rem', fontSize: '0.82rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                        >
                          <Sparkles size={15} /> Avancer →
                        </button>
                      </div>

                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>
      )}

      {/* LIGHTBOX ZOOM PHOTO GRAND ÉCRAN HAUTE DÉFINITION */}
      {zoomedImage && (
        <div 
          onClick={() => setZoomedImage(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(10px)',
            zIndex: 999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            cursor: 'pointer'
          }}
        >
          <img 
            src={zoomedImage} 
            alt="Modèle Confection" 
            style={{ maxHeight: '88vh', maxWidth: '92vw', borderRadius: '20px', boxShadow: '0 25px 60px rgba(0,0,0,0.5)', border: '2px solid #D4AF37', objectFit: 'contain' }}
          />
          <div style={{ color: '#FFFFFF', marginTop: '1rem', fontWeight: 800, fontSize: '0.9rem', backgroundColor: 'rgba(212,175,55,0.2)', padding: '0.4rem 1.25rem', borderRadius: '20px', border: '1px solid #D4AF37' }}>
            ✕ Cliquez n'importe où pour fermer le zoom HD
          </div>
        </div>
      )}

      {/* 🧾 MODAL GRAND FORMAT DU REÇU DE LIVRAISON OFFICIEL CERTIFIÉ ATELIER */}
      {showDeliveryReceiptModal && selectedOrder && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(8px)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.25rem'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '540px',
            backgroundColor: '#FFFFFF',
            borderRadius: '24px',
            border: '2.5px solid #D4AF37',
            padding: '2rem',
            boxShadow: '0 25px 60px rgba(0,0,0,0.35)',
            maxHeight: '92vh',
            overflowY: 'auto'
          }}>
            {/* Header du Reçu de Livraison */}
            <div style={{ textAlign: 'center', borderBottom: '2px dashed #EAE5DF', paddingBottom: '1.25rem', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 900, color: '#D4AF37', letterSpacing: '2px', textTransform: 'uppercase' }}>
                ✦ MAISON DE HAUTE COUTURE VIP ✦
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0F172A', margin: '0.2rem 0' }}>
                REÇU DE LIVRAISON OFFICIEL
              </h2>
              <span className="badge badge-gold" style={{ fontSize: '0.75rem' }}>
                CERTIFICAT DE CONFORMITÉ & RETRAIT # {selectedOrder.code}
              </span>
            </div>

            {/* Corps du Reçu & Détails */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              
              <div style={{ backgroundColor: '#FFFDF5', padding: '1rem', borderRadius: '16px', border: '1px solid #FDE68A', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#B8922E', fontWeight: 800, textTransform: 'uppercase' }}>BENÉFICIAIRE / CLIENT</span>
                  <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0F172A' }}>{selectedOrder.clientName}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748B' }}>📞 {selectedOrder.clientWhatsapp}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>DATE DE RETRAIT</span>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#166534' }}>{new Date().toLocaleDateString('fr-FR')}</div>
                </div>
              </div>

              {/* Tableau désignation des tenues */}
              <div style={{ backgroundColor: '#F8FAFC', borderRadius: '16px', padding: '1rem', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', borderBottom: '1px solid #CBD5E1', paddingBottom: '0.4rem' }}>
                  <span>DESIGNATION ARTICLE</span>
                  <span>MONTANT NET</span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A' }}>👗 {selectedOrder.modelName}</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748B' }}>Tissu : {selectedOrder.fabricName || 'Bazin Riche Luxe'}</div>
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 900, color: '#0F172A' }}>
                    {selectedOrder.totalAmount.toLocaleString()} FCFA
                  </div>
                </div>
              </div>

              {/* Bilan financier du règlement */}
              <div style={{ backgroundColor: '#FAF8F5', borderRadius: '16px', padding: '1rem', border: '1px solid #EAE5DF', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: '#64748B' }}>PRIX TOTAL DE LA CONFECTION :</span>
                  <strong style={{ color: '#0F172A' }}>{selectedOrder.totalAmount.toLocaleString()} FCFA</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: '#166534' }}>ACOMPTE ANTERIEUREMENT VERSÉ :</span>
                  <strong style={{ color: '#166534' }}>{selectedOrder.depositAmount.toLocaleString()} FCFA</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', borderTop: '1.5px dashed #CBD5E1', paddingTop: '0.5rem', marginTop: '0.2rem' }}>
                  <span style={{ fontWeight: 900, color: '#166534' }}>SOLDE RÉGLÉ À LA LIVRAISON :</span>
                  <strong style={{ fontSize: '1.1rem', fontWeight: 900, color: '#166534' }}>{selectedOrder.remainingAmount.toLocaleString()} FCFA</strong>
                </div>
              </div>

              {/* Tampon & Signature Digitale */}
              <div style={{ textAlign: 'center', backgroundColor: '#F0FDF4', padding: '0.85rem', borderRadius: '14px', border: '1px solid #86EFAC', color: '#166534', fontWeight: 800, fontSize: '0.82rem' }}>
                ✅ ARTICLE CERTIFIÉ CONFORME & REMIS EN MAINS PROPRES AU CLIENT
              </div>

            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <button
                onClick={() => {
                  const receiptText = `🧾 *REÇU DE LIVRAISON OFFICIEL - MAISON DIGICOUTURE VIP*\n\n` +
                    `📍 *Code Commande :* ${selectedOrder.code}\n` +
                    `👤 *Client :* ${selectedOrder.clientName}\n` +
                    `👗 *Tenue :* ${selectedOrder.modelName}\n` +
                    `🧵 *Tissu :* ${selectedOrder.fabricName || 'Bazin Riche Luxe'}\n` +
                    `-----------------------------------\n` +
                    `💰 *Montant Total :* ${selectedOrder.totalAmount.toLocaleString()} FCFA\n` +
                    `💳 *Acompte Versé :* ${selectedOrder.depositAmount.toLocaleString()} FCFA\n` +
                    `✅ *Solde Solde à la Livraison :* ${selectedOrder.remainingAmount.toLocaleString()} FCFA (SOLDE REGLÉ)\n\n` +
                    `✨ Merci pour votre confiance et à très bientôt chez DigiCouture !`;
                  
                  onSendWhatsapp(selectedOrder.clientWhatsapp, receiptText);
                  setShowDeliveryReceiptModal(false);
                }}
                className="btn btn-whatsapp"
                style={{ width: '100%', padding: '0.85rem', fontSize: '0.9rem', fontWeight: 800 }}
              >
                💬 Envoyer le Reçu de Livraison sur WhatsApp
              </button>

              <button
                onClick={() => {
                  onUpdateStatus(selectedOrder.id, 'livree');
                  setShowDeliveryReceiptModal(false);
                }}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.85rem', fontSize: '0.9rem', fontWeight: 800 }}
              >
                🎉 Marquer la Commande comme "Livrée & Soldée"
              </button>

              <button
                onClick={() => setShowDeliveryReceiptModal(false)}
                className="btn btn-secondary"
                style={{ width: '100%', padding: '0.65rem', fontSize: '0.85rem' }}
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
