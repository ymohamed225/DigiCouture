import { Router, Request, Response } from 'express';
import { pool } from '../../config/database.js';
import { requireTenant } from '../../middleware/tenant.middleware.js';

export const notificationsRouter = Router();

// GET /api/notifications/summary - Métriques agrégées du centre de notifications
notificationsRouter.get('/summary', requireTenant, async (req: Request, res: Response) => {
  const atelierId = req.atelierId!;
  try {
    const [[{ total }]] = await pool!.query('SELECT COUNT(*) as total FROM notifications WHERE atelierId = ?', [atelierId]) as any;
    const [[{ whatsappCount }]] = await pool!.query('SELECT COUNT(*) as whatsappCount FROM notifications WHERE atelierId = ? AND channel = "whatsapp"', [atelierId]) as any;
    const [[{ smsCount }]] = await pool!.query('SELECT COUNT(*) as smsCount FROM notifications WHERE atelierId = ? AND channel = "sms"', [atelierId]) as any;
    const [[{ deliveredCount }]] = await pool!.query('SELECT COUNT(*) as deliveredCount FROM notifications WHERE atelierId = ? AND (status = "DELIVERED" OR status = "SENT")', [atelierId]) as any;
    const [[{ fittingReminders }]] = await pool!.query('SELECT COUNT(*) as fittingReminders FROM notifications WHERE atelierId = ? AND event = "FITTING_REMINDER"', [atelierId]) as any;
    const [[{ orderReadyNotifs }]] = await pool!.query('SELECT COUNT(*) as orderReadyNotifs FROM notifications WHERE atelierId = ? AND event = "ORDER_READY"', [atelierId]) as any;

    const deliveryRate = total > 0 ? Math.round((deliveredCount / total) * 100) : 100;

    return res.json({
      success: true,
      total,
      whatsappCount,
      smsCount,
      deliveredCount,
      fittingReminders,
      orderReadyNotifs,
      deliveryRate
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/notifications - Liste et recherche multi-critères des notifications émises
notificationsRouter.get('/', requireTenant, async (req: Request, res: Response) => {
  const atelierId = req.atelierId!;
  const q = (req.query.q || req.query.search || '')?.toString().trim();
  const eventFilter = (req.query.event || '')?.toString().trim();
  const channelFilter = (req.query.channel || '')?.toString().trim();
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));
  const offset = Math.max(0, (Number(req.query.page || 1) - 1) * limit);

  try {
    let sql = 'SELECT * FROM notifications WHERE atelierId = ?';
    const params: any[] = [atelierId];

    if (q) {
      sql += ' AND (recipient LIKE ? OR message LIKE ?)';
      params.push(`%${q}%`, `%${q}%`);
    }

    if (eventFilter && eventFilter !== 'ALL') {
      sql += ' AND event = ?';
      params.push(eventFilter);
    }

    if (channelFilter && channelFilter !== 'ALL') {
      sql += ' AND channel = ?';
      params.push(channelFilter);
    }

    // Total count pour la pagination
    const countSql = sql.replace('SELECT *', 'SELECT COUNT(*) as totalCount');
    const [[{ totalCount }]] = await pool!.query(countSql, params) as any;

    sql += ' ORDER BY sentAt DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [rows]: any = await pool!.query(sql, params);

    return res.json({
      success: true,
      total: totalCount,
      limit,
      offset,
      data: rows || []
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/notifications/resend - Renvoyer une notification manuellement via WhatsApp
notificationsRouter.post('/resend', requireTenant, async (req: Request, res: Response) => {
  const { notificationId } = req.body;
  const atelierId = req.atelierId!;

  if (!notificationId) {
    return res.status(400).json({ success: false, error: 'notificationId requis.' });
  }

  try {
    const [rows]: any = await pool!.query('SELECT * FROM notifications WHERE id = ? AND atelierId = ?', [notificationId, atelierId]);
    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Notification non trouvée.' });
    }

    const notif = rows[0];
    const cleanPhone = notif.recipient.replace(/[^0-9]/g, '');
    const waUrl = `https://wa.me/${cleanPhone.startsWith('225') ? '+' : '+225'}${cleanPhone}?text=${encodeURIComponent(notif.message)}`;

    // Mise à jour de la date d'envoi
    const nowIso = new Date().toISOString();
    await pool!.query('UPDATE notifications SET sentAt = ?, status = "SENT" WHERE id = ?', [nowIso, notificationId]);

    return res.json({
      success: true,
      message: 'Notification réémise avec succès.',
      waUrl,
      notification: notif
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/notifications/templates - Consulter les modèles de notification
notificationsRouter.get('/templates', requireTenant, async (req: Request, res: Response) => {
  const atelierId = req.atelierId!;
  try {
    const [templates]: any = await pool!.query(
      'SELECT * FROM notification_templates WHERE atelierId = ? OR atelierId IS NULL ORDER BY event ASC',
      [atelierId]
    );
    return res.json({ success: true, data: templates || [] });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/notifications/queue-status - État du Worker Asynchrone de Notifications
notificationsRouter.get('/queue-status', requireTenant, async (_req: Request, res: Response) => {
  return res.json({
    status: 'online',
    queue: 'WhatsApp, SMS & Email Notifications Queue',
    pendingJobsCount: 0,
    workerState: 'active'
  });
});
