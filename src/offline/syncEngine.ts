// ─────────────────────────────────────────────────────────────────────────────
// DIGICOUTURE VIP — Moteur de Synchronisation Automatique (Sync Engine)
// ─────────────────────────────────────────────────────────────────────────────

import {
  getPendingSyncQueue,
  deleteLocalItem,
  saveLocalItem,
} from './indexedDb';

export type NetworkSyncStatus = 'ONLINE' | 'OFFLINE' | 'SYNCING' | 'SYNC_ERROR';

type SyncListener = (status: NetworkSyncStatus, pendingCount: number) => void;

class WebSyncEngine {
  private currentStatus: NetworkSyncStatus = navigator.onLine ? 'ONLINE' : 'OFFLINE';
  private listeners: Set<SyncListener> = new Set();
  private isSyncing = false;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.setStatus('ONLINE');
        this.triggerSync();
      });
      window.addEventListener('offline', () => {
        this.setStatus('OFFLINE');
      });
    }
  }

  public subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    this.notify();
    return () => this.listeners.delete(listener);
  }

  public getStatus(): NetworkSyncStatus {
    return this.currentStatus;
  }

  private setStatus(status: NetworkSyncStatus) {
    this.currentStatus = status;
    this.notify();
  }

  private async notify() {
    const pending = await getPendingSyncQueue();
    this.listeners.forEach((fn) => fn(this.currentStatus, pending.length));
  }

  public async triggerSync(): Promise<void> {
    if (!navigator.onLine || this.isSyncing) return;

    this.isSyncing = true;
    this.setStatus('SYNCING');

    try {
      const pendingItems = await getPendingSyncQueue();

      if (pendingItems.length === 0) {
        this.setStatus('ONLINE');
        this.isSyncing = false;
        return;
      }

      const atelierId = pendingItems[0].atelierId || 'atl-1787175204484';
      const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

      // 1. PUSH des données locales vers le serveur
      const pushRes = await fetch(`${API_BASE}/sync/push`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Atelier-Id': atelierId,
        },
        body: JSON.stringify({ items: pendingItems }),
      });

      const pushData = await pushRes.json();

      if (pushData.success && Array.isArray(pushData.syncedIds)) {
        // Supprimer les éléments synchronisés de la file d'attente locale
        for (const queueId of pushData.syncedIds) {
          await deleteLocalItem('sync_queue', queueId);
        }
      }

      // 2. PULL des données modifiées depuis le serveur
      const lastSyncedAt = localStorage.getItem('dc_last_synced_at') || '2000-01-01T00:00:00.000Z';
      const pullRes = await fetch(`${API_BASE}/sync/pull?since=${encodeURIComponent(lastSyncedAt)}`, {
        headers: { 'X-Atelier-Id': atelierId },
      });

      const pullData = await pullRes.json();

      if (pullData.success && pullData.data) {
        // Mettre à jour les entités locales dans IndexedDB
        if (pullData.data.clients) {
          for (const c of pullData.data.clients) await saveLocalItem('clients', c);
        }
        if (pullData.data.orders) {
          for (const o of pullData.data.orders) await saveLocalItem('orders', o);
        }
        if (pullData.data.payments) {
          for (const p of pullData.data.payments) await saveLocalItem('payments', p);
        }
        localStorage.setItem('dc_last_synced_at', new Date().toISOString());
      }

      this.setStatus('ONLINE');
    } catch (err: any) {
      console.warn('Sync Engine notice: Serveur temporairement indisponible ou hors ligne.', err);
      this.setStatus('SYNC_ERROR');
    } finally {
      this.isSyncing = false;
      this.notify();
    }
  }
}

export const syncEngine = new WebSyncEngine();
