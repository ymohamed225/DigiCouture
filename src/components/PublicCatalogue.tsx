import React, { useState } from 'react';
import type { AtelierProfile, CatalogueItem } from '../types';
import { compressImage } from '../utils/imageCompressor';
import { 
  Search, 
  ArrowLeft,
  Sparkles,
  MessageSquare,
  Sparkle,
  Eye,
  Upload,
  Trash2,
  Link as LinkIcon,
  QrCode,
  Printer
} from 'lucide-react';

interface PublicCatalogueProps {
  atelier: AtelierProfile;
  catalogue: CatalogueItem[];
  onSendWhatsapp: (phone: string, text: string) => void;
  onAddModel?: (item: Partial<CatalogueItem>) => void;
  onDeleteModel?: (id: string) => void;
}

export const PublicCatalogue: React.FC<PublicCatalogueProps> = ({
  atelier,
  catalogue,
  onSendWhatsapp,
  onAddModel,
  onDeleteModel
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'create'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('Toutes');
  const [selectedModel, setSelectedModel] = useState<CatalogueItem | null>(null);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [showQrPosterModal, setShowQrPosterModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const atelierSlug = atelier.slug || (atelier.name ? atelier.name.toLowerCase().replace(/[^a-z0-9]/g, '-') : 'atelier');
  const publicUrl = `https://digicouture.app/atelier/${atelierSlug}`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(publicUrl)}`;

  const handlePrintPoster = () => {
    const printWin = window.open('', '_blank');
    if (printWin) {
      printWin.document.write(`
        <!DOCTYPE html>
        <html lang="fr">
          <head>
            <meta charset="utf-8" />
            <title>Affiche Catalogue QR Code - ${atelier.name || 'DigiCouture VIP'}</title>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=Inter:wght@400;600;700;800;900&display=swap');
              @page { size: A4 portrait; margin: 0; }
              * { box-sizing: border-box; margin: 0; padding: 0; }
              html, body {
                height: 100vh;
                width: 100%;
                max-height: 100vh;
                overflow: hidden !important;
                font-family: 'Inter', system-ui, -apple-system, sans-serif;
                background: #FFFFFF;
                display: flex;
                justify-content: center;
                align-items: center;
                color: #0F172A;
                -webkit-print-color-adjust: exact;
              }
              @media print {
                @page { size: A4 portrait; margin: 0; }
                html, body { height: 100vh; max-height: 100vh; overflow: hidden !important; background: #FFFFFF !important; }
                .poster-card { page-break-inside: avoid !important; break-inside: avoid !important; margin: auto !important; max-height: 98vh !important; }
              }
              .poster-card {
                width: 90%;
                max-width: 440px;
                max-height: 96vh;
                page-break-inside: avoid;
                break-inside: avoid;
                background: #FFFFFF;
                border: 2.5px solid #D4AF37;
                border-radius: 24px;
                padding: 24px 20px 20px 20px;
                text-align: center;
                box-shadow: 0 15px 45px rgba(0,0,0,0.1);
                position: relative;
              }
              .gold-inner {
                border: 1.5px dashed #D4AF37;
                border-radius: 18px;
                padding: 20px 16px;
                background: #FFFFFF;
              }
              .medallion {
                width: 72px;
                height: 72px;
                border-radius: 36px;
                background: radial-gradient(circle at 35% 35%, #FFF6D6 0%, #E6C675 45%, #9E7D2B 85%, #664F19 100%);
                margin: 0 auto 10px auto;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 34px;
                box-shadow: 0 6px 16px rgba(212,175,55,0.35);
              }
              .title {
                font-family: 'Cinzel', serif;
                font-size: 20px;
                font-weight: 900;
                color: #0F172A;
                text-transform: uppercase;
                letter-spacing: 1px;
                margin-bottom: 4px;
              }
              .owner {
                font-size: 13.5px;
                font-weight: 800;
                color: #B8922E;
                margin-bottom: 4px;
              }
              .sub {
                font-size: 11.5px;
                color: #64748B;
                font-weight: 600;
                margin-bottom: 14px;
              }
              .badge-callout {
                background: linear-gradient(135deg, #E6C675 0%, #D4AF37 45%, #B8922E 100%);
                color: #FFFFFF;
                font-weight: 900;
                font-size: 11px;
                padding: 7px 16px;
                border-radius: 20px;
                display: inline-block;
                margin-bottom: 14px;
                letter-spacing: 0.5px;
                box-shadow: 0 4px 12px rgba(212,175,55,0.3);
              }
              .qr-box {
                background: #FFFFFF;
                border: 3px solid #D4AF37;
                border-radius: 16px;
                padding: 10px;
                display: inline-block;
                box-shadow: 0 8px 24px rgba(0,0,0,0.08);
                margin-bottom: 10px;
              }
              .qr-img {
                width: 170px;
                height: 170px;
                display: block;
              }
              .url-text {
                font-family: monospace;
                font-size: 11.5px;
                font-weight: 800;
                color: #B8922E;
                margin-bottom: 12px;
              }
              .features-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 8px;
                margin-top: 8px;
              }
              .feature-item {
                background: #FFFDF5;
                border: 1px solid #EAE5DF;
                border-radius: 10px;
                padding: 6px 8px;
                font-size: 10.5px;
                font-weight: 800;
                color: #0F172A;
              }
              .watermark {
                font-size: 9.5px;
                font-weight: 900;
                color: #B8922E;
                letter-spacing: 1px;
                margin-top: 14px;
                text-transform: uppercase;
              }
            </style>
          </head>
          <body>
            <div class="poster-card">
              <div class="gold-inner">
                <div class="medallion">✂️</div>
                <h1 class="title">${atelier.name || 'MAISON DIGICOUTURE VIP'}</h1>
                <div class="owner">👤 Gérant : ${atelier.ownerName || 'Maître Styliste'}</div>
                <div class="sub">📍 ${atelier.address || atelier.city || 'Abidjan'} • 📞 ${atelier.whatsapp || '+225 0707705067'}</div>
                
                <div class="badge-callout">✦ SCANNEZ POUR DÉCOUVRIR LE CATALOGUE & COMMANDER ✦</div>
                
                <div>
                  <div class="qr-box">
                    <img src="${qrImageUrl}" class="qr-img" alt="QR Code Catalogue" />
                  </div>
                </div>

                <div class="url-text">${publicUrl}</div>

                <div class="features-grid">
                  <div class="feature-item">📸 Galerie 4K & Modèles</div>
                  <div class="feature-item">📐 Mesures Digitales</div>
                  <div class="feature-item">💬 Commande WhatsApp</div>
                  <div class="feature-item">⚡ Suivi Temps Réel</div>
                </div>

                <div class="watermark">✦ CERTIFIÉ DIGICOUTURE VIP PLATFORM ✦</div>
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
  };

  // Formulaire de création de modèle (Page dédiée)
  const [codeInput, setCodeInput] = useState('');
  const [titleInput, setTitleInput] = useState('');
  const [categoryInput, setCategoryInput] = useState<CatalogueItem['category']>('Robes');
  const [priceInput, setPriceInput] = useState('');
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [showUrlInput, setShowUrlInput] = useState<boolean>(false);
  const [descInput, setDescInput] = useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const categories = ['Toutes', 'Mariage', 'Hommes', 'Robes', 'Traditionnel', 'Enfants'];

  // Vérification de l'unicité stricte du code modèle (Section Unicité)
  const isCodeDuplicate = Boolean(
    codeInput.trim() && 
    catalogue.some(item => (item.code || '').toUpperCase() === codeInput.trim().toUpperCase())
  );

  // Génération automatique du code séquentiel incrémenté (ex: MOD-001, MOD-002, MOD-003...)
  const generateNextCode = () => {
    let maxNum = 0;

    catalogue.forEach(item => {
      const codeStr = item.code || '';
      const match = codeStr.match(/\d+/);
      if (match) {
        const num = parseInt(match[0], 10);
        if (!isNaN(num) && num > maxNum && num < 999999) {
          maxNum = num;
        }
      }
    });

    const nextSeq = maxNum > 0 ? maxNum + 1 : catalogue.length + 1;
    return `MOD-${String(nextSeq).padStart(3, '0')}`;
  };

  const handleOpenAddModal = () => {
    setCodeInput(generateNextCode());
    setTitleInput('');
    setPriceInput('');
    setImageUrlInput('');
    setImagePreview('');
    setDescInput('');
    setViewMode('create');
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const compressed = await compressImage(file, 800, 0.75);
      setImagePreview(compressed);
      setImageUrlInput(compressed);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview('');
    setImageUrlInput('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCreateModelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleInput || !priceInput || isCodeDuplicate) return;

    const finalCode = codeInput.trim() ? codeInput.trim().toUpperCase() : generateNextCode();

    if (onAddModel) {
      onAddModel({
        code: finalCode,
        title: titleInput,
        category: categoryInput,
        estimatedPrice: priceInput.includes('FCFA') ? priceInput : `${priceInput} FCFA`,
        imageUrl: imageUrlInput || imagePreview || '',
        description: descInput,
        estimatedLeadTime: '3-5 jours',
        tags: [categoryInput]
      });
    }

    setCodeInput('');
    setTitleInput('');
    setPriceInput('');
    setImageUrlInput('');
    setDescInput('');
    setShowUrlInput(false);
    setViewMode('list');
  };

  const filteredCatalogue = catalogue.filter(item => {
    const search = searchTerm.toLowerCase();
    const itemCat = (item.category || '').toLowerCase();
    const itemTitle = (item.title || '').toLowerCase();
    const itemDesc = (item.description || '').toLowerCase();

    const matchesSearch = !searchTerm || itemTitle.includes(search) || itemCat.includes(search) || itemDesc.includes(search);
    
    let matchesCategory = categoryFilter === 'Toutes';
    if (!matchesCategory) {
      const filter = categoryFilter.toLowerCase();
      matchesCategory = itemCat.includes(filter) || 
                        filter.includes(itemCat) ||
                        (filter === 'traditionnel' && itemCat.includes('tradition')) ||
                        (filter === 'hommes' && (itemCat.includes('homme') || itemCat.includes('costume')));
    }

    return matchesSearch && matchesCategory;
  });

  // PAGE DÉDIÉE DE CRÉATION DE MODÈLE (REMPLACE LE POPUP)
  if (viewMode === 'create') {
    return (
      <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Header de la Page de Création */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          padding: '1.5rem 2rem',
          border: '1.5px solid #EAE5DF',
          boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <button
              onClick={() => setViewMode('list')}
              style={{
                background: 'none',
                border: 'none',
                color: '#B8922E',
                fontWeight: 800,
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                marginBottom: '0.4rem'
              }}
            >
              ← Retour à la Galerie des Modèles
            </button>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              👗 Nouveau Modèle Sur-Mesure
            </h2>
            <span style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '0.2rem', display: 'block' }}>
              Ajoutez une nouvelle création à votre collection et publiez-la dans votre atelier.
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className="btn btn-secondary"
              style={{ padding: '0.75rem 1.25rem', borderRadius: '12px', fontWeight: 800, fontSize: '0.9rem' }}
            >
              Annuler
            </button>
            <button
              type="button"
              disabled={isCodeDuplicate || !titleInput || !priceInput}
              onClick={handleCreateModelSubmit}
              className="btn btn-primary"
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '12px',
                fontWeight: 900,
                fontSize: '0.95rem',
                boxShadow: '0 4px 14px rgba(212, 175, 55, 0.4)',
                opacity: (isCodeDuplicate || !titleInput || !priceInput) ? 0.5 : 1,
                cursor: (isCodeDuplicate || !titleInput || !priceInput) ? 'not-allowed' : 'pointer'
              }}
            >
              ✨ Enregistrer & Publier le Modèle
            </button>
          </div>
        </div>

        {/* Formulaire 2 Colonnes de Création */}
        <form onSubmit={handleCreateModelSubmit} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>
          {/* Colonne Gauche : Saisie des Ingrédients */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Card 1 : Code & Nom du Modèle */}
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', padding: '1.75rem', border: '1.5px solid #EAE5DF', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0F172A', margin: 0, marginBottom: '1.25rem', borderBottom: '1.5px solid #FAF8F5', paddingBottom: '0.75rem' }}>
                🏷️ Identifiant & Nom du Modèle
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0F172A' }}>
                      Code Modèle *
                    </label>
                    <button
                      type="button"
                      onClick={() => setCodeInput(generateNextCode())}
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        color: '#B8922E',
                        backgroundColor: '#FFFDF5',
                        border: '1px solid #D4AF37',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                      title="Générer automatiquement le code séquentiel suivant"
                    >
                      ⚡ Auto-Incrémenté (Régénérer)
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="ex: MOD-001"
                    value={codeInput}
                    onChange={(e) => setCodeInput(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.85rem',
                      borderRadius: '12px',
                      border: isCodeDuplicate ? '2px solid #EF4444' : '1.5px solid #EAE5DF',
                      fontSize: '0.95rem',
                      outline: 'none',
                      fontWeight: 800,
                      color: '#0F172A',
                      backgroundColor: isCodeDuplicate ? '#FEF2F2' : '#FFFDF5'
                    }}
                  />
                  {isCodeDuplicate && (
                    <span style={{ fontSize: '0.78rem', color: '#DC2626', fontWeight: 800, marginTop: '0.35rem', display: 'block' }}>
                      ⚠️ Le code "{codeInput.toUpperCase()}" est déjà attribué à un autre modèle. Les codes doivent être 100% uniques.
                    </span>
                  )}
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0F172A', display: 'block', marginBottom: '0.35rem' }}>
                    Nom de la Création *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Ensemble Pagne Wax & Satin Modern Chic"
                    value={titleInput}
                    onChange={(e) => setTitleInput(e.target.value)}
                    style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', border: '1.5px solid #EAE5DF', fontSize: '0.95rem', outline: 'none', fontWeight: 700 }}
                  />
                </div>
              </div>
            </div>

            {/* Card 2 : Catégorie & Prix Estimatif */}
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', padding: '1.75rem', border: '1.5px solid #EAE5DF', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0F172A', margin: 0, marginBottom: '1.25rem', borderBottom: '1.5px solid #FAF8F5', paddingBottom: '0.75rem' }}>
                💰 Catégorie & Prix Estimatif
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0F172A', display: 'block', marginBottom: '0.35rem' }}>
                    Catégorie
                  </label>
                  <select
                    value={categoryInput}
                    onChange={(e) => setCategoryInput(e.target.value as CatalogueItem['category'])}
                    style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', border: '1.5px solid #EAE5DF', fontSize: '0.9rem', backgroundColor: '#FFFFFF', outline: 'none', fontWeight: 700 }}
                  >
                    <option value="Robes">Robes & Ensembles</option>
                    <option value="Mariage">Tenues de Mariage</option>
                    <option value="Hommes">Hommes (Boubous & Costumes)</option>
                    <option value="Traditionnel">Traditionnel (Pagne / Kita)</option>
                    <option value="Enfants">Enfants</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0F172A', display: 'block', marginBottom: '0.35rem' }}>
                    Prix Estimatif (FCFA) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ex: 120 000 FCFA"
                    value={priceInput}
                    onChange={(e) => setPriceInput(e.target.value)}
                    style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', border: '1.5px solid #EAE5DF', fontSize: '0.95rem', outline: 'none', fontWeight: 800, color: '#B8922E' }}
                  />
                </div>
              </div>
            </div>

            {/* Card 3 : Description Détaillée */}
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', padding: '1.75rem', border: '1.5px solid #EAE5DF', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0F172A', margin: 0, marginBottom: '1.25rem', borderBottom: '1.5px solid #FAF8F5', paddingBottom: '0.75rem' }}>
                📝 Description & Conseils de Confection
              </h3>

              <textarea
                rows={4}
                placeholder="Précisez la qualité du tissu préconisé (ex: Bazin Gagnagny, Wax Hollandais), le style de broderie au col, les options de sur-mesure..."
                value={descInput}
                onChange={(e) => setDescInput(e.target.value)}
                style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', border: '1.5px solid #EAE5DF', fontSize: '0.9rem', outline: 'none', resize: 'vertical', lineHeight: 1.5 }}
              />
            </div>
          </div>

          {/* Colonne Droite : Upload Photo & Aperçu Carte Live */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Card Upload Photo */}
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', padding: '1.75rem', border: '1.5px solid #EAE5DF', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0F172A', margin: 0, marginBottom: '1.25rem', borderBottom: '1.5px solid #FAF8F5', paddingBottom: '0.75rem' }}>
                📸 Photo HD du Modèle
              </h3>

              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />

              {(imagePreview || imageUrlInput) ? (
                <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', border: '2px solid #D4AF37', height: '220px', backgroundColor: '#0F172A' }}>
                  <img
                    src={imagePreview || imageUrlInput}
                    alt="Aperçu du modèle"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: '#DC2626', color: '#FFFFFF', border: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Trash2 size={14} /> Supprimer
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: '2px dashed #D4AF37',
                    borderRadius: '16px',
                    padding: '2.25rem 1rem',
                    backgroundColor: '#FFFDF5',
                    textAlign: 'center',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                >
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#FEF0C7', color: '#D4AF37', border: '1.5px solid #D4AF37', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Upload size={26} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#B8922E' }}>
                      📷 Charger la Photo du Modèle
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '4px' }}>
                      Cliquez ici pour sélectionner une image (PNG, JPG, WEBP)
                    </div>
                  </div>
                </div>
              )}

              {/* Option URL web alternative */}
              <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowUrlInput(!showUrlInput)}
                  style={{ background: 'none', border: 'none', color: '#64748B', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <LinkIcon size={12} /> {showUrlInput ? 'Masquer l\'URL' : 'Ou coller une URL d\'image Web'}
                </button>
              </div>

              {showUrlInput && (
                <div style={{ marginTop: '0.5rem' }}>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={imageUrlInput}
                    onChange={(e) => {
                      setImageUrlInput(e.target.value);
                      setImagePreview(e.target.value);
                    }}
                    style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '10px', border: '1px solid #EAE5DF', fontSize: '0.85rem', outline: 'none' }}
                  />
                </div>
              )}
            </div>

            {/* Aperçu Live de la Carte dans le Catalogue */}
            <div style={{ backgroundColor: '#FAF8F5', borderRadius: '24px', padding: '1.5rem', border: '1.5px solid #D4AF37' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 900, color: '#B8922E', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.75rem' }}>
                👁️ APERÇU LIVE DE VOTRE CARTE MODÈLE :
              </div>

              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', overflow: 'hidden', border: '1.5px solid #EAE5DF', boxShadow: '0 4px 15px rgba(0,0,0,0.04)' }}>
                <div style={{ height: '180px', position: 'relative', overflow: 'hidden' }}>
                  {(imagePreview || imageUrlInput) ? (
                    <img src={imagePreview || imageUrlInput} alt="Aperçu" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #1E293B, #0F172A)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#D4AF37' }}>
                      <span style={{ fontSize: '2.5rem' }}>👗</span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 900, color: '#FFFFFF', marginTop: '0.2rem' }}>{titleInput || 'Titre du modèle'}</span>
                    </div>
                  )}
                  <div style={{ position: 'absolute', top: '10px', left: '10px', backgroundColor: '#D4AF37', color: '#0F172A', padding: '0.25rem 0.6rem', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 900 }}>
                    🏷️ {codeInput || 'MOD-001'}
                  </div>
                  <div style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: '#1E293B', color: '#D4AF37', border: '1px solid #D4AF37', padding: '0.25rem 0.6rem', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 900 }}>
                    {categoryInput}
                  </div>
                </div>

                <div style={{ padding: '1rem' }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#B8922E', textTransform: 'uppercase', display: 'block' }}>
                    CODE : {codeInput || 'MOD-001'}
                  </span>
                  <h4 style={{ fontSize: '1rem', fontWeight: 900, color: '#0F172A', margin: '0.2rem 0' }}>
                    {titleInput || 'Nom de la création'}
                  </h4>
                  <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#B8922E', marginTop: '0.2rem' }}>
                    {priceInput ? (priceInput.includes('FCFA') ? priceInput : `${priceInput} FCFA`) : '0 FCFA'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* VUE DÉTAILLÉE FICHE MODÈLE SÉLECTIONNÉ */}
      {selectedModel ? (
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', padding: '2rem', border: '2px solid #D4AF37', boxShadow: '0 20px 50px rgba(0,0,0,0.06)' }}>
          
          <button 
            onClick={() => setSelectedModel(null)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', border: '1px solid #EAE5DF', backgroundColor: '#FFFDF5', borderRadius: '12px', padding: '0.6rem 1.25rem', color: '#B8922E', fontWeight: 800, marginBottom: '1.5rem', cursor: 'pointer' }}
          >
            <ArrowLeft size={18} /> ← Retour au Catalogue Haute Couture
          </button>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            
            {/* Colonne Gauche : Visuel HD Cliquable */}
            <div 
              onClick={() => setZoomedImage(selectedModel.imageUrl)}
              style={{ borderRadius: '20px', overflow: 'hidden', height: '420px', border: '2px solid #D4AF37', cursor: 'pointer', position: 'relative', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}
            >
              <img 
                src={selectedModel.imageUrl} 
                alt={selectedModel.title} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
              <div style={{ position: 'absolute', bottom: '14px', left: '14px', backgroundColor: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(6px)', color: '#FFFFFF', padding: '0.4rem 0.85rem', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 800 }}>
                🔍 Cliquez pour agrandir en HD
              </div>
            </div>

            {/* Colonne Droite : Informations & Commandes Directes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#D4AF37', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                  ✦ CRÉATION ORIGINAL {selectedModel.category} ✦
                </span>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0F172A', marginTop: '4px', margin: 0 }}>
                  {selectedModel.title}
                </h2>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#B8922E', marginTop: '6px' }}>
                  {selectedModel.estimatedPrice}
                </div>
              </div>

              <p style={{ fontSize: '0.95rem', color: '#475569', lineHeight: 1.6, margin: 0 }}>
                {selectedModel.description || "Confection sur-mesure d'exception réalisée dans nos ateliers avec des tissus de qualité supérieure (Bazin Riche, Pagne Baoulé, Soie Impériale)."}
              </p>

              <div style={{ backgroundColor: '#FFFDF5', padding: '1rem', borderRadius: '14px', border: '1.5px solid #F5E8C7', fontSize: '0.85rem', color: '#64748B' }}>
                ⏱️ <strong>Délai estimatif de confection :</strong> 3 à 5 jours ouvrés après prise des mesures dans l'atelier.
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: 'auto' }}>
                <button 
                  onClick={() => {
                    const msg = `Bonjour ${atelier.name} 👋 Je souhaite commander votre modèle *${selectedModel.title}* (${selectedModel.estimatedPrice}).`;
                    onSendWhatsapp(atelier.whatsapp, msg);
                  }}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '1rem', fontSize: '1rem', fontWeight: 900, borderRadius: '14px', boxShadow: '0 6px 18px rgba(212, 175, 55, 0.35)' }}
                >
                  <Sparkles size={18} /> Commander ce modèle sur WhatsApp
                </button>

                <button 
                  onClick={() => {
                    const msg = `Bonjour ${atelier.name} 👋 J'ai une question sur le modèle *${selectedModel.title}*.`;
                    onSendWhatsapp(atelier.whatsapp, msg);
                  }}
                  className="btn btn-whatsapp"
                  style={{ width: '100%', padding: '0.9rem', fontSize: '0.92rem', fontWeight: 800, borderRadius: '14px' }}
                >
                  <MessageSquare size={18} /> Discuter avec le Tailleur
                </button>
              </div>
            </div>

          </div>

        </div>
      ) : (
        /* GRILLE DE CATALOGUE EN CARTES GRAND FORMAT */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* BANNIÈRE LIEN PUBLIC & QR CODE DÉDIÉ À CET ATELIER (SECTIONS 13, 14, 29 DU PROMPT) */}
          <div style={{
            backgroundColor: '#0F172A',
            color: '#FFFFFF',
            borderRadius: '24px',
            padding: '1.5rem',
            border: '2px solid #D4AF37',
            boxShadow: '0 12px 35px rgba(0,0,0,0.3)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1.25rem'
          }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', backgroundColor: 'rgba(212, 175, 55, 0.15)', border: '1px solid #D4AF37', padding: '0.25rem 0.75rem', borderRadius: 12, marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 900, color: '#D4AF37', letterSpacing: '1px', textTransform: 'uppercase' }}>
                  🌐 VITRINE DIGITALE PUBLIQUE & QR CODE
                </span>
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 900, margin: '0 0 0.4rem 0', fontFamily: 'Georgia, serif', color: '#FFFFFF' }}>
                Votre Catalogue Public Dédié
              </h3>
              <div style={{ fontSize: '0.88rem', color: '#94A3B8', fontFamily: 'monospace' }}>
                {window.location.origin}/catalogue/{atelier.slug || atelier.id || 'maison-elegance'}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <button
                onClick={async () => {
                  const url = `${window.location.origin}/catalogue/${atelier.slug || atelier.id || 'maison-elegance'}`;
                  await navigator.clipboard.writeText(url);
                  alert(`Lien du catalogue public copié dans le presse-papier :\n${url}`);
                }}
                style={{
                  backgroundColor: '#FFFDF5',
                  color: '#B8922E',
                  border: '1.5px solid #D4AF37',
                  padding: '0.65rem 1.1rem',
                  borderRadius: 14,
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                📋 Copier le Lien
              </button>

              <button
                onClick={() => {
                  const url = `${window.location.origin}/catalogue/${atelier.slug || atelier.id || 'maison-elegance'}`;
                  window.open(url, '_blank');
                }}
                style={{
                  backgroundColor: '#D4AF37',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '0.65rem 1.1rem',
                  borderRadius: 14,
                  fontSize: '0.85rem',
                  fontWeight: 900,
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(212, 175, 55, 0.4)'
                }}
              >
                👁️ Ouvrir Vitrine Public →
              </button>
            </div>
          </div>

          {/* Header Galerie & Recherche */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 900, color: '#D4AF37', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                ✦ GALERIE DES CRÉATIONS EXCLUSIVES ATELIER ✦
              </div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Sparkle size={28} color="#B8922E" /> Catalogue & Galerie des Modèles
              </h2>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#B8922E', backgroundColor: '#FFFDF5', border: '1.5px solid #D4AF37', padding: '0.5rem 1.25rem', borderRadius: '14px' }}>
                ✨ {filteredCatalogue.length} modèles disponibles
              </div>

              <button 
                onClick={() => setShowQrPosterModal(true)}
                className="btn btn-secondary"
                style={{ padding: '0.65rem 1.25rem', fontSize: '0.9rem', borderRadius: '14px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1.5px solid #D4AF37', color: '#B8922E', backgroundColor: '#FFFDF5' }}
              >
                <QrCode size={18} /> 🖨️ Affiche QR Code
              </button>

              <button 
                onClick={handleOpenAddModal}
                className="btn btn-primary"
                style={{ padding: '0.65rem 1.25rem', fontSize: '0.9rem', borderRadius: '14px', fontWeight: 900, boxShadow: '0 4px 14px rgba(212, 175, 55, 0.35)' }}
              >
                + Nouveau Modèle
              </button>
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
                  placeholder="Rechercher par nom de modèle (Bazin, Boubou, Mariage)..."
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

              {/* Filtres par Catégories */}
              <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.2rem' }}>
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    style={{
                      padding: '0.6rem 1.1rem',
                      borderRadius: '12px',
                      fontSize: '0.85rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      border: categoryFilter === cat ? '1.5px solid #D4AF37' : '1px solid #EAE5DF',
                      backgroundColor: categoryFilter === cat ? '#FFFDF5' : '#FFFFFF',
                      color: categoryFilter === cat ? '#B8922E' : '#64748B'
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* GRILLE DE CATALOGUE DESIGN SERRÉ ET HARMONIEUX (MIN 260px) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.1rem' }}>
            {filteredCatalogue.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', backgroundColor: '#FFFFFF', borderRadius: '20px', padding: '2.5rem', textAlign: 'center', border: '1px solid #EAE5DF' }}>
                <span style={{ fontSize: '2.5rem' }}>👗</span>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', marginTop: '0.5rem' }}>Aucun modèle ne correspond à cette recherche</h3>
                <p style={{ color: '#64748B', fontSize: '0.85rem' }}>Essayez un autre mot-clé ou sélectionnez "Toutes".</p>
              </div>
            ) : (
              filteredCatalogue.map(item => (
                <div 
                  key={item.id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '20px',
                    border: '1.5px solid #EAE5DF',
                    overflow: 'hidden',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {/* Photo Haute Résolution Élégante (210px) */}
                  <div style={{ height: '210px', position: 'relative', overflow: 'hidden' }}>
                    {item.imageUrl ? (
                      <img 
                        src={item.imageUrl} 
                        alt={item.title} 
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
                        padding: '0.75rem',
                        textAlign: 'center'
                      }}>
                        <span style={{ fontSize: '2.8rem', marginBottom: '0.3rem' }}>👗</span>
                        <span style={{ fontSize: '0.9rem', fontWeight: 900, color: '#FFFFFF' }}>{item.title}</span>
                        <span style={{ fontSize: '0.7rem', color: '#D4AF37', marginTop: '0.3rem', border: '1px solid #D4AF37', padding: '0.15rem 0.5rem', borderRadius: '6px' }}>Sur-Mesure VIP</span>
                      </div>
                    )}
                    <div style={{ position: 'absolute', top: '10px', left: '10px', backgroundColor: '#D4AF37', color: '#0F172A', padding: '0.25rem 0.6rem', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 900, boxShadow: '0 4px 10px rgba(0,0,0,0.15)' }}>
                      🏷️ {item.code || `MOD-${item.id.slice(-3)}`}
                    </div>
                    <div style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: '#1E293B', color: '#D4AF37', border: '1px solid #D4AF37', padding: '0.25rem 0.6rem', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 900 }}>
                      {item.category}
                    </div>
                  </div>

                  {/* Contenu et Détails du Modèle */}
                  <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <div>
                        <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#B8922E', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block' }}>
                          CODE : {item.code || `MOD-${item.id.slice(-3)}`}
                        </span>
                        <h3 style={{ fontSize: '1rem', fontWeight: 900, color: '#0F172A', margin: 0, lineHeight: 1.3 }}>
                          {item.title}
                        </h3>
                      </div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#B8922E', whiteSpace: 'nowrap' }}>
                        {item.estimatedPrice}
                      </div>
                    </div>

                    <p style={{ fontSize: '0.8rem', color: '#64748B', margin: 0, lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.35 }}>
                      {item.description || "Confection sur-mesure d'exception disponible sur commande."}
                    </p>

                    {/* Boutons d'Action Harmonieux */}
                    <div style={{ display: 'flex', gap: '0.4rem', marginTop: 'auto', paddingTop: '0.5rem' }}>
                      <button
                        onClick={() => setSelectedModel(item)}
                        className="btn btn-secondary"
                        style={{ flex: 1, padding: '0.5rem 0.4rem', fontSize: '0.76rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}
                      >
                        <Eye size={13} /> Fiche
                      </button>

                      <button
                        onClick={() => {
                          const msg = `Bonjour ${atelier.name} 👋 Je souhaite commander votre modèle *${item.title}* (${item.estimatedPrice}).`;
                          onSendWhatsapp(atelier.whatsapp, msg);
                        }}
                        className="btn btn-primary"
                        style={{ padding: '0.5rem 0.6rem', fontSize: '0.76rem', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}
                      >
                        <Sparkles size={13} /> WhatsApp
                      </button>

                      {onDeleteModel && (
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Êtes-vous sûr de vouloir supprimer le modèle "${item.title}" (${item.code || 'MOD-001'}) du catalogue de votre atelier ?`)) {
                              onDeleteModel(item.id);
                            }
                          }}
                          style={{
                            backgroundColor: '#FEF2F2',
                            color: '#DC2626',
                            border: '1px solid #FECACA',
                            padding: '0.5rem 0.6rem',
                            borderRadius: '10px',
                            fontSize: '0.76rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px'
                          }}
                          title="Supprimer ce modèle de l'atelier"
                        >
                          <Trash2 size={13} /> Supprimer
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
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

      {/* 👑 MODAL POP-UP DE PRÉVISUALISATION ET D'IMPRESSION DE L'AFFICHE POSTER QR CODE HAUTE COUTURE */}
      {showQrPosterModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(11, 11, 13, 0.92)',
          backdropFilter: 'blur(10px)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'max(16px, env(safe-area-inset-top, 24px)) 12px max(20px, env(safe-area-inset-bottom, 24px)) 12px'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '520px',
            maxHeight: 'calc(100vh - 48px)',
            backgroundColor: '#121216',
            borderRadius: '24px',
            border: '2px solid #D4AF37',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 60px rgba(0,0,0,0.8)',
            color: '#F5F5F5',
            overflow: 'hidden'
          }}>
            {/* Header Modal (Fixe & visible sous la barre de statut téléphone) */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1rem 1.25rem',
              borderBottom: '1px solid #24242A',
              backgroundColor: '#17171C',
              flexShrink: 0
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <QrCode size={22} color="#D4AF37" />
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#FFFFFF', margin: 0, lineHeight: 1.2 }}>
                    Code QR &amp; Affiche A4
                  </h3>
                  <div style={{ fontSize: '0.72rem', color: '#D4AF37', fontWeight: 700, marginTop: '2px' }}>
                    {atelier.name || 'Maison DigiCouture VIP'}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setShowQrPosterModal(false)}
                style={{
                  background: 'rgba(212, 175, 55, 0.12)',
                  border: '1.5px solid #D4AF37',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  color: '#D4AF37',
                  fontWeight: 900,
                  fontSize: '16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                }}
                title="Fermer"
              >
                ✕
              </button>
            </div>

            {/* Corps Déroulant (Contenu de la carte Affiche) */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '1.25rem',
              WebkitOverflowScrolling: 'touch'
            }}>
              {/* PREVIEW CARTE AFFICHE LUXE BLANC & OR (STYLE A4 IMPRIMABLE EN BLANC) */}
              <div style={{
                background: '#FFFFFF',
                border: '2.5px solid #D4AF37',
                borderRadius: '20px',
                padding: '1.25rem 1rem',
                textAlign: 'center',
                boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
                position: 'relative'
              }}>
                <div style={{ border: '1.5px dashed #D4AF37', borderRadius: '16px', padding: '1rem 0.75rem', backgroundColor: '#FFFFFF' }}>
                  {/* Médaillon Logo / Ciseaux */}
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '30px',
                    background: 'radial-gradient(circle at 35% 35%, #FFF6D6 0%, #E6C675 45%, #9E7D2B 85%, #664F19 100%)',
                    margin: '0 auto 8px auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '28px',
                    boxShadow: '0 4px 14px rgba(212,175,55,0.35)'
                  }}>
                    ✂️
                  </div>

                  <div style={{ fontFamily: 'serif', fontSize: '1.15rem', fontWeight: 900, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {atelier.name || 'MAISON DIGICOUTURE VIP'}
                  </div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#B8922E', marginTop: '2px' }}>
                    👤 Gérant : {atelier.ownerName || 'Maître Styliste'}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '2px', marginBottom: '10px' }}>
                    📍 {atelier.address || atelier.city || 'Abidjan'} • 📞 {atelier.whatsapp || '+225 0707705067'}
                  </div>

                  <div style={{
                    background: 'linear-gradient(135deg, #E6C675 0%, #D4AF37 45%, #B8922E 100%)',
                    color: '#FFFFFF',
                    fontWeight: 900,
                    fontSize: '0.68rem',
                    padding: '5px 12px',
                    borderRadius: '14px',
                    display: 'inline-block',
                    marginBottom: '10px',
                    letterSpacing: '0.5px',
                    boxShadow: '0 4px 12px rgba(212,175,55,0.25)'
                  }}>
                    ✦ SCANNEZ POUR DÉCOUVRIR LE CATALOGUE &amp; COMMANDER ✦
                  </div>

                  <div>
                    <div style={{ background: '#FFFFFF', border: '3px solid #D4AF37', borderRadius: '14px', padding: '8px', display: 'inline-block', boxShadow: '0 8px 20px rgba(0,0,0,0.08)', marginBottom: '8px' }}>
                      <img src={qrImageUrl} alt="QR Code Catalogue" style={{ width: '140px', height: '140px', display: 'block', borderRadius: '4px' }} />
                    </div>
                  </div>

                  <div style={{ fontFamily: 'monospace', fontSize: '0.72rem', fontWeight: 800, color: '#B8922E', marginBottom: '8px', wordBreak: 'break-all' }}>
                    {publicUrl}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginTop: '6px' }}>
                    <div style={{ background: '#FFFDF5', border: '1px solid #EAE5DF', borderRadius: '8px', padding: '4px 6px', fontSize: '0.66rem', fontWeight: 800, color: '#0F172A' }}>📸 Galerie 4K &amp; Modèles</div>
                    <div style={{ background: '#FFFDF5', border: '1px solid #EAE5DF', borderRadius: '8px', padding: '4px 6px', fontSize: '0.66rem', fontWeight: 800, color: '#0F172A' }}>📐 Mesures Digitales</div>
                    <div style={{ background: '#FFFDF5', border: '1px solid #EAE5DF', borderRadius: '8px', padding: '4px 6px', fontSize: '0.66rem', fontWeight: 800, color: '#0F172A' }}>💬 Commande WhatsApp</div>
                    <div style={{ background: '#FFFDF5', border: '1px solid #EAE5DF', borderRadius: '8px', padding: '4px 6px', fontSize: '0.66rem', fontWeight: 800, color: '#0F172A' }}>⚡ Suivi Temps Réel</div>
                  </div>

                  <div style={{ fontSize: '0.58rem', fontWeight: 900, color: '#B8922E', letterSpacing: '1px', marginTop: '8px', textTransform: 'uppercase' }}>
                    ✦ CERTIFIÉ DIGICOUTURE VIP PLATFORM ✦
                  </div>
                </div>
              </div>
            </div>

            {/* Footer d'Actions Fixe (Haute Lisibilité au-dessus de la barre Android) */}
            <div style={{
              padding: '0.85rem 1.25rem calc(0.85rem + env(safe-area-inset-bottom, 16px)) 1.25rem',
              backgroundColor: '#17171C',
              borderTop: '1px solid #24242A',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.6rem',
              flexShrink: 0
            }}>
              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(publicUrl);
                    setCopiedLink(true);
                    setTimeout(() => setCopiedLink(false), 2000);
                  }}
                  style={{
                    flex: 1,
                    padding: '0.75rem 0.5rem',
                    borderRadius: '12px',
                    fontWeight: 800,
                    fontSize: '0.82rem',
                    background: '#24242A',
                    color: '#F5F5F5',
                    border: '1px solid #33333E',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}
                >
                  {copiedLink ? '✓ Copié !' : '🔗 Copier Lien'}
                </button>

                <button
                  onClick={handlePrintPoster}
                  style={{
                    flex: 1.5,
                    padding: '0.75rem 0.5rem',
                    borderRadius: '12px',
                    fontWeight: 900,
                    fontSize: '0.85rem',
                    background: 'linear-gradient(135deg, #D4AF37 0%, #B8922E 100%)',
                    color: '#0F172A',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 14px rgba(212,175,55,0.3)'
                  }}
                >
                  <Printer size={16} /> 🖨️ AFFICHE A4
                </button>

                <button
                  onClick={() => {
                    const text = encodeURIComponent(`Bonjour ! Découvrez le catalogue de mode & tarifs de notre atelier ${atelier.name || ''} ici : ${publicUrl}`);
                    window.open(`https://wa.me/?text=${text}`, '_blank');
                  }}
                  style={{
                    flex: 1.2,
                    padding: '0.75rem 0.5rem',
                    borderRadius: '12px',
                    fontWeight: 900,
                    fontSize: '0.82rem',
                    background: '#22C55E',
                    color: '#FFFFFF',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    boxShadow: '0 4px 14px rgba(34,197,94,0.3)'
                  }}
                >
                  💬 WhatsApp
                </button>
              </div>

              <button
                onClick={() => setShowQrPosterModal(false)}
                style={{
                  width: '100%',
                  padding: '0.6rem',
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: '0.8rem',
                  background: '#1E1E24',
                  color: '#94A3B8',
                  border: '1px solid #24242A',
                  cursor: 'pointer',
                  textAlign: 'center'
                }}
              >
                Fermer ✕
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
