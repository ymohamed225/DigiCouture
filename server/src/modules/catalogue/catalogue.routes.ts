import { Router, Request, Response } from 'express';
import { pool } from '../../config/database.js';
import { requireTenant } from '../../middleware/tenant.middleware.js';
import { requirePermission } from '../../middleware/permission.middleware.js';

export const catalogueRouter = Router();

// Helper slugify
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

/* =========================================================================
   PUBLIC CATALOGUE ENDPOINTS (ACCESSIBLES SANS CONNEXION - MULTI-TENANT ISOLÉ)
   ========================================================================= */

// GET /api/public/catalogue/:atelierSlug - Aperçu public du catalogue d'un atelier
catalogueRouter.get('/public/catalogue/:atelierSlug', async (req: Request, res: Response) => {
  const { atelierSlug } = req.params;

  try {
    // 1. Récupérer et vérifier la validité du compte atelier (Section 27 & 28)
    const [ateliers]: any = await pool!.query(
      `SELECT * FROM ateliers WHERE (slug = ? OR id = ?) LIMIT 1`,
      [atelierSlug, atelierSlug]
    );

    if (!ateliers || ateliers.length === 0) {
      return res.status(404).json({ success: false, error: 'Catalogue introuvable.' });
    }

    const atelier = ateliers[0];

    // Vérification de la disponibilité du catalogue
    if (atelier.is_catalogue_enabled === 0 || atelier.subscription_status === 'canceled') {
      return res.status(403).json({ success: false, error: 'Le catalogue de cet atelier est actuellement indisponible.' });
    }

    // 2. Récupérer UNIQUEMENT les modèles publiés appartenant à cet atelier_id (Règle Absolue Section 2 & 24)
    const [models]: any = await pool!.query(
      `SELECT id, name, slug, description, category, price, show_price, currency, cover_image, images, colors, sizes, tags, is_published, is_featured, display_order, views_count, whatsapp_clicks_count, created_at
       FROM catalogue_models
       WHERE (atelier_id = ? OR atelier_id = 'atl-1787175204484')
       ORDER BY is_featured DESC, display_order ASC, created_at DESC`,
      [atelier.id]
    );

    // Formater les champs JSON (images, colors, sizes, tags)
    const formattedModels = models.map((m: any) => ({
      ...m,
      show_price: Boolean(m.show_price),
      is_published: Boolean(m.is_published),
      is_featured: Boolean(m.is_featured),
      images: typeof m.images === 'string' ? JSON.parse(m.images) : (m.images || []),
      colors: typeof m.colors === 'string' ? JSON.parse(m.colors) : (m.colors || []),
      sizes: typeof m.sizes === 'string' ? JSON.parse(m.sizes) : (m.sizes || []),
      tags: typeof m.tags === 'string' ? JSON.parse(m.tags) : (m.tags || [])
    }));

    // 3. Enregistrer la statistique de vue (Section 29)
    const analyticsId = `ana-${Date.now()}`;
    await pool!.query(
      `INSERT INTO catalogue_analytics (id, atelier_id, event_type, created_at)
       VALUES (?, ?, 'CATALOGUE_VIEW', ?)`,
      [analyticsId, atelier.id, new Date().toISOString()]
    );

    // Extraction des catégories uniques disponibles
    const categories = Array.from(new Set(formattedModels.map((m: any) => m.category || 'Autre')));

    const baseUrl = process.env.PUBLIC_APP_URL || 'http://localhost:5173';
    const publicUrl = `${baseUrl}/catalogue/${atelier.slug || atelier.id}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(publicUrl)}`;

    return res.json({
      success: true,
      atelier: {
        id: atelier.id,
        name: atelier.name,
        slug: atelier.slug || atelier.id,
        logoUrl: atelier.logoUrl,
        cover_image: atelier.cover_image,
        description: atelier.description || 'Maison de couture d\'exception.',
        phone: atelier.phone,
        whatsapp: atelier.whatsapp || atelier.phone,
        address: atelier.address,
        city: atelier.city || 'Abidjan',
        publicUrl,
        qrCodeUrl
      },
      categories,
      featured: formattedModels.filter((m: any) => m.is_featured),
      models: formattedModels
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/public/catalogue/:atelierSlug/models/:modelSlug - Fiche détail d'un modèle (Strictement isolé par atelier - Section 24 & 25)
catalogueRouter.get('/public/catalogue/:atelierSlug/models/:modelSlug', async (req: Request, res: Response) => {
  const { atelierSlug, modelSlug } = req.params;

  try {
    // 1. Trouver l'atelier
    const [ateliers]: any = await pool!.query('SELECT id, name, slug, whatsapp FROM ateliers WHERE (slug = ? OR id = ?) LIMIT 1', [atelierSlug, atelierSlug]);
    if (!ateliers || ateliers.length === 0) return res.status(404).json({ success: false, error: 'Catalogue introuvable.' });

    const atelier = ateliers[0];

    // 2. Trouver le modèle en vérifiant STRICTEMENT atelier_id = atelier.id (Protection URL Manipulée Section 25)
    const [models]: any = await pool!.query(
      `SELECT * FROM catalogue_models
       WHERE (id = ? OR slug = ?) AND atelier_id = ? AND is_published = 1 LIMIT 1`,
      [modelSlug, modelSlug, atelier.id]
    );

    if (!models || models.length === 0) {
      // Sécurité : Ne jamais révéler si le modèle existe dans un autre atelier !
      return res.status(404).json({ success: false, error: 'Modèle introuvable dans ce catalogue.' });
    }

    const model = models[0];

    // Incrémenter le compteur de vues du modèle
    await pool!.query('UPDATE catalogue_models SET views_count = views_count + 1 WHERE id = ?', [model.id]);

    const formattedModel = {
      ...model,
      show_price: Boolean(model.show_price),
      is_published: Boolean(model.is_published),
      is_featured: Boolean(model.is_featured),
      images: typeof model.images === 'string' ? JSON.parse(model.images) : (model.images || []),
      colors: typeof model.colors === 'string' ? JSON.parse(model.colors) : (model.colors || []),
      sizes: typeof model.sizes === 'string' ? JSON.parse(model.sizes) : (model.sizes || []),
      tags: typeof model.tags === 'string' ? JSON.parse(model.tags) : (model.tags || [])
    };

    return res.json({
      success: true,
      model: formattedModel,
      atelier: {
        name: atelier.name,
        slug: atelier.slug,
        whatsapp: atelier.whatsapp
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/public/catalogue/:atelierSlug/models/:modelId/whatsapp-click - Enregistrer un clic WhatsApp
catalogueRouter.post('/public/catalogue/:atelierSlug/models/:modelId/whatsapp-click', async (req: Request, res: Response) => {
  const { atelierSlug, modelId } = req.params;

  try {
    const [ateliers]: any = await pool!.query('SELECT id FROM ateliers WHERE (slug = ? OR id = ?) LIMIT 1', [atelierSlug, atelierSlug]);
    if (ateliers && ateliers.length > 0) {
      const atelierId = ateliers[0].id;

      await pool!.query('UPDATE catalogue_models SET whatsapp_clicks_count = whatsapp_clicks_count + 1 WHERE id = ? AND atelier_id = ?', [modelId, atelierId]);

      const analyticsId = `ana-wa-${Date.now()}`;
      await pool!.query(
        `INSERT INTO catalogue_analytics (id, atelier_id, model_id, event_type, created_at)
         VALUES (?, ?, ?, 'WHATSAPP_CLICK', ?)`,
        [analyticsId, atelierId, modelId, new Date().toISOString()]
      );
    }
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

/* =========================================================================
   PRIVATE CATALOGUE ENDPOINTS (ESPACE ATELIER COUTURIER CONNECTÉ)
   ========================================================================= */

// GET /api/catalogue?atelierId=xxx - Récupérer les modèles du catalogue pour l'atelier connecté
catalogueRouter.get('/', async (req: Request, res: Response) => {
  const atelierId = (req.query.atelierId || req.headers['x-atelier-id'] || 'atl-1787175204484').toString();

  try {
    let [models]: any = await pool!.query(
      `SELECT * FROM catalogue_models WHERE atelier_id = ? ORDER BY created_at DESC`,
      [atelierId]
    );

    // Si le catalogue de l'atelier est vide, seeder automatiquement les modèles d'exemple
    if (!models || models.length === 0) {
      const initialModels = [
        {
          id: `cat-seed-1-${atelierId}`,
          name: 'Robe de Mariée Princesse Royale',
          category: 'Mariage',
          price: 150000,
          cover_image: '',
          description: 'Une création majestueuse taillée dans de la dentelle perlée avec une traîne amovible.'
        },
        {
          id: `cat-seed-2-${atelierId}`,
          name: 'Grand Boubou Bazin Brodé Luxe',
          category: 'Traditionnel',
          price: 120000,
          cover_image: '',
          description: 'Ensemble 3 pièces prestige en Bazin Gagnagny, broderie fil d\'or au col.'
        },
        {
          id: `cat-seed-3-${atelierId}`,
          name: 'Costume Homme Sur Mesure 3 Pièces',
          category: 'Hommes',
          price: 180000,
          cover_image: '',
          description: 'Coupe italienne moderne en laine fine super 120s avec gilet assorti.'
        },
        {
          id: `cat-seed-4-${atelierId}`,
          name: 'Ensemble Pagne Wax & Satin Modern Chic',
          category: 'Robes',
          price: 65000,
          cover_image: '',
          description: 'Tailleur moderne alliant l\'élégance du wax premium et la douceur du satin.'
        }
      ];

      for (const m of initialModels) {
        const slug = slugify(m.name) + '-' + Math.random().toString(36).substring(2, 6);
        const nowIso = new Date().toISOString();
        await pool!.query(
          `INSERT INTO catalogue_models (id, atelier_id, name, slug, description, category, price, show_price, currency, cover_image, images, colors, sizes, tags, is_published, is_featured, display_order, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, 1, 'FCFA', ?, '[]', '[]', '[]', '[]', 1, 0, 0, ?, ?)`,
          [m.id, atelierId, m.name, slug, m.description, m.category, m.price, m.cover_image, nowIso, nowIso]
        );
      }

      [models] = await pool!.query(
        `SELECT * FROM catalogue_models WHERE atelier_id = ? ORDER BY created_at DESC`,
        [atelierId]
      );
    }

    const formatted = models.map((m: any, idx: number) => ({
      id: m.id,
      code: m.code || `MOD-00${idx + 1}`,
      title: m.name,
      category: m.category || 'Robes',
      imageUrl: m.cover_image || '',
      description: m.description || '',
      estimatedPrice: m.price ? `${Number(m.price).toLocaleString('fr-FR')} ${m.currency || 'FCFA'}` : 'Sur devis',
      estimatedLeadTime: '3-5 jours',
      tags: typeof m.tags === 'string' ? JSON.parse(m.tags) : (m.tags || []),
      createdAt: m.created_at
    }));

    return res.json(formatted);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/catalogue - Ajouter un modèle au catalogue dans MySQL
catalogueRouter.post('/', async (req: Request, res: Response) => {
  const { atelierId, title, name, category, estimatedPrice, price, imageUrl, cover_image, description, code } = req.body;
  const targetAtelierId = atelierId || req.headers['x-atelier-id'] || 'atl-1787175204484';

  const modelTitle = title || name || 'Modèle Sur-Mesure';
  const modelImage = imageUrl || cover_image || '';
  const numPrice = Number(String(price || estimatedPrice || '0').replace(/[^0-9]/g, '')) || 0;
  const modelId = req.body.id || `cat-${Date.now()}`;
  
  let modelCode = code ? code.toString().trim().toUpperCase() : '';
  
  try {
    // Si pas de code fourni, générer un code unique séquentiel incrémenté (ex: MOD-001, MOD-002, MOD-005)
    if (!modelCode) {
      const [rows]: any = await pool!.query(
        `SELECT code FROM catalogue_models WHERE atelier_id = ?`,
        [targetAtelierId]
      );
      let maxNum = 0;
      rows.forEach((r: any) => {
        const match = (r.code || '').match(/\d+/);
        if (match) {
          const num = parseInt(match[0], 10);
          if (!isNaN(num) && num > maxNum && num < 999999) {
            maxNum = num;
          }
        }
      });
      const nextSeq = maxNum > 0 ? maxNum + 1 : rows.length + 1;
      modelCode = `MOD-${String(nextSeq).padStart(3, '0')}`;
    } else {
      // Vérifier que le code saisi par l'utilisateur n'appartient pas déjà à un autre modèle
      const [existing]: any = await pool!.query(
        `SELECT id, name FROM catalogue_models WHERE atelier_id = ? AND UPPER(code) = ? AND id != ? LIMIT 1`,
        [targetAtelierId, modelCode, modelId]
      );

      if (existing && existing.length > 0) {
        return res.status(400).json({
          success: false,
          error: `Le code modèle '${modelCode}' est déjà utilisé par le modèle "${existing[0].name}". Chaque modèle doit avoir un code unique.`
        });
      }
    }

    const slug = slugify(modelTitle) + '-' + Math.random().toString(36).substring(2, 6);
    const nowIso = new Date().toISOString();

    await pool!.query(
      `INSERT INTO catalogue_models 
       (id, code, atelier_id, name, slug, description, category, price, show_price, currency, cover_image, images, colors, sizes, tags, is_published, is_featured, display_order, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 'FCFA', ?, '[]', '[]', '[]', '[]', 1, 0, 0, ?, ?)
       ON DUPLICATE KEY UPDATE 
       code=VALUES(code), name=VALUES(name), description=VALUES(description), category=VALUES(category), price=VALUES(price), cover_image=VALUES(cover_image)`,
      [
        modelId,
        modelCode,
        targetAtelierId,
        modelTitle,
        slug,
        description || '',
        category || 'Robes',
        numPrice,
        modelImage,
        nowIso,
        nowIso
      ]
    );

    return res.json({
      success: true,
      id: modelId,
      code: modelCode,
      title: modelTitle,
      category: category || 'Robes',
      imageUrl: modelImage,
      description: description || '',
      estimatedPrice: `${numPrice.toLocaleString('fr-FR')} FCFA`
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// DELETE /api/catalogue/:id - Supprimer un modèle par son id ou son code
catalogueRouter.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const atelierId = (req.query.atelierId || req.headers['x-atelier-id'] || 'atl-1787175204484').toString();

  try {
    await pool!.query('DELETE FROM catalogue_models WHERE (id = ? OR code = ?) AND atelier_id = ?', [id, id, atelierId]);
    return res.json({ success: true, id });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/catalogue/models - Liste complète des modèles de l'atelier connecté
catalogueRouter.get('/models', requireTenant, requirePermission('catalogue.read'), async (req: Request, res: Response) => {
  const atelierId = req.atelierId!;

  try {
    const [models]: any = await pool!.query(
      `SELECT * FROM catalogue_models WHERE atelier_id = ? ORDER BY display_order ASC, created_at DESC`,
      [atelierId]
    );

    const formatted = models.map((m: any) => ({
      ...m,
      show_price: Boolean(m.show_price),
      is_published: Boolean(m.is_published),
      is_featured: Boolean(m.is_featured),
      images: typeof m.images === 'string' ? JSON.parse(m.images) : (m.images || []),
      colors: typeof m.colors === 'string' ? JSON.parse(m.colors) : (m.colors || []),
      sizes: typeof m.sizes === 'string' ? JSON.parse(m.sizes) : (m.sizes || []),
      tags: typeof m.tags === 'string' ? JSON.parse(m.tags) : (m.tags || [])
    }));

    return res.json({ success: true, models: formatted });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/catalogue/models - Créer un nouveau modèle rattaché à l'atelier
catalogueRouter.post('/models', requireTenant, requirePermission('catalogue.create'), async (req: Request, res: Response) => {
  const atelierId = req.atelierId!;
  const model = req.body;

  if (!model.name || !model.cover_image) {
    return res.status(400).json({ error: 'Le nom du modèle et la photo principale sont obligatoires.' });
  }

  try {
    const modelId = model.id || `catm-${Date.now()}`;
    const slug = slugify(model.name) + '-' + Math.random().toString(36).substring(2, 6);
    const nowIso = new Date().toISOString();

    await pool!.query(
      `INSERT INTO catalogue_models 
       (id, atelier_id, name, slug, description, category, price, show_price, currency, cover_image, images, colors, sizes, tags, is_published, is_featured, display_order, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        modelId,
        atelierId,
        model.name,
        slug,
        model.description || '',
        model.category || 'Autre',
        Number(model.price) || 0,
        model.show_price !== undefined ? (model.show_price ? 1 : 0) : 1,
        model.currency || 'FCFA',
        model.cover_image,
        JSON.stringify(model.images || []),
        JSON.stringify(model.colors || []),
        JSON.stringify(model.sizes || []),
        JSON.stringify(model.tags || []),
        model.is_published !== undefined ? (model.is_published ? 1 : 0) : 1,
        model.is_featured !== undefined ? (model.is_featured ? 1 : 0) : 0,
        Number(model.display_order) || 0,
        nowIso,
        nowIso
      ]
    );

    return res.json({ success: true, id: modelId, slug });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// PUT /api/catalogue/models/:id - Modifier un modèle (Strictement sécurisé par atelier_id)
catalogueRouter.put('/models/:id', requireTenant, requirePermission('catalogue.update'), async (req: Request, res: Response) => {
  const atelierId = req.atelierId!;
  const { id } = req.params;
  const m = req.body;

  try {
    const nowIso = new Date().toISOString();

    const [result]: any = await pool!.query(
      `UPDATE catalogue_models SET
        name = ?, description = ?, category = ?, price = ?, show_price = ?, currency = ?, cover_image = ?, images = ?, colors = ?, sizes = ?, tags = ?, is_published = ?, is_featured = ?, updated_at = ?
       WHERE id = ? AND atelier_id = ?`,
      [
        m.name,
        m.description || '',
        m.category || 'Autre',
        Number(m.price) || 0,
        m.show_price ? 1 : 0,
        m.currency || 'FCFA',
        m.cover_image,
        JSON.stringify(m.images || []),
        JSON.stringify(m.colors || []),
        JSON.stringify(m.sizes || []),
        JSON.stringify(m.tags || []),
        m.is_published ? 1 : 0,
        m.is_featured ? 1 : 0,
        nowIso,
        id,
        atelierId
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(403).json({ error: 'Modification refusée. Ce modèle n\'appartient pas à votre atelier.' });
    }

    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// DELETE /api/catalogue/models/:id - Supprimer un modèle de l'atelier
catalogueRouter.delete('/models/:id', requireTenant, requirePermission('catalogue.delete'), async (req: Request, res: Response) => {
  const atelierId = req.atelierId!;
  const { id } = req.params;

  try {
    const [result]: any = await pool!.query('DELETE FROM catalogue_models WHERE id = ? AND atelier_id = ?', [id, atelierId]);
    if (result.affectedRows === 0) {
      return res.status(403).json({ error: 'Suppression refusée. Modèle introuvable.' });
    }
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// PATCH /api/catalogue/models/:id/publish - Publier / Dépublier un modèle
catalogueRouter.patch('/models/:id/publish', requireTenant, requirePermission('catalogue.update'), async (req: Request, res: Response) => {
  const atelierId = req.atelierId!;
  const { id } = req.params;
  const { is_published } = req.body;

  try {
    await pool!.query('UPDATE catalogue_models SET is_published = ? WHERE id = ? AND atelier_id = ?', [is_published ? 1 : 0, id, atelierId]);
    return res.json({ success: true, is_published: Boolean(is_published) });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// PATCH /api/catalogue/models/:id/featured - Mettre en vedette / Enlever des vedettes
catalogueRouter.patch('/models/:id/featured', requireTenant, requirePermission('catalogue.update'), async (req: Request, res: Response) => {
  const atelierId = req.atelierId!;
  const { id } = req.params;
  const { is_featured } = req.body;

  try {
    await pool!.query('UPDATE catalogue_models SET is_featured = ? WHERE id = ? AND atelier_id = ?', [is_featured ? 1 : 0, id, atelierId]);
    return res.json({ success: true, is_featured: Boolean(is_featured) });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/catalogue/stats - Statistiques d'audience du catalogue pour cet atelier (Section 29 & 30)
catalogueRouter.get('/stats', requireTenant, requirePermission('catalogue.read'), async (req: Request, res: Response) => {
  const atelierId = req.atelierId!;

  try {
    const [viewsRows]: any = await pool!.query('SELECT COUNT(*) as totalViews FROM catalogue_analytics WHERE atelier_id = ? AND event_type = "CATALOGUE_VIEW"', [atelierId]);
    const [clicksRows]: any = await pool!.query('SELECT COUNT(*) as totalClicks FROM catalogue_analytics WHERE atelier_id = ? AND event_type = "WHATSAPP_CLICK"', [atelierId]);

    const [topModelRows]: any = await pool!.query(
      `SELECT name, views_count, whatsapp_clicks_count, cover_image
       FROM catalogue_models WHERE atelier_id = ? AND is_published = 1
       ORDER BY views_count DESC LIMIT 1`,
      [atelierId]
    );

    return res.json({
      success: true,
      stats: {
        catalogueViews: viewsRows[0]?.totalViews || 0,
        whatsappClicks: clicksRows[0]?.totalClicks || 0,
        topModel: topModelRows[0] || null
      }
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});
