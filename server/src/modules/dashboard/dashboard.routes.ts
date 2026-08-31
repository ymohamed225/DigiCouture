import { Router, Request, Response } from 'express';
import { pool } from '../../config/database.js';
import { requireTenant } from '../../middleware/tenant.middleware.js';

export const dashboardRouter = Router();

// GET /api/dashboard - Dashboard Atelier 100% Dynamique (Zéro Donnée Financière Hardcodée - SSOT BDD)
dashboardRouter.get('/', requireTenant, async (req: Request, res: Response) => {
  const atelierId = req.atelierId!;
  const currentMonthPrefix = new Date().toISOString().slice(0, 7); // ex: "2026-08"

  try {
    // 1. Indice financier réel (Encaissements enregistrés dans la table payments)
    const [[{ totalRevenue }]]: any = await pool!.query(
      `SELECT COALESCE(SUM(amount), 0) as totalRevenue 
       FROM payments 
       WHERE atelierId = ? AND status = 'completed'`,
      [atelierId]
    );

    // 2. Encaissements du mois en cours
    const [[{ monthlyRevenue }]]: any = await pool!.query(
      `SELECT COALESCE(SUM(amount), 0) as monthlyRevenue 
       FROM payments 
       WHERE atelierId = ? AND status = 'completed' AND createdAt LIKE ?`,
      [atelierId, `${currentMonthPrefix}%`]
    );

    // 3. Reste à recouvrir (Solde impayé des commandes en cours)
    const [[{ pendingAmount }]]: any = await pool!.query(
      `SELECT COALESCE(SUM(remainingAmount), 0) as pendingAmount 
       FROM orders 
       WHERE atelierId = ? AND remainingAmount > 0`,
      [atelierId]
    );

    // 4. Volume total des commandes
    const [[{ totalOrderVolume }]]: any = await pool!.query(
      `SELECT COALESCE(SUM(totalAmount), 0) as totalOrderVolume 
       FROM orders 
       WHERE atelierId = ?`,
      [atelierId]
    );

    // 5. Compteurs d'entités métier
    const [[{ totalOrders }]]: any = await pool!.query('SELECT COUNT(*) as totalOrders FROM orders WHERE atelierId = ?', [atelierId]);
    const [[{ activeClients }]]: any = await pool!.query('SELECT COUNT(*) as activeClients FROM clients WHERE atelierId = ?', [atelierId]);
    const [[{ teamMembers }]]: any = await pool!.query('SELECT COUNT(*) as teamMembers FROM users WHERE atelierId = ?', [atelierId]);
    const [[{ scheduledFittings }]]: any = await pool!.query('SELECT COUNT(*) as scheduledFittings FROM fitting_sessions WHERE atelierId = ? AND status = "SCHEDULED"', [atelierId]);

    // 6. Répartition dynamique des commandes par statut workflow
    const [statusRows]: any = await pool!.query(
      `SELECT status, COUNT(*) as count 
       FROM orders 
       WHERE atelierId = ? 
       GROUP BY status`,
      [atelierId]
    );

    const ordersByStatus: Record<string, number> = {
      commande_recue: 0,
      mesures_prises: 0,
      mesures_validees: 0,
      decoupe: 0,
      couture: 0,
      finitions: 0,
      essayage: 0,
      prete: 0,
      livree: 0
    };

    statusRows.forEach((row: any) => {
      ordersByStatus[row.status] = Number(row.count || 0);
    });

    // 7. Derniers encaissements récents (Top 5)
    const [recentPayments]: any = await pool!.query(
      `SELECT p.id, p.orderId, o.orderNumber, p.clientName, p.amount, p.currency, p.method, p.reference, p.createdAt
       FROM payments p
       LEFT JOIN orders o ON p.orderId = o.id
       WHERE p.atelierId = ?
       ORDER BY p.createdAt DESC LIMIT 5`,
      [atelierId]
    );

    // 8. Prochains essayages planifiés (Top 5)
    const [upcomingFittings]: any = await pool!.query(
      `SELECT fs.id, fs.orderId, o.orderNumber, c.fullName as clientName, fs.scheduledAt, fs.status, fs.notes
       FROM fitting_sessions fs
       LEFT JOIN orders o ON fs.orderId = o.id
       LEFT JOIN clients c ON fs.clientId = c.id
       WHERE fs.atelierId = ? AND fs.status = 'SCHEDULED'
       ORDER BY fs.scheduledAt ASC LIMIT 5`,
      [atelierId]
    );

    return res.json({
      financials: {
        totalRevenue: Number(totalRevenue || 0),
        monthlyRevenue: Number(monthlyRevenue || 0),
        pendingAmount: Number(pendingAmount || 0),
        totalOrderVolume: Number(totalOrderVolume || 0),
        currency: 'FCFA'
      },
      counts: {
        totalOrders: Number(totalOrders || 0),
        activeClients: Number(activeClients || 0),
        teamMembers: Number(teamMembers || 0),
        scheduledFittings: Number(scheduledFittings || 0)
      },
      ordersByStatus,
      recentPayments,
      upcomingFittings,
      generatedAt: new Date().toISOString()
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/dashboard/admin/stats - Statistiques d'administration plateforme SaaS
dashboardRouter.get('/admin/stats', async (req: Request, res: Response) => {
  try {
    const [[{ totalAteliers }]]: any = await pool!.query('SELECT COUNT(*) as totalAteliers FROM ateliers');
    const [[{ activeSubscribers }]]: any = await pool!.query('SELECT COUNT(*) as activeSubscribers FROM subscriptions WHERE status = "active"');
    const [[{ totalOrdersManaged }]]: any = await pool!.query('SELECT COUNT(*) as totalOrdersManaged FROM orders');
    const [[{ totalVolume }]]: any = await pool!.query('SELECT COALESCE(SUM(totalAmount), 0) as totalVolume FROM orders');

    return res.json({
      totalAteliers: totalAteliers || 1,
      activeSubscribers: activeSubscribers || 1,
      monthlyRevenue: (activeSubscribers || 1) * 15000,
      totalOrdersManaged: totalOrdersManaged || 0,
      totalVolumeFCFA: totalVolume || 0
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});
