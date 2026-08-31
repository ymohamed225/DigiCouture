import React, { useState } from 'react';
import type { Order, Payment } from '../types';
import { 
  Bell, 
  Clock, 
  AlertTriangle, 
  CreditCard, 
  ChevronRight,
  Sparkles,
  X
} from 'lucide-react';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'urgent' | 'delivery' | 'payment' | 'essayage';
  date: string;
  isRead: boolean;
  orderId?: string;
}

interface NotificationCenterProps {
  orders: Order[];
  payments: Payment[];
  onOpenOrder: (orderId: string) => void;
  onNavigateTab: (tab: string) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  orders,
  payments,
  onOpenOrder,
  onNavigateTab
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Génération dynamique des notifications en temps réel basées sur l'atelier
  const generateNotifications = (): NotificationItem[] => {
    const items: NotificationItem[] = [];
    const today = new Date();

    // 2. Alertes Encaissements récents & Conseils IA Caisse
    payments.slice(0, 2).forEach(p => {
      items.push({
        id: `notif-pay-${p.id}`,
        title: `💳 Nouveau Règlement Reçu`,
        message: `${p.clientName} a versé ${p.amount.toLocaleString()} FCFA via ${p.method}.`,
        type: 'payment',
        date: p.date || p.createdAt || new Date().toISOString().split('T')[0],
        isRead: true
      });
    });

    // 1. Alertes Retrait & Priorités
    orders.forEach(o => {
      if (o.status === 'livree') return;

      const deliveryDate = new Date(o.deliveryDate);
      const diffDays = Math.ceil((deliveryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays < 0) {
        items.push({
          id: `notif-late-${o.id}`,
          title: `⚠️ Retrait en Retard de ${Math.abs(diffDays)}j`,
          message: `La tenue "${o.modelName}" de ${o.clientName} devait être retirée le ${o.deliveryDate}.`,
          type: 'urgent',
          date: 'Aujourd\'hui',
          isRead: false,
          orderId: o.id
        });
      } else if (diffDays === 0) {
        items.push({
          id: `notif-today-${o.id}`,
          title: `⏰ Retrait Prévu AUJOURD'HUI !`,
          message: `Le client ${o.clientName} doit passer récupérer sa tenue "${o.modelName}".`,
          type: 'delivery',
          date: 'Aujourd\'hui',
          isRead: false,
          orderId: o.id
        });
      } else if (diffDays <= 2) {
        items.push({
          id: `notif-soon-${o.id}`,
          title: `⏳ Retrait imminant (J-${diffDays})`,
          message: `Rappel : "${o.modelName}" pour ${o.clientName} est prévue le ${o.deliveryDate}.`,
          type: 'essayage',
          date: 'Imminant',
          isRead: true,
          orderId: o.id
        });
      }

      if (o.status === 'prete') {
        items.push({
          id: `notif-ready-${o.id}`,
          title: `✅ Tenue Prête pour Retrait`,
          message: `"${o.modelName}" est en cabine. Reste à encaisser : ${o.remainingAmount.toLocaleString()} FCFA.`,
          type: 'delivery',
          date: 'Atelier',
          isRead: false,
          orderId: o.id
        });
      }
    });

    // 1. 🔍 DÉTECTION DES INCOHÉRENCES ET NON-SAISIES CRITIQUES PAR L'IA
    orders.forEach(o => {
      // Incohérence financière
      if (o.depositAmount > o.totalAmount) {
        items.push({
          id: `notif-incoh-price-${o.id}`,
          title: `⚠️ IA Incohérence : Acompte supérieur au total !`,
          message: `Sur la commande "${o.modelName}" (${o.clientName}), l'acompte (${o.depositAmount.toLocaleString()} F) dépasse le montant total (${o.totalAmount.toLocaleString()} F).`,
          type: 'urgent',
          date: 'Correction Recommandée',
          isRead: false,
          orderId: o.id
        });
      }

      // Non-saisie du numéro WhatsApp
      if (!o.clientWhatsapp || o.clientWhatsapp.trim() === '') {
        items.push({
          id: `notif-missing-phone-${o.id}`,
          title: `📝 IA Non-saisie : Numéro WhatsApp Manquant`,
          message: `La commande "${o.modelName}" pour ${o.clientName} n'a pas de contact WhatsApp pour l'envoi de reçu.`,
          type: 'urgent',
          date: 'À Saisir',
          isRead: false,
          orderId: o.id
        });
      }

      // Non-saisie du tissu ou d'instructions
      if (!o.fabricName || o.fabricName.trim() === '') {
        items.push({
          id: `notif-missing-fabric-${o.id}`,
          title: `✂️ IA Non-saisie : Nom du Tissu Vide`,
          message: `Pensez à spécifier le type de tissu pour "${o.modelName}" afin d'éviter tout doute à la coupe.`,
          type: 'essayage',
          date: 'Rappel Atelier',
          isRead: true,
          orderId: o.id
        });
      }
    });

    // 2. 🧠 MOTEUR D'IA INTEL LIGENTE DE L'ATELIER (NOTIFICATIONS PRÉDICTIVES DE CONSEIL)
    const activeCutting = orders.filter(o => o.status === 'decoupe' || o.status === 'couture').length;
    if (activeCutting >= 3) {
      items.push({
        id: 'notif-ia-workload',
        title: `🤖 IA Conseil Atelier : Charge Élevée (${activeCutting} confections)`,
        message: `Votre atelier a ${activeCutting} tenues en cours d'assemblage. Recommandation : Priorisez la tenue la plus urgente.`,
        type: 'urgent',
        date: 'Prédiction IA',
        isRead: false
      });
    }

    const uncollectedOrders = orders.filter(o => o.status === 'prete' && o.remainingAmount > 0);
    if (uncollectedOrders.length > 0) {
      const totalUncollected = uncollectedOrders.reduce((sum, o) => sum + o.remainingAmount, 0);
      items.push({
        id: 'notif-ia-cashflow',
        title: `💡 IA Conseil Caisse : ${totalUncollected.toLocaleString()} FCFA prêts à encaisser`,
        message: `${uncollectedOrders.length} tenue(s) prête(s) sont en cabine. Envoyez un rappel WhatsApp automatique en 1 clic pour accélérer vos encaisssements !`,
        type: 'payment',
        date: 'Stratégie Caisse',
        isRead: false
      });
    }

    return items;
  };

  const [notificationsList, setNotificationsList] = useState<NotificationItem[]>(generateNotifications());

  // 🔄 Recalcul et rafraîchissement dynamique des notifications en temps réel
  React.useEffect(() => {
    setNotificationsList(generateNotifications());
  }, [orders, payments]);

  const unreadCount = notificationsList.filter(n => !n.isRead).length;

  const markAllAsRead = () => {
    setNotificationsList(notificationsList.map(n => ({ ...n, isRead: true })));
  };

  return (
    <div style={{ position: 'relative' }}>
      
      {/* 🔔 Bouton Cloche de Notification avec Badge */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        title="Centre de Notifications Atelier"
        style={{
          position: 'relative',
          backgroundColor: '#FFFDF5',
          border: '1.5px solid #D4AF37',
          borderRadius: '14px',
          width: '42px',
          height: '42px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(212, 175, 55, 0.2)',
          transition: 'transform 0.15s ease'
        }}
      >
        <Bell size={20} color="#B8922E" />

        {/* Badge Rouge d'Alertes Non Lues */}
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '-5px',
            right: '-5px',
            backgroundColor: '#EF4444',
            color: '#FFFFFF',
            fontSize: '0.7rem',
            fontWeight: 900,
            width: '20px',
            height: '20px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid #FFFFFF',
            boxShadow: '0 2px 6px rgba(239, 68, 68, 0.4)'
          }}>
            {unreadCount}
          </span>
        )}
      </button>

      {/* 📜 POP-UP DERROULANT CENTRE DE NOTIFICATIONS */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '52px',
          right: 0,
          width: '360px',
          maxHeight: '480px',
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          border: '2px solid #D4AF37',
          boxShadow: '0 20px 50px rgba(15, 23, 42, 0.25)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'fade-in 0.2s ease-out'
        }}>
          {/* Header Pop-up Notifications */}
          <div style={{
            padding: '1.15rem 1.25rem',
            background: 'linear-gradient(135deg, #1E1B4B 0%, #0F172A 100%)',
            color: '#FFFFFF',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Sparkles size={18} color="#D4AF37" />
              <div>
                <h4 style={{ fontSize: '0.98rem', fontWeight: 900, margin: 0 }}>Alertes & Notifications</h4>
                <p style={{ fontSize: '0.7rem', color: '#D4AF37', margin: 0, fontWeight: 700 }}>
                  {unreadCount} alerte(s) nécessitent votre attention
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '0.2rem' }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Marquer Tout comme Lu */}
          {unreadCount > 0 && (
            <div style={{ backgroundColor: '#FFFDF5', padding: '0.5rem 1.25rem', borderBottom: '1px solid #EAE5DF', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={markAllAsRead}
                style={{ background: 'none', border: 'none', color: '#B8922E', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}
              >
                ✓ Tout marquer comme lu
              </button>
            </div>
          )}

          {/* Liste des Notifications */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {notificationsList.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#64748B' }}>
                <span style={{ fontSize: '2rem' }}>🔔</span>
                <p style={{ fontSize: '0.85rem', marginTop: '0.5rem', fontWeight: 600 }}>Aucune notification pour le moment.</p>
              </div>
            ) : (
              notificationsList.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => {
                    if (notif.orderId) {
                      onOpenOrder(notif.orderId);
                      setIsOpen(false);
                    } else {
                      onNavigateTab('payments');
                      setIsOpen(false);
                    }
                  }}
                  style={{
                    backgroundColor: notif.isRead ? '#FAF8F5' : '#FFFDF5',
                    borderRadius: '16px',
                    padding: '0.85rem 1rem',
                    border: notif.isRead ? '1px solid #EAE5DF' : '1.5px solid #D4AF37',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '10px',
                    backgroundColor: notif.type === 'urgent' ? '#FEF2F2' : notif.type === 'payment' ? '#F0FDF4' : '#FFFDF5',
                    border: notif.type === 'urgent' ? '1px solid #EF4444' : notif.type === 'payment' ? '1px solid #86EFAC' : '1px solid #D4AF37',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {notif.type === 'urgent' ? <AlertTriangle size={18} color="#EF4444" /> : notif.type === 'payment' ? <CreditCard size={18} color="#166534" /> : <Clock size={18} color="#B8922E" />}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 900, color: '#0F172A', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>{notif.title}</span>
                      {!notif.isRead && <span style={{ width: '8px', height: '8px', borderRadius: '4px', backgroundColor: '#EF4444' }} />}
                    </div>
                    <p style={{ fontSize: '0.78rem', color: '#475569', margin: '0.2rem 0 0 0', lineHeight: 1.35 }}>
                      {notif.message}
                    </p>
                    <span style={{ fontSize: '0.68rem', color: '#94A3B8', fontWeight: 700, marginTop: '4px', display: 'block' }}>
                      {notif.date}
                    </span>

                    {/* 📲 BOUTON ACTION RAPIDE DISPATCH WHATSAPP AU BON MOMENT */}
                    {notif.orderId && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const targetOrder = orders.find(o => o.id === notif.orderId);
                          if (targetOrder && targetOrder.clientWhatsapp) {
                            const cleanPhone = targetOrder.clientWhatsapp.replace(/[^0-9]/g, '');
                            const msg = `Bonjour ${targetOrder.clientName} 👋, votre tenue "${targetOrder.modelName}" chez DigiCouture est ${targetOrder.status === 'prete' ? 'prête à être retirée !' : 'en cours de finition.'} Reste à régler : ${targetOrder.remainingAmount.toLocaleString()} FCFA. Merci !`;
                            window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
                          } else {
                            alert("⚠️ Aucun numéro WhatsApp valide n'est renseigné pour ce client.");
                          }
                        }}
                        style={{
                          marginTop: '0.5rem',
                          backgroundColor: '#25D366',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '0.35rem 0.75rem',
                          fontSize: '0.72rem',
                          fontWeight: 900,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          boxShadow: '0 2px 6px rgba(37, 211, 102, 0.3)'
                        }}
                      >
                        💬 Envoyer sur WhatsApp au bon moment
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Pop-up */}
          <div style={{ padding: '0.75rem', borderTop: '1px solid #EAE5DF', backgroundColor: '#FAF8F5', textAlign: 'center' }}>
            <button
              onClick={() => {
                onNavigateTab('production');
                setIsOpen(false);
              }}
              style={{ background: 'none', border: 'none', color: '#B8922E', fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              Voir tout le suivi de production <ChevronRight size={14} />
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
