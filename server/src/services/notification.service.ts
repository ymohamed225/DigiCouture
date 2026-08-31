import { pool } from '../config/database.js';
import { AsyncQueueService } from './queue.service.js';

export type NotificationEventType = 
  | 'ORDER_CREATED'
  | 'ORDER_STATUS_CHANGED'
  | 'PAYMENT_RECEIVED'
  | 'FITTING_REMINDER'
  | 'ORDER_READY'
  | 'ORDER_DELIVERED'
  | 'PAYMENT_REMINDER';

export interface DispatchNotificationPayload {
  atelierId: string;
  orderId?: string;
  recipient: string; // Numéro WhatsApp ex: "+2250707070707"
  event: NotificationEventType;
  variables: Record<string, string | number>;
}

export class NotificationService {
  // Modèles de messages par défaut si non personnalisé par l'atelier
  private static DEFAULT_TEMPLATES: Record<NotificationEventType, string> = {
    ORDER_CREATED: "Bonjour {{clientName}}, votre commande {{orderNumber}} de {{amount}} FCFA a bien été enregistrée par {{atelierName}}. Livraison prévue le {{deliveryDate}}.",
    ORDER_STATUS_CHANGED: "Bonjour {{clientName}}, votre commande {{orderNumber}} est passée à l'étape : {{status}}.",
    PAYMENT_RECEIVED: "Bonjour {{clientName}}, nous confirmons la réception de votre règlement de {{amount}} FCFA (Réf: {{reference}}). Reste à payer : {{remainingAmount}} FCFA.",
    FITTING_REMINDER: "Rappel Essayage : Bonjour {{clientName}}, votre séance d'essayage pour la commande {{orderNumber}} est prévue le {{scheduledAt}} à l'atelier.",
    ORDER_READY: "🎉 Bonne nouvelle ! Votre tenue {{orderNumber}} est complètement terminée et prête pour l'essayage ou le retrait.",
    ORDER_DELIVERED: "Merci {{clientName}} ! Votre commande {{orderNumber}} vous a été livrée. Merci de votre confiance envers {{atelierName}} !",
    PAYMENT_REMINDER: "Rappel de Règlement : Bonjour {{clientName}}, le solde restant de {{remainingAmount}} FCFA pour la commande {{orderNumber}} est à régler."
  };

  /**
   * Méthode centrale de diffusion asynchrone des événements métier (Business Event)
   */
  public static async dispatch(payload: DispatchNotificationPayload): Promise<void> {
    try {
      const { atelierId, orderId, recipient, event, variables } = payload;

      // 1. Récupération du modèle de template personnalisé ou par défaut
      let templateText = this.DEFAULT_TEMPLATES[event];
      const [tmplRows]: any = await pool!.query(
        'SELECT templateText FROM notification_templates WHERE (atelierId = ? OR atelierId IS NULL) AND event = ? ORDER BY atelierId DESC LIMIT 1',
        [atelierId, event]
      );
      if (tmplRows && tmplRows.length > 0) {
        templateText = tmplRows[0].templateText;
      }

      // 2. Formatage des variables dynamique dans le message (ex: {{clientName}} -> "Mme Koné")
      let formattedMessage = templateText;
      Object.entries(variables).forEach(([key, val]) => {
        formattedMessage = formattedMessage.replace(new RegExp(`{{\\s*${key}\\s*}}`, 'g'), String(val));
      });

      const notificationId = `notif-${Date.now()}`;
      const sentAt = new Date().toISOString().split('T')[0];

      // 3. Enregistrement de l'entité Notification
      await pool!.query(
        `INSERT INTO notifications (id, atelierId, orderId, event, channel, recipient, message, sentAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [notificationId, atelierId, orderId || null, event, 'whatsapp', recipient, formattedMessage, sentAt]
      );

      // 4. Envoi asynchrone hors-thread via AsyncQueueService (Garantie qu'un échec de notification n'annule JAMAIS la commande)
      AsyncQueueService.enqueue('WHATSAPP_NOTIFICATION', {
        notificationId,
        atelierId,
        orderId,
        event,
        recipient,
        message: formattedMessage
      });

      // 5. Journalisation initiale dans NotificationLog
      const logId = `nlog-${Date.now()}`;
      const loggedAt = new Date().toISOString();
      await pool!.query(
        `INSERT INTO notification_logs (id, notificationId, provider, status, responsePayload, loggedAt)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          logId,
          notificationId,
          'WhatsApp Cloud API / GreenAPI',
          'QUEUED',
          JSON.stringify({ status: 'QUEUED_IN_ASYNC_WORKER', event }),
          loggedAt
        ]
      );

      console.log(`💬 [Notification Service] Événement ${event} enfilé en arrière-plan pour ${recipient}`);
    } catch (err: any) {
      // Isolation absolue des erreurs de notification : Ne fait JAMAIS échouer la requête HTTP ou la commande principale
      console.error(`⚠️ [Notification Service Non-Blocking Error] Échec de la notification :`, err.message);
    }
  }

  /**
   * Adaptateur WhatsApp Service Decouplé
   */
  private static async sendWhatsAppMessage(phone: string, text: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    // Nettoyage du numéro
    const cleanPhone = phone.replace(/[^0-9]/g, '');

    // Simuler/Fournir l'appel à l'API WhatsApp officielle ou agrégateur
    return {
      success: true,
      messageId: `wa-msg-${Date.now()}`,
      error: undefined
    };
  }
}
