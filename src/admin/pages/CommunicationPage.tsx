import React, { useState, useEffect } from 'react';
import { Send, Bell, CheckCircle2, Megaphone, Shield } from 'lucide-react';
import { adminApi } from '../services/adminApi';

export const CommunicationPage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState('normal');
  const [sentSuccess, setSentSuccess] = useState(false);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadAnnouncements = async () => {
    try {
      const res = await adminApi.getAnnouncements();
      if (res.success && res.data) {
        setAnnouncements(res.data);
      }
    } catch (e) {
      console.error('Erreur chargement annonces:', e);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;
    setLoading(true);
    try {
      await adminApi.createAnnouncement(title, message, priority);
      setSentSuccess(true);
      setTitle('');
      setMessage('');
      loadAnnouncements();
      setTimeout(() => setSentSuccess(false), 4000);
    } catch (e: any) {
      alert(e.message || 'Erreur lors de la diffusion de l\'annonce');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px', background: '#0B0B0D', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ color: '#F5F5F5', fontSize: 24, fontWeight: 800, margin: 0 }}>
          Communication & Annonces Système
        </h1>
        <p style={{ color: '#8B8B94', fontSize: 13, marginTop: 4, margin: 0 }}>
          Diffusion de messages d'information, alertes de maintenance et nouveautés aux ateliers clients.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Form Box */}
        <div style={{ background: '#121216', border: '1px solid #24242A', borderRadius: 12, padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <Megaphone size={20} color="#D4AF37" />
            <h2 style={{ color: '#F5F5F5', fontSize: 16, fontWeight: 700, margin: 0 }}>
              Rédiger une nouvelle annonce
            </h2>
          </div>

          {sentSuccess && (
            <div style={{
              background: 'rgba(16,185,129,0.1)',
              border: '1px solid #10B981',
              color: '#10B981',
              padding: '12px 16px',
              borderRadius: 8,
              fontSize: 13,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 20,
            }}>
              <CheckCircle2 size={18} />
              Annonce transmise avec succès à tous les ateliers par notification push et email !
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', color: '#8B8B94', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                Titre de l'annonce
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="ex: Maintenance système programmée..."
                style={{
                  width: '100%',
                  background: '#0B0B0D',
                  border: '1px solid #24242A',
                  borderRadius: 8,
                  padding: '10px 14px',
                  color: '#F5F5F5',
                  fontSize: 13,
                  outline: 'none',
                }}
                required
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', color: '#8B8B94', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                Priorité
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                style={{
                  width: '100%',
                  background: '#0B0B0D',
                  border: '1px solid #24242A',
                  borderRadius: 8,
                  padding: '10px 14px',
                  color: '#F5F5F5',
                  fontSize: 13,
                  outline: 'none',
                }}
              >
                <option value="normal">Normale (Information)</option>
                <option value="important">Importante (Nouveauté / Mise à jour)</option>
                <option value="urgent">Urgent (Maintenance / Sécurité)</option>
              </select>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', color: '#8B8B94', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                Contenu du message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                placeholder="Rédigez le texte de l'annonce qui sera affiché dans le dashboard des ateliers..."
                style={{
                  width: '100%',
                  background: '#0B0B0D',
                  border: '1px solid #24242A',
                  borderRadius: 8,
                  padding: '10px 14px',
                  color: '#F5F5F5',
                  fontSize: 13,
                  outline: 'none',
                  resize: 'vertical',
                }}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                background: loading ? '#4a4a56' : 'linear-gradient(135deg, #D4AF37, #a8862a)',
                border: 'none',
                borderRadius: 8,
                color: '#0B0B0D',
                padding: '12px',
                fontSize: 13,
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <Send size={16} />
              {loading ? 'Envoi en cours...' : 'Diffuser l\'annonce à tous les ateliers'}
            </button>
          </form>
        </div>

        {/* History Box */}
        <div style={{ background: '#121216', border: '1px solid #24242A', borderRadius: 12, padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <Bell size={20} color="#D4AF37" />
            <h2 style={{ color: '#F5F5F5', fontSize: 16, fontWeight: 700, margin: 0 }}>
              Historique des annonces envoyées
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {announcements.length === 0 ? (
              <div style={{ color: '#8B8B94', fontSize: 13, textAlign: 'center', padding: '24px 0' }}>
                Aucune annonce envoyée pour le moment.
              </div>
            ) : (
              announcements.map((ann) => {
                let detailsObj: any = {};
                try { detailsObj = JSON.parse(ann.details || '{}'); } catch (e) {}
                const priorityVal = detailsObj.priority || 'normal';

                return (
                  <div
                    key={ann.id}
                    style={{
                      background: '#0B0B0D',
                      border: '1px solid #24242A',
                      borderRadius: 8,
                      padding: 16,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                      <div style={{ color: '#F5F5F5', fontSize: 13, fontWeight: 700 }}>
                        {ann.title}
                      </div>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 10,
                          background:
                            priorityVal === 'urgent'
                              ? 'rgba(239,68,68,0.15)'
                              : priorityVal === 'important'
                              ? 'rgba(245,158,11,0.15)'
                              : 'rgba(59,130,246,0.15)',
                          color:
                            priorityVal === 'urgent'
                              ? '#EF4444'
                              : priorityVal === 'important'
                              ? '#F59E0B'
                              : '#3B82F6',
                        }}
                      >
                        {priorityVal.toUpperCase()}
                      </span>
                    </div>
                    {detailsObj.message && (
                      <div style={{ color: '#8B8B94', fontSize: 12, marginBottom: 8, lineHeight: 1.4 }}>
                        {detailsObj.message}
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4a4a56', fontSize: 11 }}>
                      <span>Statut : {ann.status || 'Envoyée'}</span>
                      <span>{new Date(ann.createdAt).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div style={{
            marginTop: 20,
            padding: 12,
            background: 'rgba(255,255,255,0.02)',
            borderRadius: 8,
            border: '1px border #24242A',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            color: '#4a4a56',
            fontSize: 12,
          }}>
            <Shield size={16} />
            Les communications sont relayées automatiquement sur les canaux WhatsApp et Email configurés.
          </div>
        </div>
      </div>
    </div>
  );
};
