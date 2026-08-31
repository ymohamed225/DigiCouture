// ─────────────────────────────────────────────────────────────────────────────
// DIGICOUTURE VIP — Routes API de Synchronisation Idempotente (Push & Pull)
// ─────────────────────────────────────────────────────────────────────────────

import { Router, Request, Response } from 'express';
import { pool } from '../../config/database.js';
import { requireTenant } from '../../middleware/tenant.middleware.js';
import { logger } from '../../utils/logger.js';

export const syncRouter = Router();

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/sync/push — Traitement des éléments de la file d'attente locale
// ─────────────────────────────────────────────────────────────────────────────
syncRouter.post('/push', requireTenant, async (req: Request, res: Response) => {
  const atelierId = req.atelierId!;
  const { items } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.json({ success: true, syncedIds: [], message: 'Aucun élément à synchroniser.' });
  }

  const syncedIds: string[] = [];

  for (const item of items) {
    const { id, entityType, entityId, operation, payload } = item;
    if (!payload || !entityType) continue;

    try {
      if (entityType === 'client') {
        const { fullName, phone, whatsapp, gender, chest, waist, hips, notes, createdAt } = payload;
        const nowIso = new Date().toISOString();

        if (operation === 'CREATE' || operation === 'UPDATE') {
          await pool!.query(
            `INSERT INTO clients (id, atelierId, fullName, phone, whatsapp, gender, chest, waist, hips, notes, createdAt)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
             fullName = VALUES(fullName), phone = VALUES(phone), whatsapp = VALUES(whatsapp),
             gender = VALUES(gender), chest = VALUES(chest), waist = VALUES(waist), hips = VALUES(hips), notes = VALUES(notes)`,
            [entityId, atelierId, fullName || 'Client Sans Nom', phone || '', whatsapp || phone || '', gender || 'femme', chest || 0, waist || 0, hips || 0, notes || '', createdAt || nowIso]
          );
        } else if (operation === 'DELETE') {
          await pool!.query('DELETE FROM clients WHERE id = ? AND atelierId = ?', [entityId, atelierId]);
        }
      } else if (entityType === 'order') {
        const { code, clientId, clientName, clientWhatsapp, modelName, garmentType, fabricName, fabricColor, deliveryDate, urgency, status, totalAmount, depositAmount, remainingAmount, createdAt } = payload;
        const nowIso = new Date().toISOString();

        if (operation === 'CREATE' || operation === 'UPDATE') {
          await pool!.query(
            `INSERT INTO orders (id, code, atelierId, clientId, clientName, clientWhatsapp, modelName, garmentType, fabricName, fabricColor, deliveryDate, urgency, status, totalAmount, depositAmount, remainingAmount, createdAt)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
             status = VALUES(status), totalAmount = VALUES(totalAmount), depositAmount = VALUES(depositAmount), remainingAmount = VALUES(remainingAmount)`,
            [
              entityId,
              code || `CMD-2026-${Math.floor(100 + Math.random() * 900)}`,
              atelierId,
              clientId || null,
              clientName || 'Client',
              clientWhatsapp || '',
              modelName || 'Tenue Sur Mesure',
              garmentType || 'Sur-mesure',
              fabricName || '',
              fabricColor || '',
              deliveryDate || '2026-09-01',
              urgency || 'normale',
              status || 'commande_recue',
              totalAmount || 0,
              depositAmount || 0,
              remainingAmount || 0,
              createdAt || nowIso
            ]
          );
        } else if (operation === 'DELETE') {
          await pool!.query('DELETE FROM orders WHERE id = ? AND atelierId = ?', [entityId, atelierId]);
        }
      } else if (entityType === 'payment') {
        const { orderId, amount, method, reference, createdAt } = payload;
        const nowIso = new Date().toISOString();

        if (operation === 'CREATE') {
          await pool!.query(
            `INSERT INTO payments (id, atelierId, orderId, amount, method, status, reference, createdAt)
             VALUES (?, ?, ?, ?, ?, 'completed', ?, ?)
             ON DUPLICATE KEY UPDATE amount = VALUES(amount)`,
            [entityId, atelierId, orderId || null, amount || 0, method || 'cash', reference || `REF-OFFLINE-${Date.now()}`, createdAt || nowIso]
          );
        }
      } else if (entityType === 'catalogue' || entityType === 'catalogue_model') {
        const { title, name, category, estimatedPrice, price, imageUrl, cover_image, description, createdAt } = payload;
        const nowIso = new Date().toISOString();
        const modelTitle = title || name || 'Modèle Sur-Mesure';
        const modelImage = imageUrl || cover_image || '';
        const numPrice = Number(String(price || estimatedPrice || '0').replace(/[^0-9]/g, '')) || 0;
        const slug = modelTitle.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.random().toString(36).substring(2, 6);

        if (operation === 'CREATE' || operation === 'UPDATE') {
          await pool!.query(
            `INSERT INTO catalogue_models (id, atelier_id, name, slug, description, category, price, show_price, currency, cover_image, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, 1, 'FCFA', ?, ?, ?)
             ON DUPLICATE KEY UPDATE name = VALUES(name), category = VALUES(category), price = VALUES(price), cover_image = VALUES(cover_image), description = VALUES(description)`,
            [entityId, atelierId, modelTitle, slug, description || '', category || 'Robes', numPrice, modelImage, createdAt || nowIso, nowIso]
          );
        } else if (operation === 'DELETE') {
          await pool!.query('DELETE FROM catalogue_models WHERE id = ? AND atelier_id = ?', [entityId, atelierId]);
        }
      }

      syncedIds.push(id);
    } catch (err: any) {
      logger.error({ err, queueId: id, entityId }, '[SyncEngine Push Error]');
    }
  }

  logger.info({ atelierId, syncedCount: syncedIds.length }, '[SyncEngine Push Completed]');
  return res.json({ success: true, syncedIds, message: `${syncedIds.length} élément(s) synchronisé(s) avec succès.` });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/sync/pull — Récupération des données distantes modifiées
// ─────────────────────────────────────────────────────────────────────────────
syncRouter.get('/pull', requireTenant, async (req: Request, res: Response) => {
  const atelierId = req.atelierId!;
  const since = (req.query.since || '2000-01-01T00:00:00.000Z')?.toString();

  try {
    const [clients]: any = await pool!.query('SELECT * FROM clients WHERE atelierId = ? AND createdAt >= ?', [atelierId, since]);
    const [orders]: any = await pool!.query('SELECT * FROM orders WHERE atelierId = ? AND createdAt >= ?', [atelierId, since]);
    const [payments]: any = await pool!.query('SELECT * FROM payments WHERE atelierId = ? AND createdAt >= ?', [atelierId, since]);
    const [catalogue]: any = await pool!.query('SELECT * FROM catalogue_models WHERE atelier_id = ? AND created_at >= ?', [atelierId, since]);

    return res.json({
      success: true,
      lastSyncedAt: new Date().toISOString(),
      data: {
        clients: clients || [],
        orders: orders || [],
        payments: payments || [],
        catalogue: catalogue || []
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});
