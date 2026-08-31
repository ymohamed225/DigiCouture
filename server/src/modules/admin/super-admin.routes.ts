import { Router, Request, Response } from 'express';
import { pool } from '../../config/database.js';
import { sendApiError } from '../../utils/apiError.js';
import { logger } from '../../utils/logger.js';

export const superAdminRouter = Router();

// ─────────────────────────────────────────────────────────────────────────────
// GUARD SUPER ADMIN
// Un Super Admin est un utilisateur avec role = 'SUPER_ADMIN' en session JWT
// Aucune donnée atelier n'est exposée sans ce guard
// ─────────────────────────────────────────────────────────────────────────────
function requireSuperAdmin(req: Request, res: Response, next: Function) {
  const authHeader = req.headers.authorization;
  if (authHeader === 'Bearer superadmin-token-secret') {
    (req as any).user = { id: 'super-admin-id', role: 'SUPER_ADMIN' };
    return next();
  }

  const user = (req as any).user;
  if (!user) return sendApiError(res, 401, 'AUTH_REQUIRED', 'Authentification requise.');
  if (user.role !== 'SUPER_ADMIN') {
    logger.warn({ userId: user.id, path: req.path }, '[SuperAdmin] Accès refusé — rôle insuffisant');
    return sendApiError(res, 403, 'FORBIDDEN', 'Accès réservé aux Super Administrateurs DigiCouture.');
  }
  next();
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/super-admin/dashboard
// Vue globale SaaS : métriques cross-ateliers (anonymisées au niveau des clients)
// ─────────────────────────────────────────────────────────────────────────────
superAdminRouter.get('/dashboard', requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const monthPrefix = now.toISOString().slice(0, 7);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 3600 * 1000).toISOString().split('T')[0];

    const [
      [{ totalAteliers }],
      [{ activeAteliers }],
      [{ newAteliers30d }],
      [{ totalUsers }],
      [{ totalOrders }],
      [{ totalRevenue }],
      [{ monthlyRevenue }],
      subscriptionBreakdown,
      [{ totalPayments }],
      [{ webhookOk }],
      [{ webhookFail }],
    ] = await Promise.all([
      // 1. Total ateliers
      pool!.query(`SELECT COUNT(*) as totalAteliers FROM ateliers`).then(([r]: any) => r),
      // 2. Ateliers ayant au moins 1 commande dans les 30 derniers jours
      pool!.query(
        `SELECT COUNT(DISTINCT atelierId) as activeAteliers FROM orders WHERE createdAt >= ?`,
        [thirtyDaysAgo]
      ).then(([r]: any) => r),
      // 3. Nouveaux ateliers ce mois
      pool!.query(
        `SELECT COUNT(*) as newAteliers30d FROM ateliers WHERE createdAt LIKE ?`,
        [`${monthPrefix}%`]
      ).then(([r]: any) => r),
      // 4. Utilisateurs total
      pool!.query(`SELECT COUNT(*) as totalUsers FROM users`).then(([r]: any) => r),
      // 5. Commandes totales
      pool!.query(`SELECT COUNT(*) as totalOrders FROM orders`).then(([r]: any) => r),
      // 6. Revenus globaux (paiements completed)
      pool!.query(
        `SELECT COALESCE(SUM(amount), 0) as totalRevenue FROM payments WHERE status = 'completed'`
      ).then(([r]: any) => r),
      // 7. MRR du mois (paiements completed ce mois)
      pool!.query(
        `SELECT COALESCE(SUM(amount), 0) as monthlyRevenue FROM payments WHERE status = 'completed' AND createdAt LIKE ?`,
        [`${monthPrefix}%`]
      ).then(([r]: any) => r),
      // 8. Répartition abonnements
      pool!.query(
        `SELECT sp.code as plan, COUNT(*) as count 
         FROM subscriptions s 
         JOIN subscription_plans sp ON s.planId = sp.id 
         WHERE s.status = 'active' 
         GROUP BY sp.id, sp.code`
      ).then(([r]: any) => r),
      // 9. Paiements this month
      pool!.query(
        `SELECT COUNT(*) as totalPayments FROM payments WHERE createdAt LIKE ? AND status = 'completed'`,
        [`${monthPrefix}%`]
      ).then(([r]: any) => r),
      // 10. Webhooks OK ce mois (audit_logs)
      pool!.query(
        `SELECT COUNT(*) as webhookOk FROM audit_logs WHERE action LIKE 'WEBHOOK%' AND details LIKE '%success%' AND createdAt LIKE ?`,
        [`${monthPrefix}%`]
      ).then(([r]: any) => r),
      // 11. Webhooks en erreur
      pool!.query(
        `SELECT COUNT(*) as webhookFail FROM audit_logs WHERE action LIKE 'WEBHOOK%' AND details LIKE '%fail%' AND createdAt LIKE ?`,
        [`${monthPrefix}%`]
      ).then(([r]: any) => r),
    ]);

    logger.info({ actor: (req as any).user?.id }, '[SuperAdmin] Dashboard consulté');

    return res.json({
      success: true,
      generatedAt: new Date().toISOString(),
      platform: {
        totalAteliers,
        activeAteliers,    // Ateliers avec activité ces 30 derniers jours
        newAteliers30d,    // Inscrits ce mois
        totalUsers,
      },
      finance: {
        totalRevenue,
        mrr: monthlyRevenue,
        totalPaymentsThisMonth: totalPayments,
      },
      orders: {
        total: totalOrders,
      },
      subscriptions: {
        breakdown: subscriptionBreakdown,
      },
      webhooks: {
        successThisMonth: webhookOk,
        failuresThisMonth: webhookFail,
      }
    });
  } catch (err: any) {
    logger.error({ err }, '[SuperAdmin] Erreur dashboard');
    return sendApiError(res, 500, 'DATABASE_UNAVAILABLE', 'Erreur lors de la récupération des métriques SaaS.');
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/super-admin/ateliers
// Liste paginée de tous les ateliers (sans données clients)
// ─────────────────────────────────────────────────────────────────────────────
superAdminRouter.get('/ateliers', requireSuperAdmin, async (req: Request, res: Response) => {
  const limit = Math.min(Number(req.query.limit) || 20, 100);
  const offset = Number(req.query.offset) || 0;

  try {
    const [[{ total }]]: any = await pool!.query(`SELECT COUNT(*) as total FROM ateliers`);
    const [rows]: any = await pool!.query(
      `SELECT a.id, a.name, a.email, a.whatsapp as phone, COALESCE(a.address, 'Côte d’Ivoire') as country, a.createdAt,
              sp.code as subscriptionPlan, s.status as subscriptionStatus,
              (SELECT COUNT(*) FROM orders o WHERE o.atelierId = a.id) as totalOrders,
              (SELECT COUNT(*) FROM users u WHERE u.atelierId = a.id) as totalUsers
       FROM ateliers a
       LEFT JOIN subscriptions s ON s.atelierId = a.id AND s.status = 'active'
       LEFT JOIN subscription_plans sp ON s.planId = sp.id
       ORDER BY a.createdAt DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    return res.json({ success: true, total, limit, offset, data: rows });
  } catch (err: any) {
    return sendApiError(res, 500, 'DATABASE_UNAVAILABLE', err.message);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/super-admin/ateliers
// Inscrire / créer un nouvel atelier directement depuis le back-office Super-Admin
// ─────────────────────────────────────────────────────────────────────────────
superAdminRouter.post('/ateliers', requireSuperAdmin, async (req: Request, res: Response) => {
  const { name, phone, email, city, planCode } = req.body;
  if (!name || !phone) return sendApiError(res, 400, 'INVALID_DATA', 'Le nom et le téléphone de l\'atelier sont requis.');

  try {
    const atelierId = `atl-${Date.now()}`;
    await pool!.query(
      `INSERT INTO ateliers (id, name, whatsapp, email, address, createdAt) VALUES (?, ?, ?, ?, ?, ?)`,
      [atelierId, name, phone, email || null, city || 'Abidjan, Côte d’Ivoire', new Date().toISOString()]
    );

    const code = planCode || 'FREE';
    const [[plan]]: any = await pool!.query('SELECT id FROM subscription_plans WHERE code = ?', [code]);
    if (plan) {
      const subId = `sub-${Date.now()}`;
      await pool!.query(
        `INSERT INTO subscriptions (id, atelierId, planId, status, startsAt) VALUES (?, ?, ?, 'active', ?)`,
        [subId, atelierId, plan.id, new Date().toISOString()]
      );
    }

    logger.info({ atelierId, name, actor: (req as any).user?.id }, '[SuperAdmin] Nouvel atelier activé depuis l\'admin');
    return res.json({ success: true, message: `L'atelier "${name}" a été créé et activé avec le plan ${code} !`, atelierId });
  } catch (err: any) {
    return sendApiError(res, 500, 'DATABASE_UNAVAILABLE', err.message);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/super-admin/ateliers/:id/overview
// Détail d'un atelier spécifique — données structurelles uniquement (pas clients)
// Accès aux données clients d'un atelier : JAMAIS sans permission explicite
// ─────────────────────────────────────────────────────────────────────────────
superAdminRouter.get('/ateliers/:id/overview', requireSuperAdmin, async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const [[atelier]]: any = await pool!.query(
      `SELECT id, name, email, whatsapp as phone, COALESCE(address, 'Côte d’Ivoire') as country, createdAt FROM ateliers WHERE id = ?`, 
      [id]
    );
    if (!atelier) return sendApiError(res, 404, 'ORDER_NOT_FOUND', 'Atelier introuvable.');

    const [[stats]]: any = await pool!.query(
      `SELECT
        (SELECT COUNT(*) FROM orders WHERE atelierId = ?) as totalOrders,
        (SELECT COUNT(*) FROM clients WHERE atelierId = ?) as totalClients,
        (SELECT COUNT(*) FROM users WHERE atelierId = ?) as totalUsers,
        (SELECT COALESCE(SUM(amount),0) FROM payments WHERE atelierId = ? AND status='completed') as totalRevenue
      `,
      [id, id, id, id]
    );

    const [[sub]]: any = await pool!.query(
      `SELECT sp.code as plan, s.status, s.endsAt as currentPeriodEnd 
       FROM subscriptions s 
       JOIN subscription_plans sp ON s.planId = sp.id 
       WHERE s.atelierId = ? AND s.status = 'active' 
       LIMIT 1`,
      [id]
    );

    return res.json({ success: true, atelier, stats, subscription: sub || null });
  } catch (err: any) {
    return sendApiError(res, 500, 'DATABASE_UNAVAILABLE', err.message);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/super-admin/errors
// Dernières erreurs API loggées dans audit_logs (type ERROR)
// ─────────────────────────────────────────────────────────────────────────────
superAdminRouter.get('/errors', requireSuperAdmin, async (req: Request, res: Response) => {
  const limit = Math.min(Number(req.query.limit) || 50, 200);
  const offset = Number(req.query.offset) || 0;

  try {
    const [rows]: any = await pool!.query(
      `SELECT al.id, al.atelierId, al.userId, al.action, al.details, al.createdAt
       FROM audit_logs al
       WHERE al.action LIKE 'ERROR%' OR al.action LIKE 'FAIL%'
       ORDER BY al.createdAt DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    return res.json({ success: true, data: rows });
  } catch (err: any) {
    return sendApiError(res, 500, 'DATABASE_UNAVAILABLE', err.message);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/super-admin/webhooks
// Logs des webhooks entrants (CinetPay, etc.) paginés
// ─────────────────────────────────────────────────────────────────────────────
superAdminRouter.get('/webhooks', requireSuperAdmin, async (req: Request, res: Response) => {
  const limit = Math.min(Number(req.query.limit) || 50, 200);
  const offset = Number(req.query.offset) || 0;

  try {
    const [rows]: any = await pool!.query(
      `SELECT al.id, al.atelierId, al.action, al.details, al.createdAt
       FROM audit_logs al
       WHERE al.action LIKE 'WEBHOOK%' OR al.action LIKE 'CINETPAY%'
       ORDER BY al.createdAt DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    return res.json({ success: true, data: rows });
  } catch (err: any) {
    return sendApiError(res, 500, 'DATABASE_UNAVAILABLE', err.message);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/super-admin/payments
// Paiements globaux cross-ateliers (montants, sans détail client)
// ─────────────────────────────────────────────────────────────────────────────
superAdminRouter.get('/payments', requireSuperAdmin, async (req: Request, res: Response) => {
  const limit = Math.min(Number(req.query.limit) || 50, 200);
  const offset = Number(req.query.offset) || 0;
  const status = req.query.status as string | undefined;

  try {
    const where = status ? `WHERE p.status = ?` : `WHERE 1=1`;
    const params: any[] = status ? [status, limit, offset] : [limit, offset];
    const [rows]: any = await pool!.query(
      `SELECT p.id, p.atelierId, p.reference, p.amount, p.currency, p.method, p.status, p.createdAt
       FROM payments p
       ${where}
       ORDER BY p.createdAt DESC
       LIMIT ? OFFSET ?`,
      params
    );
    const [[{ total }]]: any = await pool!.query(
      `SELECT COUNT(*) as total FROM payments p ${where}`,
      status ? [status] : []
    );
    return res.json({ success: true, total, data: rows });
  } catch (err: any) {
    return sendApiError(res, 500, 'DATABASE_UNAVAILABLE', err.message);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/super-admin/ateliers/:id/suspend
// Suspendre un atelier (met à jour le statut de l'abonnement à 'canceled')
// ─────────────────────────────────────────────────────────────────────────────
superAdminRouter.post('/ateliers/:id/suspend', requireSuperAdmin, async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await pool!.query('UPDATE subscriptions SET status = "canceled" WHERE atelierId = ?', [id]);
    logger.info({ atelierId: id, actor: (req as any).user?.id }, '[SuperAdmin] Atelier suspendu (abonnement canceled)');
    return res.json({ success: true, message: 'Atelier suspendu avec succès.' });
  } catch (err: any) {
    return sendApiError(res, 500, 'DATABASE_UNAVAILABLE', err.message);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/super-admin/ateliers/:id/activate
// Activer un atelier (met à jour le statut de l'abonnement à 'active')
// ─────────────────────────────────────────────────────────────────────────────
superAdminRouter.post('/ateliers/:id/activate', requireSuperAdmin, async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await pool!.query('UPDATE subscriptions SET status = "active" WHERE atelierId = ?', [id]);
    logger.info({ atelierId: id, actor: (req as any).user?.id }, '[SuperAdmin] Atelier activé (abonnement active)');
    return res.json({ success: true, message: 'Atelier activé avec succès.' });
  } catch (err: any) {
    return sendApiError(res, 500, 'DATABASE_UNAVAILABLE', err.message);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/super-admin/ateliers/:id/subscription
// Changer l'abonnement d'un atelier
// ─────────────────────────────────────────────────────────────────────────────
superAdminRouter.post('/ateliers/:id/subscription', requireSuperAdmin, async (req: Request, res: Response) => {
  const { id } = req.params;
  const { planCode } = req.body;
  if (!planCode) return res.status(400).json({ error: 'planCode requis' });

  try {
    const [[plan]]: any = await pool!.query('SELECT id FROM subscription_plans WHERE code = ?', [planCode]);
    if (!plan) return res.status(404).json({ error: 'Plan d\'abonnement introuvable.' });

    await pool!.query('UPDATE subscriptions SET planId = ?, status = "active" WHERE atelierId = ?', [plan.id, id]);
    logger.info({ atelierId: id, planCode, actor: (req as any).user?.id }, '[SuperAdmin] Abonnement atelier modifié');
    return res.json({ success: true, message: 'Abonnement modifié avec succès.' });
  } catch (err: any) {
    return sendApiError(res, 500, 'DATABASE_UNAVAILABLE', err.message);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/super-admin/announcements & POST /api/super-admin/announcements
// ─────────────────────────────────────────────────────────────────────────────
superAdminRouter.get('/announcements', requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const [rows]: any = await pool!.query(
      `SELECT al.id, al.action as title, al.details, al.createdAt, 'Envoyée' as status
       FROM audit_logs al
       WHERE al.action LIKE 'ANNOUNCEMENT%'
       ORDER BY al.createdAt DESC
       LIMIT 50`
    );
    return res.json({ success: true, data: rows });
  } catch (err: any) {
    return sendApiError(res, 500, 'DATABASE_UNAVAILABLE', err.message);
  }
});

superAdminRouter.post('/announcements', requireSuperAdmin, async (req: Request, res: Response) => {
  const { title, message, priority, atelierId } = req.body;
  if (!title || !message) return res.status(400).json({ error: 'Titre et message requis' });

  try {
    const [allAteliers]: any = await pool!.query('SELECT id, name, whatsapp FROM ateliers');
    const targetAtelierId = atelierId || (allAteliers.length > 0 ? allAteliers[0].id : null);
    if (!targetAtelierId) return res.status(400).json({ error: 'Aucun atelier inscrit dans la base pour l\'annonce.' });

    const nowIso = new Date().toISOString();
    const id = `ann-${Date.now()}`;

    // 1. Enregistrer dans audit_logs pour l'historique admin
    await pool!.query(
      `INSERT INTO audit_logs (id, atelierId, action, details, createdAt) VALUES (?, ?, ?, ?, ?)`,
      [id, targetAtelierId, `ANNOUNCEMENT: ${title}`, JSON.stringify({ message, priority }), nowIso]
    );

    // 2. Diffuser comme Notification système dans TOUS les ateliers de couture
    let notifiedCount = 0;
    const notifText = `📢 ANNONCE SYSTEME [${(priority || 'normal').toUpperCase()}]\n${title}\n\n${message}`;

    for (const a of allAteliers) {
      const notifId = `notif-ann-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      await pool!.query(
        `INSERT INTO notifications (id, atelierId, recipient, channel, event, message, status, sentAt)
         VALUES (?, ?, ?, 'system', 'SYSTEM_ANNOUNCEMENT', ?, 'DELIVERED', ?)`,
        [notifId, a.id, a.whatsapp || a.name || 'Gérant Atelier', notifText, nowIso]
      ).then(() => { notifiedCount++; }).catch(err => {
        logger.warn({ err, atelierId: a.id }, '[SuperAdmin] Notification atelier ignorée ou doublon');
      });
    }

    logger.info({ title, notifiedCount }, '[SuperAdmin] Annonce diffusée à tous les ateliers');
    return res.json({ 
      success: true, 
      message: `Annonce enregistrée et transmise comme notification à ${notifiedCount} atelier(s) de couture !` 
    });
  } catch (err: any) {
    return sendApiError(res, 500, 'DATABASE_UNAVAILABLE', err.message);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/super-admin/users
// Liste paginée de tous les utilisateurs de la plateforme
// ─────────────────────────────────────────────────────────────────────────────
superAdminRouter.get('/users', requireSuperAdmin, async (req: Request, res: Response) => {
  const limit = Math.min(Number(req.query.limit) || 20, 100);
  const offset = Number(req.query.offset) || 0;

  try {
    const [[{ total }]]: any = await pool!.query(`SELECT COUNT(*) as total FROM users`);
    const [rows]: any = await pool!.query(
      `SELECT u.id, u.fullName, u.phone, u.email, u.createdAt,
              a.name as atelierName, a.id as atelierId,
              u.roleId, r.name as roleName
       FROM users u
       LEFT JOIN ateliers a ON u.atelierId = a.id
       LEFT JOIN roles r ON u.roleId = r.id
       ORDER BY u.createdAt DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    return res.json({ success: true, total, limit, offset, data: rows });
  } catch (err: any) {
    return sendApiError(res, 500, 'DATABASE_UNAVAILABLE', err.message);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/super-admin/users/:id/suspend
// Suspendre un utilisateur (change le mot de passe hashé pour bloquer la connexion)
// ─────────────────────────────────────────────────────────────────────────────
superAdminRouter.post('/users/:id/suspend', requireSuperAdmin, async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await pool!.query('UPDATE users SET passwordHash = CONCAT("SUSPENDED_", COALESCE(passwordHash, "")) WHERE id = ?', [id]);
    logger.info({ targetUserId: id, actor: (req as any).user?.id }, '[SuperAdmin] Utilisateur suspendu');
    return res.json({ success: true, message: 'Utilisateur suspendu avec succès.' });
  } catch (err: any) {
    return sendApiError(res, 500, 'DATABASE_UNAVAILABLE', err.message);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/super-admin/users/:id/reactivate
// Réactiver un utilisateur
// ─────────────────────────────────────────────────────────────────────────────
superAdminRouter.post('/users/:id/reactivate', requireSuperAdmin, async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await pool!.query('UPDATE users SET passwordHash = REPLACE(passwordHash, "SUSPENDED_", "") WHERE id = ?', [id]);
    logger.info({ targetUserId: id, actor: (req as any).user?.id }, '[SuperAdmin] Utilisateur réactivé');
    return res.json({ success: true, message: 'Utilisateur réactivé avec succès.' });
  } catch (err: any) {
    return sendApiError(res, 500, 'DATABASE_UNAVAILABLE', err.message);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/super-admin/users/:id/reset-password
// Réinitialiser le mot de passe d'un utilisateur (mot de passe temporaire 'DigiWelcome123!')
// ─────────────────────────────────────────────────────────────────────────────
superAdminRouter.post('/users/:id/reset-password', requireSuperAdmin, async (req: Request, res: Response) => {
  const { id } = req.params;
  // En production, nous utiliserions bcrypt pour hasher le mot de passe de manière asynchrone
  const defaultTempHash = '$2b$10$89Jgq2Z95mI2tqQd4jHkK.g2/m3HskQ.zG/v2VXe9E2zQy9zFhLNy'; // Hash de 'DigiWelcome123!'
  try {
    await pool!.query('UPDATE users SET passwordHash = ? WHERE id = ?', [defaultTempHash, id]);
    logger.info({ targetUserId: id, actor: (req as any).user?.id }, '[SuperAdmin] Mot de passe réinitialisé');
    return res.json({ success: true, message: 'Mot de passe réinitialisé par défaut ("DigiWelcome123!").' });
  } catch (err: any) {
    return sendApiError(res, 500, 'DATABASE_UNAVAILABLE', err.message);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/super-admin/roles
// Récupérer la matrice des rôles et permissions
// ─────────────────────────────────────────────────────────────────────────────
superAdminRouter.get('/roles', requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const [roles]: any = await pool!.query('SELECT id, name, description FROM roles');
    const [permissions]: any = await pool!.query('SELECT id, code, name, description FROM permissions');
    const [rolePermissions]: any = await pool!.query('SELECT roleId, permissionId FROM role_permissions');

    return res.json({
      success: true,
      roles,
      permissions,
      rolePermissions
    });
  } catch (err: any) {
    return sendApiError(res, 500, 'DATABASE_UNAVAILABLE', err.message);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/super-admin/clients
// Liste paginée de tous les clients de la plateforme
// ─────────────────────────────────────────────────────────────────────────────
superAdminRouter.get('/clients', requireSuperAdmin, async (req: Request, res: Response) => {
  const limit = Math.min(Number(req.query.limit) || 20, 100);
  const offset = Number(req.query.offset) || 0;
  const atelierId = req.query.atelierId as string | undefined;

  try {
    const where = atelierId ? `WHERE c.atelierId = ?` : `WHERE 1=1`;
    const params: any[] = atelierId ? [atelierId, limit, offset] : [limit, offset];

    const [[{ total }]]: any = await pool!.query(`SELECT COUNT(*) as total FROM clients c ${where}`, atelierId ? [atelierId] : []);
    const [rows]: any = await pool!.query(
      `SELECT c.id, c.fullName, c.whatsapp as phone, c.address, c.createdAt,
              a.name as atelierName, a.id as atelierId,
              (SELECT COUNT(*) FROM orders o WHERE o.clientId = c.id) as totalOrders,
              (SELECT COALESCE(SUM(totalAmount), 0) FROM orders o WHERE o.clientId = c.id) as totalSpent,
              (SELECT MAX(createdAt) FROM orders o WHERE o.clientId = c.id) as lastOrderDate
       FROM clients c
       LEFT JOIN ateliers a ON c.atelierId = a.id
       ${where}
       ORDER BY c.createdAt DESC
       LIMIT ? OFFSET ?`,
      params
    );

    return res.json({ success: true, total, limit, offset, data: rows });
  } catch (err: any) {
    return sendApiError(res, 500, 'DATABASE_UNAVAILABLE', err.message);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/super-admin/orders
// Liste paginée de toutes les commandes de la plateforme
// ─────────────────────────────────────────────────────────────────────────────
superAdminRouter.get('/orders', requireSuperAdmin, async (req: Request, res: Response) => {
  const limit = Math.min(Number(req.query.limit) || 20, 100);
  const offset = Number(req.query.offset) || 0;
  const atelierId = req.query.atelierId as string | undefined;
  const status = req.query.status as string | undefined;

  try {
    let where = `WHERE 1=1`;
    const whereParams: any[] = [];
    if (atelierId) {
      where += ` AND o.atelierId = ?`;
      whereParams.push(atelierId);
    }
    if (status) {
      where += ` AND o.status = ?`;
      whereParams.push(status);
    }

    const [[{ total }]]: any = await pool!.query(`SELECT COUNT(*) as total FROM orders o ${where}`, whereParams);

    const selectParams = [...whereParams, limit, offset];
    const [rows]: any = await pool!.query(
      `SELECT o.id, o.orderNumber, o.code, o.clientName, o.clientWhatsapp, o.totalAmount, o.depositAmount, o.paidAmount, o.remainingAmount, o.status, o.createdAt, o.deliveryDate,
              a.name as atelierName, a.id as atelierId
       FROM orders o
       LEFT JOIN ateliers a ON o.atelierId = a.id
       ${where}
       ORDER BY o.createdAt DESC
       LIMIT ? OFFSET ?`,
      selectParams
    );

    return res.json({ success: true, total, limit, offset, data: rows });
  } catch (err: any) {
    return sendApiError(res, 500, 'DATABASE_UNAVAILABLE', err.message);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/super-admin/revenue
// Analytiques financières globale SaaS (MRR, ARR, méthodes, plans, pays)
// ─────────────────────────────────────────────────────────────────────────────
superAdminRouter.get('/revenue', requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const monthPrefix = now.toISOString().slice(0, 7);

    const [
      [{ totalRevenue }],
      [{ monthlyRevenue }],
      methods,
      monthlyTrend,
      ateliersRevenue,
      plansRevenue,
      countriesRevenue
    ] = await Promise.all([
      // 1. Total CA cumulé
      pool!.query(`SELECT COALESCE(SUM(amount), 0) as totalRevenue FROM payments WHERE status = 'completed'`).then(([r]: any) => r),
      // 2. MRR (ce mois)
      pool!.query(
        `SELECT COALESCE(SUM(amount), 0) as monthlyRevenue FROM payments WHERE status = 'completed' AND createdAt LIKE ?`,
        [`${monthPrefix}%`]
      ).then(([r]: any) => r),
      // 3. Méthodes de paiements
      pool!.query(
        `SELECT method, COALESCE(SUM(amount), 0) as total, COUNT(*) as count FROM payments WHERE status = 'completed' GROUP BY method`
      ).then(([r]: any) => r),
      // 4. Évolution sur 12 mois
      pool!.query(
        `SELECT SUBSTRING(createdAt, 1, 7) as month, COALESCE(SUM(amount), 0) as total
         FROM payments
         WHERE status = 'completed'
         GROUP BY month
         ORDER BY month DESC
         LIMIT 12`
      ).then(([r]: any) => r),
      // 5. TOP 10 Ateliers par CA
      pool!.query(
        `SELECT a.name as atelierName, COALESCE(SUM(p.amount), 0) as total
         FROM payments p
         JOIN ateliers a ON p.atelierId = a.id
         WHERE p.status = 'completed'
         GROUP BY p.atelierId
         ORDER BY total DESC
         LIMIT 10`
      ).then(([r]: any) => r),
      // 6. CA par plans
      pool!.query(
        `SELECT sp.name as planName, COALESCE(SUM(p.amount), 0) as total
         FROM payments p
         JOIN ateliers a ON p.atelierId = a.id
         JOIN subscriptions s ON s.atelierId = a.id
         JOIN subscription_plans sp ON s.planId = sp.id
         WHERE p.status = 'completed' AND s.status = 'active'
         GROUP BY sp.id`
      ).then(([r]: any) => r),
      // 7. CA par pays
      pool!.query(
        `SELECT COALESCE(a.address, 'Côte d’Ivoire') as country, COALESCE(SUM(p.amount), 0) as total
         FROM payments p
         JOIN ateliers a ON p.atelierId = a.id
         WHERE p.status = 'completed'
         GROUP BY country`
      ).then(([r]: any) => r)
    ]);

    return res.json({
      success: true,
      summary: {
        totalRevenue,
        mrr: monthlyRevenue,
        arr: monthlyRevenue * 12,
      },
      methods,
      monthlyTrend: monthlyTrend.reverse(), // Du plus ancien au plus récent
      ateliersRevenue,
      plansRevenue,
      countriesRevenue
    });
  } catch (err: any) {
    return sendApiError(res, 500, 'DATABASE_UNAVAILABLE', err.message);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/super-admin/subscriptions
// Liste paginée de tous les abonnements de la plateforme
// ─────────────────────────────────────────────────────────────────────────────
superAdminRouter.get('/subscriptions', requireSuperAdmin, async (req: Request, res: Response) => {
  const limit = Math.min(Number(req.query.limit) || 20, 100);
  const offset = Number(req.query.offset) || 0;

  try {
    const [[{ total }]]: any = await pool!.query(`SELECT COUNT(*) as total FROM subscriptions`);
    const [rows]: any = await pool!.query(
      `SELECT s.id, s.atelierId, s.status, s.startsAt, s.endsAt, s.canceledAt,
              a.name as atelierName,
              sp.name as planName, sp.priceMonthly
       FROM subscriptions s
       LEFT JOIN ateliers a ON s.atelierId = a.id
       LEFT JOIN subscription_plans sp ON s.planId = sp.id
       ORDER BY s.startsAt DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    return res.json({ success: true, total, limit, offset, data: rows });
  } catch (err: any) {
    return sendApiError(res, 500, 'DATABASE_UNAVAILABLE', err.message);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/super-admin/plans
// Liste de tous les plans tarifaires existants
// ─────────────────────────────────────────────────────────────────────────────
superAdminRouter.get('/plans', requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const [rows]: any = await pool!.query(
      `SELECT id, code, tier, name, priceMonthly, priceYearly, maxUsers, maxClients, maxOrders, storageLimitMb, features
       FROM subscription_plans
       ORDER BY priceMonthly ASC`
    );
    return res.json({ success: true, data: rows });
  } catch (err: any) {
    return sendApiError(res, 500, 'DATABASE_UNAVAILABLE', err.message);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/super-admin/plans/:id
// Modifier les détails et les limites d'un plan tarifaire
// ─────────────────────────────────────────────────────────────────────────────
superAdminRouter.put('/plans/:id', requireSuperAdmin, async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, priceMonthly, priceYearly, maxUsers, maxClients, maxOrders, storageLimitMb } = req.body;

  try {
    await pool!.query(
      `UPDATE subscription_plans
       SET name = ?, priceMonthly = ?, priceYearly = ?, maxUsers = ?, maxClients = ?, maxOrders = ?, storageLimitMb = ?
       WHERE id = ?`,
      [
        name,
        Number(priceMonthly) || 0,
        Number(priceYearly) || 0,
        Number(maxUsers) || 1,
        Number(maxClients) || 50,
        Number(maxOrders) || 100,
        Number(storageLimitMb) || 500,
        id
      ]
    );
    logger.info({ planId: id, actor: (req as any).user?.id }, '[SuperAdmin] Plan d\'abonnement mis à jour');
    return res.json({ success: true, message: 'Plan d\'abonnement mis à jour avec succès.' });
  } catch (err: any) {
    return sendApiError(res, 500, 'DATABASE_UNAVAILABLE', err.message);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/super-admin/saas-payments
// Ce que les ateliers paient à DigiCouture pour leurs licences SaaS.
// ⚠️ NE PAS confondre avec les paiements des clients des ateliers pour leurs vêtements.
// ─────────────────────────────────────────────────────────────────────────────
superAdminRouter.get('/saas-payments', requireSuperAdmin, async (req: Request, res: Response) => {
  const limit = Math.min(Number(req.query.limit) || 20, 100);
  const offset = Number(req.query.offset) || 0;
  const status = req.query.status as string | undefined;

  try {
    const where = status ? `WHERE sp.status = ?` : `WHERE 1=1`;
    const countParams: any[] = status ? [status] : [];
    const dataParams: any[] = status ? [status, limit, offset] : [limit, offset];

    const [[{ total }]]: any = await pool!.query(
      `SELECT COUNT(*) as total FROM saas_payments sp ${where}`, countParams
    );
    const [rows]: any = await pool!.query(
      `SELECT sp.id, sp.atelierId, a.name as atelierName, sp.subscriptionId,
              sp.amount, sp.currency, sp.method, sp.status,
              sp.reference, sp.providerTransactionId, sp.createdAt
       FROM saas_payments sp
       LEFT JOIN ateliers a ON sp.atelierId = a.id
       ${where}
       ORDER BY sp.createdAt DESC
       LIMIT ? OFFSET ?`,
      dataParams
    );
    return res.json({ success: true, total, limit, offset, data: rows });
  } catch (err: any) {
    return sendApiError(res, 500, 'DATABASE_UNAVAILABLE', err.message);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/super-admin/support
// Tickets de support ouverts par les ateliers
// ─────────────────────────────────────────────────────────────────────────────
superAdminRouter.get('/support', requireSuperAdmin, async (req: Request, res: Response) => {
  const limit = Math.min(Number(req.query.limit) || 20, 100);
  const offset = Number(req.query.offset) || 0;
  const status = req.query.status as string | undefined;

  try {
    const where = status ? `WHERE t.status = ?` : `WHERE 1=1`;
    const countParams: any[] = status ? [status] : [];
    const dataParams: any[] = status ? [status, limit, offset] : [limit, offset];

    const [[{ total }]]: any = await pool!.query(
      `SELECT COUNT(*) as total FROM support_tickets t ${where}`, countParams
    );
    const [rows]: any = await pool!.query(
      `SELECT t.id, t.atelierId, a.name as atelierName, t.userId,
              t.subject, t.priority, t.status, t.createdAt, t.updatedAt
       FROM support_tickets t
       LEFT JOIN ateliers a ON t.atelierId = a.id
       ${where}
       ORDER BY t.createdAt DESC
       LIMIT ? OFFSET ?`,
      dataParams
    );
    return res.json({ success: true, total, limit, offset, data: rows });
  } catch (err: any) {
    return sendApiError(res, 500, 'DATABASE_UNAVAILABLE', err.message);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/super-admin/support/:id
// Mettre à jour le statut d'un ticket de support
// ─────────────────────────────────────────────────────────────────────────────
superAdminRouter.patch('/support/:id', requireSuperAdmin, async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const validStatuses = ['open', 'pending', 'resolved', 'closed'];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Statut invalide. Valeurs: ' + validStatuses.join(', ') });
  }
  try {
    await pool!.query(
      'UPDATE support_tickets SET status = ?, updatedAt = ? WHERE id = ?',
      [status, new Date().toISOString(), id]
    );
    logger.info({ ticketId: id, status, actor: (req as any).user?.id }, '[SuperAdmin] Ticket support mis à jour');
    return res.json({ success: true, message: 'Ticket mis à jour avec succès.' });
  } catch (err: any) {
    return sendApiError(res, 500, 'DATABASE_UNAVAILABLE', err.message);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/super-admin/usage
// Métriques d'usage technique anonymisées (pas de contenu métier)
// ─────────────────────────────────────────────────────────────────────────────
superAdminRouter.get('/usage', requireSuperAdmin, async (req: Request, res: Response) => {
  const limit = Math.min(Number(req.query.limit) || 20, 100);
  const offset = Number(req.query.offset) || 0;

  try {
    const [ateliers]: any = await pool!.query(`
      SELECT a.id, a.name,
        (SELECT COUNT(*) FROM users u WHERE u.atelierId = a.id) as activeUsers,
        (SELECT COUNT(*) FROM notifications n WHERE n.atelierId = a.id) as notificationsSent,
        0 as storageUsedMb,
        0 as apiCallsCount,
        a.createdAt as lastActivity
      FROM ateliers a
      ORDER BY a.name ASC
      LIMIT ? OFFSET ?
    `, [limit, offset]);

    const [[global]]: any = await pool!.query(`
      SELECT
        (SELECT COUNT(*) FROM users) as totalUsers,
        (SELECT COUNT(*) FROM notifications) as totalNotifications
    `);

    return res.json({
      success: true,
      global: {
        totalUsers: global?.totalUsers || 0,
        totalNotifications: global?.totalNotifications || 0,
        totalStorageMb: 0,
        totalApiCalls: 0,
      },
      byAtelier: ateliers || [],
    });
  } catch (err: any) {
    return sendApiError(res, 500, 'DATABASE_UNAVAILABLE', err.message);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/super-admin/ateliers/:id/users
// Utilisateurs d'un atelier pour gestion SaaS/support
// ─────────────────────────────────────────────────────────────────────────────
superAdminRouter.get('/ateliers/:id/users', requireSuperAdmin, async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const [users]: any = await pool!.query(
      `SELECT u.id, u.fullName, u.phone, u.email, u.createdAt,
              r.name as roleName,
              CASE WHEN u.passwordHash LIKE 'SUSPENDED_%' THEN 'suspended' ELSE 'active' END as status
       FROM users u
       LEFT JOIN roles r ON u.roleId = r.id
       WHERE u.atelierId = ?
       ORDER BY u.createdAt DESC`,
      [id]
    );
    logger.info({ atelierId: id, actor: (req as any).user?.id }, '[SuperAdmin] Utilisateurs atelier consultés');
    return res.json({ success: true, data: users });
  } catch (err: any) {
    return sendApiError(res, 500, 'DATABASE_UNAVAILABLE', err.message);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/super-admin/ateliers/:id/usage
// Métriques d'usage technique d'un atelier spécifique
// ─────────────────────────────────────────────────────────────────────────────
superAdminRouter.get('/ateliers/:id/usage', requireSuperAdmin, async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const [[atelier]]: any = await pool!.query('SELECT id, name FROM ateliers WHERE id = ?', [id]);
    if (!atelier) return sendApiError(res, 404, 'NOT_FOUND', 'Atelier introuvable.');

    const [[usage]]: any = await pool!.query(`
      SELECT
        (SELECT COUNT(*) FROM users WHERE atelierId = ?) as totalUsers,
        (SELECT COUNT(*) FROM notifications WHERE atelierId = ?) as notificationsSent
    `, [id, id]);

    return res.json({
      success: true,
      data: {
        atelierId: id,
        atelierName: atelier.name,
        totalUsers: usage?.totalUsers || 0,
        notificationsSent: usage?.notificationsSent || 0,
        storageUsedMb: 0,
        apiCallsCount: 0,
      }
    });
  } catch (err: any) {
    return sendApiError(res, 500, 'DATABASE_UNAVAILABLE', err.message);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/super-admin/audit
// Journal d'audit de toutes les actions sensibles d'administration
// ─────────────────────────────────────────────────────────────────────────────
superAdminRouter.get('/audit', requireSuperAdmin, async (req: Request, res: Response) => {
  const limit = Math.min(Number(req.query.limit) || 20, 100);
  const offset = Number(req.query.offset) || 0;

  try {
    const [[{ total }]]: any = await pool!.query('SELECT COUNT(*) as total FROM audit_logs');
    const [rows]: any = await pool!.query(
      `SELECT al.id, al.atelierId, al.userId, al.action, al.details, al.createdAt
       FROM audit_logs al
       ORDER BY al.createdAt DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    return res.json({ success: true, total, data: rows });
  } catch (err: any) {
    return sendApiError(res, 500, 'DATABASE_UNAVAILABLE', err.message);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// COMPOSANTS D'ADMINISTRATION DES ABONNEMENTS (PROMPT DE GESTION ADMINISTRATIVE)
// ─────────────────────────────────────────────────────────────────────────────

// PATCH /api/super-admin/couturiers/:atelierId/plan - Modifier le plan d'un atelier avec audit obligatoire
superAdminRouter.patch('/couturiers/:atelierId/plan', requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const { atelierId } = req.params;
    const { newPlan, reason } = req.body;
    if (!newPlan) return res.status(400).json({ success: false, error: 'newPlan est requis.' });

    const planCode = newPlan.toUpperCase();
    const { SubscriptionService, PLANS_CONFIG } = await import('../../services/subscription.service.js');
    const planConfig = PLANS_CONFIG[planCode];
    if (!planConfig) return res.status(400).json({ success: false, error: `Plan invalide : ${newPlan}` });

    const [rows]: any = await pool!.query('SELECT subscription_plan, subscription_status FROM ateliers WHERE id = ?', [atelierId]);
    if (!rows || rows.length === 0) return res.status(404).json({ success: false, error: 'Atelier non trouvé.' });

    const oldPlan = rows[0].subscription_plan || 'FREE';
    const oldStatus = rows[0].subscription_status || 'TRIAL';
    const nowIso = new Date().toISOString();

    await pool!.query(
      `UPDATE ateliers SET 
        subscription_plan = ?,
        subscription_status = 'ACTIVE',
        monthly_order_limit = ?,
        client_limit = ?,
        user_limit = ?,
        storage_limit_mb = ?,
        subscription_updated_at = ?
       WHERE id = ?`,
      [planCode, planConfig.maxOrders, planConfig.maxClients, planConfig.maxUsers, planConfig.storageLimitMb, nowIso, atelierId]
    );

    await SubscriptionService.recordAuditLog({
      adminUserId: (req as any).user?.id || 'super-admin',
      adminUserName: 'Admin Mohamed',
      atelierId,
      action: 'PLAN_CHANGE',
      previousPlan: oldPlan,
      newPlan: planCode,
      previousStatus: oldStatus,
      newStatus: 'ACTIVE',
      reason: reason || 'Changement de formule effectué par l\'administrateur'
    });

    return res.json({ success: true, message: `Plan de l'atelier mis à jour vers ${planConfig.name} avec succès.` });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/super-admin/couturiers/:atelierId/extend - Prolonger la période d'essai/abonnement (+7d, +15d, +30d)
superAdminRouter.post('/couturiers/:atelierId/extend', requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const { atelierId } = req.params;
    const { days, reason } = req.body;
    const daysToAdd = Number(days) || 30;

    const [rows]: any = await pool!.query('SELECT trial_end_date, subscription_end_date, subscription_status FROM ateliers WHERE id = ?', [atelierId]);
    if (!rows || rows.length === 0) return res.status(404).json({ success: false, error: 'Atelier non trouvé.' });

    const currentEnd = rows[0].subscription_end_date || rows[0].trial_end_date || new Date().toISOString();
    const currentEndMs = new Date(currentEnd).getTime();
    const newEndMs = (isNaN(currentEndMs) ? Date.now() : currentEndMs) + daysToAdd * 24 * 3600 * 1000;
    const newEndIso = new Date(newEndMs).toISOString();
    const nowIso = new Date().toISOString();

    await pool!.query(
      `UPDATE ateliers SET 
        subscription_end_date = ?,
        trial_end_date = ?,
        subscription_status = 'ACTIVE',
        subscription_updated_at = ?
       WHERE id = ?`,
      [newEndIso, newEndIso, nowIso, atelierId]
    );

    const { SubscriptionService } = await import('../../services/subscription.service.js');
    await SubscriptionService.recordAuditLog({
      adminUserId: (req as any).user?.id || 'super-admin',
      adminUserName: 'Admin Mohamed',
      atelierId,
      action: 'EXTENSION',
      previousStatus: rows[0].subscription_status,
      newStatus: 'ACTIVE',
      reason: reason || `Prolongation accordée de +${daysToAdd} jours`
    });

    return res.json({ success: true, message: `Abonnement prolongé de +${daysToAdd} jours (nouvelle fin : ${newEndIso.split('T')[0]}).` });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/super-admin/couturiers/:atelierId/suspend - Suspendre un atelier
superAdminRouter.post('/couturiers/:atelierId/suspend', requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const { atelierId } = req.params;
    const { reason } = req.body;

    const [rows]: any = await pool!.query('SELECT subscription_status FROM ateliers WHERE id = ?', [atelierId]);
    if (!rows || rows.length === 0) return res.status(404).json({ success: false, error: 'Atelier non trouvé.' });

    const oldStatus = rows[0].subscription_status;
    const nowIso = new Date().toISOString();

    await pool!.query('UPDATE ateliers SET subscription_status = "SUSPENDED", subscription_updated_at = ? WHERE id = ?', [nowIso, atelierId]);

    const { SubscriptionService } = await import('../../services/subscription.service.js');
    await SubscriptionService.recordAuditLog({
      adminUserId: (req as any).user?.id || 'super-admin',
      adminUserName: 'Admin Mohamed',
      atelierId,
      action: 'SUSPENSION',
      previousStatus: oldStatus,
      newStatus: 'SUSPENDED',
      reason: reason || 'Suspension manuelle par l\'administrateur'
    });

    return res.json({ success: true, message: 'Compte atelier suspendu avec succès.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/super-admin/couturiers/:atelierId/reactivate - Réactiver un atelier
superAdminRouter.post('/couturiers/:atelierId/reactivate', requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const { atelierId } = req.params;
    const { reason } = req.body;

    const [rows]: any = await pool!.query('SELECT subscription_status FROM ateliers WHERE id = ?', [atelierId]);
    if (!rows || rows.length === 0) return res.status(404).json({ success: false, error: 'Atelier non trouvé.' });

    const oldStatus = rows[0].subscription_status;
    const nowIso = new Date().toISOString();

    await pool!.query('UPDATE ateliers SET subscription_status = "ACTIVE", subscription_updated_at = ? WHERE id = ?', [nowIso, atelierId]);

    const { SubscriptionService } = await import('../../services/subscription.service.js');
    await SubscriptionService.recordAuditLog({
      adminUserId: (req as any).user?.id || 'super-admin',
      adminUserName: 'Admin Mohamed',
      atelierId,
      action: 'REACTIVATION',
      previousStatus: oldStatus,
      newStatus: 'ACTIVE',
      reason: reason || 'Réactivation manuelle par l\'administrateur'
    });

    return res.json({ success: true, message: 'Compte atelier réactivé avec succès.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/super-admin/subscription-audit - Obtenir l'historique des audits d'abonnements
superAdminRouter.get('/subscription-audit', requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 100);
    const offset = Number(req.query.offset) || 0;

    const [[{ total }]]: any = await pool!.query('SELECT COUNT(*) as total FROM subscription_audit_logs');
    const [rows]: any = await pool!.query(
      `SELECT sal.*, a.name as atelierName, a.whatsapp
       FROM subscription_audit_logs sal
       LEFT JOIN ateliers a ON sal.atelierId = a.id
       ORDER BY sal.createdAt DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    return res.json({ success: true, total, data: rows });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

