import { Router, Request, Response } from 'express';
import { pool } from '../../config/database.js';
import { requireTenant } from '../../middleware/tenant.middleware.js';
import { requirePermission } from '../../middleware/permission.middleware.js';

export const subscriptionsRouter = Router();

// GET /api/subscriptions/plans - Liste des plans d'abonnement SaaS (FREE, STARTER, PRO, VIP, ENTERPRISE)
subscriptionsRouter.get('/plans', async (req: Request, res: Response) => {
  try {
    const [plans]: any = await pool!.query('SELECT * FROM subscription_plans ORDER BY priceMonthly ASC');
    if (!plans || plans.length === 0) {
      // Formats par défaut si non initialisé dans la base
      const defaultPlans = [
        { id: 'plan-free', code: 'FREE', name: 'Formule Découverte', priceMonthly: 0, priceYearly: 0, maxUsers: 1, maxClients: 20, maxOrders: 50, storageLimitMb: 200 },
        { id: 'plan-starter', code: 'STARTER', name: 'Formule Starter', priceMonthly: 15000, priceYearly: 150000, maxUsers: 3, maxClients: 500, maxOrders: 1000, storageLimitMb: 2000 },
        { id: 'plan-pro', code: 'PRO', name: 'Formule Professionnelle', priceMonthly: 35000, priceYearly: 350000, maxUsers: 10, maxClients: 5000, maxOrders: 10000, storageLimitMb: 10000 },
        { id: 'plan-vip', code: 'VIP', name: 'Formule VIP Prestige', priceMonthly: 75000, priceYearly: 750000, maxUsers: 25, maxClients: 25000, maxOrders: 50000, storageLimitMb: 50000 },
        { id: 'plan-enterprise', code: 'ENTERPRISE', name: 'Formule Entreprise Sur-Mesure', priceMonthly: 150000, priceYearly: 1500000, maxUsers: 100, maxClients: 100000, maxOrders: 200000, storageLimitMb: 200000 }
      ];
      return res.json(defaultPlans);
    }
    return res.json(plans);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/subscriptions/current - État de l'abonnement actif et calcul des quotas consommés
subscriptionsRouter.get('/current', requireTenant, async (req: Request, res: Response) => {
  const atelierId = req.atelierId!;

  try {
    const [cRows]: any = await pool!.query('SELECT COUNT(*) as total FROM clients WHERE atelierId = ?', [atelierId]);
    const [uRows]: any = await pool!.query('SELECT COUNT(*) as total FROM users WHERE atelierId = ?', [atelierId]);
    const [oRows]: any = await pool!.query('SELECT COUNT(*) as total FROM orders WHERE atelierId = ?', [atelierId]);

    const currentClients = cRows[0]?.total || 0;
    const currentUsers = uRows[0]?.total || 0;
    const currentOrders = oRows[0]?.total || 0;

    const [subRows]: any = await pool!.query(
      `SELECT s.*, sp.code as planCode, sp.name as planName, sp.maxClients, sp.maxUsers, sp.maxOrders, sp.storageLimitMb
       FROM subscriptions s
       JOIN subscription_plans sp ON s.planId = sp.id
       WHERE s.atelierId = ? AND s.status = 'active'
       LIMIT 1`,
      [atelierId]
    );

    const subscription = subRows[0] || {
      planCode: 'STARTER',
      planName: 'Formule Starter',
      status: 'active',
      maxClients: 500,
      maxUsers: 5,
      maxOrders: 1000,
      storageLimitMb: 2000
    };

    return res.json({
      subscription,
      usage: {
        clients: { current: currentClients, max: subscription.maxClients, percentage: Math.min(100, Math.round((currentClients / subscription.maxClients) * 100)) },
        users: { current: currentUsers, max: subscription.maxUsers, percentage: Math.min(100, Math.round((currentUsers / subscription.maxUsers) * 100)) },
        orders: { current: currentOrders, max: subscription.maxOrders, percentage: Math.min(100, Math.round((currentOrders / subscription.maxOrders) * 100)) }
      }
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});
