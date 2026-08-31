import { Router, Request, Response } from 'express';
import { pool } from '../../config/database.js';
import { requireTenant } from '../../middleware/tenant.middleware.js';

export const auditRouter = Router();

auditRouter.get('/', requireTenant, async (req: Request, res: Response) => {
  const atelierId = req.atelierId!;
  try {
    const [rows]: any = await pool!.query('SELECT * FROM audit_logs WHERE atelierId = ? ORDER BY createdAt DESC LIMIT 100', [atelierId]);
    return res.json(rows);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

auditRouter.post('/', async (req: Request, res: Response) => {
  const { atelierId, userId, action, details } = req.body;
  const tenantId = atelierId || req.headers['x-atelier-id'];

  if (!tenantId || !action) return res.status(400).json({ error: 'atelierId et action obligatoires' });

  try {
    const id = `audit-${Date.now()}`;
    const ip = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
    await pool!.query(
      `INSERT INTO audit_logs (id, atelierId, userId, action, details, ipAddress, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, tenantId, userId || 'system', action, JSON.stringify(details || {}), String(ip), new Date().toISOString()]
    );
    return res.json({ success: true, id });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});
