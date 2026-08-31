import { Router, Request, Response } from 'express';
import { pool, withTransaction } from '../../config/database.js';
import { requireTenant } from '../../middleware/tenant.middleware.js';
import { requirePermission } from '../../middleware/permission.middleware.js';
import { NotificationService } from '../../services/notification.service.js';
import { TrackingService } from '../../services/tracking.service.js';
import { validate } from '../../validation/validate.middleware.js';
import { CreateOrderSchema, OrderStatusSchema } from '../../validation/schemas.js';

export const ordersRouter = Router();

// Helper de génération automatique du Numéro de Commande unique par atelier (ex: CMD-2026-000001)
async function generateOrderNumber(atelierId: string): Promise<string> {
  const currentYear = new Date().getFullYear();
  const [rows]: any = await pool!.query('SELECT COUNT(*) as total FROM orders WHERE atelierId = ?', [atelierId]);
  const count = (rows[0]?.total || 0) + 1;
  return `CMD-${currentYear}-${String(count).padStart(6, '0')}`;
}

// GET /api/orders - Liste des commandes d'un atelier
ordersRouter.get('/', requireTenant, requirePermission('orders.read'), async (req: Request, res: Response) => {
  const atelierId = req.atelierId!;
  try {
    const [rows]: any = await pool!.query('SELECT * FROM orders WHERE atelierId = ? ORDER BY createdAt DESC', [atelierId]);
    return res.json(rows);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/orders/:id/timeline - Timeline chronologique 8 étapes de la commande (Date, Heure, Utilisateur, Commentaire)
ordersRouter.get('/:id/timeline', requirePermission('orders.read'), async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const [history]: any = await pool!.query(
      `SELECT * FROM order_status_history WHERE orderId = ? OR orderId IN (SELECT id FROM orders WHERE orderNumber = ? OR code = ?) ORDER BY changedAt ASC, time ASC`,
      [id, id, id]
    );
    return res.json(history);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/orders - Enregistrement d'une nouvelle commande sur-mesure
ordersRouter.post('/', requireTenant, requirePermission('orders.create'), validate(CreateOrderSchema), async (req: Request, res: Response) => {
  const order = req.body;
  const atelierId = req.atelierId!;

  try {
    const orderNumber = order.orderNumber || order.code || await generateOrderNumber(atelierId);
    const orderId = order.id || `ord-${Date.now()}`;
    const totalAmount = Number(order.totalAmount) || 0;
    const depositAmount = Number(order.depositAmount) || 0;
    const paidAmount = Number(order.paidAmount) || depositAmount;
    
    // CALCUL DU RESTE À PAYER CÔTE BACKEND (SOURCE UNIQUE DE VÉRITÉ)
    const remainingAmount = Math.max(0, totalAmount - paidAmount);
    
    const now = new Date();
    const createdAt = order.createdAt || now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().split(' ')[0].substring(0, 5); // ex: 14:30
    const updatedAt = createdAt;

    return await withTransaction(async (conn) => {
      await conn.query(
        `INSERT INTO orders (id, atelierId, clientId, orderNumber, code, clientName, clientWhatsapp, modelName, modelCategory, garmentType, fabricName, fabricColor, description, specialInstructions, dueDate, deliveryDate, urgency, totalAmount, depositAmount, paidAmount, remainingAmount, currency, status, modelImageUrl, notes, createdBy, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE status=VALUES(status), paidAmount=VALUES(paidAmount), remainingAmount=VALUES(remainingAmount), updatedAt=VALUES(updatedAt)`,
        [
          orderId,
          atelierId,
          order.clientId,
          orderNumber,
          orderNumber,
          order.clientName || 'Client VIP',
          order.clientWhatsapp || '',
          order.modelName || 'Modèle sur mesure',
          order.modelCategory || 'Création',
          order.garmentType || 'Sur-mesure',
          order.fabricName || 'Bazin Riche Luxe',
          order.fabricColor || '',
          order.description || '',
          order.specialInstructions || '',
          order.dueDate || order.deliveryDate || createdAt,
          order.deliveryDate || createdAt,
          order.urgency || 'normale',
          totalAmount,
          depositAmount,
          paidAmount,
          remainingAmount,
          order.currency || 'FCFA',
          order.status || 'commande_recue',
          order.modelImageUrl || '',
          order.notes || '',
          order.createdBy || 'Réceptionniste VIP',
          createdAt,
          updatedAt
        ]
      );

      // Capturer et figer le Snapshot Inaltérable des Mensurations de la commande (OrderMeasurementSnapshot)
      const [measRows]: any = await conn.query('SELECT * FROM measurements WHERE clientId = ? AND atelierId = ? LIMIT 1', [order.clientId, atelierId]);
      if (measRows.length > 0) {
        const m = measRows[0];
        const snapshotId = `oms-${Date.now()}`;
        await conn.query(
          `INSERT INTO order_measurement_snapshots 
           (id, orderId, atelierId, clientId, epaules, poitrine, sousPoitrine, hauteurPoitrine, carrureDevant, carrureDos, tourCou, tourBras, tourPoignet, longueurManche, longueurTailleDevant, longueurTailleDos, tourTaille, tourHanche, hauteurHanches, longueurBas, longueurJupe, longueurPantalon, entrejambe, cuisse, tourGenou, tourCheville, longueurGrandBoubou, largeurEnvergureBoubou, customFields, capturedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE capturedAt=VALUES(capturedAt)`,
          [
            snapshotId, orderId, atelierId, order.clientId,
            m.epaules || 0, m.poitrine || m.tourPoitrine || 0, m.sousPoitrine || 0, m.hauteurPoitrine || 0,
            m.carrureDevant || 0, m.carrureDos || 0, m.tourCou || 0, m.tourBras || 0, m.tourPoignet || 0,
            m.longueurManche || 0, m.longueurTailleDevant || 0, m.longueurTailleDos || 0, m.tourTaille || 0,
            m.tourHanche || 0, m.hauteurHanches || 0, m.longueurBas || 0, m.longueurJupe || 0,
            m.longueurPantalon || 0, m.entrejambe || 0, m.cuisse || 0, m.tourGenou || 0, m.tourCheville || 0,
            m.longueurGrandBoubou || 0, m.largeurEnvergureBoubou || 0, JSON.stringify(m.customFields || {}), createdAt
          ]
        );
      }

      // Enregistrement de l'étape initiale dans la Timeline
      const historyId = `hist-${Date.now()}`;
      await conn.query(
        `INSERT INTO order_status_history (id, orderId, fromStatus, toStatus, changedAt, time, changedBy, comment)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          historyId,
          orderId,
          null,
          order.status || 'commande_recue',
          createdAt,
          currentTime,
          order.createdBy || 'Réceptionniste VIP',
          'Commande enregistrée à l\'atelier.'
        ]
      );

      // Inscription de l'Audit Log dans la transaction
      const auditId = `aud-${Date.now()}`;
      await conn.query(
        `INSERT INTO audit_logs (id, atelierId, action, entityType, entityId, performedBy, details, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [auditId, atelierId, 'ORDER_CREATED', 'order', orderId, order.createdBy || 'Réceptionniste VIP', JSON.stringify({ orderNumber, totalAmount, remainingAmount }), createdAt]
      );

      // Génération et figeage du Token + QR Code de suivi permanent pour le ticket
      const trackingInfo = await TrackingService.getOrCreateTrackingInfo(orderId);

      // Déclenchement automatique de la notification WhatsApp (Événement 1: Commande créée) avec Anti-doublons
      TrackingService.dispatchStatusNotification(orderId, order.status || 'commande_recue', order.createdBy || 'Réceptionniste VIP');

      const savedOrder = {
        ...order,
        id: orderId,
        atelierId,
        clientId: order.clientId,
        orderNumber,
        code: orderNumber,
        tracking_token: trackingInfo.trackingToken,
        tracking_url: trackingInfo.trackingUrl,
        qr_code: trackingInfo.qrCodeUrl,
        totalAmount,
        depositAmount,
        paidAmount,
        remainingAmount,
        currency: order.currency || 'FCFA',
        createdAt,
        updatedAt
      };

      return res.json({ success: true, order: savedOrder });
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// PUT /api/orders/:id/status - Mise à jour de l'étape du workflow avec traçabilité dans la Timeline et notification WhatsApp
ordersRouter.put('/:id/status', requirePermission('orders.update'), async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, atelierId, changedBy, comment } = req.body;

  if (!status) return res.status(400).json({ error: 'Statut obligatoire' });

  try {
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().split(' ')[0].substring(0, 5);

    // 1. Récupération du statut précédent pour la timeline
    const [existing]: any = await pool!.query('SELECT id, status FROM orders WHERE id = ? OR orderNumber = ? OR code = ?', [id, id, id]);
    const previousStatus = existing[0]?.status || null;
    const realOrderId = existing[0]?.id || id;

    // 2. Mise à jour de la commande
    if (atelierId) {
      if (status === 'livree') {
        await pool!.query('UPDATE orders SET status = ?, remainingAmount = 0, updatedAt = ? WHERE (id = ? OR orderNumber = ? OR code = ?) AND atelierId = ?', [status, currentDate, id, id, id, atelierId]);
      } else {
        await pool!.query('UPDATE orders SET status = ?, updatedAt = ? WHERE (id = ? OR orderNumber = ? OR code = ?) AND atelierId = ?', [status, currentDate, id, id, id, atelierId]);
      }
    } else {
      if (status === 'livree') {
        await pool!.query('UPDATE orders SET status = ?, remainingAmount = 0, updatedAt = ? WHERE id = ? OR orderNumber = ? OR code = ?', [status, currentDate, id, id, id]);
      } else {
        await pool!.query('UPDATE orders SET status = ?, updatedAt = ? WHERE id = ? OR orderNumber = ? OR code = ?', [status, currentDate, id, id, id]);
      }
    }

    // 3. Insertion de la nouvelle étape dans la Timeline
    const historyId = `hist-${Date.now()}`;
    await pool!.query(
      `INSERT INTO order_status_history (id, orderId, fromStatus, toStatus, changedAt, time, changedBy, comment)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        historyId,
        realOrderId,
        previousStatus,
        status,
        currentDate,
        currentTime,
        changedBy || 'Artisan Couturier',
        comment || `Transition du statut vers ${status}`
      ]
    );

    // 4. Moteur d'envoi automatique de notification WhatsApp (Garantie Anti-doublons & Moteur unique)
    const notifResult = await TrackingService.dispatchStatusNotification(realOrderId, status, changedBy || 'Artisan Couturier');

    return res.json({ success: true, id: realOrderId, status, date: currentDate, time: currentTime, changedBy: changedBy || 'Artisan Couturier', comment, notif: notifResult });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/orders/:id/status - Alias REST de mise à jour du statut avec Verrouillage Optimiste (Optimistic Locking)
ordersRouter.post('/:id/status', requirePermission('orders.update'), validate(OrderStatusSchema), async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, changedBy, comment, expectedVersion } = req.body;
  const now = new Date();
  const currentDate = now.toISOString().split('T')[0];
  const currentTime = now.toTimeString().split(' ')[0].substring(0, 5);

  try {
    const [existing]: any = await pool!.query('SELECT id, status, version FROM orders WHERE id = ? OR orderNumber = ? OR code = ?', [id, id, id]);
    if (existing.length === 0) return res.status(404).json({ error: 'Commande non trouvée' });
    const realOrderId = existing[0].id;
    const previousStatus = existing[0].status;
    const currentVersion = Number(existing[0].version || 1);

    // DÉTECTION CONCURRENCE (OPTIMISTIC LOCKING)
    if (expectedVersion !== undefined && Number(expectedVersion) !== currentVersion) {
      console.warn(`🛑 [Concurrency Conflict] Utilisateur tente de passer la commande ${realOrderId} de ${previousStatus} à ${status} avec v${expectedVersion}, mais la version BDD est v${currentVersion}`);
      return res.status(409).json({
        error: 'CONCURRENCY_CONFLICT',
        message: `La commande a été modifiée simultanément par un autre utilisateur (Statut actuel: ${previousStatus}). Veuillez rafraîchir la fiche commande avant de valider votre modification.`,
        currentVersion,
        providedVersion: expectedVersion,
        currentStatus: previousStatus
      });
    }

    const nextVersion = currentVersion + 1;
    await pool!.query('UPDATE orders SET status = ?, version = ?, updatedAt = ? WHERE id = ?', [status, nextVersion, currentDate, realOrderId]);

    const historyId = `hist-${Date.now()}`;
    await pool!.query(
      `INSERT INTO order_status_history (id, orderId, fromStatus, toStatus, changedAt, time, changedBy, comment)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [historyId, realOrderId, previousStatus, status, currentDate, currentTime, changedBy || 'Artisan', comment || `Changement de statut vers ${status}`]
    );

    return res.json({ success: true, id: realOrderId, status, version: nextVersion, date: currentDate, time: currentTime });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/orders/:id - Consultation détaillée d'une commande par son ID ou orderNumber
ordersRouter.get('/:id', requireTenant, requirePermission('orders.read'), async (req: Request, res: Response) => {
  const { id } = req.params;
  const atelierId = req.atelierId!;
  try {
    const [rows]: any = await pool!.query('SELECT * FROM orders WHERE (id = ? OR orderNumber = ? OR code = ?) AND atelierId = ?', [id, id, id, atelierId]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Commande non trouvée' });
    }
    return res.json(rows[0]);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// PATCH /api/orders/:id - Mise à jour partielle d'une commande
ordersRouter.patch('/:id', requireTenant, requirePermission('orders.update'), async (req: Request, res: Response) => {
  const { id } = req.params;
  const atelierId = req.atelierId!;
  const updateData = req.body;
  const updatedAt = new Date().toISOString().split('T')[0];

  try {
    const fields: string[] = [];
    const params: any[] = [];

    if (updateData.deliveryDate) { fields.push('deliveryDate = ?'); params.push(updateData.deliveryDate); }
    if (updateData.dueDate) { fields.push('dueDate = ?'); params.push(updateData.dueDate); }
    if (updateData.urgency) { fields.push('urgency = ?'); params.push(updateData.urgency); }
    if (updateData.totalAmount !== undefined) { fields.push('totalAmount = ?'); params.push(Number(updateData.totalAmount)); }
    if (updateData.notes !== undefined) { fields.push('notes = ?'); params.push(updateData.notes); }
    if (updateData.specialInstructions !== undefined) { fields.push('specialInstructions = ?'); params.push(updateData.specialInstructions); }

    fields.push('updatedAt = ?');
    params.push(updatedAt);

    params.push(id, atelierId);

    await pool!.query(`UPDATE orders SET ${fields.join(', ')} WHERE (id = ? OR orderNumber = ?) AND atelierId = ?`, params);
    
    const [updatedRows]: any = await pool!.query('SELECT * FROM orders WHERE (id = ? OR orderNumber = ?) AND atelierId = ?', [id, id, atelierId]);
    return res.json({ success: true, order: updatedRows[0] });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/orders/:id/production - Tâches de production d'une commande
ordersRouter.get('/:id/production', requireTenant, requirePermission('production.read'), async (req: Request, res: Response) => {
  const { id } = req.params;
  const atelierId = req.atelierId!;
  try {
    const [tasks]: any = await pool!.query(
      `SELECT pt.*, u.name as artisanName 
       FROM production_tasks pt
       LEFT JOIN users u ON pt.assignedTo = u.id
       WHERE (pt.orderId = ? OR pt.orderId IN (SELECT id FROM orders WHERE orderNumber = ?)) AND pt.atelierId = ?
       ORDER BY pt.createdAt ASC`,
      [id, id, atelierId]
    );
    return res.json(tasks);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/orders/:id/production - Affecter une tâche d'artisan sur la commande
ordersRouter.post('/:id/production', requireTenant, requirePermission('production.update'), async (req: Request, res: Response) => {
  const { id } = req.params;
  const atelierId = req.atelierId!;
  const { type, assignedTo, notes } = req.body;

  if (!type) return res.status(400).json({ error: 'Type de tâche de production obligatoire (CUTTING, SEWING, etc.)' });

  try {
    const [ordRows]: any = await pool!.query('SELECT id FROM orders WHERE (id = ? OR orderNumber = ?) AND atelierId = ?', [id, id, atelierId]);
    if (ordRows.length === 0) return res.status(404).json({ error: 'Commande non trouvée' });
    const realOrderId = ordRows[0].id;

    const taskId = `ptask-${Date.now()}`;
    const createdAt = new Date().toISOString().split('T')[0];

    await pool!.query(
      `INSERT INTO production_tasks (id, atelierId, orderId, type, assignedTo, status, notes, startedAt, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [taskId, atelierId, realOrderId, type, assignedTo || null, 'in_progress', notes || '', createdAt, createdAt]
    );

    return res.json({ success: true, taskId, orderId: realOrderId, type, assignedTo, status: 'in_progress' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/orders/:id/portal-token - Générer un jeton de suivi d'accès Portail Client VIP
ordersRouter.post('/:id/portal-token', requireTenant, async (req: Request, res: Response) => {
  const { id } = req.params;
  const atelierId = req.atelierId!;

  try {
    const [ordRows]: any = await pool!.query('SELECT id, clientId FROM orders WHERE (id = ? OR orderNumber = ?) AND atelierId = ?', [id, id, atelierId]);
    if (ordRows.length === 0) return res.status(404).json({ error: 'Commande non trouvée' });
    
    const token = `vip-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const portalUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/#/portal/${token}`;

    return res.json({
      success: true,
      token,
      portalUrl,
      expiresAt
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/orders/:id/measurement-snapshot - Consultation du snapshot figé des mensurations de la commande
ordersRouter.get('/:id/measurement-snapshot', requireTenant, requirePermission('orders.read'), async (req: Request, res: Response) => {
  const { id } = req.params;
  const atelierId = req.atelierId!;
  try {
    const [rows]: any = await pool!.query(
      `SELECT oms.* 
       FROM order_measurement_snapshots oms
       JOIN orders o ON oms.orderId = o.id
       WHERE (o.id = ? OR o.orderNumber = ?) AND o.atelierId = ?`,
      [id, id, atelierId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Snapshot de mensurations non trouvé pour cette commande.' });
    }
    return res.json(rows[0]);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export const portalRouter = Router();

// GET /api/portal/orders/:token — Données JSON Portail Client (consommé par la page HTML)
portalRouter.get('/orders/:token', async (req: Request, res: Response) => {
  const { token } = req.params;

  try {
    // Vérification du jeton via la table customer_portal_tokens
    const [tokenRows]: any = await pool!.query(
      `SELECT cpt.orderId, cpt.expiresAt FROM customer_portal_tokens cpt WHERE cpt.token = ? AND cpt.expiresAt > NOW()`,
      [token]
    );
    if (tokenRows.length === 0) {
      return res.status(404).json({ error: 'Lien de suivi invalide ou expiré. Contactez votre atelier.' });
    }

    const orderId = tokenRows[0].orderId;
    const [ordRows]: any = await pool!.query('SELECT * FROM orders WHERE id = ?', [orderId]);
    if (ordRows.length === 0) {
      return res.status(404).json({ error: 'Commande non trouvée.' });
    }

    const order = ordRows[0];
    const [timeline]: any = await pool!.query(
      'SELECT toStatus, changedAt, time FROM order_status_history WHERE orderId = ? ORDER BY changedAt ASC, time ASC',
      [orderId]
    );
    const [payments]: any = await pool!.query(
      'SELECT amount, method, reference, createdAt FROM payments WHERE orderId = ? AND status = "completed"',
      [orderId]
    );

    return res.json({
      success: true,
      order: {
        orderNumber: order.orderNumber,
        clientName: order.clientName,
        modelName: order.modelName,
        garmentType: order.garmentType,
        deliveryDate: order.deliveryDate,
        status: order.status,
        totalAmount: order.totalAmount,
        paidAmount: order.paidAmount,
        remainingAmount: order.remainingAmount,
        currency: order.currency || 'FCFA'
      },
      timeline,
      payments
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /portal/:token — Page HTML Portail Client Mobile-Friendly (aucune installation requise)
portalRouter.get('/:token', async (req: Request, res: Response) => {
  const { token } = req.params;
  const apiBase = process.env.APP_URL || 'http://localhost:3000';
  const html = generatePortalHTML(token, apiBase);
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  return res.send(html);
});

function generatePortalHTML(token: string, apiBase: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <meta name="theme-color" content="#1a0a00">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <title>Suivi de commande — DigiCouture</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
    :root {
      --gold: #c8a84b;
      --gold-light: #e8c96a;
      --bg: #0f0800;
      --surface: #1c1005;
      --surface2: #261608;
      --text: #f5ead8;
      --muted: #8a7a60;
      --green: #4caf7d;
      --radius: 14px;
    }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      min-height: 100vh;
      padding: 0 0 40px;
    }
    /* HEADER */
    .header {
      background: linear-gradient(135deg, #1c1005 0%, #2e1a07 100%);
      border-bottom: 1px solid rgba(200,168,75,0.2);
      padding: 20px 20px 16px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .header-logo { font-size: 26px; }
    .header-title { font-size: 18px; font-weight: 700; color: var(--gold); letter-spacing: 0.5px; }
    .header-sub { font-size: 12px; color: var(--muted); margin-top: 2px; }

    /* CONTAINER */
    .container { padding: 20px 16px; max-width: 480px; margin: 0 auto; }

    /* ORDER NUMBER BADGE */
    .order-badge {
      background: var(--surface2);
      border: 1px solid rgba(200,168,75,0.3);
      border-radius: var(--radius);
      padding: 16px 18px;
      margin-bottom: 18px;
    }
    .order-badge-label { font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: 1px; }
    .order-badge-number { font-size: 22px; font-weight: 800; color: var(--gold); margin-top: 4px; letter-spacing: 1px; }
    .order-badge-model { font-size: 13px; color: var(--text); opacity: 0.7; margin-top: 3px; }

    /* PROGRESS BAR */
    .progress-card {
      background: var(--surface);
      border-radius: var(--radius);
      padding: 18px;
      margin-bottom: 18px;
      border: 1px solid rgba(200,168,75,0.15);
    }
    .progress-label {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
    .progress-label span:first-child { font-size: 13px; color: var(--muted); }
    .progress-pct { font-size: 20px; font-weight: 800; color: var(--gold); }
    .progress-track {
      height: 8px;
      background: rgba(200,168,75,0.12);
      border-radius: 100px;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #c8a84b, #e8c96a);
      border-radius: 100px;
      transition: width 1s ease;
    }

    /* TIMELINE */
    .timeline-card {
      background: var(--surface);
      border-radius: var(--radius);
      padding: 18px;
      margin-bottom: 18px;
      border: 1px solid rgba(200,168,75,0.15);
    }
    .timeline-title { font-size: 12px; color: var(--muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px; }
    .timeline-step {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 6px 0;
    }
    .step-icon {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      flex-shrink: 0;
    }
    .step-done { background: rgba(76,175,125,0.15); color: var(--green); }
    .step-current { background: rgba(200,168,75,0.2); color: var(--gold); }
    .step-pending { background: rgba(255,255,255,0.05); color: var(--muted); }
    .step-label { font-size: 14px; }
    .step-label.done { color: var(--text); }
    .step-label.current { color: var(--gold); font-weight: 600; }
    .step-label.pending { color: var(--muted); }
    .step-date { font-size: 11px; color: var(--muted); margin-left: auto; white-space: nowrap; }

    /* FINANCIAL CARD */
    .finance-card {
      background: var(--surface);
      border-radius: var(--radius);
      padding: 18px;
      margin-bottom: 18px;
      border: 1px solid rgba(200,168,75,0.15);
    }
    .finance-title { font-size: 12px; color: var(--muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 14px; }
    .finance-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid rgba(255,255,255,0.05);
    }
    .finance-row:last-child { border-bottom: none; }
    .finance-label { font-size: 14px; color: var(--muted); }
    .finance-value { font-size: 15px; font-weight: 700; color: var(--text); }
    .finance-value.paid { color: var(--green); }
    .finance-value.remaining { color: #ff8a65; }
    .finance-value.total { color: var(--gold); font-size: 17px; }

    /* DELIVERY */
    .delivery-card {
      background: linear-gradient(135deg, rgba(200,168,75,0.12), rgba(200,168,75,0.04));
      border: 1px solid rgba(200,168,75,0.3);
      border-radius: var(--radius);
      padding: 16px 18px;
      margin-bottom: 18px;
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .delivery-icon { font-size: 28px; }
    .delivery-label { font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: 1px; }
    .delivery-date { font-size: 18px; font-weight: 700; color: var(--gold); margin-top: 2px; }

    /* FOOTER */
    .footer {
      text-align: center;
      font-size: 12px;
      color: var(--muted);
      margin-top: 24px;
    }
    .footer strong { color: var(--gold-light); }

    /* LOADER */
    .loader {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 60vh;
      gap: 16px;
    }
    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid rgba(200,168,75,0.2);
      border-top-color: var(--gold);
      border-radius: 50%;
      animation: spin 0.9s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* ERROR */
    .error-card {
      background: rgba(255,80,60,0.08);
      border: 1px solid rgba(255,80,60,0.25);
      border-radius: var(--radius);
      padding: 24px;
      text-align: center;
    }
    .error-icon { font-size: 40px; margin-bottom: 12px; }
    .error-title { color: #ff6b6b; font-size: 16px; font-weight: 700; }
    .error-msg { color: var(--muted); font-size: 14px; margin-top: 8px; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="header">
    <div class="header-logo">👗</div>
    <div>
      <div class="header-title">DigiCouture</div>
      <div class="header-sub">Suivi de commande en temps réel</div>
    </div>
  </div>

  <div class="container">
    <div id="app">
      <div class="loader">
        <div class="spinner"></div>
        <div style="color: var(--muted); font-size:14px;">Chargement de votre commande…</div>
      </div>
    </div>
  </div>

  <script>
    const TOKEN = '${token}';
    const API = '${apiBase}/api/portal/orders/' + TOKEN;

    const STEPS = [
      { key: 'commande_recue',   label: 'Commande reçue',  emoji: '📋' },
      { key: 'mesures_prises',   label: 'Mensurations',    emoji: '📏' },
      { key: 'mesures_validees', label: 'Mesures validées', emoji: '✅' },
      { key: 'decoupe',          label: 'Découpe',         emoji: '✂️' },
      { key: 'couture',          label: 'Couture',         emoji: '🧵' },
      { key: 'finitions',        label: 'Finitions',       emoji: '💎' },
      { key: 'essayage',         label: 'Essayage',        emoji: '👗' },
      { key: 'prete',            label: 'Prête',           emoji: '🎉' },
      { key: 'livree',           label: 'Livrée',          emoji: '📦' },
    ];

    function fmt(n) {
      return Number(n || 0).toLocaleString('fr-FR') + ' FCFA';
    }

    function fmtDate(d) {
      if (!d) return '—';
      try {
        return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
      } catch { return d; }
    }

    function getCurrentStepIndex(status) {
      const idx = STEPS.findIndex(s => s.key === status);
      return idx === -1 ? 0 : idx;
    }

    function computeProgress(currentIdx) {
      return Math.round(((currentIdx + 1) / STEPS.length) * 100);
    }

    function render(data) {
      const { order, timeline } = data;
      const currentIdx = getCurrentStepIndex(order.status);
      const progress = computeProgress(currentIdx);

      const completedKeys = new Set((timeline || []).map(t => t.toStatus));

      const stepsHTML = STEPS.map((step, i) => {
        let stateClass, iconClass, icon;
        if (i < currentIdx || completedKeys.has(step.key)) {
          stateClass = 'done'; iconClass = 'step-done'; icon = '✓';
        } else if (i === currentIdx) {
          stateClass = 'current'; iconClass = 'step-current'; icon = step.emoji;
        } else {
          stateClass = 'pending'; iconClass = 'step-pending'; icon = '○';
        }
        const entry = (timeline || []).slice().reverse().find(t => t.toStatus === step.key);
        const dateStr = entry ? '<span class="step-date">' + fmtDate(entry.changedAt) + '</span>' : '';
        return \`<div class="timeline-step">
          <div class="step-icon \${iconClass}">\${icon}</div>
          <span class="step-label \${stateClass}">\${step.label}</span>
          \${dateStr}
        </div>\`;
      }).join('');

      document.getElementById('app').innerHTML = \`
        <div class="order-badge">
          <div class="order-badge-label">Ma commande</div>
          <div class="order-badge-number">\${order.orderNumber || '—'}</div>
          \${order.modelName ? '<div class="order-badge-model">' + order.modelName + '</div>' : ''}
        </div>

        <div class="progress-card">
          <div class="progress-label">
            <span>Avancement</span>
            <span class="progress-pct">\${progress}%</span>
          </div>
          <div class="progress-track">
            <div class="progress-fill" id="pbar" style="width:0%"></div>
          </div>
        </div>

        <div class="timeline-card">
          <div class="timeline-title">Étapes de confection</div>
          \${stepsHTML}
        </div>

        <div class="delivery-card">
          <div class="delivery-icon">📅</div>
          <div>
            <div class="delivery-label">Livraison prévue</div>
            <div class="delivery-date">\${fmtDate(order.deliveryDate)}</div>
          </div>
        </div>

        <div class="finance-card">
          <div class="finance-title">Récapitulatif financier</div>
          <div class="finance-row">
            <span class="finance-label">Total commande</span>
            <span class="finance-value total">\${fmt(order.totalAmount)}</span>
          </div>
          <div class="finance-row">
            <span class="finance-label">Montant payé</span>
            <span class="finance-value paid">\${fmt(order.paidAmount)}</span>
          </div>
          <div class="finance-row">
            <span class="finance-label">Reste à payer</span>
            <span class="finance-value remaining">\${fmt(order.remainingAmount)}</span>
          </div>
        </div>

        <div class="footer">
          Suivi sécurisé • <strong>DigiCouture VIP</strong><br>
          Mis à jour en temps réel — Actualisez pour voir les derniers changements
        </div>
      \`;

      // Animate progress bar
      requestAnimationFrame(() => {
        setTimeout(() => {
          const pb = document.getElementById('pbar');
          if (pb) pb.style.width = progress + '%';
        }, 100);
      });
    }

    function renderError(msg) {
      document.getElementById('app').innerHTML = \`
        <div class="error-card">
          <div class="error-icon">🔒</div>
          <div class="error-title">Lien invalide ou expiré</div>
          <div class="error-msg">\${msg || 'Ce lien de suivi est introuvable ou a expiré. Contactez votre atelier pour obtenir un nouveau lien.'}</div>
        </div>
      \`;
    }

    async function load() {
      try {
        const res = await fetch(API);
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          renderError(body.error?.message || body.error || 'Erreur de chargement.');
          return;
        }
        const data = await res.json();
        if (!data.success) { renderError(data.error?.message); return; }
        render(data);
      } catch (e) {
        renderError('Impossible de contacter le serveur. Vérifiez votre connexion Internet.');
      }
    }

    load();
  </script>
</body>
</html>`;
}

// GET /api/orders/public/tracking/:orderCode/:token - Endpoint public sécurisé pour le portail client mobile-first (Sections 4, 5, 6 & 21)
ordersRouter.get('/public/tracking/:orderCode/:token', async (req: Request, res: Response) => {
  const { orderCode, token } = req.params;

  try {
    const [rows]: any = await pool!.query(
      `SELECT o.id, o.code, o.orderNumber, o.clientName, o.modelName, o.modelCategory, o.garmentType, o.fabricName, o.fabricColor, o.dueDate, o.deliveryDate, o.status, o.modelImageUrl, o.createdAt, o.updatedAt, o.tracking_token, o.qr_code, a.name as atelierName, a.phone as atelierPhone, a.whatsapp as atelierWhatsapp, a.address as atelierAddress
       FROM orders o
       LEFT JOIN ateliers a ON o.atelierId = a.id
       WHERE (o.orderNumber = ? OR o.code = ? OR o.id = ?) AND o.tracking_token = ? LIMIT 1`,
      [orderCode, orderCode, orderCode, token]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Commande introuvable ou jeton de suivi invalide.' });
    }

    const order = rows[0];

    // Timeline des étapes enregistrées
    const [timeline]: any = await pool!.query(
      `SELECT toStatus as status, changedAt as date, time, comment FROM order_status_history WHERE orderId = ? ORDER BY changedAt ASC, time ASC`,
      [order.id]
    );

    // Mappage des 8 étapes standards de confection Haute Couture VIP
    const STAGES = [
      { key: 'commande_recue', label: 'Commande reçue' },
      { key: 'mesures_prises', label: 'Mesures & Patron' },
      { key: 'decoupe', label: 'Découpe tissu' },
      { key: 'couture', label: 'Couture & Assemblage' },
      { key: 'finitions', label: 'Finitions & Broderie' },
      { key: 'essayage', label: 'Essayage' },
      { key: 'prete', label: 'Tenue prête' },
      { key: 'livree', label: 'Livrée' }
    ];

    const isDelivered = order.status === 'livree';

    return res.json({
      success: true,
      mode: isDelivered ? 'READ_ONLY' : 'ACTIVE_TRACKING',
      isDelivered,
      order: {
        code: order.orderNumber || order.code,
        clientName: order.clientName,
        modelName: order.modelName,
        fabricName: order.fabricName,
        fabricColor: order.fabricColor,
        status: order.status,
        createdAt: order.createdAt,
        deliveryDate: order.deliveryDate || order.dueDate,
        modelImageUrl: order.modelImageUrl,
        atelierName: order.atelierName || 'Maison DigiCouture VIP',
        atelierPhone: order.atelierPhone || '',
        atelierWhatsapp: order.atelierWhatsapp || '',
        atelierAddress: order.atelierAddress || 'Abidjan, Côte d\'Ivoire',
        qrCodeUrl: order.qr_code,
        trackingUrl: `${process.env.PUBLIC_APP_URL || 'http://localhost:5173'}/tracking/${order.code}/${token}`
      },
      stages: STAGES,
      history: timeline || []
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/orders/:id/notifications-log - Obtenir le journal des notifications WhatsApp (Section 11)
ordersRouter.get('/:id/notifications-log', requirePermission('orders.read'), async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const logs = await TrackingService.getOrderNotificationLogs(id);
    return res.json({ success: true, logs });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/orders/:id/notifications-resend - Envoi manuel de secours de notification WhatsApp (Section 16)
ordersRouter.post('/:id/notifications-resend', requirePermission('orders.update'), async (req: Request, res: Response) => {
  const { id } = req.params;
  const { event } = req.body;

  try {
    const [existing]: any = await pool!.query('SELECT id, status FROM orders WHERE id = ? OR orderNumber = ? OR code = ?', [id, id, id]);
    if (!existing || existing.length === 0) return res.status(404).json({ error: 'Commande introuvable' });

    const orderId = existing[0].id;
    const targetStatus = event || existing[0].status;

    const result = await TrackingService.dispatchStatusNotification(orderId, targetStatus, 'Secours Couturier');
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

