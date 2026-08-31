// ─────────────────────────────────────────────────────────────────────────────
// DIGICOUTURE VIP — Stockage Offline IndexedDB pour la PWA Web
// ─────────────────────────────────────────────────────────────────────────────

const DB_NAME = 'digicouture_offline_db';
const DB_VERSION = 1;

export interface SyncQueueItem {
  id: string;
  atelierId: string;
  entityType: 'client' | 'order' | 'payment' | 'step' | 'catalogue';
  entityId: string;
  operation: 'CREATE' | 'UPDATE' | 'DELETE';
  payload: any;
  createdAt: string;
  status: 'PENDING' | 'SYNCING' | 'SUCCESS' | 'ERROR';
  retryCount: number;
  lastError?: string;
}

let dbInstance: IDBDatabase | null = null;

export function openOfflineDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (dbInstance) return resolve(dbInstance);

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result as IDBDatabase;

      if (!db.objectStoreNames.contains('clients')) {
        db.createObjectStore('clients', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('orders')) {
        db.createObjectStore('orders', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('payments')) {
        db.createObjectStore('payments', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('catalogue')) {
        db.createObjectStore('catalogue', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('sync_queue')) {
        const syncStore = db.createObjectStore('sync_queue', { keyPath: 'id' });
        syncStore.createIndex('status', 'status', { unique: false });
        syncStore.createIndex('atelierId', 'atelierId', { unique: false });
      }
    };

    request.onsuccess = (event: any) => {
      dbInstance = event.target.result;
      resolve(dbInstance!);
    };

    request.onerror = (event: any) => {
      console.error('Erreur ouverture IndexedDB:', event.target.error);
      reject(event.target.error);
    };
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers de Gestion d'Entités Locales dans IndexedDB
// ─────────────────────────────────────────────────────────────────────────────
export async function saveLocalItem(storeName: string, item: any): Promise<void> {
  const db = await openOfflineDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const req = store.put(item);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function getLocalItems<T = any>(storeName: string): Promise<T[]> {
  const db = await openOfflineDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

export async function getLocalItemById<T = any>(storeName: string, id: string): Promise<T | null> {
  const db = await openOfflineDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const req = store.get(id);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

export async function deleteLocalItem(storeName: string, id: string): Promise<void> {
  const db = await openOfflineDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// File de Synchronisation (Sync Queue) Helpers
// ─────────────────────────────────────────────────────────────────────────────
export async function addToSyncQueue(
  atelierId: string,
  entityType: SyncQueueItem['entityType'],
  entityId: string,
  operation: SyncQueueItem['operation'],
  payload: any
): Promise<SyncQueueItem> {
  const queueItem: SyncQueueItem = {
    id: `queue-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    atelierId,
    entityType,
    entityId,
    operation,
    payload,
    createdAt: new Date().toISOString(),
    status: 'PENDING',
    retryCount: 0,
  };

  await saveLocalItem('sync_queue', queueItem);
  return queueItem;
}

export async function getPendingSyncQueue(): Promise<SyncQueueItem[]> {
  const allQueue = await getLocalItems<SyncQueueItem>('sync_queue');
  return allQueue.filter((item) => item.status === 'PENDING' || item.status === 'ERROR');
}

export async function updateQueueStatus(
  queueId: string,
  status: SyncQueueItem['status'],
  lastError?: string
): Promise<void> {
  const item = await getLocalItemById<SyncQueueItem>('sync_queue', queueId);
  if (item) {
    item.status = status;
    if (status === 'ERROR') item.retryCount += 1;
    if (lastError) item.lastError = lastError;
    await saveLocalItem('sync_queue', item);
  }
}
