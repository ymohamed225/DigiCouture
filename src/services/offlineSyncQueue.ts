import { apiClient } from './api/client';

export interface PendingOfflineItem {
  id: string;
  entityType: 'order' | 'client' | 'measurement' | 'payment';
  entityId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  payload: any;
  expectedUpdatedAt: string;
  queuedAt: string;
}

const OFFLINE_QUEUE_KEY = 'digicouture_offline_sync_queue';

export class OfflineSyncQueueManager {
  /**
   * Ajoute une modification dans la file d'attente hors-ligne
   */
  static enqueue(item: Omit<PendingOfflineItem, 'id' | 'queuedAt'>): PendingOfflineItem {
    const queue = this.getQueue();
    const newItem: PendingOfflineItem = {
      ...item,
      id: `queue-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      queuedAt: new Date().toISOString().split('T')[0]
    };

    queue.push(newItem);
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
    console.log(`📥 [Offline Sync Queue] Action ${newItem.action} sur ${newItem.entityType} mise en attente.`);
    return newItem;
  }

  /**
   * Récupère la liste des éléments en attente de synchronisation
   */
  static getQueue(): PendingOfflineItem[] {
    try {
      const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  /**
   * Vide la file d'attente
   */
  static clearQueue() {
    localStorage.removeItem(OFFLINE_QUEUE_KEY);
  }

  /**
   * Dépile et synchronise la file d'attente avec le backend dès le rétablissement du réseau
   */
  static async flushQueue(): Promise<{ syncedCount: number; conflictsCount: number; results: any[] }> {
    const queue = this.getQueue();
    if (queue.length === 0) {
      return { syncedCount: 0, conflictsCount: 0, results: [] };
    }

    console.log(`🚀 [Offline Sync] Envoi de ${queue.length} action(s) au serveur...`);

    try {
      const response = await apiClient<{ success: boolean; syncedCount: number; conflictsCount: number; results: any[] }>('sync/queue', {
        method: 'POST',
        body: JSON.stringify({ items: queue })
      });

      if (response.success) {
        // Suppression des éléments synchronisés
        this.clearQueue();
        console.log(`✅ [Offline Sync Completed] ${response.syncedCount} synchronisé(s), ${response.conflictsCount} conflit(s) géré(s).`);
      }

      return response;
    } catch (err: any) {
      console.error('⚠️ [Offline Sync Failed] Rétablissement du réseau incomplet ou erreur :', err.message);
      throw err;
    }
  }
}

// Écouteur réseau pour déclencher automatiquement la synchronisation au retour en ligne
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('🌐 Réseau de nouveau disponible ! Déclenchement de la synchronisation...');
    OfflineSyncQueueManager.flushQueue().catch(() => {});
  });
}
