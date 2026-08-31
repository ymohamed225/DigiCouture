import React, { useState } from 'react';
import type { Order } from '../types';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  User
} from 'lucide-react';

interface CalendarViewProps {
  orders: Order[];
  onOpenOrderDetails: (orderId: string) => void;
  onSendWhatsapp: (phone: string, text: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  orders,
  onOpenOrderDetails,
  onSendWhatsapp
}) => {
  // Mois sélectionné (Août 2026 par défaut)
  const [currentDate, setCurrentDate] = useState(new Date(2026, 7, 1));
  const [selectedDayStr, setSelectedDayStr] = useState('2026-08-25');

  // Mois & Année
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Nom du mois en français
  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  // Calcul du nombre de jours dans le mois et jour de début
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  // Ajustement pour faire commencer la semaine le Lundi (0 = Lundi ... 6 = Dimanche)
  const startingDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  // Navigation Mois
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Obtenir les rendez-vous d'une date (format YYYY-MM-DD)
  const getOrdersForDate = (dateStr: string) => {
    return orders.filter(o => o.deliveryDate === dateStr);
  };

  const selectedDayOrders = getOrdersForDate(selectedDayStr);

  return (
    <div className="animate-fade-in" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* HEADER CALENDRIER & NAVIGATION */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ fontSize: '0.78rem', fontWeight: 900, color: '#D4AF37', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
            ✦ AGENDA & RENDEZ-VOUS SUR-MESURE ✦
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <CalendarIcon size={28} color="#B8922E" /> Calendrier des Retraits & Essayages
          </h2>
        </div>

        {/* Commandes du mois */}
        <div style={{ backgroundColor: '#FFFDF5', border: '1.5px solid #D4AF37', borderRadius: '16px', padding: '0.6rem 1.2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.5rem' }}>📆</span>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#B8922E' }}>{orders.length} Rendez-vous</div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>Planifiés dans l'agenda</div>
          </div>
        </div>
      </div>

      {/* DISPOSITION 2 COLONNES (CALENDRIER MENSUEL + RDV DU JOUR SÉLECTIONNÉ) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1.5rem' }}>
        
        {/* COLONNE GAUCHE : GRILLE CALENDRIER INTERACTIF */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', padding: '1.5rem', border: '1px solid #EAE5DF', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
          
          {/* Header Mois / Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #EAE5DF', paddingBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0F172A', margin: 0 }}>
              {monthNames[month]} {year}
            </h3>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                onClick={handlePrevMonth}
                style={{ backgroundColor: '#FAF8F5', border: '1px solid #EAE5DF', borderRadius: '12px', padding: '0.5rem 0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <ChevronLeft size={18} color="#111827" />
              </button>

              <button 
                onClick={() => {
                  setCurrentDate(new Date(2026, 7, 1));
                  setSelectedDayStr('2026-08-16');
                }}
                style={{ backgroundColor: '#FFFDF5', border: '1.5px solid #D4AF37', borderRadius: '12px', padding: '0.5rem 0.85rem', fontWeight: 800, fontSize: '0.85rem', color: '#B8922E', cursor: 'pointer' }}
              >
                Aujourd'hui
              </button>

              <button 
                onClick={handleNextMonth}
                style={{ backgroundColor: '#FAF8F5', border: '1px solid #EAE5DF', borderRadius: '12px', padding: '0.5rem 0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <ChevronRight size={18} color="#111827" />
              </button>
            </div>
          </div>

          {/* Jours de la semaine (Lundi à Dimanche) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', fontWeight: 800, fontSize: '0.8rem', color: '#64748B', marginBottom: '0.75rem' }}>
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((d, i) => (
              <div key={i} style={{ padding: '0.4rem 0' }}>{d}</div>
            ))}
          </div>

          {/* Case des jours du mois */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.4rem' }}>
            {/* Cases vides début de mois */}
            {Array.from({ length: startingDay }).map((_, i) => (
              <div key={`empty-${i}`} style={{ height: '76px', backgroundColor: '#FAF8F5', borderRadius: '12px', opacity: 0.3 }} />
            ))}

            {/* Jours réels du mois */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const formattedDay = dayNum < 10 ? `0${dayNum}` : `${dayNum}`;
              const formattedMonth = (month + 1) < 10 ? `0${month + 1}` : `${month + 1}`;
              const dateStr = `${year}-${formattedMonth}-${formattedDay}`;

              const dayOrders = getOrdersForDate(dateStr);
              const isSelected = selectedDayStr === dateStr;
              const hasUrgent = dayOrders.some(o => o.urgency === 'tres_urgente');

              return (
                <div
                  key={dayNum}
                  onClick={() => setSelectedDayStr(dateStr)}
                  style={{
                    height: '76px',
                    borderRadius: '14px',
                    padding: '0.4rem',
                    backgroundColor: isSelected ? '#FFFDF5' : dayOrders.length > 0 ? '#FAF8F5' : '#FFFFFF',
                    border: isSelected ? '2px solid #D4AF37' : dayOrders.length > 0 ? '1.5px solid #EAE5DF' : '1px solid #F1F5F9',
                    boxShadow: isSelected ? '0 4px 12px rgba(212,175,55,0.25)' : 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: isSelected ? 900 : 700, color: isSelected ? '#B8922E' : '#0F172A' }}>
                      {dayNum}
                    </span>
                    {hasUrgent && <span style={{ fontSize: '0.65rem' }}>🔴</span>}
                  </div>

                  {/* Badge du nombre de rendez-vous */}
                  {dayOrders.length > 0 && (
                    <div style={{
                      backgroundColor: isSelected ? '#D4AF37' : '#111827',
                      color: '#FFFFFF',
                      borderRadius: '8px',
                      padding: '0.15rem 0.4rem',
                      fontSize: '0.7rem',
                      fontWeight: 900,
                      textAlign: 'center',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {dayOrders.length} RDV {dayOrders.length > 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>

        {/* COLONNE DROITE : RENDEZ-VOUS DU JOUR SÉLECTIONNÉ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div style={{ backgroundColor: '#1E293B', borderRadius: '24px', padding: '1.5rem', border: '1.5px solid #D4AF37', color: '#FFFFFF', boxShadow: '0 8px 24px rgba(15,23,42,0.2)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 900, color: '#D4AF37', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
              📍 DÉTAILS DU JOUR SÉLECTIONNÉ
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#FFFFFF', margin: '0.3rem 0 0.1rem 0' }}>
              📅 {selectedDayStr}
            </h3>
            <div style={{ fontSize: '0.85rem', color: '#94A3B8' }}>
              {selectedDayOrders.length} Rendez-vous de retrait / essayage prévus
            </div>
          </div>

          {/* Liste des RDV */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {selectedDayOrders.length === 0 ? (
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', padding: '2.5rem 1.5rem', textAlign: 'center', border: '1px solid #EAE5DF' }}>
                <span style={{ fontSize: '2.5rem' }}>🕊️</span>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', marginTop: '0.5rem', marginBottom: '0.25rem' }}>
                  Aucun rendez-vous planifié
                </h4>
                <p style={{ fontSize: '0.82rem', color: '#64748B', margin: 0 }}>
                  Sélectionnez un autre jour dans la grille du calendrier pour consulter l'agenda.
                </p>
              </div>
            ) : (
              selectedDayOrders.map(ord => (
                <div
                  key={ord.id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '20px',
                    padding: '1.25rem',
                    border: '1.5px solid #EAE5DF',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.03)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.85rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 900, color: '#B8922E', textTransform: 'uppercase' }}>
                        🔖 {ord.code}
                      </div>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0F172A', margin: '0.1rem 0' }}>
                        👗 {ord.modelName}
                      </h4>
                      <div style={{ fontSize: '0.82rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <User size={13} color="#B8922E" /> <strong>Client :</strong> {ord.clientName}
                      </div>
                    </div>

                    <span style={{
                      padding: '0.35rem 0.75rem',
                      borderRadius: '10px',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      backgroundColor: ord.urgency === 'tres_urgente' ? '#FEF2F2' : '#FFFDF5',
                      color: ord.urgency === 'tres_urgente' ? '#DC2626' : '#B8922E',
                      border: ord.urgency === 'tres_urgente' ? '1px solid #FCA5A5' : '1px solid #D4AF37'
                    }}>
                      {ord.urgency === 'tres_urgente' ? '🔴 URGENT' : '🟢 NORMAL'}
                    </span>
                  </div>

                  <div style={{ backgroundColor: '#FAF8F5', padding: '0.75rem', borderRadius: '12px', fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748B' }}>💰 Total Commande :</span>
                      <strong style={{ color: '#0F172A' }}>{ord.totalAmount.toLocaleString()} FCFA</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748B' }}>💳 Acompte Versé :</span>
                      <strong style={{ color: '#166534' }}>{ord.depositAmount.toLocaleString()} FCFA</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed #D1D5DB', paddingTop: '0.3rem', marginTop: '0.2rem' }}>
                      <span style={{ color: '#DC2626', fontWeight: 800 }}>⚠️ Reste à Payer :</span>
                      <strong style={{ color: '#DC2626', fontSize: '0.9rem' }}>{ord.remainingAmount.toLocaleString()} FCFA</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.65rem' }}>
                    <button
                      onClick={() => onOpenOrderDetails(ord.id)}
                      className="btn btn-secondary"
                      style={{ flex: 1, padding: '0.6rem', fontSize: '0.82rem', fontWeight: 800 }}
                    >
                      Détails Fiche
                    </button>
                    <button
                      onClick={() => onSendWhatsapp(ord.clientWhatsapp, `Bonjour ${ord.clientName} 👋 Votre tenue "${ord.modelName}" est prête pour retrait le ${ord.deliveryDate} !`)}
                      className="btn btn-whatsapp"
                      style={{ flex: 1, padding: '0.6rem', fontSize: '0.82rem', fontWeight: 800 }}
                    >
                      💬 WhatsApp
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
