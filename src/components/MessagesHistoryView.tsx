import React, { useState } from 'react';
import { 
  MessageSquare, 
  Send, 
  CheckCheck, 
  Search,
  Plus,
  Sparkles,
  Copy
} from 'lucide-react';

interface SentMessage {
  id: string;
  clientName: string;
  phone: string;
  type: 'ticket' | 'rappel_retrait' | 'suivi_essayage' | 'promotional';
  content: string;
  sentAt: string;
  status: 'envoye' | 'delivre' | 'lu';
}

interface MessagesHistoryViewProps {
  onSendWhatsapp: (phone: string, text: string) => void;
}

export const MessagesHistoryView: React.FC<MessagesHistoryViewProps> = ({
  onSendWhatsapp
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('tous');
  const [showNewMessageComposer, setShowNewMessageComposer] = useState(false);

  // État Nouveau Message Direct WhatsApp
  const [composerClientName, setComposerClientName] = useState('');
  const [composerPhone, setComposerPhone] = useState('');
  const [composerText, setComposerText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modèles Pré-rédigés
  const quickTemplates = [
    {
      title: '📦 Tenue Prête pour Retrait',
      type: 'rappel_retrait',
      text: 'Bonjour [Client] 👋 Bonne nouvelle ! Votre tenue [Modèle] est prête et vous attend à l\'atelier. Vous pouvez passer la récupérer aux heures d\'ouverture ✨'
    },
    {
      title: '💳 Relance Solde & Acompte',
      type: 'ticket',
      text: 'Bonjour [Client] 👋 Nous vous rappelons que le solde de votre commande [Modèle] s\'élève à [Montant] FCFA. Merci d\'effectuer votre règlement pour le retrait.'
    },
    {
      title: '🪡 Invitation Essayage',
      type: 'suivi_essayage',
      text: 'Bonjour [Client] 👋 Votre patron et la première découpe de votre tenue sont prêts ! Nous vous invitons à passer pour la séance d\'essayage 🧵'
    },
    {
      title: '✨ Remerciement & Avis Client',
      type: 'promotional',
      text: 'Bonjour [Client] 👋 Merci pour votre confiance ! Nous espérons que votre tenue vous satisfait pleinement. N\'hésitez pas à nous partager vos photos ! ✨'
    }
  ];

  // Historique enrichi des messages envoyés par l'atelier
  const [messagesList, setMessagesList] = useState<SentMessage[]>([]);

  const filteredMessages = messagesList.filter(msg => {
    const matchSearch = msg.clientName.toLowerCase().includes(searchQuery.toLowerCase()) || msg.content.toLowerCase().includes(searchQuery.toLowerCase()) || msg.phone.includes(searchQuery);
    if (!matchSearch) return false;
    if (typeFilter !== 'tous' && msg.type !== typeFilter) return false;
    return true;
  });

  const handleSendNewMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!composerPhone || !composerText) return;

    const newMsg: SentMessage = {
      id: `msg-${Date.now()}`,
      clientName: composerClientName || 'Client Atelier',
      phone: composerPhone,
      type: 'promotional',
      content: composerText,
      sentAt: 'À l\'instant',
      status: 'delivre'
    };

    setMessagesList([newMsg, ...messagesList]);
    onSendWhatsapp(composerPhone, composerText);
    setComposerText('');
    setComposerClientName('');
    setShowNewMessageComposer(false);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="animate-fade-in" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* HEADER PAGE MESSAGES */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ fontSize: '0.78rem', fontWeight: 900, color: '#D4AF37', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
            ✦ REGISTRE DES COMMUNICATIONS WHATSAPP & SMS ✦
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <MessageSquare size={28} color="#25D366" /> Messages Envoyés & Relances WhatsApp
          </h2>
        </div>

        <button
          onClick={() => setShowNewMessageComposer(!showNewMessageComposer)}
          style={{
            backgroundColor: '#25D366',
            color: '#FFFFFF',
            border: 'none',
            padding: '0.75rem 1.4rem',
            borderRadius: '14px',
            fontSize: '0.9rem',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: '0 4px 14px rgba(37,211,102,0.3)'
          }}
        >
          <Plus size={18} />
          {showNewMessageComposer ? 'Masquer le Compositeur' : 'Nouveau Message WhatsApp'}
        </button>
      </div>

      {/* STATISTIQUES DES COMMUNICATIONS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <div style={{ backgroundColor: '#FFFFFF', padding: '1.25rem', borderRadius: '18px', border: '1px solid #EAE5DF', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: '#F0FDF4', border: '1px solid #25D366', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MessageSquare size={24} color="#25D366" />
          </div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0F172A' }}>{messagesList.length}</div>
            <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>Messages envoyés</div>
          </div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', padding: '1.25rem', borderRadius: '18px', border: '1px solid #EAE5DF', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: '#EFF6FF', border: '1px solid #3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCheck size={24} color="#3B82F6" />
          </div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0F172A' }}>98%</div>
            <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>Taux de délivrabilité</div>
          </div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', padding: '1.25rem', borderRadius: '18px', border: '1px solid #EAE5DF', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: '#FFFDF5', border: '1px solid #D4AF37', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={24} color="#B8922E" />
          </div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#B8922E' }}>Instant</div>
            <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>Envoi 1-clic certifié</div>
          </div>
        </div>
      </div>

      {/* COMPOSITEUR DE NOUVEAU MESSAGE WHATSAPP */}
      {showNewMessageComposer && (
        <div className="animate-fade-in" style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', padding: '1.75rem', border: '2px solid #25D366', boxShadow: '0 8px 30px rgba(37,211,102,0.15)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '1.6rem' }}>💬</span>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>Composer un Message WhatsApp</h3>
              <p style={{ fontSize: '0.82rem', color: '#64748B', margin: 0 }}>Rédigez un message libre ou utilisez l'un des modèles prêts à l'emploi ci-dessous.</p>
            </div>
          </div>

          {/* Sélection rapide de modèles */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0F172A', display: 'block', marginBottom: '0.5rem' }}>
              ⚡ Modèles Prédéfinis (Cliquez pour insérer) :
            </label>
            <div style={{ display: 'flex', gap: '0.6rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
              {quickTemplates.map((tpl, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setComposerText(tpl.text)}
                  style={{
                    padding: '0.55rem 0.9rem',
                    borderRadius: '12px',
                    backgroundColor: '#FAF8F5',
                    border: '1px solid #D4AF37',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: '#B8922E',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {tpl.title}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSendNewMessage} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>Nom du Client (Optionnel)</label>
                <input 
                  type="text"
                  placeholder="Ex: Nom & Prénom du Client"
                  value={composerClientName}
                  onChange={(e) => setComposerClientName(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #EAE5DF', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>Numéro WhatsApp (*)</label>
                <input 
                  type="text"
                  required
                  placeholder="+225 07 07 70 50 67"
                  value={composerPhone}
                  onChange={(e) => setComposerPhone(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #25D366', fontWeight: 700, fontSize: '0.9rem' }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>Texte du Message WhatsApp (*)</label>
              <textarea 
                rows={4}
                required
                placeholder="Tapez votre message ici..."
                value={composerText}
                onChange={(e) => setComposerText(e.target.value)}
                style={{ width: '100%', padding: '0.75rem 0.85rem', borderRadius: '12px', border: '1px solid #25D366', fontSize: '0.9rem', lineHeight: 1.5 }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setShowNewMessageComposer(false)}
                className="btn btn-secondary"
                style={{ padding: '0.65rem 1.2rem' }}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="btn btn-whatsapp"
                style={{ padding: '0.65rem 1.4rem', fontWeight: 800 }}
              >
                <Send size={16} /> Envoyer sur WhatsApp
              </button>
            </div>
          </form>
        </div>
      )}

      {/* BARRE DE RECHERCHE ET FILTRES */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', padding: '1.25rem', border: '1px solid #EAE5DF', boxShadow: '0 4px 16px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {/* Recherche */}
          <div style={{ flex: 1, minWidth: '280px', position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={18} color="#94A3B8" style={{ position: 'absolute', left: '14px' }} />
            <input 
              type="text"
              placeholder="Rechercher par nom de client, numéro ou texte du message..."
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

          {/* Filtre Type */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {[
              { id: 'tous', label: 'Tous les messages' },
              { id: 'ticket', label: '🧾 Reçus de Caisse' },
              { id: 'rappel_retrait', label: '🔔 Rappels Retrait' },
              { id: 'suivi_essayage', label: '🧵 Suivi Essayage' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setTypeFilter(f.id)}
                style={{
                  padding: '0.65rem 1.1rem',
                  borderRadius: '12px',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  border: typeFilter === f.id ? '1.5px solid #25D366' : '1px solid #EAE5DF',
                  backgroundColor: typeFilter === f.id ? '#F0FDF4' : '#FFFFFF',
                  color: typeFilter === f.id ? '#166534' : '#64748B'
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* LISTE DES MESSAGES ENVOYÉS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filteredMessages.length === 0 ? (
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', padding: '3rem', textAlign: 'center', border: '1px solid #EAE5DF' }}>
            <span style={{ fontSize: '3rem' }}>💬</span>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', marginTop: '0.75rem' }}>Aucun message trouvé</h3>
            <p style={{ color: '#64748B', fontSize: '0.9rem' }}>Essayez un autre mot-clé dans la barre de recherche.</p>
          </div>
        ) : (
          filteredMessages.map(msg => (
            <div 
              key={msg.id}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '20px',
                padding: '1.5rem',
                border: '1.5px solid #EAE5DF',
                boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}
            >
              {/* Entête du Message (Client & Heure) */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '22px', backgroundColor: '#F0FDF4', border: '1.5px solid #25D366', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#166534', fontWeight: 900, fontSize: '1.1rem' }}>
                    💬
                  </div>
                  <div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {msg.clientName}
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '0.2rem 0.6rem', borderRadius: '8px', backgroundColor: '#F0FDF4', color: '#166534', border: '1px solid #BBF7D0' }}>
                        {msg.phone}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '2px', fontWeight: '600' }}>
                      Envoyé le {msg.sentAt} • WhatsApp Officiel
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{
                    padding: '0.4rem 0.85rem',
                    borderRadius: '10px',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    backgroundColor: msg.type === 'ticket' ? '#FFFDF5' : '#F0FDF4',
                    color: msg.type === 'ticket' ? '#B8922E' : '#166534',
                    border: msg.type === 'ticket' ? '1px solid #D4AF37' : '1px solid #86EFAC'
                  }}>
                    {msg.type === 'ticket' ? '🧾 Reçu de Caisse' : msg.type === 'rappel_retrait' ? '🔔 Rappel Retrait' : msg.type === 'suivi_essayage' ? '🧵 Suivi Essayage' : '✨ Promotion'}
                  </span>

                  <span style={{ fontSize: '0.8rem', color: '#25D366', display: 'flex', alignItems: 'center', gap: '2px', fontWeight: 800 }}>
                    <CheckCheck size={16} color={msg.status === 'lu' ? '#3B82F6' : '#25D366'} /> {msg.status === 'lu' ? 'Lu' : 'Délivré'}
                  </span>
                </div>
              </div>

              {/* Bulle de Contenu du Message WhatsApp */}
              <div style={{
                backgroundColor: '#DCF8C6',
                borderRadius: '16px',
                padding: '1.1rem 1.25rem',
                border: '1px solid #C4EDA0',
                color: '#111827',
                fontSize: '0.92rem',
                lineHeight: '1.5',
                fontFamily: 'monospace',
                whiteSpace: 'pre-wrap',
                boxShadow: '0 2px 8px rgba(37,211,102,0.1)'
              }}>
                {msg.content}
              </div>

              {/* Boutons d'Action Directe (Copier / Renvoyer sur WhatsApp) */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => copyToClipboard(msg.content, msg.id)}
                  style={{
                    backgroundColor: '#FAF8F5',
                    color: '#64748B',
                    border: '1px solid #EAE5DF',
                    padding: '0.6rem 1rem',
                    borderRadius: '12px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <Copy size={14} /> {copiedId === msg.id ? 'Copié !' : 'Copier'}
                </button>

                <button
                  onClick={() => onSendWhatsapp(msg.phone, msg.content)}
                  className="btn btn-whatsapp"
                  style={{ padding: '0.6rem 1.2rem', fontSize: '0.85rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <Send size={15} /> Renvoyer le message sur WhatsApp
                </button>
              </div>

            </div>
          ))
        )}
      </div>

    </div>
  );
};

