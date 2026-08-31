import { Router, Request, Response } from 'express';
import { pool } from '../../config/database.js';
import { requireTenant } from '../../middleware/tenant.middleware.js';
import { requirePermission } from '../../middleware/permission.middleware.js';

export const receiptsRouter = Router();

// Helper de génération automatique du Numéro de Reçu certifié par atelier (ex: REC-2026-000001)
export async function generateReceiptNumber(atelierId: string): Promise<string> {
  const currentYear = new Date().getFullYear();
  const [rows]: any = await pool!.query('SELECT COUNT(*) as total FROM receipts WHERE atelierId = ?', [atelierId]);
  const count = (rows[0]?.total || 0) + 1;
  return `REC-${currentYear}-${String(count).padStart(6, '0')}`;
}

// GET /api/receipts - Liste des reçus certifiés d'un atelier
receiptsRouter.get('/', requireTenant, requirePermission('payments.read'), async (req: Request, res: Response) => {
  const atelierId = req.atelierId!;
  const { orderId } = req.query;

  try {
    let sql = 'SELECT * FROM receipts WHERE atelierId = ?';
    const params: any[] = [atelierId];

    if (orderId) {
      sql += ' AND orderId = ?';
      params.push(orderId);
    }

    sql += ' ORDER BY createdAt DESC';

    const [receipts]: any = await pool!.query(sql, params);
    return res.json(receipts);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/receipts - Génération Serveur d'un Reçu Officiel (REC-2026-000001)
receiptsRouter.post('/', requireTenant, requirePermission('payments.create'), async (req: Request, res: Response) => {
  const r = req.body;
  const atelierId = req.atelierId!;

  if (!r.orderId) {
    return res.status(400).json({ error: 'orderId obligatoire pour émettre un reçu' });
  }

  try {
    const receiptNumber = r.receiptNumber || await generateReceiptNumber(atelierId);
    const receiptId = r.id || `rec-${Date.now()}`;
    const amount = Number(r.amount) || 0;
    const createdAt = new Date().toISOString().split('T')[0];
    const issuedAt = r.issuedAt || createdAt;
    const pdfUrl = r.pdfUrl || `${process.env.APP_URL || 'http://localhost:3000'}/api/receipts/${receiptId}/pdf`;

    await pool!.query(
      `INSERT INTO receipts (id, atelierId, orderId, paymentId, receiptNumber, amount, currency, issuedAt, pdfUrl, status, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE amount=VALUES(amount), pdfUrl=VALUES(pdfUrl)`,
      [
        receiptId,
        atelierId,
        r.orderId,
        r.paymentId || null,
        receiptNumber,
        amount,
        r.currency || 'FCFA',
        issuedAt,
        pdfUrl,
        r.status || 'ISSUED',
        createdAt
      ]
    );

    return res.json({
      success: true,
      receipt: {
        id: receiptId,
        atelierId,
        orderId: r.orderId,
        paymentId: r.paymentId || null,
        receiptNumber,
        amount,
        currency: r.currency || 'FCFA',
        issuedAt,
        pdfUrl,
        status: r.status || 'ISSUED',
        createdAt
      }
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/receipts/:id - Consultation d'un reçu spécifique
receiptsRouter.get('/:id', requireTenant, async (req: Request, res: Response) => {
  const { id } = req.params;
  const atelierId = req.atelierId!;

  try {
    const [rows]: any = await pool!.query('SELECT * FROM receipts WHERE (id = ? OR receiptNumber = ?) AND atelierId = ?', [id, id, atelierId]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Reçu non trouvé' });
    }
    return res.json(rows[0]);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});
