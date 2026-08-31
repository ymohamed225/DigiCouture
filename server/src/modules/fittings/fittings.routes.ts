import { Router, Request, Response } from 'express';
import { pool } from '../../config/database.js';
import { requireTenant } from '../../middleware/tenant.middleware.js';
import { requirePermission } from '../../middleware/permission.middleware.js';

export const fittingsRouter = Router();

// GET /api/fittings - Liste des séances d'essayage d'un atelier
fittingsRouter.get('/', requireTenant, requirePermission('orders.read'), async (req: Request, res: Response) => {
  const atelierId = req.atelierId!;
  const { orderId, clientId, status } = req.query;

  try {
    let sql = 'SELECT * FROM fitting_sessions WHERE atelierId = ?';
    const params: any[] = [atelierId];

    if (orderId) {
      sql += ' AND orderId = ?';
      params.push(orderId);
    }
    if (clientId) {
      sql += ' AND clientId = ?';
      params.push(clientId);
    }
    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }

    sql += ' ORDER BY scheduledAt ASC';

    const [fittings]: any = await pool!.query(sql, params);
    return res.json(fittings);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/fittings - Programmer une séance d'essayage pour une commande
fittingsRouter.post('/', requireTenant, requirePermission('orders.create'), async (req: Request, res: Response) => {
  const f = req.body;
  const atelierId = req.atelierId!;

  if (!f.orderId || !f.clientId || !f.scheduledAt) {
    return res.status(400).json({ error: 'orderId, clientId et scheduledAt obligatoires' });
  }

  try {
    const id = f.id || `fit-${Date.now()}`;
    const createdAt = new Date().toISOString().split('T')[0];

    await pool!.query(
      `INSERT INTO fitting_sessions (id, atelierId, orderId, clientId, scheduledAt, status, notes, adjustments, nextAction, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        atelierId,
        f.orderId,
        f.clientId,
        f.scheduledAt,
        f.status || 'SCHEDULED',
        f.notes || '',
        f.adjustments || '',
        f.nextAction || 'Passer à l\'essayage',
        createdAt
      ]
    );

    return res.json({
      success: true,
      fitting: {
        id,
        atelierId,
        orderId: f.orderId,
        clientId: f.clientId,
        scheduledAt: f.scheduledAt,
        status: f.status || 'SCHEDULED',
        notes: f.notes || '',
        adjustments: f.adjustments || '',
        nextAction: f.nextAction || 'Passer à l\'essayage',
        createdAt
      }
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// PUT /api/fittings/:id - Validation d'essayage, enregistrement des retouches & statut (SCHEDULED, COMPLETED, NO_SHOW, CANCELLED)
fittingsRouter.put('/:id', requireTenant, requirePermission('orders.update'), async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, notes, adjustments, nextAction } = req.body;
  const atelierId = req.atelierId!;

  try {
    const updatedAt = new Date().toISOString().split('T')[0];

    await pool!.query(
      `UPDATE fitting_sessions 
       SET status = COALESCE(?, status),
           notes = COALESCE(?, notes),
           adjustments = COALESCE(?, adjustments),
           nextAction = COALESCE(?, nextAction),
           updatedAt = ?
       WHERE id = ? AND atelierId = ?`,
      [status || null, notes || null, adjustments || null, nextAction || null, updatedAt, id, atelierId]
    );

    return res.json({ success: true, fittingId: id, status, adjustments, nextAction, updatedAt });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});
