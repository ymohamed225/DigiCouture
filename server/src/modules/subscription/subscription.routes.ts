import { Router, Request, Response } from 'express';
import { pool } from '../../config/database.js';
import { SubscriptionService, PLANS_CONFIG } from '../../services/subscription.service.js';
import crypto from 'crypto';

export const subscriptionRouter = Router();

// GET /api/subscription - Obtenir l'état de l'abonnement réactif d'un atelier
subscriptionRouter.get('/', async (req: Request, res: Response) => {
  try {
    const atelierId = String(req.query.atelierId || (req as any).user?.atelierId || 'atl-1787175204484');
    const status = await SubscriptionService.getSubscriptionStatus(atelierId);
    return res.json(status);
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

// GET /api/subscription/plans - Liste des 5 formules publiques DigiCouture VIP
subscriptionRouter.get('/plans', async (_req: Request, res: Response) => {
  try {
    const plansList = Object.values(PLANS_CONFIG).map(p => ({
      ...p,
      priceMonthlyFormatted: p.priceMonthly > 0 ? `${p.priceMonthly.toLocaleString('fr-FR')} FCFA/mois` : (p.code === 'FREE' ? '0 FCFA (30j Découverte)' : 'Sur devis'),
      quotaText: p.maxOrders >= 999999 ? 'Commandes illimitées' : `${p.maxOrders} commandes`
    }));
    return res.json({ success: true, data: plansList });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/subscription/checkout - Initier un paiement d'abonnement CinetPay
subscriptionRouter.post('/checkout', async (req: Request, res: Response) => {
  try {
    const { atelierId, planCode, paymentMethod } = req.body;
    if (!atelierId || !planCode) {
      return res.status(400).json({ success: false, error: 'atelierId et planCode requis.' });
    }

    const plan = PLANS_CONFIG[planCode.toUpperCase()];
    if (!plan || plan.priceMonthly <= 0) {
      return res.status(400).json({ success: false, error: 'Formule non éligible au paiement en ligne.' });
    }

    const transactionId = `SUB-PAY-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
    const amount = plan.priceMonthly;
    const currency = 'FCFA';

    // Insérer une intention de paiement SaaS
    await pool!.query(
      `INSERT INTO saas_payments (id, atelierId, subscriptionId, amount, currency, method, status, reference, providerTransactionId, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        transactionId,
        atelierId,
        `sub-${atelierId}`,
        amount,
        currency,
        paymentMethod || 'cinetpay',
        'pending',
        `REF-${transactionId}`,
        transactionId,
        new Date().toISOString()
      ]
    );

    // Simulation URL de paiement CinetPay / Guichet Mobile Money
    const paymentUrl = `https://checkout.cinetpay.com/payment/${transactionId}?amount=${amount}&currency=${currency}`;

    return res.json({
      success: true,
      transactionId,
      amount,
      currency,
      planCode: plan.code,
      planName: plan.name,
      paymentUrl,
      message: `Transaction CinetPay de ${amount.toLocaleString('fr-FR')} FCFA initiée pour le plan ${plan.name}.`
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/subscription/webhook - Webhook CinetPay pour validation serveur-à-serveur
subscriptionRouter.post('/webhook', async (req: Request, res: Response) => {
  try {
    const { cpay_transaction_id, status, atelierId, planCode } = req.body;
    console.log(`🔔 [CinetPay Webhook] Notification reçue pour transaction ${cpay_transaction_id} (Status: ${status})`);

    if (status === 'ACCEPTED' || status === 'COMPLETED' || status === 'SUCCESS') {
      const now = new Date();
      const nowIso = now.toISOString();
      const subEndDate = new Date(now.getTime() + 30 * 24 * 3600 * 1000).toISOString();
      const targetPlan = (planCode || 'PRO').toUpperCase();
      const planConfig = PLANS_CONFIG[targetPlan] || PLANS_CONFIG.PRO;

      // 1. Mettre à jour le paiement SaaS
      if (cpay_transaction_id) {
        await pool!.query(
          'UPDATE saas_payments SET status = "completed" WHERE id = ? OR providerTransactionId = ?',
          [cpay_transaction_id, cpay_transaction_id]
        );
      }

      // 2. Activer l'abonnement côté serveur
      if (atelierId) {
        // Récupérer l'ancien statut
        const [oldRows]: any = await pool!.query('SELECT subscription_plan, subscription_status FROM ateliers WHERE id = ?', [atelierId]);
        const oldPlan = oldRows[0]?.subscription_plan || 'FREE';
        const oldStatus = oldRows[0]?.subscription_status || 'TRIAL';

        await pool!.query(
          `UPDATE ateliers SET 
            subscription_plan = ?,
            subscription_status = 'ACTIVE',
            subscription_start_date = ?,
            subscription_end_date = ?,
            monthly_order_limit = ?,
            client_limit = ?,
            user_limit = ?,
            storage_limit_mb = ?,
            has_used_trial = 1,
            has_had_paid_plan = 1,
            subscription_updated_at = ?
           WHERE id = ?`,
          [
            targetPlan,
            nowIso,
            subEndDate,
            planConfig.maxOrders,
            planConfig.maxClients,
            planConfig.maxUsers,
            planConfig.storageLimitMb,
            nowIso,
            atelierId
          ]
        );

        // 3. Enregistrer un audit log automatique
        await SubscriptionService.recordAuditLog({
          adminUserId: 'cinetpay-webhook',
          adminUserName: 'Système CinetPay Webhook',
          atelierId,
          action: 'PAYMENT_ACTIVATION',
          previousPlan: oldPlan,
          newPlan: targetPlan,
          previousStatus: oldStatus,
          newStatus: 'ACTIVE',
          reason: `Paiement CinetPay confirmé pour ${planConfig.name} (${planConfig.priceMonthly} FCFA)`
        });
      }

      return res.json({ success: true, message: 'Abonnement activé avec succès par webhook serveur.' });
    }

    return res.json({ success: true, message: 'Notification reçue.' });
  } catch (err: any) {
    console.error('❌ [CinetPay Webhook Error]', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});
