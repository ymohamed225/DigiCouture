import { pool } from '../config/database.js';
import { NotificationService } from './notification.service.js';

export class TrackingService {
  /**
   * Normalisation stricte du numéro de téléphone WhatsApp au format international +225XXXXXXXXXX
   */
  public static normalizePhone(rawPhone: string): string {
    if (!rawPhone) return '+2250700000000';
    const digits = rawPhone.replace(/[^0-9]/g, '');
    if (digits.startsWith('225') && digits.length === 13) {
      return `+${digits}`;
    }
    if (digits.length === 10) {
      return `+225${digits}`;
    }
    if (digits.length === 8) {
      return `+22507${digits}`;
    }
    return `+225${digits}`;
  }

  /**
   * Génération et récupération d'un QR Code et Lien de suivi PERMANENT pour la commande
   */
  public static async getOrCreateTrackingInfo(orderIdOrCode: string): Promise<{
    orderId: string;
    orderCode: string;
    trackingToken: string;
    trackingUrl: string;
    qrCodeUrl: string;
  }> {
    const [rows]: any = await pool!.query(
      'SELECT id, orderNumber, code, tracking_token, qr_code FROM orders WHERE id = ? OR orderNumber = ? OR code = ? LIMIT 1',
      [orderIdOrCode, orderIdOrCode, orderIdOrCode]
    );

    if (!rows || rows.length === 0) {
      throw new Error('Commande introuvable.');
    }

    const order = rows[0];
    const orderCode = order.orderNumber || order.code || orderIdOrCode;
    let token = order.tracking_token;

    if (!token) {
      token = `tok-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      await pool!.query('UPDATE orders SET tracking_token = ? WHERE id = ?', [token, order.id]);
    }

    const baseUrl = process.env.PUBLIC_APP_URL || 'http://localhost:5173';
    const trackingUrl = `${baseUrl}/tracking/${orderCode}/${token}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(trackingUrl)}`;

    if (!order.qr_code) {
      await pool!.query('UPDATE orders SET qr_code = ? WHERE id = ?', [qrCodeUrl, order.id]);
    }

    return {
      orderId: order.id,
      orderCode,
      trackingToken: token,
      trackingUrl,
      qrCodeUrl
    };
  }

  /**
   * Moteur d'envoi automatique des notifications WhatsApp selon l'étape de confection (Section 8 du Prompt)
   * Garantie Anti-Doublons (Section 10)
   */
  public static async dispatchStatusNotification(
    orderId: string,
    newStatus: string,
    changedBy: string = 'Artisan Couturier'
  ): Promise<{ success: boolean; skipped?: boolean; message?: string; log?: any }> {
    try {
      const [orderRows]: any = await pool!.query(
        `SELECT o.*, c.name as clientFullName, c.phone as clientPhone, a.name as atelierName
         FROM orders o
         LEFT JOIN clients c ON o.clientId = c.id
         LEFT JOIN ateliers a ON o.atelierId = a.id
         WHERE o.id = ? OR o.orderNumber = ? OR o.code = ? LIMIT 1`,
        [orderId, orderId, orderId]
      );

      if (!orderRows || orderRows.length === 0) {
        return { success: false, message: 'Commande introuvable' };
      }

      const order = orderRows[0];
      const realOrderId = order.id;
      const atelierId = order.atelierId;

      // Map statut commande vers événement WhatsApp officiel (Section 8)
      let eventType = '';
      let stageName = '';

      if (newStatus === 'commande_recue' || newStatus === 'mesures_prises') {
        eventType = 'ORDER_CREATED';
        stageName = 'Commande reçue';
      } else if (newStatus === 'decoupe' || newStatus === 'couture' || newStatus === 'finitions' || newStatus === 'COUTURE_ASSEMBLAGE') {
        eventType = 'COUTURE_ASSEMBLAGE';
        stageName = 'Couture & Assemblage';
      } else if (newStatus === 'essayage') {
        eventType = 'ESSAYAGE';
        stageName = 'Essayage';
      } else if (newStatus === 'prete') {
        eventType = 'PRETE';
        stageName = 'Tenue Prête';
      } else if (newStatus === 'livree') {
        eventType = 'LIVREE';
        stageName = 'Livrée';
      } else {
        return { success: true, skipped: true, message: 'Statut interne sans notification client requise.' };
      }

      // RÈGLE DE NON-DOUBLON (Section 10 du Prompt) : Vérifier si cet événement a déjà été notifié
      const [existingLogs]: any = await pool!.query(
        'SELECT id FROM order_notification_logs WHERE orderId = ? AND event = ? AND status = "SENT"',
        [realOrderId, eventType]
      );

      if (existingLogs && existingLogs.length > 0) {
        console.log(`ℹ️ [Anti-Doublon WhatsApp] Notification ${eventType} déjà envoyée pour la commande ${order.code}. Ignorée.`);
        return { success: true, skipped: true, message: `Notification ${eventType} déjà transmise antérieurement (anti-doublon).` };
      }

      const rawPhone = order.clientWhatsapp || order.clientPhone || '0707070707';
      const normalizedPhone = this.normalizePhone(rawPhone);
      const clientFirstName = (order.clientName || order.clientFullName || 'Client VIP').split(' ')[0];
      const orderCode = order.orderNumber || order.code || realOrderId;
      const deliveryDate = order.deliveryDate || order.dueDate || 'À confirmer';
      const atelierName = order.atelierName || 'Maison DigiCouture VIP';

      // Construction du message exact selon les exigences strictes de la section 8 du Prompt
      let message = '';

      if (eventType === 'ORDER_CREATED') {
        message = `👗 Bonjour ${clientFirstName},\n` +
          `votre commande *${orderCode}* a bien été enregistrée chez *${atelierName}*.\n\n` +
          `📌 Statut : Commande reçue\n` +
          `📅 Livraison prévue : ${deliveryDate}\n\n` +
          `Vous pouvez suivre l'avancement de votre commande à tout moment avec le lien présent sur votre ticket.`;
      } else if (eventType === 'COUTURE_ASSEMBLAGE') {
        message = `🧵 Bonjour ${clientFirstName},\n` +
          `votre commande *${orderCode}* est maintenant à l'étape :\n\n` +
          `*Couture & Assemblage*\n\n` +
          `Votre tenue est actuellement en cours de confection.`;
      } else if (eventType === 'ESSAYAGE') {
        message = `👗 Bonjour ${clientFirstName},\n` +
          `votre commande *${orderCode}* est maintenant prête pour l'étape :\n\n` +
          `*Essayage*\n\n` +
          `L'atelier vous contactera si un rendez-vous est nécessaire.`;
      } else if (eventType === 'PRETE') {
        message = `🎉 Bonne nouvelle ${clientFirstName} !\n\n` +
          `Votre commande *${orderCode}* est terminée et prête à être récupérée.\n\n` +
          `📍 *${atelierName}*`;
      } else if (eventType === 'LIVREE') {
        message = `✅ Bonjour ${clientFirstName},\n\n` +
          `votre commande *${orderCode}* a été remise avec succès.\n\n` +
          `Merci pour votre confiance et votre fidélité à *${atelierName}*.\n\n` +
          `❤️ DigiCouture VIP`;
      }

