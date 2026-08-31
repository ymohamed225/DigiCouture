import React, { useEffect, useState } from 'react';
import { Search, Sparkles, MapPin, Phone, MessageSquare, X } from 'lucide-react';

interface ModelItem {
  id: string;
  code?: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  price: number;
  show_price: boolean;
  currency: string;
  cover_image: string;
  images: string[];
  colors: string[];
  sizes: string[];
  tags: string[];
  is_published: boolean;
  is_featured: boolean;
  views_count: number;
}

interface AtelierPublicInfo {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  cover_image?: string;
  description: string;
  phone: string;
  whatsapp: string;
  address: string;
  city: string;
  publicUrl: string;
  qrCodeUrl: string;
}

interface PublicCataloguePageProps {
  atelierSlug?: string;
}

export const PublicCataloguePage: React.FC<PublicCataloguePageProps> = ({ atelierSlug: propSlug }) => {
  const parts = window.location.pathname.split('/').filter(Boolean);
  const slug = propSlug || parts[1] || 'maison-elegance';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [atelier, setAtelier] = useState<AtelierPublicInfo | null>(null);
  const [models, setModels] = useState<ModelItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Tous');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<ModelItem | null>(null);
  const [activeGalleryImage, setActiveGalleryImage] = useState<string>('');

  useEffect(() => {
    const fetchCatalogue = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/public/catalogue/${slug}`);
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Catalogue indisponible.');
        }

        setAtelier(data.atelier);
        setModels(data.models || []);
        setCategories(['Tous', ...(data.categories || [])]);
      } catch (err: any) {
        setError(err.message || 'Erreur de chargement du catalogue.');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchCatalogue();
    }
  }, [slug]);

  // Filtrage strictement cantonné à l'atelier consulté (Sections 19 & 20)
  const filteredModels = models.filter(m => {
    let matchesCategory = selectedCategory === 'Tous';
    if (!matchesCategory) {
      if (selectedCategory === 'VEDETTES') {
        matchesCategory = Boolean(m.is_featured);
      } else {
        const filter = selectedCategory.toLowerCase();
        const cat = (m.category || '').toLowerCase();
        matchesCategory = cat.includes(filter) ||
                          filter.includes(cat) ||
                          (filter === 'traditionnel' && cat.includes('tradition')) ||
                          (filter === 'hommes' && (cat.includes('homme') || cat.includes('costume')));
      }
    }

    const matchesSearch = searchQuery.trim() === ''
      ? true
      : m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.code && m.code.toLowerCase().includes(searchQuery.toLowerCase())) ||
        m.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.tags && m.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));

    return matchesCategory && matchesSearch;
  });

  const handleWhatsAppOrder = async (model: ModelItem) => {
    if (!atelier) return;

    try {
      // Enregistrer l'événement de clic WhatsApp (Section 29)
      fetch(`/api/public/catalogue/${atelier.slug}/models/${model.id}/whatsapp-click`, { method: 'POST' }).catch(() => {});
    } catch (e) {}

    const rawWhatsapp = (atelier.whatsapp || atelier.phone || '').replace(/[^0-9]/g, '');
    const cleanWhatsapp = rawWhatsapp.startsWith('225') ? rawWhatsapp : `225${rawWhatsapp}`;

    const modelCodeStr = model.code || `MOD-${model.id.slice(-3)}`;
    const text = `Bonjour ${atelier.name} 👋\n\nJe viens de consulter votre catalogue public sur DigiCouture VIP.\n\nJe souhaite commander la création :\n📌 *${model.name}*\n🏷️ Code Modèle : *${modelCodeStr}*\n${model.show_price ? `💰 Prix : *${model.price.toLocaleString('fr-FR')} ${model.currency || 'FCFA'}*` : ''}\n\nPouvez-vous me guider pour la prise de mesures et la commande ?\n\nMerci !`;

    const waUrl = `https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#0F172A',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#FFFFFF',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{ width: 48, height: 48, border: '3px solid #D4AF37', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '1.25rem', fontSize: '1rem', color: '#D4AF37', fontWeight: 700 }}>
          Chargement de la vitrine d'exception...
        </p>
      </div>
    );
  }

  if (error || !atelier) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#FAF8F5',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        textAlign: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>📜</div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0F172A' }}>Catalogue Indisponible</h1>
        <p style={{ color: '#64748B', maxWidth: 420, margin: '0.5rem 0 1.5rem 0' }}>{error}</p>
        <div style={{ fontSize: '0.85rem', color: '#B8922E', fontWeight: 800, backgroundColor: '#FFFDF5', border: '1px solid #D4AF37', padding: '0.6rem 1.2rem', borderRadius: 14 }}>
          👑 DIGICOUTURE VIP • VITRINE DIGITALISATION
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#FAF8F5',
      color: '#0F172A',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      paddingBottom: '4rem'
    }}>
      {/* 👑 COUVERTURE & HEADER VITRINE HAUTE COUTURE (SECTION 16 & 17) */}
      <header style={{
        backgroundColor: '#0F172A',
        color: '#FFFFFF',
        position: 'relative',
        borderBottom: '3px solid #D4AF37',
        boxShadow: '0 12px 35px rgba(0,0,0,0.3)',
        overflow: 'hidden'
      }}>
        {atelier.cover_image ? (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url(${atelier.cover_image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.25,
            filter: 'blur(4px)'
          }} />
        ) : null}

        <div style={{ position: 'relative', zIndex: 1, padding: '2.5rem 1.25rem 2rem 1.25rem', textAlign: 'center', maxWidth: 640, margin: '0 auto' }}>
          {atelier.logoUrl ? (
            <img
              src={atelier.logoUrl}
              alt={atelier.name}
              style={{ width: 84, height: 84, borderRadius: '50%', objectFit: 'cover', border: '3px solid #D4AF37', boxShadow: '0 8px 25px rgba(212, 175, 55, 0.3)', marginBottom: '1rem' }}
            />
          ) : (
            <div style={{ width: 76, height: 76, borderRadius: '50%', backgroundColor: 'rgba(212, 175, 55, 0.2)', border: '2px solid #D4AF37', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.2rem', margin: '0 auto 1rem auto' }}>
              👑
            </div>
          )}

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', backgroundColor: 'rgba(212, 175, 55, 0.15)', border: '1px solid #D4AF37', padding: '0.3rem 0.85rem', borderRadius: 16, marginBottom: '0.5rem' }}>
            <Sparkles size={14} color="#D4AF37" />
            <span style={{ fontSize: '0.72rem', fontWeight: 900, color: '#D4AF37', letterSpacing: '1.2px', textTransform: 'uppercase' }}>
              MAISON DE COUTURE DE LUXE VIP
            </span>
          </div>

          <h1 style={{ fontSize: '1.8rem', fontWeight: 900, margin: '0 0 0.4rem 0', fontFamily: 'Georgia, serif', color: '#FFFFFF' }}>
            {atelier.name}
          </h1>

          <p style={{ fontSize: '0.92rem', color: '#94A3B8', margin: '0 0 1rem 0', lineHeight: 1.4, fontWeight: 500 }}>
            {atelier.description}
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1.25rem', fontSize: '0.85rem', color: '#CBD5E1', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <MapPin size={15} color="#D4AF37" />
              <span>{atelier.address || atelier.city}</span>
            </div>
            <a
              href={`https://wa.me/${(atelier.whatsapp || atelier.phone).replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#10B981', textDecoration: 'none', fontWeight: 700 }}
            >
              <Phone size={15} color="#10B981" />
              <span>WhatsApp Direct</span>
            </a>
          </div>
        </div>
      </header>

      {/* CONTENU PRINCIPAL CLIENT PLEIN ÉCRAN */}
      <main style={{ width: '100%', maxWidth: '1280px', margin: '0 auto', padding: '1.5rem 1.25rem', boxSizing: 'border-box' }}>
        
        {/* BARRE DE RECHERCHE & COMPTEUR DYNAMIQUE */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
            <Search size={18} color="#94A3B8" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder={`Rechercher un modèle ou un code (ex: MOD-001, Boubou...)...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.85rem 1rem 0.85rem 2.8rem',
                backgroundColor: '#FFFFFF',
                border: '1.5px solid #EAE5DF',
                borderRadius: '16px',
                fontSize: '0.92rem',
                outline: 'none',
                boxShadow: '0 4px 15px rgba(0,0,0,0.02)',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#B8922E', backgroundColor: '#FFFDF5', border: '1.5px solid #D4AF37', padding: '0.75rem 1.25rem', borderRadius: '16px', whiteSpace: 'nowrap' }}>
            ✨ {filteredModels.length} création{filteredModels.length > 1 ? 's' : ''} disponible{filteredModels.length > 1 ? 's' : ''}
          </div>
        </div>

        {/* FILTRES PAR CATÉGORIES */}
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.75rem', marginBottom: '1.5rem', scrollbarWidth: 'none' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                backgroundColor: selectedCategory === cat ? '#0F172A' : '#FFFFFF',
                color: selectedCategory === cat ? '#D4AF37' : '#475569',
                border: selectedCategory === cat ? '1.5px solid #D4AF37' : '1.5px solid #EAE5DF',
                padding: '0.55rem 1.1rem',
                borderRadius: '14px',
                fontSize: '0.85rem',
                fontWeight: 800,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                boxShadow: selectedCategory === cat ? '0 4px 15px rgba(15, 23, 42, 0.2)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              {cat === 'Tous' ? '✨ Tous les Modèles' : cat}
            </button>
          ))}
        </div>

        {/* GRILLE DES MODÈLES PUBLIÉS */}
        {filteredModels.length === 0 ? (
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', padding: '3rem 1.5rem', textAlign: 'center', border: '1.5px solid #EAE5DF' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>👗</div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Aucune création ne correspond à votre recherche
            </h3>
            <p style={{ color: '#64748B', fontSize: '0.88rem', marginTop: '0.4rem' }}>
              Essayez un autre mot-clé ou sélectionnez une autre catégorie.
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '1.25rem'
          }}>
            {filteredModels.map((model) => {
              const codeStr = model.code || `MOD-${model.id.slice(-3)}`;
              return (
                <div
                  key={model.id}
                  onClick={() => {
                    setSelectedModel(model);
                    setActiveGalleryImage(model.cover_image);
                  }}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '20px',
                    border: '1.5px solid #EAE5DF',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    boxShadow: '0 6px 20px rgba(0,0,0,0.03)',
                    transition: 'transform 0.2s ease, boxShadow 0.2s ease',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  {/* Image du Modèle */}
                  <div style={{ position: 'relative', width: '100%', height: 220, backgroundColor: '#F8FAFC', overflow: 'hidden' }}>
                    {model.cover_image ? (
                      <img
                        src={model.cover_image}
                        alt={model.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(135deg, #1E293B, #0F172A)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#D4AF37',
                        padding: '1rem',
                        textAlign: 'center'
                      }}>
                        <span style={{ fontSize: '3rem', marginBottom: '0.4rem' }}>👗</span>
                        <span style={{ fontSize: '0.95rem', fontWeight: 900, color: '#FFFFFF' }}>{model.name}</span>
                        <span style={{ fontSize: '0.7rem', color: '#D4AF37', marginTop: '0.3rem', border: '1px solid #D4AF37', padding: '0.15rem 0.5rem', borderRadius: '6px' }}>Sur-Mesure VIP</span>
                      </div>
                    )}

                    {/* Badge Code Modèle */}
                    <div style={{ position: 'absolute', top: 10, left: 10, backgroundColor: '#D4AF37', color: '#0F172A', fontSize: '0.72rem', fontWeight: 900, padding: '3px 9px', borderRadius: 8, boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>
                      🏷️ {codeStr}
                    </div>

                    {/* Tag Catégorie */}
                    <div style={{ position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(15, 23, 42, 0.85)', color: '#D4AF37', border: '1px solid #D4AF37', fontSize: '0.7rem', fontWeight: 800, padding: '3px 9px', borderRadius: 8 }}>
                      {model.category}
                    </div>
                  </div>

                  {/* Infos Carte */}
                  <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 }}>
                    <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#B8922E', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      CODE : {codeStr}
                    </span>

                    <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0F172A', margin: 0, fontFamily: 'Georgia, serif', lineHeight: 1.3 }}>
                      {model.name}
                    </h3>

                    <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '0 0 0.5rem 0', lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {model.description || "Confection sur-mesure d'exception disponible sur commande."}
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F1F5F9', paddingTop: '0.65rem', marginTop: 'auto' }}>
                      <div style={{ fontSize: '1rem', fontWeight: 900, color: model.show_price ? '#B8922E' : '#64748B' }}>
                        {model.show_price ? `${model.price.toLocaleString('fr-FR')} ${model.currency || 'FCFA'}` : 'Sur devis'}
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleWhatsAppOrder(model);
                        }}
                        style={{
                          backgroundColor: '#10B981',
                          color: '#FFFFFF',
                          border: 'none',
                          padding: '0.5rem 0.85rem',
                          borderRadius: '10px',
                          fontSize: '0.78rem',
                          fontWeight: 900,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4
                        }}
                      >
                        <MessageSquare size={14} />
                        Commander
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </main>

      {/* 👗 MODAL DÉTAIL D'UN MODÈLE (SECTION 21, 22 & 23) */}
      {selectedModel && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(8px)',
          zIndex: 9999,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '28px',
            maxWidth: 560,
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
            position: 'relative'
          }}>
            {/* Bouton Fermer */}
            <button
              onClick={() => setSelectedModel(null)}
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                width: 36,
                height: 36,
                borderRadius: '50%',
                backgroundColor: 'rgba(15,23,42,0.7)',
                color: '#FFFFFF',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 10
              }}
            >
              <X size={20} />
            </button>

            {/* Photo principale & Galerie */}
            <div style={{ width: '100%', height: 320, backgroundColor: '#F8FAFC', position: 'relative' }}>
              <img
                src={activeGalleryImage || selectedModel.cover_image}
                alt={selectedModel.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            {/* Miniatures Galerie */}
            {selectedModel.images && selectedModel.images.length > 0 && (
              <div style={{ display: 'flex', gap: '0.5rem', padding: '0.75rem 1.25rem 0 1.25rem', overflowX: 'auto' }}>
                {[selectedModel.cover_image, ...selectedModel.images].map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt="miniature"
                    onClick={() => setActiveGalleryImage(img)}
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 12,
                      objectFit: 'cover',
                      cursor: 'pointer',
                      border: activeGalleryImage === img ? '2px solid #D4AF37' : '2px solid transparent'
                    }}
                  />
                ))}
              </div>
            )}

            {/* Contenu Description & Options */}
            <div style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.75rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#B8922E', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      {selectedModel.category}
                    </span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#0F172A', backgroundColor: '#D4AF37', padding: '0.15rem 0.5rem', borderRadius: '6px' }}>
                      🏷️ {selectedModel.code || `MOD-${selectedModel.id.slice(-3)}`}
                    </span>
                  </div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0F172A', margin: '0.2rem 0 0', fontFamily: 'Georgia, serif' }}>
                    {selectedModel.name}
                  </h2>
                </div>

                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: selectedModel.show_price ? '#B8922E' : '#64748B', whiteSpace: 'nowrap' }}>
                  {selectedModel.show_price ? `${selectedModel.price.toLocaleString('fr-FR')} ${selectedModel.currency || 'FCFA'}` : 'Sur devis'}
                </div>
              </div>

              <p style={{ fontSize: '0.92rem', color: '#475569', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                {selectedModel.description || 'Création confectionnée sur-mesure dans les ateliers de la Maison.'}
              </p>

              {/* Couleurs disponibles */}
              {selectedModel.colors && selectedModel.colors.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 800, marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                    COULEURS DISPONIBLES :
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {selectedModel.colors.map(c => (
                      <span key={c} style={{ backgroundColor: '#F1F5F9', color: '#0F172A', fontSize: '0.8rem', fontWeight: 700, padding: '4px 10px', borderRadius: 8 }}>
                        🎨 {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Tailles disponibles */}
              {selectedModel.sizes && selectedModel.sizes.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 800, marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                    TAILLES EN ATELIER :
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {selectedModel.sizes.map(s => (
                      <span key={s} style={{ backgroundColor: '#FFFDF5', color: '#B8922E', border: '1px solid #D4AF37', fontSize: '0.8rem', fontWeight: 800, padding: '4px 10px', borderRadius: 8 }}>
                        📏 {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Bouton WhatsApp Direct avec Code Modèle */}
              <button
                onClick={() => handleWhatsAppOrder(selectedModel)}
                style={{
                  width: '100%',
                  backgroundColor: '#10B981',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '16px',
                  padding: '1rem',
                  fontSize: '1rem',
                  fontWeight: 900,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.6rem',
                  boxShadow: '0 8px 25px rgba(16, 185, 129, 0.3)'
                }}
              >
                <MessageSquare size={20} />
                Commander le Modèle ({selectedModel.code || `MOD-${selectedModel.id.slice(-3)}`}) sur WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
