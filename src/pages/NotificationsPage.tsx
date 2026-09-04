import React, { useState, useEffect, useCallback } from 'react';
import { Bell, Search, RefreshCw, Send, CheckCircle2, Clock, MessageSquare, AlertCircle, Sparkles } from 'lucide-react';

interface NotificationItem {
  id: string;
  atelierId: string;
  orderId?: string;
  event: 'ORDER_CREATED' | 'ORDER_STATUS_CHANGED' | 'PAYMENT_RECEIVED' | 'FITTING_REMINDER' | 'ORDER_READY' | 'ORDER_DELIVERED' | 'PAYMENT_REMINDER';
  channel: 'whatsapp' | 'sms' | 'email' | 'push';
  recipient: string;
  message: string;
  sentAt: string;
  status: string;
}

interface SummaryData {
  total: number;
  whatsappCount: number;
  smsCount: number;
  deliveredCount: number;
  fittingReminders: number;
  orderReadyNotifs: number;
  deliveryRate: number;
}

interface NotificationsPageProps {
  atelierId?: string;
}

export const NotificationsPage: React.FC<NotificationsPageProps> = ({ atelierId = 'atl-1787175204484' }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  
  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState('ALL');
  const [selectedChannel, setSelectedChannel] = useState('ALL');
  const page = 1;

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        atelierId,
        page: String(page),
        limit: '20',
        q: searchQuery,
        event: selectedEvent,
        channel: selectedChannel
      });

      const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');
      const [listRes, summaryRes] = await Promise.all([
        fetch(`${API_BASE}/notifications?${params.toString()}`, {
          headers: { 'X-Atelier-Id': atelierId }
        }),
        fetch(`${API_BASE}/notifications/summary?atelierId=${atelierId}`, {
          headers: { 'X-Atelier-Id': atelierId }
        })
      ]);

      const listJson = await listRes.json();
      const summaryJson = await summaryRes.json();

      if (listJson.success) {
        setNotifications(listJson.data || []);
      }

      if (summaryJson.success) {
        setSummary(summaryJson);
      }
    } catch (err: any) {
      setError(err.message || 'Impossible de charger le centre de notifications.');
    } finally {
      setLoading(false);
    }
  }, [atelierId, page, searchQuery, selectedEvent, selectedChannel]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleResend = async (notif: NotificationItem) => {
    try {
      const cleanPhone = notif.recipient.replace(/[^0-9]/g, '');
      const fullPhone = cleanPhone.startsWith('225') ? cleanPhone : `225${cleanPhone}`;
      const waUrl = `https://wa.me/+${fullPhone}?text=${encodeURIComponent(notif.message)}`;
      
      // Ouvrir le lien WhatsApp directement dans une nouvelle fenêtre
      window.open(waUrl, '_blank');

      // Notifier le serveur de la réémission
      const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');
      await fetch(`${API_BASE}/notifications/resend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Atelier-Id': atelierId
        },
        body: JSON.stringify({ notificationId: notif.id })
      });

      loadNotifications();
    } catch (e: any) {
      alert(`Erreur lors de la renvoi : ${e.message}`);
    }
  };

  const getEventBadge = (event: string) => {
    switch (event) {
      case 'ORDER_CREATED':
        return { label: 'Commande Créée', bg: '#EFF6FF', color: '#1E40AF', icon: Sparkles };
      case 'ORDER_READY':
        return { label: 'Tenue Prête ✨', bg: '#ECFDF5', color: '#065F46', icon: CheckCircle2 };
      case 'FITTING_REMINDER':
        return { label: 'Rappel Essayage ⏰', bg: '#FEF3C7', color: '#92400E', icon: Clock };
      case 'PAYMENT_RECEIVED':
        return { label: 'Paiement Reçu 💳', bg: '#F0FDF4', color: '#166534', icon: CheckCircle2 };
      case 'ORDER_STATUS_CHANGED':
        return { label: 'Statut Mis à jour', bg: '#F3E8FF', color: '#6B21A8', icon: RefreshCw };
      case 'SYSTEM_ANNOUNCEMENT':
        return { label: 'Annonce Plateforme 📢', bg: '#FFFDF5', color: '#B8922E', icon: Bell };
      default:
        return { label: event, bg: '#F1F5F9', color: '#334155', icon: Bell };
    }
  };

  return (
    <div className="animate-fade-in" style={{ padding: '1.25rem', width: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem', boxSizing: 'border-box' }}>
      {/* Header du Centre de Notifications */}
      <div style={styles.header}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: '#0F172A', margin: 0 }}>
              Centre de Notifications
            </h1>
            <span style={styles.liveBadge}>
              🔴 En Direct
            </span>
          </div>
          <p style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>
            Vue d'ensemble de tous les messages WhatsApp, SMS et relances envoyés à vos clients.
          </p>
        </div>

        <button onClick={loadNotifications} style={styles.refreshBtn}>
          <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          Actualiser
        </button>
      </div>

      {/* Cartes KPI Synthétiques */}
      {summary && (
        <div style={styles.kpiGrid}>
          <div style={styles.kpiCard}>
            <div style={{ ...styles.kpiIconBox, backgroundColor: '#EFF6FF' }}>
              <MessageSquare size={18} color="#2563EB" />
            </div>
            <div>
              <div style={styles.kpiLabel}>Notifications Émises</div>
              <div style={styles.kpiValue}>{summary.total}</div>
            </div>
          </div>

          <div style={styles.kpiCard}>
            <div style={{ ...styles.kpiIconBox, backgroundColor: '#DCFCE7' }}>
              <Send size={18} color="#16A34A" />
            </div>
            <div>
              <div style={styles.kpiLabel}>WhatsApp Messages</div>
              <div style={styles.kpiValue}>{summary.whatsappCount}</div>
            </div>
          </div>

          <div style={styles.kpiCard}>
            <div style={{ ...styles.kpiIconBox, backgroundColor: '#FEF3C7' }}>
              <Clock size={18} color="#D97706" />
            </div>
            <div>
              <div style={styles.kpiLabel}>Rappels d'Essayages</div>
              <div style={styles.kpiValue}>{summary.fittingReminders}</div>
            </div>
          </div>

          <div style={styles.kpiCard}>
            <div style={{ ...styles.kpiIconBox, backgroundColor: '#F3E8FF' }}>
              <Sparkles size={18} color="#9333EA" />
            </div>
            <div>
              <div style={styles.kpiLabel}>Tenues Prêtes</div>
              <div style={styles.kpiValue}>{summary.orderReadyNotifs}</div>
            </div>
          </div>
        </div>
      )}

      {/* Barre de Recherche et Filtres */}
      <div style={styles.filterBar}>
        <div style={styles.searchBox}>
          <Search size={16} color="#94A3B8" />
          <input
            type="text"
            placeholder="Rechercher par destinataire ou mot-clé..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <select
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
            style={styles.selectFilter}
          >
            <option value="ALL">Tous les Événements</option>
            <option value="ORDER_CREATED">Commande Créée</option>
            <option value="ORDER_READY">Tenue Prête ✨</option>
            <option value="FITTING_REMINDER">Rappel Essayage ⏰</option>
            <option value="PAYMENT_RECEIVED">Paiement Reçu 💳</option>
            <option value="ORDER_STATUS_CHANGED">Changement de Statut</option>
            <option value="SYSTEM_ANNOUNCEMENT">Annonces Plateforme 📢</option>
          </select>

          <select
            value={selectedChannel}
            onChange={(e) => setSelectedChannel(e.target.value)}
            style={styles.selectFilter}
          >
            <option value="ALL">Tous les Canaux</option>
            <option value="whatsapp">💬 WhatsApp</option>
            <option value="sms">📱 SMS</option>
            <option value="email">✉️ Email</option>
          </select>
        </div>
      </div>

      {/* Tableau / Flux d'Activité des Notifications */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748B' }}>
          <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: 10, fontWeight: 600 }}>Chargement des notifications en cours...</p>
        </div>
      ) : error ? (
        <div style={styles.errorBox}>
          <AlertCircle size={20} color="#DC2626" />
          <span>{error}</span>
        </div>
      ) : notifications.length === 0 ? (
        <div style={styles.emptyState}>
          <Bell size={36} color="#CBD5E1" />
          <h3 style={{ fontSize: 16, fontWeight: 800, color: '#334155', margin: '12px 0 4px' }}>
            Aucune notification trouvée
          </h3>
          <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>
            Les messages envoyés à vos clients s'afficheront automatiquement ici.
          </p>
        </div>
      ) : (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeaderRow}>
                <th style={styles.th}>Événement / Type</th>
                <th style={styles.th}>Destinataire</th>
                <th style={styles.th}>Message Envoyé</th>
                <th style={styles.th}>Date & Heure</th>
                <th style={styles.th}>Statut</th>
                <th style={styles.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {notifications.map((n) => {
                const badge = getEventBadge(n.event);
                const BadgeIcon = badge.icon;

                return (
                  <tr key={n.id} style={styles.tableRow}>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.eventBadge,
                        backgroundColor: badge.bg,
                        color: badge.color
                      }}>
                        <BadgeIcon size={12} />
                        {badge.label}
                      </span>
                    </td>

                    <td style={styles.td}>
                      <div style={{ fontWeight: 800, color: '#0F172A' }}>{n.recipient}</div>
                      <div style={{ fontSize: 11, color: '#64748B' }}>💬 {n.channel.toUpperCase()}</div>
                    </td>

                    <td style={{ ...styles.td, maxWidth: 360 }}>
                      <p style={styles.messageText}>{n.message}</p>
                    </td>

                    <td style={styles.td}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#334155' }}>
                        {new Date(n.sentAt).toLocaleDateString('fr-FR')}
                      </div>
                      <div style={{ fontSize: 11, color: '#94A3B8' }}>
                        {new Date(n.sentAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    <td style={styles.td}>
                      <span style={styles.statusBadgeSent}>
                        ✓ {n.status || 'SENT'}
                      </span>
                    </td>

                    <td style={styles.td}>
                      <button
                        onClick={() => handleResend(n)}
                        style={styles.resendBtn}
                        title="Renvoyer ce message sur WhatsApp"
                      >
                        <Send size={12} />
                        WhatsApp
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    flexWrap: 'wrap',
    gap: 16
  },
  liveBadge: {
    backgroundColor: '#FEF2F2',
    color: '#DC2626',
    border: '1px solid #FCA5A5',
    fontSize: 11,
    fontWeight: 800,
    padding: '3px 8px',
    borderRadius: 12
  },
  refreshBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: 10,
    padding: '8px 14px',
    fontSize: 13,
    fontWeight: 700,
    color: '#0F172A',
    cursor: 'pointer'
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: 16,
    marginBottom: 24
  },
  kpiCard: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: 16,
    padding: 16,
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
  },
  kpiIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  kpiLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  kpiValue: {
    fontSize: 22,
    fontWeight: 900,
    color: '#0F172A',
    marginTop: 2
  },
  filterBar: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 14,
    flexWrap: 'wrap'
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F8FAFC',
    border: '1px solid #E2E8F0',
    borderRadius: 10,
    padding: '8px 12px',
    flex: 1,
    minWidth: 260
  },
  searchInput: {
    border: 'none',
    backgroundColor: 'transparent',
    outline: 'none',
    fontSize: 13,
    width: '100%',
    color: '#0F172A'
  },
  selectFilter: {
    backgroundColor: '#F8FAFC',
    border: '1px solid #E2E8F0',
    borderRadius: 10,
    padding: '8px 12px',
    fontSize: 13,
    fontWeight: 600,
    color: '#0F172A',
    outline: 'none',
    cursor: 'pointer'
  },
  tableContainer: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: 16,
    overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left'
  },
  tableHeaderRow: {
    backgroundColor: '#F8FAFC',
    borderBottom: '1px solid #E2E8F0'
  },
  th: {
    padding: '12px 16px',
    fontSize: 11,
    fontWeight: 800,
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  tableRow: {
    borderBottom: '1px solid #F1F5F9'
  },
  td: {
    padding: '14px 16px',
    fontSize: 13,
    verticalAlign: 'middle'
  },
  eventBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '4px 10px',
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 800
  },
  messageText: {
    margin: 0,
    fontSize: 12,
    color: '#334155',
    lineHeight: 1.4,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden'
  },
  statusBadgeSent: {
    backgroundColor: '#DCFCE7',
    color: '#166534',
    fontSize: 11,
    fontWeight: 800,
    padding: '3px 8px',
    borderRadius: 10
  },
  resendBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#25D366',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: 8,
    padding: '6px 10px',
    fontSize: 11,
    fontWeight: 800,
    cursor: 'pointer'
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    border: '1px solid #FECACA',
    color: '#DC2626',
    padding: 16,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    margin: '20px 0'
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    border: '1px dashed #CBD5E1',
    borderRadius: 16,
    padding: '48px 20px',
    textAlign: 'center'
  }
};