      // Enregistrement dans le Journal des Notifications de Commande (Section 11)
      const logId = `onlog-${Date.now()}`;
      const nowIso = new Date().toISOString();

      await pool!.query(
        `INSERT INTO order_notification_logs (id, orderId, atelierId, event, channel, recipient, message, sentAt, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [logId, realOrderId, atelierId, eventType, 'whatsapp', normalizedPhone, message, nowIso, 'SENT']
      );

      // Dispatch vers le service global de notifications
      NotificationService.dispatch({
        atelierId,
        orderId: realOrderId,
        recipient: normalizedPhone,
        event: (eventType === 'COUTURE_ASSEMBLAGE' ? 'ORDER_STATUS_CHANGED' : eventType === 'PRETE' ? 'ORDER_READY' : eventType === 'LIVREE' ? 'ORDER_DELIVERED' : 'ORDER_CREATED') as any,
        variables: {
          clientName: clientFirstName,
          orderNumber: orderCode,
          atelierName,
          deliveryDate,
          status: stageName
        }
      });

      return {
        success: true,
        message: `Notification WhatsApp [${eventType}] envoyée avec succès à ${normalizedPhone}.`,
        log: { id: logId, event: eventType, recipient: normalizedPhone, sentAt: nowIso, status: 'SENT' }
      };
    } catch (err: any) {
      console.error(`⚠️ [TrackingService Error] Échec de l'envoi de notification :`, err.message);
      return { success: false, message: err.message };
    }
  }

  /**
   * Notification WhatsApp de confirmation d'acompte (Section 9 du Prompt)
   */
  public static async dispatchPaymentNotification(
    orderId: string,
    amount: number,
    remainingAmount: number
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const [orderRows]: any = await pool!.query(
        `SELECT o.*, c.name as clientFullName, c.phone as clientPhone, a.name as atelierName
         FROM orders o
         LEFT JOIN clients c ON o.clientId = c.id
         LEFT JOIN ateliers a ON o.atelierId = a.id
         WHERE o.id = ? OR o.orderNumber = ? OR o.code = ? LIMIT 1`,
        [orderId, orderId, orderId]
      );

      if (!orderRows || orderRows.length === 0) return { success: false, message: 'Commande introuvable' };

      const order = orderRows[0];
      const rawPhone = order.clientWhatsapp || order.clientPhone || '0707070707';
      const normalizedPhone = this.normalizePhone(rawPhone);
      const clientFirstName = (order.clientName || order.clientFullName || 'Client VIP').split(' ')[0];
      const orderCode = order.orderNumber || order.code || orderId;

      const message = `💳 Bonjour ${clientFirstName},\n\n` +
        `votre acompte de *${amount.toLocaleString('fr-FR')} FCFA* pour la commande *${orderCode}* a bien été enregistré.\n\n` +
        `Reste à payer : *${remainingAmount.toLocaleString('fr-FR')} FCFA*.`;

      const logId = `onlog-pay-${Date.now()}`;
      const nowIso = new Date().toISOString();

      await pool!.query(
        `INSERT INTO order_notification_logs (id, orderId, atelierId, event, channel, recipient, message, sentAt, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [logId, order.id, order.atelierId, 'PAYMENT_RECEIVED', 'whatsapp', normalizedPhone, message, nowIso, 'SENT']
      );

      NotificationService.dispatch({
        atelierId: order.atelierId,
        orderId: order.id,
        recipient: normalizedPhone,
        event: 'PAYMENT_RECEIVED',
        variables: {
          clientName: clientFirstName,
          orderNumber: orderCode,
          amount: amount.toLocaleString('fr-FR'),
          remainingAmount: remainingAmount.toLocaleString('fr-FR'),
          reference: `PAY-${Date.now().toString().slice(-6)}`
        }
      });

      return { success: true, message: `Notification d'acompte envoyée à ${normalizedPhone}.` };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  }

  /**
   * Récupérer l'historique complet des notifications WhatsApp pour une commande (Section 11)
   */
  public static async getOrderNotificationLogs(orderId: string): Promise<any[]> {
    const [rows]: any = await pool!.query(
      `SELECT * FROM order_notification_logs WHERE orderId = ? OR orderId IN (SELECT id FROM orders WHERE orderNumber = ? OR code = ?) ORDER BY sentAt DESC`,
      [orderId, orderId, orderId]
    );
    return rows || [];
  }
}
