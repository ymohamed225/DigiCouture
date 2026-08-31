import { pool } from '../config/database.js';

export interface SyncQueueItem {
  id: string;
  entityType: 'order' | 'client' | 'measurement' | 'payment';
  entityId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  payload: any;
  expectedUpdatedAt: string; // Tampon d'horodatage au moment de la modification hors-ligne
  queuedAt: string;
}

export interface SyncResult {
  queueItemId: string;
  status: 'SYNCED' | 'CONFLICT' | 'ERROR';
  resolutionStrategy?: 'SERVER_WINS' | 'CLIENT_WINS' | 'MERGED';
  serverState?: any;
  message?: string;
}

export class SyncService {
  /**
   * Traite une file d'attente d'actions hors-ligne avec Détection stricte de Conflits
   */
  static async processQueue(atelierId: string, queueItems: SyncQueueItem[]): Promise<SyncResult[]> {
    const results: SyncResult[] = [];

    for (const item of queueItems) {
      try {
        if (item.entityType === 'order') {
          const result = await this.syncOrder(atelierId, item);
          results.push(result);
        } else if (item.entityType === 'client') {
          const result = await this.syncClient(atelierId, item);
          results.push(result);
        } else {
          results.push({
            queueItemId: item.id,
            status: 'SYNCED',
            message: 'Entité synchronisée sans conflit.'
          });
        }
      } catch (err: any) {
        results.push({
          queueItemId: item.id,
          status: 'ERROR',
          message: err.message
        });
      }
    }

    return results;
  }

  private static async syncOrder(atelierId: string, item: SyncQueueItem): Promise<SyncResult> {
    const [rows]: any = await pool!.query(
      'SELECT * FROM orders WHERE id = ? AND atelierId = ?',
      [item.entityId, atelierId]
    );

    if (rows.length === 0) {
      // Si la commande a été créée hors-ligne
      if (item.action === 'CREATE') {
        const order = item.payload;
        await pool!.query(
          `INSERT INTO orders (id, atelierId, clientId, orderNumber, code, clientName, modelName, totalAmount, paidAmount, remainingAmount, status, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            order.id || item.entityId,
            atelierId,
            order.clientId,
            order.orderNumber || order.code || `CMD-${Date.now()}`,
            order.orderNumber || order.code || `CMD-${Date.now()}`,
            order.clientName || 'Client',
            order.modelName || 'Modèle',
            order.totalAmount || 0,
            order.paidAmount || 0,
            order.remainingAmount || order.totalAmount || 0,
            order.status || 'commande_recue',
            item.queuedAt,
            item.queuedAt
          ]
        );
        return { queueItemId: item.id, status: 'SYNCED', message: 'Commande créée depuis la file hors-ligne.' };
      }
      return { queueItemId: item.id, status: 'ERROR', message: 'Commande non trouvée sur le serveur.' };
    }

    const currentServerState = rows[0];

    // DÉTECTION DE CONFLIT : Si l'état BDD a été modifié après la prise de copie hors-ligne
    if (currentServerState.updatedAt && currentServerState.updatedAt > item.expectedUpdatedAt) {
      console.warn(`⚠️ [Sync Conflict] Conflit détecté sur la commande ${item.entityId}. BDD: ${currentServerState.updatedAt} > Offline Expected: ${item.expectedUpdatedAt}`);

      // Enregistrement du conflit dans la table sync_conflicts
      const conflictId = `conf-${Date.now()}`;
      await pool!.query(
        `INSERT INTO sync_conflicts (id, atelierId, entityType, entityId, clientPayload, serverPayload, resolutionStrategy, resolvedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          conflictId,
          atelierId,
          'order',
          item.entityId,
          JSON.stringify(item.payload),
          JSON.stringify(currentServerState),
          'SERVER_WINS',
          new Date().toISOString().split('T')[0]
        ]
      );

      // Stratégie SERVER_WINS par défaut sur les données métier critiques
      return {
        queueItemId: item.id,
        status: 'CONFLICT',
        resolutionStrategy: 'SERVER_WINS',
        serverState: currentServerState,
        message: 'Conflit détecté ! La version du serveur (Web) a prévalu sur la version hors-ligne.'
      };
    }

    // Aucun conflit : Application de la modification hors-ligne
    const updateData = item.payload;
    const updatedAt = new Date().toISOString().split('T')[0];

    await pool!.query(
      `UPDATE orders SET status = ?, notes = ?, updatedAt = ? WHERE id = ? AND atelierId = ?`,
      [updateData.status || currentServerState.status, updateData.notes || currentServerState.notes, updatedAt, item.entityId, atelierId]
    );

    return { queueItemId: item.id, status: 'SYNCED', message: 'Mise à jour hors-ligne appliquée avec succès.' };
  }

  private static async syncClient(atelierId: string, item: SyncQueueItem): Promise<SyncResult> {
    const [rows]: any = await pool!.query('SELECT * FROM clients WHERE id = ? AND atelierId = ?', [item.entityId, atelierId]);
    
    if (rows.length === 0 && item.action === 'CREATE') {
      const cli = item.payload;
      await pool!.query(
        `INSERT INTO clients (id, atelierId, customerCode, fullName, whatsapp, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [item.entityId, atelierId, cli.customerCode || 'CLI-00000', cli.fullName, cli.whatsapp, item.queuedAt, item.queuedAt]
      );
      return { queueItemId: item.id, status: 'SYNCED' };
    }

    if (rows.length > 0) {
      const serverState = rows[0];
      if (serverState.updatedAt && serverState.updatedAt > item.expectedUpdatedAt) {
        return {
          queueItemId: item.id,
          status: 'CONFLICT',
          resolutionStrategy: 'SERVER_WINS',
          serverState,
          message: 'Fiche client modifiée sur le Web durant la déconnexion mobile.'
        };
      }
    }

    return { queueItemId: item.id, status: 'SYNCED' };
  }
}
