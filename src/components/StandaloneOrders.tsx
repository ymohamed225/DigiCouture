import React, { useState } from 'react';
import type { Order } from '../types';
import { 
  Search, 
  Plus, 
  Eye,
  ShoppingBag,
  Grid,
  List
} from 'lucide-react';

interface StandaloneOrdersProps {
  orders: Order[];
  onOpenNewOrderModal: () => void;
  onSelectOrderDetails: (orderId: string) => void;
}

export const StandaloneOrders: React.FC<StandaloneOrdersProps> = ({
  orders,
  onOpenNewOrderModal,
  onSelectOrderDetails
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [filterTab, setFilterTab] = useState<'toutes' | 'urgentes' | 'encours' | 'pretes' | 'livrees'>('toutes');
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      (order.orderNumber || order.code || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.modelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.fabricName && order.fabricName.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterTab === 'urgentes') return order.urgency === 'urgente' || order.urgency === 'tres_urgente';
    if (filterTab === 'encours') return order.status !== 'prete' && order.status !== 'livree';
    if (filterTab === 'pretes') return order.status === 'prete';
    if (filterTab === 'livrees') return order.status === 'livree';

    return true;
  });

  const getStatusBadge = (status: Order['status']) => {
    switch(status) {
      case 'prete':
        return <span style={{ backgroundColor: '#F0FDF4', color: '#166534', border: '1px solid #86EFAC', padding: '0.3rem 0.75rem', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 900 }}>🟢 Prête à Retirer</span>;
      case 'livree':
        return <span style={{ backgroundColor: '#FFFDF5', color: '#B8922E', border: '1px solid #D4AF37', padding: '0.3rem 0.75rem', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 900 }}>🎉 Livrée & Soldée</span>;
      default:
        return <span style={{ backgroundColor: '#FFFDF5', color: '#B8922E', border: '1px solid #F5E8C7', padding: '0.3rem 0.75rem', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 900 }}>🟡 En Couture Atelier</span>;
    }
  };

  return (
    <div className="animate-fade-in" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* HEADER GESTION DES COMMANDES */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ fontSize: '0.78rem', fontWeight: 900, color: '#D4AF37', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
            ✦ REGISTRE GLOBAL DE L'ATELIER HAUTE COUTURE ✦
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <ShoppingBag size={28} color="#B8922E" /> Registre des Commandes Sur-Mesure
          </h2>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {/* Toggle Vue Grille / Tableau */}
          <div style={{ display: 'flex', backgroundColor: '#FFFFFF', padding: '0.2rem', borderRadius: '12px', border: '1px solid #EAE5DF' }}>
            <button 
              onClick={() => setViewMode('grid')}
              style={{ padding: '0.45rem 0.75rem', borderRadius: '8px', border: 'none', backgroundColor: viewMode === 'grid' ? '#FFFDF5' : 'transparent', color: viewMode === 'grid' ? '#B8922E' : '#64748B', cursor: 'pointer' }}
            >
              <Grid size={18} />
            </button>
            <button 
              onClick={() => setViewMode('table')}
              style={{ padding: '0.45rem 0.75rem', borderRadius: '8px', border: 'none', backgroundColor: viewMode === 'table' ? '#FFFDF5' : 'transparent', color: viewMode === 'table' ? '#B8922E' : '#64748B', cursor: 'pointer' }}
            >
              <List size={18} />
            </button>
          </div>

          <button 
            onClick={onOpenNewOrderModal}
            className="btn btn-primary"
            style={{ padding: '0.75rem 1.4rem', fontSize: '0.92rem', borderRadius: '14px', fontWeight: 900, boxShadow: '0 4px 14px rgba(212, 175, 55, 0.35)' }}
          >
            <Plus size={18} /> Nouvelle Commande Sur-Mesure
          </button>
        </div>
      </div>

      {/* BARRE DE RECHERCHE ET ETAPES DE FILTRAGE */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', padding: '1.25rem', border: '1px solid #EAE5DF', boxShadow: '0 4px 16px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {/* Champ de Recherche */}
          <div style={{ flex: 1, minWidth: '280px', position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={18} color="#94A3B8" style={{ position: 'absolute', left: '14px' }} />
            <input 
              type="text"
              placeholder="Rechercher par code commande (CMD-2026), client, modèle ou tissu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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

          {/* Boutons d'Onglets de Filtres */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {[
              { id: 'toutes', label: `Toutes (${orders.length})` },
              { id: 'urgentes', label: `🔴 Urgentes (${orders.filter(o => o.urgency === 'tres_urgente').length})` },
              { id: 'encours', label: `🟡 En Confection (${orders.filter(o => o.status !== 'prete' && o.status !== 'livree').length})` },
              { id: 'pretes', label: `🟢 Prêtes (${orders.filter(o => o.status === 'prete').length})` },
              { id: 'livrees', label: `🎉 Livrées (${orders.filter(o => o.status === 'livree').length})` }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterTab(tab.id as any)}
                style={{
                  padding: '0.65rem 1.1rem',
                  borderRadius: '12px',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  border: filterTab === tab.id ? '1.5px solid #D4AF37' : '1px solid #EAE5DF',
                  backgroundColor: filterTab === tab.id ? '#FFFDF5' : '#FFFFFF',
                  color: filterTab === tab.id ? '#B8922E' : '#64748B'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* VUE GRILLE DE CARTES COMMANDES LUXE (340px PHOTOGRAPHIES ZOOMABLES) */}
      {viewMode === 'grid' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.5rem' }}>
          {filteredOrders.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', backgroundColor: '#FFFFFF', borderRadius: '24px', padding: '3rem', textAlign: 'center', border: '1px solid #EAE5DF' }}>
              <span style={{ fontSize: '3rem' }}>📋</span>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', marginTop: '0.75rem' }}>Aucune commande ne correspond aux filtres</h3>
              <p style={{ color: '#64748B', fontSize: '0.9rem' }}>Essayez d'effacer la recherche ou de changer d'onglet.</p>
            </div>
          ) : (
            filteredOrders.map(order => (
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
                {/* Visual Image du Modèle avec Badge Code et Urgence */}
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

                  {order.modelImageUrl && !order.modelImageUrl.includes('photo-1566174053879-31528523f8ae') && (
                    <div 
                      onClick={() => setZoomedImage(order.modelImageUrl || null)}
                      style={{ position: 'absolute', bottom: '12px', right: '12px', backgroundColor: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(6px)', padding: '0.35rem 0.75rem', borderRadius: '8px', color: '#FFFFFF', fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer' }}
                    >
                      🔍 Zoom HD
                    </div>
                  )}
                </div>

                {/* Détails Financiers & Client */}
                <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
                  
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0F172A', margin: 0 }}>
                        👗 {order.modelName}
                      </h3>
                      {getStatusBadge(order.status)}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: '700' }}>
                      👤 Client : <strong style={{ color: '#0F172A' }}>{order.clientName}</strong> ({order.clientWhatsapp})
                    </div>
                  </div>

                  {/* Rectangle Synthèse Prix Total & Acompte */}
                  <div style={{ backgroundColor: '#FAF8F5', padding: '0.85rem', borderRadius: '14px', border: '1px solid #EAE5DF', display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.82rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748B' }}>🧶 Tissu :</span>
                      <strong style={{ color: '#0F172A' }}>{order.fabricName || 'Bazin Riche Luxe'}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748B' }}>📅 Livraison prévue :</span>
                      <strong style={{ color: '#B8922E' }}>{order.deliveryDate}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed #EAE5DF', paddingTop: '0.4rem', marginTop: '0.2rem' }}>
                      <span style={{ color: '#64748B' }}>💰 Total :</span>
                      <strong style={{ color: '#0F172A' }}>{order.totalAmount.toLocaleString()} FCFA</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#166534' }}>💳 Acompte Versé :</span>
                      <strong style={{ color: '#166534' }}>{order.depositAmount.toLocaleString()} FCFA</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed #FCA5A5', paddingTop: '0.4rem', marginTop: '0.2rem' }}>
                      <span style={{ color: '#DC2626', fontWeight: 900 }}>⚠️ Reste à Payer :</span>
                      <strong style={{ color: '#DC2626', fontSize: '1rem', fontWeight: 900 }}>{order.remainingAmount.toLocaleString()} FCFA</strong>
                    </div>
                  </div>

                  {/* Boutons d'Action Rapide sur la Carte */}
                  <div style={{ display: 'flex', gap: '0.65rem', marginTop: 'auto', paddingTop: '0.5rem' }}>
                    <button
                      onClick={() => onSelectOrderDetails(order.id)}
                      className="btn btn-secondary"
                      style={{ flex: 1, padding: '0.65rem', fontSize: '0.82rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                    >
                      <Eye size={15} /> Voir Reçu & Fiche
                    </button>
                  </div>

                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* VUE TABLEAU REPERTOIRE DES COMMANDES */}
      {viewMode === 'table' && (
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', border: '1px solid #EAE5DF', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#FAF8F5', borderBottom: '1px solid #EAE5DF', color: '#64748B', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '1rem 1.25rem' }}>Code</th>
                <th style={{ padding: '1rem 1.25rem' }}>Client</th>
                <th style={{ padding: '1rem 1.25rem' }}>Modèle & Tissu</th>
                <th style={{ padding: '1rem 1.25rem' }}>Livraison</th>
                <th style={{ padding: '1rem 1.25rem' }}>Montant Total</th>
                <th style={{ padding: '1rem 1.25rem' }}>Reste à Payer</th>
                <th style={{ padding: '1rem 1.25rem' }}>Statut</th>
                <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(ord => (
                <tr key={ord.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '1rem 1.25rem', fontWeight: 900, color: '#B8922E' }}>{ord.code}</td>
                  <td style={{ padding: '1rem 1.25rem', fontWeight: 800, color: '#0F172A' }}>
                    {ord.clientName}
                    <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 500 }}>{ord.clientWhatsapp}</div>
                  </td>
                  <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: '#0F172A' }}>
                    👗 {ord.modelName}
                    <div style={{ fontSize: '0.78rem', color: '#64748B' }}>🧶 {ord.fabricName || 'Bazin Riche'}</div>
                  </td>
                  <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: '#B8922E' }}>{ord.deliveryDate}</td>
                  <td style={{ padding: '1rem 1.25rem', fontWeight: 800, color: '#0F172A' }}>{ord.totalAmount.toLocaleString()} FCFA</td>
                  <td style={{ padding: '1rem 1.25rem', fontWeight: 900, color: '#DC2626' }}>{ord.remainingAmount.toLocaleString()} FCFA</td>
                  <td style={{ padding: '1rem 1.25rem' }}>{getStatusBadge(ord.status)}</td>
                  <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                    <button
                      onClick={() => onSelectOrderDetails(ord.id)}
                      className="btn btn-secondary"
                      style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem', fontWeight: 800 }}
                    >
                      Inspecter 🔍
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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

    </div>
  );
};
