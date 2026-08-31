import { Router, Request, Response } from 'express';
import { pool, withTransaction } from '../../config/database.js';
import { requireTenant } from '../../middleware/tenant.middleware.js';
import { requirePermission } from '../../middleware/permission.middleware.js';
import { requireIdempotency } from '../../middleware/idempotency.middleware.js';
import { NotificationService } from '../../services/notification.service.js';
import { validate } from '../../validation/validate.middleware.js';
import { CreatePaymentSchema } from '../../validation/schemas.js';

export const paymentsRouter = Router();

// Helper de génération automatique d'une référence unique de paiement métier (ex: PAY-2026-000001)
export async function generatePaymentReference(atelierId: string): Promise<string> {
  const currentYear = new Date().getFullYear();
  const [rows]: any = await pool!.query('SELECT COUNT(*) as total FROM payments WHERE atelierId = ?', [atelierId]);
  const count = (rows[0]?.total || 0) + 1;
  return `PAY-${currentYear}-${String(count).padStart(6, '0')}`;
}

// Helper de recalcul strict du total encaissé et du reste à payer d'une commande
export async function recalculateOrderBalance(orderId: string): Promise<{ paidAmount: number; remainingAmount: number }> {
  const [sumRows]: any = await pool!.query(
    `SELECT COALESCE(SUM(amount), 0) as totalPaid FROM payments WHERE orderId = ? AND status = 'completed'`,
    [orderId]
  );
  const paidAmount = Number(sumRows[0]?.totalPaid || 0);

  const [orderRows]: any = await pool!.query('SELECT totalAmount FROM orders WHERE id = ?', [orderId]);
  const totalAmount = Number(orderRows[0]?.totalAmount || 0);
  const remainingAmount = Math.max(0, totalAmount - paidAmount);

  const updatedAt = new Date().toISOString().split('T')[0];
  await pool!.query(
    'UPDATE orders SET paidAmount = ?, remainingAmount = ?, updatedAt = ? WHERE id = ?',
    [paidAmount, remainingAmount, updatedAt, orderId]
  );

  return { paidAmount, remainingAmount };
}

// GET /api/payments - Liste des encaissements d'un atelier
paymentsRouter.get('/', requireTenant, requirePermission('payments.read'), async (req: Request, res: Response) => {
  const atelierId = req.atelierId!;
  const { orderId } = req.query;

  try {
    let sql = 'SELECT * FROM payments WHERE atelierId = ?';
    const params: any[] = [atelierId];

    if (orderId) {
      sql += ' AND orderId = ?';
      params.push(orderId);
    }

    sql += ' ORDER BY createdAt DESC';

    const [rows]: any = await pool!.query(sql, params);
    return res.json(rows);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/payments - Encaissement de paiement avec Garantie d'Idempotence
paymentsRouter.post('/', requireTenant, requirePermission('payments.create'), requireIdempotency, validate(CreatePaymentSchema), async (req: Request, res: Response) => {
  const pay = req.body;
  const atelierId = req.atelierId!;

  try {
    const paymentId = pay.id || `pay-${Date.now()}`;
    const amount = Number(pay.amount);
    const reference = pay.reference || await generatePaymentReference(atelierId);
    const createdAt = pay.createdAt || pay.date || new Date().toISOString().split('T')[0];
    const method = pay.method || 'CASH';
    const provider = pay.provider || (method === 'CINETPAY' ? 'CinetPay' : 'SYSTEM');
    const status = pay.status || 'completed';

    // EXECUTION TRANSACTIONNELLE CRITIQUE EN TRANSACTION ACID (ROLLBACK SI ÉCHEC D'UNE ÉTAPE)
    return await withTransaction(async (conn) => {
      // 1. Enregistrement de la transaction Payment
      await conn.query(
        `INSERT INTO payments (id, atelierId, orderId, amount, currency, method, status, reference, provider, providerTransactionId, clientName, note, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          paymentId,
          atelierId,
          pay.orderId,
          amount,
          pay.currency || 'FCFA',
          method,
          status,
          reference,
          provider,
          pay.providerTransactionId || null,
          pay.clientName || 'Client VIP',
          pay.note || '',
          createdAt
        ]
      );

      // 2. Recalcul du total encaissé et du solde restant dû dans la transaction
      const [sumRows]: any = await conn.query(
        `SELECT COALESCE(SUM(amount), 0) as totalPaid FROM payments WHERE orderId = ? AND status = 'completed'`,
        [pay.orderId]
      );
      const paidAmount = Number(sumRows[0]?.totalPaid || 0);

      const [ordTotalRows]: any = await conn.query(`SELECT totalAmount FROM orders WHERE id = ?`, [pay.orderId]);
      const totalAmount = Number(ordTotalRows[0]?.totalAmount || 0);
      const remainingAmount = Math.max(0, totalAmount - paidAmount);

      await conn.query(
        `UPDATE orders SET paidAmount = ?, remainingAmount = ?, updatedAt = ? WHERE id = ?`,
        [paidAmount, remainingAmount, createdAt, pay.orderId]
      );

      // 3. Génération du Reçu Certifié REC-2026-000001 dans la même transaction
      const [countRows]: any = await conn.query('SELECT COUNT(*) as total FROM receipts WHERE atelierId = ?', [atelierId]);
      const seq = (countRows[0]?.total || 0) + 1;
      const currentYear = new Date().getFullYear();
      const receiptNumber = `REC-${currentYear}-${String(seq).padStart(6, '0')}`;
      const receiptId = `rec-${Date.now()}`;

      await conn.query(
        `INSERT INTO receipts (id, atelierId, orderId, paymentId, receiptNumber, amount, currency, issuedAt, status, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [receiptId, atelierId, pay.orderId, paymentId, receiptNumber, amount, pay.currency || 'FCFA', createdAt, 'ISSUED', createdAt]
      );

      // 4. Inscription de l'Audit Log dans la transaction
      const auditId = `aud-${Date.now()}`;
      await conn.query(
        `INSERT INTO audit_logs (id, atelierId, action, entityType, entityId, performedBy, details, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [auditId, atelierId, 'PAYMENT_RECEIVED', 'payment', paymentId, 'Système de Paiement', JSON.stringify({ amount, reference, receiptNumber, remainingAmount }), createdAt]
      );

      // 5. Notification en tâche de fond (Hors transaction SQL pour ne pas bloquer si échec réseau)
      const [ordRows]: any = await conn.query('SELECT orderNumber, clientId FROM orders WHERE id = ?', [pay.orderId]);
      if (ordRows.length > 0) {
        const [cliRows]: any = await conn.query('SELECT name, phone FROM clients WHERE id = ?', [ordRows[0].clientId]);
        const clientPhone = cliRows[0]?.phone || '0707070707';
        const clientName = cliRows[0]?.name || pay.clientName || 'Client VIP';

        NotificationService.dispatch({
          atelierId,
          orderId: pay.orderId,
          recipient: clientPhone,
          event: 'PAYMENT_RECEIVED',
          variables: {
            clientName,
            orderNumber: ordRows[0].orderNumber || pay.orderId,
            amount,
            reference,
            remainingAmount
          }
        });
      }

      return res.json({
        success: true,
        payment: {
          id: paymentId,
          atelierId,
          orderId: pay.orderId,
          amount,
          reference,
          receiptNumber,
          paidAmount,
          remainingAmount,
          status,
          createdAt
        },
        orderBalance: { paidAmount, remainingAmount },
        receipt: { receiptNumber }
      });
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});
