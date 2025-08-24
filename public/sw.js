const CACHE_NAME = 'ortho-logique-v1.0.0';
const STATIC_CACHE = 'ortho-logique-static-v1.0.0';
const DYNAMIC_CACHE = 'ortho-logique-dynamic-v1.0.0';

// Ressources à mettre en cache immédiatement
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Ressources à mettre en cache dynamiquement
const DYNAMIC_ASSETS = [
  '/src/main.tsx',
  '/src/App.tsx',
  '/src/index.css',
  '/src/data/lessons.json'
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installation en cours...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Mise en cache des ressources statiques');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Installation terminée');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Erreur lors de l\'installation:', error);
      })
  );
});

// Activation du Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activation en cours...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('[SW] Suppression de l\'ancien cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Activation terminée');
        return self.clients.claim();
      })
  );
});

// Interception des requêtes
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorer les requêtes non-HTTP
  if (!request.url.startsWith('http')) {
    return;
  }

  // Stratégie Cache First pour les ressources statiques
  if (STATIC_ASSETS.some(asset => request.url.includes(asset))) {
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(request)
            .then((response) => {
              const responseClone = response.clone();
              caches.open(STATIC_CACHE)
                .then((cache) => {
                  cache.put(request, responseClone);
                });
              return response;
            });
        })
        .catch(() => {
          // Fallback pour la page principale
          if (request.destination === 'document') {
            return caches.match('/index.html');
          }
        })
    );
    return;
  }

  // Stratégie Network First pour les autres ressources
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Mettre en cache les réponses réussies
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE)
            .then((cache) => {
              cache.put(request, responseClone);
            });
        }
        return response;
      })
      .catch(() => {
        // Fallback vers le cache
        return caches.match(request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Fallback ultime pour les pages
            if (request.destination === 'document') {
              return caches.match('/index.html');
            }
            // Réponse par défaut pour les autres ressources
            return new Response('Contenu non disponible hors ligne', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
      })
  );
});

// Gestion des messages depuis l'application
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

// Synchronisation en arrière-plan
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('[SW] Synchronisation en arrière-plan');
    event.waitUntil(
      // Ici on pourrait synchroniser les données utilisateur
      Promise.resolve()
    );
  }
});

// Notifications push (pour usage futur)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: data.primaryKey
      },
      actions: [
        {
          action: 'explore',
          title: 'Ouvrir l\'application',
          icon: '/icons/icon-96x96.png'
        },
        {
          action: 'close',
          title: 'Fermer',
          icon: '/icons/icon-96x96.png'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Gestion des clics sur les notifications
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});