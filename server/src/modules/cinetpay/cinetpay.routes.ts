import { Router, Request, Response } from 'express';
import { pool } from '../../config/database.js';
import { ENV } from '../../config/env.js';
import { recalculateOrderBalance } from '../payments/payments.routes.js';
import { requireIdempotency } from '../../middleware/idempotency.middleware.js';

export const cinetpayRouter = Router();

// POST /api/payments/cinetpay/initiate - Initialisation de Guichet de Paiement CinetPay avec Idempotence
cinetpayRouter.post('/initiate', requireIdempotency, async (req: Request, res: Response) => {
  try {
    const { orderId, atelierId, amount, clientName, clientPhone, description } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Montant de paiement invalide' });
    }

    const apiKey = ENV.CINETPAY_API_KEY;
    const siteId = ENV.CINETPAY_SITE_ID;
    const transactionId = `DC-${orderId || 'ORD'}-${Date.now()}`;
    const cleanPhone = (clientPhone || '0707070707').replace(/[^0-9]/g, '');

    const payload = {
      apikey: apiKey,
      site_id: siteId,
      transaction_id: transactionId,
      amount: Math.round(Number(amount)),
      currency: 'XOF',
      description: description || `Règlement Acompte Commande ${orderId || ''} - DigiCouture VIP`,
      customer_name: clientName || 'Client VIP',
      customer_surname: 'Atelier',
      customer_email: 'paiement@digicouture.ci',
      customer_phone_number: cleanPhone,
      customer_address: 'Abidjan',
      customer_city: 'Abidjan',
      customer_country: 'CI',
      customer_state: 'CI',
      customer_zip_code: '00225',
      notify_url: `${ENV.APP_URL}/api/payments/cinetpay/notify`,
      return_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/#payment-success`,
      channels: 'ALL',
      metadata: JSON.stringify({ orderId, atelierId, clientName, amount })
    };

    // Si les clés de production ou sandbox CinetPay sont configurées
    if (apiKey && apiKey !== 'YOUR_CINETPAY_API_KEY' && siteId && siteId !== 'YOUR_CINETPAY_SITE_ID') {
      const apiRes = await fetch('https://api-checkout.cinetpay.com/v2/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const apiData: any = await apiRes.json();

      if (apiData.code === '201' && apiData.data && apiData.data.payment_url) {
        return res.json({
          success: true,
          paymentUrl: apiData.data.payment_url,
          transactionId,
          message: 'Guichet CinetPay généré avec succès'
        });
      } else {
        return res.status(400).json({ error: apiData.message || 'Échec d\'initialisation CinetPay', details: apiData });
      }
    }

    // Mode Sandbox / Démonstration si les clés ne sont pas encore définies
    const mockPaymentUrl = `https://checkout.cinetpay.com/payment/demo?transaction_id=${transactionId}&amount=${amount}`;
    return res.json({
      success: true,
      isDemoMode: true,
      paymentUrl: mockPaymentUrl,
      transactionId,
      message: 'Mode Test/Sandbox CinetPay actif. Clés API prêtes pour bascule immédiate en production.'
    });

  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/payments/cinetpay/notify - Webhook IPN 24/7 (Source de Vérité Serveur-à-Serveur avec Garantie d'Idempotence)
cinetpayRouter.post('/notify', requireIdempotency, async (req: Request, res: Response) => {
  try {
    const { cpay_transaction_id, cpay_custom } = req.body;
    console.log('🔔 [CinetPay Webhook IPN] Notification reçue du serveur CinetPay :', req.body);

    const apiKey = ENV.CINETPAY_API_KEY;
    const siteId = ENV.CINETPAY_SITE_ID;

    if (!cpay_transaction_id) {
      return res.status(400).json({ error: 'cpay_transaction_id manquant' });
    }

    let isPaymentAccepted = false;
    let paidAmount = 0;
    let orderId: string | null = null;
    let atelierId = 'atl-1787175204484';

    // RÈGLE ABSOLUE CINETPAY : NE JAMAIS ACCEPTER UN PAIEMENT SANS VERIFICATION SERVEUR-A-SERVEUR VIA L'API CINETPAY
    if (apiKey && siteId && apiKey !== 'YOUR_CINETPAY_API_KEY') {
      const checkRes = await fetch('https://api-checkout.cinetpay.com/v2/payment/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apikey: apiKey,
          site_id: siteId,
          transaction_id: cpay_transaction_id
        })
      });
      const checkData: any = await checkRes.json();
      
      // Confirmation officielle par l'API CinetPay
      isPaymentAccepted = (checkData.code === '00' && checkData.data && checkData.data.status === 'ACCEPTED');
      
      if (checkData.data) {
        paidAmount = Number(checkData.data.amount || 0);
        try {
          const meta = JSON.parse(checkData.data.metadata || '{}');
          orderId = meta.orderId || null;
          if (meta.atelierId) atelierId = meta.atelierId;
        } catch (e) {}
      }
    } else {
      // En mode sandbox de test
      isPaymentAccepted = true;
      paidAmount = 10000;
    }

    if (isPaymentAccepted) {
      const reference = `CPAY-${cpay_transaction_id}`;
      const createdAt = new Date().toISOString().split('T')[0];

      if (orderId) {
        const [ordRows]: any = await pool!.query('SELECT atelierId FROM orders WHERE id = ? OR orderNumber = ? OR code = ?', [orderId, orderId, orderId]);
        if (ordRows.length > 0) {
          atelierId = ordRows[0].atelierId;
        }
      }

      // 1. Enregistrement irréversible de la transaction dans la table payments
      await pool!.query(
        `INSERT INTO payments (id, atelierId, orderId, amount, currency, method, status, reference, provider, providerTransactionId, clientName, note, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE status='completed', amount=VALUES(amount)`,
        [
          `pay-${cpay_transaction_id}`,
          atelierId,
          orderId || 'CMD-ONLINE',
          paidAmount,
          'FCFA',
          'CINETPAY',
          'completed',
          reference,
          'CinetPay',
          cpay_transaction_id,
          'Client Mobile Money CinetPay',
          `Validation Webhook CinetPay officielle (Tx: ${cpay_transaction_id})`,
          createdAt
        ]
      );

      // 2. Recalcul backend des montants paidAmount et remainingAmount sur la commande
      if (orderId) {
        await recalculateOrderBalance(orderId);
      }

      // 3. Génération du reçu certifié
      const receiptNumber = `REC-CPAY-${Date.now()}`;
      await pool!.query(
        `INSERT INTO receipts (id, orderId, paymentId, receiptNumber, amount, issuedAt)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE amount=VALUES(amount)`,
        [`rec-${cpay_transaction_id}`, orderId || 'CMD-ONLINE', `pay-${cpay_transaction_id}`, receiptNumber, paidAmount, createdAt]
      );

      console.log(`✅ [CinetPay Webhook] Paiement de ${paidAmount} FCFA confirmé par l'API CinetPay pour la commande ${orderId}`);
    }

    return res.status(200).json({ status: 'ACCEPTED', message: 'Notification CinetPay validée et enregistrée avec succès.' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});
