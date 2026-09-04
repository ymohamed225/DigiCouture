import React, { useState } from 'react';
import type { Payment, Order } from '../types';
import { Plus } from 'lucide-react';

interface PaymentsManagerProps {
  payments: Payment[];
  orders: Order[];
  onAddPayment: (payment: Partial<Payment>) => void;
}

export const PaymentsManager: React.FC<PaymentsManagerProps> = ({
  payments,
  orders,
  onAddPayment
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string>(orders[0]?.id || '');
  const [amountInput, setAmountInput] = useState<string>('');
  const [method, setMethod] = useState<'Especes' | 'Wave' | 'Orange Money' | 'MTN Mobile Money' | 'Autre'>('Wave');
  const [note, setNote] = useState<string>('');

  const todayStr = new Date().toISOString().split('T')[0];

  // Calculs financiers sécurisés avec conversion Number() pour les types MySQL DECIMAL
  const totalEncaisseToday = payments
    .filter(p => p.date === todayStr)
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const totalEncaisseMonth = payments
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const totalARecuperer = orders
    .reduce((sum, o) => sum + Number(o.remainingAmount || 0), 0);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amountInput.replace(/[^0-9]/g, '')) || 0;
    const order = orders.find(o => o.id === selectedOrderId) || orders[0];
    if (!order) {
      alert('Aucune commande active disponible pour attribuer cet encaissement.');
      return;
    }
    if (numAmount <= 0) {
      alert('Veuillez saisir un montant d\'encaissement valide supérieur à 0 FCFA.');
      return;
    }

    onAddPayment({
      orderId: order.id,
      clientName: order.clientName,
      amount: numAmount,
      method,
      date: todayStr,
      note
    });

    setIsModalOpen(false);
    setAmountInput('');
    setNote('');
  };

  return (
    <div className="animate-fade-in" style={{ padding: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-main)' }}>
            Gestion des Paiements & Caisse 💰
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Suivez les encaissements en espèces, Wave et Mobile Money de votre atelier.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button 
            onClick={async () => {
              const targetOrder = orders.find(o => o.remainingAmount > 0) || orders[0];
              if (!targetOrder) {
                alert('Aucune commande active avec solde à percevoir.');
                return;
              }
              try {
                const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');
                const res = await fetch(`${API_BASE}/payments/cinetpay/initiate`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    orderId: targetOrder.id,
                    amount: targetOrder.remainingAmount || 5000,
                    clientName: targetOrder.clientName,
                    clientPhone: targetOrder.clientWhatsapp,
                    description: `Paiement Solde Commande ${targetOrder.code}`
                  })
                });
                const data = await res.json();
                if (data.paymentUrl) {
                  window.open(data.paymentUrl, '_blank');
                } else {
                  alert('Échec de génération du guichet CinetPay : ' + (data.error || 'Erreur inconnue'));
                }
              } catch (err) {
                alert('Erreur de connexion au serveur CinetPay.');
              }
            }}
            className="btn btn-secondary"
            style={{ border: '1.5px solid #D4AF37', backgroundColor: '#1E293B', color: '#FFFFFF', fontWeight: 800 }}
          >
            💳 Guichet CinetPay 🇨🇮
          </button>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary"
          >
            <Plus size={18} />
            Enregistrer un paiement
          </button>
        </div>
      </div>

      {/* Cartes financières */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ backgroundColor: 'var(--bg-primary)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Encaissé aujourd'hui</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#059669', marginTop: '0.25rem' }}>
            {totalEncaisseToday.toLocaleString()} FCFA
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-primary)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Encaissé ce mois</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.25rem' }}>
            {totalEncaisseMonth.toLocaleString()} FCFA
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--gold-light)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-gold)' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--gold-dark)', fontWeight: 600 }}>Total reste à récupérer</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#DC2626', marginTop: '0.25rem' }}>
            {totalARecuperer.toLocaleString()} FCFA
          </div>
        </div>
      </div>

      {/* Historique des transactions */}
      <div style={{ backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>
          Historique des Encaissements
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {payments.map(p => {
            const numAmount = Number(p.amount || 0);
            return (
              <div key={p.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.85rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)'
              }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{p.clientName}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Mode : <strong>{p.method}</strong> • Date : {p.date} {p.note && `• (${p.note})`}
                  </div>
                </div>
                <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#059669' }}>
                  +{numAmount.toLocaleString()} FCFA
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal d'enregistrement */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(3px)',
          zIndex: 110,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <form onSubmit={handleSave} style={{
            width: '100%',
            maxWidth: '450px',
            backgroundColor: 'var(--bg-primary)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>
              Enregistrer un Règlement 💳
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Sélectionner la commande *</label>
                <select 
                  value={selectedOrderId || orders[0]?.id || ''}
                  onChange={(e) => setSelectedOrderId(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
                >
                  {orders.map(o => (
                    <option key={o.id} value={o.id}>
                      {o.code} — {o.clientName} (Reste : {o.remainingAmount.toLocaleString()} FCFA)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Montant reçu (FCFA) *</label>
                <input 
                  type="text"
                  required
                  placeholder="Saisir le montant reçu en FCFA (ex: 5000)"
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontSize: '1.05rem', fontWeight: 700 }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Moyen de paiement *</label>
                <select 
                  value={method}
                  onChange={(e) => setMethod(e.target.value as any)}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
                >
                  <option value="Wave">🌊 Wave</option>
                  <option value="Orange Money">🟠 Orange Money</option>
                  <option value="MTN Mobile Money">🟡 MTN Mobile Money</option>
                  <option value="Especes">💵 Espèces (Atelier)</option>
                  <option value="Autre">🏦 Autre Virement</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Note / Référence (Facultatif)</label>
                <input 
                  type="text"
                  placeholder="Ex: Solde de la commande"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">Annuler</button>
              <button type="submit" onClick={handleSave} className="btn btn-primary">Valider l'encaissement</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
