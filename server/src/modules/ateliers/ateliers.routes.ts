import { Router, Request, Response } from 'express';
import { pool } from '../../config/database.js';
import { requireTenant } from '../../middleware/tenant.middleware.js';

export const ateliersRouter = Router();

// GET /api/ateliers/me - Informations de l'atelier connecté (Tenant)
ateliersRouter.get('/me', requireTenant, async (req: Request, res: Response) => {
  const atelierId = req.atelierId!;
  try {
    const [rows]: any = await pool!.query('SELECT * FROM ateliers WHERE id = ?', [atelierId]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Atelier non trouvé' });
    }
    return res.json(rows[0]);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

ateliersRouter.get('/', async (req: Request, res: Response) => {
  try {
    const [rows]: any = await pool!.query('SELECT * FROM ateliers ORDER BY registeredAt DESC');
    return res.json(rows);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

ateliersRouter.post('/', async (req: Request, res: Response) => {
  const atelier = req.body;
  const now = new Date();
  const nowIso = now.toISOString();
  const trialEndDateIso = new Date(now.getTime() + 30 * 24 * 3600 * 1000).toISOString();

  try {
    const atelierId = atelier.id || `atl-${Date.now()}`;
    const planCode = (atelier.plan || 'FREE').toUpperCase() === 'PRO' ? 'PRO' : 'FREE';

    await pool!.query(
      `INSERT INTO ateliers (
        id, name, slug, ownerName, whatsapp, city, address, plan, registeredAt, trialEndsAt,
        subscription_plan, subscription_status, trial_start_date, trial_end_date,
        monthly_order_limit, client_limit, user_limit, storage_limit_mb, subscription_created_at
       )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
         name=VALUES(name), ownerName=VALUES(ownerName), city=VALUES(city), address=VALUES(address)`,
      [
        atelierId,
        atelier.name,
        atelier.slug || (atelier.name ? atelier.name.toLowerCase().replace(/[^a-z0-9]/g, '-') : 'atelier'),
        atelier.ownerName || atelier.owner || 'Gérant',
        atelier.whatsapp || atelier.phone || '',
        atelier.city || 'Abidjan',
        atelier.address || '',
        planCode.toLowerCase(),
        nowIso.split('T')[0],
        trialEndDateIso.split('T')[0],
        planCode,
        'TRIAL',
        nowIso,
        trialEndDateIso,
        planCode === 'PRO' ? 999999 : 20,
        planCode === 'PRO' ? 500 : 50,
        planCode === 'PRO' ? 3 : 1,
        planCode === 'PRO' ? 10000 : 500,
        nowIso
      ]
    );
    return res.json({ success: true, atelier });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

ateliersRouter.delete('/:identifier', async (req: Request, res: Response) => {
  const { identifier } = req.params;
  const cleanPhone = identifier.replace(/[^0-9]/g, '');
  const last8 = cleanPhone.slice(-8);

  try {
    await pool!.query(
      'DELETE FROM ateliers WHERE id = ? OR REPLACE(whatsapp, " ", "") LIKE ? OR REPLACE(whatsapp, " ", "") LIKE ?',
      [identifier, `%${last8}`, `%${cleanPhone}`]
    );
    return res.json({ 
      success: true, 
      message: '🛑 COMPTE DÉSABONNÉ & SUPPRIMÉ DÉFINITIVEMENT DE TOUTE LA PLATEFORME (WEB & MOBILE)' 
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});
