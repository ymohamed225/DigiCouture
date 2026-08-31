// ─────────────────────────────────────────────────────────────────────────────
// DIGICOUTURE VIP — Service Worker pour le Mode Offline & PWA Web
// ─────────────────────────────────────────────────────────────────────────────

const CACHE_NAME = 'digicouture-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
];

// Installation du Service Worker et mise en cache initiale
self.addEventListener('install', (event: any) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activation et nettoyage des anciens caches
self.addEventListener('activate', (event: any) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Stratégie Network First avec Fallback Cache pour la PWA
self.addEventListener('fetch', (event: any) => {
  const req = event.request;
  const url = new URL(req.url);

  // Ne pas mettre en cache les requêtes API (gérées par IndexedDB & SyncEngine)
  if (url.pathname.startsWith('/api')) {
    return;
  }

  event.respondWith(
    fetch(req)
      .then((networkRes) => {
        if (networkRes && networkRes.status === 200 && req.method === 'GET') {
          const resClone = networkRes.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
        }
        return networkRes;
      })
      .catch(() => {
        return caches.match(req).then((cachedRes) => {
          if (cachedRes) return cachedRes;
          if (req.mode === 'navigate') {
            return caches.match('/index.html');
          }
          return new Response('Ressource indisponible hors connexion', { status: 503 });
        });
      })
  );
});
