import { Router, Request, Response } from 'express';
import { pool } from '../../config/database.js';
import { requireTenant } from '../../middleware/tenant.middleware.js';

export const uploadsRouter = Router();

// GET /api/uploads/attachments - Consulter les fichiers / photos d'une entité (ex: ORDER, FABRIC, GARMENT, CLIENT)
uploadsRouter.get('/attachments', requireTenant, async (req: Request, res: Response) => {
  const atelierId = req.atelierId!;
  const { entityType, entityId } = req.query;

  if (!entityType || !entityId) {
    return res.status(400).json({ error: 'entityType et entityId obligatoires' });
  }

  try {
    const [attachments]: any = await pool!.query(
      'SELECT * FROM attachments WHERE atelierId = ? AND entityType = ? AND entityId = ? ORDER BY createdAt DESC',
      [atelierId, entityType, entityId]
    );
    return res.json(attachments);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/uploads/attachments - Enregistrer une pièce jointe / photo avec Clé de Stockage Objet S3
uploadsRouter.post('/attachments', requireTenant, async (req: Request, res: Response) => {
  const fileData = req.body;
  const atelierId = req.atelierId!;

  if (!fileData.entityType || !fileData.entityId || (!fileData.url && !fileData.base64)) {
    return res.status(400).json({ error: 'entityType, entityId et url/file obligatoires' });
  }

  try {
    const id = fileData.id || `att-${Date.now()}`;
    const entityType = fileData.entityType.toString().toUpperCase();
    const entityId = fileData.entityId;
    const createdAt = new Date().toISOString().split('T')[0];

    // Clé de stockage objet unique (ex: S3 path: ateliers/atl-xxx/ORDER/ord-yyy/file-123.jpg)
    const storageKey = fileData.storageKey || `ateliers/${atelierId}/${entityType}/${entityId}/${id}.jpg`;
    
    // En production: URL CDN / S3 publique ou pré-signée sans exposer les clés d'accès secrètes
    const url = fileData.url || fileData.fileUrl || fileData.base64 || `https://storage.digicouture.ci/${storageKey}`;
    const mimeType = fileData.mimeType || 'image/jpeg';
    const size = Number(fileData.size) || 0;

    await pool!.query(
      `INSERT INTO attachments (id, atelierId, entityType, entityId, storageKey, url, mimeType, size, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE url=VALUES(url), mimeType=VALUES(mimeType), size=VALUES(size)`,
      [id, atelierId, entityType, entityId, storageKey, url, mimeType, size, createdAt]
    );

    return res.json({
      success: true,
      attachment: {
        id,
        atelierId,
        entityType,
        entityId,
        storageKey,
        url,
        mimeType,
        size,
        createdAt
      }
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// DELETE /api/uploads/attachments/:id - Supprimer une photo / pièce jointe
uploadsRouter.delete('/attachments/:id', requireTenant, async (req: Request, res: Response) => {
  const { id } = req.params;
  const atelierId = req.atelierId!;

  try {
    await pool!.query('DELETE FROM attachments WHERE id = ? AND atelierId = ?', [id, atelierId]);
    return res.json({ success: true, message: 'Pièce jointe supprimée avec succès' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});
