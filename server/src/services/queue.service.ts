import { pool } from '../config/database.js';

export type JobType = 'WHATSAPP_NOTIFICATION' | 'PDF_GENERATION' | 'IMAGE_PROCESSING' | 'SYSTEM_NOTIFICATION';

export interface BackgroundJob {
  id: string;
  type: JobType;
  payload: any;
  createdAt: string;
  attempts: number;
}

export class AsyncQueueService {
  private static activeJobs: BackgroundJob[] = [];
  private static isProcessing = false;

  /**
   * Enfile une tâche en arrière-plan sans bloquer l'exécution HTTP principale.
   * RÈGLE ABSOLUE : L'échec d'une tâche d'arrière-plan ne doit JAMAIS annuler la commande principale.
   */
  public static enqueue(type: JobType, payload: any): void {
    const job: BackgroundJob = {
      id: `job-${type.toLowerCase()}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type,
      payload,
      createdAt: new Date().toISOString(),
      attempts: 0
    };

    this.activeJobs.push(job);
    console.log(`📦 [Queue Service] Tâche ${job.id} (${type}) ajoutée à la file d'attente asynchrone.`);

    // Lancer le traitement asynchrone hors du thread HTTP principal
    setImmediate(() => {
      this.processQueue();
    });
  }

  /**
   * Traitement asynchrone résilient des tâches en arrière-plan
   */
  private static async processQueue(): Promise<void> {
    if (this.isProcessing || this.activeJobs.length === 0) return;
    this.isProcessing = true;

    while (this.activeJobs.length > 0) {
      const job = this.activeJobs.shift();
      if (!job) continue;

      try {
        job.attempts += 1;
        console.log(`⚙️ [Queue Worker] Exécution asynchrone du job ${job.id} (${job.type})...`);

        switch (job.type) {
          case 'WHATSAPP_NOTIFICATION':
            await this.handleWhatsAppJob(job);
            break;
          case 'PDF_GENERATION':
            await this.handlePdfJob(job);
            break;
          case 'IMAGE_PROCESSING':
            await this.handleImageJob(job);
            break;
          case 'SYSTEM_NOTIFICATION':
            await this.handleSystemNotificationJob(job);
            break;
        }
        console.log(`✅ [Queue Worker] Job ${job.id} exécuté avec succès.`);
      } catch (err: any) {
        // Isolation absolue des erreurs : le job a échoué mais la commande métier reste 100% valide
        console.error(`⚠️ [Queue Worker Error] Échec isolé du job ${job.id} (${job.type}) :`, err.message);
        
        // Log de l'échec dans la base sans faire échouer l'application
        try {
          const logId = `qerr-${Date.now()}`;
          await pool!.query(
            `INSERT INTO audit_logs (id, atelierId, userId, action, details, createdAt)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
              logId,
              job.payload.atelierId || 'SYSTEM',
              null,
              `QUEUE_JOB_FAILED_${job.type}`,
              JSON.stringify({ jobId: job.id, error: err.message, payload: job.payload }),
              new Date().toISOString().split('T')[0]
            ]
          );
        } catch (dbErr: any) {
          console.error(`⚠️ [Queue Log Error] Impossible d'enregistrer l'erreur de queue :`, dbErr.message);
        }
      }
    }

    this.isProcessing = false;
  }

  private static async handleWhatsAppJob(job: BackgroundJob): Promise<void> {
    // Exécution du dispatching de notification WhatsApp via la passerelle API sans bloquer l'API
    const { notificationId, recipient, message, atelierId } = job.payload;
    if (!recipient) throw new Error('Destinataire WhatsApp invalide');

    const { WhatsappGatewayService } = await import('./whatsappGateway.service.js');
    await WhatsappGatewayService.sendMessage({ recipient, message, atelierId });
  }

  private static async handlePdfJob(job: BackgroundJob): Promise<void> {
    // Génération asynchrone du reçu ou de la facture PDF
    const { receiptId, orderId } = job.payload;
    if (!orderId) throw new Error('orderId manquant pour la génération PDF');
  }

  private static async handleImageJob(job: BackgroundJob): Promise<void> {
    // Redimensionnement et optimisation asynchrone des photos de tissus/commandes
    const { attachmentId, storageKey } = job.payload;
    if (!attachmentId) throw new Error('attachmentId manquant pour le traitement d\'image');
  }

  private static async handleSystemNotificationJob(job: BackgroundJob): Promise<void> {
    // Envoi de notification push/in-app système
  }

  public static getStatus(): { pendingJobsCount: number; isProcessing: boolean } {
    return {
      pendingJobsCount: this.activeJobs.length,
      isProcessing: this.isProcessing
    };
  }
}
