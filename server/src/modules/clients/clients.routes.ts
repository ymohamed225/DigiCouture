import { Router, Request, Response } from 'express';
import { pool } from '../../config/database.js';
import { requireTenant } from '../../middleware/tenant.middleware.js';
import { requirePermission } from '../../middleware/permission.middleware.js';
import { checkSubscriptionLimit } from '../../middleware/subscription.middleware.js';
import { validate } from '../../validation/validate.middleware.js';
import { CreateClientSchema, UpdateClientSchema, ClientSearchSchema } from '../../validation/schemas.js';

export const clientsRouter = Router();

// Helper de génération automatique du customerCode unique par atelier (ex: CLI-000001)
async function generateCustomerCode(atelierId: string): Promise<string> {
  const [rows]: any = await pool!.query('SELECT COUNT(*) as total FROM clients WHERE atelierId = ?', [atelierId]);
  const count = (rows[0]?.total || 0) + 1;
  return `CLI-${String(count).padStart(6, '0')}`;
}

// GET /api/clients - Liste et recherche multi-critères côté serveur (Nom, Téléphone, WhatsApp, Code client, N° Commande)
clientsRouter.get('/', requireTenant, requirePermission('clients.read'), async (req: Request, res: Response) => {
  const atelierId = req.atelierId!;
  const q = (req.query.q || req.query.query || req.query.search || '')?.toString().trim();
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));
  const page = Math.max(1, Number(req.query.page) || 1);
  const offset = (page - 1) * limit;

  try {
    if (q) {
      const searchTerm = `%${q}%`;
      const [rows]: any = await pool!.query(
        `SELECT DISTINCT c.* 
         FROM clients c
         LEFT JOIN orders o ON o.clientId = c.id AND o.atelierId = c.atelierId
         WHERE c.atelierId = ?
           AND (
             c.fullName LIKE ?
             OR c.whatsapp LIKE ?
             OR c.customerCode LIKE ?
             OR o.orderNumber LIKE ?
             OR o.code LIKE ?
           )
         ORDER BY c.customerCode ASC, c.fullName ASC
         LIMIT ? OFFSET ?`,
        [atelierId, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, limit, offset]
      );
      return res.json(rows);
    }

    const [rows]: any = await pool!.query(
      'SELECT * FROM clients WHERE atelierId = ? ORDER BY customerCode ASC, fullName ASC LIMIT ? OFFSET ?',
      [atelierId, limit, offset]
    );
    return res.json(rows);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/clients/search - Endpoint dédié à la recherche rapide côté serveur
clientsRouter.get('/search', requireTenant, requirePermission('clients.read'), async (req: Request, res: Response) => {
  const atelierId = req.atelierId!;
  const q = (req.query.q || req.query.query || '')?.toString().trim();

  if (!q) {
    return res.json([]);
  }

  try {
    const searchTerm = `%${q}%`;
    const [rows]: any = await pool!.query(
      `SELECT DISTINCT c.* 
       FROM clients c
       LEFT JOIN orders o ON o.clientId = c.id AND o.atelierId = c.atelierId
       WHERE c.atelierId = ?
         AND (
           c.fullName LIKE ?
           OR c.whatsapp LIKE ?
           OR c.customerCode LIKE ?
           OR o.orderNumber LIKE ?
           OR o.code LIKE ?
         )
       ORDER BY c.customerCode ASC, c.fullName ASC
       LIMIT 50`,
      [atelierId, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm]
    );
    return res.json(rows);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/clients - Création d'un client avec Contrôle Strict des Limites d'Abonnement (SUBSCRIPTION_LIMIT_REACHED)
clientsRouter.post('/', requireTenant, requirePermission('clients.create'), checkSubscriptionLimit('clients'), validate(CreateClientSchema), async (req: Request, res: Response) => {
  const client = req.body;
  const atelierId = req.atelierId!;

  try {
    const customerCode = client.customerCode || await generateCustomerCode(atelierId);
    const clientId = client.id || `cli-${Date.now()}`;
    const createdAt = client.createdAt || new Date().toISOString().split('T')[0];
    const updatedAt = new Date().toISOString().split('T')[0];

    await pool!.query(
      `INSERT INTO clients (id, atelierId, customerCode, fullName, whatsapp, address, country, notes, avatarUrl, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE customerCode=VALUES(customerCode), fullName=VALUES(fullName), whatsapp=VALUES(whatsapp), address=VALUES(address), country=VALUES(country), notes=VALUES(notes), avatarUrl=VALUES(avatarUrl), updatedAt=VALUES(updatedAt)`,
      [
        clientId,
        atelierId,
        customerCode,
        client.fullName,
        client.whatsapp,
        client.address || '',
        client.country || "Côte d'Ivoire",
        client.notes || '',
        client.avatarUrl || '',
        createdAt,
        updatedAt
      ]
    );

    const savedClient = {
      ...client,
      id: clientId,
      atelierId,
      customerCode,
      country: client.country || "Côte d'Ivoire",
      notes: client.notes || '',
      createdAt,
      updatedAt
    };

    return res.json({ success: true, client: savedClient });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/clients/:id - Consultation d'un client par son ID ou customerCode
clientsRouter.get('/:id', requireTenant, requirePermission('clients.read'), async (req: Request, res: Response) => {
  const { id } = req.params;
  const atelierId = req.atelierId!;
  try {
    const [rows]: any = await pool!.query('SELECT * FROM clients WHERE (id = ? OR customerCode = ?) AND atelierId = ?', [id, id, atelierId]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Client non trouvé' });
    }
    return res.json(rows[0]);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// PATCH /api/clients/:id - Mise à jour partielle des informations d'un client
clientsRouter.patch('/:id', requireTenant, requirePermission('clients.update'), async (req: Request, res: Response) => {
  const { id } = req.params;
  const atelierId = req.atelierId!;
  const updateData = req.body;
  const updatedAt = new Date().toISOString().split('T')[0];

  try {
    const fields: string[] = [];
    const params: any[] = [];

    if (updateData.fullName) { fields.push('fullName = ?'); params.push(updateData.fullName); }
    if (updateData.whatsapp) { fields.push('whatsapp = ?'); params.push(updateData.whatsapp); }
    if (updateData.address !== undefined) { fields.push('address = ?'); params.push(updateData.address); }
    if (updateData.country) { fields.push('country = ?'); params.push(updateData.country); }
    if (updateData.notes !== undefined) { fields.push('notes = ?'); params.push(updateData.notes); }
    if (updateData.avatarUrl !== undefined) { fields.push('avatarUrl = ?'); params.push(updateData.avatarUrl); }

    fields.push('updatedAt = ?');
    params.push(updatedAt);

    params.push(id, atelierId);

    await pool!.query(`UPDATE clients SET ${fields.join(', ')} WHERE id = ? AND atelierId = ?`, params);
    
    const [updatedRows]: any = await pool!.query('SELECT * FROM clients WHERE id = ? AND atelierId = ?', [id, atelierId]);
    return res.json({ success: true, client: updatedRows[0] });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/clients/:id/measurements - Récupération des mesures actuelles du client
clientsRouter.get('/:id/measurements', requireTenant, requirePermission('clients.read'), async (req: Request, res: Response) => {
  const { id } = req.params;
  const atelierId = req.atelierId!;
  try {
    const [rows]: any = await pool!.query('SELECT * FROM measurements WHERE clientId = ? AND atelierId = ?', [id, atelierId]);
    return res.json(rows[0] || null);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/clients/:id/measurements - Mise à jour des mesures avec archivage de snapshot (RÈGLE INALTÉRABLE)
clientsRouter.post('/:id/measurements', requireTenant, requirePermission('clients.update'), async (req: Request, res: Response) => {
  const { id } = req.params;
  const atelierId = req.atelierId!;
  const meas = req.body;
  const updatedAt = new Date().toISOString().split('T')[0];

  try {
    // 1. Archivage non destructif dans measurement_history
    const [oldRows]: any = await pool!.query('SELECT * FROM measurements WHERE clientId = ? AND atelierId = ?', [id, atelierId]);
    if (oldRows.length > 0) {
      const snapId = `snap-${Date.now()}`;
      await pool!.query(
        `INSERT INTO measurement_history (id, atelierId, clientId, measurementsSnapshot, takenAt, note)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [snapId, atelierId, id, JSON.stringify(oldRows[0]), updatedAt, 'Archive automatique avant mise à jour REST']
      );
    }

    // 2. Insert / Update de la fiche active
    const measId = oldRows.length > 0 ? oldRows[0].id : `meas-${Date.now()}`;
    await pool!.query(
      `INSERT INTO measurements (id, atelierId, clientId, stature, longueurBras, tourPoitrine, tourTaille, tourHanche, customFields, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE stature=VALUES(stature), tourPoitrine=VALUES(tourPoitrine), tourTaille=VALUES(tourTaille), tourHanche=VALUES(tourHanche), updatedAt=VALUES(updatedAt)`,
      [measId, atelierId, id, meas.stature || 0, meas.longueurBras || 0, meas.tourPoitrine || 0, meas.tourTaille || 0, meas.tourHanche || 0, JSON.stringify(meas.customFields || {}), updatedAt]
    );

    return res.json({ success: true, message: 'Mesures enregistrées avec succès et archivées dans l\'historique.' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});
